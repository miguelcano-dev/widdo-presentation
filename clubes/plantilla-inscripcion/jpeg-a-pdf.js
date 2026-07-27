/**
 * Envuelve un JPEG en un PDF de una pagina. Sin dependencias.
 *
 * Por que: el PDF que genera Chrome incrusta un subset de fuente distinto por
 * cada bloque de texto (~35 subsets = 512 KB) y rasteriza cada box-shadow como
 * una capa aparte (22 imagenes). Un PDF de una sola imagen pesa lo mismo que el
 * JPEG y abre al instante.
 */
const fs = require('fs');

/** Lee ancho/alto del primer frame SOF de un JPEG baseline. */
function medirJpeg(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    // SOF0..SOF15, saltando DHT(c4), JPG(c8) y DAC(cc)
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error('JPEG sin marcador SOF');
}

/**
 * @param {string} jpegPath  imagen de entrada
 * @param {string} pdfPath   salida
 * @param {number} anchoPt   ancho de pagina en puntos (612 = 8.5in)
 */
function jpegAPdf(jpegPath, pdfPath, anchoPt = 612) {
  const jpeg = fs.readFileSync(jpegPath);
  const { width, height } = medirJpeg(jpeg);
  const altoPt = +(anchoPt * height / width).toFixed(2);

  const contenido = Buffer.from(`q ${anchoPt} 0 0 ${altoPt} 0 0 cm /Im0 Do Q\n`, 'latin1');

  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${anchoPt} ${altoPt}] ` +
      `/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
    { dict: `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} ` +
            `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`,
      stream: jpeg },
    { dict: `<< /Length ${contenido.length} >>`, stream: contenido },
  ];

  const partes = [Buffer.from('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n', 'latin1')];
  const offsets = [];
  let pos = partes[0].length;

  objetos.forEach((obj, idx) => {
    const n = idx + 1;
    offsets.push(pos);
    let b;
    if (typeof obj === 'string') {
      b = Buffer.from(`${n} 0 obj\n${obj}\nendobj\n`, 'latin1');
    } else {
      b = Buffer.concat([
        Buffer.from(`${n} 0 obj\n${obj.dict}\nstream\n`, 'latin1'),
        obj.stream,
        Buffer.from('\nendstream\nendobj\n', 'latin1'),
      ]);
    }
    partes.push(b);
    pos += b.length;
  });

  let xref = `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach(o => { xref += String(o).padStart(10, '0') + ' 00000 n \n'; });
  xref += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${pos}\n%%EOF\n`;
  partes.push(Buffer.from(xref, 'latin1'));

  fs.writeFileSync(pdfPath, Buffer.concat(partes));
  return { width, height, anchoPt, altoPt };
}

module.exports = { jpegAPdf };
