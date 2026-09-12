const puppeteer = require('/Users/miguelcano/Desktop/todo/Widdo/node_modules/puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless: 'new' });
  const jobs = [
    ['render.html',       'dark'],
    ['render-light.html', 'light'],
    ['render-proof.html', 'dark-sinchip'],
  ];
  for (const [src, tag] of jobs) {
    for (const scale of [2, 4]) {
      const p = await b.newPage();
      await p.setViewport({ width: 1128, height: 191, deviceScaleFactor: scale });
      await p.goto('file://' + __dirname + '/' + src, { waitUntil: 'networkidle0' });
      await p.evaluateHandle('document.fonts.ready');
      const w = 1128 * scale, h = 191 * scale;
      await p.screenshot({ path: `${__dirname}/widdo-linkedin-banner-${tag}-${w}x${h}.png` });
      if (scale === 4) {
        await p.screenshot({ path: `${__dirname}/widdo-linkedin-banner-${tag}-${w}x${h}.jpg`, type: 'jpeg', quality: 96 });
      }
      await p.close();
    }
  }
  await b.close();
})();
