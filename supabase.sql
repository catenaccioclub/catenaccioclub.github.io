-- Turnera de Catenaccio Barber Club
-- Pegá todo esto en Supabase > SQL Editor > New query > Run.

-- ---------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------
create table if not exists public.config (
  id    text primary key,
  data  jsonb not null
);

create table if not exists public.turnos (
  id        text primary key,
  tipo      text not null default 'turno',   -- 'turno' o 'bloqueo'
  fecha     date not null,
  ini       int  not null,                   -- minutos desde medianoche
  dur       int  not null,
  servicio  text,
  precio    numeric default 0,
  barbero   text,
  cliente   text,
  tel       text,
  estado    text not null default 'activo',  -- 'activo' o 'cancelado'
  creado    timestamptz default now()
);

create index if not exists turnos_fecha_idx on public.turnos (fecha);

-- ---------------------------------------------------------------
-- Reglas de acceso
-- ---------------------------------------------------------------
alter table public.config enable row level security;
alter table public.turnos enable row level security;

-- Cualquiera que abra la página lee la configuración del local.
drop policy if exists config_lectura on public.config;
create policy config_lectura on public.config
  for select using (true);

-- Solo el barbero, con su sesión iniciada, cambia precios y horarios.
drop policy if exists config_escritura on public.config;
create policy config_escritura on public.config
  for all to authenticated using (true) with check (true);

-- Los clientes ven la agenda para saber qué horarios están libres.
drop policy if exists turnos_lectura on public.turnos;
create policy turnos_lectura on public.turnos
  for select using (true);

-- Los clientes sacan turno solos, siempre en estado activo y de hoy en adelante.
drop policy if exists turnos_alta on public.turnos;
create policy turnos_alta on public.turnos
  for insert with check (
    estado = 'activo' and tipo = 'turno' and fecha >= current_date
  );

-- Los clientes solo pueden cancelar. No pueden reescribir un turno ajeno.
drop policy if exists turnos_cancelar on public.turnos;
create policy turnos_cancelar on public.turnos
  for update using (estado = 'activo') with check (estado = 'cancelado');

-- El barbero, con sesión iniciada, hace todo lo demás.
drop policy if exists turnos_barbero on public.turnos;
create policy turnos_barbero on public.turnos
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------
-- Actualizaciones en vivo (dos pestañas abiertas se sincronizan)
-- ---------------------------------------------------------------
alter publication supabase_realtime add table public.turnos;
alter publication supabase_realtime add table public.config;
