# AGENTS.md — Contexto del proyecto

> Lee esto ANTES de trabajar en el proyecto. Todas las conversaciones con el usuario son en **español**.
> Este archivo lo usa opencode automáticamente, y también sirve para Antigravity y otros agentes de IA.

## Qué es este proyecto

**StockCaja**: sistema de gestión para negocios locales (almacenes/almacenes de barrio). Módulos: ventas (punto de venta), inventario/stock, clientes, usuarios con roles y reportes.

- Es el primer proyecto serio de portafolio del usuario (se titula como **analista programador**).
- Objetivo comercial: venderlo como **licencia única** a almacenes del barrio.
- Modelo de despliegue: **local (on-premise) primero**, migrar a **SaaS en la nube** después.

## Estado actual

- **Fases A, B, C, D y E del plan inicial completadas. Fase 1 (Operación Diaria Express) COMPLETADA. ✅**
- **Backend `server/` FUNCIONA ✅** — `npm run dev` levanta en `:3000` con CORS y base de datos SQLite sincronizada.
  - Se crearon los modelos `CajaSession` y `MovimientoCaja` en SQLite con migraciones.
  - Implementado controlador `/api/caja` para apertura, cierre, arqueos y transacciones manuales.
  - Las ventas validan sesión activa y se asocian al turno de caja.
  - Los reportes resumen incluyen cálculo de **Utilidad Bruta** (Ingresos - Costos).
- **Frontend `web/` FUNCIONA ✅** — `npm run dev` levanta en `:5173`, compilación de TypeScript limpia (`tsc --noEmit` OK).
  - ✅ Implementado modal `CajaModal` para el control de turnos y transacciones de caja.
  - ✅ El POS (`POS.tsx`) bloquea el acceso si la caja está cerrada. Implementa escaneo de códigos de barras continuo y desglose correcto del IVA bruto chileno.
  - ✅ Se añadió el indicador de caja en la barra superior del Layout.
  - ✅ Dashboard y Reportes reflejan ahora las ganancias (utilidad bruta).
- **Plan de Fases:** Fase 1: Completada ✅ | Fase 2: Pendiente ⏳


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
