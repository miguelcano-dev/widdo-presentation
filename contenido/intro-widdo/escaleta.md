# Escaleta — Intro/Reel Widdo (45 s, vertical, inglés, sin voz)

**Uso:** activo de venta autónomo. Se manda por email/DM, se pega en la landing.
No asume que el que mira conozca Widdo, y no pide que siga una cuenta.
**Paleta:** Esmeralda · **Tipografía:** Plus Jakarta Sans · **Formato:** 1080×1920

Regla que gobierna todo el guión: **se ve sin sonido**. El texto en pantalla es el guión,
no un adorno. Nada depende de la música.

---

## Los 12 frames

| # | Tiempo | Frame | Qué se ve | Qué se lee (final, EN) | Por qué existe |
|---|--------|-------|-----------|------------------------|----------------|
| 1 | 0.0–3.0 | **Hook** | Fondo limpio, sin objetos. Solo tipografía grande. | `Still chasing parents for money?` | Los 3 s que deciden todo. El dolor #1 del director, en segunda persona. Cero marca todavía. |
| 2 | 3.0–6.2 | **Caos** | Las fichas entran y se amontonan (12–14). Rotadas, tamaños distintos. | `Spreadsheets. Group chats.`<br>`Screenshots of receipts.` | Se reconoce a sí mismo. Tres sustantivos, sin verbo: se leen de un vistazo. |
| 3 | 6.2–7.4 | **Colapso** | Todo succionado al centro, motion blur, líneas de velocidad. | — | Sin texto. La imagen manda. |
| 4 | 7.4–7.7 | **Vacío** | Casi nada. Un punto. | — | El respiro. 0,3 s. |
| 5 | 7.7–9.6 | **Logo** | Logo Widdo + onda de choque. | — | La marca aparece por primera vez, ya ganada. |
| 6 | 9.6–12.0 | **Promesa** | Fondo limpio. | `One app runs your whole club.` | La frase que resume. Si solo ven hasta aquí, ya entendieron qué es. |
| 7 | 12.0–17.5 | **Pagos** | Pantalla real de la app, recortada al bloque de cobros, con movimiento lento de cámara. | `Know exactly who paid.`<br>`And who didn't.` | El primer beat de producto ataca el mismo dolor del hook. Cierra el círculo. |
| 8 | 17.5–22.5 | **Cobranza** | Pantalla de cobros / recordatorio. | `Widdo reminds them.`<br>`You stop asking.` ⚠️ | El beneficio emocional, no la función. ⚠️ Verificar qué está realmente automatizado. |
| 9 | 22.5–27.5 | **Asistencia** | Pantalla de asistencia, un jugador marcándose. | `Attendance in one tap.` | Prueba que no es solo cobros. Es el uso diario. |
| 10 | 27.5–33.0 | **Familias** | Pantalla del rol padre. | `Parents get their own app.`<br>`Schedule, payments, their kid.` | Le quita trabajo al director: deja de ser el call center del club. |
| 11 | 33.0–38.5 | **0% comisión** | Tipografía grande, cifra dominante `0%`. | `0% platform fee.`<br>`Family money lands in your Stripe account. Not ours.` | El diferenciador más duro y el más fácil de verificar. Va al final porque es el que cierra la objeción. |
| 12 | 38.5–45.0 | **Cierre** | Logo + regla de acento + URL. | `From $99/month.`<br>`Any sport. Any age.`<br>`widdo.co` | Precio a la vista. Un solo destino. |

---

## Arco

```
dolor (0-3)  →  caos (3-7)  →  vuelco (7-12)  →  producto (12-33)  →  cierre (33-45)
    3 s            4 s            5 s               21 s              12 s
```

El producto se lleva 21 de los 45 s — casi la mitad. Correcto para un activo que
tiene que vender solo: quien lo abre ya decidió mirar, no hay que retenerlo con trucos.

---

## Lo que NO va, y por qué

- **Cero métricas.** A hoy: 9 clubes, 3 pagando, MRR $101. No hay número que ayude.
  Poner "cientos de clubes" sería mentira y se verifica en 10 segundos. La prueba es el
  producto funcionando en pantalla.
- **Cero logos de clientes.** Mismo motivo.
- **Cero testimonios inventados.**
- **Cero "síguenos".** No hay perfil, y este video no vive en un feed.

---

## Decisiones abiertas (necesito tu respuesta antes del storyboard)

1. **CTA final.** ¿`widdo.co` a secas, `Book a demo`, o hay prueba gratis y va `Start free`?
   No sé si existe la prueba gratis; no la invento.
2. **Frame 8 (Cobranza).** ¿Qué manda Widdo hoy de forma automática — recordatorio de cobro
   por push, por correo, o lo dispara una persona? La frase cambia según la respuesta.
3. **Pantallas.** Tengo las previsualizaciones de la app en
   `mobile_flutter/artifacts/previews/v2/`. ¿Uso esas, o prefieres capturas nuevas de la
   build 18 que ya está en TestFlight?
4. **Precio en pantalla.** `From $99/month` deja fuera que el precio sube por cantidad de
   jugadores. ¿Se dice así, o `$99–$499/month`?
5. **Logos ajenos en el frame 2.** Como activo de venta directa el riesgo es bajo. Si algún
   día esto se pone en pauta paga de Meta, hay que quitarlos.
