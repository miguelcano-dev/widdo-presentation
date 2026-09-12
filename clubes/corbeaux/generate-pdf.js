const puppeteer = require('/Users/miguelcano/Desktop/todo/Widdo/node_modules/puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file://' + __dirname + '/acuerdo-beneficios-corbeaux.html', { waitUntil: 'networkidle0' });
  await page.pdf({
    path: __dirname + '/acuerdo-beneficios-corbeaux.pdf',
    format: 'Letter',
    printBackground: true,
    margin: { top: '9mm', bottom: '9mm', left: '10mm', right: '10mm' },
  });
  await browser.close();
  console.log('PDF_OK');
})();
