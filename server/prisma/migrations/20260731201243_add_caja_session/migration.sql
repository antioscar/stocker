-- CreateTable
CREATE TABLE "CajaSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "montoApertura" REAL NOT NULL,
    "montoCierre" REAL,
    "estado" TEXT NOT NULL DEFAULT 'ABIERTA',
    "aperturaAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cierreAt" DATETIME,
    "observaciones" TEXT,
    "diferencia" REAL,
    CONSTRAINT "CajaSession_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MovimientoCaja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cajaSessionId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "motivo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MovimientoCaja_cajaSessionId_fkey" FOREIGN KEY ("cajaSessionId") REFERENCES "CajaSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Venta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "folio" TEXT NOT NULL,
    "clienteId" INTEGER,
    "usuarioId" INTEGER NOT NULL,
    "cajaSessionId" INTEGER,
    "subtotal" REAL NOT NULL,
    "descuento" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "anulada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Venta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Venta_cajaSessionId_fkey" FOREIGN KEY ("cajaSessionId") REFERENCES "CajaSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Venta" ("anulada", "clienteId", "createdAt", "descuento", "folio", "id", "metodoPago", "subtotal", "total", "usuarioId") SELECT "anulada", "clienteId", "createdAt", "descuento", "folio", "id", "metodoPago", "subtotal", "total", "usuarioId" FROM "Venta";
DROP TABLE "Venta";
ALTER TABLE "new_Venta" RENAME TO "Venta";
CREATE INDEX "Venta_folio_idx" ON "Venta"("folio");
CREATE INDEX "Venta_usuarioId_idx" ON "Venta"("usuarioId");
CREATE INDEX "Venta_clienteId_idx" ON "Venta"("clienteId");
CREATE INDEX "Venta_cajaSessionId_idx" ON "Venta"("cajaSessionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CajaSession_usuarioId_idx" ON "CajaSession"("usuarioId");

-- CreateIndex
CREATE INDEX "MovimientoCaja_cajaSessionId_idx" ON "MovimientoCaja"("cajaSessionId");
