import { useState, useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import type { Producto } from '../types';

type LabelSize = 'small' | 'medium';

const sizeConfig: Record<LabelSize, { width: string; height: string; cols: number }> = {
  small: { width: '40mm', height: '30mm', cols: 4 },
  medium: { width: '60mm', height: '40mm', cols: 3 },
};

interface Props {
  productos: Producto[];
  onClose: () => void;
}

export const EtiquetaModal = ({ productos, onClose }: Props) => {
  const [size, setSize] = useState<LabelSize>('small');
  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const init: Record<number, number> = {};
    productos.forEach((p) => {
      init[p.id] = 1;
    });
    return init;
  });

  const barcodeRefs = useRef<Map<number, SVGSVGElement>>(new Map());

  useEffect(() => {
    productos.forEach((p) => {
      const svg = barcodeRefs.current.get(p.id);
      if (svg && p.codigoBarras) {
        try {
          JsBarcode(svg, p.codigoBarras, {
            format: 'ean13',
            width: 1.5,
            height: size === 'small' ? 30 : 40,
            displayValue: true,
            fontSize: size === 'small' ? 8 : 10,
            textMargin: 1,
            margin: 4,
          });
        } catch {
          svg.innerHTML = '';
        }
      }
    });
  }, [productos, size]);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);

  const config = sizeConfig[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/60 p-4 backdrop-blur-sm">
      <div className="ficha-pestana w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex select-none items-center justify-between border-b border-pauta px-5 py-4 print:hidden">
          <h3 className="font-ledger text-sm font-bold uppercase tracking-sello text-tinta">
            Imprimir etiquetas
          </h3>
          <button
            onClick={onClose}
            className="text-2xl font-bold leading-none text-tintaSuave transition-colors hover:text-oferta"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4 print:hidden">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="etiqueta">Tamaño</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as LabelSize)}
                className="select [&>option]:bg-papelAlto [&>option]:text-tinta"
              >
                <option value="small">Pequeña (40×30mm)</option>
                <option value="medium">Mediana (60×40mm)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="tabla min-w-full">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="text-center">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2">
                      <p className="font-medium text-tinta">{p.nombre}</p>
                      <p className="font-ledger text-xs text-tintaTenue">
                        {p.codigoBarras || 'Sin código'} — {formatCurrency(p.precioVenta)}
                      </p>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={quantities[p.id] ?? 1}
                        onChange={(e) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [p.id]: Math.max(1, parseInt(e.target.value) || 1),
                          }))
                        }
                        className="input w-16 text-center font-ledger"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="btn btn-papel">
              Cancelar
            </button>
            <button onClick={handlePrint} className="btn btn-primario">
              Imprimir ({productos.reduce((sum, p) => sum + (quantities[p.id] ?? 1), 0)} etiquetas)
            </button>
          </div>
        </div>

        <div className="etiqueta-print-area flex-1 overflow-y-auto p-4">
          <div
            className="grid gap-3 justify-center"
            style={{ gridTemplateColumns: `repeat(${config.cols}, ${config.width})` }}
          >
            {productos.flatMap((p) => {
              const qty = quantities[p.id] ?? 1;
              return Array.from({ length: qty }).map((_, i) => (
                <div
                  key={`${p.id}-${i}`}
                  className="etiqueta-label flex flex-col items-center justify-center border border-gray-300 bg-white"
                  style={{ width: config.width, height: config.height }}
                >
                  <span className="text-[7px] font-bold text-center leading-tight px-1 truncate w-full">
                    {p.nombre}
                  </span>
                  <svg
                    ref={(el) => {
                      if (el) barcodeRefs.current.set(p.id, el);
                    }}
                    className="mt-0.5"
                  />
                  <span className="text-[9px] font-bold text-center leading-tight">
                    {formatCurrency(p.precioVenta)}
                  </span>
                </div>
              ));
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
