import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
    private readonly newsletterService: NewsletterService
  ) {}

  async ngOnInit(): Promise<void> {
    const email = this.route.snapshot.queryParamMap.get('email');

    if (!email) {
      this.estado = 'error';
      return;
    }

    try {
      await this.newsletterService.darDeBaja(email);
      this.estado = 'exito';
    } catch {
      this.estado = 'error';
    }
  }
}
