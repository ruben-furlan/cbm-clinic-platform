# Plan — Quality — SPEC-001-pacientes

## Estrategia de mocking

### Mock de Supabase para tests de servicio

El cliente Supabase se mockea completamente. El servicio recibe las respuestas simuladas:

```typescript
import { vi } from 'vitest';
import * as client from '../../core/supabase.client';

const mockSingle = vi.fn();
const mockSelect = vi.fn().mockReturnValue({
  order: vi.fn().mockReturnValue({
    data: [{ id: '1', nombre: 'Ana', ... }],
    error: null
  }),
  eq: vi.fn().mockReturnThis(),
  single: mockSingle
});

vi.spyOn(client, 'supabase', 'get').mockReturnValue({
  from: vi.fn().mockReturnValue({ select: mockSelect, insert: ..., update: ..., delete: ... })
} as any);
```

### Mock del servicio para tests de componente

En los tests de `PacientesPage`, el servicio se mockea con `vi.fn()`:

```typescript
const mockService = {
  getAll: vi.fn().mockResolvedValue([pacienteEjemplo]),
  create: vi.fn().mockResolvedValue(pacienteEjemplo),
  update: vi.fn().mockResolvedValue(pacienteEjemplo),
  updateEstado: vi.fn().mockResolvedValue(pacienteEjemplo),
  delete: vi.fn().mockResolvedValue(undefined)
};
```

## Datos de fixture

```typescript
const pacienteEjemplo: Paciente = {
  id: 'uuid-test-001',
  nombre: 'Ana',
  apellidos: 'García López',
  email: 'ana@ejemplo.com',
  telefono: '612345678',
  fecha_nacimiento: '1985-03-15',
  notas: null,
  estado: 'activo',
  created_at: '2026-01-01T10:00:00Z',
  updated_at: '2026-01-01T10:00:00Z'
};
```

## Decisión: ¿TestBed o test puramente unitario para componentes?

**Decisión: TestBed para `PacientesPage` y `PacientesFormComponent`**

Los componentes usan Angular DI, Reactive Forms y `@Input`/`@Output`. TestBed es la forma correcta de testearlos en Angular.

Para el servicio, test unitario puro (sin TestBed) es suficiente.

## Ubicación de los tests

```
src/app/features/pacientes/
  pacientes-page.spec.ts
  pacientes-form.component.spec.ts

src/app/core/services/
  pacientes.service.spec.ts
```

## Comandos para ejecutar tests

```bash
# Todos los tests
npm test

# Solo los tests de pacientes (cuando se implemente filtrado por fichero)
npm test -- --reporter=verbose
```
