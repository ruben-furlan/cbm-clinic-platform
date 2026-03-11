import { Component } from '@angular/core';
import { Testimonials } from '../../testimonials/testimonials';
import { LocationComponent } from '../../location/location';
import { BookingFormComponent } from '../../booking-form/booking-form';
import {NgOptimizedImage} from '@angular/common';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll.directive';
import { FaqComponent } from '../../faq/faq';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [Testimonials, LocationComponent, BookingFormComponent, NgOptimizedImage, RevealOnScrollDirective, FaqComponent],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css']
})
export class HomePage {}
