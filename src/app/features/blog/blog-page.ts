import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { BlogService, BlogPost } from '../../core/services/blog.service';

@Component({
  selector: 'app-blog-page',
  standalone: true,
  imports: [CommonModule, RouterLink, RevealOnScrollDirective],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.css'
})
export class BlogPage implements OnInit {
  featuredPost: BlogPost | null = null;
  posts: BlogPost[] = [];
  categories: string[] = [];

  constructor(private readonly blogService: BlogService) {}

  async ngOnInit(): Promise<void> {
    try {
      const all = await this.blogService.getPosts();
      this.featuredPost = all.find((p) => p.destacado) ?? null;
      this.posts = all.filter((p) => !p.destacado);
      this.categories = [...new Set(all.map((p) => p.categoria))];
    } catch {
      // Si falla la carga la página queda vacía sin romper nada
    }
  }
}
