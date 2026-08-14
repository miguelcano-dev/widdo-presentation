# Documentos Firmados — Widdo

Guardar aquí los PDFs firmados por **todas** las partes. Un documento firmado por una sola
parte no sirve: no va aquí, sigue en `para-firmar/`.

## Cómo firmar (no hace falta DocuSign)

La firma electrónica es válida en Delaware (DGCL §116 + ESIGN Act). Para acuerdos entre dos
personas basta con:

1. **macOS Preview** — abrir el PDF → Marcado (Markup) → botón de firma → dibujar o usar la
   guardada → colocar sobre la línea → escribir la fecha en el campo de fecha
2. **Adobe Acrobat Reader** (gratis) — Rellenar y firmar
3. Si quieres rastro de auditoría: **Documenso**, **Dropbox Sign** o **DocuSign** (el plan
   gratuito alcanza para estos volúmenes). Genera un *Certificate of Completion* — guardarlo
   junto al PDF.

Para los que firman dos personas: firma Miguel, manda el PDF a Alwin por correo, Alwin firma
sobre el mismo archivo y lo devuelve. **Conservar también el hilo de correo** — es la prueba de
que hubo consentimiento informado y de la fecha.

Nombrar los archivos con fecha: `2026-08-03-promissory-note-FIRMADO.pdf`

## Estructura OBJETIVO (no es el estado actual)

> ⚠️ **Este árbol es la estructura que se quiere llegar a tener, no lo que hay.**
> A 13-ago-2026 la carpeta `firmados/` está **completamente vacía**: no existe ninguno de estos
> 14 PDFs ni ninguna de las 5 subcarpetas. Se crean a medida que cada documento se ejecute.
> Los ⏳ y 🔴 marcan qué falta; ninguna línea sin marca debe leerse como "ya está".

```
firmados/
├── c-corp/                    ← Widdo Inc (C Corp Delaware)
│   ├── founders-agreement.pdf          ⏳ falta Effective Date + firmas
│   ├── ip-assignment.pdf               🔴 SIN FIRMAR — el código no es de la empresa
│   ├── 83b-miguel.pdf
│   ├── 83b-alwin.pdf
│   ├── certificate-of-incorporation.pdf
│   └── bylaws.pdf
│
├── compensation/              ← Compensación de fundadores
│   ├── amendment-01-founder-compensation.pdf    ⏳ firman Miguel Y Alwin
│   └── contractor-services-agreement-miguel.pdf ⏳ por redactar
│
├── tax-forms/                 ← Formularios fiscales
│   └── w-8ben-miguel-2026.pdf           ⏳ antes del primer pago del estipendio
│
├── sas-colombia/              ← Widdo SAS (Colombia)
│   ├── acta-002-reforma.pdf
│   ├── transfer-pricing.pdf             ⏸️ en pausa, SAS inactiva
│   └── rut-actualizado.pdf
│
└── founder-loan/              ← Préstamo del fundador (PAGADO 3-ago-2026)
    ├── promissory-note-FIRMADO.pdf             ⏳ marcar "PAID IN FULL"
    ├── board-consent-ratificacion-FIRMADO.pdf  ⏳ firman Miguel Y Alwin
    └── comprobante-transferencia-mercury.pdf   ⏳ export del movimiento
```

## Estado a 13-ago-2026: NADA firmado todavía

Sin cambios desde el 3-ago. El préstamo del fundador **sí se pagó** (3-ago-2026, $1.476,46 USD),
pero el papel que lo respalda —promissory note y board consent— sigue sin firma.

| Documento | Quién firma | Cuándo |
|-----------|-------------|--------|
| `promissory-note` ($1.476,46) | Miguel (como CEO y como prestamista) | ya se pagó — firmar ya |
| `board-consent-founder-loan-repayment` | Miguel **y Alwin** | ya se pagó — firmar ya |
| `amendment-01-founder-compensation` | Miguel **y Alwin** | **antes del primer pago del estipendio** |
| `ip-assignment` | Miguel | cuanto antes — hoy el código es suyo, no de la empresa |
| `founders-agreement` | Miguel **y Alwin** | fijar Effective Date primero |
| W-8BEN | Miguel | antes del primer pago del estipendio |

## W-8BEN — cómo y dónde

**Qué es:** el formulario con el que una persona extranjera declara ante una empresa
estadounidense que no es contribuyente de EE.UU. Es **W-8BEN** (persona natural), no
W-8BEN-E (que es para entidades).

**Dónde se consigue:** https://www.irs.gov/forms-pubs/about-form-w-8ben — PDF rellenable.

**A quién se entrega: a la empresa, NUNCA al IRS.** Widdo Inc lo guarda en sus archivos como
*withholding agent* y solo lo muestra si el IRS lo pide. Por eso el archivo vive en
`firmados/tax-forms/`.

**Cómo llenarlo (caso de Miguel):**

| Línea | Qué poner |
|-------|-----------|
| 1 | Miguel Angel Cano Quinonez |
| 2 | Colombia (país de ciudadanía) |
| 3 | Dirección permanente en Colombia — Cra 22A #13-119 Torre 1 Apto 501, Fusagasugá, Cundinamarca |
| 4 | Vacía, salvo que la correspondencia vaya a otra dirección |
| 5 | SSN/ITIN — **vacía** (no tiene, y sin tratado no hace falta) |
| 6a | TIN extranjero: la **cédula** colombiana |
| 7 | Vacía |
| 8 | Fecha de nacimiento (MM-DD-YYYY) |
| **Parte II** | **Dejar VACÍA.** Colombia y EE.UU. **no tienen tratado de doble imposición vigente**, así que no hay beneficios de tratado que reclamar. |
| Parte III | Firmar, fecha, y marcar que firma el propio beneficiario |

**Vigencia:** hasta el 31 de diciembre del **tercer año** siguiente al de la firma. Firmado en
2026 → vale hasta el 31-dic-2029, salvo que cambien los datos declarados.

**Por qué hacerlo aunque el ingreso sea foreign-source:** los servicios se prestan desde
Colombia, así que en principio no hay retención de EE.UU. Pero si la empresa no tiene un W-8 o
W-9 en archivo, puede quedar obligada a aplicar *backup withholding* del 24%. El formulario es
la prueba documental que lo evita. ⚠️ **Confirmar con el CPA antes del primer pago.**

## Importante

- Guardar SIEMPRE el PDF firmado por todas las partes + el hilo de correo
- Estos archivos son PRIVADOS — no subirlos a GitHub
- El CPA USA necesita acceso a `c-corp/`, `compensation/`, `tax-forms/` y `founder-loan/`
- La contadora CO necesita acceso a `sas-colombia/`
- Para el CPA, junto con el Form 1120: el **Form 5472** cubre tanto el préstamo del accionista
  extranjero y su devolución como los pagos del estipendio. Multa $25.000 por no presentarlo.
