// Hoja de inversion Widdo — Cole Anthony & Crystal McCrary McGuire
// PDF rasterizado 2x (mismo patron que generate-one-pager-gameup.js:
// screenshot JPEG a 2x y PDF construido desde la imagen => scroll rapido en cualquier visor)
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Legal: 8.5in x 14in = 816 x 1344 px CSS, capturada a 2x
  await page.setViewport({ width: 816, height: 1344, deviceScaleFactor: 2 });

  const htmlPath = path.join(__dirname, 'hoja-inversion-cole-crystal.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // Control de overflow: el contenido debe terminar antes de que empiece el footer
  const fit = await page.evaluate(() => {
    const main = document.querySelector('.main').getBoundingClientRect();
    const footer = document.querySelector('.footer').getBoundingClientRect();
    return { mainBottom: main.bottom, footerTop: footer.top, gap: footer.top - main.bottom };
  });
  console.log(`main.bottom = ${fit.mainBottom.toFixed(1)}px | footer.top = ${fit.footerTop.toFixed(1)}px | holgura = ${fit.gap.toFixed(1)}px`);
  if (fit.gap < 0) console.log('*** OVERFLOW: el contenido invade el footer ***');

  const target = await page.$('.page');
  const img = await target.screenshot({ type: 'jpeg', quality: 92 });
  console.log('Pagina capturada a 2x. Construyendo PDF...');

  const pdfPage = await browser.newPage();
  await pdfPage.setContent(`<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; }
  @page { size: 816px 1344px; margin: 0; }
</style></head><body>
  <img src="data:image/jpeg;base64,${img.toString('base64')}" style="width:816px;height:1344px;display:block;" />
</body></html>`, { waitUntil: 'networkidle0' });

  await pdfPage.pdf({
    path: path.join(__dirname, 'hoja-inversion-cole-crystal.pdf'),
    width: '816px',
    height: '1344px',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true
  });

  await browser.close();
  console.log('PDF generado: hoja-inversion-cole-crystal.pdf (rasterizado 2x)');
})();
