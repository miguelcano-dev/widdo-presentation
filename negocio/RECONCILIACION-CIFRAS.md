# Reconciliación de cifras y términos — Widdo

Generado el 2026-07-21 a partir del grafo de conocimiento de negocio
(`graphify-out/`, 889 nodos, 48 aristas de contradicción).

## Actualización 13-ago-2026 — contradicciones cerradas por archivo

Varias de las contradicciones listadas abajo ya **no existen**: el documento que sostenía la
versión equivocada se archivó en `_archivo-negocio/`. Este documento conserva las referencias
originales a propósito, como registro de qué estaba mal y dónde.

| Contradicción | Cómo se cerró |
|---|---|
| Transfer pricing 20% vs 15% | Canónico **Cost+15%**. Archivados `07-master-services-agreement.html` y `para-firmar/transfer-pricing.html` (20%). `03-transfer-pricing.html` reetiquetado como canónico. |
| Founders dual-class 7M Class A | Nunca existió: Atlas emitió **9M Common single-class**. Archivado `01-founders-agreement.html`. |
| Equity 88/12 con "Socia B" | Canónico **70/30 Miguel/Alwin**. Archivados `PARTNERSHIP-STRATEGY.md` y `TERM-SHEET-PARTNERSHIP.md`. |
| Duplicados founders / IP assignment | Byte-idénticos. Se conserva solo el de `para-firmar/`; los de `legales/` archivados. |
| "21 clubs / 0% churn" en material externo | Archivados `angel-investors-florida.html`, todo `negocio/sales/` y `contenido/reel-widdo-demo/`. Real: **9 clubes, 3 pagando, MRR $101**. |
| Wompi / MercadoPago como pasarelas | Canónico **Stripe única** (USA/Canadá/México). Corregidos ToS, Privacy y `finanzas/aportes-fundador.html`. |
| SAS Colombia operativa | **INACTIVA**, foco USA-only. Archivados `brief-contadora-widdo-sas.md` y `legal/colombia/guia-contadora-estructura.html`. |

Sigue **abierto**: el estado de firma. A 13-ago-2026 **nada está firmado**, incluido el
IP Assignment — hoy el código es de Miguel, no de Widdo Inc.

**Cómo usar este documento:** cada bloque lista las versiones que conviven hoy en el
corpus. Rellena el campo `DECISIÓN:` con la cifra que declaras verdadera. Después se
propagan a los archivos listados en "Propagar a".

Dos niveles de confianza, no los mezcles:

- ✅ **VERIFICADO** — comprobado leyendo los archivos directamente, con archivo:línea.
- ⚠️ **REPORTADO** — lo detectaron los subagentes de extracción y **no está verificado
  a mano**. Trátalo como pista, no como hecho, hasta confirmarlo.

---

## 1. Transfer pricing — markup y régimen ✅ VERIFICADO

**Riesgo: alto.** Hay un documento en la cola de firma que es la versión obsoleta
y que además se contradice a sí mismo.

| Archivo | Markup | Régimen | Fecha |
|---|---|---|---|
| `legales/transfer-pricing-agreement-final.md` | **15%** | Ordinario | 15 abr |
| `legales/03-transfer-pricing.html` | **15%** (coherente en 4 sitios) | Ordinario | 23 abr |
| `legales/para-firmar/transfer-pricing.html` | **20%** cláusula / **15%** diagrama | RST | 20 abr |
| `legales/07-master-services-agreement.html` | **20%** | RST | 19 mar |
| `guia-estructura-fiscal.html` (líneas 366, 529) | **20%** en ejemplos numéricos | — | — |

**Qué pasó:** el archivo se copió a `para-firmar/` el 20 de abril; el original se
corrigió a 15% el 23 de abril; la copia nunca se refrescó.

**Contradicción interna de `para-firmar/transfer-pricing.html`:**

```
línea  83  diagrama ............ "Service Fee (Cost + 15%)"
línea 131  CLÁUSULA OPERATIVA ... "Markup of 20%"    ← la que obliga
línea 146  justificación ....... 20%
línea 242  checklist ........... 20%
línea  88  régimen ............. RST 1.8%
```

**Conflicto de régimen adicional:** `brief-contadora-widdo-sas.md` ordena
explícitamente permanecer en Régimen Ordinario ("NO migrar a Simple bajo ningún
motivo"), pero `para-firmar/transfer-pricing.html` y el MSA están construidos sobre RST.

**Tu propio `legales/index.html` ya sabe cuál es el bueno** (línea 170): *"Transfer
Pricing (v1 — obsoleto). Versión anterior Cost+20%. Reemplazado por
transfer-pricing-agreement-final.md (Cost+15%, Régimen Ordinario)"*. El índice está
bien; la carpeta de firma es la que está mal.

```
DECISIÓN markup:   ____%
DECISIÓN régimen:  ________________
```

**Propagar a:** `para-firmar/transfer-pricing.html` (reemplazar por `03-transfer-pricing.html`),
`07-master-services-agreement.html` (o marcarlo obsoleto en el índice — hoy aparece
sin marca), `guia-estructura-fiscal.html` (ejemplos numéricos).

---

## 2. Founders Agreement y cap table ✅ VERIFICADO — CORRECTO

`legales/para-firmar/founders-agreement.html` es **byte-idéntico** (MD5
`e20be1cc…`) a `legales/01-founders-agreement-final.html`. Lo que está en la cola
de firma es el correcto.

Estructura del final, coherente en todo el documento:

```
10.000.000  autorizadas
 9.000.000  emitidas
   ├─ Miguel  6.300.000 = 70%   83(b) 17-mar-2026, $63,00
   └─ Alwin   2.700.000 = 30%   83(b) 17-mar-2026, $27,00
 1.000.000  reservadas (ESOP / SAFE)

Clase única, 1 voto por acción, derechos económicos idénticos.
Miguel: sin vesting. Alwin: reverse vesting 48m, cliff 12m (2 de 4 hitos).
Aceleradores post-cliff: 50 clubes USA / $10K MRR USA / seed >$500K.
```

`legales/02-ip-assignment.html` concuerda: 6.300.000 acciones como contraprestación
por la cesión de PI. ✅

`legales/01-founders-agreement.html` es un borrador antiguo (dual-class 10:1, 7M/3M,
95,9% de voto) que convive en la carpeta pero **no está en la cola de firma**.
Recomendado: renombrarlo a `-DRAFT-OBSOLETO` o moverlo a `_archivo/`. No urgente.

### 2b. `legal-c-corp-checklist.html` desactualizado ✅ VERIFICADO

Describe una estructura que ya no existe:

```
línea 508, 543  →  7.000.000 / 3.000.000 acciones   (números del BORRADOR)
línea 648-649   →  "70% x 10 votos = 700" / "30% x 1 = 30"
                   (aritmética DUAL-CLASS; el final es 1 voto por acción)
```

Arreglo mecánico, sin criterio: 7M→6,3M, 3M→2,7M, eliminar la aritmética 10:1.

---

## 2c. ⚠️ ESTRUCTURAL — ¿Widdo SAS es filial de Widdo Inc o empresa hermana?

**Verificado. Los documentos se contradicen y afecta la economía de ambos socios.**

Documentos que la llaman **filial**:

```
03-transfer-pricing.html:59,229    "Widdo Inc (Parent Company)"
03-transfer-pricing.html:236       "Widdo SAS (Subsidiary)"
01-founders-agreement-final:175    "Colombian operations (Widdo SAS subsidiary)"
01-founders-agreement-final:297    "Subsidiary — Widdo SAS (Colombia)"
```

Documentos que dicen lo contrario:

```
acta-002 (SAS)                     Miguel = accionista único, 100% del capital
01-founders-agreement-final:298    "affiliated operational entity"  (afiliada ≠ filial)
transfer-pricing-agreement-final   relación definida como "under common control"
                                   (lenguaje de hermanas, no de matriz-filial)
```

**Implicación económica:**

- Si la SAS fuera filial de la Inc → el 30% de Alwin le daría 30% de exposición
  indirecta a la SAS.
- Si la SAS es de Miguel a título personal (lo que dice el Acta) → Alwin tiene **cero**
  en la SAS, y la Inc le paga mensualmente costo + markup a una empresa 100% de Miguel.

Esto conecta directamente con la sección 1: **el markup de 15% o 20% no va a la
empresa compartida, va a la empresa personal de Miguel.** Y la cláusula 7.2 del
Founders Agreement establece que el salario de Miguel se paga vía la SAS con fondos
transferidos desde la Inc.

No hay indicio de nada impropio — es una estructura común y puede ser exactamente lo
acordado. El problema es que **los documentos no coinciden** sobre un punto material
para ambos socios. Es de lo primero que levanta un abogado o una due diligence.

```
DECISIÓN estructura:  [ ] SAS filial de Widdo Inc
                      [ ] SAS hermana, 100% Miguel  (estado actual según Acta 002)
DECISIÓN: ¿Alwin lo tiene claro por escrito?  [ ] sí  [ ] no
```

**Propagar a:** alinear el lenguaje "subsidiary" vs "affiliate" en
`03-transfer-pricing.html`, `01-founders-agreement-final.html` (líneas 175, 297-298)
y el acuerdo de transfer pricing. Consultar con abogado antes de tocar nada firmado.

---

## 3. Valoración ⚠️ REPORTADO

Cinco cifras circulando:

| Cifra | Fuente | Fecha |
|---|---|---|
| $350.000 pre-money | Term Sheet Partnership | 19 feb 2026 |
| $750.000 (método Berkus) | STARTUP-GLOSSARY.md | 20 feb 2026 |
| $1,5–2M pre-money | decks varios | — |
| cap SAFE $2M | finanzas/ | — |
| cap SAFE $3M | deck mar 2026 | — |

Las dos primeras están separadas por **un día**. Probablemente miden cosas distintas
(valoración para sweat equity de partner vs. valoración de ronda), pero hoy nada en
el corpus lo dice.

```
DECISIÓN valoración partner:   $__________
DECISIÓN cap SAFE ronda:       $__________
```

---

## 4. Tracción ⚠️ REPORTADO

**Clubes:** 3 / 8 / 14 / 15 / 17 / 21 según el documento.
`metrics.json` (la fuente de verdad declarada del proyecto) dice 8 clubes,
`paying_clubs: 3`, MRR real $96.

**MRR:** $96 (3 clubes) y $885 (15 clubes) **dentro del mismo archivo**
(`STARTUP-GLOSSARY.md`).

**LTV:** $768 / $1.416 / $2.376 / $3.096 en cuatro decks distintos.

**Margen bruto:** 81% / 90% / 91% / 93%.

**Burn "solo infraestructura":** $47/mes (`finanzas/index.html`) vs $81/mes
(`finanzas/estados-financieros.html`) vs $177/mes total con herramientas IA
(`finanzas/aportes-fundador.html`). Los recibos itemizados (`recibos/README.md`)
apuntan a $150–250+/mes.

⚠️ El $47/mes aparece en `TOUGH-QUESTIONS.md`, que es tu documento de preparación
para preguntas difíciles de inversores. Es el peor sitio posible para una cifra baja
que los recibos contradicen.

```
DECISIÓN clubes / pagando:  ____ / ____
DECISIÓN MRR:               $______
DECISIÓN burn real:         $______/mes
```

**Propagar a:** todos los decks vía `update-metrics.js` (ya existe el mecanismo —
`metrics.json` es fuente única y el script actualiza 11 archivos).

---

## 5. IVA Colombia ⚠️ REPORTADO — impacto ~16% en revenue

| Postura | Fuente |
|---|---|
| **Excluido de IVA** ($0, Art. 476 Num. 21 E.T.) | `DATOS_CONTABLES.md`, `legal/colombia/guia-contadora-estructura.html` |
| **19% obligatorio**, ya embebido en el precio | `finanzas/iva-pricing-internacional.html` |

No pueden ser ambas ciertas. La diferencia cambia el revenue real de Colombia en
~16%. **Esto es consulta para tu contadora, no una decisión de producto.**

```
DECISIÓN IVA:  ________________  (confirmar con contadora)
```

---

## 6. Pricing ⚠️ REPORTADO

**Plan Básico Colombia:** $49.000 COP/mes (`DATOS_CONTABLES.md`,
`finanzas/iva-pricing-internacional.html`) vs $69.000 COP/mes
(`legal/colombia/guia-contadora-estructura.html`) vs $69.000 en el deck consumer ES.

**USA:** $99/$199/$349 — consistente y ya vivo en la landing vía API.

**Precio piloto:** $59/mes vs $99/mes según el documento.

```
DECISIÓN Básico CO:  $______ COP/mes
DECISIÓN piloto USA: $______/mes
```

---

## 7. Estado de productos y competencia ⚠️ REPORTADO

**Widdo Academy:** `AGENTS.md` la da en standby/fuera de alcance;
`CLAUDE.md` la describe como una de 3 verticales activas generando revenue.

**Crossbar:** `widdo-competitive-landscape.html` dice que PlayMetrics lo adquirió en
2023 y "ya no es independiente"; el deck USA y el pitch script lo siguen listando
como competidor independiente con pricing propio. **Error factual detectable por un
inversor con contexto del sector.**

**Widdo Leagues:** cobra $0 hoy (feb 2026) vs pricing escalonado propuesto sin
validar ($35-160 CO / $99-499 USA) en el mismo documento.

**Posicionamiento:** el copy de Instagram apunta a Colombia en español con
`#DeporteColombia`; `contenido/linkedin/README.md` dice "nunca mencionar Colombia,
LATAM ni portugués — posicionamiento USA-only".

**ESOP:** 5% en el ejemplo de cap table del glosario vs 12% recomendado en el
Term Sheet §18.1.

**Tools del agente IA:** 56 (`KNOWLEDGE-BASE.md`) vs 75 (`yc-ai-first-playbook`).

**TAM:** $10.2B y $3.7B dentro del mismo archivo. Además, la misma cifra de $2.8B
aparece etiquetada "TAM" en un deck y "SAM" en otro.

**Pagaré:** `legales/index.html` dice $2.021,98; el pagaré ejecutado suma $1.554,31.

---

## Orden de ataque sugerido

1. **Transfer pricing** — es el único con riesgo legal/fiscal activo y fecha de
   disparo (firmar antes de la primera factura).
2. **IVA Colombia** — consulta a contadora; mueve los números de revenue.
3. **Tracción** — decidir cifras y correr `update-metrics.js` (ya automatizado).
4. **Crossbar** — corrección factual de 5 minutos en el deck USA y el pitch script.
5. El resto — higiene documental.
