-- Ajustes del sitio como documentos jsonb (clave -> valor).
-- Usado por el editor de Navegadores (key = 'navbar').
create table if not exists site_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;
