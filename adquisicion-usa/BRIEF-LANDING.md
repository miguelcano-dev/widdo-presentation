# Brief / Prompt para otro agente — Landing de comparación (Widdo vs incumbentes)

> Copia lo de abajo y pásaselo a otro agente (Claude Code) trabajando en `desarrollo/landing`.

---

## PROMPT

Trabajas en el proyecto Next.js `desarrollo/landing` de Widdo (Next 16, React 19, Tailwind v4, next-intl con locales en/es/pt, lucide-react). Objetivo: **crear una landing/sección de comparación** que posicione a Widdo como la alternativa a TeamSnap, SportsEngine y LeagueApps para el mercado USA.

### Reglas del proyecto (respétalas)
- **Idioma por defecto: inglés** (`/en` es el default). Añade traducciones en `src/messages/en.json`, `es.json`, `pt.json` — NADA de texto hardcodeado en los componentes; todo vía diccionarios de next-intl.
- Reutiliza el **design system existente**: componentes en `src/components/landing/`, estilos Tailwind, íconos `lucide-react`. NO instales librerías nuevas.
- Usa/extiende el flag **`showCompetitors` en `src/lib/countries.ts`** (ya existe) para mostrar la comparación solo donde aplique (USA).
- Mantén SEO: hreflang/alternates y `sitemap.ts`/`robots.ts` ya existentes; añade metadata para las keywords objetivo.

### Copy y datos (NO inventar — usar estas fuentes del repo)
- Diferenciadores oficiales: `negocio/sales/KNOWLEDGE-BASE.md`.
- Quejas reales de competidores (para las filas de la tabla): `adquisicion-usa/reseñas-teamsnap.md` y `adquisicion-usa/reseñas-sportsengine-leagueapps.md`.
- Pricing de competidores verificado: `negocio/MARKET-RESEARCH-USA.md` (TeamSnap $9.99-13.99/team; SportsEngine $79-499/mo; Widdo Starter $29 / Pro $59 / Enterprise $99).

### Secciones a construir (en inglés)
1. **Hero:** promesa clara. Ej: *"Run your league or club without the ads, the fees, or the headaches."* Subtítulo con los 3 diferenciadores: **no ads even for paying families · ~50% cheaper · works in English & Spanish**. CTA primario: **"See the demo"** (link a demo online/Loom o Calendly); CTA secundario: "Talk to us".
2. **Tabla de comparación** Widdo vs TeamSnap vs SportsEngine vs LeagueApps. Filas (basadas en las quejas reales):
   - Ads shown to paying families → Widdo: **Never** / otros: **Yes**
   - Price → Widdo simple/low; otros caro / per-team / setup fees
   - Payment processing fee → Widdo bajo/claro; LeagueApps ~5%; SportsEngine fees altos
   - Support in English & Spanish → **Widdo only**
   - Ease of use (small clubs) → Widdo simple; SportsEngine "needs engineers/SQL"
   - Free data migration → **Widdo yes**
3. **Bilingual as a feature:** bloque corto explicando que jugadores/familias lo usan en EN o ES (diferenciador único).
4. **How it works / demo:** 3 pasos + embed del demo online.
5. **Social proof:** placeholder para testimonial/caso de estudio (dejar componente listo para cuando exista el primer design partner).
6. **FAQ:** "Do you charge per team?", "Can we import our data from TeamSnap?", "Is it really bilingual?", etc.
7. **CTA final:** "See the demo" / founding-partner offer.

### SEO objetivo (metadata + headings)
- "TeamSnap alternative", "SportsEngine alternative", "LeagueApps alternative", "bilingual sports league management", "youth sports app English Spanish".

### Entregable
- Componentes nuevos en `src/components/landing/` (ej. `ComparisonTable.tsx`, `CompetitorHero.tsx`).
- Página o sección integrada en `src/app/[locale]/page.tsx` o una ruta dedicada (ej. `/[locale]/vs-teamsnap`).
- Diccionarios en/es/pt actualizados.
- Tono: directo, honesto, sin hype. Mobile-first.

---

## Notas para Miguel
- La landing **convierte**, no atrae por sí sola: el tráfico inicial viene del **outreach de Alwin** (link en el email/DM). El SEO tarda meses.
- Puedes lanzar el outreach **antes** de que la landing esté lista, apuntando a un video de demo o Calendly.
- Como el buyer es angloparlante, la landing va en **inglés**; el bilingüe se vende como feature (y ya tienes es/pt en next-intl para las familias).
