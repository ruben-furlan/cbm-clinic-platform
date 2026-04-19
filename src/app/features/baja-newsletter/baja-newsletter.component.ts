import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NewsletterService } from '../../core/services/newsletter.service';

type Estado = 'cargando' | 'exito' | 'error' | 'no_encontrado';

@Component({
  selector: 'app-baja-newsletter',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './baja-newsletter.component.html',
  styleUrl: './baja-newsletter.component.css'
})
export class BajaNewsletterComponent implements OnInit {
  estado: Estado = 'cargando';
  debugInfo = '';

  constructor(
    private readonly newsletterService: NewsletterService,
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Timeout de seguridad: si en 10s no hay respuesta, mostrar error
    const safetyTimer = setTimeout(() => {
      if (this.estado === 'cargando') {
        this.zone.run(() => {
          this.estado = 'error';
          this.cdr.detectChanges();
        });
      }
    }, 10000);

    let email: string | null = null;

    if (typeof window !== 'undefined') {
      const match = window.location.href.match(/[?&]email=([^&\s]+)/);
      if (match) {
        email = decodeURIComponent(match[1]).toLowerCase().trim().replace(/[\s\n\r]+/g, '');
      }
    }

    if (email && email.includes('@')) {
      this.procesarBaja(email, safetyTimer);
    } else {
      clearTimeout(safetyTimer);
      this.zone.run(() => {
        this.estado = 'error';
        this.cdr.detectChanges();
      });
    }
  }

  private procesarBaja(email: string, safetyTimer: ReturnType<typeof setTimeout>): void {
    this.debugInfo = 'Email: ' + email;
    this.cdr.detectChanges();

    this.newsletterService.darDeBaja(email).then(() => {
      clearTimeout(safetyTimer);
      this.zone.run(() => {
        this.debugInfo += ' | OK';
        this.estado = 'exito';
        this.cdr.detectChanges();
      });
    }).catch((err: unknown) => {
      clearTimeout(safetyTimer);
      console.error('Error baja newsletter:', err);
      const esNoEncontrado = err instanceof Error && err.message === 'email_no_encontrado';
      this.zone.run(() => {
        this.debugInfo += ' | ERROR: ' + (err instanceof Error ? err.message : JSON.stringify(err));
        this.estado = esNoEncontrado ? 'no_encontrado' : 'error';
        this.cdr.detectChanges();
      });
    });
  }
}
