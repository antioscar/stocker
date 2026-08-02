# Análisis de Mercado POS Chile — StockCaja 2026

> Investigación actualizada del mercado chileno de sistemas de punto de venta y gestión de inventario para almacenes y negocios de barrio.
> Julio 2026

---

## 1. Panorama del mercado chileno

El mercado de sistemas POS para el comercio minorista en Chile está compuesto por:

- **~15,000 almacenes de barrio** (canal tradicional) que facturan entre $1M y $20M CLP mensuales
- **~50,000 pequeños comercios** (ferreterías, cafeterías, botillerías, tiendas de ropa)
- **Penetración tecnológica baja:** el 73% gestiona inventario con Excel o a mano
- **Obligación SII desde 2025:** boleta electrónica obligatoria (impresa o digital)

---

## 2. Competidores principales (Julio 2026)

### 2.1 Bsale

| Atributo | Valor |
|---|---|
| **Modelo** | SaaS (nube) |
| **Precio** | 1,9 - 2,9 UF/mes (~$72.000 - $110.000 CLP) |
| **Clientes** | 12.132 empresas, 52.204 sucursales |
| **Fortalezas** | Boleta/factura electrónica SII nativa, multi-sucursal, ecommerce integrado, app móvil, soporte local |
| **Debilidades** | Costo mensual elevado para almacenes pequeños, solo online (sin internet no funciona) |
| **Público objetivo** | PYMEs establecidas con múltiples canales de venta |

### 2.2 Loyverse

| Atributo | Valor |
|---|---|
| **Modelo** | Freemium (POS gratis, add-ons de pago) |
| **Precio** | $0 base + add-ons $5-25 USD/mes c/u |
| **Clientes** | 1M+ negocios en 170 países |
| **Fortalezas** | App móvil nativa, funciona offline, 30+ idiomas, integraciones SumUp, hardware compatible |
| **Debilidades** | No emite boleta electrónica SII directamente, requiere conector externo, soporte no local |
| **Público objetivo** | Negocios pequeños que buscan POS gratuito con funcionalidad básica |

### 2.3 GranLoop (NUEVO — 2026)

| Atributo | Valor |
|---|---|
| **Modelo** | SaaS (nube) |
| **Precio** | UF 1 - 3/mes (~$38.000 - $114.000 CLP) |
| **Clientes** | En crecimiento (ganador Fondo Abastible Pyme² 2026) |
| **Fortalezas** | **IA para propuestas de compra**, conexión SII automática (importa facturas de proveedores sin digitar), análisis de márgenes, alertas de rentabilidad, boleta electrónica |
| **Debilidades** | Solo online, enfocado en minimarkets (no otros rubros), empresa nueva (2026) |
| **Público objetivo** | Minimarkets y almacenes con 200-5.000 SKU que quieren dejar Excel |

### 2.4 DUOPOS (NUEVO — 2026)

| Atributo | Valor |
|---|---|
| **Modelo** | SaaS (nube) |
| **Precio** | UF 0,5 - 3,9/mes (~$19.000 - $148.000 CLP) |
| **Clientes** | 500+ negocios activos |
| **Fortalezas** | Facturación SII, **compras asistidas con IA** (fotografía facturas), multi-sucursal, integración Transbank/Getnet/Mercado Pago, continuidad operacional, app POS |
| **Debilidades** | Empresa nueva, menos trayectoria que Bsale |
| **Público objetivo** | PYMEs con operación diaria estable y crecimiento planificado |

### 2.5 Super Cajero / Almacenes Digitales

| Atributo | Valor |
|---|---|
| **Modelo** | Licencia única + SaaS |
| **Precio** | Variable (gratuito a pago único) |
| **Clientes** | Miles de almacenes (SII los lista como proveedores autorizados) |
| **Fortalezas** | Cumplimiento SII, interfaz simple, bajo costo |
| **Debilidades** | Interfaz obsoleta, reportes deficientes, sin IA, sin offline, sin app móvil moderna |

---

## 3. Tendencias del mercado (2026)

### 3.1 Inteligencia Artificial para decisiones

**Tendencia:** GranLoop y DUOPOS están incorporando IA para analizar datos de ventas y generar recomendaciones accionables. Esto era impensable hace 2 años en este segmento de mercado.

**Qué hacen:**
- Propuestas diarias de compra (qué, cuánto, a qué proveedor)
- Detección de márgenes erosionados
- Identificación de productos sin rotación
- Análisis de precios de competencia (GranLoop)

**Implicancia para StockCaja:** La IA es el nuevo diferenciador. Un sistema que solo "registra" ventas ya no compite. Hay que incorporar capacidades de análisis inteligente.

### 3.2 Conexión automática con el SII

**Tendencia:** La integración con el SII ya no es solo para emitir boletas, sino para **importar facturas de proveedores** automáticamente.

**Qué hacen:**
- Descarga automática de DTE recibidos (facturas de compra)
- Cruce automático con inventario
- Actualización de precios de costo sin ingreso manual
- Conciliación de facturas vs. órdenes de compra

**Implicancia para StockCaja:** Esto elimina la principal tarea manual del dueño: digitar facturas de proveedores.

### 3.3 Modo offline

**Tendencia:** En Chile, la conectividad no es confiable en todos los barrios. Loyverse lidera con modo offline nativo. DUOPOS tiene "continuidad operacional".

**Implicancia para StockCaja:** Vender sin internet es una ventaja competitiva real para almacenes de barrio.

### 3.4 App móvil para el dueño

**Tendencia:** Bsale y Loyverse tienen apps nativas. El dueño quiere ver sus números desde cualquier lugar, no solo desde el PC de la caja.

**Implicancia para StockCaja:** Una app móvil de solo-lectura (reportes) es suficiente para la primera versión.

### 3.5 Integración con medios de pago

**Tendencia:** SumUp, Transbank, Getnet y Mercado Pago son estándar. La integración directa evita errores de digitación de montos en el terminal.

**Implicancia para StockCaja:** Integración con al menos 2 proveedores de pago es necesaria para competir.

---

## 4. Posicionamiento diferencial de StockCaja

### Ventajas competitivas actuales

| Ventaja | Explicación |
|---|---|
| **Licencia única (no suscripción)** | Los competidores cobran UF/mes. StockCaja se paga una vez. Para un almacén que factura $5M/mes, esto significa ahorrar $500K-$1M CLP al año. |
| **On-premise (no depende de internet)** | SQLite local. No hay latencia, no hay caídas de servidor. Ideal para locales con internet inestable. |
| **Control de caja por turnos** | Arqueo con diferencia, ingresos/egresos manuales, efectivo esperado. Más completo que la mayoría. |
| **Fiado/crédito integrado** | Cuenta corriente por cliente con abonos y cartola. Esencial en almacenes de barrio. Pocos competidores lo tienen bien resuelto. |
| **Pesables (venta por peso)** | Productos a granel con cálculo en vivo. Presente en DUOPOS y GranLoop pero no en todos. |
| **Etiquetas con código de barras** | Generación EAN-13 interna + impresión de etiquetas. Útil para productos sin código. |
| **Diseño moderno (tema V3)** | Interfaz blanca minimalista con verde de marca. Más moderno que Super Cajero y Almacenes Digitales. |

### Desventajas frente a la competencia

| Desventaja | Competidores que lo tienen |
|---|---|
| **Sin boleta electrónica SII** | Bsale, GranLoop, DUOPOS, Super Cajero |
| **Sin IA para análisis/compras** | GranLoop, DUOPOS |
| **Sin conexión SII automática** | GranLoop |
| **Sin app móvil** | Bsale, Loyverse, DUOPOS |
| **Sin modo offline** | Loyverse |
| **Sin integración con medios de pago** | Bsale, DUOPOS, Loyverse (SumUp) |
| **Sin ecommerce** | Bsale |
| **Sin multi-sucursal** | Bsale, DUOPOS, GranLoop |
| **Sin gráficos interactivos en reportes** | Todos |

---

## 5. Gaps funcionales — Priorización

### 🔴 Críticos (deben estar en los próximos 3-6 meses)

1. **Dashboard con gráficos interactivos** — Es la cara visible del producto. Sin gráficos, los reportes se ven básicos.
2. **Análisis de márgenes por producto** — El dueño necesita saber qué productos le dejan plata.
3. **Alertas inteligentes** — Stock bajo, sin rotación, margen erosionado.
4. **Boleta electrónica SII** — Obligación legal desde 2025. Sin esto no se puede vender el sistema en Chile.

### 🟡 Importantes (6-12 meses)

5. **IA para propuestas de compra** — Diferenciador fuerte. GranLoop lo tiene como core feature.
6. **Escaneo de código de barras omnipotente** — Mejora drástica en velocidad de caja.
7. **Modo offline** — Ventaja competitiva en barrios con internet inestable.
8. **Conexión SII automática (importar facturas)** — Elimina la digitación manual del dueño.
9. **App móvil para dueños** — Reportes desde el celular.

### 🟢 Deseables (12+ meses)

10. **Integración SumUp/Transbank** — Cobro con tarjeta integrado.
11. **Fidelización de clientes** — Puntos y descuentos por frecuencia.
12. **Multi-sucursal** — Para negocios con más de un local.
13. **Ecommerce integrado** — Tienda online sincronizada.
14. **Impresión térmica ESC/POS** — Tickets con formato profesional.

---

## 6. Estrategia recomendada

### Diferenciador principal: Licencia única + on-premise

Ningún competidor grande ofrece licencia única. Todos son SaaS con cobro mensual en UF. Este es el ángulo de venta más fuerte para almacenes de barrio que no quieren otro gasto fijo mensual.

### Diferenciador secundario: Visibilidad para el dueño

El dueño de un almacén no es contador. StockCaja debe mostrarle su ganancia real (utilidad bruta) sin que tenga que hacer cálculos. El Dashboard y los Reportes deben ser la pantalla más valiosa del sistema.

### Estrategia de funcionalidades

1. **Primero consolidar lo que ya funciona:** Dashboard, márgenes, alertas.
2. **Luego agregar diferenciadores:** IA compras, SII automático.
3. **Finalmente expandir canales:** App móvil, ecommerce, multi-sucursal.

### No competir en:

- **Ser el más barato** — Ya hay opciones gratuitas. Competir en valor, no en precio.
- **Ser el más completo** — Bsale tiene 10 años de desarrollo. Competir en simplicidad y foco (almacenes de barrio).
- **Ser el más bonito** — Aunque el diseño es una ventaja, no es el factor de compra principal para un almacenero.

---

## 7. Conclusión

StockCaja v1 es un producto sólido para su etapa. Tiene las funcionalidades core que un almacén necesita para operar: POS, inventario, clientes, caja y reportes. Lo que le falta para competir de verdad es:

1. **Visibilidad mejorada** (gráficos, márgenes, alertas) — próximo trimestre
2. **Inteligencia** (IA para compras, análisis de rotación) — 6 meses
3. **SII** (boleta electrónica, importación de facturas) — 12 meses
4. **Movilidad** (app del dueño, modo offline) — 12-18 meses

El modelo de licencia única + on-premise es una ventaja real en un mercado donde todo es suscripción. Si se ejecutan bien los próximos 2 trimestres, StockCaja puede posicionarse como la alternativa sensata para el almacenero que no quiere pagar UF todos los meses.
