# Plan de Acción - StockCaja 2026-2027

> Plan de implementación detallado basado en el ROADMAP.md
> Última actualización: 01/08/2026

---

## Estado actual del proyecto

✅ **v1.0 completada** - Sistema funcional on-premise con:
- POS completo (ventas, fiado, pesables, caja por turnos)
- Inventario y stock (nunca negativo, movimientos auditados)
- Clientes, proveedores, compras
- Etiquetas con código de barras (EAN-13)
- Reportes básicos
- 58 tests pasando
- Documentación completa (README, ARQUITECTURA, GUIA_USUARIO)

---

## Fase 1: Q3 2026 - Visibilidad mejorada (ALTA prioridad)

**Objetivo:** Dashboard con gráficos interactivos, análisis de márgenes y alertas inteligentes.

### Tarea 1.1: Dashboard mejorado con Recharts
**Duración estimada:** 2-3 días
**Dependencias:** Ninguna

**Entregables:**
- [ ] Instalar `recharts` en `web/`
- [ ] Crear componente `DashboardCharts.tsx` con:
  - Gráfico de barras: ventas diarias (últimos 7 días)
  - Gráfico de torta: composición por categoría
  - Gráfico de línea: utilidad bruta diaria
- [ ] Agregar filtro de rango de fechas (DatePicker)
- [ ] KPIs animados con tendencia (% vs período anterior)
- [ ] Integrar en `Dashboard.tsx`

**Archivos a crear/modificar:**
- `web/src/components/DashboardCharts.tsx` (nuevo)
- `web/src/pages/Dashboard.tsx` (modificar)
- `web/package.json` (instalar recharts)

**Pruebas:**
- Verificar que los gráficos se renderizan correctamente
- Validar que los filtros de fecha funcionan
- Asegurar que los KPIs se actualizan en tiempo real

---

### Tarea 1.2: Análisis de márgenes por producto
**Duración estimada:** 1-2 días
**Dependencias:** Ninguna

**Entregables:**
- [ ] Agregar columna "Margen %" en tabla de Productos
  - Fórmula: `(precioVenta - precioCosto) / precioVenta * 100`
- [ ] Crear badge de alerta para márgenes < umbral (configurable)
- [ ] Agregar filtro "margen bajo" en vista de Productos
- [ ] Crear gráfico de márgenes en Reportes
- [ ] Agregar campo `margenMinimo` en Configuración

**Archivos a crear/modificar:**
- `web/src/pages/Productos.tsx` (modificar)
- `web/src/pages/Reportes.tsx` (modificar)
- `web/src/pages/Configuracion.tsx` (modificar)
- `server/prisma/schema.prisma` (agregar margenMinimo)

**Pruebas:**
- Verificar cálculo de margen
- Validar que el badge aparece cuando corresponde
- Asegurar que el filtro funciona

---

### Tarea 1.3: Alertas inteligentes de inventario
**Duración estimada:** 2-3 días
**Dependencias:** Tarea 1.2 (márgenes)

**Entregables:**
- [ ] Crear componente `AlertPanel.tsx` con tarjetas de alertas
- [ ] Implementar alertas:
  - "Stock bajo": productos bajo stock mínimo
  - "Sin rotación": productos sin ventas en 30 días
  - "Margen bajo": productos con margen < umbral
  - "Por vencer": placeholder para fecha de vencimiento
- [ ] Agregar acciones sugeridas (ej: "Reponer stock", "Ajustar precio")
- [ ] Integrar en Dashboard

**Archivos a crear/modificar:**
- `web/src/components/AlertPanel.tsx` (nuevo)
- `web/src/pages/Dashboard.tsx` (modificar)
- `server/src/routes/reportes.js` (agregar endpoint de alertas)

**Pruebas:**
- Verificar que las alertas se muestran correctamente
- Validar que las acciones sugeridas funcionan
- Asegurar que las alertas se actualizan en tiempo real

---

## Fase 2: Q4 2026 - Operación más inteligente

**Objetivo:** IA para propuestas de compra, escaneo omnipotente, modo offline, integración de pagos.

### Tarea 2.1: IA para propuestas de compra
**Duración estimada:** 5-7 días
**Dependencias:** Datos de ventas existentes

**Entregables:**
- [ ] Crear algoritmo de cálculo de punto de reposición:
  - Rotación diaria promedio (últimos 30 días)
  - Stock actual
  - Días de reposición del proveedor
  - Stock mínimo configurado
- [ ] Crear endpoint `GET /api/reportes/propuestas-compra`
- [ ] Crear componente `PropuestasCompra.tsx` con tabla de sugerencias
- [ ] Agregar opción de generar orden de compra desde sugerencias
- [ ] Implementar exportación a Excel/PDF

**Archivos a crear/modificar:**
- `server/src/utils/iaCompras.js` (nuevo)
- `server/src/routes/reportes.js` (modificar)
- `web/src/components/PropuestasCompra.tsx` (nuevo)
- `web/src/pages/Reportes.tsx` (modificar)

**Pruebas:**
- Validar algoritmo con datos de prueba
- Verificar que las sugerencias son razonables
- Asegurar que la exportación funciona

---

### Tarea 2.2: Escaneo de código de barras omnipotente
**Duración estimada:** 2-3 días
**Dependencias:** Ninguna

**Entregables:**
- [ ] Modificar POS para mantener input de búsqueda siempre enfocado
- [ ] Implementar detección de lecturas de escáner (ráfaga de teclas + Enter)
- [ ] Agregar producto al carrito automáticamente si el código coincide
- [ ] Mostrar mensaje "Producto no encontrado" si no coincide
- [ ] Agregar sonido de confirmación

**Archivos a crear/modificar:**
- `web/src/pages/POS.tsx` (modificar)
- `web/src/hooks/useBarcodeScanner.ts` (nuevo)

**Pruebas:**
- Verificar que el escaneo funciona sin abrir modales
- Validar que el sonido se reproduce
- Asegurar que el mensaje de error aparece cuando corresponde

---

### Tarea 2.3: Modo offline básico (PWA)
**Duración estimada:** 3-5 días
**Dependencias:** `vite-plugin-pwa`

**Entregables:**
- [ ] Instalar `vite-plugin-pwa` en `web/`
- [ ] Configurar service worker con caché de assets y productos
- [ ] Implementar cola de ventas offline (localStorage/IndexedDB)
- [ ] Agregar sincronización automática al reconectar
- [ ] Crear indicador visual de estado (online/offline)

**Archivos a crear/modificar:**
- `web/vite.config.ts` (modificar)
- `web/src/hooks/useOfflineSync.ts` (nuevo)
- `web/src/components/OfflineIndicator.tsx` (nuevo)

**Pruebas:**
- Verificar que el service worker se registra correctamente
- Validar que las ventas se encolan offline
- Asegurar que la sincronización funciona al reconectar

---

### Tarea 2.4: Integración con SumUp/Transbank
**Duración estimada:** 3-5 días
**Dependencias:** SDK de SumUp o API de Transbank

**Entregables:**
- [ ] Crear endpoint de configuración de medio de pago
- [ ] Implementar flujo de cobro con tarjeta:
  - Seleccionar "Tarjeta" → enviar monto al terminal
  - Terminal procesa → confirmación automática
- [ ] Registrar transacciones de pago
- [ ] Implementar reimpresión de voucher

**Archivos a crear/modificar:**
- `server/src/routes/pagos.js` (nuevo)
- `server/src/utils/sumup.js` (nuevo)
- `web/src/pages/POS.tsx` (modificar)
- `web/src/pages/Configuracion.tsx` (modificar)

**Pruebas:**
- Verificar que el flujo de pago funciona
- Validar que las transacciones se registran
- Asegurar que el voucher se imprime correctamente

---

## Fase 3: H1 2027 - Localización chilena + movilidad

**Objetivo:** App móvil, SII automático, boleta electrónica.

### Tarea 3.1: App móvil React Native
**Duración estimada:** 15-20 días
**Dependencias:** Backend actual

**Entregables:**
- [ ] Crear proyecto React Native con Expo
- [ ] Implementar autenticación (mismo JWT)
- [ ] Crear Dashboard simplificado (ventas del día, ticket promedio, utilidad bruta)
- [ ] Implementar alertas push (stock bajo, ventas anómalas)
- [ ] Crear lista de productos con stock y margen
- [ ] Implementar reportes básicos (ventas por día, top productos)
- [ ] Agregar widget de "ventas de hoy" en pantalla de inicio

**Archivos a crear:**
- `mobile/` (nuevo proyecto React Native)
- `mobile/src/screens/` (Dashboard, Productos, Reportes)
- `mobile/src/components/` (componentes reutilizables)

**Pruebas:**
- Verificar que la app se conecta al backend
- Validar que los datos se muestran correctamente
- Asegurar que las notificaciones push funcionan

---

### Tarea 3.2: Conexión SII automática
**Duración estimada:** 10-15 días
**Dependencias:** API SII o LibreDTE, certificado digital

**Entregables:**
- [ ] Crear configuración de credenciales SII (RUT + clave)
- [ ] Implementar descarga automática de DTE recibidos
- [ ] Crear matching automático de ítems de factura con productos
- [ ] Actualizar stock y precio de costo al recibir factura
- [ ] Registrar discrepancia (facturas no conciliables)
- [ ] Crear panel de "Facturas por procesar"

**Archivos a crear/modificar:**
- `server/src/utils/sii.js` (nuevo)
- `server/src/routes/sii.js` (nuevo)
- `web/src/pages/FacturasSII.tsx` (nuevo)

**Pruebas:**
- Verificar que la conexión con SII funciona
- Validar que las facturas se descargan correctamente
- Asegurar que el matching funciona

---

### Tarea 3.3: Boleta electrónica SII
**Duración estimada:** 10-15 días
**Dependencias:** Tarea 3.2 (Conexión SII), LibreDTE, certificado digital

**Entregables:**
- [ ] Integrar con LibreDTE para emisión de DTE
- [ ] Generar XML de boleta electrónica (schema SII)
- [ ] Implementar firma electrónica con certificado digital
- [ ] Agregar timbre electrónico (PDF417) en ticket de venta
- [ ] Enviar automáticamente al SII
- [ ] Recibir acuse de recibo del SII
- [ ] Implementar reimpresión de boleta con timbre

**Archivos a crear/modificar:**
- `server/src/utils/dte.js` (nuevo)
- `server/src/routes/ventas.js` (modificar)
- `web/src/pages/POS.tsx` (modificar)

**Pruebas:**
- Verificar que la boleta se genera correctamente
- Validar que el SII la acepta
- Asegurar que el timbre se imprime

---

## Fase 4: H2 2027+ - Escalabilidad y crecimiento

**Objetivo:** Ticket térmico, SaaS multi-tenant, fidelización, ecommerce.

### Tarea 4.1: Impresión térmica directa (ESC/POS)
**Duración estimada:** 2-3 días
**Dependencias:** Tarea 3.3 (Boleta electrónica)

**Entregables:**
- [ ] Crear plantilla de ticket térmico con CSS para 58mm y 80mm
- [ ] Implementar impresión vía `window.print()` con `@page { size: 58mm }`
- [ ] Agregar corte automático de papel (comando ESC/POS)
- [ ] Incluir: logo, folio, fecha, items, total, IVA, método de pago
- [ ] Implementar opción de reimpresión de último ticket

**Archivos a crear/modificar:**
- `web/src/components/TicketTermico.tsx` (nuevo)
- `web/src/index.css` (agregar estilos de impresión)

**Pruebas:**
- Verificar que el ticket se imprime correctamente
- Validar que el corte funciona
- Asegurar que la reimpresión funciona

---

### Tarea 4.2: Migración SaaS multi-tenant (PostgreSQL)
**Duración estimada:** 15-20 días
**Dependencias:** Infraestructura cloud (AWS/Railway), PostgreSQL

**Entregables:**
- [ ] Migrar schema Prisma de SQLite a PostgreSQL
- [ ] Agregar campo `negocioId` en todas las tablas
- [ ] Crear middleware de tenant (filtra por `negocioId` automáticamente)
- [ ] Crear script de migración de datos de v1 a v2
- [ ] Crear panel de administración de tenants
- [ ] Implementar facturación por negocio

**Archivos a crear/modificar:**
- `server/prisma/schema.prisma` (modificar)
- `server/src/middleware/tenant.js` (nuevo)
- `server/src/routes/admin.js` (nuevo)
- `web/src/pages/AdminTenants.tsx` (nuevo)

**Pruebas:**
- Verificar que la migración funciona
- Validar que el aislamiento de datos funciona
- Asegurar que la facturación funciona

---

### Tarea 4.3: Panel de fidelización de clientes
**Duración estimada:** 3-5 días
**Dependencias:** Ninguna

**Entregables:**
- [ ] Crear regla de acumulación: X puntos por cada $Y de compra
- [ ] Implementar canje de puntos en el POS
- [ ] Mostrar saldo de puntos en ficha de cliente
- [ ] Crear reporte de clientes frecuentes
- [ ] Agregar notificaciones de cumpleaños (opcional)

**Archivos a crear/modificar:**
- `server/prisma/schema.prisma` (agregar ClientePuntos)
- `server/src/routes/fidelizacion.js` (nuevo)
- `web/src/pages/Fidelizacion.tsx` (nuevo)
- `web/src/pages/POS.tsx` (modificar)

**Pruebas:**
- Verificar que los puntos se acumulan correctamente
- Validar que el canje funciona
- Asegurar que el reporte funciona

---

### Tarea 4.4: Ecommerce integrado
**Duración estimada:** 10-15 días
**Dependencias:** Tarea 4.2 (SaaS multi-tenant), pasarela de pago

**Entregables:**
- [ ] Crear página de catálogo público (productos con fotos y precios)
- [ ] Implementar carrito de compras online
- [ ] Crear checkout con métodos de pago
- [ ] Sincronizar stock en tiempo real
- [ ] Mostrar pedidos online en el panel de administración

**Archivos a crear/modificar:**
- `web/src/pages/Catalogo.tsx` (nuevo)
- `web/src/pages/Checkout.tsx` (nuevo)
- `server/src/routes/ecommerce.js` (nuevo)

**Pruebas:**
- Verificar que el catálogo se muestra correctamente
- Validar que el checkout funciona
- Asegurar que la sincronización de stock funciona

---

## Resumen de tiempos

| Fase | Duración total | Hitos principales |
|---|---|---|
| Q3 2026 | 5-8 días | Dashboard, márgenes, alertas |
| Q4 2026 | 13-20 días | IA compras, escaneo, offline, pagos |
| H1 2027 | 35-50 días | App móvil, SII automático, boleta electrónica |
| H2 2027+ | 30-43 días | Ticket térmico, SaaS, fidelización, ecommerce |

**Total estimado:** 83-121 días de desarrollo

---

## Próximos pasos inmediatos

1. **Iniciar Fase 1 (Q3 2026):**
   - Tarea 1.1: Dashboard con Recharts
   - Tarea 1.2: Análisis de márgenes
   - Tarea 1.3: Alertas inteligentes

2. **Mantener calidad:**
   - Ejecutar tests después de cada tarea
   - Actualizar documentación
   - Revisar código con ESLint

3. **Comunicación:**
   - Actualizar ROADMAP.md con progreso
   - Actualizar AGENTS.md y CONTEXTO.md
   - Hacer commits regulares

---

## Notas importantes

- **Prioridad:** Seguir el orden de las fases (Q3 → Q4 → H1 → H2)
- **Calidad:** Cada tarea debe incluir tests y documentación
- **Dependencias:** Respetar las dependencias entre tareas
- **Flexibilidad:** El plan puede ajustarse según necesidades del negocio
- **Comunicación:** Mantener al usuario informado del progreso
