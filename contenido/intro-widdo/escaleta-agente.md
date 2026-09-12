# Escaleta v2 — el agente como protagonista (45 s, EN, sin voz)

Sustituye a `escaleta.md`. Cambian los frames 6 a 10; el 1 al 5 y el 11 y 12 sobreviven.
Paleta Esmeralda · Plus Jakarta Sans · 1080×1920 · sin marcas de terceros.

**El giro:** el video ya no enseña una app con pantallas. Enseña **una cosa que trabaja
mientras el director duerme**, y termina explicando por qué eso no da miedo.

---

## Los 12 frames

| # | Tiempo | Frame | Qué se ve | Qué se lee (EN) | Por qué existe |
|---|--------|-------|-----------|-----------------|----------------|
| 1 | 0–3.0 | **Hook** | Tipografía sola | `Still chasing parents for money?` | Sin cambios |
| 2 | 3.0–6.2 | **Caos** | Objetos amontonados, puntos rojos | `Spreadsheets. Group chats.`<br>`Screenshots of receipts.` | Sin cambios |
| 3 | 6.2–7.4 | **Colapso** | Succión al centro | — | Sin cambios |
| 4 | 7.4–7.7 | **Vacío** | Un punto | — | Sin cambios |
| 5 | 7.7–9.6 | **Logo** | Logo + onda | — | Sin cambios |
| 6 | 9.6–12.4 | **Promesa** ⟳ | Tipografía sola | `Widdo doesn't just store your club.`<br>`It runs it.` | **Nueva.** Marca la diferencia entre archivo y agente. Todo lo que sigue la demuestra |
| 7 | 12.4–18.0 | **El parte** ⟳ | Teléfono: parte del día — sesiones de hoy, familias en mora, cola de comprobantes, cumpleaños | `Open the app.`<br>`Widdo already knows what needs you.` | El agente no espera pregunta. Ya hizo el trabajo |
| 8 | 18.0–24.0 | **El hallazgo** ⟳ | Zoom a la fila de comprobantes. La cifra cuenta hacia arriba | `Widdo found $8,400.`<br>`Already paid. Receipts nobody opened.` | **El pico emocional.** No le vende una función: le devuelve plata que ya tenía |
| 9 | 24.0–29.5 | **De noche** ⟳ | Reloj a las 8:00 pm, tres avisos saliendo, registro de lo que hizo | `At 8pm it nudges whoever owes.`<br>`You didn't ask.` | El agente actuando solo. Es lo que ningún competidor hace |
| 10 | 29.5–35.0 | **El límite** ⟳ | El control de autonomía: `Reminders — On its own` en verde, `Finances — Ask me first` bloqueado | `It never moves money without you.`<br>`Six of nine actions always ask first.` | **Desarma el miedo.** "IA autónoma" suena a caja descuadrada; esto lo apaga |
| 11 | 35.0–39.5 | **0%** | `0%` gigante | `0% platform fee.`<br>`Their money goes to your Stripe account. Not ours.` | Sin cambios. Segundo golpe de confianza, ahora sobre el dinero |
| 12 | 39.5–45.0 | **Cierre** | Logo + precio + CTA | `From $99/mo`<br>`Any sport. Any age.`<br>`Start free for 14 days`<br>`widdo.co` | Sin cambios |

⟳ = frame nuevo o reescrito.

---

## Arco

```
dolor (0-3) → caos (3-7) → vuelco (7-12) → el agente trabaja (12-30) → confianza (30-40) → cierre (40-45)
    3 s          4 s           5 s                  18 s                     10 s            5 s
```

La diferencia con la v1: los 18 segundos de producto ya no son cuatro pantallas quietas.
Son **una sola historia** — encuentra, avisa, actúa, se detiene donde debe.

---

## Micro-animaciones (una por frame, no más)

| Frame | Qué se mueve |
|---|---|
| 7 | Las filas del parte entran escalonadas, 80 ms de diferencia. Nada más |
| 8 | La cifra **cuenta hacia arriba** hasta 8.400 y el contador de comprobantes baja de 114 a 0 |
| 9 | El reloj marca 8:00, salen tres avisos hacia arriba y el registro escribe una línea |
| 10 | El interruptor de `Finances` intenta moverse y **vuelve solo**. Ese rebote es el frame |

El rebote del frame 10 es la mejor animación de la pieza: dice "no puede" sin una palabra.

---

## Verificado en código

| Afirmación | Estado | Dónde |
|---|---|---|
| 124 herramientas | ✅ | `app/Services/Assistant/ToolDefinitions.php` |
| Control de autonomía por club, 3 niveles | ✅ | `AIAutonomySetting`: 0 sugiere, 1 pregunta, 2 actúa solo |
| **6 de 9 categorías con tope en "pregunta"** | ✅ | `AutonomyService::CATEGORY_MAX_LEVEL` — `finances`, `players`, `sessions`, `events`, `club_settings`, `tournaments` = 1 |
| Actúa solo a las 8 pm hora local del club | ✅ | `SendAutonomousPaymentReminders`: corre cada hora, `DEFAULT_SCHEDULE_HOUR = 20`, mínimo 3 días entre avisos, tope 100 destinatarios |
| Deja rastro de lo que hizo | ✅ | `AIAutonomousAction` |
| El parte trae sesiones, mora, comprobantes, cumpleaños y anomalías | ✅ | `DailyBriefService::getDailyBrief`, caché de 15 min |
| Los comprobantes se aprueban **de a uno** | ✅ | A propósito, control financiero del club. El parte solo avisa de la cola y su antigüedad |

**El frame 8 sale de un caso real de producción**, no de una idea: un club tenía 114
comprobantes sin abrir por 10.245.000 COP, el más viejo de hacía tres meses, y por eso
figuraba recaudando el 12%. Esa plata ya la habían pagado las familias. En el video va como
**$8.400, dato de demostración de un club ficticio** — el caso real es en pesos y no se puede
enseñar como cifra de USA.

---

## Lo que este corte pierde

**Ya no se ve la asistencia ni la app de las familias.** El reel v1 dedicaba dos frames a eso.
Aquí desaparecen. A cambio gana una historia sola en vez de un catálogo. Si quieres que
vuelvan, hay que ir a 60 s o sacarlos en una pieza aparte — meterlos aquí rompe el arco.

---

## Dos cosas que hay que decidir

1. **El aviso del frame 9 es in-app, no push.** `SendAutonomousPaymentReminders` escribe una
   `PlaNotification`; el correo se queda con el trabajo de las 07:30. Sin push configurado
   (falta `GoogleService-Info.plist`), la familia lo ve **la próxima vez que abre la app**.
   El frame sigue siendo cierto, pero **cerrar el hueco de push es lo que lo haría demoledor**:
   "a las 8 pm le suena el teléfono a quien debe" es otra frase.
2. **La cifra del frame 8.** $8.400 es un club ficticio. Si prefieres una cifra más conservadora
   o más agresiva, se cambia en un renglón.
