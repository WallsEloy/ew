-- Esquema para el CMS del home (Fase 1: carrusel).
-- Correr una vez en el SQL Editor de tu proyecto Supabase.

create table if not exists home_slides (
  id uuid primary key default gen_random_uuid(),
  position int not null default 0,
  title text not null default '',
  logo_text text not null default '',
  button_text text not null default '',
  image text not null default '',
  right_title text not null default '',
  right_text text not null default '',
  right_color text not null default '#00aff0',
  updated_at timestamptz not null default now()
);

create index if not exists home_slides_position_idx on home_slides (position);

-- RLS activo SIN políticas públicas: el cliente con anon key no puede leer/escribir.
-- Todo el acceso pasa por rutas de servidor con la service_role key (que ignora RLS).
alter table home_slides enable row level security;
