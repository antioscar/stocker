# AGENTS.md — Contexto del proyecto

> Lee esto ANTES de trabajar en el proyecto. Todas las conversaciones con el usuario son en **español**.
> Este archivo lo usa opencode automáticamente, y también sirve para Antigravity y otros agentes de IA.

## Qué es este proyecto

**StockCaja**: sistema de gestión para negocios locales (almacenes/almacenes de barrio). Módulos: ventas (punto de venta), inventario/stock, clientes, usuarios con roles y reportes.

- Es el primer proyecto serio de portafolio del usuario (se titula como **analista programador**).
- Objetivo comercial: venderlo como **licencia única** a almacenes del barrio.
- Modelo de despliegue: **local (on-premise) primero**, migrar a **SaaS en la nube** después.

## Estado actual

- **Fases A, B, C, D y E del plan completadas.** Proyecto funcional end-to-end y subido a GitHub.
- **Backend `server/` FUNCIONA ✅** — `npm run dev` levanta en `:3000`, `npm run build` (tsc) sin errores.
  - Unificado en **CommonJS** (se quitó `"type": "module"` de `server/package.json`).
  - Prisma bajado a **v6** (`@prisma/client` + `prisma` ^6.19.3): el schema usaba formato v5/v6 y Prisma 7 rompía (`file:` y `@prisma/client`).
  - `schema.prisma`: `Decimal @db.Decimal` → `Float` (SQLite no soporta Decimal nativo). Se agregaron **relaciones** (Categoria→Producto, Cliente→Venta, Usuario→Venta/MovimientoStock, etc.) que faltaban.
  - `routes/index.js` reescrito en CJS puro; auth ahora desde `middleware/auth.js` (login, getCurrentUser + authenticateToken). Se eliminó el `routes/auth.js` que faltaba usando el que ya existía.
  - `reportes.js`: quitadas 2 anotaciones TS (`where: any`) que rompían Node.
  - Eliminados duplicados huérfanos: `server.ts`, `server.js`, `middleware/auth.ts`, `routes/productos.ts`, `prisma.config.ts`.
  - `ventas.js`: se agregó generación de **folio correlativo** `BOL-####` en transacción (faltaba). Filtro por `clienteId` en `GET /ventas`.
  - `tsconfig.json`: `moduleResolution: bundler` + `allowJs: true`; `process.env['PORT']` en `index.ts`.
  - **Seed** `server/prisma/seed.js` (script `npm run seed`): crea admin `admin@stockcaja.cl` / `admin123` y config del negocio.
  - BD SQLite creada en `server/prisma/dev.db` con migraciones `init` y `add_relations`.
  - Probado end-to-end: login, CRUDs, venta transaccional con folio y descuento de stock, anulación con devolución de stock. Todo OK.
- **Frontend `web/` FUNCIONA ✅** — `npm run dev` levanta en `:5173`, `npm run build` sin errores, `tsc --noEmit` limpio.
  - ✅ Creada infra Vite: `index.html`, `src/main.tsx`, `App.tsx`, `index.css`, `vite.config.ts` (proxy `/api` → `:3000`), `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`.
  - ✅ Reescribidas desde cero las 5 páginas corruptas: `Clientes.tsx` (CRUD + historial de ventas), `Productos.tsx` (CRUD + categorías + búsqueda), `Usuarios.tsx` (CRUD + roles, solo ADMIN), `Reportes.tsx` (KPIs + ventas por día + más vendidos + stock bajo), `Configuracion.tsx` (negocio + folio, solo ADMIN).
  - ✅ Creado `Dashboard.tsx` (resumen del día + accesos rápidos).
  - ✅ `routes.tsx` con rutas reales a todas las páginas. `Layout.tsx` reescrito con `Outlet`, `NavLink`, logout real y control por rol.
  - ✅ `services/api.ts` (helper fetch con token). Corregido import de tipos en `services/auth.ts` y `hooks/useAuth.tsx` (renombrado de `.ts` a `.tsx` porque usa JSX; ahora `login()` carga el usuario completo desde `/auth/me`).
  - ✅ Limpiado `web/package.json` (se quitaron deps muertas: redux, axios, react-redux). Corregidos imports sin usar (Cart, POS, Login).
  - ✅ `web/README.md` reescrito (estaba con `\n` literales).
  - ⚠️ Pendiente menor: el POS muestra IVA 19% en el carrito pero el backend guarda sin IVA (decisión de negocio pendiente, ver CONTEXTO).
- **Git/GitHub:** ✅ **Repo subido a `https://github.com/antioscar/stocker`** (rama `main`). `.gitignore` raíz creado; `server/.env` con `JWT_SECRET` NO subido (verificado en el árbol remoto; solo `.env.example`).
- **Plan:** A ✅ B ✅ C ✅ D ✅ **E ✅ (completo)** — contexto actualizado, `git init` + `push` a `antioscar/stocker` realizado. Proyecto funcional end-to-end.

## Componentes Frontend Completados

✅ **Login** (`web/src/pages/Login.tsx`)
- Autenticación JWT con roles (ADMIN/CAJERO)
- Validación de formulario con email/password

✅ **Productos** (`web/src/pages/Productos.tsx`)
- CRUD completo con búsqueda y paginación
- Validación de stock y manejo de inventario
- Modo edición inline

✅ **Clientes** (`web/src/pages/Clientes.tsx`)
- CRUD completo con historial de ventas
- Validación de formularios
- Tabla responsive

✅ **Usuarios** (`web/src/pages/Usuarios.tsx`)
- CRUD completo con gestión de roles
- Protección ADMIN para usuarios
- Validación de formularios
- Control de estado (activo/inactivo)

✅ **Reportes** (`web/src/pages/Reportes.tsx`)
- Dashboard con KPIs en tiempo real
- Gráficos de ventas e ingresos
- Filtrado por fecha
- Tabla de productos más vendidos

✅ **Configuración** (`web/src/pages/Configuracion.tsx`)
- Configuración del negocio (nombre, RUT, dirección)
- Configuración de folio
- Modo edición
- Visualización de datos

✅ **POS** (`web/src/pages/POS.tsx`)
- Punto de venta con carrito de compras
- Gestión de inventario
- Descuentos y totales
- Generación de tickets

✅ **Layout y AuthProvider** (`web/src/components/Layout.tsx`, `web/src/contexts/AuthContext.tsx`)
- Menú de navegación
- Rutas protegidas
- Control de roles
- Provisión de autenticación

## Stack (decidido)

| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express + TypeScript |
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| ORM | Prisma |
| BD v1 | SQLite (archivo único, cero config, ideal on-premise) |
| BD v2 | PostgreSQL (cuando se migre a nube/SaaS) |
| Auth | JWT — roles: `ADMIN` y `CAJERO` |
| Tests | Vitest + Supertest |
| Lint | ESLint |

## Estructura del repo (planificada)

```
sinnombre1/
  AGENTS.md            ← este archivo
  docs/CONTEXTO.md     ← plan y decisiones detalladas
  server/
    prisma/schema.prisma
    src/
      index.ts
      routes/
      middleware/ (auth, validación)
      utils/
  web/
    src/
      pages/ (Login, Dashboard, POS, Inventario, Reportes, Configuración...)
      components/
      api/
  README.md            ← manual de instalación + arquitectura
```

## Decisiones clave (no cambiar sin consultar)

1. **Diseño multi-tenant-ready**: aunque v1 sea un solo negocio, la configuración del negocio va en tabla propia (`Configuracion`) para que v2 (SaaS) solo agregue `negocioId`.
2. **Folio correlativo** `BOL-####` único por negocio, generado en transacción. Nunca se reutiliza, ni al anular una venta.
3. **Stock nunca negativo**: una venta descuenta stock y crea `MovimientoStock` (auditoría completa de inventario).
4. **Permisos**: solo `ADMIN` gestiona usuarios, configuración, anular ventas y ajustes de stock. `CAJERO` vende y ve inventario.
5. **Facturación v1**: venta simple con folio interno. **NO se integra SII por ahora.**

## Roadmap futuro (contexto; NO implementar aún)

- **v2: Boleta/factura electrónica SII** (LibreDTE o Mifactura, certificado digital, timbre) — guardado como prioridad.
- **v2: SaaS multi-tenant** (PostgreSQL + hosting + login por negocio).
- Impresión térmica (ESC/POS), reportes avanzados, multi-sucursal.

## Convenciones

- Interfaz de usuario siempre en **español**.
- TypeScript estricto. Backend y frontend en el mismo repo (carpetas `server/` y `web/`).
- Usar Prisma para todo acceso a BD (no SQL crudo salvo casos especiales).
- No agregar comentarios al código salvo que se pidan.
- Cada sesión: revisar este archivo y `docs/CONTEXTO.md` antes de continuar.
- Al terminar una sesión: actualizar la sección "Estado actual" y el registro de sesiones en `docs/CONTEXTO.md`.

## Protocolo de continuidad (IMPORTANTE)

El agente NO puede medir el porcentaje de contexto restante. Para no perder avance, se usa este protocolo de **checkpoints**: en cada uno, actualizar `AGENTS.md` (Estado actual) y `docs/CONTEXTO.md` (plan, decisiones, registro de sesiones).

**Checkpoints obligatorios (ejecutar sin que el usuario lo pida):**
1. Al **terminar cualquier tarea o fase completa**.
2. Antes de una tarea larga o arriesgada (migraciones, refactors, instalaciones).
3. Cuando la conversación lleve **muchos mensajes/tool calls** (señal de contexto agotándose).
4. Cuando el usuario indique que **cambiará de ventana, laptop o a Antigravity**.
5. Siempre que el usuario **cambie el plan o tome una decisión nueva**.

**En cada checkpoint actualizar:**
- `AGENTS.md` → "Estado actual": qué se hizo, qué fase va, próximo paso.
- `docs/CONTEXTO.md` → plan de fases (marcar estados), decisiones nuevas, "Registro de sesiones" con fecha y resumen.

**Regla de oro:** antes de responder algo que pueda cerrar la sesión, verificar que estos archivos reflejen el estado real del código (archivos creados, comandos usados, pendientes).

## Comandos (una vez exista el código)

- `server/`: `npm run dev` (arranca API en localhost) · `npx prisma migrate dev` (migraciones) · `npm test` (Vitest/Supertest)
- `web/`: `npm run dev` (frontend)
- El usuario puede continuar en opencode desde otra ventana o desde su laptop (mismo repo, estos archivos viajan con él). También se usa Antigravity a veces: este `AGENTS.md` es el punto de partida.
