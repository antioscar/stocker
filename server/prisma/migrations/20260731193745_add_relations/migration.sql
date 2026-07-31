-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MovimientoStock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT,
    "usuarioId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MovimientoStock_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MovimientoStock_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MovimientoStock" ("cantidad", "createdAt", "id", "motivo", "productoId", "tipo", "usuarioId") SELECT "cantidad", "createdAt", "id", "motivo", "productoId", "tipo", "usuarioId" FROM "MovimientoStock";
DROP TABLE "MovimientoStock";
ALTER TABLE "new_MovimientoStock" RENAME TO "MovimientoStock";
CREATE INDEX "MovimientoStock_productoId_idx" ON "MovimientoStock"("productoId");
CREATE INDEX "MovimientoStock_usuarioId_idx" ON "MovimientoStock"("usuarioId");
CREATE TABLE "new_Producto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "codigoBarras" TEXT,
    "categoriaId" INTEGER NOT NULL,
    "precioVenta" REAL NOT NULL,
    "precioCosto" REAL NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "unidad" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Producto" ("activo", "categoriaId", "codigoBarras", "createdAt", "id", "nombre", "precioCosto", "precioVenta", "stock", "stockMinimo", "unidad") SELECT "activo", "categoriaId", "codigoBarras", "createdAt", "id", "nombre", "precioCosto", "precioVenta", "stock", "stockMinimo", "unidad" FROM "Producto";
DROP TABLE "Producto";
ALTER TABLE "new_Producto" RENAME TO "Producto";
CREATE INDEX "Producto_categoriaId_idx" ON "Producto"("categoriaId");
CREATE TABLE "new_Venta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "folio" TEXT NOT NULL,
    "clienteId" INTEGER,
    "usuarioId" INTEGER NOT NULL,
    "subtotal" REAL NOT NULL,
    "descuento" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "anulada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Venta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Venta" ("anulada", "clienteId", "createdAt", "descuento", "folio", "id", "metodoPago", "subtotal", "total", "usuarioId") SELECT "anulada", "clienteId", "createdAt", "descuento", "folio", "id", "metodoPago", "subtotal", "total", "usuarioId" FROM "Venta";
DROP TABLE "Venta";
ALTER TABLE "new_Venta" RENAME TO "Venta";
CREATE INDEX "Venta_folio_idx" ON "Venta"("folio");
CREATE INDEX "Venta_usuarioId_idx" ON "Venta"("usuarioId");
CREATE INDEX "Venta_clienteId_idx" ON "Venta"("clienteId");
CREATE TABLE "new_VentaDetalle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ventaId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    CONSTRAINT "VentaDetalle_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VentaDetalle_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VentaDetalle" ("cantidad", "id", "precioUnitario", "productoId", "subtotal", "ventaId") SELECT "cantidad", "id", "precioUnitario", "productoId", "subtotal", "ventaId" FROM "VentaDetalle";
DROP TABLE "VentaDetalle";
ALTER TABLE "new_VentaDetalle" RENAME TO "VentaDetalle";
CREATE INDEX "VentaDetalle_ventaId_idx" ON "VentaDetalle"("ventaId");
CREATE INDEX "VentaDetalle_productoId_idx" ON "VentaDetalle"("productoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
