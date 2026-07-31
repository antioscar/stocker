# README

# StockCaja

Sistema de gestión para almacenes/negocios locales: punto de venta, inventario, clientes, usuarios con roles y reportes.

## Instalación (local)

1. Clonar repositorio:

   ```bash
   git clone <repo-url>
   cd sinnombre1
   ```

2. Backend (`server/`):

   ```bash
   cd server
   npm install
   npx prisma migrate dev
   npm run dev
   ```

3. Frontend (`web/`):

   ```bash
   cd web
   npm install
   npm run dev
   ```

4. Abrir <http://localhost:5173> para acceder a la interfaz.

## Arquitectura

- **Backend** (`server/`): Node.js + Express + TypeScript + Prisma + SQLite (v1) → PostgreSQL (v2)
- **Frontend** (`web/`): React + Vite + TypeScript + Tailwind CSS

## Pantallas

- Login → Dashboard → POS → Inventario / Clientes / Usuarios / Reportes / Configuración

## Licencia

Licencia única por negocio.
