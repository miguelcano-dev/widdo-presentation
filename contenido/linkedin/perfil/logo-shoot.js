const puppeteer = require('/Users/miguelcano/Desktop/todo/Widdo/node_modules/puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless: 'new' });
  const p = await b.newPage();
  await p.setViewport({ width: 400, height: 400, deviceScaleFactor: 2 });
  await p.goto('file://' + __dirname + '/logo.html', { waitUntil: 'networkidle0' });
  await p.screenshot({ path: __dirname + '/widdo-logo-linkedin-800.png', omitBackground: true });
  await b.close();
})();
