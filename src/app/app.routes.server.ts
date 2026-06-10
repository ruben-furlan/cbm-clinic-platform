import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Rutas públicas con contenido SEO → prerender (HTML estático generado en build,
 * con canonical, título y contenido reales para los rastreadores).
 * Rutas privadas o interactivas (admin, display, canjear, booking…) → client-side.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'espacio-cbm', renderMode: RenderMode.Prerender },
  { path: 'filosofia-cbm', renderMode: RenderMode.Prerender },
  { path: 'blog', renderMode: RenderMode.Prerender },
  { path: 'cookies', renderMode: RenderMode.Prerender },
  { path: 'tratamientos', renderMode: RenderMode.Prerender },
  {
    path: 'tratamientos/:categoria',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => [
      { categoria: 'fisioterapia' },
      { categoria: 'tecnicas' },
      { categoria: 'pilates' },
    ],
  },
  { path: 'regalo', renderMode: RenderMode.Prerender },
  { path: 'fisioterapia-dolor-lumbar-terrassa', renderMode: RenderMode.Prerender },
  { path: 'fisioterapia-cervical-terrassa', renderMode: RenderMode.Prerender },
  { path: 'puncion-seca-terrassa', renderMode: RenderMode.Prerender },
  { path: 'pilates-terapeutico-terrassa', renderMode: RenderMode.Prerender },
  { path: 'fisioterapia-lesiones-deportivas-terrassa', renderMode: RenderMode.Prerender },
  { path: 'fisioterapia-tendinitis-terrassa', renderMode: RenderMode.Prerender },
  { path: 'fisioterapia-recuperacion-postquirurgica-terrassa', renderMode: RenderMode.Prerender },
  { path: 'fisioterapia-dolor-hombro-terrassa', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
