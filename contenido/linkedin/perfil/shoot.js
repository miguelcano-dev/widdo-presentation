const puppeteer = require('/Users/miguelcano/Desktop/todo/Widdo/node_modules/puppeteer');
(async () => {
  const scale = Number(process.argv[2] || 1);
  const out = process.argv[3] || 'preview.png';
  const b = await puppeteer.launch({ headless: 'new' });
  const p = await b.newPage();
  await p.setViewport({ width: 1128, height: 191, deviceScaleFactor: scale });
  await p.goto('file://' + __dirname + '/render.html', { waitUntil: 'networkidle0' });
  await p.evaluateHandle('document.fonts.ready');
  await p.screenshot({ path: __dirname + '/' + out, omitBackground: false });
  await b.close();
  console.log('ok', out, scale + 'x');
})();
