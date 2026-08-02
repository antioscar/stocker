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
| 9 | Calidad: tests API (Vitest + Supertest), ESLint, validaciones | ✅ Completado (58 tests, 0 fallos) |
| 10 | Empaquetado on-premise + README (manual instalación) + material portafolio | ✅ Completado (README, ARQUITECTURA.md, GUIA_USUARIO.md) |

### 6b. Rediseño de identidad visual — Impeccable (reemplaza la antigua "Fase 3 rediseño anterior")

| Fase | Entregable | Estado |
|---|---|---|
| A | Instalar Impeccable + `PRODUCT.md` + `docs/guia_mercado_pos_chile.md` | ✅ Completado |
| B/C | `concept-seed` → dirección **"Fichas del almacén"** (índice 7, aprobada por el usuario) + playbooks leídos | ✅ Completado |
| D | Design tokens (`tailwind.config.js`) + componentes base (`index.css`: ficha, pestana, nav-tab, btn, input, sello, tabla, pauta-fila) | ✅ Completado |
| E | Rediseño de todas las páginas: Layout, Login, Dashboard, POS+Cart+CajaModal+ProductSearch, Productos, Clientes, Usuarios, Reportes, Configuración | ✅ Completado |
| F | Calidad: detector Impeccable 0 findings, `tsc --noEmit`, eslint 0 errores, build OK | ✅ Completado |
| G | `DESIGN.md` final (documento de sistema de diseño) | ✅ Completado |
| H | `ROADMAP.md` + `ANALISIS_MERCADO_2026.md` (documentación estratégica) | ✅ Completado |

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

### 31/07/2026 — Habilitación de Entorno, Análisis de Mercado, Fase 1 y Fase 3 (Sesión Actual)
- **Habilitación de CORS y Login:** Corregido CORS en el servidor y redirección al autenticarse en el frontend.
- **Análisis de Mercado:** Planificado el roadmap chileno en `docs/analisis_mercado_plan.md`.
- **Fase 1 Completada:** Modelado e implementación de Turnos de Caja (Apertura/Cierre/Movimientos manuales), persistencia del buscador del POS con lectura continua de códigos de barras, corrección tributaria del IVA chileno y reportes de Utilidad Bruta.
- **Teclado Rápido POS:** Implementado control total del Punto de Venta mediante atajos de teclado globales (F1-F4, F8-F9, F12) y panel de referencia para el cajero.
- **Fase 3 Completada (Rediseño Visual Caja de Negocio):** Implementada una interfaz auténtica de terminal de venta industrial y retail mate (Retail Matte). Se removieron brillos falsos de neón y transparencias de cristal. Se aplicaron fondos gris oscuro pizarra sólido, bordes definidos de alto contraste, tipografía monoespaciada tipo visor LED para precios/totales, botones físicos de bloque, y un visor de boleta en papel térmico blanco hueso.
- **Rediseño POS Light Mode Clásico:** Se modificó la vista POS para aislarla en pantalla completa (Fullscreen) e implementar un diseño clásico, blanco (#F8F9FA), realista, plano y sin tipografía monoespaciada, inspirado en ERPs tradicionales (Bootstrap/Material), maximizando la usabilidad de escaneo.
- **TypeScript:** Verificación estricta ejecutada y validada con cero errores de compilación.

### 31/07/2026 — Rediseño Impeccable iniciado (Sesión Actual)
- **Herramienta Impeccable instalada:** `npx impeccable install --providers=opencode --scope=project` → `.opencode/skills/impeccable/` (23 comandos + detector determinista). Añadidos patrones efímeros de `.impeccable/` al `.gitignore`.
- **PRODUCT.md creado** (raíz): entrevista `init` confirmada con el usuario. Contexto clave:
  - Usuarios: **cajero** (mostrador, velocidad) y **dueño/ADMIN** (reportes/visibilidad).
  - Posicionamiento: **"Visibilidad para el dueño"** — ganancia real (utilidad bruta), stock y cuadre de caja entendibles sin contador.
  - Marca: **StockCaja, tono serio** (sin estética de terminal/LED).
  - Preservar: **solo reglas de negocio críticas** (roles, folio BOL-####, stock nunca negativo, caja/turnos); términos de UI libres.
- **`docs/guia_mercado_pos_chile.md` creado:** análisis de competencia chilena (Super Cajero, El Almacén, Almasend, GranLoop, DUOPOS, Bsale, Loyverse, Rofex) → rumbo visual "claro y moderno" evitando los polos "ERP denso" y "plantilla SaaS genérica".
- **Pendiente:** Fase C (dirección visual con concept-seed + DESIGN.md línea base), Fase D (tokens + componentes), Fase E (rediseño de páginas), Fase F (detector 0 findings + DESIGN.md final).

### 31/07/2026 — Rediseño Impeccable: Fases D/E/F completadas (Sesión Actual)
- **Fase D — Sistema de diseño "Fichas del almacén":**
  - `web/tailwind.config.js` reescrito: paleta `papel` (#EDE5CF), `card` (#F7F1DF), `papelAlto`, `pauta`/`pautaOscura`, `tinta`/`tintaSuave`/`tintaTenue` (#8A8270), `grafito`, `oferta` (rojo), `hoja` (verde), `sello` (ámbar). Tipografías `ui`/`display` (serif Georgia)/`ledger` (Courier). Sombras `card`/`lift`, `tracking-sello`, `rounded-ficha`.
  - `web/src/index.css`: base (bg manila con grano SVG, selección roja) + componentes `ficha`, `ficha-pestana` (+variantes hoja/grafito/sello), `nav-tab` (clip-path punta), `btn`/`btn-primario`/`btn-hoja`/`btn-grafito`/`btn-papel`, `input`, `select`, `etiqueta`, `sello` (+ok/alerta/gris/oro), `tabla`, `pauta-fila`, `tachado-oferta`.
- **Fase E — Páginas rediseñadas** (solo estética; lógica preservada): `Layout.tsx` (sticky header grafito + logo tab SC + nav de fichas con pestaña), `Login`, `Dashboard` (KPIs + accesos rápidos con pestanas), `POS` (pantalla completa manila, carrito con pestana roja, total ledger, búsqueda con dropdown, métodos de pago, estado caja cerrada), `Cart`, `CajaModal` (resumen de arqueo tipo ledger con pauta), `ProductSearch`, `Productos`, `Clientes` (+historial), `Usuarios`, `Reportes` (KPIs, barras por día, top ventas, stock bajo), `Configuración`. Todos los spinners cambiados a `border-2 border-pauta border-b-oferta` (sin findings del detector).
- **Reparación de lint del repo (preexistente):** instalados `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin` (^8.8.0) y `eslint-config-prettier` (^9.1.0); creado `web/.eslintignore` (dist + config files). Tipado: `apiFetch<T = unknown>` y call sites tipados (`/caja/estado`), `CajaSessionData` exportado en `types`, `utilidadBruta`/`totalCosto` agregados a `ResumenReportes.resumen`, `Configuracion.value`/`ConfigUpdate` → `unknown`, `catch` sin binding en POS. `eslint .` → **0 errores** (solo warnings preexistentes de return types).
- **Fase F — Calidad:** `tsc --noEmit` limpio, `npm run build` OK (CSS 31.5 kB), **detector Impeccable 0 findings** (`detect.mjs --json web/src web/src/index.css` → `[]`).
- **Pendiente:** Fase G — escribir `DESIGN.md` final del sistema de diseño; revisar visualmente en el navegador (`npm run dev` en `web/`, API en `server/`).

### 31/07/2026 — Rediseño Impeccable: Fase G completada (Sesión Actual)
- **`DESIGN.md` escrito** en la raíz del proyecto (formato spec oficial de design.md): frontmatter YAML con tokens normativos (`colors` 13, `typography` display/body/label, `rounded.ficha` 8px, `spacing` xs/sm/md/lg, `components` button-primary/-hover/secondary/ghost/input/card con refs `{colors.*}`/`{rounded.ficha}`) + 8 secciones canónicas en orden (Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts). North Star: **"El Fichero del Almacén"**. Reglas nombradas: Único Rojo, Pauta, Tipo Escrito a Máquina, Papel Apilado.
- **Sidecar `.impeccable/design.json`** (schemaVersion 2) generado junto a DESIGN.md: `extensions.colorMeta` con 13 colores (tonalRamps de 8 pasos sintetizados en OKLCH-hsl), `typographyMeta`, `shadows` (card/lift), `motion`, `breakpoints`; 9 componentes autocontenidos HTML/CSS (botones primario/grafito/papel/hoja, input, sello alerta, ficha, nav-tab, ficha-pestana) con clases `ds-*` y estados hover/focus/active; `narrative` extraída verbatim del DESIGN.md.
- Se verificó que los valores del DESIGN.md coinciden con `web/tailwind.config.js` (padings de botón ajustados a 8px 16px para ser normativos con `.btn`).
- Frontmatter YAML validado por parsing propio: 13 colores, 5 grupos de tokens presentes, refs resolubles.
- **Pendiente:** revisión visual en el navegador (manual) — API `server/` en `:3000`, frontend `web/` en `:5173`; usuario demo `admin@stockcaja.cl` / `admin123`.
- **CAMBIO DE TEMA — decisión usuario 31/07:** el papel manila se descartó → **tema claro fresco**. Paleta nueva: fondo `papel #F2F4F7` (gris frío), tarjetas `card #FFFFFF`, `papelAlto #F8FAFC`, `pauta #E4E7EB`, `pautaOscura #CBD5DC`, `tinta #1F2937`, `tintaSuave #52606D`, `tintaTenue #98A2B0`, `grafito #263344`, acentos vivos `oferta #DC2626` / `hoja #16A34A` / `sello #D97706`. Sombras con rgba(16,24,40,...). Se quitó el grano SVG del fondo de `body`. `index.css` reconstruido completo (había sido sobrescrito con un tema oscuro que rompía las clases de ficha). `DESIGN.md` + `.impeccable/design.json` actualizados (north star "El Fichero Moderno del Almacén", ramps regenerados).

### 31/07/2026 — Tema v3 blanco sobrio + Open Design instalado (Sesión Actual)
- **CAMBIO DE TEMA v3 (VIGENTE):** el usuario descartó el tema claro fresco ("hoja de oficina de los 2000") → **tema blanco sobrio y profesional con verde de marca**. Historial para no repetir: v1 manila (papel #EDE5CF, Georgia+Courier) → rechazado; v2 claro frío (#F2F4F7, #16A34A) → rechazado; **v3 actual**: `papel #F4F6F9`, `card #FFFFFF`, `papelAlto #FAFBFD`, `pauta #E3E7EE`, `pautaOscura #C9D2DC`, `tinta #1F2937`, `tintaSuave #5B6573`, `tintaTenue #8D97A5`, `grafito #1B2430`, `grafitoOscuro #121A24`, `hoja #198754` (hover `#116A3F`), `oferta #D64040`, `sello #D97706`; **todas las fuentes = pila del sistema** (sin Georgia ni Courier); sin grano SVG; sombras card/lift con rgba(16,24,40,...).
- **`web/tailwind.config.js` reescrito** con los tokens v3 y `web/src/index.css` reescrito completo (componentes `ficha`, `ficha-pestana` con pestaña por defecto verde `#116a3f`, `btn`/`btn-primario`/`btn-hoja`/`btn-grafito`/`btn-papel`, `input`/`select` focus verde, `sello` con bordes teñidos, `tabla`/`pauta-fila`, `nav-tab` sin clip-path). Logos y nav activo pasados a verde en `Layout.tsx`, `Login.tsx`, `POS.tsx`, `Cart.tsx`. Verificado sin hex hardcodeados en `.tsx`.
- **Calidad v3:** `npm run build` OK (CSS 30.40 kB, JS 234.96 kB), `npx tsc --noEmit` exit 0, detector Impeccable `[]` (0 findings).
- **`DESIGN.md` + `.impeccable/design.json` reescritos al tema v3** (north star "El Fichero Limpio del Almacén"; 13 ramps de color regenerados, 9 componentes autocontenidos, narrative y reglas nombradas: Único Verde, Rojo Reservado, Pauta, Legibilidad, Papel Apilado).
- **Open Design instalado:** `git clone https://github.com/nexu-io/open-design.git` en `open-design/` + `pnpm install` OK (pnpm 11.18.0 global vía `npm i -g pnpm`; Corepack falló por EPERM). Dev server levantado: **Web http://127.0.0.1:17573/** y **Daemon http://127.0.0.1:17456/** (`pnpm tools-dev run web`). Pendiente explorar cómo mezclarlo con Impeccable.
- **Pendiente:** revisión visual del usuario en `http://localhost:5173` (Ctrl+Shift+R) para aprobar o ajustar el tema v3; actualizar estos archivos al cierre.

### 01/08/2026 — Fase D completada (Etiquetas/Barra) (Sesión Actual)
- **Backend — Generador EAN-13:** Creado `server/src/utils/barcode.js` con función `generarCodigoInterno(id)`. Calcula código EAN-13 con prefijo GS1 `20` (uso interno) + ID de producto rellenado a 10 dígitos + dígito verificador EAN-13. Ej: ID 42 → `2000000000042` + check digit.
- **Endpoint nuevo:** `POST /api/productos/:id/generar-codigo` (requiere auth). Solo genera si el producto no tiene código previo; asigna `codigoBarras` y retorna el producto actualizado. Ruta registrada en `server/src/routes/index.js`.
- **Frontend — jsbarcode:** Instalado `jsbarcode` + `@types/jsbarcode` en `web/`. Biblioteca ligera que genera SVG en el navegador, funciona offline.
- **Productos.tsx modificado:** Checkbox por fila para selección masiva, checkbox header para seleccionar/deseleccionar todos. Botón "Generar código" en cada producto sin `codigoBarras`. Botón "Imprimir etiquetas (N)" visible al seleccionar productos.
- **EtiquetaModal.tsx creado:** Modal con vista previa de etiquetas. Selector de tamaño (pequeña 40×30mm / mediana 60×40mm). Cantidad editable por producto. Generación de código de barras SVG con JsBarcode (EAN-13). Botón Imprimir → `window.print()`. Labels incluyen: nombre producto, código de barras SVG, precio formateado CLP.
- **CSS de impresión:** `@media print` agregado al final de `index.css`. Oculta toda la UI excepto `.etiqueta-print-area` y `.etiqueta-label`. Configura `@page` con margen 5mm y evita page-break dentro de etiquetas.
- **Calidad:** `tsc --noEmit` limpio en web/, `npm run build` OK (CSS 34.67 kB, JS 327.20 kB). Server: instalado `@types/cors` (faltaba previamente), `npm run build` OK.
- **Pendiente:** Próximo hito: roadmap futuro (escaneo omnipotente, impresión térmica ESC/POS, SII/boleta electrónica, multi-tenant).

### 01/08/2026 — Fase 9 (Tests) y Fase 10 (Documentación) completadas (Sesión Actual)
- **Fase 9 — Tests API (Vitest + Supertest):**
  - Instalado `vitest`, `supertest`, `@types/supertest` en `server/`.
  - Creado `server/vitest.config.mjs` (forks, singleFork, sin paralelismo para evitar conflictos SQLite).
  - Creado `server/tests/setup.js`: prepara BD SQLite temporal, ejecuta `prisma db push`, seed con datos de prueba (usuarios ADMIN/CAJERO, productos, clientes, proveedor, configuración), limpia entre suites.
  - Creados 7 archivos de test:
    - `auth.test.js` (7 tests: login exitoso/fallido, /auth/me, token inválido, roles)
    - `productos.test.js` (9 tests: CRUD, búsqueda, generar-codigo EAN-13, validaciones)
    - `ventas.test.js` (8 tests: crear venta, descuento stock, stock insuficiente, descuento %, anular con devolución, fiado incrementa deuda)
    - `clientes.test.js` (8 tests: CRUD, abonos, historial de cuenta)
    - `caja.test.js` (9 tests: apertura, cierre con arqueo, movimientos INGRESO/EGRESO, validaciones)
    - `compras.test.js` (10 tests: compra transaccional, actualización stock/costo/venta, list, filtros; proveedores CRUD)
    - `reportes.test.js` (7 tests: resumen KPIs, productos más vendidos, stock bajo, configuración get/update)
  - **Resultado: 58 tests, 7 suites, 0 fallos.**
  - Modificado `server/src/index.ts`: no hace `app.listen()` cuando se importa en tests (EADDRINUSE).
- **Fase 10 — Documentación completa:**
  - `README.md` reescrito profesionalmente: descripción, propuesta de valor, funcionalidades, arquitectura, instalación paso a paso (Windows/Linux/Mac), estructura del proyecto, comandos, pantallas, atajos de teclado, roadmap, licencia.
  - `docs/ARQUITECTURA.md` creado: diagrama de componentes, modelo ER, flujo de venta transaccional (paso a paso), decisiones técnicas (SQLite, Prisma, JWT, Tailwind, folio), API REST completa (37 endpoints), seguridad, estrategia de tests.
  - `docs/GUIA_USUARIO.md` creado: primeros pasos, manual para cajeros (abrir/cerrar caja, vender, fiado, pesables, atajos F1-F12, movimientos de caja), manual para administradores (dashboard, productos, clientes, proveedores, compras, reportes, usuarios, configuración, anular ventas, backup), preguntas frecuentes (8 FAQs).
- **Próximo hito:** roadmap futuro — Fase 1 Corto Plazo (escaneo omnipotente, arqueo de caja, ticket térmico ESC/POS, reporte de utilidad bruta) o Fase 2 (SII/boleta electrónica).

### 01/08/2026 — Roadmap y Análisis de Mercado 2026 (Sesión Actual)
- **Investigación de mercado actualizada:** Analizados los principales competidores de POS en Chile: Bsale (12K empresas, SaaS, boleta SII), Loyverse (1M+ negocios, freemium, offline), GranLoop (IA para compras, SII automático, nuevo 2026) y DUOPOS (500+ negocios, IA asistida, integración pagos).
- **`docs/ROADMAP.md` creado:** Roadmap detallado con 4 fases trimestrales:
  - **Q3 2026 (Corto plazo - alta prioridad):** Dashboard con gráficos Recharts, análisis de márgenes por producto, alertas inteligentes de inventario.
  - **Q4 2026 (Mediano plazo):** IA para propuestas de compra (qué comprar, cuánto), escaneo de código de barras omnipotente, modo offline básico (PWA), integración SumUp/Transbank.
  - **H1 2027 (Mediano-largo):** App móvil React Native para dueños (reportes), conexión SII automática (importar facturas de proveedores), boleta electrónica SII.
  - **H2 2027+ (Largo plazo):** Impresión ticket térmico ESC/POS, migración SaaS multi-tenant PostgreSQL, fidelización de clientes, ecommerce integrado.
  - Cada hito incluye: prioridad (alta/media/baja), esfuerzo estimado, dependencias y criterios de éxito.
- **`docs/ANALISIS_MERCADO_2026.md` creado:** Comparativa completa de 5 competidores (Bsale, Loyverse, GranLoop, DUOPOS, Super Cajero), tendencias del mercado chileno (IA, SII automático, offline, app móvil, medios de pago), gaps funcionales de StockCaja priorizados, posicionamiento diferencial (licencia única + on-premise + visibilidad para el dueño), estrategia recomendada.
- **README.md actualizado:** Sección Roadmap futuro actualizada con resumen trimestral y enlace a ROADMAP.md.
- **Decisión del usuario:** App móvil movida a mediano-largo plazo (H1 2027), no a largo plazo.


- **Rediseño Estético:** Se modificó la hoja de estilos global (`index.css`) para deshacerse de las pestañas retro físicas (clip-path ear shapes) y reemplazarlas por bordes superiores minimalistas y sutiles de acento de color.
- **Formularios y Botones:** Ajustados los botones, inputs, y tablas a una estética limpia, flat, moderna y profesional.
- **Estructura del Layout:** Modificado `Layout.tsx` para cambiar la barra superior de `bg-grafito` (oscuro) a un fondo blanco minimalista (`bg-white`) con tipografía oscura, y la navegación a una barra con líneas inferiores activas (underline menu).
- **Integración del POS:** Se rediseñó `POS.tsx` para renderizarse de forma inline (removiendo el overlay fixed a pantalla completa y su propia cabecera oscura), lo cual restablece el acceso natural al Dashboard y unifica visualmente la cabecera blanca.
- **Fondo de Pantalla:** Actualizado el fondo global a `#F8FAFC` en `tailwind.config.js` para dar mayor aire visual.
- **Análisis de Competencia:** Realizado un análisis profundo de softwares de cajas de almacenes (como Bsale, Loyverse, Almasend, El Almacén) y se añadieron al plan estratégico (`docs/analisis_mercado_plan.md`) 5 funcionalidades clave indispensables para el comercio local: Módulo de Fiado/Crédito, Gestión de Pesables (balanzas), Carga Rápida de Compras y Proveedores, Impresión de Códigos de Barras internos y Configuración de Combos/Packs automáticos.
- **Implementación de la Fase A (Módulo de Fiado):**
  * **Base de Datos:** Actualizado el modelo de Prisma agregando `saldoDeuda` a la tabla `Cliente` y creando la tabla `PagoCredito`. Migración sqlite aplicada con éxito.
  * **Backend:** Modificada la ruta de checkout de ventas para admitir método de pago `'fiado'`, incrementando de manera atómica el saldo deudor del cliente. Creados endpoints para registrar abonos y obtener la cartola / historial de cuenta corriente (compras + abonos).
  * **Frontend:** Implementado selector de cliente por dropdown en el POS (mostrando deuda en tiempo real), botón de pago "fiado" (solo activo si hay cliente) y atajo F2. En la pantalla de Clientes se muestra la deuda, un modal con la cartola de movimientos unificada, y un modal de abonos con re-cálculo en tiempo real.
- **Implementación de la Fase B (Carga Rápida de Stock y Proveedores):**
  * **Base de Datos:** Incorporados modelos `Proveedor`, `CompraInventario` y `CompraDetalle` al esquema Prisma. Migración sqlite `add_proveedor_and_compras` aplicada exitosamente.
  * **Backend:** Endpoints para el CRUD completo de proveedores y la creación transaccional de compras (suma stock de productos, actualiza precio costo y venta sugerido, registra el folio de la factura e ingresa movimientos tipo ENTRADA).
  * **Frontend:** Desarrollada la página `Proveedores.tsx` (administración de contactos) y la página `Compras.tsx` (reposición rápida con buscador enfocado por escáner, auto-cálculo de márgenes porcentuales por ítem en vivo y confirmación en lote). Añadidos los enlaces correspondientes al menú de navegación.
- **Implementación de la Fase C (Venta de Productos Pesables / Decimales):**
  * **Base de Datos:** Incorporado el flag `esPesable` (Boolean) en el modelo `Producto`. Modificados los tipos de cantidad y stock de `Int` a `Float` en los modelos `Producto`, `VentaDetalle`, `MovimientoStock` y `CompraDetalle` para admitir decimales en toda la trazabilidad.
  * **Backend:** Actualizado `compras.js` para parsear la cantidad ingresada mediante `parseFloat` en lugar de enteros.
  * **Frontend:** Agregado checkbox en el CRUD de productos, badge visual de "Pesable", formato de decimales en stock (`toFixed(3)`), modal ágil en el POS para ingresar el peso en kg (con subtotal estimado en vivo) y botón interactivo en el carrito para re-editar el peso de forma ágil con teclado.
- **Calidad:** Verificado `tsc --noEmit` y ejecutado `npm run build` exitosamente sin ningún error.





