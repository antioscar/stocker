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

  const titulo =
    mode === 'apertura'
      ? 'Apertura de caja'
      : mode === 'cierre'
        ? 'Cierre de caja'
        : 'Entrada / salida manual';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/60 p-4 backdrop-blur-sm">
      <div className="ficha-pestana-grafito w-full max-w-lg overflow-hidden">
        <div className="flex select-none items-center justify-between border-b border-pauta px-5 py-4">
          <h3 className="font-ledger text-sm font-bold uppercase tracking-sello text-tinta">
            {titulo}
          </h3>
          <button
            onClick={onClose}
            className="text-2xl font-bold leading-none text-tintaSuave transition-colors hover:text-oferta"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 border-2 border-oferta bg-oferta/10 px-4 py-3 font-ledger text-xs font-bold uppercase tracking-sello text-oferta">
            {error}
          </div>
        )}

        {mode === 'apertura' && (
          <form onSubmit={handleAperturaSubmit} className="space-y-4 p-6">
            <div>
              <p className="mb-3 font-ledger text-xs leading-relaxed text-tintaSuave">
                Declare el saldo inicial de efectivo disponible en gaveta (sencillo/cambio).
              </p>
              <label className="etiqueta">Efectivo de apertura (CLP) *</label>
              <input
                type="number"
                min="0"
                required
                value={montoApertura}
                onChange={(e) => setMontoApertura(e.target.value)}
                placeholder="Ej: 10000"
                className="input font-ledger"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={onClose} className="btn btn-papel">
                Cancelar
              </button>
              <button type="submit" disabled={isLoading} className="btn btn-hoja">
                {isLoading ? 'Abriendo…' : 'Abrir caja'}
              </button>
            </div>
          </form>
        )}

        {mode === 'cierre' && sessionData && (
          <form onSubmit={handleCierreSubmit} className="space-y-4 p-6">
            <div className="select-none border-2 border-pauta bg-papelAlto p-4 font-ledger text-xs">
              <div className="flex justify-between py-1">
                <span className="text-tintaSuave">Apertura inicial:</span>
                <span className="font-bold text-tinta">{formatCurrency(sessionData.montoApertura)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-tintaSuave">Ventas en efectivo (+):</span>
                <span className="font-bold text-hoja">{formatCurrency(sessionData.ventasEfectivo)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-tintaSuave">Ingresos manuales (+):</span>
                <span className="font-bold text-hoja">{formatCurrency(sessionData.ingresosManuales)}</span>
              </div>
              <div className="flex justify-between border-b border-pauta py-1">
                <span className="text-tintaSuave">Egresos manuales (-):</span>
                <span className="font-bold text-oferta">{formatCurrency(sessionData.egresosManuales)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-sm font-black text-tinta">
                <span>Efectivo esperado en caja:</span>
                <span>{formatCurrency(sessionData.efectivoEsperado)}</span>
              </div>
              <div className="space-y-0.5 border-t border-pauta pt-1.5 text-tintaTenue">
                <div className="flex justify-between py-0.5">
                  <span>Ventas tarjeta:</span>
                  <span>{formatCurrency(sessionData.ventasTarjeta)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Ventas transferencia:</span>
                  <span>{formatCurrency(sessionData.ventasTransferencia)}</span>
                </div>
                <div className="flex justify-between py-0.5 font-bold text-tintaSuave">
                  <span>Total ventas turno:</span>
                  <span>{formatCurrency(sessionData.totalVentas)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="etiqueta">Monto de cierre real contado (CLP) *</label>
              <input
                type="number"
                min="0"
                required
                value={montoCierre}
                onChange={(e) => setMontoCierre(e.target.value)}
                placeholder="Monto contado físicamente en caja"
                className="input font-ledger"
                autoFocus
              />
            </div>

            {montoCierre && (
              (() => {
                const diff = parseFloat(montoCierre) - sessionData.efectivoEsperado;
                return (
                  <div
                    className={`flex justify-between rounded-ficha border-2 px-3 py-2.5 font-ledger text-xs font-bold uppercase tracking-sello ${
                      diff === 0
                        ? 'border-hoja bg-hoja/10 text-hoja'
                        : diff > 0
                          ? 'border-sello bg-sello/20 text-tinta'
                          : 'border-oferta bg-oferta/10 text-oferta'
                    }`}
                  >
                    <span>Discrepancia / diferencia:</span>
                    <span>
                      {formatCurrency(diff)}
                      {diff === 0 && ' (cuadrado)'}
                      {diff > 0 && ' (sobrante)'}
                      {diff < 0 && ' (faltante)'}
                    </span>
                  </div>
                );
              })()
            )}

            <div>
              <label className="etiqueta">Observaciones (opcional)</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej: Diferencia por vuelto de $100, etc."
                className="input"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={onClose} className="btn btn-papel">
                Cancelar
              </button>
              <button type="submit" disabled={isLoading} className="btn btn-primario">
                {isLoading ? 'Cerrando…' : 'Cerrar turno'}
              </button>
            </div>
          </form>
        )}

        {mode === 'movimiento' && (
          <form onSubmit={handleMovimientoSubmit} className="space-y-4 p-6">
            <div>
              <label className="etiqueta">Tipo de transacción</label>
              <div className="grid grid-cols-2 gap-2 select-none">
                <button
                  type="button"
                  onClick={() => setTipoMovimiento('INGRESO')}
                  className={`rounded-ficha border-2 px-3 py-2.5 font-ledger text-xs font-bold uppercase tracking-sello transition-colors ${
                    tipoMovimiento === 'INGRESO'
                      ? 'border-hoja bg-hoja/10 text-hoja'
                      : 'border-pautaOscura bg-papelAlto text-tintaSuave hover:bg-card'
                  }`}
                >
                  Ingreso (sencillo)
                </button>
                <button
                  type="button"
                  onClick={() => setTipoMovimiento('EGRESO')}
                  className={`rounded-ficha border-2 px-3 py-2.5 font-ledger text-xs font-bold uppercase tracking-sello transition-colors ${
                    tipoMovimiento === 'EGRESO'
                      ? 'border-oferta bg-oferta/10 text-oferta'
                      : 'border-pautaOscura bg-papelAlto text-tintaSuave hover:bg-card'
                  }`}
                >
                  Egreso (gasto)
                </button>
              </div>
            </div>

            <div>
              <label className="etiqueta">Monto (CLP) *</label>
              <input
                type="number"
                min="1"
                required
                value={montoMovimiento}
                onChange={(e) => setMontoMovimiento(e.target.value)}
                placeholder="Ej: 5000"
                className="input font-ledger"
                autoFocus
              />
            </div>

            <div>
              <label className="etiqueta">Motivo / descripción *</label>
              <input
                type="text"
                required
                value={motivoMovimiento}
                onChange={(e) => setMotivoMovimiento(e.target.value)}
                placeholder="Ej: Pago panadería local, compra cambio, etc."
                className="input"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={onClose} className="btn btn-papel">
                Cancelar
              </button>
              <button type="submit" disabled={isLoading} className="btn btn-grafito">
                {isLoading ? 'Registrando…' : 'Registrar movimiento'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
