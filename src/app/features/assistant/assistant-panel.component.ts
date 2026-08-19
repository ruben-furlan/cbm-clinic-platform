import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { PHONE_TEL, whatsappLink } from '../../core/constants/contact';
import { AssistantResultComponent } from './assistant-result.component';
import { TriageOption } from './triage-flow.data';
import { TriageService } from './triage.service';

const TYPING_MS = 400;
const BODY_OPEN_CLASS = 'assistant-open';

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'app-assistant-panel',
  standalone: true,
  imports: [AssistantResultComponent],
  templateUrl: './assistant-panel.component.html',
  styleUrl: './assistant-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class AssistantPanelComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  readonly triage = inject(TriageService);

  private readonly panelRef = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly threadRef = viewChild<ElementRef<HTMLElement>>('thread');

  readonly isTyping = signal(false);

  readonly phoneHref = `tel:${PHONE_TEL}`;
  readonly whatsappHref = whatsappLink('Hola, tengo una consulta sobre fisioterapia.');

  private typingTimer: ReturnType<typeof setTimeout> | null = null;
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      // Dependencias: cualquier cambio del hilo debe reposicionar la vista.
      const hasResult = this.triage.result() !== null;
      this.triage.history();
      this.isTyping();

      if (!isPlatformBrowser(this.platformId)) return;
      setTimeout(() => this.scrollThread(hasResult), 0);
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.classList.add(BODY_OPEN_CLASS);
    this.panelRef().nativeElement.focus();
  }

  ngOnDestroy(): void {
    if (this.typingTimer !== null) {
      clearTimeout(this.typingTimer);
    }
    if (!isPlatformBrowser(this.platformId)) return;

    document.body.classList.remove(BODY_OPEN_CLASS);
    this.previouslyFocused?.focus();
  }

  onEscape(): void {
    this.triage.close();
  }

  select(option: TriageOption): void {
    this.triage.select(option);
    this.playTyping();
  }

  back(): void {
    this.triage.back();
  }

  restart(): void {
    this.triage.restart();
    this.playTyping();
  }

  /** Mantiene el foco dentro del panel mientras está abierto. */
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    const focusables = Array.from(
      this.panelRef().nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter((el) => el.offsetParent !== null);

    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === this.panelRef().nativeElement)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /**
   * Con una pregunta nueva basta con bajar del todo. Con una recomendación se
   * alinea el inicio de la tarjeta con el borde superior del hilo: de lo
   * contrario el botón de reservar queda fuera de la zona visible.
   */
  private scrollThread(hasResult: boolean): void {
    const thread = this.threadRef()?.nativeElement;
    if (!thread) return;

    const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';

    const card = hasResult ? thread.querySelector<HTMLElement>('.assistant-result') : null;
    const top = card ? card.offsetTop : thread.scrollHeight;

    thread.scrollTo({ top, behavior });
  }

  /**
   * Pausa breve antes de la siguiente pregunta: da ritmo de conversación sin
   * llegar a hacerse esperar. Se omite si el usuario pidió menos movimiento.
   */
  private playTyping(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.isTyping.set(true);
    if (this.typingTimer !== null) {
      clearTimeout(this.typingTimer);
    }
    this.typingTimer = setTimeout(() => {
      this.isTyping.set(false);
      this.typingTimer = null;
    }, TYPING_MS);
  }
}
