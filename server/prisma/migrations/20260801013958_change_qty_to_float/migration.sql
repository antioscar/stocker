/*
  Warnings:

  - You are about to alter the column `cantidad` on the `CompraDetalle` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `cantidad` on the `MovimientoStock` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `stock` on the `Producto` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `stockMinimo` on the `Producto` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `cantidad` on the `VentaDetalle` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CompraDetalle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "compraId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" REAL NOT NULL,
    "precioCostoUnitario" REAL NOT NULL,
    CONSTRAINT "CompraDetalle_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "CompraInventario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CompraDetalle_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CompraDetalle" ("cantidad", "compraId", "id", "precioCostoUnitario", "productoId") SELECT "cantidad", "compraId", "id", "precioCostoUnitario", "productoId" FROM "CompraDetalle";
DROP TABLE "CompraDetalle";
ALTER TABLE "new_CompraDetalle" RENAME TO "CompraDetalle";
CREATE INDEX "CompraDetalle_compraId_idx" ON "CompraDetalle"("compraId");
CREATE INDEX "CompraDetalle_productoId_idx" ON "CompraDetalle"("productoId");
CREATE TABLE "new_MovimientoStock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" REAL NOT NULL,
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
    "stock" REAL NOT NULL DEFAULT 0,
    "stockMinimo" REAL NOT NULL DEFAULT 0,
    "unidad" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "esPesable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Producto" ("activo", "categoriaId", "codigoBarras", "createdAt", "id", "nombre", "precioCosto", "precioVenta", "stock", "stockMinimo", "unidad") SELECT "activo", "categoriaId", "codigoBarras", "createdAt", "id", "nombre", "precioCosto", "precioVenta", "stock", "stockMinimo", "unidad" FROM "Producto";
DROP TABLE "Producto";
ALTER TABLE "new_Producto" RENAME TO "Producto";
CREATE INDEX "Producto_categoriaId_idx" ON "Producto"("categoriaId");
CREATE TABLE "new_VentaDetalle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ventaId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" REAL NOT NULL,
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
