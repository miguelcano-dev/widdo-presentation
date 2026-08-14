const puppeteer = require('puppeteer');
const path = require('path');

const file = process.argv[2] || '01-the-problem';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

  const htmlPath = path.join(__dirname, `${file}.html`);
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1500));

  const outPath = path.join(__dirname, `${file}.png`);
  await page.screenshot({
    path: outPath,
    clip: { x: 0, y: 0, width: 1080, height: 1080 }
  });

  console.log(`Card saved: ${file}.png (2160x2160 @2x)`);
  await browser.close();
})();
