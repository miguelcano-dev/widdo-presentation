# CLAUDE.md - Widdo Project

## Hechos canonicos (leer antes de escribir cualquier cifra)

- **Metricas:** la fuente unica de verdad es `metrics.json`. A 13-ago-2026: **9 clubes,
  3 pagando, MRR $101, 1.476 usuarios, 701 jugadores.** NUNCA escribas "21 clubs" ni "0% churn" en material
  externo — son cifras falsas que quedaron archivadas en `_archivo-negocio/`.
- **Pagos:** **Stripe es la unica pasarela** (USA, Canada, Mexico). Wompi y MercadoPago estan
  DESCARTADOS; si aparecen en un documento, ese documento esta desactualizado.
- **Foco:** **USA-only**. El onboarding de clubes en USA arranca en **enero 2027**. Colombia
  queda en mantenimiento y su revenue entra a cuenta personal.
- **Entidades:** la empresa operativa es **Widdo Inc** (Delaware, EIN 35-2952499), equity
  **70/30 Miguel/Alwin**. **Widdo SAS Colombia esta INACTIVA**; el termino "accionista unico"
  solo aplica a la SAS, nunca a Widdo Inc.
- **Movil:** la app es **Flutter**, en el repo `widdo-mobile-flutter`. Las versiones anteriores
  (React Native, Capacitor) estan abandonadas.
- **Transfer pricing:** **Cost+15%**. Cualquier documento con Cost+20% esta archivado.
- **Estado legal:** a 13-ago-2026 **no hay nada firmado**, incluido el IP Assignment. Hoy el
  codigo es de Miguel, no de Widdo Inc.

---

## Ecosistema Widdo (2 verticales activas + 1 en standby)

- **Widdo Clubs** — Gestion completa de clubes deportivos. Pagos, jugadores, asistencia,
  familias, entrenadores. Cualquier deporte, cualquier edad.
- **Widdo Tournaments** — Organizacion de torneos: inscripciones, brackets, resultados en vivo,
  pagos. Cada torneo trae nuevos clubes al ecosistema.
- **Widdo Academy — EN STANDBY.** Vertical de capacitacion para el mundo deportivo. **No forma
  parte del alcance actual** de producto, desarrollo ni salida a produccion, y **no genera
  revenue**. No la cuentes al definir modulos, arquitectura, metricas ni criterios de
  produccion mientras siga en standby. Se reactiva solo con decision explicita de Miguel.

Las dos verticales activas se conectan: un club usa Widdo Clubs para operar e inscribe equipos
en Widdo Tournaments para competir. Cada torneo puede atraer nuevos clubes al ecosistema.

---

## Estructura del proyecto

```
Widdo/
├── negocio/            ← Negocio, inversion, estrategia
│   ├── legales/        ← Documentos legales (empieza por legales/index.html)
│   │   ├── para-firmar/  ← Cola de firma — NADA firmado a 13-ago-2026
│   │   └── firmados/     ← Vacia; se llena al ejecutar cada documento
│   ├── pitch/          ← Guion, practica, preguntas dificiles, tracker
│   └── recibos/        ← Facturas mensuales por mes
├── finanzas/           ← Modelos pro-forma y costeo (cifras vivas en metrics.json)
├── decks/              ← Presentaciones
│   ├── usa/  latam/  espanol/  otros/   ← Decks de INVERSORES
│   ├── clubes/  torneos/                ← Decks de VENTAS (clientes)
│   └── assets/                          ← Screenshots del producto
├── adquisicion-usa/    ← Prospeccion, outreach y gates de lanzamiento USA
├── clubes/             ← Fichas de matricula y data de clubes
├── contenido/          ← Marketing (LinkedIn)
├── desarrollo/         ← Codigo fuente (Laravel + React + landing Next.js)
└── _archivo-negocio/   ← Documentos retirados (ver su README.md)
```

---

## Actualizar Metricas (UN SOLO COMANDO)

Cuando cambien los numeros (clubs, MRR, churn, etc.):

```bash
cd /Users/miguelcano/Desktop/todo/Widdo

# 1. Editar metrics.json — solo cambiar los numeros que crecieron
#    Ejemplo: "clubs": 30, "mrr": 1770, "churn": "2%"

# 2. Actualizar todos los archivos (12 archivos)
node update-metrics.js

# 3. Actualizar + regenerar todos los PDFs (12 archivos + 6 PDFs)
node update-metrics.js --pdf
```

### Que hace el script automaticamente
- **Recalcula** ARR, costo por club, margen, LTV, LTV/CAC
- **Actualiza 12 archivos:** decks USA, Clubs USA, LATAM, presentacion EN, deck inversores,
  one-pager; y en negocio: PITCH-SCRIPT, TOUGH-QUESTIONS, FOLLOW-UP-TEMPLATES, PITCH-PRACTICE,
  STARTUP-GLOSSARY, DATA-ROOM-CHECKLIST
- **Genera 6 PDFs** (con `--pdf`): Deck USA (2x), LATAM, Clubs USA (ventas, 2x),
  Tournaments USA (ventas, 2x), presentacion ES, presentacion EN

### Archivos involucrados
- `metrics.json` — Fuente unica de verdad (editar solo este)
- `update-metrics.js` — Script que lee `metrics.json` y actualiza todo

---

## Centro de Documentos (Dashboard HTML)

```bash
cd /Users/miguelcano/Desktop/todo/Widdo
./start-docs.sh
```

Esto levanta `server.js` en `http://localhost:3456`, abre el browser y muestra el dashboard
(`index.html`) con decks, pitch, negocio, decks de ventas, adquisicion USA, finanzas y clubes.
Permite actualizar metricas desde un formulario con calculo en vivo.

### server.js
- Puerto 3456, sin dependencias externas
- `POST /api/update-metrics` — recibe JSON, hace merge a `metrics.json`, ejecuta `update-metrics.js`
- `POST /api/generate-pdfs` — ejecuta `update-metrics.js --pdf` (timeout 5 min)
- Sirve archivos estaticos de todo el directorio Widdo

---

## Generar PDFs individualmente

```bash
cd /Users/miguelcano/Desktop/todo/Widdo

node decks/usa/generate-deck-usa.js                      # Deck USA (inversores, 2x)
node decks/latam/generate-deck-latam.js                  # Deck LATAM (inversores)
node decks/clubes/generate-deck-clubs-usa.js             # Deck Clubs USA (ventas)
node decks/torneos/generate-deck-tournaments-usa.js      # Deck Tournaments USA (ventas)
node decks/espanol/generate-pdf.js                       # Presentacion ES
node decks/espanol/generate-pdf-en.js                    # Presentacion EN
node clubes/fichas/generate-ficha-matricula.js           # Ficha de matricula
```

### Requisitos
- Node.js instalado
- Puppeteer (`npm install puppeteer`)

## Presentar desde HTML (recomendado)

1. Abrir `decks/usa/deck-usa-widdo.html` en Chrome/Safari
2. Presionar **F** para fullscreen
3. Flechas para navegar, **H** para ayuda, **Esc** para salir

## Documentacion detallada

| Tema | Archivo |
|------|---------|
| Reconciliacion de cifras contradictorias | `negocio/RECONCILIACION-CIFRAS.md` |
| Guia tecnica decks | `decks/DECK-GUIDE.md` |
| Indice de decks | `decks/README.md` |
| Documentos de negocio | `negocio/README.md` |
| Centro legal | `negocio/legales/index.html` |
| Glosario de startup | `negocio/STARTUP-GLOSSARY.md` |
| Investigacion mercado | `negocio/MARKET-RESEARCH-USA.md` |
| Datos contables | `DATOS_CONTABLES.md` (raiz) |
| Adquisicion USA | `adquisicion-usa/INDEX.md` |
| Documentos retirados | `_archivo-negocio/README.md` |

## Imagenes del producto

Screenshots del producto en `decks/assets/`.

Redimensionar: `sips --resampleWidth 900 imagen.png`
