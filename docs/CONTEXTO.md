# CONTEXTO.md — Plan y decisiones de StockCaja

> Documento de referencia del proyecto. Se revisa al inicio de cada sesión (junto con `../AGENTS.md`).
> Mantener actualizado: decisiones, plan, avance y roadmap.

## 1. Resumen

Sistema de gestión para almacenes/negocios locales: **punto de venta, inventario, clientes, usuarios con roles y reportes**.

- Objetivos: (a) primer proyecto serio de portafolio, (b) producto vendible como **licencia única** a almacenes del barrio.
- Despliegue: **local (on-premise) primero**, luego **SaaS en la nube**.
- Facturación v1: venta simple con folio interno. **Boleta/factura electrónica SII es v2 (roadmap).**

## 2. Decisiones tomadas (fecha: 31/07/2026)

| # | Decisión | Detalle |
|---|---|---|
| 1 | Nombre | **StockCaja** (cambiable) |
| 2 | Stack | Node/Express/TS + React/Vite/TS/Tailwind + Prisma |
| 3 | BD v1 | **SQLite** (archivo único, cero config, backup trivial, ideal on-premise) |
| 4 | BD v2 | **PostgreSQL** cuando se migre a SaaS (migración casi transparente gracias a Prisma) |
| 5 | Despliegue | Local primero, luego nube (multi-tenant-ready desde el diseño) |
| 6 | Facturación | Venta simple con folio interno `BOL-####`. SII solo en v2 |
| 7 | Precio | Licencia única |
| 8 | Roles | `ADMIN` (todo) y `CAJERO` (vender + ver inventario) |
| 9 | Folio | Correlativo único por negocio, generado en transacción, nunca reutilizable |
| 10 | Stock | Nunca negativo; todo movimiento queda auditado en `MovimientoStock` |

## 3. Modelo de datos (ER)

```
Usuario(id, nombre, email, passwordHash, rol[ADMIN|CAJERO], activo, createdAt)
Categoria(id, nombre)
Producto(id, nombre, codigoBarras, categoriaId, precioVenta, precioCosto, stock, stockMinimo, unidad, activo, createdAt)
Cliente(id, nombre, telefono, email, direccion, createdAt)
Venta(id, folio "BOL-####", clienteId?, usuarioId, subtotal, descuento, total, metodoPago, anulada, createdAt)
VentaDetalle(id, ventaId, productoId, cantidad, precioUnitario, subtotal)
MovimientoStock(id, productoId, tipo[ENTRADA|SALIDA|AJUSTE], cantidad, motivo, usuarioId, createdAt)
Configuracion(key PK, value)  ← nombre negocio, dirección, logo, folio correlativo actual, etc.
```

Reglas clave:
- Una venta descuenta stock **dentro de una transacción** y genera `MovimientoStock` (tipo `SALIDA`).
- Anular una venta no reutiliza el folio: crea movimiento de stock tipo `ENTRADA` (devolución) y marca `Venta.anulada = true`.
- Ajustes de stock (inventario inicial, mermas) → `MovimientoStock` tipo `AJUSTE` (solo ADMIN).
- Folio correlativo guardado en `Configuracion`, incrementado dentro de la misma transacción de la venta (evita duplicados/colisiones).

## 4. API (endpoints planificados)

```
POST /api/auth/login           → { token, usuario }
GET  /api/auth/me

CRUD /api/categorias           (admin crea/edita; todos pueden listar)
CRUD /api/productos
CRUD /api/clientes
CRUD /api/usuarios             (solo ADMIN)

POST /api/ventas               (transaccional: valida stock, folio, descuenta, genera movimientos)
GET  /api/ventas?desde&hasta   (historial)
GET  /api/ventas/:id           (detalle con ítems)
POST /api/ventas/:id/anular    (solo ADMIN)

POST /api/movimientos          (ENTRADA / SALIDA / AJUSTE de stock, solo ADMIN salvo ventas)

GET  /api/reportes/resumen                     (ventas hoy, semana, mes; tickets; totales)
GET  /api/reportes/productos-mas-vendidos
GET  /api/reportes/stock-bajo

GET/PUT /api/configuracion     (nombre negocio, dirección, logo, folio...)
GET  /api/backup               (descargar copia del archivo SQLite)
```

Auth: JWT en `Authorization: Bearer <token>`. Middleware de rol: `requireAuth` y `requireAdmin`.

## 5. Frontend (pantallas planificadas)

- `Login`
- `Dashboard` — resumen del día (ventas, tickets, total), accesos rápidos, gráfico sencillo
- `Punto de Venta (POS)` — buscador de productos, carrito, cliente opcional, descuento, método de pago, cobrar, ticket imprimible
- `Inventario` — listado con stock y **alerta de stock bajo**, botón ajuste de stock
- `Productos` y `Categorías` — CRUD con modales
- `Clientes` — CRUD
- `Usuarios` — CRUD (solo ADMIN)
- `Ventas` — historial, ver detalle, anular (solo ADMIN)
- `Reportes` — productos más vendidos, stock bajo (gráficos con Recharts o similar)
- `Configuración` — datos del negocio, logo, folio (solo ADMIN)

## 6. Plan de fases

| Fase | Entregable | Estado |
|---|---|---|
| 0 | Setup repo: `server/` + `web/`, Prisma + SQLite, git | ✅ Completado |
| 1 | Modelo de datos, migraciones, seed (categorías/productos demo) | ✅ Completado |
| 2 | Backend: auth JWT + roles + CRUD base (categorías, productos, clientes, usuarios) | ✅ Completado |
| 3 | Backend: ventas transaccionales + folio + movimientos de stock | ✅ Completado |
| 4 | Backend: reportes + configuración + backup | ✅ Completado |
| 5 | Frontend: login, layout, dashboard | ✅ Completado |
| 6 | Frontend: punto de venta (POS) | ✅ Completado (POS funcional; pendiente decisión IVA) |
| 7 | Frontend: módulos de administración (productos, categorías, clientes, usuarios, inventario) | ✅ Completado (Productos, Clientes, Usuarios) |
| 8 | Frontend: reportes + configuración | ✅ Completado |
| 9 | Calidad: tests API (Vitest + Supertest), ESLint, validaciones | ⏳ Pendiente (existe `eslint.config.js` en server; sin tests aún) |
| 10 | Empaquetado on-premise + README (manual instalación) + material portafolio | Pendiente |

## 7. Roadmap futuro (NO implementar aún)

- **Fase 1 (Corto Plazo) - Operación Diaria Express:** Escaneo de código de barras en segundo plano sin modales, control y arqueo de caja (apertura/cierres de turnos), layout de ticket térmico ESC/POS (58mm/80mm), y reporte de utilidad bruta (Precio Venta - Precio Costo).
- **Fase 2 (Mediano Plazo) - Localización Chile:** Desglose del IVA (19%) en el backend y base de datos, boleta/factura electrónica SII integrada (LibreDTE o Mifactura, certificado digital, timbre).
- **Fase 3 (Largo Plazo) - Modernización:** Interfaz premium, atajos de teclado globales en POS, integración directa con terminales SumUp/Redelcom y migración SaaS multi-tenant (PostgreSQL).

## 8. Registro de sesiones

### 31/07/2026 — Planificación (sesión 1)
- Se definió el proyecto (opción 2: sistema de gestión para negocios locales).
- Se decidieron stack, BD v1/v2, modelo de despliegue, roles, folio, facturación simple y modelo de venta (licencia única).
- Se crearon `AGENTS.md` y este `CONTEXTO.md` para continuar en otra ventana/laptop o en Antigravity.
- **Pendiente:** iniciar Fase 0 (setup del repo).

### 31/07/2026 — Inicio de desarrollo (sesión 2)
- Se creó la estructura del proyecto (`server/` + `web/`, `README.md`).
- Se inicializaron repositorios, se crearon carpetas base y se empezó la **Fase 0** (setup del repo).
- **Pendiente:** empezar Fase 1 (modelo de datos + migraciones).

### 31/07/2026 — Backend mínimo funcional (sesión 4)
- **Fase A completada.** Backend `server/` arranca (`npm run dev` → `:3000`) y `npm run build` pasa sin errores.
- Unificado en **CommonJS** (se quitó `"type": "module"`); `routes/index.js` reescrito en CJS puro, auth desde `middleware/auth.js`.
- Prisma **bajado de v7 a v6** (`@prisma/client` + `prisma` ^6.19.3): el schema era formato v5/v6; Prisma 7 rompía `file:` y `@prisma/client`. Se eliminó `prisma.config.ts` (solo v7).
- `schema.prisma`: `Decimal @db.Decimal` → `Float` (SQLite no soporta Decimal) y se **agregaron las relaciones faltantes** (Categoria, Producto, Cliente, Usuario, Venta, VentaDetalle, MovimientoStock).
- `reportes.js`: quitadas 2 anotaciones TS; `ventas.js`: agregada generación de folio `BOL-####` en transacción. Eliminados duplicados `server.ts`, `server.js`, `middleware/auth.ts`, `routes/productos.ts`.
- `tsconfig.json`: `moduleResolution: bundler` + `allowJs: true`; `index.ts`: `process.env['PORT']`.
- Seed creado (`npm run seed`): admin `admin@stockcaja.cl` / `admin123` + config negocio. BD SQLite en `server/prisma/dev.db` con migraciones `init` y `add_relations`.
- **Probado end-to-end:** login, CRUDs, venta transaccional con folio y descuento de stock, anulación con devolución de stock. Todo OK.
- **Próximo paso:** Fase B — reescribir páginas frontend corruptas + crear `Dashboard.tsx`.

### 31/07/2026 — Frontend completo (sesión 5)
- **Fases B, C y D completadas.** Frontend `web/` funcional: `npm run dev` en `:5173`, `npm run build` OK, `tsc --noEmit` limpio.
- Creada infra Vite: `index.html`, `src/main.tsx`, `App.tsx`, `index.css`, `vite.config.ts` (proxy `/api` → `:3000`), `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`.
- Pages: `Clientes.tsx`, `Productos.tsx`, `Usuarios.tsx`, `Reportes.tsx`, `Configuracion.tsx` corregidas y funcionales.
- Creado `Dashboard.tsx` (resumen del día + accesos rápidos). `routes.tsx` con rutas reales; `Layout.tsx` reescrito con `Outlet`, `NavLink`, logout real y control por rol.
- `services/api.ts` (helper fetch con token). `hooks/useAuth.ts` renombrado a `.tsx` (usa JSX) y `login()` ahora carga el usuario completo desde `/auth/me`. Deps muertas eliminadas del `web/package.json` (redux, axios, react-redux). `web/README.md` reescrito.
- Backend: agregado filtro `clienteId` en `GET /ventas` (historial de clientes).
- **Fase E completada:** Repo subido a GitHub en `antioscar/stocker`.

### 31/07/2026 — Habilitación de Entorno y Análisis de Mercado (Sesión Actual)
- **Habilitación de CORS:** Se añadió soporte CORS en backend (`index.ts`) y se ajustaron las peticiones de autenticación a relativas `/api` para correcto ruteo del proxy en Vite.
- **Redirección de Login:** Se solucionó el problema de redirección en `Login.tsx` y se normalizó la validación en `Layout.tsx`.
- **Análisis de Mercado:** Se creó e integró el plan detallado para el ecosistema chileno en [analisis_mercado_plan.md](file:///c:/Users/oscar/Desktop/Proyectos/sinnombre1/docs/analisis_mercado_plan.md), definiendo las tres nuevas fases de desarrollo local.
