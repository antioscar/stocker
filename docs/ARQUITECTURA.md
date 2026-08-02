# Arquitectura Técnica de StockCaja

## 1. Visión general

StockCaja es una aplicación web **monolito** con backend y frontend separados en el mismo repositorio monorepo. La versión 1 está diseñada para ejecutarse **on-premise** (instalación local en un solo computador) con base de datos SQLite. La versión 2 migrará a **SaaS multi-tenant** con PostgreSQL.

```
┌──────────────────────────────────────────────┐
│              Navegador web                    │
│     http://localhost:5173 (dev)               │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  React + Vite + TypeScript + Tailwind   │ │
│  │                                          │ │
│  │  Login → Layout → Pages:                │ │
│  │  Dashboard, POS, Productos, Clientes,    │ │
│  │  Proveedores, Compras, Reportes,         │ │
│  │  Usuarios, Configuración                 │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
          │
          │ HTTP (REST API)
          │ JWT Bearer Token
          ▼
┌──────────────────────────────────────────────┐
│       Express API (Node.js + TypeScript)      │
│       http://localhost:3000/api                │
│                                                │
│  ┌──────────┐  ┌────────────┐  ┌─────────┐ │
│  │  Router  │  │  Middleware │  │  Utils  │ │
│  │  12 rutas│  │  Auth JWT   │  │  Barcode│ │
│  └──────────┘  └────────────┘  └─────────┘ │
│                      │                        │
│              ┌───────▼────────┐              │
│              │  Prisma ORM    │              │
│              └───────┬────────┘              │
│                      │                        │
│              ┌───────▼────────┐              │
│              │  SQLite (v1)   │              │
│              │  PostgreSQL(v2)│              │
│              └────────────────┘              │
└──────────────────────────────────────────────┘
```

---

## 2. Modelo de datos (Entidad-Relación)

```
Usuario
  └─ Ventas (1:N)
  └─ MovimientosStock (1:N)
  └─ CajaSessions (1:N)

Categoria
  └─ Productos (1:N)

Producto
  └─ VentaDetalles (1:N)
  └─ MovimientosStock (1:N)
  └─ CompraDetalles (1:N)

Cliente
  └─ Ventas (1:N)
  └─ PagosCredito (1:N)

Proveedor
  └─ ComprasInventario (1:N)

Venta (folio BOL-####)
  └─ CajaSession (N:1)
  └─ Cliente (N:1)
  └─ VentaDetalles (1:N)

CompraInventario
  └─ Proveedor (N:1)
  └─ Usuario (N:1)
  └─ CompraDetalles (1:N)

CajaSession
  └─ Usuario (N:1)
  └─ Ventas (1:N)
  └─ MovimientosCaja (1:N)

Configuracion (key-value, clave primaria compuesta)
```

### Modelos principales:

| Modelo | Campos clave | Reglas |
|---|---|---|
| **Usuario** | id, email (único), passwordHash, rol (ADMIN/CAJERO), activo | Solo ADMIN gestiona usuarios |
| **Producto** | id, codigoBarras, precioVenta, precioCosto, stock (Float), stockMinimo, unidad, esPesable | Stock nunca negativo |
| **Venta** | id, folio (BOL-#### único), subtotal, descuento, total, metodoPago, anulada | Folio generado en transacción, nunca reutilizado |
| **VentaDetalle** | ventaId, productoId, cantidad (Float), precioUnitario, subtotal | Relaciona venta con productos |
| **MovimientoStock** | productoId, tipo (ENTRADA/SALIDA/AJUSTE), cantidad, motivo, usuarioId | Auditoría completa de inventario |
| **CajaSession** | usuarioId, montoApertura, montoCierre, estado (ABIERTA/CERRADA), diferencia | Una sesión abierta por usuario |
| **PagoCredito** (Fiado) | clienteId, monto, usuarioId | Registro de abonos a deuda |
| **Cliente** | nombre, telefono, saldoDeuda | Saldo deudor por compras al fiado |
| **Proveedor** | nombre, rut (único), telefono, email, direccion | Contactos de abastecimiento |
| **CompraInventario** | proveedorId, documentoTipo, documentoFolio, total | Registro de reposición |
| **CompraDetalle** | compraId, productoId, cantidad (Float), precioCostoUnitario | Detalle de ítems en compra |

---

## 3. Flujo de venta transaccional

```
1. Cajero abre caja   → CajaSession (estado: ABIERTA)
2. Cajero agrega productos al carrito   → Productos, cantidades
3. Cajero selecciona método de pago   → efectivo / tarjeta / transferencia / fiado
4. Cajero presiona Cobrar (F8)
        │
        ▼
5. Transacción atómica (Prisma.$transaction):
   a) Generar folio BOL-#### correlativo
   b) Crear Venta con items
   c) Si método = fiado: incrementar saldoDeuda del Cliente
   d) Por cada ítem:
      - Validar stock suficiente (si no → abortar)
      - Descontar stock del Producto
      - Crear VentaDetalle
      - Crear MovimientoStock (tipo: SALIDA, motivo: venta)
6. Retornar venta con detalles
```

### Anulación de venta:
```
1. ADMIN solicita anular venta
        │
        ▼
2. Transacción atómica:
   a) Marcar Venta.anulada = true
   b) Por cada detalle:
      - Devolver stock al Producto
      - Crear MovimientoStock (tipo: ENTRADA, motivo: anulación)
3. El folio NO se reutiliza
```

---

## 4. Decisiones técnicas

### ¿Por qué SQLite en v1?

- **Cero configuración:** archivo único, no requiere servidor de BD
- **Backup trivial:** copiar el archivo `.db`
- **Ideal para on-premise:** no depende de internet ni servicios externos
- **Migración transparente a PostgreSQL:** Prisma abstrae la diferencia entre motores

### ¿Por qué Prisma ORM?

- **Type-safe:** esquema declarativo, cliente tipado
- **Migraciones:** control de versión del esquema con `prisma migrate dev`
- **Transacciones:** `$transaction` para operaciones atómicas (ventas, compras)
- **Multi-engine:** mismo código para SQLite y PostgreSQL

### ¿Por qué JWT para autenticación?

- **Stateless:** no requiere sesiones en servidor
- **Roles en el token:** ADMIN o CAJERO, verificado en cada petición
- **Expiración:** tokens de 7 días, renovables con login

### ¿Por qué Tailwind CSS?

- **Utilidad-first:** desarrollo rápido sin archivos CSS separados
- **Design system integrado:** tokens de color, espaciado y tipografía en `tailwind.config.js`
- **Tree-shaking:** solo el CSS usado llega a producción (~30 kB)

### ¿Por qué folio BOL-#### y no SII?

- **v1 es operación local:** el foco es la gestión diaria del almacén
- **SII en v2:** boleta/factura electrónica chilena se integrará con LibreDTE
- **Folio interno:** correlativo único, generado en transacción, nunca reutilizado

---

## 5. Estructura de la API REST

```
POST   /api/auth/login               → { token, usuario }
GET    /api/auth/me                   → datos del usuario autenticado

GET    /api/caja/estado               → estado de caja (abierta/cerrada)
POST   /api/caja/apertura             → abrir caja con monto inicial
POST   /api/caja/cierre               → cerrar caja con arqueo
POST   /api/caja/movimientos          → ingreso/egreso manual

GET    /api/productos                 → listar (con búsqueda)
GET    /api/productos/:id             → obtener por ID
POST   /api/productos                 → crear
PUT    /api/productos/:id             → actualizar
DELETE /api/productos/:id             → eliminar
POST   /api/productos/:id/generar-codigo  → generar código EAN-13 interno

GET    /api/categorias                → listar categorías
POST   /api/categorias                → crear categoría

GET    /api/clientes                  → listar clientes (con búsqueda)
GET    /api/clientes/:id              → obtener por ID
POST   /api/clientes                  → crear
PUT    /api/clientes/:id              → actualizar
DELETE /api/clientes/:id              → eliminar
POST   /api/clientes/:id/abonos       → registrar abono (fiado)
GET    /api/clientes/:id/historial-cuenta  → cartola de cuenta corriente

GET    /api/proveedores               → listar
GET    /api/proveedores/:id           → obtener por ID
POST   /api/proveedores               → crear
PUT    /api/proveedores/:id           → actualizar
DELETE /api/proveedores/:id           → eliminar

POST   /api/compras                   → registrar compra (transaccional)
GET    /api/compras                   → listar compras

POST   /api/ventas                    → crear venta (transaccional)
GET    /api/ventas                    → listar ventas
GET    /api/ventas/:id                → detalle de venta
POST   /api/ventas/:id/anular         → anular venta (solo ADMIN)

GET    /api/usuarios                  → listar (solo ADMIN)
POST   /api/usuarios                  → crear (solo ADMIN)
PUT    /api/usuarios/:id              → actualizar (solo ADMIN)
DELETE /api/usuarios/:id              → eliminar (solo ADMIN)

GET    /api/reportes/resumen          → KPIs, ventas por día
GET    /api/reportes/productos-mas-vendidos
GET    /api/reportes/stock-bajo

GET    /api/configuracion             → obtener configuración
PUT    /api/configuracion             → actualizar configuración

GET    /api/backup                    → descargar copia de BD
```

---

## 6. Seguridad

- **Autenticación JWT:** todos los endpoints de escritura requieren token válido en header `Authorization: Bearer <token>`
- **Roles:** middleware `requireAdmin` protege endpoints administrativos
- **Validación de stock:** la venta falla si el stock es insuficiente (validado en transacción)
- **Folio único:** generado dentro de la misma transacción de la venta (evita colisiones)
- **Contraseñas:** hasheadas con bcryptjs (salt rounds = 10)
- **CORS:** habilitado para el frontend de desarrollo

---

## 7. Estrategia de tests

- **Framework:** Vitest + Supertest
- **Tipo:** tests de integración (prueban endpoints completos con base de datos real)
- **BD de tests:** SQLite en archivo temporal, recreada entre suites
- **Cobertura:** 58 tests cubriendo auth, productos, ventas, clientes, caja, compras, reportes y configuración
- **Ejecución:** `npm test` en `server/`
