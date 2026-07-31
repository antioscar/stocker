# StockCaja — Frontend

Interfaz de usuario del sistema StockCaja (React + Vite + TypeScript + Tailwind CSS).

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Instalación y ejecución

```bash
cd web
npm install
npm run dev
```

El frontend corre en http://localhost:5173. Requiere el backend en http://localhost:3000.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo Vite |
| `npm run build` | Compila la aplicación para producción |
| `npm run preview` | Previsualiza el build de producción |
| `npx tsc --noEmit` | Verifica tipos de TypeScript |

## Credenciales de prueba

- ADMIN: admin@stockcaja.cl / admin123

## Pantallas

- Login
- Dashboard
- Ventas (POS)
- Productos
- Clientes
- Reportes
- Usuarios (solo ADMIN)
- Configuración (solo ADMIN)
