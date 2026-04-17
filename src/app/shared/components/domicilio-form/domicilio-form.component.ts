import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-domicilio-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './domicilio-form.component.html',
  styleUrls: ['./domicilio-form.component.css']
})
export class DomicilioFormComponent {
  @Output() cerrar = new EventEmitter<void>();

  motivo = '';
  zona = '';
  disponibilidad = '';

  readonly numeroWhatsapp = '34662561672';

  enviarWhatsapp(): void {
    if (!this.motivo.trim() || !this.zona.trim()) return;

    const lineas = [
      'Hola 💜 Me gustaría consultaros sobre fisioterapia a domicilio.',
      '',
      `• Motivo: ${this.motivo.trim()}`,
      `• Zona: ${this.zona.trim()}`,
      this.disponibilidad.trim() ? `• Disponibilidad: ${this.disponibilidad.trim()}` : null,
      '',
      '¡Gracias!'
    ].filter((l): l is string => l !== null);

    const url = `https://wa.me/${this.numeroWhatsapp}?text=${encodeURIComponent(lineas.join('\n'))}`;
    window.open(url, '_blank');
  }
}
