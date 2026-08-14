# Widdo Brand Guide — LinkedIn & Social Media

## Logo

- **Logo SVG:** `decks/assets/widdo-logo.svg`
- **Logo landing:** `desarrollo/landing/public/logo.svg`
- **Favicon:** `desarrollo/landing/public/favicon.png`
- El logo es un circulo verde con la "W" en blanco + punto
- Siempre usar sobre fondo oscuro o con suficiente contraste

## Colores

### Primarios

| Color | Hex | Uso |
|-------|-----|-----|
| **Green (landing/decks)** | `#00C853` | Acentos, CTAs, highlights en materiales de marketing |
| **Green (app/producto)** | `#16a34a` | UI del producto, botones, estados activos |
| **Dark background** | `#0A0A0F` | Fondo de decks, banners, cards oscuras |
| **Card dark** | `#12121A` | Cards sobre fondo oscuro |

### Texto

| Color | Hex | Uso |
|-------|-----|-----|
| **Light text** | `#E8E8ED` | Texto principal sobre fondo oscuro |
| **Dark text** | `#18181b` | Texto principal sobre fondo claro |
| **Muted** | `#6b7280` | Texto secundario, subtítulos |

### Secundarios (producto)

| Color | Hex | Uso |
|-------|-----|-----|
| **Secondary** | `#f0fdf4` | Fondo alternativo claro |
| **Accent** | `#dcfce7` | Hover, highlights suaves |
| **Cyan (trainer)** | `#0891b2` | Rol entrenador |
| **Violet (player)** | `#7c3aed` | Rol jugador |
| **Pink (parent)** | `#db2777` | Rol padre |

### Regla de uso

- **Marketing oscuro:** fondo `#0A0A0F`, verde `#00C853`, texto `#E8E8ED`
- **Marketing claro:** fondo `#ffffff`, verde `#16a34a`, texto `#18181b`
- **Producto:** fondo blanco, verde `#16a34a`, UI Tailwind estándar

## Tipografía

### Fuente principal: Red Hat Display

- **Google Fonts:** `Red Hat Display:wght@400;500;600;700;800;900`
- **Uso:** Todo — títulos, body, UI, marketing, decks, LinkedIn cards
- **Pesos frecuentes:**
  - `400` — body text
  - `500` — subtítulos, taglines
  - `600` — labels, botones
  - `700` — títulos de sección
  - `800` — nombre "Widdo", headings principales
  - `900` — impacto, datos grandes en cards

### Fuente monospace: JetBrains Mono

- **Uso:** Código, datos técnicos, métricas en slides
- **NO usar en LinkedIn cards ni posts**

### Reglas tipográficas

- **Nombre "Widdo"** siempre en Red Hat Display weight 800
- **Nunca usar:** Inter, Arial, Roboto, Space Grotesk, system fonts en materiales de marca
- **Tamaños sugeridos para cards (1080x1080):**
  - Dato/número grande: 72-96px, weight 900
  - Headline: 36-48px, weight 700-800
  - Body: 20-24px, weight 400-500
  - Tag/hashtag: 16px, weight 400

## Formatos de imagen

### LinkedIn post image
- **Tamaño:** 1200x627px (landscape) o 1080x1080px (cuadrado)
- **Resolución:** 2x (generar a 2160x2160 para nitidez)
- **Formato:** PNG

### LinkedIn banner
- **Tamaño:** 1128x191px
- **Resolución:** 2x
- **Formato:** PNG

### Carousel (PDF)
- **Tamaño por slide:** 1080x1080px
- **Máximo slides:** 10
- **Formato:** PDF (LinkedIn lo acepta como carousel)

## Estilo visual para cards

### Card oscura (principal para LinkedIn)
```
Fondo:        #0A0A0F
Borde sutil:  1px solid rgba(0, 200, 83, 0.15)
Esquinas:     12-16px border-radius
Texto:        #E8E8ED (principal), rgba(232,232,237,0.5) (secundario)
Acento:       #00C853 para highlights, números, keywords
Logo:         esquina superior izquierda o inferior, pequeño
```

### Card clara (alternativa)
```
Fondo:        #ffffff
Borde:        1px solid #e5e7eb
Esquinas:     12-16px border-radius
Texto:        #18181b (principal), #6b7280 (secundario)
Acento:       #16a34a para highlights
Logo:         esquina, version oscura del logo
```

### Reglas visuales

- Siempre incluir logo pequeño en alguna esquina
- No saturar de texto — máximo 30 palabras en una card
- Un dato/frase por card, no múltiples mensajes
- Suficiente padding (mínimo 60px en cada lado)
- Si hay screenshot del producto, usar mockup de dispositivo
- No usar stock photos nunca
- No usar emojis en cards (sí permitido en texto del post)

## Voz y tono

### En LinkedIn (inglés)
- Directo, sin corporate speak
- Datos concretos, no adjetivos vacíos
- Confiado pero no arrogante
- Técnico cuando es relevante, accesible siempre
- Frases cortas. Párrafos de 1-2 líneas máximo

### Palabras que SÍ usar
- Operating system, infrastructure, permanent, portable
- Built for, designed for, any sport, any age
- Replace, eliminate, automate

### Palabras que NO usar
- Revolutionary, game-changing, cutting-edge, synergy
- We're excited to announce, proud to share
- White-label, federation (estrategia interna)
- Disrupting, next-generation

## Archivos de referencia

| Asset | Ubicación |
|-------|-----------|
| Logo SVG | `decks/assets/widdo-logo.svg` |
| Banner LinkedIn | `decks/assets/linkedin-banner.html` → generar PNG con `node decks/assets/generate-banner.js` |
| Screenshots producto | `decks/assets/*.png` |
| Deck USA | `decks/usa/deck-usa-widdo.html` |
| Landing page | `desarrollo/landing/` |
