import React, { useState } from 'react';
import { apiFetch } from '../services/api';

interface CajaSessionData {
  id: number;
  montoApertura: number;
  aperturaAt: string;
  ventasEfectivo: number;
  ventasTarjeta: number;
  ventasTransferencia: number;
  totalVentas: number;
  ingresosManuales: number;
  egresosManuales: number;
  efectivoEsperado: number;
}

interface CajaModalProps {
  mode: 'apertura' | 'cierre' | 'movimiento';
  onClose: () => void;
  onSuccess: () => void;
  sessionData?: CajaSessionData | null;
}

export const CajaModal = ({ mode, onClose, onSuccess, sessionData }: CajaModalProps) => {
  const [montoApertura, setMontoApertura] = useState('');
  const [montoCierre, setMontoCierre] = useState('');
  const [observaciones, setObservaciones] = useState('');
  
  // Para registrar ingresos / egresos
  const [tipoMovimiento, setTipoMovimiento] = useState<'INGRESO' | 'EGRESO'>('INGRESO');
  const [montoMovimiento, setMontoMovimiento] = useState('');
  const [motivoMovimiento, setMotivoMovimiento] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);

  const handleAperturaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const parsedAmount = parseFloat(montoApertura);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        throw new Error('El monto de apertura no puede ser negativo');
      }

      await apiFetch('/caja/apertura', {
        method: 'POST',
        body: JSON.stringify({ montoApertura: parsedAmount }),
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al abrir caja');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCierreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const parsedAmount = parseFloat(montoCierre);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        throw new Error('El monto de cierre no puede ser negativo');
      }

      await apiFetch('/caja/cierre', {
        method: 'POST',
        body: JSON.stringify({
          montoCierre: parsedAmount,
          observaciones: observaciones.trim() || undefined,
        }),
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar caja');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovimientoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const parsedAmount = parseFloat(montoMovimiento);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }
      if (!motivoMovimiento.trim()) {
        throw new Error('Debe ingresar un motivo');
      }

      await apiFetch('/caja/movimientos', {
        method: 'POST',
        body: JSON.stringify({
          tipo: tipoMovimiento,
          monto: parsedAmount,
          motivo: motivoMovimiento.trim(),
        }),
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar movimiento');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-55">
          <h3 className="text-lg font-bold text-gray-900">
            {mode === 'apertura' && 'Apertura de Caja'}
            {mode === 'cierre' && 'Cierre y Cuadratura de Caja'}
            {mode === 'movimiento' && 'Registrar Entrada / Salida Manual'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">
            ×
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Apertura Mode */}
        {mode === 'apertura' && (
          <form onSubmit={handleAperturaSubmit} className="p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Para iniciar ventas en el sistema, debes declarar el saldo inicial de efectivo en la caja registradora (sencillo).
              </p>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Efectivo de Apertura (CLP) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={montoApertura}
                onChange={(e) => setMontoApertura(e.target.value)}
                placeholder="Ej: 10000"
                className={inputClass}
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
              >
                {isLoading ? 'Abriendo...' : 'Abrir Caja'}
              </button>
            </div>
          </form>
        )}

        {/* Cierre Mode */}
        {mode === 'cierre' && sessionData && (
          <form onSubmit={handleCierreSubmit} className="p-6 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Apertura Inicial:</span>
                <span className="font-medium">{formatCurrency(sessionData.montoApertura)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ventas en Efectivo (+):</span>
                <span className="font-medium text-green-600">{formatCurrency(sessionData.ventasEfectivo)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ingresos Manuales (+):</span>
                <span className="font-medium text-green-600">{formatCurrency(sessionData.ingresosManuales)}</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-600">Egresos Manuales (-):</span>
                <span className="font-medium text-red-600">{formatCurrency(sessionData.egresosManuales)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 pt-1">
                <span>Efectivo Esperado en Caja:</span>
                <span>{formatCurrency(sessionData.efectivoEsperado)}</span>
              </div>
              <div className="pt-2 border-t text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Ventas Tarjeta:</span>
                  <span>{formatCurrency(sessionData.ventasTarjeta)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ventas Transferencia:</span>
                  <span>{formatCurrency(sessionData.ventasTransferencia)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Ventas Turno:</span>
                  <span>{formatCurrency(sessionData.totalVentas)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Monto de Cierre Real Contado (CLP) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={montoCierre}
                onChange={(e) => setMontoCierre(e.target.value)}
                placeholder="Monto contado físicamente en caja"
                className={inputClass}
                autoFocus
              />
            </div>

            {montoCierre && (
              <div className={`p-3 rounded text-sm font-semibold flex justify-between ${
                parseFloat(montoCierre) - sessionData.efectivoEsperado === 0
                  ? 'bg-green-50 text-green-700'
                  : 'bg-yellow-50 text-yellow-700'
              }`}>
                <span>Discrepancia / Diferencia:</span>
                <span>
                  {formatCurrency(parseFloat(montoCierre) - sessionData.efectivoEsperado)}
                  {parseFloat(montoCierre) - sessionData.efectivoEsperado === 0 && ' (Cuadrado)'}
                  {parseFloat(montoCierre) - sessionData.efectivoEsperado > 0 && ' (Sobrante)'}
                  {parseFloat(montoCierre) - sessionData.efectivoEsperado < 0 && ' (Faltante)'}
                </span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones (Opcional)
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej: Diferencia por vuelto de $100 pesos, etc."
                className={inputClass}
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50"
              >
                {isLoading ? 'Cerrando...' : 'Cerrar Turno y Caja'}
              </button>
            </div>
          </form>
        )}

        {/* Movimiento Mode */}
        {mode === 'movimiento' && (
          <form onSubmit={handleMovimientoSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Transacción
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoMovimiento"
                    value="INGRESO"
                    checked={tipoMovimiento === 'INGRESO'}
                    onChange={() => setTipoMovimiento('INGRESO')}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Ingreso (Sencillo/Cambio)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoMovimiento"
                    value="EGRESO"
                    checked={tipoMovimiento === 'EGRESO'}
                    onChange={() => setTipoMovimiento('EGRESO')}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Egreso (Gastos/Proveedores)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Monto (CLP) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={montoMovimiento}
                onChange={(e) => setMontoMovimiento(e.target.value)}
                placeholder="Ej: 5000"
                className={inputClass}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Motivo / Descripción *
              </label>
              <input
                type="text"
                required
                value={motivoMovimiento}
                onChange={(e) => setMotivoMovimiento(e.target.value)}
                placeholder="Ej: Pago panadería local, compra cambio, etc."
                className={inputClass}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
              >
                {isLoading ? 'Registrando...' : 'Registrar Movimiento'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
