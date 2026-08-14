<!-- ARCHIVADO 13-ago-2026 — plataformas Instantly/Smartlead y dominio try-widdo.com descartados — sustituido por MOTOR/RUNBOOK.md -->
> ⚠️ **DOC ARCHIVADO (13-ago-2026).** Describe un setup de envío que ya no se usa.
> **Canal vigente: Brevo con sender `miguel@widdo.co`. Única fuente correcta: `../MOTOR/RUNBOOK.md`** (incluye límite diario real, verificación DKIM/DMARC y rutina de cada mañana).

# Envío de email en frío — setup, volumen y deliverability

> Cómo mandar los mensajes (FL, TX, torneos) sin caer en spam y con seguimiento. Regla de oro: el límite es **por buzón**, no total.

## Volumen seguro
| | Volumen |
|---|---|
| **Por buzón warmed** | **20-30 cold/día** (empezar 5-10 y subir en 2-3 semanas) |
| Límite superior por buzón | ~40-50/día (arriba = riesgo alto) |
| **Para más volumen** | **añadir buzones**, no subir el de uno |

**Escala:** 2 dominios × 3 buzones = 6 inboxes × 25/día ≈ **150/día** seguro. La herramienta rota sola.

## Checklist antispam (obligatorio)
- Dominio aparte del principal (ej. `try-widdo.com`) — protege widdo.co
- SPF + DKIM + DMARC configurados
- **Warm-up 2-3 semanas** antes de mandar en frío (la herramienta lo hace)
- Verificar emails antes (NeverBounce/ZeroBounce) → rebote bajo (un rebote alto quema el dominio)
- Primer email **sin enlaces**, personalizado, con dirección física + baja (CAN-SPAM)

## Plataformas
| Plataforma | Para qué | Precio aprox |
|---|---|---|
| **Instantly.ai** ⭐ | Empezar. Warm-up, rotación de buzones, secuencias, tracking. Simple/barata. | ~$37-97/mes |
| **Smartlead.ai** | Igual + **mejor API** → envío automático por agente. Buzones ilimitados en planes altos. | ~$39-94/mes |
| **Lemlist** | Premium, personalización con imágenes/video. | ~$69+/mes |
| **Apollo.io** | Sending + base de datos de leads. | ~$49+/mes |

**Recomendación:** Instantly para arrancar; Smartlead si quieres el envío automático por agente (API) desde el día 1. Ambas hacen **secuencias de follow-up** (mandan seguimiento solo si no responden).

## ⚠️ Tracking de aperturas = poco fiable
- **Apple Mail Privacy** infla las aperturas → el % miente.
- El pixel de tracking puede activar filtros de spam.
- **Trackea RESPUESTAS, no aperturas.** Métrica real = reply rate (3-8% es bueno). Los pros a menudo **desactivan** el open-tracking en el dominio de volumen para llegar mejor a inbox.

## Flujo accionable
Dominio aparte → warm-up 2-3 sem → 2-3 buzones → **~25/día por buzón** → Instantly/Smartlead → medir **respuestas** → 1-2 follow-ups automáticos → responder desde CRM (`negocio/sales/CRM.md`).
