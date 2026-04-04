import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { FaqsService, Faq } from '../../core/services/faqs.service';
import { CbmLoaderComponent } from '../../shared/components/cbm-loader/cbm-loader.component';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [NgFor, NgIf, RevealOnScrollDirective, CbmLoaderComponent],
  templateUrl: './faq.html',
  styleUrl: './faq.css'
})
export class FaqComponent implements OnInit {
  activeItemIndex: number | null = 0;
  faqItems: Faq[] = [];
  loading = true;

  constructor(private readonly faqsService: FaqsService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.faqItems = await this.faqsService.getFaqs();
    } catch {
      // Si falla la carga, el acordeón queda vacío sin romper la página
    } finally {
      this.loading = false;
    }
  }

  toggleItem(index: number): void {
    this.activeItemIndex = this.activeItemIndex === index ? null : index;
  }
}
