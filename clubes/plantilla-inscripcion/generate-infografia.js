/**
 * Genera la infografia "Proceso de inscripcion - Widdo" para un club.
 *
 * Uso:
 *   node generate-infografia.js lions           un club ya registrado
 *   node generate-infografia.js                 todos los de clubes.json
 *   node generate-infografia.js lions --png     ademas, PNG @2x sin perdida
 *   node generate-infografia.js lions --vector  PDF con texto vectorial (pesa ~3x)
 *   node generate-infografia.js --fondo         re-hornea fondo.jpg y sale
 *
 * Club nuevo en un solo comando (copia el logo, lo registra y genera):
 *   node generate-infografia.js --nuevo \
 *     --nombre "Lions Ibagué" \
 *     --logo ~/Downloads/logo.jpg \
 *     --dueno "Ronald Iván Hernández" \
 *     --deporte Baloncesto
 *
 * Salida en salida/:
 *   inscripcion-<slug>.jpg   1600x1990  -> WhatsApp / redes
 *   inscripcion-<slug>.pdf   1 pagina   -> imprimir / enviar
 *
 * Optimizaciones (medidas sobre Lions, PDF 1.8MB -> ~430KB):
 *  1. El fondo texturizado se hornea UNA vez a fondo.jpg. Sin eso, las 4 capas
 *     de filtro CSS se rasterizan dentro del PDF.
 *  2. El PDF se arma envolviendo el JPEG ya renderizado (jpeg-a-pdf.js). El PDF
 *     nativo de Chrome incrusta un subset de fuente por bloque de texto
 *     (35 subsets = 512KB) y rasteriza cada box-shadow aparte (22 imagenes).
 *     Con --vector se usa el de Chrome: texto seleccionable, pero pesado y lento.
 *  3. Los logos se reducen a MAX_LOGO px antes de incrustarse.
 */
const puppeteer = require('puppeteer');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { jpegAPdf } = require('./jpeg-a-pdf');
const { svgFlechas } = require('./flechas');

const DIR = __dirname;
const OUT = path.join(DIR, 'salida');
const CACHE = path.join(DIR, '.logos-opt');
const W = 1600;
const H = 1990;
const MAX_LOGO = 460;     // px: el logo mas grande se muestra a 210px @2x
const JPG_QUALITY = 84;

const args = process.argv.slice(2);
const wantPng = args.includes('--png');
const wantVector = args.includes('--vector');
const soloFondo = args.includes('--fondo');
const wantNuevo = args.includes('--nuevo');

/** Lee `--clave valor` de la linea de comandos. */
const opt = k => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : null;
};

const BANDERAS_CON_VALOR = ['nombre', 'logo', 'dueno', 'email', 'deporte', 'slug', 'jugador'];
const slugArg = args.find((a, i) =>
  !a.startsWith('--') && !BANDERAS_CON_VALOR.includes((args[i - 1] || '').replace(/^--/, '')));

/** Convierte "Lions Ibagué" -> "lions-ibague". */
const aSlug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Registra un club nuevo: copia el logo a logos/ y escribe la entrada
 * en clubes.json. Devuelve el slug.
 */
function registrarClub(archivoClubes) {
  const faltan = ['nombre', 'logo', 'dueno'].filter(k => !opt(k));
  if (faltan.length) {
    console.error(`Faltan datos obligatorios: ${faltan.map(f => '--' + f).join(', ')}\n`);
    console.error('Ejemplo:\n  node generate-infografia.js --nuevo \\\n' +
      '    --nombre "Lions Ibagué" \\\n    --logo ~/Downloads/logo.jpg \\\n' +
      '    --dueno "Ronald Iván Hernández" \\\n    --deporte Baloncesto');
    process.exit(1);
  }

  const nombre = opt('nombre');
  const slug = opt('slug') || aSlug(nombre).split('-')[0];
  const origen = opt('logo').replace(/^~/, process.env.HOME);
  if (!fs.existsSync(origen)) {
    console.error(`No existe el logo: ${origen}`);
    process.exit(1);
  }

  const logoRel = path.join('logos', `${aSlug(nombre)}${path.extname(origen).toLowerCase()}`);
  fs.mkdirSync(path.join(DIR, 'logos'), { recursive: true });
  fs.copyFileSync(origen, path.join(DIR, logoRel));

  const clubes = JSON.parse(fs.readFileSync(archivoClubes, 'utf8'));
  clubes[slug] = {
    nombre,
    logo: logoRel,
    tagline: '· CLUB DEPORTIVO ·',
    deporte: opt('deporte') || 'Deporte',
    // Correo de ejemplo. En el flujo real este campo es el del ACUDIENTE, no el
    // del club: un generico evita que un padre le escriba al club creyendo que
    // ahi se registra. Se puede sobreescribir con --email.
    email: opt('email') || 'tucorreo@gmail.com',
    dueno: opt('dueno'),
    jugador: opt('jugador') || 'Juan Carlos Martínez López',
  };
  fs.writeFileSync(archivoClubes, JSON.stringify(clubes, null, 2) + '\n');
  console.log(`Registrado "${nombre}" como slug "${slug}" (logo -> ${logoRel})`);
  return slug;
}

/** Reduce el logo con sips (nativo macOS). Devuelve ruta relativa a DIR. */
function optimizarLogo(rel) {
  const src = path.join(DIR, rel);
  if (!fs.existsSync(CACHE)) fs.mkdirSync(CACHE);
  const dst = path.join(CACHE, path.basename(rel).replace(/\.[^.]+$/, '.png'));

  if (!fs.existsSync(dst) || fs.statSync(src).mtimeMs > fs.statSync(dst).mtimeMs) {
    execFileSync('sips', ['-Z', String(MAX_LOGO), '-s', 'format', 'png', src, '--out', dst],
      { stdio: 'ignore' });
  }
  return path.relative(DIR, dst);
}

/** Hornea el fondo texturizado a una sola imagen. */
async function hornearFondo(browser) {
  const dst = path.join(DIR, 'fondo.jpg');
  const src = path.join(DIR, 'fondo.html');
  if (fs.existsSync(dst) && fs.statSync(dst).mtimeMs > fs.statSync(src).mtimeMs) return;

  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto(`file://${src}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({
    path: dst, type: 'jpeg', quality: 72,
    clip: { x: 0, y: 0, width: W, height: H }
  });
  await page.close();
  console.log(`fondo.jpg horneado (${(fs.statSync(dst).size / 1024).toFixed(0)} KB)`);
}

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

  const archivoClubes = path.join(DIR, 'clubes.json');
  const slugNuevo = wantNuevo ? registrarClub(archivoClubes) : null;

  const clubes = JSON.parse(fs.readFileSync(archivoClubes, 'utf8'));
  const plantilla = fs.readFileSync(path.join(DIR, 'plantilla.html'), 'utf8');
  const browser = await puppeteer.launch({ headless: 'new' });

  await hornearFondo(browser);
  if (soloFondo) { await browser.close(); return; }

  const objetivo = slugNuevo || slugArg;
  for (const slug of (objetivo ? [objetivo] : Object.keys(clubes))) {
    const club = clubes[slug];
    if (!club) { console.error(`Club "${slug}" no existe en clubes.json`); continue; }
    if (!fs.existsSync(path.join(DIR, club.logo))) {
      console.error(`Logo no encontrado: ${club.logo}`); continue;
    }

    const html = plantilla
      .replace(/\{\{CLUB_NAME\}\}/g, club.nombre)
      .replace(/\{\{CLUB_LOGO\}\}/g, optimizarLogo(club.logo))
      .replace(/\{\{CLUB_TAGLINE\}\}/g, club.tagline || '')
      .replace(/\{\{DEPORTE\}\}/g, club.deporte || 'Deporte')
      .replace(/\{\{CLUB_EMAIL\}\}/g, club.email || 'tucorreo@gmail.com')
      .replace(/\{\{CLUB_DUENO\}\}/g, club.dueno || 'Director del club')
      .replace(/\{\{JUGADOR\}\}/g, club.jugador || 'Juan Carlos Martínez López')
      .replace(/\{\{FLECHAS\}\}/g, svgFlechas());

    const tmp = path.join(DIR, `.tmp-${slug}.html`);
    fs.writeFileSync(tmp, html);

    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
    await page.goto(`file://${tmp}`, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(r => setTimeout(r, 400));

    const clip = { x: 0, y: 0, width: W, height: H };
    const jpg = path.join(OUT, `inscripcion-${slug}.jpg`);
    await page.screenshot({ path: jpg, type: 'jpeg', quality: JPG_QUALITY, clip });

    if (wantPng) {
      await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
      await page.screenshot({ path: path.join(OUT, `inscripcion-${slug}.png`), clip });
      await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
    }

    const pdf = path.join(OUT, `inscripcion-${slug}.pdf`);
    if (wantVector) {
      await page.pdf({
        path: pdf, width: `${W}px`, height: `${H}px`,
        printBackground: true, pageRanges: '1',
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      });
    } else {
      jpegAPdf(jpg, pdf);   // una sola imagen: abre al instante
    }

    await page.close();
    fs.unlinkSync(tmp);

    const kb = f => `${(fs.statSync(f).size / 1024).toFixed(0)} KB`;
    console.log(`OK  ${club.nombre}\n    ${jpg}  (${kb(jpg)})\n    ${pdf}  (${kb(pdf)})`);
  }

  await browser.close();
})();
