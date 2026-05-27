# Guidelines — Quality Layer

## Estructura de un fichero de test

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('{NombreClase}', () => {
  describe('{nombreMetodo}', () => {
    it('debería {comportamiento esperado}', async () => {
      // Arrange
      // Act
      // Assert
    });

    it('debería lanzar error cuando {condición de fallo}', async () => {
      // Arrange
      // Act + Assert
    });
  });
});
```

## Mock del cliente Supabase

```typescript
import { vi } from 'vitest';
import * as supabaseClient from '../core/supabase.client';

// Mock del cliente
const mockSelect = vi.fn();
const mockEq = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockReturnThis();
const mockSingle = vi.fn();

vi.spyOn(supabaseClient, 'supabase', 'get').mockReturnValue({
  from: vi.fn().mockReturnValue({
    select: mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      single: mockSingle
    }),
  })
} as any);
```

## Test de componente Angular con TestBed

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { {Nombre}Component } from './{nombre}.component';

describe('{Nombre}Component', () => {
  let component: {Nombre}Component;
  let fixture: ComponentFixture<{Nombre}Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [{Nombre}Component]
    }).compileComponents();

    fixture = TestBed.createComponent({Nombre}Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
```

## Nomenclatura de tests

- Describe: nombre de la clase o módulo bajo test
- It: "debería + verbo en infinitivo + condición" (en español)
  - ✅ `'debería devolver los pacientes activos'`
  - ✅ `'debería lanzar error cuando Supabase falla'`
  - ❌ `'test 1'`, `'funciona'`

## Cobertura mínima por spec

| Elemento | Tests requeridos |
|----------|-----------------|
| Servicio nuevo | getAll (ok + error), create (ok + error) |
| Componente nuevo | renderiza, carga datos, muestra error |
| Formulario | envío válido, validación de campos requeridos |
| RPC | caso válido, caso de rechazo |

## Checklist de calidad antes de cerrar una spec

- [ ] `npm test` pasa sin errores
- [ ] `npm run build` pasa sin errores TypeScript
- [ ] `npx prettier --check src/` sin diferencias
- [ ] No hay `console.log` olvidados
- [ ] No hay `TODO` sin resolver del scope de la spec
- [ ] Todos los `tasks.md` marcados como completados
