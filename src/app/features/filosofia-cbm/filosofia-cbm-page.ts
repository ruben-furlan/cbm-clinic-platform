import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-filosofia-cbm-page',
  standalone: true,
  imports: [RouterLink, RevealOnScrollDirective],
  templateUrl: './filosofia-cbm-page.html',
  styleUrl: './filosofia-cbm-page.css'
})
export class FilosofiaCbmPage {}
