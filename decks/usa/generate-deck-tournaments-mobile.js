const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });

  const htmlPath = path.join(__dirname, 'deck-tournaments-mobile.html');
  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  await new Promise(r => setTimeout(r, 2000));

  const slides = await page.$$('.slide');
  console.log(`Found ${slides.length} slides — capturing at 2x quality`);

  const images = [];
  for (let i = 0; i < slides.length; i++) {
    const sl = slides[i];
    const img = await sl.screenshot({ type: 'jpeg', quality: 92 });
    images.push(img);
    process.stdout.write(`\rCapturing slide ${i + 1}/${slides.length}`);
  }
  console.log('\nAll slides captured. Building PDF...');

  const pdfPage = await browser.newPage();
  await pdfPage.setViewport({ width: 1280, height: 720 });

  const imagesHtml = images.map((img) => {
    const b64 = img.toString('base64');
    return `<div style="width:1280px;height:720px;page-break-after:always;margin:0;padding:0;overflow:hidden;">
      <img src="data:image/jpeg;base64,${b64}" style="width:1280px;height:720px;display:block;" />
    </div>`;
  }).join('\n');

  await pdfPage.setContent(`<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; }
  @page { size: 1280px 720px; margin: 0; }
  @media print { body { margin: 0; } }
</style></head><body>${imagesHtml}</body></html>`, {
    waitUntil: 'networkidle0'
  });

  await pdfPage.pdf({
    path: path.join(__dirname, 'deck-tournaments-mobile.pdf'),
    width: '1280px',
    height: '720px',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true
  });

  await browser.close();
  console.log('Short Tournament Deck PDF generated: deck-tournaments-mobile.pdf');
})();
