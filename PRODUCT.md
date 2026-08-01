# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Cajero** (rol CAJERO): opera el punto de venta en el mostrador del local. Jornadas largas, ritmo alto, atiende clientes de frente. Usa escáner de código de barras y/o teclado; en muchos locales, pantalla táctil. Necesita vender rápido sin mirar manuales.
- **Dueño / administrador** (rol ADMIN): atiende en caja cuando toca, pero su trabajo principal es revisar el negocio: cuánto vendió, cuánto ganó, qué se está agotando. Revisa reportes en el local o en el backoffice, normalmente después del cierre.

## Product Purpose

StockCaja gestiona la operación diaria de un almacén o negocio de barrio chileno: ventas en el punto de venta, inventario y stock, clientes, usuarios con roles y reportes. Existe para que un negocio que hoy se lleva en cuaderno, Excel o a ojo, pueda controlar su caja y su bodega sin depender de un contador para saber si está ganando. Éxito: el cajero cobra sin fricción y el dueño sabe, al cierre del día, cuánto ganó y qué le falta por comprar.

## Positioning

**Visibilidad para el dueño.** El mecanismo diferenciador no es cobrar más rápido (todos cobran), sino que el dueño del almacén pueda ver, en lenguaje llano y sin contador, su ganancia real (utilidad bruta: ingresos menos costos), su stock y el cuadre de su caja por turno. Competidores como Super Cajero o El Almacén controlan ventas pero no explican el negocio; Bsale/GranLoop son modernos pero genéricos o con IA. StockCaja le dice al dueño de un almacén de barrio "esto vendiste, esto ganaste, esto tienes".

## Operating Context

- **Mostrador:** caja física en el local, luz variable (día/noche, sol directo), ruido y movimiento. Operación por turnos de caja: apertura con saldo inicial, retiros de efectivo, cierre con arqueo y diferencia. Escaneo continuo de códigos de barras sin modales. Atajos de teclado para no tocar el mouse.
- **Backoffice:** revisión de reportes (ventas por día, productos más vendidos, stock bajo, utilidad bruta) y administración (productos, clientes, usuarios, configuración del negocio).
- **Despliegue v1:** local (on-premise), un solo negocio, base de datos SQLite. Migración futura a la nube/SaaS multi-tenant.
- **Chile:** moneda CLP (sin decimales, `$`), folio interno `BOL-####`, IVA del 19% ya desglosado en el POS. Facturación SII es roadmap futuro, NO está en v1.

## Capabilities and Constraints

- Roles: `ADMIN` (todo) y `CAJERO` (vender + ver inventario).
- Venta transaccional: valida stock, descuenta y genera `MovimientoStock` en la misma transacción. **Stock nunca negativo.**
- Folio correlativo `BOL-####` único por negocio, generado en transacción, **nunca reutilizado** ni al anular una venta.
- Caja por turnos: apertura, cierre con arqueo, ingresos/egresos manuales, efectivo esperado y diferencia.
- Reportes con utilidad bruta (ingresos - costos), productos más vendidos, stock bajo, ventas por día.
- IVA chileno 19% desglosado correctamente en el POS (impuesto bruto incluido en precio).
- POS: escaneo continuo en segundo plano, atajos F1/F2/F8/F9/F12, búsqueda por nombre o código.
- **No integrado aún:** SII/boleta electrónica (v2), terminales de pago Transbank/SumUp, multi-tenant, PostgreSQL.
- Términos de UI pueden cambiar libremente durante el rediseño; solo las reglas de negocio críticas (roles, folio, stock, caja) son inviolables.

## Brand Commitments

- Nombre: **StockCaja**. Tono **serio y de confianza** (no lúdico, no "startup"). Debe verse como una herramienta de trabajo de un negocio real, no como una plantilla de SaaS ni como un terminal de ciencia ficción.
- No forzar una estética de terminal/LED: se elimina la identidad visual actual de "caja industrial mate" por decisión del dueño del proyecto.

## Evidence on Hand

- Repositorio con backend funcional (`server/`) y frontend React/Vite/TS/Tailwind (`web/`).
- Seed: `admin@stockcaja.cl` / `admin123`, configuración de negocio precargada.
- `docs/CONTEXTO.md`: plan, decisiones y registro de sesiones.
- `docs/analisis_mercado_plan.md`: análisis del mercado chileno.
- Guía de competencia de mercado chileno a crear en `docs/guia_mercado_pos_chile.md`.
- No hay testimonios reales, casos de uso con clientes reales ni assets de marca más allá del nombre.

## Product Principles

1. **El dueño entiende su negocio sin contador.** Toda cifra clave (ganancia, stock, cuadre de caja) debe ser legible y explicarse sola.
2. **El cajero nunca se detiene.** La velocidad de caja es sagrada: escaneo, atajos, botones grandes, menos clics.
3. **El dinero y el stock no mienten.** Folio único, stock nunca negativo, caja que cuadra: las reglas de negocio críticas son inviolables.
4. **Funciona en el mundo real.** On-premise, luz variable, sin depender de internet constante, cero configuración compleja.
5. **Voz seria y directa.** Sin gamificación, sin exclamaciones, sin ruido visual. Texto breve que dice exactamente lo que hay que hacer.

## Accessibility & Inclusion

- Legibilidad con luz variable del local (contraste suficiente en cualquier condición).
- Objetivos táctiles grandes en el POS (dedo y pantalla táctil) además de teclado.
- Sin requisito de producto específico adicional confirmado; se conservan los estándares de accesibilidad web generales.
