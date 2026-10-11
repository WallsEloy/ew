# Contexto maestro del repositorio EW

Este archivo es el punto de entrada para recuperar el contexto del proyecto sin
depender del historial de una conversación. La información se organiza por
niveles y cada nivel enlaza al anterior y al siguiente.

## Ruta de lectura

1. [Reglas generales del repositorio](./AGENTS.md)
2. [Contexto general del proyecto](./doc/claude.md)
3. [Índice de documentación técnica](./doc/indice.md)
4. [Mapa de documentos especializados](./doc/documentos/claude.md)
5. [Contexto del flujo de marketing](<./doc/documentos/flujo de marqueting/claude.md>)

## Contextos especializados activos

### Flujo de marketing con React Flow

- [Memoria activa](<./doc/documentos/flujo de marqueting/memoria.md>)
- [Reglas de diseño](<./doc/documentos/flujo de marqueting/reglas.md>)
- [Especificación técnica 09](<./doc/documentos/flujo de marqueting/09_flujo_publicitario_react_flow.md>)
- [Reglas para agentes](<./doc/documentos/flujo de marqueting/AGENTS.md>)

### Proyectos web (área Web de Diseño)

- [Contexto de proyectos web](<./doc/documentos/proyectos web/claude.md>)
- [Acomodo de páginas web](<./doc/documentos/proyectos web/acomodo_paginas_web.md>)

Al trabajar en el flujo, la memoria indica el estado actual, las reglas definen
los contratos obligatorios y la especificación conserva la arquitectura futura.

## Principio de mantenimiento

Cuando se cree una documentación especializada nueva, debe enlazarse desde
`doc/documentos/claude.md` y desde este archivo. Los documentos especializados
deben incluir un enlace de regreso para evitar contextos aislados.

