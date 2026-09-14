/**
 * Portada del post en ingles `what-to-automate-first-youth-sports-club`.
 *
 * Es la unica de los 33 posts que quedo sin portada fotografica: no entro en el
 * inventario del que partio la entrega del 14-sep porque tenia `published_at`
 * el 22-sep y no salia como publicada.
 *
 * NO es una imagen generada por IA como las otras 32 — aqui no hay generador de
 * imagenes. Es una composicion HTML->WebP hecha para encajar en esa familia:
 * misma paleta (casi negro azulado, ambar calido, papel crema), misma
 * estructura (titular grande arriba a la izquierda, Widdo abajo, un ancla
 * visual a la derecha) y mismo tamano, 1600x900.
 *
 * La paleta se saco midiendo la version portuguesa del MISMO articulo:
 * #181818 / #001818 / #000000 dominan, con #483018 de luz calida.
 *
 * Lo que la imagen tiene que decir, que es lo que el articulo dice y las
 * plantillas genericas no decian: hay un ORDEN, el primer paso es el que se
 * paga solo, y hay trabajo que NO se automatiza.
 *
 *   node contenido/blog/portadas/generadores/en-automatizar/generar.js
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SALIDA = path.join(__dirname, 'what-to-automate-first-youth-sports-club-en-cover.webp');

const PASOS = [
  { n: '1', t: 'Dues reminders', icono: '✉' },
  { n: '2', t: 'Attendance', icono: '☑' },
  { n: '3', t: 'Registration', icono: '⚑' },
  { n: '4', t: 'Morning brief', icono: '▤' },
];

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@700;800;900&family=Inter:wght@600;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1600px;height:900px;overflow:hidden;position:relative;
       background:#0b0d12;font-family:'Red Hat Display',sans-serif;color:#F4F1EA}

  /* Suelo de cancha en penumbra: da profundidad sin competir con el texto. */
  .suelo{position:absolute;inset:0;
    background:
      radial-gradient(ellipse 62% 48% at 16% 72%, #573716 0%, transparent 64%),
      radial-gradient(ellipse 60% 50% at 88% 22%, #16233b 0%, transparent 60%),
      linear-gradient(170deg,#0d1017 0%,#090b10 55%,#05070b 100%)}
  /* Lineas de cancha, muy tenues. */
  .lineas{position:absolute;inset:0;opacity:.07}
  .lineas i{position:absolute;background:#cfd6e0}
  .l1{left:0;right:0;top:62%;height:3px;transform:rotate(-2.5deg)}
  .l2{left:9%;width:3px;top:56%;height:44%;transform:rotate(-2.5deg)}
  .arco{position:absolute;left:-6%;top:52%;width:760px;height:760px;
        border:3px solid #cfd6e0;border-radius:50%;opacity:.07;transform:rotate(-2.5deg)}
  /* Grano: sin esto la composicion se lee como un render plano. */
  .grano{position:absolute;inset:0;opacity:.16;mix-blend-mode:overlay;
    background-image:radial-gradient(#fff 1px,transparent 1px);background-size:3px 3px}
  .vineta{position:absolute;inset:0;
    background:radial-gradient(ellipse 85% 85% at 50% 45%,transparent 45%,#000 100%);opacity:.75}

  .wrap{position:absolute;inset:0;padding:74px 84px;display:flex;flex-direction:column;justify-content:space-between}

  h1{font-size:82px;line-height:1.02;font-weight:900;letter-spacing:-.035em;max-width:760px}
  h1 em{font-style:normal;color:#F0A23C}

  /* --- la escalera de pasos --- */
  .escalera{position:absolute;right:76px;top:214px;width:760px;height:560px}
  .paso{position:absolute;width:352px;border-radius:14px;padding:22px 26px;
        display:flex;align-items:center;gap:20px;
        background:linear-gradient(160deg,#F7F2E6 0%,#E4DBC8 100%);
        box-shadow:0 26px 54px #0009, inset 0 1px 0 #fff9;
        transform-origin:left center}
  .paso .num{font-size:46px;font-weight:900;line-height:1;color:#1a1d24;min-width:42px}
  .paso .txt{font-family:'Inter',sans-serif;font-size:23px;font-weight:700;color:#1a1d24;letter-spacing:-.01em}
  .paso .ico{margin-left:auto;font-size:26px;color:#8a7a5c}

  /* El primero manda: mas grande, mas cerca, con luz calida encima. */
  .p1{left:0;top:0;width:410px;transform:scale(1.06) rotate(-1.4deg);
      box-shadow:0 34px 70px #000b, 0 0 90px #f0a23c33, inset 0 1px 0 #fff}
  .p1 .num{color:#B26A12}
  .p2{left:104px;top:126px;transform:rotate(-.6deg);opacity:.93}
  .p3{left:186px;top:244px;transform:rotate(0deg);opacity:.88;filter:saturate(.75)}
  .p4{left:262px;top:358px;transform:rotate(.7deg);opacity:.78;filter:saturate(.5)}

  /* El que se queda fuera: apagado, separado y con borde, no relleno. */
  .humano{position:absolute;left:352px;top:482px;width:300px;border-radius:14px;
          padding:20px 26px;display:flex;align-items:center;gap:16px;
          border:2px dashed #7c869680;background:#ffffff08}
  .humano .txt{font-family:'Inter',sans-serif;font-size:21px;font-weight:700;color:#9AA4B2}
  .humano .ico{font-size:22px;color:#9AA4B2}

  .pie{display:flex;align-items:flex-end;justify-content:space-between}
  .marca{display:flex;align-items:center;gap:15px;font-size:40px;font-weight:900;letter-spacing:-.035em}
  .nota{font-family:'Inter',sans-serif;font-size:25px;font-weight:600;color:#C9B994;
        border-left:3px solid #F0A23C;padding-left:20px;line-height:1.4;margin-top:38px;max-width:560px}
</style></head><body>
  <div class="suelo"></div>
  <div class="lineas"><i class="l1"></i><i class="l2"></i></div>
  <div class="arco"></div>

  <div class="escalera">
    ${PASOS.map((p, i) => `
      <div class="paso p${i + 1}">
        <span class="num">${p.n}</span>
        <span class="txt">${p.t}</span>
        <span class="ico">${p.icono}</span>
      </div>`).join('')}
    <div class="humano">
      <span class="ico">◇</span>
      <span class="txt">Stays human</span>
    </div>
  </div>

  <div class="grano"></div>
  <div class="vineta"></div>

  <div class="wrap">
    <div>
      <h1>Automate<br><em>in this order.</em></h1>
      <p class="nota">Start with the one that pays for itself.<br>Leave the judgment calls alone.</p>
    </div>
    <div class="pie">
      <div class="marca">Widdo</div>
    </div>
  </div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1 });
  // domcontentloaded + document.fonts: 'networkidle0' se cuelga cuando la
  // peticion de Google Fonts ya esta en cache y queda abierta.
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 400));
  // WebP para igualar el formato de las otras 32 portadas.
  await page.screenshot({ path: SALIDA, type: 'webp', quality: 88 });
  await browser.close();

  const kb = Math.round(fs.statSync(SALIDA).size / 1024);
  console.log(`  ✓ ${path.basename(SALIDA)}  (${kb} KB, 1600x900)`);
})();
