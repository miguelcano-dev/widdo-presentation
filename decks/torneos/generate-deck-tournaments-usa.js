const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ============================================================
// DECK WIDDO TOURNAMENTS USA (ventas a organizadores de torneos)
// PDF rasterizado 2x
// Uso: node decks/torneos/generate-deck-tournaments-usa.js
// ============================================================

const INPUT = path.join(__dirname, 'deck-widdo-tournaments-usa.html');
const OUTPUT = path.join(__dirname, 'deck-widdo-tournaments-usa.pdf');

(async () => {
  if (!fs.existsSync(INPUT)) {
    console.error('');
    console.error('  ✗ No se encontro el HTML de entrada:');
    console.error(`      ${INPUT}`);
    console.error('');
    console.error('  Crea el deck HTML antes de generar el PDF.');
    console.error('');
    process.exitCode = 1;
    return;
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    // Las capturas de slide con screenshots grandes embebidos superan el
    // timeout por defecto del protocolo CDP (30s) y el generador moria con
    // ProtocolError: Runtime.callFunctionOn timed out.
    protocolTimeout: 300000,
    // /dev/shm pequeno hace que el renderer se atasque al decodificar varias
    // imagenes 2x a la vez.
    args: ['--disable-dev-shm-usage'],
  });

  let rasterFailed = null;
  try {
    const page = await browser.newPage();

    // 2x resolution for crisp screenshots
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });

    await page.goto(`file://${INPUT}`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Esperar a que TODAS las imagenes esten decodificadas (networkidle0 no
    // garantiza el decode; sin esto los screenshots salen con huecos)
    await page.evaluate(async () => {
      // Cada espera compite contra un reloj: una imagen que nunca dispara
      // load ni error colgaba el evaluate entero hasta el protocolTimeout.
      const withDeadline = (promise, ms) =>
        Promise.race([promise, new Promise(r => setTimeout(r, ms))]);

      const imgs = Array.from(document.images);
      await withDeadline(
        Promise.all(imgs.map(img => (
          img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise(resolve => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
              })
        ))),
        20000
      );
      if (document.fonts && document.fonts.ready) {
        await withDeadline(document.fonts.ready, 10000);
      }
    });

    await new Promise(r => setTimeout(r, 2000));

    const slideCount = await page.$$eval('.slide', slides => slides.length);
    if (slideCount === 0) {
      console.error('');
      console.error('  ✗ El HTML no contiene ningun elemento .slide.');
      console.error(`      ${INPUT}`);
      console.error('');
      process.exitCode = 1;
      return;
    }
    console.log(`Found ${slideCount} slides — capturing at 2x JPEG quality`);

    // Los handles se piden UNA vez y se liberan tras cada captura: rehacer
    // page.$$('.slide') en cada vuelta acumulaba 14 handles por iteracion y,
    // con 7 capturas 2x embebidas (~20 MB descomprimidos cada una), el
    // renderer se atascaba y moria con ProtocolError.
    const slideHandles = await page.$$('.slide');
    const slidePngs = [];
    for (let i = 0; i < slideHandles.length; i++) {
      const img = await slideHandles[i].screenshot({ type: 'jpeg', quality: 90 });
      slidePngs.push(img);
      await slideHandles[i].dispose();
      console.log(`  Slide ${i + 1}/${slideCount} capturada (${(img.length / 1024).toFixed(0)} KB)`);
    }
    console.log('All slides captured. Building PDF...');

    const pdfPage = await browser.newPage();
    await pdfPage.setViewport({ width: 1280, height: 720 });

    const imagesHtml = slidePngs.map((img) => {
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
      path: OUTPUT,
      width: '1280px',
      height: '720px',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true
    });

    const sizeMb = (fs.statSync(OUTPUT).size / (1024 * 1024)).toFixed(1);
    console.log(`Tournaments USA Deck PDF generated: deck-widdo-tournaments-usa.pdf (${slideCount} slides, ${sizeMb} MB, 2x JPEG 90%)`);
  } catch (err) {
    // La ruta rasterizada (14 screenshots 2x) se cae si la maquina esta
    // ajustada de memoria: el renderer muere con "Target closed" o el CDP
    // agota el protocolTimeout. El PDF vectorial es una sola operacion y
    // aguanta ahi donde la otra no. Sale mas ligero y con texto seleccionable;
    // lo unico que se pierde es el scroll instantaneo del rasterizado.
    rasterFailed = err;
    console.warn(`\nRasterizado fallido (${err.message.split('\n')[0]}).`);
    console.warn('Reintentando en vectorial, una sola pasada...');
    // Navegador NUEVO: si el rasterizado murio por "Target closed", la
    // instancia anterior ya esta caida y reutilizarla da "Connection closed".
    let fb = null;
    try {
      fb = await puppeteer.launch({
        headless: 'new',
        protocolTimeout: 240000,
        args: ['--disable-dev-shm-usage', '--disable-gpu'],
      });
      const p = await fb.newPage();
      await p.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
      await p.goto(`file://${INPUT}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await new Promise((r) => setTimeout(r, 4000));
      await p.pdf({
        path: OUTPUT,
        width: '1280px',
        height: '720px',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });
      const kb = Math.round(fs.statSync(OUTPUT).size / 1024);
      console.log(`PDF vectorial generado: ${require('path').basename(OUTPUT)} (${kb} KB)`);
      rasterFailed = null;
    } catch (err2) {
      console.error(`\nTambien fallo el vectorial: ${err2.message.split('\n')[0]}`);
      console.error('Libera memoria (cierra pestanas/apps) y reintenta.');
      process.exitCode = 1;
    } finally {
      if (fb) await fb.close().catch(() => {});
    }
  } finally {
    await browser.close();
  }
})();
