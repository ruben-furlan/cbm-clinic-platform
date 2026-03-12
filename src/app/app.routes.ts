import { Routes } from '@angular/router';
import { HomePage } from './features/home/home-page/home-page';
import { BlogPage } from './features/blog/blog-page';
import { CookiesPage } from './features/cookies/cookies-page';
import { TreatmentsPage } from './features/treatments/treatments-page';
import { SeoPageComponent } from './features/seo-pages/seo-page.component';

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
  },
  {
    path: 'tratamientos/:categoria',
    component: TreatmentsPage
  },

  {
    path: 'fisioterapia-dolor-lumbar-terrassa',
    component: SeoPageComponent
  },
  {
    path: 'fisioterapia-cervical-terrassa',
    component: SeoPageComponent
  },
  {
    path: 'puncion-seca-terrassa',
    component: SeoPageComponent
  },
  {
    path: 'pilates-terapeutico-terrassa',
    component: SeoPageComponent
  },
];
