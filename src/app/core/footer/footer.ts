import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsletterFormComponent } from '../../shared/components/newsletter-form/newsletter-form.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, NewsletterFormComponent],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class FooterComponent {}
