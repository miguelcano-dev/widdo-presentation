const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Set viewport to slide size
  await page.setViewport({ width: 1280, height: 720 });

  const htmlPath = path.join(__dirname, 'presentacion-widdo-en.html');

  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0',
    timeout: 60000
  });

  // Wait for all images to fully load
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve);
        });
      })
    );
  });

  // Wait for Google Fonts to load
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });

  // Extra buffer for rendering
  await new Promise(r => setTimeout(r, 1500));

  await page.pdf({
    path: path.join(__dirname, 'presentacion-widdo-en.pdf'),
    width: '1280px',
    height: '720px',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true
  });

  await browser.close();
  console.log('English PDF generated successfully: presentacion-widdo-en.pdf');
})();
