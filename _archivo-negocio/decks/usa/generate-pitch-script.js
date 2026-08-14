// ARCHIVADO 13-ago-2026 — generador del guion obsoleto: su unico output esta archivado — sustituido por negocio/pitch/PITCH-SCRIPT.md
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 816, height: 1056 });
  const htmlPath = path.join(__dirname, 'pitch-script.html');
  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0',
    timeout: 30000
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.pdf({
    path: path.join(__dirname, 'pitch-script.pdf'),
    format: 'Letter',
    printBackground: true,
    margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
  });
  await browser.close();
  console.log('Pitch script PDF generated: pitch-script.pdf');
})();
