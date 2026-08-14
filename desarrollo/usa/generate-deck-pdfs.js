const puppeteer = require('puppeteer');
const path = require('path');

async function generatePDF(htmlFile, pdfFile) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const W = 1440;
  const H = 810;
  const OVERFLOW = 200; // allow up to 200px overflow without splitting

  await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });

  const htmlPath = path.join(__dirname, htmlFile);
  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  await new Promise(r => setTimeout(r, 3000));

  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('visible');
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
    const nav = document.querySelector('nav');
    if (nav) nav.style.display = 'none';
    document.querySelectorAll('.animate-bounce').forEach(el => {
      let p = el.closest('div');
      while (p && !p.classList.contains('absolute')) p = p.parentElement;
      if (p) p.style.display = 'none';
    });
    const s = document.createElement('style');
    s.textContent = 'body::before{display:none!important}';
    document.head.appendChild(s);
  });

  await new Promise(r => setTimeout(r, 500));

  // Get section + module-accent break points
  const breakPoints = await page.evaluate(() => {
    const points = [];
    const scrollY = window.scrollY;

    document.querySelectorAll('section').forEach(sec => {
      const secRect = sec.getBoundingClientRect();
      const secY = Math.round(secRect.top + scrollY);
      const secH = Math.round(secRect.height);

      const subModules = sec.querySelectorAll('.module-accent');

      if (secH <= 1010 || subModules.length === 0) {
        points.push({ y: secY, height: secH });
      } else {
        for (let i = 0; i < subModules.length; i++) {
          const modRect = subModules[i].getBoundingClientRect();
          const modY = Math.round(modRect.top + scrollY);
          let chunkY, chunkH;

          if (i === 0) {
            chunkY = secY;
            if (subModules.length > 1) {
              const nextRect = subModules[1].getBoundingClientRect();
              chunkH = Math.round(nextRect.top + scrollY) - secY;
            } else {
              chunkH = secH;
            }
          } else if (i === subModules.length - 1) {
            chunkY = modY;
            chunkH = (secY + secH) - modY;
          } else {
            chunkY = modY;
            const nextRect = subModules[i + 1].getBoundingClientRect();
            chunkH = Math.round(nextRect.top + scrollY) - modY;
          }
          points.push({ y: chunkY, height: chunkH });
        }
      }
    });
    return points;
  });

  // Build clips: cap at H, only split if truly huge
  const clips = [];
  for (const bp of breakPoints) {
    if (bp.height <= H + OVERFLOW) {
      // Fits in one page (cap screenshot at H)
      clips.push({ y: bp.y, h: Math.min(bp.height, H) });
    } else {
      // Really tall — split
      let rem = bp.height;
      let off = 0;
      while (rem > 0) {
        const h = Math.min(H, rem);
        if (h > 80) { // skip tiny slivers
          clips.push({ y: bp.y + off, h });
        }
        off += H;
        rem -= H;
      }
    }
  }

  console.log(`${htmlFile}: ${breakPoints.length} chunks → ${clips.length} pages`);

  const images = [];
  for (let i = 0; i < clips.length; i++) {
    const c = clips[i];
    const img = await page.screenshot({
      type: 'jpeg',
      quality: 90,
      clip: { x: 0, y: c.y, width: W, height: c.h }
    });
    images.push({ img, h: c.h });
    process.stdout.write(`\r  Capturing ${i + 1}/${clips.length}`);
  }
  console.log(' ✓');

  const pdfPage = await browser.newPage();
  await pdfPage.setViewport({ width: W, height: H });

  const html = images.map(({ img, h }) => {
    const b64 = img.toString('base64');
    return `<div style="width:${W}px;height:${H}px;page-break-after:always;margin:0;padding:0;overflow:hidden;background:#18181b;">
      <img src="data:image/jpeg;base64,${b64}" style="width:${W}px;height:${h}px;display:block;" />
    </div>`;
  }).join('');

  await pdfPage.setContent(`<!DOCTYPE html><html><head><style>
    *{margin:0;padding:0}
    @page{size:${W}px ${H}px;margin:0}
    body{margin:0;background:#18181b}
  </style></head><body>${html}</body></html>`, { waitUntil: 'networkidle0' });

  await pdfPage.pdf({
    path: path.join(__dirname, pdfFile),
    width: `${W}px`,
    height: `${H}px`,
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true
  });

  await browser.close();
  console.log(`  → ${pdfFile}`);
}

(async () => {
  await generatePDF('widdo-deck-es.html', 'widdo-deck-es.pdf');
  await generatePDF('widdo-deck-en.html', 'widdo-deck-en.pdf');
  await generatePDF('widdo-academy-onepager.html', 'widdo-academy-onepager.pdf');
  console.log('Done.');
})();
