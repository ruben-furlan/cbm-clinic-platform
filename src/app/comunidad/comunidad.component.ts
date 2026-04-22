import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NewsletterService } from '../core/services/newsletter.service';

@Component({
  selector: 'app-comunidad',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './comunidad.component.html',
  styleUrls: ['./comunidad.component.scss'],
})
export class ComunidadComponent implements OnInit {
  email = '';
  estado: 'inicial' | 'cargando' | 'exito' | 'yaExiste' | 'error' = 'inicial';
  errorValidacion = '';
  totalSuscriptores = 0;
  anoActual = new Date().getFullYear();

  constructor(private newsletterService: NewsletterService) {}

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
      this.errorValidacion = 'Introduce tu email';
      return;
    }

    if (!this.validarEmail(this.email)) {
      this.errorValidacion = 'Introduce un email válido';
      return;
    }

    this.estado = 'cargando';

    try {
      const result = await this.newsletterService.suscribir(this.email.trim(), 'comunidad-landing');

      if (result.caso === 'yaExiste') {
        this.estado = 'yaExiste';
      } else {
        this.estado = 'exito';
        await this.cargarContador();
      }
    } catch {
      this.errorValidacion = 'Algo salió mal. Inténtalo de nuevo.';
      this.estado = 'inicial';
    }
  }
}
