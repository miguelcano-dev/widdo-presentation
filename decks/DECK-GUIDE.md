# Guia Tecnica — Decks de Widdo

## Estructura de un Slide

Cada slide en los decks HTML sigue esta estructura:

```html
<div class="slide">
    <!-- Capas de fondo (de atras hacia adelante) -->
    <div class="bg-gradient"></div>      <!-- Gradiente sutil verde -->
    <div class="bg-blur-1"></div>         <!-- Circulo verde difuso (radial-gradient) -->
    <div class="bg-blur-2"></div>         <!-- Segundo circulo verde -->
    <div class="bg-grid"></div>           <!-- Grid sutil (imagen PNG tile) -->

    <!-- Contenido -->
    <div class="content">
        <div class="badge mb-24">...</div>  <!-- Badge de seccion -->
        <h2>...</h2>                         <!-- Titulo principal -->
        <!-- Contenido del slide -->
    </div>

    <!-- Footer -->
    <span class="confidential">Confidential</span>
    <span class="slide-number">1</span>
</div>
```

## Dimensiones

- Slide: **1280px × 720px** (16:9 HD)
- Font: **Red Hat Display** (Google Fonts)
- Color primario: **#16a34a** (verde)
- Background: **#18181b** (dark)

## CSS de los fondos

### Gradientes (vectoriales — ligeros)
```css
.bg-gradient       /* Verde sutil esquina superior izquierda */
.bg-gradient-right  /* Verde sutil esquina inferior derecha */
.bg-gradient-center /* Verde sutil radial al centro */
```

### Blurs (radial-gradient — ligeros)
```css
/* Reemplazados de filter:blur() a radial-gradient para optimizar PDF */
.bg-blur-1  /* Esquina superior izquierda, opacity 0.22 */
.bg-blur-2  /* Esquina inferior derecha, opacity 0.18 */
.bg-blur-3  /* Centro, opacity 0.10 */
```

### Grid (imagen PNG tile)
```css
.bg-grid { background-image: url('grid-tile.png'); background-size: 80px 80px; }
```
- `grid-tile.png` es un tile de 80×80px, 278 bytes
- Creado con node-canvas

## Componentes reutilizables

| Clase | Uso |
|-------|-----|
| `.badge` | Etiqueta verde redondeada (ej: "The Problem") |
| `.card` | Tarjeta con borde sutil |
| `.card-highlight` | Tarjeta con borde verde |
| `.metric-card` | Tarjeta con numero grande |
| `.pricing-card` | Tarjeta de pricing |
| `.timeline-item` | Item de timeline con dot |
| `.table-simple` | Tabla sin bordes, limpia |
| `.bullet-list` | Lista con bullets verdes |
| `.check-list` | Lista con checks verdes |
| `.grid-2/3/4` | Grid layouts |

## Generacion de PDF

### Metodo actual: Rasterizado 2x (recomendado)

```javascript
// 1. Captura cada slide como screenshot a 2x
page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
slide.screenshot({ type: 'jpeg', quality: 90 });

// 2. Arma un HTML temporal con imagenes base64
// 3. Exporta a PDF
```

**Ventaja:** Scroll rapido, calidad nitida
**Desventaja:** 5.3MB vs 2MB vectorial

### Metodo alternativo: Vectorial (si necesitas texto seleccionable)

```javascript
await page.pdf({
    width: '1280px', height: '720px',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true
});
```

**Ventaja:** Texto seleccionable, menor tamano
**Desventaja:** Scroll lento por re-renderizado de vectores

## Modo Presentacion (HTML)

El deck USA tiene JavaScript para presentar directamente desde el browser:

1. Abrir `deck-usa-widdo.html` en Chrome/Safari
2. Presionar **F** para fullscreen
3. Usar flechas para navegar

**Nota:** El modo presentacion NO se incluye en el PDF (el script se ignora).

## Como crear un nuevo deck

1. Copiar `deck-usa-widdo.html` como base
2. Adaptar contenido slide por slide
3. Crear script `generate-deck-NOMBRE.js` (copiar de `generate-deck-usa.js`)
4. Generar PDF: `node generate-deck-NOMBRE.js`

## Optimizacion de imagenes

Los screenshots de producto estan en `decks/assets/`:
```bash
# Redimensionar a 900px de ancho (macOS)
sips --resampleWidth 900 imagen.png
```

## Dependencias

```bash
npm install puppeteer canvas
```

- **puppeteer**: Genera PDFs y screenshots
- **canvas**: Genera el grid-tile.png (solo se necesita una vez)
