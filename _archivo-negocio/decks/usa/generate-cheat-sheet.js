// ARCHIVADO 13-ago-2026 — generador de la chuleta obsoleta — sustituido por negocio/pitch/TOUGH-QUESTIONS.md
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 816, height: 1056 });
  const htmlPath = path.join(__dirname, 'cheat-sheet-alwin-erica.html');
  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0',
    timeout: 30000
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.pdf({
    path: path.join(__dirname, 'cheat-sheet-alwin-erica.pdf'),
    format: 'Letter',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });
  await browser.close();
  console.log('Cheat sheet PDF generado: cheat-sheet-alwin-erica.pdf');
})();
