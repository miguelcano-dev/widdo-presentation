# _archivo-negocio — Cementerio de documentación de negocio

Depuración del **13-ago-2026**. Aquí viven los documentos de negocio, ventas, legales,
finanzas y contenido que **ya no reflejan la realidad de Widdo**. **Nada se borró** — todo es
recuperable, y cada archivo lleva en su primera línea una cabecera
`<!-- ARCHIVADO 13-ago-2026 — [razón] — sustituido por [X] -->`.

## Criterio

Se sacó de circulación lo que caía en alguno de estos cuatro cubos:

1. 🔴 **Cifras falsas en material externo** — lo más urgente. Documentos que se enseñan a
   inversores o prospectos y afirman **"21 clubs"** o **"0% churn"**. El estado real a
   13-ago-2026 es **9 clubes, 3 pagando, MRR $101, 1.476 usuarios, 701 jugadores** (fuente: `metrics.json`).
2. 🔴 **Términos legales que nunca existieron** — equity 88/12 con una "Socia B" inexistente,
   acciones dual-class Class A/Class B que Stripe Atlas nunca emitió, transfer pricing al 20%.
3. 🟡 **Premisas caducadas** — documentos que asumen que Widdo SAS Colombia está operativa
   (está **inactiva**, el foco es USA-only) o que Wompi/MercadoPago son pasarelas activas
   (**Stripe es la única**, en USA/Canadá/México).
4. 🟡 **Duplicados exactos** — mismo archivo en dos rutas, verificado por md5.

Se conservó en su sitio todo lo vigente. Los documentos que son correctos pero traen una foto
vieja **no se archivaron**: se les puso un banner con la fecha del modelo y la cifra real.

> **Nota:** la subcarpeta `decks/` de este archivo **no forma parte de esta depuración**.
> La creó la depuración paralela de `decks/` en la misma fecha; su contenido se documenta aparte.
> Todo lo que se lista abajo sí corresponde a negocio, ventas, legales, finanzas y contenido.

## Qué hay aquí

### `sales/` (8) — cifras falsas en material de cara al cliente
Todo el antiguo `negocio/sales/` más el pitch a ángeles. Afirmaban "used by 21 clubs" / "zero churn".

- `angel-investors-florida.html` — pitch a inversores de Florida: *"used by 21 sports clubs with
  zero churn"*, y además "14 clubes activos".
- `KNOWLEDGE-BASE.md` — "21 clubes activos" + "0% churn — ningún club se ha ido".
- `sales-dashboard.html` — "21 clubs" en 4 plantillas de outreach y en el guion de objeciones.
- `CRM.md` — CRM del ciclo de ventas viejo, atado a ese copy.
- `emails/` (4): `01-fusion-elite.md`, `02-kissimmee-allstars.md`, `03-rising-stars.md`,
  `prospect-wire-brian-werner.md` — "used by 21 clubs" en los cuatro.

> **El copy vigente y limpio vive en `adquisicion-usa/emails/`.** Es el que se debe usar.

### `legales/` (11) — términos que nunca existieron o quedaron superados

**Equity ficticio:**
- `PARTNERSHIP-STRATEGY.md` y `TERM-SHEET-PARTNERSHIP.md` — reparten equity **88/12** con una
  **"Socia B" que nunca existió**. Canónico: **70/30 Miguel/Alwin** en
  `negocio/legales/para-firmar/founders-agreement.html`.
- `01-founders-agreement.html` — borrador con **dual-class 7M Class A**. Atlas emitió
  **9M de Common Stock single-class** (Miguel 6.300.000 / Alwin 2.700.000).

**Transfer pricing al 20% (canónico = Cost+15%):**
- `transfer-pricing.html` (venía de `para-firmar/`) — Cost+20% y además **internamente
  incoherente**: la L83 decía 15% y las L131/146/242 decían 20%.
- `07-master-services-agreement.html` — Cost Plus 20% y asume la SAS operativa.

**Duplicados byte-idénticos (verificados por md5):**
- `01-founders-agreement-final.html` — idéntico a `para-firmar/founders-agreement.html`
  (md5 `a452612e…`).
- `02-ip-assignment.html` — idéntico a `para-firmar/ip-assignment.html` (md5 `219a45b2…`).
  En ambos casos se conservó el de `para-firmar/`, que es donde se firma.

**Pre-incorporación / SAS inactiva:**
- `legal-c-corp-checklist.html` — checklist para crear la C Corp; Widdo Inc ya existe
  (EIN 35-2952499, 83(b) fileados marzo 2026).
- `guia-inversion-estructura.html` — guía pre-incorporación con métricas falsas
  ("14 clubes activos, 0% churn", 774 usuarios) y Wompi mencionado 9 veces.
- `brief-contadora-widdo-sas.md` y `guia-contadora-estructura.html` (venía de
  `legal/colombia/`) — asumen Widdo SAS operativa. **Retomar si la SAS se reactiva.**

### `finanzas/` (2)
- `estados-financieros.html` — pro-forma sobre *"Widdo SAS (NIT por confirmar)"* cuando la
  entidad operativa es Widdo Inc; usa 16 clubs y un cap table Clase A/Clase B inexistente.
- `DATOS_CONTABLES.md` (venía de `negocio/`) — **subconjunto** del de la raíz: 207 líneas /
  9 secciones frente a 370 / 13. El de la raíz lo cubre entero y añade RUT, inscripción al RST,
  análisis C Corp USA y estrategia de crecimiento. **Usar `DATOS_CONTABLES.md` de la raíz.**

### `contenido/` (2)
- `reel-widdo-demo/` — reel promocional cuya escena 4 anima **"21 clubs / 1.200+ athletes /
  0% churn"**. Regenerable desde `metrics.json` si se retoma.
- `COPIES_INSTAGRAM_WIDDO.md` — copies de enero 2026 en ES-Colombia; el foco es USA-only.

### `clubes/` (1)
- `ficha-matricula-clubes.html` — decía ser la plantilla **genérica**, pero era **byte-idéntica**
  a `ficha-matricula-baqueros.html` (md5 `c7a7c87d…`), incluidos el `<title>` y el logo de
  Club Baqueros: no servía para ningún otro club. Cómo regenerarla:
  `clubes/fichas/README.md`.

### `privado/` (1)
- `runway-personal.html` — runway de febrero 2026: asume ingreso de $8K/mes hasta marzo y lista
  "Configurar Wompi" como pendiente. El salario vigente del fundador es **$2.000/mes ×3 con
  sunset el 31-oct-2026** (`para-firmar/amendment-01-founder-compensation.html`).

## Lo que NO se archivó (se corrigió en su sitio)

| Documento | Qué se hizo |
|---|---|
| `negocio/legales/05-terms-of-service.html` y `06-privacy-policy.html` | Wompi/MercadoPago → **Stripe** (USA/Canadá/México) |
| `negocio/legales/index.html` | `03-transfer-pricing` reetiquetado como **canónico 15%** (estaba marcado "v1 obsoleto" al revés); enlaces a `para-firmar/` y `firmados/`; fuera el founders dual-class |
| `negocio/legales/para-firmar/index.html` | Añadidos amendment-01 y board-consent (faltaban); el pagaré marcado **PAGADO 3-ago-2026**, no deuda viva |
| `negocio/legales/firmados/README.md` | Aclarado que el árbol de 14 PDFs es la **estructura objetivo**, no el estado (está vacío) |
| `finanzas/index.html` | Tiles vivos: MRR $101, burn infra **$32** (medido 28-jul), no $47 |
| `finanzas/aportes-fundador.html`, `modelo-financiero.html`, `use-of-funds.html` | Banner con la fecha del modelo (marzo 2026) y la cifra real; "Pasarelas: 2 (Wompi, MercadoPago)" → **1 (Stripe)** |
| `contenido/linkedin/` | Los 12 posts siguen **vigentes** (ninguno filtra métricas). Nota de "0 publicados a 13-ago" y corregida la ref al banner PNG inexistente |
| `clubes/PLANTILLAS-WHATSAPP-COLOMBIA.md` | Banner "legacy CO — plan de 30 días vencido, conteos desactualizados" |
| `negocio/RECONCILIACION-CIFRAS.md` | Tabla de qué contradicciones quedaron cerradas por este archivado |

## Nota sobre las cuatro cifras de burn

El corpus traía **$32 / $47 / $81 / $177** como "burn". No son cuatro versiones del mismo
número, son cosas distintas:

- **$32/mes** — infraestructura, **medido en DigitalOcean el 28-jul-2026** (droplet $12 +
  MySQL $15 + Spaces $5). Es el valor canónico de `metrics.json` (`infra_cost`).
- **$47/mes** — infra según el modelo de marzo (DO $27 + Resend $20). Los modelos financieros
  siguen usándolo porque sus tablas cuadran internamente con él; llevan banner de fecha.
- **$177/mes** — burn **total** de marzo, no solo infra: incluye Claude $100, internet, Apple
  Developer y dominio.
- **$81** — no es burn: es el MRR hipotético si la TRM volviera a 4.000 COP/USD
  (ver la nota de `metrics.json`).

## Cómo recuperar algo

Los archivos están íntegros; solo tienen una línea de cabecera añadida al principio.
Para devolver uno a su sitio, muévelo de vuelta y borra esa primera línea.
