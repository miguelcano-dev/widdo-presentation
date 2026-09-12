// One-pager Widdo × GameUp — PDF rasterizado 2x (mismo patrón que generate-deck-usa.js:
// screenshot JPEG a 2x y PDF construido desde la imagen => scroll rápido en cualquier visor)
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Legal: 8.5in x 14in = 816 x 1344 px CSS, capturada a 2x
  await page.setViewport({ width: 816, height: 1344, deviceScaleFactor: 2 });

  const htmlPath = path.join(__dirname, 'one-pager-gameup-partnership.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  const target = await page.$('.page');
  const img = await target.screenshot({ type: 'jpeg', quality: 92 });
  console.log('Página capturada a 2x. Construyendo PDF...');

  const pdfPage = await browser.newPage();
  await pdfPage.setContent(`<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; }
  @page { size: 816px 1344px; margin: 0; }
</style></head><body>
  <img src="data:image/jpeg;base64,${img.toString('base64')}" style="width:816px;height:1344px;display:block;" />
</body></html>`, { waitUntil: 'networkidle0' });

  await pdfPage.pdf({
    path: path.join(__dirname, 'one-pager-gameup-partnership.pdf'),
    width: '816px',
    height: '1344px',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true
  });

  await browser.close();
  console.log('PDF generado: one-pager-gameup-partnership.pdf (rasterizado 2x)');
})();
