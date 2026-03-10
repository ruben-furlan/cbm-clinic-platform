import { Component } from '@angular/core';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [RevealOnScrollDirective],
  templateUrl: './location.html',
  styleUrls: ['./location.css']
})
export class LocationComponent {}
