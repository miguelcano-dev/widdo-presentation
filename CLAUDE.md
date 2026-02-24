# CLAUDE.md - Widdo Project

## Estructura del Proyecto

```
Widdo/
├── negocio/          ← Documentos de negocio, inversion, estrategia
├── decks/            ← Presentaciones para inversores (HTML + PDF)
│   ├── usa/          ← Deck USA
│   ├── latam/        ← Deck LATAM/Brazil
│   ├── espanol/      ← Presentacion original ES/EN
│   ├── otros/        ← Otros decks y one-pagers
│   └── assets/       ← Screenshots del producto
├── clubes/           ← Fichas de matricula y data de clubes
│   ├── fichas/       ← Fichas HTML/PDF + scripts
│   ├── club siempre fuertes/
│   └── data clubes/
├── contenido/        ← Marketing e Instagram
├── desarrollo/       ← Codigo fuente (Laravel + React)
├── desarrollo-capacitor/ ← App movil
└── CLAUDE.md
```

## Actualizar Metricas (UN SOLO COMANDO)

Cuando cambien los numeros (clubs, MRR, churn, etc.):

```bash
cd /Users/miguelcano/Desktop/todo/Widdo

# 1. Editar metrics.json — solo cambiar los numeros que crecieron
#    Ejemplo: "clubs": 30, "mrr": 1770, "churn": "2%"

# 2. Actualizar todos los archivos (11 archivos)
node update-metrics.js

# 3. Actualizar + regenerar todos los PDFs (11 archivos + 4 PDFs)
node update-metrics.js --pdf
```

### Que hace el script automaticamente:
- **Recalcula** ARR, costo por club, margen, LTV, LTV/CAC
- **Actualiza** deck USA, deck LATAM, presentacion EN, deck inversores, one-pager
- **Actualiza** pitch script, tough questions, email templates, glossary
- **Genera PDFs** (con --pdf): USA (rasterizado 2x), LATAM, español, ingles

### Archivos involucrados:
- `metrics.json` — Fuente unica de verdad (editar solo este)
- `update-metrics.js` — Script que lee metrics.json y actualiza todo

---

## Centro de Documentos (Dashboard HTML)

Un solo comando para abrir el dashboard con todo organizado:

```bash
cd /Users/miguelcano/Desktop/todo/Widdo
./start-docs.sh
```

Esto:
1. Levanta `server.js` en `http://localhost:3456`
2. Abre el browser automaticamente
3. Muestra el dashboard con todos los decks, pitch, negocio, clubes
4. Permite actualizar metricas desde el formulario (drag & drop + edicion manual)

### Dashboard (index.html) incluye:
- **Barra de metricas** — Clubs, MRR, ARR, Churn, Margin, LTV/CAC, Raising
- **Decks Inversores** — Links a USA, LATAM, Espanol, EN, One-Pager (HTML + PDF)
- **Preparacion de Pitch** — Guion, practica, preguntas dificiles, templates, tracker
- **Negocio e Inversion** — Glosario, term sheet, partnership, market research
- **Clubes** — Fichas de matricula
- **Actualizar Metricas** — Formulario editable con calculo en vivo + botones para actualizar archivos y PDFs

### Server (server.js):
- Puerto 3456, sin dependencias externas
- `POST /api/update-metrics` — Recibe JSON, merge a metrics.json, ejecuta update-metrics.js
- `POST /api/generate-pdfs` — Ejecuta update-metrics.js --pdf (timeout 5 min)
- Sirve archivos estaticos de todo el directorio Widdo

---

## Generar PDFs individualmente

```bash
cd /Users/miguelcano/Desktop/todo/Widdo

# Deck USA (rasterizado 2x, scroll rapido)
node decks/usa/generate-deck-usa.js

# Deck LATAM
node decks/latam/generate-deck-latam.js

# Presentacion espanol
node decks/espanol/generate-pdf.js

# Presentacion ingles
node decks/espanol/generate-pdf-en.js

# Ficha de matricula
node clubes/fichas/generate-ficha-matricula.js
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
| Guia tecnica decks | `decks/DECK-GUIDE.md` |
| Historial de cambios | `decks/SESSION-LOG.md` |
| Indice de decks | `decks/README.md` |
| Documentos de negocio | `negocio/README.md` |
| Glosario de startup | `negocio/STARTUP-GLOSSARY.md` |
| Investigacion mercado | `negocio/MARKET-RESEARCH-USA.md` |
| Term sheet socios | `negocio/TERM-SHEET-PARTNERSHIP.md` |

## Imagenes del producto

Screenshots en `decks/assets/`:
- `dashboard-propietario.png` - Dashboard del propietario
- `gestion-jugadores.png` - Gestion de jugadores
- `gestion-pagos.png` - Gestion de pagos
- `calendario.png` - Calendario de eventos
- `control-asistencia.png` - Control de asistencia
- `control-club.png` - Mi Club / Control total
- `rol-entrenador.png` - Dashboard del entrenador
- `rol-padre.png` - Dashboard familiar/padre
- `landing-hero.png` - Imagen de landing page

Redimensionar: `sips --resampleWidth 900 imagen.png`
