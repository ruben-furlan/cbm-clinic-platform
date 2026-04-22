import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NewsletterService } from '../core/services/newsletter.service';
import { CbmLoaderComponent } from '../shared/components/cbm-loader/cbm-loader.component';

@Component({
  selector: 'app-comunidad',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CbmLoaderComponent],
  templateUrl: './comunidad.component.html',
  styleUrls: ['./comunidad.component.scss'],
})
export class ComunidadComponent implements OnInit {
  email = '';
  estado: 'inicial' | 'cargando' | 'exito' | 'yaExiste' | 'error' = 'inicial';
  errorValidacion = '';
  totalSuscriptores = 0;
  anoActual = new Date().getFullYear();

  constructor(
    private newsletterService: NewsletterService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    await this.cargarContador();
  }

  async cargarContador() {
    try {
      const suscriptores = await this.newsletterService.getAllSuscriptores();
      this.totalSuscriptores = suscriptores.filter((s) => s.activo).length;
    } catch {
      this.totalSuscriptores = 0;
    }
  }

  validarEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  async suscribir() {
    this.errorValidacion = '';

    if (!this.email?.trim()) {
      this.errorValidacion = 'Introduce un email válido';
      this.cdr.detectChanges();
      return;
    }

    if (!this.validarEmail(this.email)) {
      this.errorValidacion = 'Introduce un email válido';
      this.cdr.detectChanges();
      return;
    }

    this.ngZone.run(() => {
      this.estado = 'cargando';
      this.cdr.detectChanges();
    });

    try {
      const result = await this.newsletterService.suscribir(this.email.trim(), 'comunidad-landing');

      this.ngZone.run(() => {
        if (result.caso === 'yaExiste') {
          this.estado = 'yaExiste';
        } else {
          this.estado = 'exito';
        }
        this.cdr.detectChanges();
      });

      if (result.caso !== 'yaExiste') {
        await this.cargarContador();
      }
    } catch (err) {
      console.error('Error suscripción:', err);
      this.ngZone.run(() => {
        this.estado = 'error';
        this.cdr.detectChanges();
      });
    }
  }
}
