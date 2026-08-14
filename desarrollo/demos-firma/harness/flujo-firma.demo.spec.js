/* eslint-disable no-console */
import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * DEMO EN VIDEO — Flujo completo de consentimiento informado con firma digital.
 *
 * No es un test de regresion: es una grabacion narrada para que un humano vea
 * el producto funcionando de punta a punta.
 *
 *   1. El club crea la plantilla desde la base legal del pais y la publica.
 *   2. El sistema envia el correo al adulto responsable (Mailpit).
 *   3. El papa abre el enlace publico (sin login), lee y FIRMA en el canvas.
 *   4. El club ve el requisito "Firmado digitalmente" en /home/document-review.
 *
 * Puertos: los pasos con sesion corren en 5177 porque el backend NO reconoce
 * `localhost:5175` como dominio stateful de Sanctum (no emite cookie -> 401).
 * El paso 3 usa el enlace TAL CUAL viene en el correo (apunta a 5175, que sirve
 * este mismo worktree) porque la pagina de firma es publica y no necesita sesion.
 *
 * Cada paso se graba en su propio contexto (=> su propio .webm) y luego se
 * concatenan a un mp4 unico con demo/make-video.sh.
 */

const APP = process.env.DEMO_APP_URL || 'http://localhost:5177';
const MAILPIT = 'http://localhost:8026';
const BACKEND_CONTAINER = 'docreview_demo_backend';

const OWNER = { email: 'director@bogotafc.co', password: 'password123' };
const PLAYER_ID = 2; // Felipe Rivera Ortiz (club 1)
const PLAYER_NAME = 'Felipe Rivera';
const PARENT_EMAIL = 'padre.valentina.rivera2@parent.co';
/**
 * El backend bloquea dos plantillas anuales del mismo año (borrador o activa),
 * asi que cada corrida de la demo toma el siguiente año libre.
 */
const nextFreeYear = () => {
  const used = tinker(
    `echo App\\Models\\PlaClubTeamConsentForm::withoutGlobalScopes()->where('club_id',1)->where('document_type','annual_club')->pluck('year_valid')->implode(',');`
  )
    .trim()
    .split(',')
    .map(Number);
  let y = 2027;
  while (used.includes(y)) y++;
  return y;
};

const VIDEO_DIR = path.resolve(process.cwd(), 'demo-videos');
fs.mkdirSync(VIDEO_DIR, { recursive: true });

// Persistido en disco para poder correr un paso suelto (--grep) sin repetir
// los anteriores: cada rerun completo re-publicaba (26s + ~508 correos).
const STATE_FILE = path.resolve(process.cwd(), 'demo', '.state.json');
const state = fs.existsSync(STATE_FILE)
  ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
  : {};
const saveState = () =>
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

/* ------------------------------------------------------------------ utils */

const tinker = (php) =>
  execFileSync(
    'docker',
    ['exec', BACKEND_CONTAINER, 'php', 'artisan', 'tinker', '--execute', php],
    { encoding: 'utf8', timeout: 120000 }
  );

/** Banner inferior para que un humano pueda seguir el video. */
async function caption(page, text, ms = 1600) {
  await page
    .evaluate((t) => {
      let el = document.getElementById('__demo_caption');
      if (!el) {
        el = document.createElement('div');
        el.id = '__demo_caption';
        el.style.cssText = [
          'position:fixed',
          'left:0',
          'right:0',
          'bottom:0',
          'z-index:2147483647',
          'background:rgba(10,10,15,.94)',
          'color:#E8E8ED',
          'font:600 19px/1.45 Inter,-apple-system,system-ui,sans-serif',
          'padding:16px 28px',
          'border-top:3px solid #00C853',
          'pointer-events:none',
          'letter-spacing:.2px',
        ].join(';');
        document.body.appendChild(el);
      }
      el.textContent = t;
    }, text)
    .catch(() => {});
  await page.waitForTimeout(ms);
}

async function newRecordedContext(browser) {
  return browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: VIDEO_DIR, size: { width: 1440, height: 900 } },
    locale: 'es-CO',
  });
}

async function finishVideo(context, page, filename) {
  const video = page.video();
  await context.close(); // el .webm solo se cierra al cerrar el contexto
  const target = path.join(VIDEO_DIR, filename);
  if (video) {
    await video.saveAs(target);
    await video.delete().catch(() => {});
    console.log(`  video -> ${target}`);
  }
  return target;
}

async function loginOwner(page) {
  await page.goto(`${APP}/login`);
  await caption(page, 'Widdo — el director del club inicia sesion', 1400);
  await page.locator('input[type="email"]').first().fill(OWNER.email);
  await page.locator('input[name="password"]').first().fill(OWNER.password);
  await page.waitForTimeout(700);
  await page
    .getByRole('button', { name: /iniciar sesion|ingresar|entrar|log in/i })
    .first()
    .click();
  await page.waitForURL(/\/home/, { timeout: 60000 });
  // Banner de cookies fuera del encuadre
  await page
    .getByRole('button', { name: /^aceptar$/i })
    .first()
    .click({ timeout: 8000 })
    .catch(() => {});
  await page.waitForTimeout(2500);
}

/**
 * El banner de cookies es `position:fixed` abajo y TAPA el canvas de firma
 * cuando este queda en la mitad baja de la pantalla: los eventos de raton
 * aterrizan en el banner y el trazo nunca llega a signature_pad.
 */
async function dismissCookies(page) {
  await page
    .getByRole('button', { name: /^aceptar$/i })
    .first()
    .click({ timeout: 8000 })
    .catch(() => {});
  await page.waitForTimeout(600);
}

/** Navegacion por el menu lateral (SPA, sin recargar). */
async function sidebarGo(page, href) {
  const link = page.locator(`a[href="${href}"]`).first();
  await link.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await link.click();
  await page.waitForURL(new RegExp(href.replace(/\//g, '\\/')), {
    timeout: 60000,
  });
  await page.waitForTimeout(2000);
}

/* ------------------------------------------------------- 1. crear + publicar */

test('1 · El club crea la plantilla y la publica', async ({ browser }) => {
  const context = await newRecordedContext(browser);
  const page = await context.newPage();

  await loginOwner(page);
  await caption(page, 'Panel del club — Bogota FC', 1400);

  await sidebarGo(page, '/home/admin/consents');
  await expect(
    page.getByRole('heading', { name: /consentimientos informados/i }).first()
  ).toBeVisible({ timeout: 30000 });
  await caption(
    page,
    'PASO 1 — Consentimientos del club: las plantillas firmables por temporada'
  );

  await page.getByRole('button', { name: /nueva plantilla/i }).first().click();
  await expect(
    page.getByRole('heading', { name: /nueva plantilla de consentimiento/i })
  ).toBeVisible({ timeout: 15000 });
  await caption(
    page,
    'Nueva plantilla — se parte de la plantilla base del pais (Ley 1581, Colombia)'
  );

  const year = nextFreeYear();
  await page.locator('#consent-name').fill(`Consentimiento Informado ${year}`);
  await page.locator('#consent-year').fill(String(year));
  await page.waitForTimeout(700);

  await page
    .getByText('Usar plantilla base del país', { exact: false })
    .first()
    .click();
  await page.waitForTimeout(1000);

  await page.getByRole('button', { name: /^crear$/i }).click();
  await page.waitForURL(/\/home\/admin\/consents\/\d+\/edit/, {
    timeout: 60000,
  });

  state.formId = Number(page.url().match(/consents\/(\d+)\/edit/)[1]);
  saveState();
  console.log(`  formId = ${state.formId}`);

  const editor = page.locator('.ProseMirror').first();
  await expect(editor).toBeVisible({ timeout: 30000 });
  await page.waitForTimeout(2000);
  await caption(
    page,
    'El editor trae las clausulas legales del pais, con variables como [NOMBRE_MENOR]'
  );

  await editor.scrollIntoViewIfNeeded();
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, 240);
    await page.waitForTimeout(800);
  }
  await caption(page, 'El club puede editar el texto antes de publicarlo', 1600);

  await page.mouse.wheel(0, -3000);
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: /^publicar$/i }).first().click();
  await page.waitForTimeout(1200);
  await caption(
    page,
    'Publicar deja la plantilla ACTIVA para la temporada',
    1400
  );
  await page.getByRole('button', { name: /^publicar$/i }).last().click();
  await page.waitForTimeout(3000);
  await caption(page, 'Plantilla publicada', 2000);

  const active = tinker(
    `$f=App\\Models\\PlaClubTeamConsentForm::withoutGlobalScopes()->find(${state.formId}); echo $f->is_active ? 'ACTIVE' : 'DRAFT';`
  );
  console.log(`  estado en backend: ${active.trim()}`);
  expect(active).toContain('ACTIVE');

  await finishVideo(context, page, '01-club-crea-y-publica.webm');
});

/* ---------------------------------------------- 2. correo en Mailpit */

test('2 · El adulto responsable recibe el correo', async ({ browser }) => {
  expect(state.formId, 'el paso 1 debe haber corrido').toBeTruthy();

  // Redundante pero deliberado: publicar (paso 1) YA notifica a todos los
  // responsables sin firma via ConsentFormService::notifyPendingSigners().
  // Esto reenvia a NUESTRO responsable saltandose la guarda de
  // `last_notified_version`, para que el correo del video sea el mas reciente
  // de la bandeja y no haya que pescarlo entre los ~500 del publish.
  const out = tinker(
    [
      `$f=App\\Models\\PlaClubTeamConsentForm::withoutGlobalScopes()->with('club')->findOrFail(${state.formId});`,
      `$p=App\\Models\\PlaClubTeamPlayer::withoutGlobalScopes()->findOrFail(${PLAYER_ID});`,
      `$r=$p->responsibleAdult;`,
      `$r->notify(new App\\Notifications\\ConsentPendingNotification($f,$p));`,
      `echo 'SENT_TO:'.$r->email;`,
    ].join(' ')
  );
  console.log(`  ${out.trim()}`);
  expect(out).toContain('SENT_TO:');

  // Localizar el mensaje via API de Mailpit para extraer el enlace de firma
  let msg = null;
  for (let i = 0; i < 25 && !msg; i++) {
    const res = await fetch(
      `${MAILPIT}/api/v1/search?query=${encodeURIComponent(
        `to:"${PARENT_EMAIL}"`
      )}&limit=10`
    );
    const json = await res.json();
    msg = (json.messages || [])
      .filter((m) => /consentimiento/i.test(m.Subject || ''))
      .sort((a, b) => new Date(b.Created) - new Date(a.Created))[0];
    if (!msg) await new Promise((r) => setTimeout(r, 1000));
  }
  expect(msg, 'el correo debe llegar a Mailpit').toBeTruthy();

  const full = await (await fetch(`${MAILPIT}/api/v1/message/${msg.ID}`)).json();
  const link = (full.HTML || full.Text || '').match(
    /https?:\/\/[^"'\s<>]*\/consent\/sign\/[^"'\s<>]+/
  );
  expect(link, 'el correo debe traer el enlace de firma').toBeTruthy();
  state.signUrl = link[0].replace(/&amp;/g, '&');
  saveState();
  console.log(`  signUrl = ${state.signUrl}`);

  const context = await newRecordedContext(browser);
  const page = await context.newPage();

  await page.goto(MAILPIT);
  await page.waitForTimeout(2500);
  await caption(
    page,
    'PASO 2 — La bandeja de correo: el sistema aviso al adulto responsable'
  );

  await page.goto(`${MAILPIT}/view/${msg.ID}`);
  await page.waitForTimeout(3500);
  await caption(page, `Para ${PARENT_EMAIL} — "${msg.Subject}"`, 2400);
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 220);
    await page.waitForTimeout(800);
  }
  await caption(
    page,
    'El correo trae el boton de firma con un enlace unico y temporal',
    2400
  );

  await finishVideo(context, page, '02-correo-al-papa.webm');
});

/* ------------------------------------------------------------ 3. la firma */

test('3 · El papa abre el enlace y firma', async ({ browser }) => {
  expect(state.signUrl, 'el paso 2 debe haber corrido').toBeTruthy();

  // Contexto limpio = sin sesion, igual que el papa que abre el link del correo
  const context = await newRecordedContext(browser);
  const page = await context.newPage();

  await page.goto(state.signUrl);
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 60000 });
  await dismissCookies(page);
  await page.waitForTimeout(1500);
  await caption(
    page,
    'PASO 3 — El papa abre el enlace del correo. Sin usuario, sin contrasena.'
  );

  await expect(
    page.getByText(new RegExp(PLAYER_NAME, 'i')).first()
  ).toBeVisible();
  await caption(
    page,
    `El documento sale personalizado con el jugador: ${PLAYER_NAME}`,
    2200
  );

  const doc = page.locator('.prose').first();
  await expect(doc).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await doc.evaluate((el) => el.parentElement.scrollBy(0, 200));
    await page.waitForTimeout(700);
  }
  await caption(
    page,
    'Riesgos, urgencias medicas, datos personales, uso de imagen',
    2000
  );

  await page.locator('#signer_name').scrollIntoViewIfNeeded();
  await caption(page, 'Datos de quien firma', 1000);
  await page.locator('#signer_name').fill('Valentina Ortiz Suarez');
  await page.waitForTimeout(500);

  await page.getByText('Selecciona...').first().click();
  await page.waitForTimeout(600);
  await page.getByRole('option', { name: 'Madre' }).click();
  await page.waitForTimeout(600);

  await page.locator('#signer_document_number').fill('52987431');
  await page.waitForTimeout(400);
  await page.locator('#signer_email').fill(PARENT_EMAIL);
  await page.waitForTimeout(400);
  await page.locator('#signer_phone').fill('3106547788');
  await page.waitForTimeout(900);

  const canvas = page.locator('canvas').first();
  await expect(canvas).toBeVisible();
  await canvas.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(900);
  await caption(page, 'Y firma con el raton o el dedo, en el navegador', 1400);

  const box = await canvas.boundingBox();
  // Guarda: si algo (banner de cookies, toast) queda encima, el trazo se pierde
  // en silencio y el boton se queda deshabilitado sin explicacion.
  const onTop = await page.evaluate(
    ([x, y]) => document.elementFromPoint(x, y)?.tagName,
    [box.x + 40, box.y + box.height * 0.6]
  );
  expect(onTop, 'algo tapa el canvas de firma').toBe('CANVAS');
  const y0 = box.y + box.height * 0.6;
  await page.mouse.move(box.x + 40, y0);
  await page.mouse.down();
  const stroke = [
    [70, -35],
    [100, 18],
    [130, -48],
    [165, 5],
    [195, -30],
    [225, 22],
    [258, -40],
    [292, -6],
    [325, -28],
    [360, 12],
  ];
  for (const [dx, dy] of stroke) {
    await page.mouse.move(box.x + dx, y0 + dy, { steps: 8 });
    await page.waitForTimeout(70);
  }
  await page.mouse.up();
  await page.waitForTimeout(1600);

  await page.locator('#accept-terms').click();
  await page.waitForTimeout(900);
  await caption(page, 'Acepta el contenido y envia', 1400);

  const submit = page.getByRole('button', { name: /firmar y enviar/i });
  await expect(submit).toBeEnabled();
  await submit.click();

  await page.waitForURL(/\/consent\/success/, { timeout: 90000 });
  await page.waitForTimeout(3000);
  await caption(
    page,
    'Firmado. Queda un PDF con hash de verificacion publica.',
    3000
  );

  await finishVideo(context, page, '03-el-papa-firma.webm');
});

/* -------------------------------------------- 4. resultado en el checklist */

test('4 · El club ve "Firmado digitalmente"', async ({ browser }) => {
  const context = await newRecordedContext(browser);
  const page = await context.newPage();

  await loginOwner(page);
  await sidebarGo(page, '/home/document-review');
  await page.waitForTimeout(3500);
  await caption(
    page,
    'PASO 4 — Revision de documentos: el checklist de cada jugador'
  );

  const search = page
    .locator(
      'input[type="search"], input[placeholder*="uscar" i], input[placeholder*="ombre" i]'
    )
    .first();
  await search.fill(PLAYER_NAME);
  await page.waitForTimeout(3500);
  await caption(page, `Buscamos al jugador ${PLAYER_NAME}`, 1800);

  const row = page.getByText(new RegExp(PLAYER_NAME, 'i')).first();
  await expect(row).toBeVisible({ timeout: 30000 });
  await row.click();
  await page.waitForTimeout(3000);

  const badge = page.getByText(/firmado digitalmente/i).first();
  await expect(badge).toBeVisible({ timeout: 30000 });
  await badge.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await caption(
    page,
    'El requisito de Consentimiento queda FIRMADO DIGITALMENTE — sin papel, sin escaner',
    3200
  );

  await finishVideo(context, page, '04-firmado-digitalmente.webm');
});
