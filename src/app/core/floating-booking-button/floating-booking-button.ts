import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-floating-booking-button',
  standalone: true,
  imports: [],
  templateUrl: './floating-booking-button.html',
  styleUrls: ['./floating-booking-button.css']
})
export class FloatingBookingButtonComponent {
  private readonly router = inject(Router);

  onRequestBooking(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/solicitar-cita']);
  }
}
