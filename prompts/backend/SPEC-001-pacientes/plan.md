# Plan — Backend — SPEC-001-pacientes

## Decisiones de implementación

### ¿Observables o Promesas?

**Decisión: Promesas (async/await)**

El proyecto entero usa promesas en los servicios. Mantener la consistencia.

### ¿`getAll()` o `getAllAdmin()` para distinguir admin de público?

**Decisión: `getAll()` para admin (sin sufijo)**

La tabla `pacientes` no tiene acceso público (RLS lo bloquea). Por tanto, cualquier método que devuelva datos ya implica que el usuario está autenticado. No hace falta distinguir con sufijo `Admin`.

### ¿Soft delete o hard delete?

**Decisión: el servicio provee `delete()` como hard delete, pero la UI solo lo permite cuando `estado === 'archivado'`**

La lógica de negocio ("solo archivar, no borrar directamente") vive en el componente, no en el servicio. El servicio es agnóstico: si te mandan borrar, borra. El componente decide cuándo está permitido.

### ¿Separar `updateEstado` de `update`?

**Decisión: sí, método separado**

`updateEstado(id, estado)` es una operación frecuente y semántica. Tener un método explícito facilita el testing y la lectura del código.

## Patrón de implementación

```typescript
@Injectable({ providedIn: 'root' })
export class PacientesService {
  async getAll(): Promise<Paciente[]> {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Paciente[];
  }

  async create(input: PacienteInput): Promise<Paciente> {
    const { data, error } = await supabase
      .from('pacientes')
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as Paciente;
  }
  // ...
}
```

## Dependencias de esta capa

- Requiere que la tabla `pacientes` exista en Supabase (capa database: T001-DB-02)
- El componente que usa el servicio se crea en capa frontend
