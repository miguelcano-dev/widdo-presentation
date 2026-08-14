const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function generateStyledQR() {
  const url = 'https://widdo.co';
  const size = 1000;
  const margin = 60;

  const bgColor = '#000000';
  const qrColor = '#00FF41';

  // Generar QR con alta corrección de errores
  const qrData = await QRCode.create(url, {
    errorCorrectionLevel: 'H',
    version: 4
  });

  const modules = qrData.modules;
  const moduleCount = modules.size;
  const moduleSize = (size - margin * 2) / moduleCount;

  const centerX = size / 2;
  const centerY = size / 2;
  const logoRadius = size * 0.16;

  // Función para verificar si está en área del logo
  function isInLogoArea(x, y) {
    const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    return dist < logoRadius + moduleSize * 1.5;
  }

  let svgElements = [];

  // Función para generar patrón de posición
  function getPositionPatternSVG(startX, startY) {
    const patternSize = moduleSize * 7;
    const outerSize = patternSize * 0.85;
    const coreSize = patternSize * 0.3;
    const cornerRadius = 8;
    const strokeWidth = moduleSize * 0.8;

    const cx = startX + patternSize / 2;
    const cy = startY + patternSize / 2;

    return `
    <rect x="${cx - outerSize / 2}" y="${cy - outerSize / 2}"
          width="${outerSize}" height="${outerSize}"
          rx="${cornerRadius}" ry="${cornerRadius}"
          fill="none" stroke="${qrColor}" stroke-width="${strokeWidth}"/>
    <rect x="${cx - coreSize / 2}" y="${cy - coreSize / 2}"
          width="${coreSize}" height="${coreSize}"
          rx="${cornerRadius / 2}" ry="${cornerRadius / 2}"
          fill="${qrColor}"/>`;
  }

  // Patrones de posición (esquinas)
  svgElements.push(getPositionPatternSVG(margin, margin));
  svgElements.push(getPositionPatternSVG(margin + (moduleCount - 7) * moduleSize, margin));
  svgElements.push(getPositionPatternSVG(margin, margin + (moduleCount - 7) * moduleSize));

  // Puntos del QR
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules.get(row, col)) {
        const x = margin + col * moduleSize + moduleSize / 2;
        const y = margin + row * moduleSize + moduleSize / 2;

        const isTopLeft = row < 7 && col < 7;
        const isTopRight = row < 7 && col >= moduleCount - 7;
        const isBottomLeft = row >= moduleCount - 7 && col < 7;

        if (isTopLeft || isTopRight || isBottomLeft) continue;
        if (isInLogoArea(x, y)) continue;

        const dotSize = moduleSize * 0.38;
        svgElements.push(`<circle cx="${x}" cy="${y}" r="${dotSize}" fill="${qrColor}"/>`);
      }
    }
  }

  // Logo "W." como path vectorial (bold)
  const logoPath = `
    <circle cx="${centerX}" cy="${centerY}" r="${logoRadius}"
            fill="${bgColor}" stroke="${qrColor}" stroke-width="6"/>
    <g transform="translate(${centerX - 60}, ${centerY - 42})">
      <path d="M 0 0 L 20 0 L 30 50 L 40 0 L 56 0 L 66 50 L 76 0 L 96 0 L 72 84 L 53 84 L 48 62 L 43 84 L 24 84 Z"
            fill="${qrColor}"/>
      <circle cx="115" cy="74" r="10" fill="${qrColor}"/>
    </g>
  `;
  svgElements.push(logoPath);

  // SVG completo
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${bgColor}"/>
  ${svgElements.join('\n  ')}
</svg>`;

  fs.writeFileSync(path.join(__dirname, 'qr-widdo.svg'), svg);
  console.log('✓ SVG generado: qr-widdo.svg');
  console.log('\n📱 URL codificada: https://widdo.co');
  console.log('📐 Tamaño: ' + size + 'x' + size);
  console.log('\n💡 Para convertir a PNG:');
  console.log('   - Abrir en navegador y hacer captura de pantalla');
  console.log('   - Usar Figma/Illustrator para exportar');
  console.log('   - O usar: npx svgexport qr-widdo.svg qr-widdo.png 1000:1000');
}

generateStyledQR().catch(console.error);
