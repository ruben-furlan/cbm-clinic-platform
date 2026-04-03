import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
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
  loading = true;
  readonly skeletonItems = [1, 2, 3];

  readingTime(post: BlogPost): number {
    const words = post.contenido.reduce((acc, block) => {
      if (block.texto) return acc + block.texto.split(/\s+/).length;
      if (block.items) return acc + block.items.join(' ').split(/\s+/).length;
      return acc;
    }, post.resumen.split(/\s+/).length);
    return Math.max(1, Math.ceil(words / 200));
  }

  constructor(
    private readonly blogService: BlogService,
    private readonly zone: NgZone,
    private readonly cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const all = await this.blogService.getPosts();
      this.zone.run(() => {
        this.featuredPost = all.find((p) => p.destacado) ?? null;
        this.posts = all.filter((p) => !p.destacado);
        this.categories = [...new Set(all.map((p) => p.categoria))];
        this.loading = false;
        this.cdr.detectChanges();
      });
    } catch {
      this.zone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
    }
  }
}
