import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewsletterService } from '../../../core/services/newsletter.service';

type Estado = 'inicial' | 'cargando' | 'exito' | 'yaExiste' | 'error';

@Component({
  selector: 'app-newsletter-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './newsletter-form.component.html',
  styleUrl: './newsletter-form.component.css'
})
export class NewsletterFormComponent {
  @Input() titulo = 'Únete a la comunidad CBM';
  @Input() subtitulo = 'Sé la primera en enterarte de nuevas clases, talleres y novedades del centro 💜';
  @Input() origen = 'web';
  @Input() variante: 'claro' | 'oscuro' = 'claro';

  email = '';
  estado: Estado = 'inicial';

  constructor(private readonly newsletterService: NewsletterService) {}

  async suscribir(): Promise<void> {
    if (!this.email.trim()) return;
    this.estado = 'cargando';
    try {
      const result = await this.newsletterService.suscribir(this.email, this.origen);
      this.estado = result.yaExiste ? 'yaExiste' : 'exito';
    } catch {
      this.estado = 'error';
    }
  }

  reintentar(): void {
    this.estado = 'inicial';
  }
}
