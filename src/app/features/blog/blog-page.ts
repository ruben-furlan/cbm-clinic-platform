import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-blog-page',
  standalone: true,
  imports: [RouterLink, RevealOnScrollDirective],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.css'
})
export class BlogPage {}
