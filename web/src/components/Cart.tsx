interface Producto {
  id: number;
  nombre: string;
  precioVenta: number;
  stock: number;
  unidad: string;
  esPesable?: boolean;
}

interface CartItem {
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface CartProps {
  items: CartItem[];
  onUpdateItem: (index: number, cantidad: number) => void;
  onRemoveItem: (index: number) => void;
  onEditPesable?: (index: number) => void;
}

export const Cart = ({ items, onUpdateItem, onRemoveItem, onEditPesable }: CartProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="pauta-fila flex min-h-72 flex-col items-center justify-center text-center">
            <div className="nav-tab flex h-10 w-10 items-center justify-center bg-pauta/70">
              <span className="text-sm font-bold text-tintaSuave">SC</span>
            </div>
            <p className="mt-3 font-display text-lg font-bold tracking-tight text-tintaSuave">
              Venta vacía
            </p>
            <p className="mt-0.5 text-xs text-tintaTenue">
              Escanee o busque un producto
            </p>
          </div>
        ) : (
          <table className="tabla">
            <thead className="sticky top-0 z-10 bg-card">
              <tr>
                <th className="w-28 text-center">Cant.</th>
                <th>Descripción</th>
                <th className="text-right">P. unit.</th>
                <th className="text-right">Subtotal</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="py-2 text-center">
                    {item.producto.esPesable ? (
                      <button
                        type="button"
                        onClick={() => onEditPesable && onEditPesable(index)}
                        className="px-2 py-1 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded font-ledger font-bold text-xs text-amber-700 transition-colors uppercase select-none cursor-pointer"
                        title="Haga clic para editar el peso"
                      >
                        {Number(item.cantidad.toFixed(3))} {item.producto.unidad}
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateItem(index, Math.max(1, item.cantidad - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-ficha border border-pautaOscura bg-papelAlto font-bold text-tinta transition-colors hover:bg-card"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-ledger text-base font-bold text-tinta">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateItem(index, item.cantidad + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-ficha border border-pautaOscura bg-papelAlto font-bold text-tinta transition-colors hover:bg-card"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-tinta">{item.producto.nombre}</div>
                    <div className="font-ledger text-xs text-tintaSuave">
                      Stock: {item.producto.stock} {item.producto.unidad}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-ledger text-tintaSuave">
                    {formatCurrency(item.precioUnitario)}
                  </td>
                  <td className="px-4 py-3 text-right font-ledger font-bold text-tinta">
                    {formatCurrency(item.subtotal)}
                  </td>
                  <td className="px-2 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="flex h-8 w-8 items-center justify-center rounded-ficha border border-oferta bg-oferta/10 text-lg font-bold leading-none text-oferta transition-colors hover:bg-oferta hover:text-papelAlto"
                      title="Eliminar producto"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
