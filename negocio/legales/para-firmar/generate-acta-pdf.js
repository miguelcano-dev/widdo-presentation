const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const HTML_FILE = 'acta-002-decisiones-accionista-unico.html';
const PDF_FILE = 'acta-002-decisiones-accionista-unico.pdf';
const DIA = '22';
const MES = 'abril';

(async () => {
  const htmlPath = path.join(__dirname, HTML_FILE);
  const pdfPath = path.join(__dirname, PDF_FILE);

  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/\[DÍA\]/g, DIA).replace(/\[MES\]/g, MES);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.emulateMediaType('print');

  await new Promise(r => setTimeout(r, 500));

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: false,
    margin: { top: '2cm', right: '2cm', bottom: '2.5cm', left: '2cm' }
  });

  await browser.close();
  console.log(`PDF generado: ${pdfPath}`);
  console.log(`Fecha incorporada: ${DIA} de ${MES} de 2026`);
})();
