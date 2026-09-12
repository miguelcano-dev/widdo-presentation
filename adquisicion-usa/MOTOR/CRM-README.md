# CRM del motor de outreach — sin plataformas pagas

El CRM es **`CRM.csv`** (este directorio): un archivo, una fila por prospecto, que los
agentes leen y actualizan. Nada externo, nada pago. `brevo-import.csv` queda como el
formato de importación a Brevo; la verdad del seguimiento vive AQUÍ.

## Estados (columna ESTADO)

`Por enviar` → `Enviado` → `Respondió` → `Reunión` → `Cliente`
Salidas: `No interesado` · `Rebotó` · `No enviar` (bloqueado)

## Columnas de seguimiento

| Columna | Quién la llena | Cuándo |
|---|---|---|
| FECHA_ENVIO | Miguel o el agente, al enviar | Día del envío |
| FECHA_RESPUESTA + HILO_GMAIL | El agente al revisar la bandeja | Cuando responden |
| FOLLOWUP_1 / FOLLOWUP_2 | El agente al generar el follow-up | 5-7 días sin respuesta (secuencia en `../06-SECUENCIA-FOLLOWUPS-CLUBES.md`) |
| PROXIMA_ACCION / FECHA_PROXIMA | Siempre llenas — si están vacías, el prospecto se perdió | Cada toque |

## El ciclo (todo con herramientas ya conectadas, $0)

1. **Enviar** — Brevo (gratis hasta 300/día; enviamos 18/día). Manual hoy; automatizable
   con la API gratuita de Brevo cuando Miguel genere una API key.
2. **Registrar** — al enviar, se marca `Enviado` + fecha en CRM.csv.
3. **Leer respuestas** — el Gmail conectado a Claude lee la bandeja; el agente cruza
   remitentes contra CRM.csv, marca `Respondió`, guarda el hilo y **redacta el borrador
   de respuesta** (Miguel revisa y envía).
4. **Follow-ups** — el agente barre CRM.csv: `Enviado` sin respuesta ≥5 días →
   genera el follow-up de la secuencia y lo deja en cola para que Miguel lo envíe.
5. **Viernes** — widdo-datos lee CRM.csv y entrega: enviados, respuestas, reuniones.

## Comandos (frases para Claude)

- "revisa la bandeja y actualiza el CRM" → paso 3
- "¿a quién le toca follow-up?" → paso 4
- "¿cómo va el CRM?" → resumen por estado
- "marca enviados los de hoy" → paso 2

## ⚠️ Requisitos pendientes (una sola vez)

1. **Re-autorizar Gmail en Claude** — el token expiró (19-ago).
2. **Confirmar la cuenta**: el correo de widdo.co reenvía a `heywiddo@gmail.com`
   (Cloudflare Routing), pero el Gmail conectado a Claude es `weddoapp@gmail.com`.
   Si las respuestas caen en heywiddo, hay que conectar ESA cuenta (o reenviar
   heywiddo → weddoapp). Sin esto, el paso 3 no ve las respuestas.
