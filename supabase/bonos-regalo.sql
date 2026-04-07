create table if not exists bonos_regalo (
  id uuid default gen_random_uuid() primary key,
  codigo text unique not null,
  tarifa_id uuid references tarifas(id),
  nombre_servicio text not null,
  precio numeric not null,
  nombre_comprador text not null,
  email_comprador text not null,
  mensaje_personal text,
  estado text default 'pendiente_pago'
    check (estado in (
      'pendiente_pago',
      'pagado',
      'enviado',
      'canjeado'
    )),
  metodo_pago text check (metodo_pago in (
    'bizum',
    'transferencia',
    'efectivo'
  )),
  fecha_compra timestamptz default now(),
  fecha_canje timestamptz,
  created_at timestamptz default now()
);

create table if not exists configuracion (
  id uuid default gen_random_uuid() primary key,
  clave text unique not null,
  valor text not null,
  descripcion text,
  updated_at timestamptz default now()
);

insert into configuracion (clave, valor, descripcion)
values ('bonos_regalo_activo', 'false', 'Activa o desactiva la funcionalidad de bonos regalo en la web')
on conflict (clave) do nothing;

alter table bonos_regalo enable row level security;

drop policy if exists "Lectura pública bonos por código" on bonos_regalo;
create policy "Lectura pública bonos por código"
  on bonos_regalo for select using (true);

drop policy if exists "Solo admin escribe bonos" on bonos_regalo;
create policy "Solo admin escribe bonos"
  on bonos_regalo for all using (auth.role() = 'authenticated');

alter table configuracion enable row level security;

drop policy if exists "Lectura pública configuracion" on configuracion;
create policy "Lectura pública configuracion"
  on configuracion for select using (true);

drop policy if exists "Solo admin escribe configuracion" on configuracion;
create policy "Solo admin escribe configuracion"
  on configuracion for all using (auth.role() = 'authenticated');
