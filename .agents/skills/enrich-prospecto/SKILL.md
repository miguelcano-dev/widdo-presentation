---
name: enrich-prospecto
description: Use to find the missing contact info (email, phone, decision-maker) of a specific sports org that only has a website, for the Widdo USA prospect list. Returns a row in the master-list format. Never invents data.
---

# enrich-prospecto — Completar contacto de un prospecto

Dado el nombre y/o web de una organización deportiva, encuentra el contacto público que falta.

## Cómo ejecutar
1. Recibe: nombre de la org (+ web si se tiene).
2. Busca en la web (WebSearch/WebFetch) su página de contacto, "About/Staff", redes sociales, LinkedIn, directorios (FYSA, Exposure Events, baseballconnected, etc.).
3. Extrae: email, teléfono, Instagram/Facebook, y el **decisor** (director/president/owner) con su rol.
4. Devuelve una fila en el formato de `00-LISTA-MAESTRA-FLORIDA.md`:
   `| Organización | Deporte | Ciudad/Región | Tipo | Tamaño aprox | Contacto público | Decisor | Ángulo de venta | Fuente |`
5. Si el usuario lo pide, actualiza la fila correspondiente en la Lista Maestra o en el `prospectos-raw/` del deporte.

## Reglas
- **NUNCA inventar.** Si tras buscar no aparece → "no encontrado — ver web: <url>".
- Verifica que el email/teléfono esté en una página real y cita la URL en "Fuente".
- Marca el ángulo de venta según su situación (usa TeamSnap/LeagueApps, gestión manual, hispano, pequeño).
