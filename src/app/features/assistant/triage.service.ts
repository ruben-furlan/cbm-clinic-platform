import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TarifasService } from '../../core/services/tarifas.service';
import { SEO_PAGES } from '../seo-pages/seo-content.data';
import {
  TRIAGE_NODES,
  TRIAGE_OUTCOMES,
  TRIAGE_ROOT_ID,
  TriageNode,
  TriageOption,
  TriageOutcome,
} from './triage-flow.data';

const STORAGE_KEY = 'cbm-triage-state';

/** Un paso ya respondido, usado para pintar el hilo y para poder retroceder. */
export interface TriageStep {
  readonly nodeId: string;
  readonly pregunta: string;
  readonly label: string;
}

/** Recomendación final, ya resuelta contra el contenido de las landings SEO. */
export interface TriageResult {
  readonly outcome: TriageOutcome;
  readonly pasos: readonly string[];
  readonly avisos: readonly string[];
  readonly landingPath: string | null;
}

interface PersistedState {
  readonly history: TriageStep[];
  readonly currentNodeId: string | null;
  readonly outcomeId: string | null;
}

@Injectable({ providedIn: 'root' })
export class TriageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly tarifasService = inject(TarifasService);

  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly isOpen = signal(false);
  readonly history = signal<TriageStep[]>([]);
  readonly currentNodeId = signal<string | null>(TRIAGE_ROOT_ID);
  readonly outcomeId = signal<string | null>(null);

  /** Nodo con la pregunta activa. `null` cuando ya hay recomendación. */
  readonly currentNode = computed<TriageNode | null>(() => {
    const id = this.currentNodeId();
    return id === null ? null : (TRIAGE_NODES[id] ?? null);
  });

  readonly result = computed<TriageResult | null>(() => {
    const id = this.outcomeId();
    if (id === null) return null;

    const outcome = TRIAGE_OUTCOMES[id];
    if (!outcome) return null;

    const landing = outcome.seoSlug ? SEO_PAGES[outcome.seoSlug] : null;

    return {
      outcome,
      pasos: landing ? landing.treatment.slice(0, 3) : (outcome.pasos ?? []),
      avisos: landing ? landing.whenToCome : (outcome.avisos ?? []),
      landingPath: outcome.seoSlug ? `/${outcome.seoSlug}` : null,
    };
  });

  /** Hay algo que deshacer (se ha respondido al menos una pregunta). */
  readonly canGoBack = computed(() => this.history().length > 0);

  constructor() {
    this.restore();
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  select(option: TriageOption): void {
    const node = this.currentNode();
    if (!node) return;

    this.history.update((steps) => [
      ...steps,
      { nodeId: node.id, pregunta: node.pregunta, label: option.label },
    ]);

    if (option.next.kind === 'node') {
      this.currentNodeId.set(option.next.nodeId);
      this.outcomeId.set(null);
    } else {
      this.currentNodeId.set(null);
      this.outcomeId.set(option.next.outcomeId);
    }

    this.persist();
  }

  /** Deshace la última respuesta y vuelve a esa pregunta. */
  back(): void {
    const steps = this.history();
    if (steps.length === 0) return;

    const last = steps[steps.length - 1];
    this.history.set(steps.slice(0, -1));
    this.currentNodeId.set(last.nodeId);
    this.outcomeId.set(null);
    this.persist();
  }

  restart(): void {
    this.history.set([]);
    this.currentNodeId.set(TRIAGE_ROOT_ID);
    this.outcomeId.set(null);
    this.persist();
  }

  /**
   * Motivo en texto plano. Viaja como query param a la reserva y de ahí al
   * prefill de Calendly, para que el fisio conozca el contexto antes de la cita.
   */
  readonly motivo = computed(() => {
    const recorrido = this.history()
      .map((step) => step.label)
      .join(' · ');
    const servicio = this.result()?.outcome.servicio;
    return servicio ? `${recorrido} → ${servicio}` : recorrido;
  });

  /**
   * Lleva a la reserva preseleccionando la tarifa de la categoría recomendada,
   * de modo que el wizard arranque en el paso 2 en lugar del selector inicial.
   * Si algo falla, navega igualmente: nunca se deja al usuario sin salida.
   */
  async goToBooking(): Promise<void> {
    const result = this.result();
    this.close();

    if (!result) {
      await this.router.navigate(['/solicitar-cita']);
      return;
    }

    const queryParams: Record<string, string> = { motivo: this.motivo() };

    try {
      const tarifas = await this.tarifasService.getTarifas();
      const match = tarifas.find((tarifa) => tarifa.categoria === result.outcome.categoria);
      if (match) {
        queryParams['tarifaId'] = match.id;
      }
    } catch {
      // Sin tarifas no se puede preseleccionar; se sigue a la reserva igualmente.
    }

    await this.router.navigate(['/solicitar-cita'], { queryParams });
  }

  private persist(): void {
    if (!this.isBrowser) return;

    const state: PersistedState = {
      history: this.history(),
      currentNodeId: this.currentNodeId(),
      outcomeId: this.outcomeId(),
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Modo privado o almacenamiento lleno: el asistente funciona sin persistir.
    }
  }

  private restore(): void {
    if (!this.isBrowser) return;

    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return;
    }
    if (!raw) return;

    try {
      const state = JSON.parse(raw) as PersistedState;
      const nodeIsValid = state.currentNodeId === null || state.currentNodeId in TRIAGE_NODES;
      const outcomeIsValid = state.outcomeId === null || state.outcomeId in TRIAGE_OUTCOMES;

      // El grafo pudo cambiar entre despliegues: ante datos obsoletos, empezar de cero.
      if (!Array.isArray(state.history) || !nodeIsValid || !outcomeIsValid) return;

      this.history.set(state.history);
      this.currentNodeId.set(state.currentNodeId);
      this.outcomeId.set(state.outcomeId);
    } catch {
      // JSON corrupto: se ignora y se arranca desde el inicio.
    }
  }
}
