import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

// ── Types ─────────────────────────────────────────────────────────────────────

export type EventCategory = 'pilates' | 'fisioterapia' | 'taller' | 'evento_especial' | 'otro';
export type EventPricingType = 'free' | 'paid';
export type EventStatus = 'active' | 'completed' | 'cancelled' | 'inactive';
export type RegistrationStatus = 'confirmed' | 'rejected' | 'cancelled';

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

export interface EventRegistration {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string;
  notes: string | null;
  source: string;
  is_free_event: boolean;
  validation_status: string;
  status: RegistrationStatus;
  rejection_reason: string | null;
  // Digital pass
  access_code: string | null;
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

// Columnas necesarias para la home (excluye slug, long_description, image_url,
// end_at, duration_minutes, currency, created_at, updated_at).
const HOME_EVENT_FIELDS = [
  'id', 'title', 'short_description', 'category',
  'pricing_type', 'price', 'start_at',
  'total_slots', 'reserved_slots',
  'location', 'cta_label', 'highlight_on_home',
  'is_active', 'is_visible', 'is_new_clients_only',
  'free_limit_per_person', 'free_cooldown_days', 'status',
].join(', ');

const HOME_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class EventsService {
  private _homeCache: CbmEvent[] | null = null;
  private _homeCacheTs = 0;

  // ── Public (home) ─────────────────────────────────────────────────────────

  async getUpcomingEvents(limit = 6): Promise<CbmEvent[]> {
    if (this._homeCache && Date.now() - this._homeCacheTs < HOME_CACHE_TTL_MS) {
      return this._homeCache;
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('events')
      .select(HOME_EVENT_FIELDS)
      .eq('is_active', true)
      .eq('is_visible', true)
      .in('status', ['active', 'completed'])
      .gte('start_at', now)
      .order('highlight_on_home', { ascending: false })
      .order('start_at', { ascending: true })
      .limit(limit);

    if (error) throw error;

    this._homeCache = (data ?? []) as unknown as CbmEvent[];
    this._homeCacheTs = Date.now();
    return this._homeCache;
  }

  private invalidateHomeCache(): void {
    this._homeCache = null;
    this._homeCacheTs = 0;
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
    this.invalidateHomeCache();
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
    this.invalidateHomeCache();
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
    this.invalidateHomeCache();
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

  async registerForEvent(
    payload: CreateRegistrationPayload,
    event: CbmEvent
  ): Promise<{ registration: EventRegistration; rejected: boolean }> {
    // ── Validación de evento gratuito (client-side, no ocupa plaza) ──────────
    if (event.pricing_type === 'free') {
      const { data: vData } = await supabase.rpc('validate_free_event_registration', {
        p_email:    payload.email.toLowerCase().trim(),
        p_phone:    payload.phone.trim(),
        p_event_id: payload.event_id
      });
      const v = vData as { valid: boolean; reason: string | null } | null;
      if (v && !v.valid) {
        // Registrar el rechazo sin ocupar plaza (insert directo, status: rejected)
        const { data, error } = await supabase
          .from('event_registrations')
          .insert({
            event_id:      payload.event_id,
            full_name:     payload.full_name.trim(),
            email:         payload.email.toLowerCase().trim(),
            phone:         payload.phone.trim(),
            notes:         payload.notes?.trim() || null,
            source:        payload.source ?? 'home',
            is_free_event: true,
            status:        'rejected'
          })
          .select('*')
          .single();
        if (error) throw error;
        return { registration: data as EventRegistration, rejected: true };
      }
    }

    // ── Inscripción confirmada: RPC atómico (cuenta plazas + inserta) ────────
    // SELECT FOR UPDATE en Supabase impide race conditions: dos peticiones
    // simultáneas no pueden pasar el conteo al mismo tiempo.
    const accessCode = 'CBM-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data, error } = await supabase.rpc('register_for_event', {
      p_event_id:    payload.event_id,
      p_full_name:   payload.full_name,
      p_email:       payload.email,
      p_phone:       payload.phone,
      p_notes:       payload.notes ?? null,
      p_source:      payload.source ?? 'home',
      p_access_code: accessCode
    });

    if (error) throw error;

    const result = data as { ok: boolean; error?: string; registration?: EventRegistration };
    if (!result.ok) throw new Error(result.error ?? 'registration_failed');

    return { registration: result.registration!, rejected: false };
  }

  async updateRegistrationStatus(id: string, status: RegistrationStatus): Promise<void> {
    const { error } = await supabase
      .from('event_registrations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  async checkInRegistration(id: string): Promise<void> {
    const { error } = await supabase
      .from('event_registrations')
      .update({ checked_in_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  async findRegistrationByCode(code: string): Promise<(EventRegistration & {
    events: { title: string; start_at: string; location: string | null } | null
  }) | null> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*, events(title, start_at, location)')
      .eq('access_code', code.trim().toUpperCase())
      .single();

    if (error) return null;
    return data as EventRegistration & {
      events: { title: string; start_at: string; location: string | null } | null
    };
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
