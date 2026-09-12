const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 1128, height: 191, deviceScaleFactor: 2 });

  const htmlPath = path.join(__dirname, 'linkedin-banner.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({
    path: path.join(__dirname, 'linkedin-banner.png'),
    clip: { x: 0, y: 0, width: 1128, height: 191 }
  });

  console.log('Banner saved: linkedin-banner.png (2256x382 @2x)');
  await browser.close();
})();
