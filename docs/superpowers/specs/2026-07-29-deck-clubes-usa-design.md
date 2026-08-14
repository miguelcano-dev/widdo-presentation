# Deck de ventas para clubes y academias USA — Diseño

**Fecha:** 2026-07-29
**Estado:** aprobado por Miguel
**Audiencia del deck:** dueños y directores de clubes/academias deportivas en Estados Unidos (multideporte)

---

## 1. Objetivo

Un PDF único que sirva para dos usos:

1. **Leave-behind por email** — se entiende sin nadie que lo explique (outreach en frío de Florida).
2. **Guion visual en una demo por Zoom** — texto suficientemente corto para que Miguel hable encima.

Densidad de contenido media: cada slide se sostiene sola, pero ningún slide es un muro de texto.

No es un deck de inversores. No lleva TAM, proyecciones, cap table ni fundraising.

## 2. Decisiones tomadas

| Decisión | Valor | Razón |
|----------|-------|-------|
| Idioma | Inglés íntegro | Audiencia USA |
| Nicho | Genérico multideporte | Un solo PDF para soccer, basketball, volleyball |
| Screenshots | Capturas reales nuevas con UI en inglés | Un club de Florida no puede ver UI en español |
| Pricing | Explícito, tabla de 3 planes | Filtra curiosos y acelera el ciclo |
| Verticales | Widdo Clubs + 1 teaser de Tournaments | Academy no existe todavía; mencionarla sonaría a humo |
| Prueba social | **Excluida** | 9 clubes / 3 pagando es muy poco; se lee como debilidad |
| Link de agenda | **Excluido** | No hay URL de agendamiento configurada |
| QR | **Excluido** | Solo tendría sentido impreso o proyectado |

## 3. Sistema visual

Fuente única de verdad de la marca, verificada en código:

| Token | Valor | Dónde está definido |
|-------|-------|---------------------|
| Verde primario | `#16a34a` | `decks/usa/widdo-logo.svg`, `frontend/tailwind.config.js:53` |
| Verde oscuro | `#0f7a37` | Derivado, solo para el degradé de portada |
| Texto | `#18181b` | — |
| Texto atenuado | `rgba(24,24,27,0.65)` | — |
| Fondo | `#ffffff` | — |
| Tarjeta | `#f4f4f5` | — |
| Borde | `rgba(24,24,27,0.12)` | — |
| Tipografía | Red Hat Display | Misma que usa el producto (`frontend/src/index.css`) |
| Logo | `decks/usa/widdo-logo.svg` | Círculo verde, marca blanca |

Nota: el `#00C853` que aparece en `CLAUDE.md` pertenece al estilo "HTMLs Widdo Dark", que es otro sistema. El verde de la marca y del producto es `#16a34a`.

**Reglas de composición:**

- Slide de 1280×720 px (16:9).
- Portada: verde pleno con degradé diagonal `#16a34a → #0f7a37`. Logo y texto en blanco. Es el único slide con color de fondo pleno.
- Resto de slides: blanco. Un velo verde de 4-6% de opacidad **solo** en las slides 2, 11 y 12, para marcar ritmo.
- Sin grid de fondo, sin blurs, sin sombras pesadas, sin gradientes decorativos fuera de los anteriores.
- Screenshots: borde de 1px `rgba(24,24,27,0.12)`, radio de 12px, sin marco de navegador ni mockup de dispositivo de stock.
- Jerarquía: un solo H2 por slide, máximo 4 bullets, máximo un dato numérico grande.

## 4. Estructura — 12 slides

| # | Slide | Contenido | Fondo |
|---|-------|-----------|-------|
| 1 | Cover | "Run your club, not your spreadsheets." + subtítulo "Payments, players, attendance and families in one place." | Verde pleno |
| 2 | The problem | 4 dolores: chasing parents for payments · WhatsApp chaos · attendance on paper · no visibility of revenue | Velo verde |
| 3 | The solution | 4 bloques: Payments · Players · Attendance · Families. Una línea por bloque | Blanco |
| 4 | Owner dashboard | Screenshot grande + 3 bullets (ingresos del mes, morosidad, asistencia) | Blanco |
| 5 | Payments & collections | Screenshot + cobro automático, recordatorios que salen solos, quién debe y desde cuándo, pagos con tarjeta | Blanco |
| 6 | Attendance & QR check-in | Screenshot móvil + "10 seconds per session" | Blanco |
| 7 | Parent app | Screenshot móvil: pagar, calendario, asistencia. "Stop being your club's call center" | Blanco |
| 8 | Widdo AI | Diferenciador. Screenshot del chat. El asistente responde y además ejecuta acciones | Blanco |
| 9 | Before / After | 2 columnas: "Spreadsheet + WhatsApp + Zelle" vs Widdo. Sin nombrar competidores | Blanco |
| 10 | Get started | 3 pasos. **"Set up in under 30 minutes"** — la IA carga jugadores y categorías. Sin fee de setup | Blanco |
| 11 | Pricing | $99 / $199 / $349. Plan medio destacado. 0% de comisión de plataforma sobre los pagos | Velo verde |
| 12 | Close | "See it running on your own club's data." + `miguel@widdo.co` + `widdo.co` en tipografía grande | Velo verde |

**Slide 13 (teaser de Tournaments):** aprobado conceptualmente pero fuera de la numeración final; se integra como bloque dentro del slide 3 (cuarto bloque "and when your club competes → Widdo Tournaments") para no alargar el deck. Si al revisar el PDF se ve apretado, se promueve a slide propio.

## 5. Copy — reglas

- Inglés americano, segunda persona ("your club", "your coaches").
- Nada de superlativos de marketing ("revolutionary", "game-changing", "seamless").
- Sin nombrar competidores por su nombre en ningún slide.
- Sin prometer fechas de disponibilidad ni "start charging today".
- Números: solo los que estén en `metrics.json` o sean verificables en el producto.

## 6. Entregables

```
decks/clubes/
├── deck-widdo-clubs-usa.html        ← 12 slides, self-contained
├── generate-deck-clubs-usa.js       ← Puppeteer, rasterizado 2x
├── deck-widdo-clubs-usa.pdf         ← salida
└── widdo-logo.svg                   ← copia local del logo

decks/assets/usa-en/                 ← 7 capturas nuevas, UI en inglés
├── owner-dashboard.png
├── payments-collections.png
├── payment-detail.png
├── attendance.png
├── qr-checkin-mobile.png
├── parent-app-mobile.png
└── widdo-ai-chat.png
```

Además: registrar el deck en `update-metrics.js` para que el pricing y cualquier cifra se propaguen desde `metrics.json`.

## 7. Captura de screenshots

Entorno local, que está levantado:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8010`
- Usuarios de prueba: ver `desarrollo/CLAUDE.md`

Procedimiento:

1. Login con Playwright headless (`frontend/` ya tiene Playwright instalado).
2. Cambiar el idioma de la interfaz a **inglés** desde el selector de la app.
3. Capturar a `deviceScaleFactor: 2`.
4. Vistas de escritorio: viewport 1440×900. Vistas móviles: 390×844.

**Restricciones duras:**

- Prohibido `migrate:fresh`, `migrate:reset`, dropear tablas, borrar contenedores o vaciar cachés. Si el entorno está roto, parar y reportar — no repararlo destruyendo nada.
- Los datos que se creen para las capturas se crean por los flujos normales de la app, nunca tocando la base de datos directamente.
- Nada de git: ni add, ni commit, ni push.

Si los datos locales resultan demasiado evidentemente colombianos (nombres, pesos), se crea un club demo con datos plausibles USA usando el onboarding normal de la aplicación.

## 8. Riesgos aceptados

1. **El pricing $99/$199/$349 no está validado.** Los 3 clubes que pagan hoy están en pesos colombianos y en plan anual. El deck publica un precio que aún nadie ha pagado en USA.
2. **Stripe está en sandbox en producción** (Gate 0 del lanzamiento). El deck genera demanda que la pasarela todavía no puede atender. Por eso el slide 10 no promete fechas ni "charge today".
3. **"Set up in under 30 minutes"** depende del onboarding con IA. Si un club llega con datos sucios, el tiempo real será mayor. Es una promesa que hay que poder sostener en la primera demo.

## 9. Fuera de alcance

- Versión en español del deck.
- Versión por deporte (soccer / basketball).
- Deck de Tournaments (ya existe: `decks/usa/deck-tournaments-partnership.html`).
- Cualquier cambio en el producto.
