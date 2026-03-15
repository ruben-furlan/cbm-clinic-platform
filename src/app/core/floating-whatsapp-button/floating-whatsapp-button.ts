import { Component, inject } from '@angular/core';
import { LanguageService } from '../language/language.service';

@Component({
  selector: 'app-floating-whatsapp-button',
  standalone: true,
  imports: [],
  templateUrl: './floating-whatsapp-button.html',
  styleUrls: ['./floating-whatsapp-button.css']
})
export class FloatingWhatsappButtonComponent {
  private readonly languageService = inject(LanguageService);

  get whatsappHref(): string {
    const phoneNumber = '34662561672';
    const textByLanguage: Record<'es' | 'en' | 'ca', string> = {
      es: 'Hola, quiero información sobre una cita.',
      en: 'Hi, I would like information about an appointment.',
      ca: 'Hola, vull informació sobre una cita.'
    };

    const selectedLanguage = this.languageService.selectedLanguage;
    const encodedMessage = encodeURIComponent(textByLanguage[selectedLanguage]);

    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  }

  get buttonLabel(): string {
    const labelByLanguage: Record<'es' | 'en' | 'ca', string> = {
      es: '¿Te ayudamos?',
      en: 'Need help?',
      ca: 'Et podem ajudar?'
    };

    return labelByLanguage[this.languageService.selectedLanguage];
  }
}
