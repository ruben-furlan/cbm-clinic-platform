import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TarifasService } from '../../core/services/tarifas.service';
import { TRIAGE_NODES } from './triage-flow.data';
import { TriageService } from './triage.service';

/** Elige la opción con ese id en el nodo activo. */
function elegir(service: TriageService, optionId: string): void {
  const node = service.currentNode();
  if (!node) throw new Error('No hay pregunta activa');

  const option = node.opciones.find((o) => o.id === optionId);
  if (!option) throw new Error(`Opción ${optionId} inexistente en ${node.id}`);

  service.select(option);
}

describe('TriageService', () => {
  let tarifas: { getTarifas: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    sessionStorage.clear();
    tarifas = { getTarifas: vi.fn() };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: TarifasService, useValue: tarifas }],
    });
  });

  it('arranca en la pregunta inicial y sin recomendación', () => {
    const service = TestBed.inject(TriageService);

    expect(service.currentNode()?.id).toBe('inicio');
    expect(service.result()).toBeNull();
    expect(service.canGoBack()).toBe(false);
  });

  it('llega a la recomendación lumbar en dos pasos', () => {
    const service = TestBed.inject(TriageService);

    elegir(service, 'dolor');
    expect(service.currentNode()?.id).toBe('zona');

    elegir(service, 'lumbar');
    expect(service.currentNode()).toBeNull();
    expect(service.result()?.outcome.id).toBe('lumbar');
  });

  it('salta la segunda pregunta cuando la respuesta ya es inequívoca', () => {
    const service = TestBed.inject(TriageService);

    elegir(service, 'operacion');

    expect(service.history()).toHaveLength(1);
    expect(service.result()?.outcome.id).toBe('postquirurgica');
  });

  it('reutiliza el contenido de la landing SEO en la recomendación', () => {
    const service = TestBed.inject(TriageService);

    elegir(service, 'dolor');
    elegir(service, 'cuello');

    const result = service.result();
    expect(result?.landingPath).toBe('/fisioterapia-cervical-terrassa');
    expect(result?.pasos).toHaveLength(3);
    expect(result?.avisos.length).toBeGreaterThan(0);
  });

  it('usa los pasos propios cuando el resultado no tiene landing', () => {
    const service = TestBed.inject(TriageService);

    elegir(service, 'dolor');
    elegir(service, 'mandibula');

    const result = service.result();
    expect(result?.outcome.id).toBe('atm');
    expect(result?.landingPath).toBeNull();
    expect(result?.pasos.length).toBeGreaterThan(0);
  });

  it('«volver» deshace la última respuesta y devuelve a esa pregunta', () => {
    const service = TestBed.inject(TriageService);

    elegir(service, 'dolor');
    elegir(service, 'lumbar');
    service.back();

    expect(service.currentNode()?.id).toBe('zona');
    expect(service.result()).toBeNull();
    expect(service.history()).toHaveLength(1);
  });

  it('«volver» desde el inicio no hace nada', () => {
    const service = TestBed.inject(TriageService);

    service.back();

    expect(service.currentNode()?.id).toBe('inicio');
    expect(service.history()).toHaveLength(0);
  });

  it('«empezar de nuevo» limpia todo el recorrido', () => {
    const service = TestBed.inject(TriageService);

    elegir(service, 'dolor');
    elegir(service, 'lumbar');
    service.restart();

    expect(service.currentNode()?.id).toBe('inicio');
    expect(service.history()).toHaveLength(0);
    expect(service.result()).toBeNull();
  });

  it('el motivo resume el recorrido y el servicio recomendado', () => {
    const service = TestBed.inject(TriageService);

    elegir(service, 'dolor');
    elegir(service, 'hombro');

    expect(service.motivo()).toBe(
      'Me duele algo · Hombro o brazo → Fisioterapia para dolor de hombro',
    );
  });

  it('restaura el recorrido guardado en la sesión', () => {
    const primera = TestBed.inject(TriageService);
    elegir(primera, 'dolor');
    elegir(primera, 'lumbar');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: TarifasService, useValue: tarifas }],
    });

    const segunda = TestBed.inject(TriageService);
    expect(segunda.result()?.outcome.id).toBe('lumbar');
    expect(segunda.history()).toHaveLength(2);
  });

  it('ignora un estado guardado que ya no encaja con el grafo', () => {
    sessionStorage.setItem(
      'cbm-triage-state',
      JSON.stringify({ history: [], currentNodeId: 'nodo-que-ya-no-existe', outcomeId: null }),
    );

    const service = TestBed.inject(TriageService);

    expect(service.currentNode()?.id).toBe('inicio');
  });

  it('preselecciona la tarifa de la categoría recomendada al ir a reservar', async () => {
    tarifas.getTarifas.mockResolvedValue([
      { id: 'pil-1', categoria: 'pilates', nombre: 'Bono pilates' },
      { id: 'fis-1', categoria: 'fisioterapia', nombre: 'Sesión' },
    ]);

    const service = TestBed.inject(TriageService);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    elegir(service, 'dolor');
    elegir(service, 'lumbar');
    await service.goToBooking();

    const [ruta, extras] = navigate.mock.calls[0];
    expect(ruta).toEqual(['/solicitar-cita']);
    expect(extras?.queryParams?.['tarifaId']).toBe('fis-1');
    expect(extras?.queryParams?.['motivo']).toContain('Fisioterapia para dolor lumbar');
    expect(service.isOpen()).toBe(false);
  });

  it('lleva igualmente a la reserva si las tarifas fallan', async () => {
    tarifas.getTarifas.mockRejectedValue(new Error('sin red'));

    const service = TestBed.inject(TriageService);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    elegir(service, 'prevenir');
    await service.goToBooking();

    const [ruta, extras] = navigate.mock.calls[0];
    expect(ruta).toEqual(['/solicitar-cita']);
    expect(extras?.queryParams?.['tarifaId']).toBeUndefined();
    expect(extras?.queryParams?.['motivo']).toContain('Pilates terapéutico');
  });
});

describe('nodos del grafo', () => {
  it('todas las preguntas ofrecen al menos dos opciones', () => {
    for (const node of Object.values(TRIAGE_NODES)) {
      expect(node.opciones.length, node.id).toBeGreaterThanOrEqual(2);
    }
  });
});
