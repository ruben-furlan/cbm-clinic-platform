# Context — Parent Layer

## Proyecto

**CBM Clinic Platform** es la plataforma digital de CBM Fisioterapia (Terrassa, España).
Es una aplicación Angular 21 SPA desplegada en Netlify, con Supabase como backend (PostgreSQL + Auth + RLS).

## Propósito de esta capa

La capa `parent` es el punto de entrada de todo el flujo SDD.
Contiene el contexto global del proyecto, las guías transversales y los agentes orquestadores que coordinan el trabajo entre capas.

## Stack global

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 21 (standalone components, TypeScript 5.9 strict) |
| BaaS | Supabase (PostgreSQL, Auth, RLS, Storage) |
| Serverless | Netlify Functions (TypeScript) |
| Deploy | Netlify |
| Tests | Vitest + jsdom |
| Formato | Prettier (100 chars, single quotes) |

## Dominio del negocio

Clínica de fisioterapia y pilates terapéutico en Terrassa.

Módulos activos:
- Tarifas (precios de servicios)
- Eventos y Clases (inscripciones, plazas, check-in)
- Blog (CMS interno)
- FAQs
- Bonos Regalo (venta + canje)
- Newsletter (suscripción + envío)
- Solicitar Cita (formulario de contacto)
- Admin Dashboard (gestión completa)
- Display/Kiosko (pantalla de clínica)
- SEO Pages (landing pages locales)

## Flujo SDD

```
Parent (orquestación)
  └─ Planner        → define la especificación global
  └─ TasksGenerator → descompone en tareas por capa
  └─ Developer      → ejecuta tareas en cada capa

Capas de ejecución:
  Architecture → Database → Backend → Frontend → Quality
```

## Convención de nombrado de specs

```
SPEC-{NNN}-{slug}
Ejemplo: SPEC-001-pacientes
```

Cada SPEC se replica en todas las capas que apliquen con sus propios `spec.md`, `plan.md` y `tasks.md`.