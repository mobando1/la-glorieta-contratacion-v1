# La Glorieta - Contratación V1

Aplicación web V1 para estandarizar el proceso de contratación operativa del restaurante “La Glorieta”.

## Objetivo
Registrar todos los aspirantes, estandarizar entrevistas express, aplicar reglas de decisión y guardar historial para reducir errores y rotación.

## Stack objetivo
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite (preparado para migrar a Postgres)

## Alcance V1
- Formulario público de aspirantes (`/aplicar`)
- Panel admin con login (`/admin/*`)
- Lista con filtros, perfil, entrevista express, historial y exportación CSV

## Próximos pasos de implementación
1. Inicializar proyecto Next.js con Tailwind.
2. Configurar Prisma y modelos (Candidate, Interview, AdminUser, AuditLog).
3. Implementar reglas de dominio (scoring/decisión).
4. Construir rutas UI y API internas.
5. Agregar exportación CSV.
6. Añadir pruebas mínimas y documentación final.

## Documentación
- Manual rápido del administrador: `docs/manual-admin.md`
- Checklist Definition of Done: `docs/definition-of-done.md`
- Reglas de dominio: `src/domain/decision.ts`