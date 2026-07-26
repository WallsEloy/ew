-- Esquema para el CMS del home (Fase 1: carrusel).
-- Correr una vez en el SQL Editor de tu proyecto Supabase.

-- Columnas de texto nullable (sin default de cadena) a propósito: evita
-- problemas de comillas al pegar el SQL, y la app siempre escribe valores y
-- convierte null -> "" al leer (ver lib/supabaseServer.js rowToSlide).
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

-- RLS activo SIN políticas públicas: el cliente con anon key no puede leer/escribir.
-- Todo el acceso pasa por rutas de servidor con la service_role key (que ignora RLS).
alter table home_slides enable row level security;

-- Ajustes del sitio como documentos jsonb (clave -> valor). Usado por el editor
-- de Navegadores (key = 'navbar') y por Área dos / grafos (key = 'graphs').
-- value nullable a propósito (sin default de cadena para no romper el pegado);
-- la app siempre escribe el valor.
create table if not exists site_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;
