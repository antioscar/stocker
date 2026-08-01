# AGENTS.md — Contexto del proyecto

> Lee esto ANTES de trabajar en el proyecto. Todas las conversaciones con el usuario son en **español**.
> Este archivo lo usa opencode automáticamente, y también sirve para Antigravity y otros agentes de IA.

## Qué es este proyecto

**StockCaja**: sistema de gestión para negocios locales (almacenes/almacenes de barrio). Módulos: ventas (punto de venta), inventario/stock, clientes, usuarios con roles y reportes.

- Es el primer proyecto serio de portafolio del usuario (se titula como **analista programador**).
- Objetivo comercial: venderlo como **licencia única** a almacenes del barrio.
- Modelo de despliegue: **local (on-premise) primero**, migrar a **SaaS en la nube** después.

## Estado actual

- **Backend `server/` FUNCIONA ✅** — `npm run dev` levanta en `:3000` con CORS y base de datos SQLite sincronizada. Caja por turnos, ventas transaccionales, folio `BOL-####`, stock nunca negativo, utilidad bruta.
- **REDISEÑO FRONTEND — TEMA V3 MEJORADO A BLANCO MINIMALISTA Y PROFESIONAL** — Identidad limpia y moderna aplicada a todo `web/src/`.
  - `PRODUCT.md` y `docs/guia_mercado_pos_chile.md` creados (contexto + mercado chileno).
  - Rediseñadas: `Layout.tsx` (header blanco minimalista + navegación plana con línea activa), `Login`, `Dashboard`, `POS` + `Cart` + `CajaModal` + `ProductSearch`, `Productos`, `Clientes`, `Usuarios`, `Reportes`, `Configuracion`.
  - **POS Integrado:** El POS ahora se renderiza de forma inline en la estructura del Layout general (se removió el overlay de pantalla completa y la cabecera oscura duplicada), lo cual restaura la barra de navegación superior y el acceso directo al Dashboard.
  - **Análisis de Competencia:** Realizado un análisis de los POS más usados en Chile (Bsale, Loyverse, Almasend, El Almacén) y se incorporaron 5 propuestas de valor al plan estratégico (`docs/analisis_mercado_plan.md`): Módulo de Fiado/Crédito, Ventas Pesables, Carga Rápida de Stock/Compras, Generación/Impresión de etiquetas e Impulso de Packs/Promociones.
  - **Fase A (Fiado) completada:** Añadido campo `saldoDeuda` en `Cliente`, modelo `PagoCredito`, endpoints de cobro al fiado transaccionales, abonos y cartola unificada. En frontend se integró selector de cliente, cobro al fiado en POS, y modal de abonos en ficha de clientes.
  - **Fase B (Stock/Proveedores) completada:** Creados modelos `Proveedor`, `CompraInventario` y `CompraDetalle` en Prisma. Endpoints CRUD de proveedores y registro transaccional de compras (abastecimiento). Implementadas las vistas `Proveedores.tsx` y `Compras.tsx` (entrada rápida por escáner y auto-cálculo de margen %).
  - **Fase C (Pesables) completada:** Añadido flag `esPesable` a productos. Modificados tipos de cantidad y stock a `Float` en todos los modelos Prisma para admitir decimales en toda la trazabilidad. Integrado modal de ingreso de peso en el POS (cálculo en vivo de subtotal), formateo de stock con 3 decimales (`toFixed(3)`) y badge visual en CRUD.
  - **Calidad OK**: `tsc --noEmit` limpio, `eslint .` 0 errores (solo warnings preexistentes de return types), `npm run build` OK (CSS 34.14 kB / JS 256.16 kB), **detector Impeccable: 0 findings**.
  - Se reparó lint del repo: faltaban deps (`@typescript-eslint/*`, `eslint-config-prettier`) y se creó `web/.eslintignore` (dist/config files). Tipado: `apiFetch<T=unknown>`, `CajaSessionData` y campos `utilidadBruta/totalCosto` agregados a `types`.
  - **Fase G — `DESIGN.md` escrito** (raíz, formato spec oficial: frontmatter YAML con tokens normativos + 8 secciones canónicas) + sidecar `.impeccable/design.json` (schemaVersion 2: ramps de colores, componentes autocontenidos HTML/CSS, narrative).
  - **DECISIÓN USUARIO 31/07 y 01/08 (TEMA V3 MINIMALISTA - VIGENTE):** **tema blanco sobrio y profesional con verde de marca**. Tokens finales en `web/tailwind.config.js`: fondo `papel #F8FAFC`, `card #FFFFFF`, `papelAlto #FAFBFD`, `pauta #E3E7EE`, `pautaOscura #C9D2DC`, `tinta #1F2937`, `tintaSuave #5B6573`, `tintaTenue #8D97A5`, `grafito #1B2430`, `grafitoOscuro #121A24`, **`hoja #198754` (verde marca, hover `#116A3F`)**, `oferta #D64040` (rojo solo para peligro), `sello #D97706`. **Todas las fuentes = pila del sistema** (sin Georgia serif ni Courier). Sin grano SVG. Sin orejas de pestañas retro clip-path (reemplazadas por un sutil borde superior de acento).
  - **Open Design instalado** (`github.com/nexu-io/open-design`, clonado en `open-design/`, `pnpm install` OK, pnpm 11.18.0 global). Dev server: Web `http://127.0.0.1:17573/`, Daemon `http://127.0.0.1:17456/` (comando `pnpm tools-dev run web`). Se explorará cómo mezclarlo con Impeccable en pasos futuros.
- **Plan de Fases:** Fase 1: Completada ✅ | Fase A (Fiado): Completada ✅ | Fase B (Stock/Proveedores): Completada ✅ | Fase C (Pesables): Completada ✅ | Fase D (Etiquetas/Barra): Pendiente ⏳ | Rediseño Impeccable: A–G completadas + tema v3 blanco minimalista aplicado.


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
6. **Estrategia UI/UX Diferencial:** Rediseñar la UI hacia una estética premium (modo oscuro, sombras, micro-animaciones) para sobresalir frente a competidores chilenos de aspecto obsoleto, priorizando rapidez mediante atajos de teclado y escaneo en segundo plano en el POS.

## Roadmap futuro (contexto; NO implementar aún)

- **Fase 1 (Corto Plazo) - Operación Diaria Express:** Escaneo de código de barras en segundo plano sin modales, control y arqueo de caja (apertura/cierres de turnos), layout de ticket térmico ESC/POS (58mm/80mm), y reporte de utilidad bruta (Precio Venta - Precio Costo).
- **Fase 2 (Mediano Plazo) - Localización Chile:** Desglose del IVA (19%) en el backend y base de datos, boleta/factura electrónica SII integrada (LibreDTE o Mifactura, certificado digital, timbre).
- **Fase 3 (Largo Plazo) - Modernización:** Interfaz premium, atajos de teclado globales en POS, integración directa con terminales SumUp/Redelcom y migración SaaS multi-tenant (PostgreSQL).

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
