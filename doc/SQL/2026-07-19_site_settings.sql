-- Ajustes del sitio como documentos jsonb (clave -> valor).
-- Usado por el editor de Navegadores del dashboard (key = 'navbar').
-- value nullable a propósito (sin default de cadena) para no romper el pegado.
-- Aplicar en el SQL Editor de Supabase (proyecto del portafolio EW).
create table if not exists site_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;
