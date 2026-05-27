# SPEC-001 — Gestión de Pacientes (Backend)

## Resumen

Crear el servicio Angular `PacientesService` que encapsula todas las operaciones CRUD sobre la tabla `pacientes` de Supabase.

No se necesita Netlify Function para esta spec (no hay envío de emails ni operaciones que requieran el servidor).

## Servicio: `PacientesService`

**Ubicación:** `src/app/core/services/pacientes.service.ts`

### Interfaces exportadas

```typescript
export type PacienteEstado = 'activo' | 'inactivo' | 'archivado';

export interface Paciente {
  id: string;
  nombre: string;
  apellidos: string;
  email: string | null;
  telefono: string;
  fecha_nacimiento: string | null;
  notas: string | null;
  estado: PacienteEstado;
  created_at: string;
  updated_at: string;
}

export type PacienteInput = Omit<Paciente, 'id' | 'created_at' | 'updated_at'>;
```

### Métodos del servicio

| Método | Descripción | Tabla Supabase |
|--------|-------------|----------------|
| `getAll()` | Todos los pacientes (admin), sin filtro de estado | `pacientes` SELECT |
| `getActivos()` | Solo pacientes activos | `pacientes` SELECT + eq('estado', 'activo') |
| `getById(id)` | Un paciente por ID | `pacientes` SELECT + single() |
| `create(data)` | Crear nuevo paciente | `pacientes` INSERT |
| `update(id, data)` | Actualizar datos | `pacientes` UPDATE |
| `updateEstado(id, estado)` | Cambiar estado | `pacientes` UPDATE (solo campo estado) |
| `delete(id)` | Borrado físico (solo cuando estado = archivado) | `pacientes` DELETE |

### Firma de métodos

```typescript
async getAll(): Promise<Paciente[]>
async getActivos(): Promise<Paciente[]>
async getById(id: string): Promise<Paciente>
async create(data: PacienteInput): Promise<Paciente>
async update(id: string, data: Partial<PacienteInput>): Promise<Paciente>
async updateEstado(id: string, estado: PacienteEstado): Promise<Paciente>
async delete(id: string): Promise<void>
```

## Notas de implementación

- Todas las queries usan `await supabase.from('pacientes')...`
- Si Supabase devuelve error, lanzar con `if (error) throw error`
- `getAll()` ordena por `created_at DESC` para mostrar los más recientes primero
- `delete()` solo debe llamarse cuando `estado === 'archivado'` (el componente es responsable de esta lógica de UI)
