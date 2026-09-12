// One-pager Widdo USA (inversores) — PDF rasterizado 2x, una pagina PDF por cada .page
// Mismo patron que generate-one-pager-gameup.js: screenshot JPEG a 2x y PDF construido
// desde las imagenes => scroll rapido en cualquier visor.
// Tamano LEGAL: 8.5in x 14in = 816 x 1344 px CSS.
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setViewport({ width: 816, height: 1344, deviceScaleFactor: 2 });

  const htmlPath = path.join(__dirname, 'one-pager-widdo-usa.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // ---- Medicion de overflow: el main NO debe pisar el footer en ninguna pagina ----
  const overflow = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.page')).map((p, i) => {
      const main = p.querySelector('.main');
      const footer = p.querySelector('.footer');
      const mainBottom = main.getBoundingClientRect().bottom;
      const footerTop = footer.getBoundingClientRect().top;
      return {
        page: i + 1,
        mainBottom: Math.round(mainBottom * 10) / 10,
        footerTop: Math.round(footerTop * 10) / 10,
        slack: Math.round((footerTop - mainBottom) * 10) / 10,
        ok: mainBottom < footerTop
      };
    });
  });

  console.log('--- Overflow check (main.bottom debe ser < footer.top) ---');
  overflow.forEach(o => {
    console.log(
      `  Pagina ${o.page}: main.bottom=${o.mainBottom}px  footer.top=${o.footerTop}px  ` +
      `holgura=${o.slack}px  ${o.ok ? 'OK' : 'DESBORDA'}`
    );
  });

  // ---- Captura de cada .page a 2x ----
  const targets = await page.$$('.page');
  const images = [];
  for (const t of targets) {
    const img = await t.screenshot({ type: 'jpeg', quality: 92 });
    images.push(img.toString('base64'));
  }
  console.log(`${images.length} pagina(s) capturada(s) a 2x. Construyendo PDF...`);

  const body = images
    .map(b64 => `<img src="data:image/jpeg;base64,${b64}" style="width:816px;height:1344px;display:block;" />`)
    .join('\n');

  const pdfPage = await browser.newPage();
  await pdfPage.setContent(`<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; }
  @page { size: 816px 1344px; margin: 0; }
  img { page-break-after: always; break-after: page; }
  img:last-child { page-break-after: auto; break-after: auto; }
</style></head><body>
${body}
</body></html>`, { waitUntil: 'networkidle0' });

  await pdfPage.pdf({
    path: path.join(__dirname, 'one-pager-widdo-usa.pdf'),
    width: '816px',
    height: '1344px',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true
  });

  await browser.close();

  const bad = overflow.filter(o => !o.ok);
  console.log(`PDF generado: one-pager-widdo-usa.pdf (${images.length} paginas, rasterizado 2x)`);
  if (bad.length) {
    console.error(`AVISO: ${bad.length} pagina(s) desbordan el footer.`);
    process.exitCode = 1;
  }
})();
