import { Routes } from '@angular/router';
import { HomePage } from './features/home/home-page/home-page';
import { SolicitarCitaPage } from './features/booking-form/solicitar-cita-page';
import { BlogPage } from './features/blog/blog-page';
import { CookiesPage } from './features/cookies/cookies-page';
import { TreatmentsPage } from './features/treatments/treatments-page';
import { SeoPageComponent } from './features/seo-pages/seo-page.component';
import { DisplayComponent } from './pages/display/display.component';
import { EspacioCbmPage } from './features/espacio-cbm/espacio-cbm-page';
import { adminAuthGuard } from './admin/admin-auth.guard';
import { AdminLoginComponent } from './admin/admin-login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { RegaloComponent } from './features/regalo/regalo.component';
import { CanjearRegaloComponent } from './canjear/canjear-regalo.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'solicitar-cita',
    component: SolicitarCitaPage
  },
  {
    path: 'display',
    pathMatch: 'full',
    redirectTo: 'display/vertical'
  },
  {
    path: 'display/:orientation',
    component: DisplayComponent
  },
  {
    path: 'espacio-cbm',
    component: EspacioCbmPage
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
    path: 'regalo',
    component: RegaloComponent
  },
  {
    path: 'canjear',
    component: CanjearRegaloComponent
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [adminAuthGuard]
  },
  {
    path: 'admin/login',
    component: AdminLoginComponent
  },
  {
    path: 'admin/dashboard',
    pathMatch: 'full',
    redirectTo: 'admin'
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
  }
];
