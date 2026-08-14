# Generador QR Widdo

Genera un código QR estilizado para widdo.co con el logo "W." en el centro.

## Requisitos

- Node.js (v16 o superior)

## Instalación

```bash
cd /Users/miguelcano/Desktop/todo/Widdo/desarrollo/generador-qr-widdo
npm install
```

## Uso

### Generar SVG
```bash
npm run generate
```

### Generar PNG (desde SVG)
```bash
npm run png
```

### O ambos comandos juntos
```bash
npm run generate && npm run png
```

## Archivos generados

| Archivo | Formato | Uso |
|---------|---------|-----|
| `qr-widdo.svg` | Vector | Impresión, diseño gráfico, escalable a cualquier tamaño |
| `qr-widdo.png` | Raster 1000x1000px | Web, redes sociales |

## Características

- Color verde Widdo (#00FF41)
- Fondo negro (#000000)
- Logo "W." centrado en vectores
- Nivel de corrección de errores: Alto (H)
- URL codificada: https://widdo.co

## Personalización

Editar `generate-qr.js`:

```javascript
const url = 'https://widdo.co';  // Cambiar URL
const qrColor = '#00FF41';        // Cambiar color verde
const bgColor = '#000000';        // Cambiar fondo
const size = 1000;                // Cambiar tamaño
```

## Estructura

```
generador-qr-widdo/
├── generate-qr.js     # Script principal
├── package.json       # Dependencias
├── README.md          # Este archivo
├── qr-widdo.svg       # QR generado (vector)
└── qr-widdo.png       # QR generado (raster)
```
