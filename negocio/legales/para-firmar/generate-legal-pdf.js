// Uso: node generate-legal-pdf.js <archivo.html>  → genera <archivo>.pdf (A4, mismo patrón que generate-amendment-pdf.js)
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const HTML_FILE = process.argv[2];
if (!HTML_FILE) { console.error('Falta el archivo .html'); process.exit(1); }
(async () => {
  const htmlPath = path.join(__dirname, HTML_FILE);
  const pdfPath = htmlPath.replace(/\.html$/, '.pdf');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(fs.readFileSync(htmlPath, 'utf8'), { waitUntil: 'networkidle0' });
  await page.emulateMediaType('print');
  await new Promise(r => setTimeout(r, 500));
  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, margin: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' } });
  await browser.close();
  console.log(`PDF generado: ${pdfPath}`);
})();
