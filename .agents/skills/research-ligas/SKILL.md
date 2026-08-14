---
name: research-ligas
description: Use when building or expanding the USA prospect list (leagues/clubs/tournament organizers) for Widdo acquisition. Fans out research agents by sport/state and returns a verified table with real public contacts, never invented.
---

# research-ligas — Deep research de prospectos USA para Widdo

Construye o amplía la lista de organizaciones deportivas reales (ligas, clubes, organizadores de torneos) en USA para venderles Widdo.

## Contexto obligatorio (leer antes)
- `adquisicion-usa/AGENTS.md` — wedge, reglas, estructura.
- `adquisicion-usa/00-LISTA-MAESTRA-FLORIDA.md` — formato objetivo y prospectos ya encontrados (no dupliques).
- `negocio/sales/KNOWLEDGE-BASE.md` — diferenciadores y competidores.

## Cómo ejecutar
1. Pregunta/define el alcance: deporte(s) y estado(s). Por defecto Florida, todos los deportes.
2. Lanza **agentes en paralelo** (uno por deporte o por fuente) con la tarea de buscar en la web (WebSearch/WebFetch OBLIGATORIO) organizaciones reales.
3. Cada agente devuelve SOLO una tabla markdown con estas columnas exactas:
   `| Organización | Deporte | Ciudad/Región | Tipo | Tamaño aprox | Contacto público | Decisor | Ángulo de venta | Fuente |`
4. Compila todo en `adquisicion-usa/prospectos-raw/` (un archivo por deporte) y actualiza `00-LISTA-MAESTRA-FLORIDA.md` (Tier 1 = hispano/pequeño/usa competidor odiado; Tier 2 = land-and-expand).

## Reglas (innegociables)
- **NUNCA inventar** email/teléfono/nombre. Si no está en una página real → "no encontrado — ver web".
- Prioriza el wedge: hispano + pequeño + gestión manual o competidor (TeamSnap/SportsEngine/LeagueApps).
- Fuente infinita de soccer: **FYSA Club Finder (fysa.com/club-finder)**; filtra por ciudades hispanas (Hialeah, Kendall, Homestead, Kissimmee, Orlando).
- Cita la URL fuente en cada fila.
