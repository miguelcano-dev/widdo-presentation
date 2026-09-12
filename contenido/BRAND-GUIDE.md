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

### LinkedIn banner (portada de pagina de empresa)
- **Lienzo:** 1128x191 px
- **Exportar a 4x: 4512x764.** A 2x se ve pixelado: en pantalla Retina LinkedIn
  muestra la portada a mas de 1128 px CSS, y el archivo se estira ~1,4x.
- **Formato:** PNG (limite 8 MB). Si LinkedIn lo ensucia al recomprimir, subir el JPEG q96.
- **Zona que tapa el logo:** de x 0 a x 190, desde y 95. Nada legible ahi — el texto arranca en x 232.
- **Zona segura en movil:** de x 225 a x 902. Todo lo esencial vive dentro.
- Fuente y generador: `contenido/linkedin/perfil/` (`node build.js` y luego `node export.js`).

### Logo de LinkedIn — el recuadro blanco
**LinkedIn convierte el logo a JPEG, y JPEG no tiene canal alfa.** Aplana contra blanco
siempre, asi que subir un PNG transparente NO evita el recuadro blanco detras del logo.
Solo hay dos salidas, y las dos estan resueltas en `contenido/linkedin/perfil/`:
1. **Portada clara** (`...-light-*.png`): el recuadro blanco deja de contrastar. Sobre claro
   el verde correcto es `#16A34A`, el mismo del logo.
2. **Logo cuadrado a sangre** (`widdo-logo-square-800.png`): verde de borde a borde, sin
   nada que aplanar. Permite conservar la portada oscura, a costa de cambiar el circulo
   por un cuadrado.

⚠️ **Fondo oscuro de los banners: `#0A1410`**, no `#0A0A0F`. Es un negro con tinte verde;
sobre el, el `#00C853` no vibra como sobre un negro neutro. `#0A0A0F` se queda para las
cards de post.

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
