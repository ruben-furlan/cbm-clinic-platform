import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

export interface Fisio {
  id: string;
  nombre: string;
  activo: boolean;
  orden: number;
}

export interface SlotConEstado {
  fecha: string;
  hora: string;
  estado: 'disponible' | 'ultimo' | 'completo';
  disponibles: number;
}

export interface SlotAdmin {
  id: string;
  fisioId: string;
  fecha: string;
  hora: string;
  bloqueadoManual: boolean;
  reservas: number;
}

@Injectable({ providedIn: 'root' })
export class DisponibilidadService {

  async getFisios(): Promise<Fisio[]> {
    const { data, error } = await supabase
      .from('fisios')
      .select('id, nombre, activo, orden')
      .order('orden');
    if (error) throw error;
    return (data ?? []).map(r => ({
      id: r.id as string,
      nombre: r.nombre as string,
      activo: r.activo as boolean,
      orden: r.orden as number
    }));
  }

  async toggleFisioActivo(id: string, activo: boolean): Promise<void> {
    const { error } = await supabase
      .from('fisios')
      .update({ activo })
      .eq('id', id);
    if (error) throw error;
  }

  async getSlotsConDisponibilidad(fechaInicio: Date, fechaFin: Date): Promise<SlotConEstado[]> {
    const inicio = this.formatDate(fechaInicio);
    const fin = this.formatDate(fechaFin);

    const { data, error } = await supabase
      .from('disponibilidad_slots')
      .select('id, fecha, hora, bloqueado_manual, slot_reservas(id)')
      .gte('fecha', inicio)
      .lte('fecha', fin)
      .order('fecha')
      .order('hora');

    if (error) throw error;

    const grupos = new Map<string, { total: number; reservas: number }>();

    for (const slot of data ?? []) {
      const hora = this.normalizeHora(slot.hora as string);
      const key = `${slot.fecha as string}|${hora}`;
      const entry = grupos.get(key) ?? { total: 0, reservas: 0 };
      if (!slot.bloqueado_manual) {
        entry.total++;
        const slotReservas = slot.slot_reservas as { id: string }[] | null;
        entry.reservas += slotReservas?.length ?? 0;
      }
      grupos.set(key, entry);
    }

    const result: SlotConEstado[] = [];
    for (const [key, { total, reservas }] of grupos) {
      const [fecha, hora] = key.split('|');
      const disponibles = Math.max(0, total - reservas);
      let estado: SlotConEstado['estado'];
      if (disponibles >= 2) estado = 'disponible';
      else if (disponibles === 1) estado = 'ultimo';
      else estado = 'completo';
      result.push({ fecha, hora, estado, disponibles });
    }

    return result.sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
      return a.hora.localeCompare(b.hora);
    });
  }

  async crearReserva(fecha: string, hora: string): Promise<{ ok: true; slotId: string }> {
    const horaDb = hora.length === 5 ? hora + ':00' : hora;

    const { data, error } = await supabase
      .from('disponibilidad_slots')
      .select('id, bloqueado_manual, slot_reservas(id)')
      .eq('fecha', fecha)
      .eq('hora', horaDb);

    if (error) throw error;

    const available = (data ?? []).find(s => {
      const reservas = s.slot_reservas as { id: string }[] | null;
      return !s.bloqueado_manual && (reservas?.length ?? 0) === 0;
    });

    if (!available) {
      throw new Error('No hay plazas disponibles para este horario');
    }

    const { error: insertError } = await supabase
      .from('slot_reservas')
      .insert({ slot_id: available.id });

    if (insertError) throw insertError;

    return { ok: true, slotId: available.id as string };
  }

  async getSlotsAdmin(semana: Date): Promise<SlotAdmin[]> {
    const lunes = this.getLunes(semana);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    const { data, error } = await supabase
      .from('disponibilidad_slots')
      .select('id, fisio_id, fecha, hora, bloqueado_manual, slot_reservas(id)')
      .gte('fecha', this.formatDate(lunes))
      .lte('fecha', this.formatDate(domingo))
      .order('fecha')
      .order('hora');

    if (error) throw error;

    return (data ?? []).map(s => ({
      id: s.id as string,
      fisioId: s.fisio_id as string,
      fecha: s.fecha as string,
      hora: this.normalizeHora(s.hora as string),
      bloqueadoManual: s.bloqueado_manual as boolean,
      reservas: (s.slot_reservas as { id: string }[] | null)?.length ?? 0
    }));
  }

  async crearSlot(fisioId: string, fecha: string, hora: string): Promise<void> {
    const horaDb = hora.length === 5 ? hora + ':00' : hora;
    const { error } = await supabase
      .from('disponibilidad_slots')
      .insert({ fisio_id: fisioId, fecha, hora: horaDb });
    if (error) throw error;
  }

  async eliminarSlot(slotId: string): Promise<void> {
    const { error } = await supabase
      .from('disponibilidad_slots')
      .delete()
      .eq('id', slotId);
    if (error) throw error;
  }

  async bloquearSlot(slotId: string, bloqueado: boolean): Promise<void> {
    const { error } = await supabase
      .from('disponibilidad_slots')
      .update({ bloqueado_manual: bloqueado })
      .eq('id', slotId);
    if (error) throw error;
  }

  async copiarSemana(fisioId: string, semanaOrigen: Date, semanaDestino: Date): Promise<void> {
    const lunesOrigen = this.getLunes(semanaOrigen);
    const domingoOrigen = new Date(lunesOrigen);
    domingoOrigen.setDate(lunesOrigen.getDate() + 6);

    const { data, error } = await supabase
      .from('disponibilidad_slots')
      .select('fecha, hora')
      .eq('fisio_id', fisioId)
      .gte('fecha', this.formatDate(lunesOrigen))
      .lte('fecha', this.formatDate(domingoOrigen));

    if (error) throw error;
    if (!data?.length) return;

    const lunesDestino = this.getLunes(semanaDestino);
    const diffDays = Math.round(
      (lunesDestino.getTime() - lunesOrigen.getTime()) / (1000 * 60 * 60 * 24)
    );

    const newSlots = data.map(s => {
      const fechaOrig = new Date((s.fecha as string) + 'T00:00:00');
      const fechaDest = new Date(fechaOrig.getTime() + diffDays * 24 * 60 * 60 * 1000);
      return { fisio_id: fisioId, fecha: this.formatDate(fechaDest), hora: s.hora as string };
    });

    const { error: insertError } = await supabase
      .from('disponibilidad_slots')
      .upsert(newSlots, { onConflict: 'fisio_id,fecha,hora', ignoreDuplicates: true });

    if (insertError) throw insertError;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getLunes(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  }

  getSemanaLabel(semana: Date): string {
    const lunes = this.getLunes(semana);
    const sabado = new Date(lunes);
    sabado.setDate(lunes.getDate() + 5);

    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    const locale = 'es-ES';

    if (lunes.getMonth() === sabado.getMonth()) {
      return `Semana del ${lunes.getDate()} al ${sabado.toLocaleDateString(locale, opts)}`;
    }
    return `Semana del ${lunes.toLocaleDateString(locale, { ...opts })} al ${sabado.toLocaleDateString(locale, opts)}`;
  }

  private normalizeHora(hora: string): string {
    return hora.substring(0, 5);
  }
}
