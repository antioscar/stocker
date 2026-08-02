# Guía de Usuario — StockCaja

## Contenido

1. [Primeros pasos](#1-primeros-pasos)
2. [Para el Cajero](#2-para-el-cajero)
3. [Para el Administrador](#3-para-el-administrador)
4. [Preguntas frecuentes](#4-preguntas-frecuentes)

---

## 1. Primeros pasos

### Iniciar sesión

1. Abrir `http://localhost:5173` en el navegador
2. Ingresar email y contraseña
3. El sistema mostrará el **Dashboard** con el resumen del día

**Credenciales por defecto:**
- **ADMIN:** `admin@stockcaja.cl` / `admin123`
- **CAJERO:** se debe crear desde la pantalla de Usuarios (solo ADMIN)

### Navegación

La barra superior muestra las secciones disponibles:
- **Dashboard:** resumen de ventas del día
- **Ventas (POS):** punto de venta para cobrar
- **Productos:** gestión del inventario
- **Clientes:** registro de clientes y deudas
- **Proveedores:** contactos de abastecimiento
- **Compras:** registro de reposición de mercadería
- **Reportes:** estadísticas y KPIs
- **Usuarios:** gestión de cuentas (solo ADMIN)
- **Configuración:** datos del negocio (solo ADMIN)

**Indicador de caja** (esquina superior): muestra si la caja está abierta o cerrada para el usuario actual.

---

## 2. Para el Cajero

### Abrir caja

Antes de vender, debes abrir tu turno de caja:

1. Ir a **Ventas (POS)**
2. Si la caja está cerrada, aparecerá un formulario
3. Ingresar el **monto de apertura** (efectivo con el que empiezas el turno)
4. Presionar "Abrir caja"

### Vender (flujo básico)

1. **Buscar producto:** presiona **F1** o escribe en el buscador (nombre o código de barras)
2. **Agregar al carrito:** haz clic en el producto o presiona Enter
3. **Repetir** para cada producto
4. **Seleccionar método de pago:**
   - **F8:** Efectivo (pago exacto)
   - **F4:** Tarjeta
   - **F3:** Transferencia
   - **F2:** Fiado (requiere cliente seleccionado)
5. El sistema genera un ticket con folio **BOL-####**

### Vender al fiado

1. Seleccionar un cliente del selector desplegable (parte superior del POS)
2. El sistema muestra la deuda actual del cliente
3. Agregar productos al carrito normalmente
4. Presionar **F2** (Fiado)
5. La deuda del cliente se incrementa automáticamente

### Vender productos por peso

1. Buscar el producto pesable (marcado con badge "Pesable")
2. Al seleccionarlo, aparece un modal para ingresar el peso en **kg**
3. El sistema calcula el subtotal en vivo
4. Confirmar para agregar al carrito
5. Se puede re-editar el peso haciendo clic en el producto en el carrito

### Atajos de teclado en el POS

| Tecla | Acción |
|---|---|
| **F1** | Enfocar buscador de productos |
| **F2** | Pagar con fiado |
| **F3** | Pagar con transferencia |
| **F4** | Pagar con tarjeta |
| **F8** | Cobrar en efectivo |
| **F9** | Cancelar cobro |
| **F12** | Aplicar descuento al total |

### Cerrar caja (fin de turno)

1. Ir a **Ventas (POS)**
2. Hacer clic en el indicador de caja
3. Se abre el **modal de cierre** con:
   - Ventas en efectivo del turno
   - Ventas con tarjeta y transferencia
   - Ingresos y egresos manuales
   - Efectivo esperado
4. Contar el efectivo físico de la caja
5. Ingresar el **monto de cierre**
6. El sistema calcula la diferencia automáticamente
7. Presionar "Cerrar caja"

### Registrar movimientos de caja

Durante el turno puedes registrar ingresos o egresos extras:
1. En el modal de caja, usar "Movimiento manual"
2. Seleccionar tipo: **INGRESO** o **EGRESO**
3. Ingresar monto y motivo (ej: "Pago de flete", "Venta de cajas")
4. Confirmar

---

## 3. Para el Administrador

### Dashboard

Al iniciar sesión verás:
- **Total de ventas del día** (cantidad de tickets)
- **Ingresos totales** ($ del día)
- **Ticket promedio**
- **Ventas anuladas**
- **Accesos rápidos** a las secciones principales

### Gestionar productos

En **Productos** puedes:
- **Crear producto:** botón "+ Nuevo producto", llenar formulario con nombre, código de barras, precios, stock
- **Editar producto:** botón "Editar" en la tabla
- **Eliminar producto:** botón "Eliminar" (con confirmación)
- **Buscar:** por nombre o código de barras
- **Generar código de barras:** si un producto no tiene código, presiona "Generar código"
- **Imprimir etiquetas:** selecciona productos con checkboxes, presiona "Imprimir etiquetas", elige tamaño y cantidad

### Gestionar clientes

En **Clientes** puedes:
- **Crear/editar/eliminar** clientes
- **Ver saldo de deuda** de cada cliente
- **Registrar abonos:** botón "Abonos" → ingresar monto → confirmar
- **Ver historial:** botón "Cuenta corriente" → cartola completa de compras y abonos

### Gestionar proveedores

En **Proveedores** puedes administrar los contactos de abastecimiento (nombre, RUT, teléfono, dirección).

### Registrar compras (reposición)

En **Compras** puedes:
1. Seleccionar un proveedor
2. Ingresar tipo de documento (FACTURA / GUIA) y folio
3. Escanear o buscar productos uno por uno
4. Ingresar cantidad y precio de costo
5. Opcional: precio de venta sugerido (el sistema calcula el margen en vivo)
6. Confirmar compra

El sistema automáticamente:
- Suma el stock de cada producto
- Actualiza el precio de costo y venta
- Registra movimientos de stock tipo ENTRADA

### Reportes

En **Reportes** puedes ver:
- **KPIs del día/semana/mes:** total de ventas, ingresos, tickets, ticket promedio
- **Utilidad bruta:** ingresos menos costos (lo que realmente ganaste)
- **Ventas por día:** gráfico de barras con totales diarios
- **Productos más vendidos:** ranking por cantidad e ingresos
- **Stock bajo:** productos con stock bajo el mínimo (para comprar)

### Gestionar usuarios (solo ADMIN)

En **Usuarios** puedes:
- **Crear** usuarios con rol **CAJERO** o **ADMIN**
- **Editar** nombre, email y rol
- **Activar/desactivar** usuarios
- **Eliminar** usuarios

### Configuración del negocio (solo ADMIN)

En **Configuración** puedes modificar:
- Nombre del negocio
- RUT
- Dirección
- Teléfono
- Folio correlativo actual

### Anular una venta (solo ADMIN)

1. Ir a **Reportes** o buscar en el historial de ventas
2. Localizar la venta por folio
3. Presionar "Anular"
4. Ingresar motivo de anulación
5. Confirmar

**Importante:** al anular una venta, el stock se devuelve automáticamente. El folio **no se reutiliza**.

### Backup de la base de datos

Para hacer una copia de seguridad:
1. Copiar el archivo `server/prisma/dev.db`
2. O usar el endpoint `GET /api/backup` (descarga el archivo SQLite)

---

## 4. Preguntas frecuentes

### ¿Qué hago si se cierra el navegador durante una venta?

La venta no se completa hasta que se presiona "Cobrar". Si el navegador se cierra antes, el carrito se pierde pero el stock no se descuenta. Puedes volver a abrir y empezar de nuevo.

### ¿Puedo vender sin tener caja abierta?

No. El sistema exige que abras caja antes de realizar ventas. Esto asegura que el arqueo al cierre sea correcto.

### ¿Qué pasa si el stock llega a cero?

Los productos con stock bajo el mínimo aparecen en **Reportes → Stock bajo**. No se pueden vender productos con stock 0 (el sistema rechaza la venta).

### ¿Cómo agrego un código de barras a un producto que no tiene?

En **Productos**, busca el producto sin código y presiona **"Generar código"**. El sistema asigna automáticamente un código EAN-13 interno.

### ¿Puedo imprimir etiquetas para todos los productos?

Sí. En **Productos**, selecciona los productos con los checkboxes y presiona **"Imprimir etiquetas"**. Puedes elegir tamaño pequeño (40×30mm) o mediano (60×40mm) y la cantidad de etiquetas por producto.

### ¿El sistema calcula el IVA?

En la versión actual, el IVA del 19% se muestra desglosado en el POS pero no se registra en la base de datos. La integración completa con el SII (boleta electrónica) está planificada para una versión futura.

### ¿Cómo cambio mi contraseña?

Actualmente no hay pantalla de cambio de contraseña. Un usuario ADMIN puede editar tu cuenta desde **Usuarios**.

### ¿Funciona sin internet?

Sí. StockCaja v1 es completamente on-premise. El servidor y la base de datos corren en la misma máquina, sin depender de internet.
