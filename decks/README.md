# Widdo — Decks & Presentaciones

## Estructura

```
decks/
├── usa/                          ← Deck inversores USA + decks de torneos
│   ├── deck-usa-widdo.html / .pdf
│   ├── generate-deck-usa.js
│   ├── deck-tournaments-partnership.html / .pdf   ← partnership de torneos (NO ventas)
│   ├── deck-tournaments-mobile.html / .pdf
│   ├── generate-deck-tournaments.js
│   └── generate-deck-tournaments-mobile.js
│
├── latam/                        ← Deck inversores LATAM/Brazil
│   ├── deck-latam-widdo.html / .pdf
│   └── generate-deck-latam.js
│
├── clubes/                       ← Deck VENTAS a clubes USA (NO inversores)
│   ├── deck-widdo-clubs-usa.html / .pdf
│   ├── one-pager-widdo-clubs-usa.html / .pdf / .png   ← version CORTA, 1 pagina
│   ├── generate-deck-clubs-usa.js
│   └── generate-one-pager-clubs-usa.js
│
├── torneos/                      ← Deck VENTAS a organizadores de torneos (NO inversores)
│   ├── deck-widdo-tournaments-usa.html / .pdf
│   └── generate-deck-tournaments-usa.js
│
├── espanol/                      ← Presentacion de producto ES/EN
│   ├── presentacion-widdo.html / .pdf
│   ├── presentacion-widdo-en.html / .pdf
│   ├── generate-pdf.js
│   └── generate-pdf-en.js
│
├── otros/                        ← Otros decks y one-pagers
│   ├── deck-inversores-widdo.html / .pdf
│   ├── one-pager-widdo-usa.html / .pdf
│   ├── widdo-vs-flywire.html
│   ├── generate-deck.js
│   └── generate-one-pager.js
│
├── assets/                       ← Screenshots del producto
├── grid-tile.png                 ← Grid tile para fondos
├── DECK-GUIDE.md                 ← Guia tecnica
└── README.md                     ← Este archivo
```

## Archivado

Material retirado el 13-ago-2026 (traccion, pricing o estrategia superados) en
`_archivo-negocio/decks/`. Cada archivo lleva una cabecera que dice por que se
archivo y que lo sustituye. NO reutilizar sus cifras:

| Archivado | Motivo |
|-----------|--------|
| `usa/pitch-script.html` + `-v2` + generador | Guion feb-2026; v2 vende BNPL (abandonado) |
| `usa/cheat-sheet-alwin-erica.html` + generador | Chuleta feb-2026, traccion superada |
| `usa/deck-usa-widdo-light.html` | Duplicado en tema claro, sin generador, se desincronizaba |
| `otros/widdo-roadmap-3months.html`, `-6months`, `-6months-es` | Roadmaps vencidos |
| `otros/widdo-strategy-2026.html` | BNPL como revenue #1 |
| `otros/widdo-competitive-landscape.html` | Posicionamiento LATAM, cifras prohibidas |
| `ligas/` completo | Liga Antioquia: mercado LATAM descartado |
| `SESSION-LOG.md` | Bitacora feb-2026 |

## Audiencia de cada deck

| Deck | Audiencia | Objetivo |
|------|-----------|----------|
| `usa/` | Inversores USA | Levantar ronda |
| `latam/` | Inversores LATAM/Brazil | Levantar ronda |
| `clubes/` | **Clubes deportivos de USA (clientes)** | **Vender la suscripcion — NO es un deck de inversores** |
| `torneos/` | **Organizadores de torneos de USA (clientes)** | **Vender Widdo Tournaments — NO es un deck de inversores ni el deck de partnership de `usa/deck-tournaments-partnership.html`** |
| `espanol/` | General (ES/EN) | Presentacion de producto |
| `otros/` | Inversores / one-pagers | Material de apoyo |

## Cifras canonicas (13-ago-2026)

La fuente unica es `metrics.json` en la raiz; se propaga con `node update-metrics.js`.

- 9 clubes activos, **3 pagando** (anual prepagado), MRR $101, **1.476 usuarios**, **701 jugadores**
- Margen bruto 88%, infra $32/mes, LTV/CAC 16x, ARPC $34
- Pricing USD **99 / 199 / 349** — el plan lo define la CANTIDAD DE JUGADORES, no los modulos
- Pasarela: **Stripe unica** (USA, Canada, Mexico). Wompi y MercadoPago descartados
- Movil: **Flutter** (repo `widdo-mobile-flutter`, en TestFlight). React Native abandonado
- Foco **USA-only**
- 🚫 PROHIBIDO en cualquier material: "21 clubs", "0% churn", "zero churn"

## Comandos Rapidos

```bash
cd /Users/miguelcano/Desktop/todo/Widdo

# Generar PDF USA (rasterizado 2x, scroll rapido)
node decks/usa/generate-deck-usa.js

# Generar PDF LATAM
node decks/latam/generate-deck-latam.js

# Generar PDF Widdo Clubs USA (deck de VENTAS a clubes, no de inversores)
node decks/clubes/generate-deck-clubs-usa.js

# One-pager clubes USA (version corta: 1 pagina Letter, sin capturas)
node decks/clubes/generate-one-pager-clubs-usa.js

# Generar PDF Widdo Tournaments USA (deck de VENTAS a organizadores de torneos,
# no de inversores; distinto del deck de partnership usa/deck-tournaments-partnership.html)
node decks/torneos/generate-deck-tournaments-usa.js

# Generar presentacion espanol
node decks/espanol/generate-pdf.js

# Generar presentacion ingles
node decks/espanol/generate-pdf-en.js
```

## Presentar desde HTML (recomendado)

1. Abrir `decks/usa/deck-usa-widdo.html` en Chrome/Safari
2. Presionar **F** para entrar en modo presentacion fullscreen
3. **→** o **Space** = siguiente slide
4. **←** o **Backspace** = slide anterior
5. **H** = ayuda con teclas
6. **Esc** = salir

## Documentos relacionados

Los documentos de negocio, investigacion y estrategia estan en `negocio/`:
- `negocio/MARKET-RESEARCH-USA.md` — Fuentes verificadas
- `negocio/STARTUP-GLOSSARY.md` — Glosario de terminos
- `negocio/TERM-SHEET-PARTNERSHIP.md` — Term sheet socios
- `negocio/pitch/` — Guion, preguntas dificiles, templates de follow-up
