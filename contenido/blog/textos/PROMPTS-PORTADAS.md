# Prompts de portadas — 9 posts del blog

**Para qué:** generar la imagen de fondo de cada portada con un modelo de
imagen (Codex / Midjourney / Firefly / el que uses). Yo no tengo generador en
la sesión de Claude Code, así que este archivo es el encargo listo para pasar.

**Qué hacer con el resultado:** dejar los 9 archivos en
`contenido/blog/portadas/generadores/fondos/<slug>.jpg` y avisar. El script de portadas
los compone con la franja de marca (logo + tagline + titular) y saca el JPEG
final 2400x1260. Sin esa franja son fotos sueltas y no se reconocen como Widdo.

---

## Reglas comunes (van en TODOS los prompts)

- Formato **horizontal 1200x630** (o 1920x1008 y se recorta).
- **Zona de texto libre a la izquierda**: el 55% izquierdo de la imagen tiene
  que quedar oscuro y sin detalle, porque encima va el titular. Es el requisito
  que más se incumple y el que obliga a repetir la generación.
- **Tono oscuro**, verdoso-neutro, cercano a `#0A1410`. Nada de fondos claros:
  el texto de la franja es blanco.
- **Sin texto, sin logos, sin marcas** dentro de la imagen. Cualquier letra que
  genere el modelo saldrá deforme y hay que descartarla.
- **Sin caras reconocibles de menores.** Siluetas, manos, contraluz, planos de
  espalda o detalle. Es una regla legal, no estética: publicamos material sobre
  clubes juveniles.
- Estilo **fotográfico realista, luz lateral suave**, poca saturación, con un
  toque de verde en las luces. Nada de ilustración 3D ni de estilo "stock
  corporativo sonriente".

---

## 1. `why-dues-collection-breaks-down` — Dues & payments

> Dark cinematic photograph, horizontal. Right side: a parent's hands holding a
> phone showing an abstract payment screen (no legible text), warm screen glow
> on the fingers. Left 55% of the frame: deep near-black green shadow, empty.
> Shot indoors at a sports facility at dusk, shallow depth of field, soft side
> light, subtle green highlights. Realistic, muted, no faces, no text, no logos.

## 2. `parent-communication-sports-club` — Communication

> Dark cinematic photograph, horizontal. Right side: several phones lying on a
> bench in a locker room, screens glowing faintly, seen from above at an angle.
> Left 55%: deep near-black green shadow, empty. Cold ambient light with a green
> cast, shallow depth of field. Realistic, muted, no faces, no readable text.

## 3. `what-to-automate-first-youth-sports-club` — Automation

> Dark cinematic photograph, horizontal. Right side: an empty coach's clipboard
> and a phone resting on a bench at the edge of an indoor court, low raking
> light. Left 55%: deep near-black green shadow, empty. Quiet, end-of-day mood,
> shallow depth of field, subtle green rim light. Realistic, no faces, no text.

## 4. `attendance-tracking-youth-sports-clubs` — Attendance

> Dark cinematic photograph, horizontal. Right side: a row of young athletes
> seen from behind, lined up on a court sideline, backlit so they read as
> silhouettes. Left 55%: deep near-black green shadow, empty. Strong backlight
> with green spill, haze in the air. Realistic, no recognizable faces, no text.

## 5. `signals-player-about-to-leave-club` — Retention

> Dark cinematic photograph, horizontal. Right side: a single empty seat on a
> bench in a dim gym, the rest of the bench out of focus, one shaft of light on
> it. Left 55%: deep near-black green shadow, empty. Melancholy, quiet, shallow
> depth of field, faint green tone. Realistic, no people, no text.

## 6. `registration-season-checklist-youth-sports` — Registration

> Dark cinematic photograph, horizontal. Right side: a folding table at a club
> registration desk — blank forms, a pen, a stack of paper — lit by one warm
> lamp. Left 55%: deep near-black green shadow, empty. Evening light, shallow
> depth of field, green ambient cast. Realistic, no faces, no legible text.

## 7. `per-player-pricing-youth-sports-software` — Pricing

> Dark cinematic photograph, horizontal. Right side: many identical jerseys on
> hangers receding into darkness, repetition emphasized. Left 55%: deep
> near-black green shadow, empty. Cold light, single green highlight on the
> nearest jersey, shallow depth of field. Realistic, no text, no visible logos.

## 8. `youth-sports-club-software-guide` — Getting started

> Dark cinematic photograph, horizontal. Right side: a cluttered club office
> desk — loose papers, a laptop closed, a whistle, a coffee cup — shot from a
> low angle. Left 55%: deep near-black green shadow, empty. Late-night lamp
> light with green ambient fill, shallow depth of field. Realistic, no text.

## 9. `ai-native-club-operations` — AI-native

> Dark cinematic photograph, horizontal. Right side: a single hand about to
> tap a glowing screen held at an angle, the green screen light spilling onto
> the fingers, everything else in shadow. Left 55%: deep near-black green
> shadow, empty. High contrast, minimal, shallow depth of field. Realistic, no
> face, no legible text.

---

## Criterio de aceptación (revisar antes de dar por buena)

1. ¿El 55% izquierdo está limpio y oscuro? Si hay detalle ahí, el titular no se
   lee. **Es el motivo número uno de rechazo.**
2. ¿Aparece alguna letra o logo inventado? Descartar.
3. ¿Se reconoce la cara de un menor? Descartar.
4. En miniatura de 300px, ¿se distingue de las otras ocho? Si dos parecen la
   misma, cambiar el sujeto de una — es exactamente el problema que teníamos
   con las tarjetas tipográficas.
