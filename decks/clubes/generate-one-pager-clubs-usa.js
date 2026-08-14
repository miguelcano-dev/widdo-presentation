/**
 * One-pager (version corta del deck de clubes USA): 1 pagina Letter, sin capturas.
 * Vectorial, no rasterizado: es texto y cabe en una pagina, asi que el PDF
 * queda ligero y con texto seleccionable.
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const HTML = path.join(__dirname, 'one-pager-widdo-clubs-usa.html');
const PDF = path.join(__dirname, 'one-pager-widdo-clubs-usa.pdf');
const PNG = path.join(__dirname, 'one-pager-widdo-clubs-usa.png');

(async () => {
  if (!fs.existsSync(HTML)) {
    console.error(`No encuentro el HTML de entrada:\n  ${HTML}`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });
    await page.goto(`file://${HTML}`, { waitUntil: 'networkidle0', timeout: 30000 });
    // Margen para que Red Hat Display acabe de cargar antes de medir.
    await new Promise((r) => setTimeout(r, 1500));

    // Aviso si el contenido desborda la pagina: en un one-pager es el fallo
    // que mas facil se cuela, porque el PDF simplemente recorta sin avisar.
    const overflow = await page.evaluate(() => {
      const el = document.querySelector('.page');
      return { scroll: el.scrollHeight, client: el.clientHeight };
    });
    if (overflow.scroll > overflow.client + 2) {
      console.warn(
        `AVISO: el contenido desborda ${overflow.scroll - overflow.client}px. ` +
          'Reduce texto o tamanos antes de enviarlo.'
      );
    }

    await page.pdf({
      path: PDF,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    const kb = Math.round(fs.statSync(PDF).size / 1024);
    console.log(`One-pager Clubs USA generado: one-pager-widdo-clubs-usa.pdf (1 pagina, ${kb} KB)`);

    // Version PNG para COMPARTIR (WhatsApp, Slack, DM, redes).
    // Un PDF vectorial con degradados no siempre genera miniatura en esas apps
    // y ademas obliga a descargar; una imagen se ve inline al instante.
    const el = await page.$('.page');
    await el.screenshot({ path: PNG });
    const pkb = Math.round(fs.statSync(PNG).size / 1024);
    console.log(`Version para compartir: one-pager-widdo-clubs-usa.png (2x, ${pkb} KB)`);
  } finally {
    await browser.close();
  }
})();
