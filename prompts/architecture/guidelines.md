# Guidelines — Architecture Layer

## Al diseñar una nueva feature

1. **Revisar primero** si ya existe algo similar en `features/` o `core/services/`
2. **Reutilizar** componentes de `shared/` antes de crear nuevos
3. **Un servicio por dominio** — no mezclar lógica de pacientes con lógica de tarifas
4. **Interfaces antes de implementación** — definir los tipos TypeScript en el `spec.md`

## Diseño de servicios

Los servicios en `core/services/` siguen este patrón:

```typescript
@Injectable({ providedIn: 'root' })
export class {Nombre}Service {
  // Métodos públicos: CRUD + helpers de dominio
  async getAll(): Promise<{Tipo}[]> { ... }
  async getById(id: string): Promise<{Tipo}> { ... }
  async create(data: Omit<{Tipo}, 'id'>): Promise<{Tipo}> { ... }
  async update(id: string, data: Partial<{Tipo}>): Promise<{Tipo}> { ... }
  async delete(id: string): Promise<void> { ... }
}
```

## Diseño de componentes

- Un componente = una responsabilidad
- Los componentes de lista NO contienen lógica de formulario
- Los componentes de formulario NO hacen llamadas directas a Supabase — usan el servicio
- Los componentes de página (`*-page.ts`) son orquestadores: delegan en subcomponentes

## Cuándo crear una sección vs una feature

- **Feature**: tiene ruta propia (`/pacientes`) → va en `features/`
- **Sección**: se embebe en otras páginas (sin ruta propia) → va en `sections/`
- **Shared component**: sin lógica de negocio, puramente visual o utilitario → va en `shared/components/`

## Diagramas (opcional pero recomendado)

En `plan.md` de arquitectura se puede incluir un diagrama ASCII de la estructura:

```
features/pacientes/
  pacientes-page.ts          [ruta: /admin/pacientes]
  pacientes-list.component.ts
  pacientes-form.component.ts

core/services/
  pacientes.service.ts
```
