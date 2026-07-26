-- Añade el color del botón por slide del carrusel del home.
-- Vacío ('') = usar el color por defecto del tema (amarillo del carrusel).
alter table if exists home_slides
  add column if not exists button_color text not null default '';
