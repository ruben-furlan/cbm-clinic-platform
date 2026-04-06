import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

// ── Types ─────────────────────────────────────────────────────────────────────

export type EventCategory = 'pilates' | 'fisioterapia' | 'taller' | 'evento_especial' | 'otro';
export type EventPricingType = 'free' | 'paid';
export type EventStatus = 'active' | 'completed' | 'cancelled' | 'inactive';
export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'blocked';
export type ValidationStatus = 'ok' | 'blocked_cooldown' | 'blocked_new_clients';

export interface CbmEvent {
  id: string;
  title: string;
  slug: string | null;
  short_description: string;
  long_description: string | null;
  category: EventCategory;
  pricing_type: EventPricingType;
  price: number | null;
  currency: string;
  start_at: string;
  end_at: string | null;
  duration_minutes: number | null;
  total_slots: number;
  reserved_slots: number;
  image_url: string | null;
  location: string | null;
  cta_label: string | null;
  highlight_on_home: boolean;
  is_active: boolean;
  is_visible: boolean;
  is_new_clients_only: boolean;
  free_limit_per_person: number;
  free_cooldown_days: number;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export type CheckinStatus = 'pending' | 'checked_in';

export interface EventRegistration {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string;
  notes: string | null;
  source: string;
  is_free_event: boolean;
  validation_status: ValidationStatus;
  status: RegistrationStatus;
  blocked_reason: string | null;
  // Digital pass
  access_code: string | null;
  checkin_status: CheckinStatus;
  checked_in_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRegistrationPayload {
  event_id: string;
  full_name: string;
  email: string;
  phone: string;
  notes?: string;
  source?: string;
}

export interface FreeValidationResult {
  valid: boolean;
  reason: ValidationStatus | null;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class EventsService {
  // ── Public (home) ─────────────────────────────────────────────────────────

  async getUpcomingEvents(limit = 6): Promise<CbmEvent[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .eq('is_visible', true)
      .in('status', ['active', 'completed'])
      .gte('start_at', now)
      .order('highlight_on_home', { ascending: false }) // destacados primero
      .order('start_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as CbmEvent[];
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  async getEventsAdmin(): Promise<CbmEvent[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as CbmEvent[];
  }

  async createEvent(
    payload: Omit<CbmEvent, 'id' | 'reserved_slots' | 'created_at' | 'updated_at'>
  ): Promise<CbmEvent> {
    const { data, error } = await supabase
      .from('events')
      .insert({ ...payload, reserved_slots: 0 })
      .select('*')
      .single();

    if (error) throw error;
    return data as CbmEvent;
  }

  async updateEvent(
    id: string,
    changes: Partial<Omit<CbmEvent, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<CbmEvent> {
    const { data, error } = await supabase
      .from('events')
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as CbmEvent;
  }

  async duplicateEvent(event: CbmEvent): Promise<CbmEvent> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, updated_at, reserved_slots, ...rest } = event;
    return this.createEvent({
      ...rest,
      title: `${rest.title} (copia)`,
      slug: null,
      status: 'inactive',
      is_active: false
    });
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
  }

  async toggleActive(id: string, value: boolean): Promise<CbmEvent> {
    return this.updateEvent(id, { is_active: value });
  }

  // ── Registrations ─────────────────────────────────────────────────────────

  async getRegistrationsByEvent(eventId: string): Promise<EventRegistration[]> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as EventRegistration[];
  }

  async validateFreeEvent(
    email: string,
    phone: string,
    eventId: string
  ): Promise<FreeValidationResult> {
    const { data, error } = await supabase.rpc('validate_free_event_registration', {
      p_email: email.toLowerCase().trim(),
      p_phone: phone.trim(),
      p_event_id: eventId
    });

    if (error) throw error;
    return data as FreeValidationResult;
  }

  async registerForEvent(
    payload: CreateRegistrationPayload,
    event: CbmEvent
  ): Promise<{ registration: EventRegistration; blocked: boolean }> {
    if (this.isFull(event)) throw new Error('no_slots');

    let validationStatus: ValidationStatus = 'ok';
    let status: RegistrationStatus = 'pending';
    let blockedReason: string | null = null;

    if (event.pricing_type === 'free') {
      const result = await this.validateFreeEvent(payload.email, payload.phone, event.id);
      if (!result.valid) {
        validationStatus = result.reason ?? 'blocked_cooldown';
        status = 'blocked';
        blockedReason = result.reason;
      }
    }

    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: payload.event_id,
        full_name: payload.full_name.trim(),
        email: payload.email.toLowerCase().trim(),
        phone: payload.phone.trim(),
        notes: payload.notes?.trim() ?? null,
        source: payload.source ?? 'home',
        is_free_event: event.pricing_type === 'free',
        validation_status: validationStatus,
        status,
        blocked_reason: blockedReason
      })
      .select('*')
      .single();

    if (error) throw error;
    return { registration: data as EventRegistration, blocked: status === 'blocked' };
  }

  async updateRegistrationStatus(id: string, status: RegistrationStatus): Promise<void> {
    const { error } = await supabase
      .from('event_registrations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  async checkInRegistration(id: string): Promise<void> {
    const { error } = await supabase.rpc('checkin_registration', {
      p_registration_id: id
    });

    if (error) throw error;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getAvailableSlots(event: CbmEvent): number {
    return Math.max(event.total_slots - event.reserved_slots, 0);
  }

  isFull(event: CbmEvent): boolean {
    return event.reserved_slots >= event.total_slots;
  }

  isAlmostFull(event: CbmEvent): boolean {
    const available = this.getAvailableSlots(event);
    return available > 0 && available <= 3;
  }

  formatEventDate(startAt: string): string {
    const d = new Date(startAt);
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  formatEventTime(startAt: string): string {
    const d = new Date(startAt);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
}
