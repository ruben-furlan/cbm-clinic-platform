import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
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
  errorValidacion = '';

  constructor(
    private readonly newsletterService: NewsletterService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  private validarEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  async suscribir(): Promise<void> {
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
      const result = await this.newsletterService.suscribir(this.email, this.origen);
      this.estado = result.caso === 'yaExiste' ? 'yaExiste' : 'exito';
    } catch {
      this.estado = 'error';
    } finally {
      this.cdr.detectChanges();
    }
  }

  reintentar(): void {
    this.estado = 'inicial';
  }
}
