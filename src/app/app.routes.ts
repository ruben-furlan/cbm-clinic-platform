import { Routes } from '@angular/router';
import { HomePage } from './features/home/home-page/home-page';
import { BlogPage } from './features/blog/blog-page';
import { CookiesPage } from './features/cookies/cookies-page';
import { TreatmentsPage } from './features/treatments/treatments-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'blog',
    component: BlogPage
  },
  {
    path: 'cookies',
    component: CookiesPage
  },
  {
    path: 'tratamientos',
    component: TreatmentsPage
  }
];
