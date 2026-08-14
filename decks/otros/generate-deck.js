const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 720 });

  const htmlPath = path.join(__dirname, 'deck-inversores-widdo.html');
  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  await new Promise(r => setTimeout(r, 2000));

  await page.pdf({
    path: path.join(__dirname, 'deck-inversores-widdo.pdf'),
    width: '1280px',
    height: '720px',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true
  });

  await browser.close();
  console.log('Deck PDF generado correctamente: deck-inversores-widdo.pdf');
})();
