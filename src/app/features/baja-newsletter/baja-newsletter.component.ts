import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NewsletterService } from '../../core/services/newsletter.service';

type Estado = 'cargando' | 'exito' | 'error';

@Component({
  selector: 'app-baja-newsletter',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './baja-newsletter.component.html',
  styleUrl: './baja-newsletter.component.css'
})
export class BajaNewsletterComponent implements OnInit {
  estado: Estado = 'cargando';

  constructor(
    private readonly route: ActivatedRoute,
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

    this.route.queryParams.subscribe(params => {
      const raw = params['email'];

      if (!raw) {
        clearTimeout(safetyTimer);
        this.zone.run(() => {
          this.estado = 'error';
          this.cdr.detectChanges();
        });
        return;
      }

      this.procesarBaja(decodeURIComponent(raw), safetyTimer);
    });
  }

  private procesarBaja(email: string, safetyTimer: ReturnType<typeof setTimeout>): void {
    this.newsletterService.darDeBaja(email).then(() => {
      clearTimeout(safetyTimer);
      this.zone.run(() => {
        this.estado = 'exito';
        this.cdr.detectChanges();
      });
    }).catch((err: unknown) => {
      clearTimeout(safetyTimer);
      console.error('Error baja newsletter:', err);
      this.zone.run(() => {
        this.estado = 'error';
        this.cdr.detectChanges();
      });
    });
  }
}
