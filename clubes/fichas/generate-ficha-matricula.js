const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Tamaño carta (Letter)
  await page.setViewport({ width: 816, height: 1056 });

  const htmlPath = path.join(__dirname, 'ficha-matricula-baqueros.html');

  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  // Esperar un momento para que carguen los estilos
  await new Promise(r => setTimeout(r, 1000));

  await page.pdf({
    path: 'ficha-matricula-baqueros.pdf',
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0.5cm',
      right: '0.5cm',
      bottom: '0.5cm',
      left: '0.5cm'
    }
  });

  await browser.close();
  console.log('PDF generado correctamente: ficha-matricula-baqueros.pdf');
})();
