import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Testimonials } from '../../testimonials/testimonials';
import { LocationComponent } from '../../location/location';
import { BookingFormComponent } from '../../booking-form/booking-form';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll.directive';
import { FaqComponent } from '../../faq/faq';
import { PricingComponent } from '../../../sections/pricing/pricing.component';
import { HomeCarouselComponent } from '../../home-carousel/home-carousel';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [Testimonials, LocationComponent, BookingFormComponent, RevealOnScrollDirective, FaqComponent, PricingComponent, RouterLink, HomeCarouselComponent],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css']
})
export class HomePage {}
