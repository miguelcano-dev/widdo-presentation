const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const HTML_FILE = 'promissory-note.html';
const PDF_FILE = 'promissory-note.pdf';

(async () => {
  const htmlPath = path.join(__dirname, HTML_FILE);
  const pdfPath = path.join(__dirname, PDF_FILE);

  const html = fs.readFileSync(htmlPath, 'utf8');

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
    margin: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' }
  });

  await browser.close();
  console.log(`PDF generado: ${pdfPath}`);
})();
