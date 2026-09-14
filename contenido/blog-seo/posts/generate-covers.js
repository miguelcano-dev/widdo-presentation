/**
 * Portadas de los posts del blog en ingles. HTML -> JPEG 1200x630 (@2x).
 *
 * Por que generadas y no de banco de imagenes: nueve fotos de stock de ninos
 * jugando no se parecen entre si, envejecen y no dicen nada. Una tarjeta
 * tipografica con el sistema de marca se reconoce como Widdo en el feed y en
 * el resultado de busqueda, que es para lo que sirve la imagen destacada.
 *
 * ---
 *
 * Segunda version. La primera usaba una sola plantilla y solo cambiaba el
 * titular: en la rejilla del blog las nueve tarjetas se leian como la MISMA
 * imagen repetida, que es justo lo contrario de lo que tiene que hacer una
 * portada. Una miniatura se reconoce por su forma antes de que nadie lea el
 * titulo.
 *
 * La diferencia NO puede venir del color: la guia de marca deja un solo acento
 * (#00C853) para marketing oscuro, y pintar cada categoria de un color
 * distinto seria inventarse una paleta. Viene de un ESQUEMA por post — barras,
 * burbujas, una linea que cae, un checklist — que ademas dice de que va el
 * articulo sin leerlo.
 *
 * Marca (contenido/BRAND-GUIDE.md): fondo #0A1410 — el negro con tinte verde de
 * los banners, no el #0A0A0F neutro, porque sobre este el verde no vibra —,
 * verde #00C853, texto #E8E8ED, Red Hat Display.
 *
 * ---
 *
 * Dos modos, y el script elige solo:
 *
 *   FOTO    si existe `fondos/<slug>.jpg`. La foto va de fondo a sangre, con
 *           un degradado por encima que apaga la mitad izquierda para que el
 *           titular se lea. El esquema no se dibuja.
 *   ESQUEMA si no existe. Es el de arriba.
 *
 * La foto se incrusta como data URI y no como <img src="file://...">: Chrome
 * sin cabeza bloquea el acceso a ficheros locales desde una pagina cargada con
 * setContent, y la portada saldria con el hueco vacio sin dar error.
 *
 * Prompts para generar esas fotos: PROMPTS-PORTADAS.md (mismo directorio).
 *
 *   node contenido/blog-seo/posts/generate-covers.js
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SALIDA = path.join(__dirname, 'covers');
const FONDOS = path.join(__dirname, 'fondos');

/**
 * La foto de fondo del post, como data URI, o null si no hay.
 *
 * Acepta .jpg y .png porque de un generador de imagenes sale lo que sale, y
 * renombrar a mano nueve ficheros es justo el paso que se olvida.
 */
function fondoDe(slug) {
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    const ruta = path.join(FONDOS, `${slug}.${ext}`);
    if (fs.existsSync(ruta)) {
      const tipo = ext === 'jpg' ? 'jpeg' : ext;

      return `data:image/${tipo};base64,${fs.readFileSync(ruta).toString('base64')}`;
    }
  }

  return null;
}

const VERDE = '#00C853';

/**
 * Textos de los esquemas, por idioma.
 *
 * Van aqui y no dentro de cada esquema porque el mismo esquema se dibuja tres
 * veces, una por idioma. La primera version tenia el ingles incrustado, y el
 * post en español acababa con una tarjeta que decia "Paid / Overdue": una
 * portada en otro idioma que el articulo se lee como un error, no como diseño.
 */
const TEXTOS = {
  en: {
    paid: 'Paid', overdue: 'Overdue',
    chat1: 'Practice moved to 6pm?', chat2: 'Sent to 24 families', chat3: 'Got it, thanks', chat4: '18 read',
    task1: 'Chase late payments', task2: 'Send practice reminders', task3: 'Post the schedule', task4: 'Decide the lineup',
    lastSessions: 'Last 7 sessions', weekOverWeek: 'Attendance, week over week',
    step1: 'Open registration', step2: 'Collect documents', step3: 'Assign to groups', step4: 'First payment',
    costGrows: 'Cost as the club grows', sheet: 'One spreadsheet, four people editing',
    loop1: 'Agent drafts 12 reminders', loop2: 'You approve', loop3: '12 sent',
    pay1: 'Bank transfer', pay2: 'Cash at the gym', pay3: 'Card on file', payAxis: 'How families pay',
    fun1: 'Open day', fun2: 'Trial session', fun3: 'Registered', fun4: 'Paid',
    tagline: 'AI-native operations for sports clubs',
  },
  es: {
    paid: 'Al día', overdue: 'Vencido',
    chat1: '¿El entrenamiento pasó a las 6?', chat2: 'Enviado a 24 familias', chat3: 'Listo, gracias', chat4: '18 lo leyeron',
    task1: 'Perseguir pagos atrasados', task2: 'Enviar recordatorios', task3: 'Publicar el horario', task4: 'Decidir la alineación',
    lastSessions: 'Últimas 7 sesiones', weekOverWeek: 'Asistencia, semana a semana',
    step1: 'Abrir inscripción', step2: 'Recoger documentos', step3: 'Asignar a categorías', step4: 'Primer pago',
    costGrows: 'Costo a medida que el club crece', sheet: 'Una hoja, cuatro personas editando',
    loop1: 'El agente redacta 12 avisos', loop2: 'Tú apruebas', loop3: '12 enviados',
    pay1: 'Transferencia', pay2: 'Efectivo en la cancha', pay3: 'Tarjeta guardada', payAxis: 'Cómo pagan las familias',
    fun1: 'Puertas abiertas', fun2: 'Clase de prueba', fun3: 'Inscrito', fun4: 'Pagado',
    tagline: 'Operación nativa de IA para clubes deportivos',
  },
  pt: {
    paid: 'Em dia', overdue: 'Vencido',
    chat1: 'O treino passou para as 18h?', chat2: 'Enviado a 24 famílias', chat3: 'Beleza, obrigado', chat4: '18 leram',
    task1: 'Correr atrás de atrasados', task2: 'Enviar lembretes', task3: 'Publicar a tabela', task4: 'Definir a escalação',
    lastSessions: 'Últimas 7 sessões', weekOverWeek: 'Presença, semana a semana',
    step1: 'Abrir matrícula', step2: 'Recolher documentos', step3: 'Definir categorias', step4: 'Primeiro pagamento',
    costGrows: 'Custo conforme o clube cresce', sheet: 'Uma planilha, quatro pessoas editando',
    loop1: 'O agente redige 12 avisos', loop2: 'Você aprova', loop3: '12 enviados',
    pay1: 'Boleto', pay2: 'Pix', pay3: 'Cartão salvo', payAxis: 'Como as famílias pagam',
    fun1: 'Dia aberto', fun2: 'Aula experimental', fun3: 'Matriculado', fun4: 'Pago',
    tagline: 'Operação nativa de IA para clubes esportivos',
  },
};

/**
 * Esquemas. Cada uno es la silueta por la que se distingue la tarjeta en
 * miniatura, asi que se dibujan con bloques grandes: a 300px de ancho, un
 * detalle fino desaparece.
 */
const ESQUEMAS = (T) => ({
  // Filas de cobro, una vencida. La forma: lista con una marca roja-verde.
  cobros: `
    <div class="rows">
      ${[['Ava M.', T.paid, 1], ['Liam R.', T.paid, 1], ['Noah P.', T.overdue, 0], ['Mia K.', T.paid, 1], ['Ethan S.', T.overdue, 0]]
        .map(([n, e, ok]) => `<div class="row"><span>${n}</span><b class="${ok ? 'ok' : 'no'}">${e}</b></div>`)
        .join('')}
    </div>`,

  // Hilos de conversacion. La forma: burbujas alternadas.
  mensajes: `
    <div class="bubbles">
      <div class="b in">${T.chat1}</div>
      <div class="b out">${T.chat2}</div>
      <div class="b in">${T.chat3}</div>
      <div class="b out">${T.chat4}</div>
    </div>`,

  // Tareas que pasan de manual a automatico. La forma: checklist.
  tareas: `
    <div class="checks">
      ${[[T.task1, 1], [T.task2, 1], [T.task3, 1], [T.task4, 0]]
        .map(([n, on]) => `<div class="c ${on ? 'on' : ''}"><i></i>${n}</div>`)
        .join('')}
    </div>`,

  // Asistencia semanal. La forma: barras.
  barras: `
    <div class="bars">
      ${[62, 78, 71, 88, 94, 83, 96].map((h, i) => `<span style="height:${h}%" class="${i === 4 ? 'hi' : ''}"></span>`).join('')}
    </div>
    <div class="axis">${T.lastSessions}</div>`,

  // Asistencia que cae semana a semana. La forma: linea descendente.
  caida: `
    <svg class="line" viewBox="0 0 420 220" preserveAspectRatio="none">
      <polyline points="10,34 78,52 146,44 214,96 282,132 350,170 410,196"
        fill="none" stroke="${VERDE}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="410" cy="196" r="11" fill="${VERDE}"/>
    </svg>
    <div class="axis">${T.weekOverWeek}</div>`,

  // Pasos de inscripcion, con los cerrados detras. La forma: escalera.
  pasos: `
    <div class="steps">
      ${[T.step1, T.step2, T.step3, T.step4]
        .map((n, i) => `<div class="s" style="margin-left:${i * 34}px"><i>${i + 1}</i>${n}</div>`)
        .join('')}
    </div>`,

  // Precio que sube con cada jugador. La forma: escalones ascendentes.
  escalera: `
    <div class="ladder">
      ${[[40, '40'], [90, '120'], [140, '260'], [190, '480']]
        .map(([h, v]) => `<span style="height:${h}px"><b>$${v}</b></span>`)
        .join('')}
    </div>
    <div class="axis">${T.costGrows}</div>`,

  // Hoja de calculo que se rompe. La forma: rejilla con una celda en rojo.
  hoja: `
    <div class="sheet">
      ${Array.from({ length: 24 }, (_, i) => `<span class="${[6, 13, 19].includes(i) ? 'bad' : ''}"></span>`).join('')}
    </div>
    <div class="axis">${T.sheet}</div>`,

  // Medios de pago, uno elegido. La forma: tres pastillas anchas.
  medios: `
    <div class="loop">
      ${[[T.pay1, 0], [T.pay2, 0], [T.pay3, 1]]
        .map(([n, on]) => `<div class="pill ${on ? 'solid' : ''}">${n}</div>`)
        .join('')}
    </div>
    <div class="axis">${T.payAxis}</div>`,

  // Embudo de captacion. La forma: barras que se estrechan.
  embudo: `
    <div class="funnel">
      ${[[100, T.fun1], [72, T.fun2], [46, T.fun3], [26, T.fun4]]
        .map(([w, n]) => `<span style="width:${w}%">${n}</span>`)
        .join('')}
    </div>`,

  // El lazo del agente. La forma: dos pastillas y una flecha.
  agente: `
    <div class="loop">
      <div class="pill">${T.loop1}</div>
      <div class="arrow">&darr;</div>
      <div class="pill solid">${T.loop2}</div>
      <div class="arrow">&darr;</div>
      <div class="pill">${T.loop3}</div>
    </div>`,
});

// El titulo de la portada no es el titulo SEO: en 1200x630 tiene que leerse de
// un vistazo, asi que va la idea, no la frase completa.
//
// Un post por ESQUEMA, con una entrada por idioma en el que ese post existe.
// El slug de cada idioma es el real del blog, no una traduccion del ingles:
// el fichero tiene que llamarse como el post o la portada no aparece.
const POSTS = [
  { esquema: 'cobros', variantes: {
    en: { slug: 'why-dues-collection-breaks-down',                       kicker: 'Dues & payments', title: 'Why dues collection<br>breaks down' },
    es: { slug: 'reducir-morosidad-club-deportivo-cobros',               kicker: 'Cobros',          title: 'Por qué falla el cobro<br>de mensualidades' },
    pt: { slug: 'reduzir-inadimplencia-mensalidades-escolinha',          kicker: 'Cobrança',        title: 'Por que a cobrança<br>de mensalidades falha' },
  } },
  { esquema: 'mensajes', variantes: {
    en: { slug: 'parent-communication-sports-club',                      kicker: 'Communication',   title: 'The group text is not<br>a communication system' },
    es: { slug: 'adios-caos-whatsapp-escuela-deportiva',                 kicker: 'Comunicación',    title: 'El grupo de WhatsApp<br>no es un sistema' },
    pt: { slug: 'grupo-whatsapp-pais-escolinha',                         kicker: 'Comunicação',     title: 'O grupo de WhatsApp<br>não é um sistema' },
  } },
  { esquema: 'tareas', variantes: {
    en: { slug: 'what-to-automate-first-youth-sports-club',              kicker: 'Automation',      title: 'What to automate first<br>in your club' },
    es: { slug: 'automatizar-club-deportivo-tareas-manuales',            kicker: 'Automatización',  title: 'Qué automatizar<br>primero en tu club' },
    pt: { slug: 'o-que-automatizar-primeiro-no-clube-esportivo',         kicker: 'Automação',       title: 'O que automatizar<br>primeiro no clube' },
  } },
  { esquema: 'barras', variantes: {
    en: { slug: 'attendance-tracking-youth-sports-clubs',                kicker: 'Attendance',      title: 'Attendance tracking<br>coaches actually use' },
    es: { slug: 'control-de-asistencia-clubes-deportivos-que-si-se-usa', kicker: 'Asistencia',      title: 'Control de asistencia<br>que sí se usa' },
    pt: { slug: 'gestao-categorias-de-base-documentacao',                kicker: 'Categorias',      title: 'Chamada, atestado<br>e documentação em dia' },
  } },
  { esquema: 'caida', variantes: {
    en: { slug: 'signals-player-about-to-leave-club',                    kicker: 'Retention',       title: 'The signals a player<br>is about to leave' },
    es: { slug: 'razones-abandono-alumnos-escuela-deportiva',            kicker: 'Retención',       title: 'Las señales de que<br>un jugador se va' },
    pt: { slug: 'evasao-de-alunos-escolinha-sinais',                     kicker: 'Retenção',        title: 'Os sinais de que<br>um atleta vai sair' },
  } },
  { esquema: 'pasos', variantes: {
    en: { slug: 'registration-season-checklist-youth-sports',            kicker: 'Registration',    title: 'The registration<br>season checklist' },
    es: { slug: 'lista-de-inscripcion-temporada-club-deportivo',         kicker: 'Inscripción',     title: 'La lista de inscripción<br>de temporada' },
    pt: { slug: 'checklist-de-matricula-temporada-clube-esportivo',      kicker: 'Matrícula',       title: 'O checklist de<br>matrícula de temporada' },
  } },
  // Solo ingles: discute el modelo de precio de los rivales de Estados Unidos.
  { esquema: 'escalera', variantes: {
    en: { slug: 'per-player-pricing-youth-sports-software',              kicker: 'Pricing',         title: 'What per-player<br>pricing really costs' },
  } },
  // Solo portugues: medios de pago de Brasil.
  { esquema: 'medios', variantes: {
    pt: { slug: 'pix-boleto-cartao-mensalidades-clube-esportivo',        kicker: 'Pagamentos',      title: 'Pix, boleto<br>ou cartão' },
  } },
  // Solo portugues: captacion.
  { esquema: 'embudo', variantes: {
    pt: { slug: 'captar-novos-alunos-escolinha-futebol',                 kicker: 'Captação',        title: 'Captar novos alunos<br>sem depender da indicação' },
  } },
  // Sin post todavia; la portada queda lista para cuando se escriban.
  { esquema: 'hoja', variantes: {
    en: { slug: 'youth-sports-club-software-guide',                      kicker: 'Getting started', title: 'Running a club<br>without spreadsheets' },
  } },
  { esquema: 'agente', variantes: {
    en: { slug: 'ai-native-club-operations',                             kicker: 'AI-native',       title: 'You approve.<br>It executes.' },
  } },
];

const plantilla = ({ kicker, title, esquema, idioma }, foto = null) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@500;700;800;900&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#0A1410;font-family:'Red Hat Display',sans-serif;
       color:#E8E8ED;position:relative;overflow:hidden}
  /* El verde entra como luz, no como bloque: mancha grande y difusa en una esquina. */
  .glow{position:absolute;width:820px;height:820px;border-radius:50%;
        background:radial-gradient(circle,#00C85333 0%,transparent 62%);top:-340px;right:-260px}
  .grid{position:absolute;inset:0;opacity:.05;
        background-image:linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px);
        background-size:64px 64px}
  .wrap{position:relative;height:100%;padding:64px 72px;display:grid;
        grid-template-columns:1fr 420px;grid-template-rows:auto 1fr auto;column-gap:56px;align-items:start}
  .kicker{grid-column:1/2;display:flex;align-items:center;gap:12px;font-size:17px;font-weight:800;
          letter-spacing:.18em;text-transform:uppercase;color:${VERDE}}
  .kicker .dot{width:9px;height:9px;border-radius:50%;background:${VERDE}}
  h1{grid-column:1/2;align-self:center;font-size:62px;line-height:1.07;font-weight:900;letter-spacing:-.035em}
  /* El esquema ocupa las tres filas de la derecha: es la mitad que da la
     silueta de la tarjeta, y recortarlo a una fila lo volveria decorativo. */
  .art{grid-column:2/3;grid-row:1/4;align-self:center;height:430px;width:420px;
       display:flex;flex-direction:column;justify-content:center;gap:18px}
  .foot{grid-column:1/2;display:flex;align-items:center;justify-content:space-between;
        border-top:1px solid #ffffff1f;padding-top:26px;width:100%}
  .brand{display:flex;align-items:center;gap:13px;font-size:28px;font-weight:800;letter-spacing:-.03em}
  .mark{width:42px;height:42px;border-radius:11px;background:${VERDE};color:#07180e;
        display:grid;place-items:center;font-size:25px;font-weight:900}
  .tag{font-size:17px;font-weight:500;color:#8FA093}
  .axis{font-size:16px;font-weight:600;color:#8FA093;letter-spacing:.01em}

  /* --- modo foto --- */
  .photo{position:absolute;inset:0;background:url('${foto}') center/cover no-repeat}
  /* Tres capas, cada una resuelve un fallo distinto:
     - la horizontal apaga el lado del titular;
     - la de abajo protege el pie de marca en fotos con el suelo iluminado;
     - la plana de arriba baja TODA la foto, porque tarde o temprano vuelve una
       mas clara de lo que pedia el prompt y sin ella el lado derecho se quema.
     Probado con una captura de producto de fondo claro, que es el peor caso. */
  .scrim{position:absolute;inset:0;
         background:linear-gradient(100deg,#060D0A 0%,#060D0AF2 34%,#060D0ABF 56%,#060D0A59 100%),
                    linear-gradient(0deg,#060D0AD9 0%,transparent 34%),
                    #060D0A59}

  /* --- esquemas --- */
  .rows,.checks,.steps,.bubbles,.loop{display:flex;flex-direction:column;gap:12px}
  .row{display:flex;justify-content:space-between;align-items:center;background:#ffffff0d;
       border:1px solid #ffffff14;border-radius:12px;padding:16px 18px;font-size:20px;font-weight:600}
  .row b{font-size:17px;font-weight:800}
  .row .ok{color:${VERDE}} .row .no{color:#FF6B6B}

  .b{max-width:88%;padding:14px 18px;border-radius:16px;font-size:19px;font-weight:600;line-height:1.25}
  .b.in{background:#ffffff12;border:1px solid #ffffff1a;border-bottom-left-radius:5px}
  .b.out{align-self:flex-end;background:${VERDE};color:#07180e;border-bottom-right-radius:5px}

  .c{display:flex;align-items:center;gap:14px;font-size:20px;font-weight:600;color:#8FA093}
  .c i{width:26px;height:26px;border-radius:8px;border:2px solid #ffffff2e;flex:none}
  .c.on{color:#E8E8ED}
  .c.on i{background:${VERDE};border-color:${VERDE};position:relative}
  .c.on i::after{content:"";position:absolute;left:8px;top:3px;width:7px;height:13px;
                 border:solid #07180e;border-width:0 3px 3px 0;transform:rotate(45deg)}

  .bars{display:flex;align-items:flex-end;gap:14px;height:250px}
  .bars span{flex:1;background:#ffffff1c;border-radius:8px 8px 3px 3px}
  .bars span.hi{background:${VERDE}}

  .line{width:100%;height:250px}

  .s{display:flex;align-items:center;gap:14px;background:#ffffff0d;border:1px solid #ffffff14;
     border-radius:12px;padding:15px 18px;font-size:19px;font-weight:600}
  .s i{width:28px;height:28px;border-radius:50%;background:${VERDE};color:#07180e;
       display:grid;place-items:center;font-size:16px;font-weight:900;font-style:normal;flex:none}

  .ladder{display:flex;align-items:flex-end;gap:20px;height:250px}
  .ladder span{flex:1;background:#ffffff14;border:1px solid #ffffff1f;border-radius:10px;
               position:relative;display:flex;justify-content:center}
  .ladder span:last-child{background:${VERDE}1f;border-color:${VERDE}66}
  .ladder b{position:absolute;top:-34px;font-size:19px;font-weight:800;color:${VERDE}}

  .sheet{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
  .sheet span{height:48px;background:#ffffff0f;border:1px solid #ffffff14;border-radius:7px}
  .sheet span.bad{background:#FF6B6B26;border-color:#FF6B6B80}

  .pill{background:#ffffff0d;border:1px solid #ffffff1f;border-radius:999px;padding:15px 22px;
        font-size:19px;font-weight:700;text-align:center}
  .pill.solid{background:${VERDE};color:#07180e;border-color:${VERDE}}
  .arrow{text-align:center;font-size:24px;color:#8FA093;line-height:1}

  .funnel{display:flex;flex-direction:column;align-items:center;gap:13px}
  .funnel span{background:#ffffff12;border:1px solid #ffffff1f;border-radius:12px;padding:16px 14px;
               font-size:18px;font-weight:700;text-align:center}
  .funnel span:last-child{background:${VERDE};color:#07180e;border-color:${VERDE}}
</style></head><body>
  ${foto ? `<div class="photo"></div><div class="scrim"></div>` : '<div class="glow"></div><div class="grid"></div>'}
  <div class="wrap">
    <div class="kicker"><span class="dot"></span>${kicker}</div>
    <h1>${title}</h1>
    ${foto ? '' : `<div class="art">${ESQUEMAS(TEXTOS[idioma])[esquema]}</div>`}
    <div class="foot">
      <div class="brand"><span class="mark">W</span>Widdo</div>
      <div class="tag">${TEXTOS[idioma].tagline}</div>
    </div>
  </div>
</body></html>`;

(async () => {
  // Aplanar a una tarjeta por (esquema, idioma). Es la unidad real: el mismo
  // esquema se dibuja una vez por cada idioma en que existe el post.
  const TARJETAS = POSTS.flatMap(({ esquema, variantes }) =>
    Object.entries(variantes).map(([idioma, v]) => ({ ...v, esquema, idioma }))
  );

  const faltantes = TARJETAS.filter((t) => !ESQUEMAS(TEXTOS[t.idioma])[t.esquema]);
  if (faltantes.length) {
    // Sin esto, un nombre mal escrito produce una tarjeta con el hueco vacio y
    // se publica: el fallo se ve en el blog, no aqui.
    throw new Error('Esquema inexistente: ' + faltantes.map((t) => t.esquema).join(', '));
  }

  // Un slug repetido sobrescribiria en silencio la portada de otro post.
  const slugs = TARJETAS.map((t) => t.slug);
  const repes = slugs.filter((x, i) => slugs.indexOf(x) !== i);
  if (repes.length) {
    throw new Error('Slug repetido: ' + [...new Set(repes)].join(', '));
  }

  fs.mkdirSync(SALIDA, { recursive: true });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

  let conFoto = 0;

  for (const tarjeta of TARJETAS) {
    const foto = fondoDe(tarjeta.slug);
    if (foto) conFoto++;

    // 'networkidle0' se colgaba a partir de la segunda tarjeta: la peticion de
    // Google Fonts queda abierta cuando ya esta en cache. Se espera a las
    // fuentes directamente, que es la condicion que de verdad importa.
    await page.setContent(plantilla(tarjeta, foto), { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 250));
    // JPEG y no PNG: una tarjeta de 2400x1260 en PNG pesa ~350 KB y en JPEG de
    // calidad 82 baja a ~190 KB sin diferencia visible. La imagen destacada la
    // carga cada visita del post.
    const destino = path.join(SALIDA, `${tarjeta.slug}.jpg`);
    await page.screenshot({ path: destino, type: 'jpeg', quality: 82 });
    const kb = Math.round(fs.statSync(destino).size / 1024);
    console.log(`  ✓ [${tarjeta.idioma}] ${tarjeta.slug}.jpg  (${kb} KB)  [${foto ? 'foto' : tarjeta.esquema}]`);
  }

  await browser.close();
  console.log(`\n  ${TARJETAS.length} portadas en ${SALIDA} (${conFoto} con foto, ${TARJETAS.length - conFoto} con esquema)`);
  if (conFoto < TARJETAS.length) {
    console.log(`  Fotos que faltan: deja <slug>.jpg en ${FONDOS} (ver PROMPTS-PORTADAS.md)`);
  }
})();
