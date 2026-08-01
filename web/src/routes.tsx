// Frontend routing configuration
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Productos } from './pages/Productos';
import { Clientes } from './pages/Clientes';
import { Reportes } from './pages/Reportes';
import { Usuarios } from './pages/Usuarios';
import { Configuracion } from './pages/Configuracion';
import { Proveedores } from './pages/Proveedores';
import { Compras } from './pages/Compras';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="ventas" element={<POS />} />
        <Route path="productos" element={<Productos />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="proveedores" element={<Proveedores />} />
        <Route path="compras" element={<Compras />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
