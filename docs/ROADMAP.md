# Roadmap de StockCaja

> Hitos, prioridades y dependencias para la evolución del producto.
> Última actualización: 01/08/2026

---

## Visión general

StockCaja es un sistema de gestión para almacenes y negocios de barrio chilenos. La **versión actual (v1)** está completa y funcional: POS, inventario, clientes con fiado, caja por turnos, productos pesables, compras a proveedores, etiquetas con código de barras, reportes y configuración. Se ejecuta on-premise con SQLite.

El roadmap se divide en 4 fases trimestrales priorizando lo que genera más valor para el dueño del negocio y el cajero.

---

## Leyenda

| Símbolo | Significado |
|---|---|
| 🔴 | Alta prioridad — impacto directo en ventas o rentabilidad |
| 🟡 | Media prioridad — mejora operativa o experiencia |
| 🟢 | Baja prioridad — escalabilidad y crecimiento futuro |
| ⚡ | Quick win — bajo esfuerzo, alto impacto |
| 🧱 | Depende de otro hito |

---

## Q3 2026 — Corto plazo (Julio - Septiembre)

**Tema: Visibilidad mejorada para el dueño**

### 🔴 Dashboard mejorado con gráficos interactivos
**Descripción:** Incorporar Recharts (gráficos de barras, líneas, torta) al Dashboard y Reportes. Reemplazar los contadores estáticos actuales por visualizaciones dinámicas con filtros de fecha.

**Entregables:**
- Gráfico de ventas diarias (barras) con comparativa semana anterior
- Gráfico de composición de ventas por categoría (torta)
- Gráfico de utilidad bruta diaria (línea)
- Filtro de rango de fechas en Dashboard
- KPIs animados con tendencia (% vs período anterior)

**Esfuerzo:** 2-3 días
**Dependencias:** Recharts (instalar en `web/`)
**Criterio de éxito:** El dueño puede ver tendencias de ventas y márgenes de un vistazo

### 🔴 Análisis de márgenes por producto
**Descripción:** Agregar columna de margen bruto (%) por producto en la tabla de Productos. Resaltar productos con margen bajo configurable.

**Entregables:**
- Columna "Margen %" en tabla de Productos (calculado: (venta - costo) / venta)
- Badge de alerta para márgenes < umbral (configurable en Configuración)
- Filtro "margen bajo" en vista de Productos
- Gráfico de márgenes en Reportes

**Esfuerzo:** 1-2 días
**Dependencias:** Ninguna (datos ya existen en DB)
**Criterio de éxito:** El dueño detecta productos que está vendiendo con poco margen

### 🔴 Alertas inteligentes de inventario
**Descripción:** Sistema de notificaciones en el Dashboard que alerta sobre stock bajo, productos sin ventas en N días, y márgenes erosionados.

**Entregables:**
- Panel de alertas en Dashboard (tarjetas con acciones sugeridas)
- "Stock bajo": productos bajo stock mínimo
- "Sin rotación": productos sin ventas en 30 días
- "Margen bajo": productos con margen < umbral
- "Por vencer": placeholder para productos con fecha de vencimiento (futuro)

**Esfuerzo:** 2-3 días
**Dependencias:** Hito "Análisis de márgenes"
**Criterio de éxito:** El dueño recibe alertas accionables al abrir el Dashboard

---

## Q4 2026 — Mediano plazo (Octubre - Diciembre)

**Tema: Operación más inteligente**

### 🟡 IA para propuestas de compra
**Descripción:** El sistema analiza la rotación de productos y genera sugerencias diarias de reposición: qué comprar, cuánto y a qué proveedor.

**Entregables:**
- Algoritmo de cálculo de punto de reposición basado en:
  - Rotación diaria promedio (últimos 30 días)
  - Stock actual
  - Días de reposición del proveedor
  - Stock mínimo configurado
- Panel "Propuestas de compra" en Dashboard con tabla de sugerencias
- Cantidad sugerida de compra por producto
- Opción de generar orden de compra desde las sugerencias
- Exportar sugerencias a Excel/PDF

**Esfuerzo:** 5-7 días
**Dependencias:** Ninguna (datos de ventas ya existen)
**Criterio de éxito:** El dueño recibe una lista diaria de qué comprar basada en datos reales

### 🟡 Escaneo de código de barras omnipotente
**Descripción:** El POS captura lecturas de código de barras en segundo plano sin abrir modales. El foco está siempre en el campo de búsqueda, y al escanear un código el producto se agrega automáticamente al carrito.

**Entregables:**
- Input de búsqueda siempre enfocado en el POS (con `autoFocus` + manejo de blur)
- Evento `keydown` global que detecta lecturas de escáner (ráfaga rápida de teclas + Enter)
- Si el código escaneado coincide con un producto, se agrega al carrito instantáneamente
- Si no coincide, se muestra mensaje "Producto no encontrado"
- Sonido de confirmación al agregar producto

**Esfuerzo:** 2-3 días
**Dependencias:** Ninguna
**Criterio de éxito:** El cajero puede escanear productos sin usar el mouse ni abrir modales

### 🟡 Modo offline básico
**Descripción:** El frontend puede operar sin conexión a internet usando service workers (PWA). Las ventas se encolan y sincronizan cuando vuelve la conexión.

**Entregables:**
- Service worker con Vite PWA plugin
- Caché de assets y datos de productos
- Cola de ventas offline (localStorage/IndexedDB)
- Sincronización automática al reconectar
- Indicador visual de estado (online/offline)

**Esfuerzo:** 3-5 días
**Dependencias:** `vite-plugin-pwa`
**Criterio de éxito:** El cajero puede vender aunque se caiga internet; las ventas se sincronizan al volver

### 🟡 Integración con SumUp/Transbank
**Descripción:** El botón "Tarjeta" en el POS se integra con terminales de pago físicos. El sistema envía el monto exacto al terminal para evitar errores de digitación.

**Entregables:**
- Endpoint de configuración de medio de pago en Configuración
- Flujo de cobro con tarjeta: seleccionar "Tarjeta" → el sistema envía monto al terminal → el terminal procesa → confirmación automática
- Registro de transacciones de pago
- Reimpresión de voucher de pago

**Esfuerzo:** 3-5 días
**Dependencias:** SDK de SumUp o API de Transbank
**Criterio de éxito:** El cajero cobra con tarjeta sin digitar el monto manualmente

---

## H1 2027 — Mediano-largo plazo (Enero - Junio)

**Tema: Localización chilena completa + movilidad**

### 🟡 App móvil para dueños (React Native)
**Descripción:** Aplicación móvil nativa (iOS/Android) con enfoque en reportes y visibilidad para el dueño. No es un POS completo — es un panel de control de bolsillo.

**Entregables:**
- Autenticación (mismo JWT del backend)
- Dashboard simplificado: ventas del día, ticket promedio, utilidad bruta
- Alertas push: stock bajo, ventas anómalas
- Lista de productos con stock y margen
- Reportes básicos: ventas por día, top productos
- Widget de "ventas de hoy" en pantalla de inicio

**Esfuerzo:** 15-20 días
**Dependencias:** Backend actual (compartido), React Native + Expo
**Criterio de éxito:** El dueño revisa sus ventas desde el celular sin abrir el computador

### 🔴 Conexión SII automática (importar facturas de proveedores)
**Descripción:** El sistema se conecta al SII para descargar automáticamente las facturas electrónicas de proveedores. Cada factura se cruza con el inventario y actualiza stock y costos sin ingreso manual.

**Entregables:**
- Configuración de credenciales SII (RUT + clave)
- Descarga automática de DTE recibidos (facturas de proveedores)
- Matching automático de ítems de factura con productos del inventario
- Actualización de stock y precio de costo al recibir factura
- Registro de discrepancia (facturas no conciliables)
- Panel de "Facturas por procesar"

**Esfuerzo:** 10-15 días
**Dependencias:** API SII o LibreDTE, manejo de certificado digital
**Criterio de éxito:** El dueño deja de digitar facturas; el inventario se actualiza solo

### 🔴 Boleta electrónica SII
**Descripción:** Emisión de boleta electrónica válida ante el SII desde el POS. Incluye timbre electrónico, folio autorizado y envío automático al SII.

**Entregables:**
- Integración con LibreDTE para emisión de DTE
- Generación de XML de boleta electrónica (schema SII)
- Firma electrónica con certificado digital del contribuyente
- Timbre electrónico (PDF417) en ticket de venta
- Envío automático al SII
- Recepción de acuse de recibo del SII
- Reimpresión de boleta con timbre

**Esfuerzo:** 10-15 días
**Dependencias:** LibreDTE, certificado digital, Hito "Conexión SII automática"
**Criterio de éxito:** Cada venta del POS genera una boleta electrónica válida ante el SII

---

## H2 2027+ — Largo plazo (Julio 2027+)

**Tema: Escalabilidad y crecimiento**

### 🟢 Impresión térmica directa (ESC/POS)
**Descripción:** Formato de ticket pre-diseñado para impresoras térmicas de 58mm y 80mm. Impresión directa sin diálogo del navegador.

**Entregables:**
- Plantilla de ticket térmico con CSS para 58mm y 80mm
- Impresión vía `window.print()` con `@page { size: 58mm }`
- Corte automático de papel (comando ESC/POS)
- Ticket con: logo, folio, fecha, items, total, IVA, método de pago
- Opción de reimpresión de último ticket

**Esfuerzo:** 2-3 días
**Dependencias:** Hito "Boleta electrónica SII" (para timbre en ticket)
**Criterio de éxito:** El ticket se imprime correctamente en impresora térmica

### 🟢 Migración SaaS multi-tenant (PostgreSQL)
**Descripción:** Migrar de SQLite local a PostgreSQL en la nube. Agregar campo `negocioId` a todas las tablas para soportar múltiples negocios en la misma instancia.

**Entregables:**
- Migración de schema Prisma de SQLite a PostgreSQL
- Campo `negocioId` en todas las tablas
- Middleware de tenant (filtra por `negocioId` automáticamente)
- Script de migración de datos de v1 a v2
- Panel de administración de tenants
- Facturación por negocio

**Esfuerzo:** 15-20 días
**Dependencias:** Infraestructura cloud (AWS/Railway), PostgreSQL
**Criterio de éxito:** Múltiples negocios operan en la misma instancia sin filtrar datos entre ellos

### 🟢 Panel de fidelización de clientes
**Descripción:** Sistema de puntos o descuentos por frecuencia de compra. Cada cliente acumula puntos que puede canjear.

**Entregables:**
- Regla de acumulación: X puntos por cada $Y de compra
- Canje de puntos en el POS
- Saldo de puntos visible en ficha de cliente
- Reporte de clientes frecuentes
- Notificaciones de cumpleaños (opcional)

**Esfuerzo:** 3-5 días
**Dependencias:** Ninguna
**Criterio de éxito:** Los clientes frecuentes reciben beneficios, aumentando retención

### 🟢 Ecommerce integrado
**Descripción:** Catálogo de productos públicable como tienda online. Sincronización de stock entre tienda física y virtual.

**Entregables:**
- Página de catálogo público (productos con fotos y precios)
- Carrito de compras online
- Checkout con métodos de pago
- Sincronización de stock en tiempo real
- Pedidos online visibles en el panel de administración

**Esfuerzo:** 10-15 días
**Dependencias:** Hito "Migración SaaS multi-tenant", pasarela de pago
**Criterio de éxito:** El dueño vende por internet y el stock se actualiza en ambas plataformas

---

## Resumen visual del roadmap

```
Q3 2026          Q4 2026            H1 2027               H2 2027+
────────────────────────────────────────────────────────────────────
Dashboard        IA compras         App móvil RN          Ticket térmico
mejorado    ──►  inteligentes  ──►  para dueños     ──►  ESC/POS

Márgenes por     Escaneo            SII automático        SaaS multi-
producto    ──►  omnipotente   ──►  + boleta elect. ──►  tenant PG

Alertas inv.     Modo offline       Fidelización          Ecommerce
            ──►  básico        ──►  clientes         ──►  integrado

                  SumUp/Transbank
            ──►  integración
```

---

## Métricas de éxito del producto

| Métrica | Actual (v1) | Meta Q4 2026 | Meta H2 2027 |
|---|---|---|---|
| Tiempo de cobro promedio | ~15s (con búsqueda) | <5s (con escaneo) | <3s |
| Tareas manuales del dueño | 2-3 hrs/día | 1 hr/día (IA compras) | 30 min/día (SII auto) |
| Precisión del inventario | 100% (manual) | 100% (automático) | 100% (multi-canal) |
| Cobertura de tests | 58 tests | 80+ tests | 120+ tests |
| Funcionalidad offline | No | Básico (ventas) | Completo (sincronización) |
| Dispositivos soportados | 1 (navegador PC) | 1 | 2 (PC + móvil) |
