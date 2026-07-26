-- Aplicado y verificado en Supabase el 2026-07-19: CMS del carrusel del Home.
-- Nota: originalmente la tabla NO existía en el proyecto (el editor daba
-- "Could not find the table 'public.home_slides'"); se creó con este bloque.
-- Columnas de texto nullable a propósito (evita romper el pegado por comillas);
-- la app siempre escribe valores y convierte null -> "" al leer.
-- Incluye la columna button_color (color del botón por slide).

create table if not exists home_slides (
  id uuid primary key default gen_random_uuid(),
  position int not null default 0,
  title text,
  logo_text text,
  button_text text,
  button_color text,
  image text,
  right_title text,
  right_text text,
  right_color text,
  updated_at timestamptz not null default now()
);

create index if not exists home_slides_position_idx on home_slides (position);

alter table home_slides enable row level security;
