# Guión de pantalla — Intro Widdo (45 s, EN, sin voz)

Texto final, palabra por palabra. Cada línea es un elemento de texto en el frame.
`—` = frame sin texto.

Paleta Esmeralda · Plus Jakarta Sans · 1080×1920 · sin marcas de terceros.

---

| # | Tiempo | Texto en pantalla | Palabras / seg |
|---|--------|-------------------|----------------|
| 1 | 0–3.0 | **Still chasing parents for money?** | 5 / 3.0 |
| 2 | 3.0–6.2 | **Spreadsheets. Group chats.**<br>**Screenshots of receipts.** | 6 / 3.2 |
| 3 | 6.2–7.4 | — | |
| 4 | 7.4–7.7 | — | |
| 5 | 7.7–9.6 | — | |
| 6 | 9.6–12.0 | **One app runs your whole club.** | 6 / 2.4 |
| 7 | 12.0–17.5 | **Know exactly who paid.**<br>**And who didn't.** | 7 / 5.5 |
| 8 | 17.5–22.5 | **Widdo chases the payment.**<br>**You stop asking.** | 7 / 5.0 |
| 9 | 22.5–27.5 | **Attendance in one tap.** | 4 / 5.0 |
| 10 | 27.5–33.0 | **Parents get their own app.**<br>**Schedule, payments, their kid.** | 9 / 5.5 |
| 11 | 33.0–38.5 | **0% platform fee.**<br>**Their money goes to your Stripe account. Not ours.** | 11 / 5.5 |
| 12 | 38.5–45.0 | **From $99/mo**<br>**Any sport. Any age.**<br>**Start free for 14 days**<br>**widdo.co** | 10 / 6.5 |

Ninguna línea pasa de 2,3 palabras por segundo. Todas se leen sin pausar.

---

## Jerarquía por frame

Tamaños reales de los frames construidos.

| Frame | Elemento dominante | Peso | Tamaño |
|-------|--------------------|------|--------|
| 1 | La pregunta | 700 | 124 px |
| 2 | Los objetos. El texto es apoyo | 500 | 52 px |
| 6 | La frase | 700 | 108 px |
| 7–10 | **La pantalla del producto.** El texto es apoyo | 600 | 58 px |
| 11 | `0%` | 800 | 340 px — el único 800 de todo el video |
| 12 | `From $99/mo` | 700 | 118 px |

Dentro del teléfono, ningún texto baja de 30 px: a tamaño real de móvil eso son
11 pt, el suelo por debajo del cual una etiqueta deja de leerse en un video.

El frame 11 se lleva el único peso 800, según la regla que cerraste el 18-ago:
un solo 800 por pantalla, y en un video, uno solo en toda la pieza.


---

## Verificado en código antes de escribir

| Afirmación del guión | Estado | Dónde |
|---|---|---|
| Widdo persigue el pago solo | ✅ cierto | `routes/console.php`: `SendPaymentReminders` diario 07:30, `ProcessCollectionCycles` diario 08:15 (ciclo multi-día), `SendAutonomousPaymentReminders` cada hora |
| El canal es **email + in-app** | ⚠️ no push | `SendPaymentReminders` usa `PaymentReminderMail` (Resend). Push FCM sin configurar: falta `GoogleService-Info.plist`. **El guión no menciona canal** por eso |
| Prueba gratis de 14 días | ✅ existe | `SubscriptionPlansSeeder.php:51,70` (14 d Básico y Pro; 30 d Enterprise) + activación en `SubscriptionController.php:476-509` |
| Desde $99/mes | ✅ cierto | `SubscriptionPlansSeeder.php`, bloque USA: 9900 / 19900 / 34900 centavos |
| Nombrar a Stripe | ✅ correcto | Stripe es un proveedor que Widdo integra y se nombra a favor. La regla de "sin marcas de terceros" aplica a pintar marcas ajenas **como el problema**, no a nombrar a un socio |
| 0% de comisión | ✅ cierto | `TournamentPaymentService` no envía `application_fee_amount`; la rama del 3% en `StripeGateway.php:138` solo corre con `connected_account_id`, que nadie pasa |

---

## Riesgo abierto que no es del guión

**Gate 0 sigue sin cerrar: Stripe está en sandbox en producción.** Nadie puede pagar de
verdad todavía. `Start free for 14 days` funciona el día 1 — arrancar la prueba no cobra —
pero el día 14 no cobra nada. Si el video sale antes de las llaves live, el embudo termina
en una puerta cerrada.

---

## Falta para el storyboard

Los frames 7 a 10 muestran pantallas reales de la app y todavía no las tengo.
No puedo sacarlas de TestFlight. Dos caminos: me pasas capturas de la build 18, o
levanto el proyecto Flutter local y genero previsualizaciones nuevas.
