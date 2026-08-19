import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { LanguageService } from '../../core/language/language.service';
import { AssistantPanelComponent } from './assistant-panel.component';
import { TriageService } from './triage.service';

const NUDGE_STORAGE_KEY = 'cbm-triage-nudge';
const NUDGE_DELAY_MS = 15000;
const NUDGE_SCROLL_RATIO = 0.5;

type Lang = 'es' | 'en' | 'ca';

/**
 * Botón flotante del asistente de orientación.
 *
 * Sustituye al botón de WhatsApp y al de teléfono, que pasan a ser salidas
 * secundarias dentro del panel. Así el rail móvil baja de cuatro elementos a dos.
 */
@Component({
  selector: 'app-assistant-launcher',
  standalone: true,
  imports: [AssistantPanelComponent],
  templateUrl: './assistant-launcher.component.html',
  styleUrl: './assistant-launcher.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistantLauncherComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly languageService = inject(LanguageService);
  readonly triage = inject(TriageService);

  readonly showNudge = signal(false);

  private nudgeTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly onScroll = (): void => this.checkScrollNudge();

  private readonly labels: Record<Lang, string> = {
    es: '¿Qué te pasa?',
    en: "What's wrong?",
    ca: 'Què et passa?',
  };

  private readonly nudges: Record<Lang, string> = {
    es: '¿No sabes qué necesitas? Te orientamos en 2 preguntas.',
    en: 'Not sure what you need? Two questions and we will point you.',
    ca: 'No saps què necessites? T’orientem en 2 preguntes.',
  };

  get label(): string {
    return this.labels[this.languageService.selectedLanguage];
  }

  get nudgeText(): string {
    return this.nudges[this.languageService.selectedLanguage];
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId) || this.nudgeAlreadyShown()) return;

    // El asistente nunca se abre solo: solo se insinúa, una vez por sesión.
    this.nudgeTimer = setTimeout(() => this.revealNudge(), NUDGE_DELAY_MS);
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  ngOnDestroy(): void {
    this.clearNudgeTimer();
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.onScroll);
    }
  }

  toggle(): void {
    this.dismissNudge();
    if (this.triage.isOpen()) {
      this.triage.close();
    } else {
      this.triage.open();
    }
  }

  dismissNudge(): void {
    this.showNudge.set(false);
    this.clearNudgeTimer();
    this.markNudgeShown();
  }

  private checkScrollNudge(): void {
    const doc = document.documentElement;
    const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
    if (window.scrollY / maxScroll >= NUDGE_SCROLL_RATIO) {
      this.revealNudge();
    }
  }

  private revealNudge(): void {
    if (this.triage.isOpen() || this.nudgeAlreadyShown()) return;

    this.showNudge.set(true);
    this.clearNudgeTimer();
    window.removeEventListener('scroll', this.onScroll);
    this.markNudgeShown();
  }

  private clearNudgeTimer(): void {
    if (this.nudgeTimer !== null) {
      clearTimeout(this.nudgeTimer);
      this.nudgeTimer = null;
    }
  }

  private nudgeAlreadyShown(): boolean {
    try {
      return sessionStorage.getItem(NUDGE_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  private markNudgeShown(): void {
    try {
      sessionStorage.setItem(NUDGE_STORAGE_KEY, '1');
    } catch {
      // Sin sessionStorage el nudge podría repetirse; es un efecto menor y aceptable.
    }
  }
}
