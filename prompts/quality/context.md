# Context — Quality Layer

## Propósito

La capa de quality garantiza que el código funciona como se especificó, define la estrategia de tests y establece los criterios de aceptación verificables.

## Herramientas de testing

| Herramienta | Versión | Uso |
|-------------|---------|-----|
| Vitest | ^4.0.8 | Test runner principal |
| jsdom | ^28.0.0 | Simulación de DOM en Node |
| Angular TestBed | (incluido en Angular) | Tests de componentes Angular |

## Tipos de tests en este proyecto

### Unit tests (servicios)
Testear métodos del servicio mockeando el cliente Supabase.
```
src/app/core/services/{nombre}.service.spec.ts
```

### Component tests (componentes Angular)
Testear el comportamiento del componente con TestBed.
```
src/app/features/{feature}/{componente}.spec.ts
```

### Integration tests (flujos)
Testear un flujo completo (formulario → servicio → respuesta).
Solo para flujos críticos de negocio.

## Estado actual de tests

- **0 tests escritos** en el proyecto actualmente
- Vitest está instalado y configurado (`tsconfig.spec.json` presente)
- La primera spec es una oportunidad para establecer el patrón

## Configuración de Vitest

Configurado via Angular CLI (`ng test`).
El fichero `tsconfig.spec.json` ya existe.

## Criterios de calidad mínimos

Para que una spec se considere "completa":
- [ ] Happy path del servicio principal testado
- [ ] Caso de error del servicio principal testado
- [ ] Componente principal renderiza sin errores
- [ ] El formulario (si existe) valida y muestra errores correctamente
- [ ] `ng build` sin errores TypeScript
- [ ] Prettier aplicado (`npx prettier --check src/`)
