-- Añade el color del botón por slide del carrusel del home.
-- Vacío ('') = usar el color por defecto del tema (amarillo del carrusel).
-- Aplicar en el SQL Editor de Supabase (proyecto del portafolio EW).
alter table if exists home_slides
  add column if not exists button_color text not null default '';
