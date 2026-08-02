# StockCaja

Sistema de gestión para almacenes y negocios de barrio chilenos: punto de venta, inventario, clientes, usuarios con roles, reportes y control de caja por turnos.

---

## ¿Qué es StockCaja?

StockCaja es un sistema de punto de venta (POS) y control de inventario diseñado para que un almacén de barrio pueda gestionar su operación diaria sin depender de Excel, cuadernos o un contador.

**Propuesta de valor para el dueño:** saber al cierre del día cuánto vendió, cuánto ganó (utilidad bruta), qué stock se está agotando y si la caja cuadra.

---

## Funcionalidades principales

- **Punto de venta (POS):** carrito de compras, búsqueda de productos, métodos de pago (efectivo, tarjeta, transferencia, fiado), descuentos, atajos de teclado (F1-F12)
- **Ventas al fiado:** registro de ventas a crédito por cliente, abonos, cartola de cuenta corriente
- **Productos pesables:** venta por peso (kg) con ingreso de cantidad decimal
- **Control de caja por turnos:** apertura, cierre con arqueo, movimientos manuales (ingresos/egresos), diferencia
- **Inventario y stock:** stock nunca negativo, alertas de stock bajo, movimientos auditados (entrada/salida/ajuste)
- **Compras a proveedores:** registro rápido de reposición con auto-cálculo de márgenes
- **Códigos de barras:** generación automática de códigos internos (EAN-13) para productos sin código
- **Etiquetas imprimibles:** impresión de etiquetas con código de barras y precio (2 tamaños)
- **Reportes:** KPIs del día, utilidad bruta, productos más vendidos, stock bajo
- **Roles de usuario:** ADMIN (configuración, reportes, usuarios) y CAJERO (ventas y consulta de inventario)

---

## Arquitectura

| Capa | Tecnología |
|---|---|
| **Backend** | Node.js + Express + TypeScript |
| **Frontend** | React + Vite + TypeScript + Tailwind CSS |
| **ORM / BD** | Prisma + SQLite (v1 local) → PostgreSQL (v2 SaaS) |
| **Autenticación** | JWT con roles ADMIN / CAJERO |
| **Tests** | Vitest + Supertest (58 tests, 0 fallos) |

---

## Instalación local (Windows / Linux / Mac)

### Requisitos previos

- **Node.js** 18+ ([descargar](https://nodejs.org/))
- **npm** (incluido con Node.js)

### 1. Clonar el repositorio

```bash
git clone https://github.com/antioscar/stocker.git
cd sinnombre1
```

### 2. Instalar el backend

```bash
cd server
npm install
npx prisma migrate dev
npm run seed
```

### 3. Iniciar el backend

```bash
npm run dev
```

El servidor API estará disponible en `http://localhost:3000`.

### 4. Instalar el frontend (en otra terminal)

```bash
cd web
npm install
```

### 5. Iniciar el frontend

```bash
npm run dev
```

La aplicación web estará disponible en `http://localhost:5173`.

### 6. Acceder al sistema

**Usuario administrador por defecto:**
- Email: `admin@stockcaja.cl`
- Contraseña: `admin123`

---

## Estructura del proyecto

```
sinnombre1/
├── server/                 # Backend API
│   ├── prisma/
│   │   ├── schema.prisma   # Modelo de datos
│   │   ├── migrations/     # Migraciones
│   │   └── seed.js         # Datos de prueba
│   ├── src/
│   │   ├── index.ts        # Punto de entrada
│   │   ├── middleware/      # Auth JWT (login, roles)
│   │   ├── routes/          # Endpoints REST
│   │   └── utils/           # DB, generador de códigos
│   └── tests/               # Tests de integración
│       ├── auth.test.js
│       ├── productos.test.js
│       ├── ventas.test.js
│       ├── clientes.test.js
│       ├── caja.test.js
│       ├── compras.test.js
│       └── reportes.test.js
├── web/                     # Frontend React
│   ├── src/
│   │   ├── pages/           # Login, POS, Dashboard, CRUDs
│   │   ├── components/      # Layout, EtiquetaModal
│   │   ├── services/        # apiFetch (JWT)
│   │   └── types/           # Interfaces TypeScript
│   └── tailwind.config.js
├── docs/                    # Documentación
│   ├── CONTEXTO.md          # Plan, decisiones y registro de sesiones
│   ├── ARQUITECTURA.md      # Arquitectura técnica detallada
│   ├── GUIA_USUARIO.md      # Manual para cajeros y administradores
│   └── analisis_mercado_plan.md
├── DESIGN.md                # Sistema de diseño visual
├── PRODUCT.md               # Contexto del producto
├── AGENTS.md                # Instrucciones para agentes IA
└── README.md                # Este archivo
```

---

## Comandos útiles

### Backend (`server/`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Iniciar servidor de desarrollo (puerto 3000) |
| `npm run build` | Compilar TypeScript |
| `npm run seed` | Poblar base de datos con datos demo |
| `npm test` | Ejecutar tests (58 tests, Vitest + Supertest) |
| `npx prisma studio` | Explorar la base de datos visualmente |

### Frontend (`web/`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Iniciar servidor de desarrollo (puerto 5173) |
| `npm run build` | Compilar para producción |
| `npm run preview` | Previsualizar versión compilada |
| `npm run lint` | Ejecutar ESLint |

---

## Pantallas principales

| Pantalla | Descripción | Acceso |
|---|---|---|
| **Login** | Autenticación con email y contraseña | Público |
| **Dashboard** | KPIs del día, ventas, tickets, accesos rápidos | Autenticado |
| **POS (Ventas)** | Punto de venta con carrito y métodos de pago | Autenticado (requiere caja abierta) |
| **Productos** | CRUD de productos, generar códigos, imprimir etiquetas | Autenticado |
| **Clientes** | CRUD de clientes, historial de fiados y abonos | Autenticado |
| **Proveedores** | CRUD de proveedores | Autenticado |
| **Compras** | Registro rápido de reposición con márgenes automáticos | Autenticado |
| **Reportes** | Ventas, utilidad bruta, top productos, stock bajo | Autenticado |
| **Usuarios** | CRUD de usuarios con roles (ADMIN/CAJERO) | Solo ADMIN |
| **Configuración** | Datos del negocio (nombre, dirección, RUT) | Solo ADMIN |

---

## Atajos de teclado en el POS

| Tecla | Acción |
|---|---|
| **F1** | Enfocar buscador de productos |
| **F2** | Pagar con fiado (requiere cliente seleccionado) |
| **F3** | Pagar con transferencia |
| **F4** | Pagar con tarjeta |
| **F8** | Cobrar en efectivo |
| **F9** | Cancelar cobro |
| **F12** | Aplicar descuento |

---

## Roadmap futuro

Ver [`docs/ROADMAP.md`](docs/ROADMAP.md) para el detalle completo de hitos, prioridades y dependencias.

**Resumen:**

| Período | Hitos principales |
|---|---|
| **Q3 2026** | Dashboard con gráficos Recharts, análisis de márgenes, alertas inteligentes |
| **Q4 2026** | IA para propuestas de compra, escaneo omnipotente, modo offline, integración SumUp |
| **H1 2027** | App móvil del dueño, SII automático (importar facturas), boleta electrónica |
| **H2 2027+** | Impresión ticket térmico, SaaS multi-tenant PostgreSQL, ecommerce, fidelización |

---

## Licencia

Licencia única por negocio. Contactar al autor para adquirir.

---

## Autor

Desarrollado como proyecto de portafolio para el título de **Analista Programador**.

[Oscar](https://github.com/antioscar)
