const fs = require('fs');
const { FONT_FACE, bannerCss, bannerHtml, THEMES } = require('./banner-core.js');

const ACCENT = '#00C853';
const CLAIM = 36;

// Cuerpo del artboard: el mismo arte, con lo que depende del acento enlazado a props.
function dcBody(theme) {
  let h = bannerHtml({ proof: true, theme });
  h = h.replace('<div class="wb-glow"></div>', '<div class="wb-glow" style="background: {{glowBg}}"></div>');
  h = h.replace('<h1 class="wb-claim">', '<h1 class="wb-claim" style="font-size: {{claimSize}}px">');
  h = h.replace('<em>', '<em style="color: {{accent}}">');
  h = h.replace('<span class="wb-url">', '<span class="wb-url" style="color: {{accent}}">');
  h = h.replace('<span class="wb-pill">', '<span class="wb-pill" style="border-color: {{pillBorder}}">');
  h = h.split('<span class="wb-dot"></span>').join('<span class="wb-dot" style="background: {{accent}}"></span>');
  h = h.replace('<div class="wb-proof">', '<sc-if value="{{proof}}" hint-placeholder-val="{{true}}"><div class="wb-proof">');
  h = h.replace('</div>\n</div>`', '</div></sc-if>\n</div>`');
  h = h.replace(/<\/p>\n  <\/div>\n/, '</p>\n  </div></sc-if>\n');
  return h;
}

function artboard(proofDefault, theme = 'dark') {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <style>
${FONT_FACE}
    body { margin: 0; background: ${THEMES[theme].bg}; }
    a { color: ${THEMES[theme].accent}; } a:hover { color: ${THEMES[theme].accent}; }
${bannerCss(theme, CLAIM)}
  </style>
</helmet>
${dcBody(theme)}
</x-dc>
<script data-dc-script data-props='{"accent":{"editor":"color","default":"${THEMES[theme].accent}","options":["#00C853","#16A34A","#0EA5E9","#F97316"]},"claimSize":{"editor":"range","default":36,"min":26,"max":44,"step":1,"unit":"px"},"proof":{"editor":"boolean","default":${proofDefault}},"$preview":{"width":1128,"height":191}}'>
class Component extends DCLogic {
  renderVals() {
    const accent = this.props.accent ?? '${THEMES[theme].accent}';
    return {
      accent,
      claimSize: this.props.claimSize ?? 36,
      proof: this.props.proof ?? ${proofDefault},
      pillBorder: accent + '59',
      glowBg: 'radial-gradient(560px 300px at 88% 6%, ' + accent + '2E, transparent 64%), radial-gradient(520px 300px at 24% 118%, ' + accent + '14, transparent 60%)'
    };
  }
}
</script>
</body>
</html>
`;
}

fs.writeFileSync(__dirname + '/Main.dc.html', artboard(true));
fs.writeFileSync(__dirname + '/Proof.dc.html', artboard(false));
fs.writeFileSync(__dirname + '/Light.dc.html', artboard(true, 'light'));

// ---------- Preview.dc.html (verificacion de los recortes de LinkedIn) ----------
const previewDc = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <style>
${FONT_FACE}
    body { margin: 0; background: #FFFFFF; }
    a { color: #00C853; } a:hover { color: #00E06B; }
${bannerCss('dark', CLAIM)}
    .pv-root {
      width: 1128px;
      font-family: 'Red Hat Display', 'Segoe UI', system-ui, sans-serif;
      background: #FFFFFF;
      padding: 28px 0 36px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .pv-label {
      margin: 0 0 0 40px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.4px;
      text-transform: uppercase;
      color: #6B7280;
    }
    .pv-stage { position: relative; width: 1128px; height: 191px; }
    .pv-crop-mask { position: absolute; top: 0; bottom: 0; background: #0F172A; opacity: 0.66; }
    .pv-crop-line { position: absolute; top: 0; bottom: 0; width: 0; border-left: 2px dashed #F97316; }
    .pv-logo { position: absolute; left: 24px; bottom: -46px; width: 152px; height: 152px; }
    .pv-logo img { width: 100%; height: 100%; display: block; }
    .pv-logo-bad { background: #FFFFFF; padding: 14px; box-sizing: border-box; }
    .pv-tag {
      position: absolute; left: 196px; bottom: -30px;
      font-size: 12px; font-weight: 800; letter-spacing: 0.6px;
    }
    .pv-tag.bad { color: #DC2626; }
    .pv-tag.good { color: #15803D; }
    .pv-note {
      margin: 0 40px;
      display: flex;
      gap: 30px;
      font-size: 13px;
      color: #4B5563;
      line-height: 1.55;
    }
    .pv-note b { color: #111827; }
    .pv-spacer { height: 62px; }
  </style>
</helmet>
<div class="pv-root">
  <p class="pv-label">Logo con fondo blanco &mdash; lo que se ve hoy</p>
  <div class="pv-stage">
${bannerHtml({ proof: true })}
    <div class="pv-logo pv-logo-bad"><img src="logo-small.png" alt=""></div>
    <span class="pv-tag bad">&#10007; el cuadro blanco recorta la portada</span>
  </div>
  <div class="pv-spacer"></div>
  <p class="pv-label">Logo PNG transparente &mdash; como debe quedar</p>
  <div class="pv-stage">
${bannerHtml({ proof: true })}
    <div class="pv-logo"><img src="logo-small.png" alt=""></div>
    <span class="pv-tag good">&#10003; el circulo flota sobre el arte</span>
  </div>
  <div class="pv-spacer"></div>
  <p class="pv-label">Movil &mdash; recorte lateral aproximado</p>
  <div class="pv-stage">
${bannerHtml({ proof: true })}
    <div class="pv-crop-mask" style="left: 0; width: 225px"></div>
    <div class="pv-crop-mask" style="right: 0; width: 226px"></div>
    <div class="pv-crop-line" style="left: 225px"></div>
    <div class="pv-crop-line" style="left: 902px"></div>
  </div>
  <p class="pv-note">
    <span><b>Zona segura en movil:</b> de x 225 a x 902. El claim ocupa de 232 a 798, entra completo.</span>
    <span><b>Zona que tapa el logo:</b> de x 0 a x 190 desde y 95. Por eso el texto arranca en 232.</span>
  </p>
</div>
</x-dc>
<script data-dc-script data-props='{"$preview":{"width":1128,"height":980}}'>
class Component extends DCLogic {
  renderVals() { return {}; }
}
</script>
</body>
</html>
`;
fs.writeFileSync(__dirname + '/Preview.dc.html', previewDc);

// ---------- render html para exportar los PNG reales ----------
const render = (opts) => {
  const theme = (opts && opts.theme) || 'dark';
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
${FONT_FACE}
  html, body { margin: 0; padding: 0; background: ${THEMES[theme].bg}; }
${bannerCss(theme, CLAIM)}
</style></head><body>
${bannerHtml(opts)}
</body></html>
`;
};
fs.writeFileSync(__dirname + '/render.html', render({ proof: true }));
fs.writeFileSync(__dirname + '/render-proof.html', render({ proof: false }));
fs.writeFileSync(__dirname + '/render-light.html', render({ proof: true, theme: 'light' }));

// ---------- canvas.json ----------
fs.writeFileSync(__dirname + '/canvas.json', JSON.stringify({
  artboards: [
    { file: 'Main.dc.html', title: 'A - Claim + IA en accion (recomendado)', x: 0, y: 0, w: 1128, h: 191 },
    { file: 'Light.dc.html', title: 'B - Claro (el recuadro del logo desaparece)', x: 0, y: 300, w: 1128, h: 191 },
    { file: 'Proof.dc.html', title: 'C - Oscuro sin chip', x: 0, y: 600, w: 1128, h: 191 },
    { file: 'Preview.dc.html', title: 'Verificacion en LinkedIn', x: 0, y: 900, w: 1128, h: 980 }
  ],
  annotations: [
    { id: 'specs', x: 1210, y: 0, w: 300, text: 'Banner de pagina de empresa en LinkedIn.\n1128 x 191 px, exportado a 2x (2256 x 382).\nPNG o JPG, maximo 8 MB.\n\nTipografia Red Hat Display, la misma de widdo.co, incrustada en el archivo.\nVerde de marca #00C853 sobre #0A1410.' },
    { id: 'opciones', x: 1210, y: 300, w: 300, text: 'A y B son la misma pieza. A agrega a la derecha la prueba de que es AI-native: pregunta en ingles llano, deuda encontrada y recordatorios ya enviados. La IA actua, no solo responde.\n\nEn movil ese bloque queda fuera del recorte, asi que es decorativo: nada esencial vive ahi.\n\nTodo lo que afirma la pieza esta verificado contra produccion el 18-ago-2026:\n\n0% platform fee: el codigo no envia application_fee_amount.\n33 sports: /api/sports devuelve 33 activos, 30 marcados popular_us.\nEl chip: getDebtorsSummary y sendPaymentReminder existen en el agente.' },
    { id: 'reglas', x: 1210, y: 900, w: 300, text: 'Dos recortes que impone LinkedIn:\n\n1. El logo de la pagina tapa la esquina inferior izquierda. Nada legible antes de x 232.\n\n2. En movil se recortan los lados. Todo lo importante vive entre x 225 y x 902.' }
  ],
  launch: { view: 'canvas' }
}, null, 2));

console.log('listo');
