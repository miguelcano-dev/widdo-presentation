# Contenido — Redes y marketing orgánico de Widdo

Todo lo que sale a redes vive aquí. **No en `desarrollo/`**, que es código fuente, ni en
`decks/`, que es material de venta y de inversores.

| Regla | Por qué |
|-------|---------|
| Todo en **inglés** | Audiencia USA. Ver las reglas completas en `linkedin/README.md` |
| **Nunca** métricas internas (clubes, MRR, usuarios, churn, CAC) | Con 3 clubes pagando, los números restan |
| **Nunca** mencionar Colombia, LATAM ni portugués | Posicionamiento USA-only |
| La marca manda desde `BRAND-GUIDE.md` | Un solo sitio para colores, tipografía y formatos |

## Estado por canal

| Canal | Estado | Qué hay |
|-------|--------|---------|
| **LinkedIn** | 🟢 Activo | Portada, logo, tagline, 12 posts escritos, calendario |
| **Instagram** | 🟡 Relanzamiento | Archivar posts viejos (intros sin conversión), subir tablero Ajedrez, bilingüe EN+ES |
| **Facebook** | ⚪ Sin abrir | — |
| **TikTok** | 🟡 Motor de video | Superficie #1 del video corto (playbook orgánico #1). Ver `tiktok/README.md` |

LinkedIn es el canal maduro. TikTok+Reels+Shorts comparten UN video maestro (motor de video corto). Facebook queda como frente de widdo-growth (grupos, perfil founder).

## El sistema

El flujo completo (pipeline, equipo de agentes, veto de calidad) está en **`MARKETING-OS.md`**.
Los claims permitidos y prohibiciones en **`MESSAGING.md`** — fuente única de qué se dice.
Equipo: `mk-estratega`, `mk-copy`, `mk-diseno`, `mk-brand-qa` (veto) + `widdo-growth` (canales),
definidos en `Widdo/.claude/agents/`.

## Estructura

```
contenido/
├── MARKETING-OS.md     ← El sistema: pipeline, equipo, cadencia, definición de terminado
├── MESSAGING.md        ← Messaging House: claims verificados, voz, prohibiciones
├── BRAND-GUIDE.md      ← Colores, tipografía, formatos. Vale para TODOS los canales
├── assets/             ← Manifiesto de assets canónicos
├── blog/               ← El blog: textos, traducciones y portadas (ver su README)
├── linkedin/
│   ├── README.md       ← Estrategia, reglas de publicación, pilares de contenido
│   ├── calendar.md     ← Calendario de publicación
│   ├── perfil/         ← Portada, logo y tagline de la página de empresa
│   ├── posts/          ← 12 posts escritos, uno por archivo
│   └── images/         ← Imágenes de post + generador de cards
├── instagram/
├── facebook/
├── tiktok/
├── intro-widdo/        ← Video de introducción (composición .dc.html + guion)
└── post widdo/         ← Imágenes sueltas sin clasificar
```

## Antes de escribir cualquier cifra

Los hechos canónicos están en `../CLAUDE.md`. Los tres que más se contradicen solos:

- **Widdo cobra 0% platform fee.** Verificado en código. Nunca digas que se queda un % de los pagos.
- **Precios USA:** $99 / $249 / $499 al mes, por cantidad de jugadores (80/200/500). Anual = paga 12, recibe 13 (**8%**, no 17%).
- **33 deportes activos** en producción, 30 marcados como populares en USA.
