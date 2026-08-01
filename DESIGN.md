---
name: StockCaja
description: Punto de venta y control de caja para almacenes locales — blanco limpio, sobrio y profesional con acento verde.
colors:
  oferta: "#D64040"
  hoja: "#198754"
  sello: "#D97706"
  grafito: "#1B2430"
  grafito-oscuro: "#121A24"
  papel: "#F4F6F9"
  card: "#FFFFFF"
  papel-alto: "#FAFBFD"
  pauta: "#E3E7EE"
  pauta-oscura: "#C9D2DC"
  tinta: "#1F2937"
  tinta-suave: "#5B6573"
  tinta-tenue: "#8D97A5"
typography:
  display:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.01em"
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 500
rounded:
  ficha: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.hoja}"
    textColor: "{colors.card}"
    rounded: "{rounded.ficha}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "#116A3F"
  button-secondary:
    backgroundColor: "{colors.grafito}"
    textColor: "{colors.card}"
    rounded: "{rounded.ficha}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "{colors.card}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.ficha}"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.ficha}"
    padding: "10px 12px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.ficha}"
    padding: "16px 24px"
---

# Design System: StockCaja

## Overview

**Creative North Star: "El Fichero Limpio del Almacén"**

StockCaja se ve como el sistema de gestión de un negocio serio y ordenado: un lienzo blanco y limpio, tarjetas blancas con bordes finos grises, y un único acento verde que marca las acciones de dinero y lo que está bien. Cada pantalla es una "ficha" — una tarjeta blanca con esquinas suavemente redondeadas que, cuando corresponde, lleva una pestaña de color que la clasifica por función.

La dirección es profesional y sobria: nada de decoración retro ni tipografía de máquina. Todo el texto usa la fuente del sistema, legible y familiar, porque un cajero debe leer precios y cantidades de un vistazo. El verde es la marca de lo que funciona (cobrar, guardar, caja abierta); el rojo se reserva para lo urgente (eliminar, stock por agotarse, errores). El tono transmite confianza: un almacén de barrio que lleva sus cuentas en orden.

**Key Characteristics:**
- Fondo gris muy claro y frío (#F4F6F9); el contenido vive sobre tarjetas blancas con sombra suave.
- Cabecera y barras en grafito azulado profundo; la navegación usa pestañas de folder discretas.
- Un acento verde (marca), usado en acciones de dinero y estados positivos; rojo solo para peligro.
- Tipografía del sistema en todo el sistema: sin serif decorativa ni mono de máquina. Máxima legibilidad.
- Bordes finos grises; sombras cortas; la profundidad se siente como papel apilado, no como vidrio ni neón.

## Colors

Paleta clara, fría y sobria, orientada a la legibilidad y a la confianza. Los neutros dominan; el verde marca la acción; el rojo aparece solo donde hay riesgo.

### Primary
- **Verde Marca** (#198754): el color de la acción y de lo correcto. Botones principales (cobrar, guardar, crear), pestaña activa de navegación, logo, stock suficiente, caja abierta, ventas válidas (hover `#116A3F`).

### Secondary
- **Rojo Riesgo** (#D64040): solo para lo urgente o destructivo. Eliminar, anular, stock por agotarse, errores, precios tachados (hover `#B73131`).

### Tertiary
- **Ámbar Aviso** (#D97706): acento escaso para advertencias no críticas (discrepancia sobrante, rol ADMIN) y la pestaña de Reportes.

### Neutral
- **Gris Papel** (#F4F6F9): fondo de la aplicación.
- **Blanco Tarjeta** (#FFFFFF): superficies — fichas, tablas, inputs, modales.
- **Papel Alto** (#FAFBFD): zonas tonales muy sutiles sobre superficies blancas (hover de filas).
- **Pauta** (#E3E7EE): líneas divisorias finas de tabla; **Pauta Oscura** (#C9D2DC) para bordes de tarjetas e inputs.
- **Tinta** (#1F2937): texto principal. **Tinta Suave** (#5B6573): texto secundario y etiquetas. **Tinta Tenue** (#8D97A5): placeholders y pies de dato.
- **Grafito** (#1B2430): cabecera y barras de control. **Grafito Oscuro** (#121A24) para hover de botones.

### Named Rules
**La Regla del Único Verde.** El verde marca es el color de la acción de dinero: cobrar, guardar, abrir caja, confirmar. Se usa con frecuencia porque guía al cajero, pero nunca compite con el rojo de riesgo.

**La Regla del Rojo Reservado.** El rojo aparece solo donde hay peligro o destrucción: eliminar, anular, stock por agotarse, errores. Si una pantalla no tiene una acción destructiva, no lleva rojo.

**La Regla de la Pauta.** Los bordes y divisores son de 1px en gris pauta. El borde de tarjeta nunca es grueso ni de color.

## Typography

**Display Font:** pila del sistema (`system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`)
**Body Font:** pila del sistema (idéntica)
**Label/Mono Font:** pila del sistema (sin mono)

**Character:** todo el sistema usa la fuente del sistema operativo. Es la tipografía más legible y familiar para el usuario promedio; no hay serif decorativa ni Courier de máquina. La jerarquía se logra con peso (semibold/bold) y tamaño, no con familias exóticas.

### Hierarchy
- **Display** (sans, bold 700, `tracking-tight`): títulos de página y encabezados (h1–h3).
- **Title** (sans, semibold 600, 13–14px): encabezados de tarjeta, cabeceras de columna y totales de sección.
- **Body** (sans, 400, 14px, line-height 1.5): contenido, tablas, formularios.
- **Label** (sans, 500, 12px): etiquetas de campo, títulos de KPI y pies de dato.
- **Números** (sans, bold 700, 14–40px): precios, folios y cantidades. El total del POS usa 36–40px bold para leerse a dos metros.

### Named Rules
**La Regla de la Legibilidad.** Si un texto se puede leer mal, se escribe en fuente del sistema con peso y tamaño claro. No se usan mayúsculas espaciadas ni tipografías de máquina para contenido importante.

## Layout

Contenedor máximo de `max-w-7xl` con padding `px-4 sm:px-6 lg:px-8` y ritmo vertical de `space-y-6`. La cuadrícula madre es de 12 columnas mentales sobre Tailwind:

- **KPIs y resumen:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5`, gap `4`.
- **Accesos rápidos:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, gap `4`.
- **POS:** pantalla completa fija; panel de venta 2/3 a la izquierda y panel de totales/pago 1/3 a la derecha, con gap `4` y padding `4`.
- **Formularios de modal:** `max-w-lg`; campos en pares con `grid-cols-2 gap-3`.

La densidad es media (sistema de trabajo diario), pero el ritmo de `gap-4` y las fichas blancas aireadas la mantienen legible. El POS prioriza tamaño de objetivo táctil (botones de `py-3` a `py-6`).

## Elevation & Depth

Sistema de elevación por **papel apilado**, no por luz. Las fichas blancas se apoyan unas sobre otras con sombras cortas y suaves; nada brilla, nada flota como vidrio.

### Shadow Vocabulary
- **card** (`0 1px 2px rgba(16,24,40,0.05), 0 1px 3px rgba(16,24,40,0.08)`): elevación base de toda ficha.
- **lift** (`0 4px 12px rgba(16,24,40,0.10), 0 12px 32px rgba(16,24,40,0.16)`): modales, dropdowns y menús que se levantan de la pila.

**La Regla del Papel Apilado.** Las superficies están planas en reposo; `card` da presencia a cada ficha y `lift` solo aparece para lo que se superpone (modales, menús, dropdowns). Prohibido el resplandor (glow) y los degradados de brillo.

## Shapes

Lenguaje de formas discreto y moderno: **esquinas suavemente redondeadas (8px)** en tarjetas y botones (6px en botones), vía token `rounded-ficha`. Nunca esquinas agresivamente redondas (pill) ni cuadradas duras.

Elementos distintivos:
- **Pestaña de tarjeta** (`.ficha-pestana`): una pequeña pestaña de color sobresale 18.4px por encima del borde superior de la ficha, en verde (default), grafito o ámbar según la categoría.
- **Pestaña de navegación** (`.nav-tab`): pestaña plana con esquinas superiores redondeadas, activa en verde.
- **Sellos** (`.sello`): badges discretos con borde fino, radio 6px y texto del sistema.

## Components

### Buttons
- **Shape:** esquinas de 8px (6px en variantes), fuente del sistema `14px` semibold, padding `8px 16px`. Sin mayúsculas espaciadas.
- **Primary** (`.btn-primario`): fondo Verde Marca, texto blanco. Se usa para la acción de plata: cobrar, crear, guardar, abrir caja.
- **Hover / Focus:** hover al tono oscuro (`#116A3F`), `active:translate-y-px` (efecto de presión), `focus-visible` ring verde con offset. `disabled` al 50% de opacidad.
- **Secondary / Ghost:** `.btn-hoja` (confirmaciones de caja), `.btn-grafito` (acciones neutras fuertes) y `.btn-papel` (borde gris sobre blanco, para cancelar/volver).

### Sellos (chips)
- **Style:** borde fino + fondo teñido al 10% + texto del sistema `12px` semibold. Variantes `sello-ok` (verde), `sello-alerta` (rojo), `sello-gris` (neutro), `sello-oro` (ámbar).
- **Estado:** estado de producto (activo/inactivo), nivel de stock, rol (ADMIN/CAJERO) y estado de venta (válida/anulada).

### Cards / Containers
- **Corner Style:** 8px (`rounded-ficha`).
- **Background:** Blanco Tarjeta (`#FFFFFF`).
- **Shadow Strategy:** `card` en reposo, `lift` en hover de accesos rápidos y modales.
- **Border:** 1px Pauta Oscura (ver Regla de la Pauta).
- **Internal Padding:** `p-5` a `p-6` en tarjetas de resumen; `p-6` en cabeceras.
- **Pestaña:** las fichas de categoría llevan `.ficha-pestana` con pestaña verde/grafito/ámbar.

### Inputs / Fields
- **Style:** fondo blanco, borde 1px Pauta Oscura, texto Tinta, radio 8px, padding `10px 12px`.
- **Focus:** borde Verde Marca + ring `hoja/15` (anillo discreto, sin glow).
- **Error / Disabled:** mensajes de error como banda con borde Rojo Riesgo sobre `oferta/10`; campos bloqueados a `opacity-60` con `cursor-not-allowed`.

### Navigation
- **Style:** la barra de navegación es una tira de tarjetas sobre la cabecera Grafito; cada ítem es una pestaña plana.
- **Default / Hover:** pestaña blanca con borde Pauta y texto Tinta Suave; hover a Papel Alto / Tinta.
- **Active:** pestaña rellena de Verde Marca con texto blanco — marca dónde estás.

### Ficha con pestaña (componente firma)
Tarjeta blanca que declara su categoría con una pestaña de color que sobresale del borde superior. Se usa en cabeceras de página (Login, Dashboard, CRUDs), en el panel de venta del POS y en los accesos rápidos del Dashboard.

## Do's and Don'ts

### Do:
- **Do** apoyar todo el contenido sobre el fondo gris claro y fichas blancas; la interfaz siempre queda clara y limpia.
- **Do** usar la fuente del sistema en todo el sistema; nunca tipografías decorativas o de máquina para contenido.
- **Do** reservar el verde para la acción de dinero y el rojo para el peligro; que cada color tenga un trabajo.
- **Do** usar bordes de 1px en gris pauta para tarjetas y divisores.
- **Do** elevar modales y menús con la sombra `lift`; el resto descansa con `card`.
- **Do** hacer legibles los números: fuente del sistema, peso bold y tamaños claros.

### Don't:
- **Don't** volver a la estética de papel manila ni sepia: los neutros son fríos y limpios.
- **Don't** usar serif decorativa (Georgia) ni mono de máquina (Courier) en la interfaz.
- **Don't** usar azules de plantilla SaaS ni acentos desaturados.
- **Don't** poner bordes gruesos de color alrededor de tarjetas redondeadas; el borde de ficha es de 1px gris.
- **Don't** usar sombras difusas grandes ni glows; la profundidad se lee como tarjetas apiladas.
- **Don't** inventar fuentes externas: el sistema corre con la pila de sistema para mantenerse on-premise sin internet.
