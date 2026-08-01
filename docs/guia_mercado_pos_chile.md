# Guía de Mercado — Software de Caja para Almacenes en Chile

> Referencia de diseño (no de producto) para el rediseño del frontend de StockCaja.
> Objetivo: posicionar a StockCaja visualmente frente a la competencia chilena sin caer en
> "diseño de plantilla SaaS genérica" ni en "ERP denso y obsoleto".

## El mercado en 2 líneas

- **Rubro:** almacenes, minimarkets y botillerías de barrio. Ticket promedio bajo, alta rotación, caja única o pocas cajas.
- **Quién decide la compra:** el dueño del negocio (no un comprador corporativo). Valora simplicidad, precio claro y soporte local.
- **Hardware típico:** PC o tablet + lector de código de barras + impresora térmica + (opcional) cajón de dinero.

## Competencia directa en Chile

| Producto | Formato | Carácter visual | Lección para StockCaja |
|---|---|---|---|
| **Super Cajero** (supercajero.cl) | Web, multi-local | Denso, "caja registradora", clásico de escritorio | Anti-referencia estética. Referencia de flujo: promete ser "más rápido que una caja registradora" |
| **El Almacén** (elalmacen.cl) | Windows desktop | ERP clásico: barras de menú, tablas grises | Anti-referencia visual. Referencia de UX real del mostrador: código de barras, crédito fiado, arqueo diario |
| **Almasend** (almasend.app) | Cloud (tablet) | Moderno, claro, tarjetas simples | Referencia de claridad + velocidad de onboarding |
| **GranLoop** | Cloud, IA | Moderno claro, dashboards de inventario | Referencia de dashboard/reportes para el dueño |
| **DUOPOS / CorePOS** | Cloud, ERP | Moderno comercial claro | Referencia de sistema multi-caja |
| **Siigo Kame / Laudus / Bsale** | Cloud, ERP | Moderno comercial, SII + Transbank integrados | Referencia de "profesional" del mercado masivo |
| **Loyverse / Rofex** | Cloud | Minimalista, simple | Referencia de POS mínimo y rápido (Rofex desde ~$11.900/mes) |

## Los dos polos a evitar

1. **El polo "denso y feo"** (Super Cajero, El Almacén): funcional pero visualmente obsoleto. Nadie lo quiere de portafolio.
2. **El polo "plantilla SaaS"** (la estética que la mayoría de los SaaS web clonan): crema/plomo, tarjetas anidadas, gradientes, inter por defecto, iconos redondeados sobre cada encabezado. Es lo que un observador identifica al instante como "hecho por IA".

**Oportunidad de StockCaja:** un término medio artesanal — claro, moderno, funcional y denso en información útil, pero con personalidad de negocio real (no plantilla), sin brillos de neón ni estética de terminal artificial.

## Constantes del rubro que el diseño debe respetar

- **La velocidad de caja es el producto.** "Vende en segundos" es la promesa común. Menos clics, escáner continuo, botones grandes táctiles.
- **Dos audiencias en el mismo sistema:**
  - El **cajero** → pantalla de venta casi táctil, números grandes, sin distracciones.
  - El **dueño** → backoffice claro: cuánto vendí, cuánto gané, qué falta por comprar.
- **Contexto chileno obligatorio:**
  - Moneda: CLP sin decimales (formato `$1.234`, `es-CL`).
  - Folio de venta interno tipo `BOL-####`.
  - Caja por turnos con arqueo (apertura, retiros, cierre con diferencia).
  - IVA 19% en el roadmap de precios/boleta.
  - Roadmap: boleta/factura electrónica SII, Transbank/SumUp.

## Decisiones de diseño derivadas (guía para Fases D-E)

1. **Claro y legible** en condición de luz variable del local (nada de negro terminal con neón).
2. **Cifras protagonistas** en el POS y en el dashboard: total a pagar, ganancia del día, stock bajo — grandes y sin adornos.
3. **Un solo sistema de diseño** para POS y backoffice (hoy están divididos y se nota).
4. **Personalidad sobria y real:** tipografía con carácter (no Inter por defecto), paleta inspirada en el mundo del negocio local, sin gradientes genéricos ni tarjetas anidadas.
5. **Anti-referencias explícitas:** sin "terminal LED", sin borde lateral tipo pestaña, sin chips de estado en sopa, sin tarjetas dentro de tarjetas.

## Fuentes

- supercajero.cl · elalmacen.cl · almasend.app · granloop.com · duopos.cl · corepos.cl
- kame.cl (Siigo Kame) · laudus.cl (Laudus POS) · bsale.cl · rofex.cl
- Comparativas 2026: granloop.com/blog, webiados.com/blog/sistema-pos-chile-2026-comparativa, comparasoftware.cl
