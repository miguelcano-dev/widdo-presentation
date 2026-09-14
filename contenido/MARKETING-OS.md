# MARKETING-OS.md — El sistema de Content Ops de Widdo

Cómo se produce, revisa y publica TODO el marketing de Widdo. `contenido/` es el HQ:
todo asset y toda pieza generada vive aquí, nunca en `desarrollo/` (código) ni en
`decks/` (ventas/inversores).

## El pipeline editorial

```
ESTRATEGIA ──▶ BRIEF ──▶ CREACIÓN ──▶ BRAND QA ──▶ PUBLICAR ──▶ MEDIR
(mk-estratega)  (humano   (mk-copy +   (mk-brand-qa,  (Miguel,     (DMs/demos,
                o estratega) mk-diseno)  VETO)          a mano)      no vanity)
     ▲                                                                  │
     └───────── lo aprendido actualiza MESSAGING.md y el calendario ◀───┘
```

**Regla de veto: ninguna pieza está "lista para publicar" sin el APROBADO de `mk-brand-qa`.**
Sin excepciones — el claim falso del 2-3% vivió meses en 5 documentos por no tener este paso.

## El equipo (agentes en `Widdo/.claude/agents/`)

| Agente | Rol | Entrega |
|---|---|---|
| **mk-estratega** | Head of Content. Calendario, campañas, qué pieza toca | Calendario mensual, briefs por pieza |
| **mk-copy** | Copywriter EN. Posts en dos voces (página + founder) | Texto final por pieza |
| **mk-diseno** | Diseñador. Cards/imágenes HTML→PNG con el design system | PNG 2x listo para subir |
| **mk-brand-qa** | Guardián de marca. Audita contra MESSAGING.md. **Tiene veto** | APROBADO / RECHAZADO con razones |
| **widdo-growth** (ya existía) | Distribución y canales: Reddit, FB Groups, SEO briefs, video corto | Estrategia y aportes por canal |

Regla operativa de Miguel: **subagentes siempre con opus**.

### Cómo se corre una semana tipo

1. "usa **mk-estratega** para armar el calendario de la semana" → elige 2-3 piezas del backlog.
2. "usa **mk-copy** para escribir el post X" y "usa **mk-diseno** para la imagen del post X"
   (pueden ir en paralelo).
3. "usa **mk-brand-qa** para auditar el post X" → APROBADO o RECHAZADO con la línea exacta a corregir.
4. Miguel publica a mano (martes-jueves, 8-10 AM EST) y marca el calendario.
5. Lo que funcione (DMs, demos — no likes) vuelve a mk-estratega para la semana siguiente.

## Fuentes de verdad (en orden)

1. `../metrics.json` + hechos canónicos de `../CLAUDE.md` — cifras y hechos de negocio
2. **`MESSAGING.md`** — qué se dice, qué se prohíbe, vocabulario USA
3. **`BRAND-GUIDE.md`** — cómo se ve (colores, tipografía, tamaños)
4. `linkedin/BRIEF-POSTS-IA.md` — handoff autocontenido para IAs EXTERNAS (destilado de los
   dos anteriores; si MESSAGING cambia, este se regenera)

## Mapa de la carpeta

```
contenido/
├── MARKETING-OS.md      ← este archivo (el sistema)
├── MESSAGING.md         ← QUÉ se dice (fuente única de claims)
├── BRAND-GUIDE.md       ← CÓMO se ve
├── README.md            ← índice de canales y estado
├── assets/              ← manifiesto de assets canónicos (ver su README)
├── linkedin/            ← 🟢 activo: perfil/, posts/, images/, calendar.md, BRIEF-POSTS-IA.md
├── instagram/ facebook/ tiktok/   ← ⚪ sin abrir, a propósito
├── blog/                ← el blog entero: textos, traducciones y portadas
├── intro-widdo/         ← video de introducción (composición + guion)
└── post widdo/          ← imágenes sueltas heredadas (absorber a linkedin/images/ al usarlas)
```

## Estrategia del trimestre (decidida 19-ago-2026)

**Objetivo triple, cada uno con su superficie** (así "todos" no significa "ninguno"):

| Objetivo | Superficie | Contenido que lo sirve | Cómo se mide |
|---|---|---|---|
| 1. Que los dueños de club conozcan Widdo y agenden demos | **Página de empresa** | Posts de producto, dolor, torneos (serie caballo de Troya) | DMs de admins reales, demos agendadas |
| 2. Que los VC vean contenido vivo y crecimiento | **Perfil personal de Miguel** | Build-in-public: decisiones, aprendizajes, el viaje (voz founder de mk-copy) | Página activa 2-3x/sem sin huecos, seguidores como señal secundaria |
| 3. Credibilidad para el outreach | **Ambas** | La página completa y viva: quien recibe el email y googlea, encuentra algo serio | Respuestas al outreach que mencionen habernos mirado |

Cada pieza se publica en la página Y en versión founder en el perfil — por eso mk-copy
entrega SIEMPRE dos voces. No hay contenido "para VCs" separado: el build-in-public del
founder ES el contenido para VCs.

**Sistema visual del marketing (decidido): Red Hat Display + `#00C853`/oscuro** — coherente
con lo que el prospecto ve hoy (widdo.co, banner LinkedIn, decks). Plus Jakarta + Esmeralda
queda para la app móvil y el reel ya aprobado; cuando la web migre, migra el marketing.

## Fase 0 — Fundamentos (estado)

- [x] Messaging House (`MESSAGING.md`)
- [x] Sistema visual decidido (Red Hat + #00C853)
- [ ] **Dirección de arte de posts**: en lienzo, 3-4 direcciones sobre el mismo post — al
      aprobarse, la ganadora se escribe en `BRAND-GUIDE.md` como ley
- [ ] **Screenshots EN/USD**: ❌ CERO utilizables — los de `decks/assets/` están en español y
      COP (verificado 19-ago). Plan: sembrar club demo US (`USADemoClubSeeder`) y recapturar
      con `grabar-demo-widdo` / Playwright. Sin esto, ningún post de producto con screenshot
- [ ] Mockup de dispositivo (browser frame + phone frame) para enmarcar screenshots
- [ ] Set de iconos SVG propio (stroke, grid 16/20/24) — evita el emoji-icono

## Canales y idiomas (regla: el idioma se divide por RED, no por cuenta)

Una sola cuenta por red — nunca `widdo_latam` (divide seguidores y duplica trabajo;
práctica 2026 verificada: cuentas por país son para multinacionales B2C).

| Red | Cuenta | Idioma | Audiencia | Estado |
|---|---|---|---|---|
| LinkedIn | `widdo` | Feed 100% EN · About traducido a ES (función nativa) | US clubs, VCs, partners | 🟢 Activo |
| TikTok | `widdo` | EN primario + variantes ES | Coaches y padres (top of funnel) | 🟡 Motor de video (ver `tiktok/README.md`) |
| Instagram | `widdo` | Bilingüe: caption EN + ES debajo | Ambos mercados | 🟡 Relanzamiento: archivar posts viejos, publicar tablero Ajedrez, Reels = mismo video de TikTok |
| Facebook | Perfil founder + grupos | ES/EN según grupo | CO/MX + hispano USA (compradores directos) | Frente de widdo-growth |
| YouTube Shorts | `widdo` | EN | SEO de video, long tail | Recibe el mismo master vertical |

**Motor de video corto** (prioridad #1 del playbook): un video vertical maestro →
TikTok + Reels + Shorts, mismo archivo. Banco de ideas y reglas en `tiktok/README.md`.

## Cadencia y mezcla (LinkedIn, el único canal activo)

- 2-3 posts/semana en la página + 1/semana en perfil personal de Miguel (rinde ~10x).
- Pilares: Product 30% · Industry 25% · Differentiators 25% · Behind the scenes 20%.
- **≥1 de cada 4 posts = serie de torneos** (ver MESSAGING §6 — la razón no se dice en público).
- Backlog actual: 12 posts escritos (solo 01 con imagen) + 13 nuevos definidos en
  `linkedin/BRIEF-POSTS-IA.md` ≈ 10-12 semanas.
- **Prioridad #1: cerrar Fase 0 (dirección de arte + screenshots EN/USD). Luego: las 11 imágenes de los posts escritos y publicar el 01.**

## Definición de "pieza terminada"

- [ ] Copy en inglés, una idea, cierre sin beg, hashtags ≤5
- [ ] Imagen a 2x según BRAND-GUIDE (Red Hat Display, verdes correctos, sin emoji-iconos)
- [ ] **APROBADO de mk-brand-qa** contra MESSAGING.md
- [ ] Archivada en su canal (`linkedin/posts/` + `linkedin/images/`) con el mismo número
- [ ] Calendario actualizado

## Qué mide el éxito (no vanity)

DMs y comentarios de admins/organizadores reales, demos agendadas, leads inbound/mes.
Los likes no cuentan. (De `adquisicion-usa/05-CRECIMIENTO-ORGANICO.md`.)
