import { Routes } from '@angular/router';
import { HomePage } from './features/home/home-page/home-page';
import { BlogPage } from './features/blog/blog-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'blog',
    component: BlogPage
  }
];
