/**
 * Portadas de los posts del blog en ingles. HTML -> PNG 1200x630.
 *
 * Por que generadas y no de banco de imagenes: nueve fotos de stock de ninos
 * jugando no se parecen entre si, envejecen y no dicen nada. Una tarjeta
 * tipografica con el sistema de marca se reconoce como Widdo en el feed y en
 * el resultado de busqueda, que es para lo que sirve la imagen destacada.
 *
 * Marca (contenido/BRAND-GUIDE.md): fondo #0A1410 — el negro con tinte verde de
 * los banners, no el #0A0A0F neutro, porque sobre este el verde no vibra —,
 * verde #00C853, texto #E8E8ED, Red Hat Display.
 *
 *   node contenido/blog-seo/posts/generate-covers.js
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SALIDA = path.join(__dirname, 'covers');

// El titulo de la portada no es el titulo SEO: en 1200x630 tiene que leerse de
// un vistazo, asi que va la idea, no la frase completa.
const POSTS = [
  { slug: 'why-dues-collection-breaks-down',            kicker: 'Dues & payments',   title: 'Why dues collection<br>breaks down' },
  { slug: 'parent-communication-sports-club',           kicker: 'Communication',     title: 'The group text is not<br>a communication system' },
  { slug: 'what-to-automate-first-youth-sports-club',   kicker: 'Automation',        title: 'What to automate first<br>in your club' },
  { slug: 'attendance-tracking-youth-sports-clubs',     kicker: 'Attendance',        title: 'Attendance tracking<br>that coaches actually use' },
  { slug: 'signals-player-about-to-leave-club',         kicker: 'Retention',         title: 'The signals a player<br>is about to leave' },
  { slug: 'registration-season-checklist-youth-sports', kicker: 'Registration',      title: 'The registration<br>season checklist' },
  { slug: 'per-player-pricing-youth-sports-software',   kicker: 'Pricing',           title: 'What per-player<br>pricing really costs' },
  { slug: 'youth-sports-club-software-guide',           kicker: 'Getting started',   title: 'Running a club<br>without spreadsheets' },
  { slug: 'ai-native-club-operations',                  kicker: 'AI-native',         title: 'You approve.<br>It executes.' },
];

const plantilla = ({ kicker, title }) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@500;700;800;900&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#0A1410;font-family:'Red Hat Display',sans-serif;
       color:#E8E8ED;position:relative;overflow:hidden}
  /* El verde entra como luz, no como bloque: mancha grande y difusa en una esquina. */
  .glow{position:absolute;width:820px;height:820px;border-radius:50%;
        background:radial-gradient(circle,#00C85338 0%,transparent 62%);top:-330px;right:-230px}
  .grid{position:absolute;inset:0;opacity:.05;
        background-image:linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px);
        background-size:64px 64px}
  .wrap{position:relative;height:100%;padding:76px 84px;display:flex;flex-direction:column;justify-content:space-between}
  .kicker{display:flex;align-items:center;gap:12px;font-size:18px;font-weight:800;
          letter-spacing:.18em;text-transform:uppercase;color:#00C853}
  .kicker .dot{width:9px;height:9px;border-radius:50%;background:#00C853}
  h1{font-size:76px;line-height:1.06;font-weight:900;letter-spacing:-.035em;max-width:960px}
  .foot{display:flex;align-items:center;justify-content:space-between;
        border-top:1px solid #ffffff1f;padding-top:30px}
  .brand{display:flex;align-items:center;gap:14px;font-size:30px;font-weight:800;letter-spacing:-.03em}
  .mark{width:44px;height:44px;border-radius:11px;background:#00C853;color:#07180e;
        display:grid;place-items:center;font-size:26px;font-weight:900}
  .tag{font-size:19px;font-weight:500;color:#8FA093}
</style></head><body>
  <div class="glow"></div><div class="grid"></div>
  <div class="wrap">
    <div class="kicker"><span class="dot"></span>${kicker}</div>
    <h1>${title}</h1>
    <div class="foot">
      <div class="brand"><span class="mark">W</span>Widdo</div>
      <div class="tag">AI-native operations for sports clubs</div>
    </div>
  </div>
</body></html>`;

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

  for (const post of POSTS) {
    // 'networkidle0' se colgaba a partir de la segunda tarjeta: la peticion de
    // Google Fonts queda abierta cuando ya esta en cache. Se espera a las
    // fuentes directamente, que es la condicion que de verdad importa.
    await page.setContent(plantilla(post), { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 250));
    // JPEG y no PNG: una tarjeta de 2400x1260 en PNG pesa ~350 KB y en JPEG de
    // calidad 82 baja a ~190 KB sin diferencia visible. La imagen destacada la
    // carga cada visita del post.
    const destino = path.join(SALIDA, `${post.slug}.jpg`);
    await page.screenshot({ path: destino, type: 'jpeg', quality: 82 });
    const kb = Math.round(fs.statSync(destino).size / 1024);
    console.log(`  ✓ ${post.slug}.jpg  (${kb} KB)`);
  }

  await browser.close();
  console.log(`\n  ${POSTS.length} portadas en ${SALIDA}`);
})();
