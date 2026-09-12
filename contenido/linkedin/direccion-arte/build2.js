const fs = require('fs');
const FONT = fs.readFileSync(__dirname + '/font-a.b64', 'utf8').trim();
const FONT_FACE = `@font-face{font-family:'Red Hat Display';font-style:normal;font-weight:300 900;font-display:block;src:url(data:font/woff2;base64,${FONT}) format('woff2');}`;

// Tokens del sistema "Ajedrez"
const T = {
  dark:  { bg:'#12140F', text:'#F4F3EC', accent:'#5BE584', sub:'#9AA394', cardBg:'#1C1F18', cardBorder:'#FFFFFF14' },
  light: { bg:'#F4F3EC', text:'#131711', accent:'#16A34A', sub:'#6E7566', cardBg:'#FFFFFF', cardBorder:'#E2E0D6' },
};

const brand = (t) => `
  <div style="position:absolute;left:64px;bottom:56px;display:flex;align-items:center;gap:12px;">
    <div style="width:40px;height:40px;border-radius:50%;background:#16A34A;display:flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-weight:800;font-size:21px;letter-spacing:-1px;">W<span style="font-size:23px;">.</span></span>
    </div>
    <span style="font-weight:800;font-size:23px;color:${t.text};letter-spacing:-0.5px;">widdo</span>
  </div>`;

const tag = (t, txt) => `<div style="position:absolute;right:64px;bottom:62px;font-size:24px;font-weight:600;color:${t.sub};">${txt}</div>`;

const SHELL = (name, body, t) => `<!doctype html>
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
    body { margin:0; background:${t.bg}; }
    a { color:${t.accent}; } a:hover { color:${t.accent}; }
    .ab { position:relative; width:1080px; height:1080px; overflow:hidden; background:${t.bg};
          font-family:'Red Hat Display','Segoe UI',system-ui,sans-serif; -webkit-font-smoothing:antialiased; }
  </style>
</helmet>
${body}
</x-dc>
<script data-dc-script data-props='{"$preview":{"width":1080,"height":1080}}'>
class Component extends DCLogic { renderVals() { return {}; } }
</script>
</body>
</html>
`;

// ---------- 1 DARK · STOP (tipografico brutal) ----------
const d = T.dark, l = T.light;
const A1 = `
<div class="ab">
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 64px;">
    <div style="font-size:150px;font-weight:900;line-height:0.98;letter-spacing:-6px;color:${d.text};text-transform:uppercase;">
      Stop<br>answering<br>the same<br><span style="color:${d.accent};">question.</span>
    </div>
  </div>
  ${brand(d)}
  ${tag(d,'Widdo answers, so you can coach.')}
</div>`;

// ---------- 2 LIGHT · Payments card ----------
const A2 = `
<div class="ab">
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 64px;gap:56px;">
    <div style="font-size:96px;font-weight:900;line-height:1.0;letter-spacing:-4px;color:${l.text};text-transform:uppercase;">
      Still chasing<br><span style="color:${l.accent};">payments?</span>
    </div>
    <div style="width:600px;background:${l.cardBg};border:1.5px solid ${l.cardBorder};border-radius:26px;padding:14px 0;box-shadow:0 24px 60px -30px #13171133;">
      ${[
        ['Paid','23','#16A34A'],
        ['Pending','7','#B45309'],
        ['Overdue','$1,420','#DC2626'],
      ].map(([k,v,c])=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:28px 36px;border-bottom:1px solid #F0EEE4;">
        <span style="font-size:31px;font-weight:600;color:#6E7566;">${k}</span>
        <span style="font-size:40px;font-weight:900;color:${c};">${v}</span>
      </div>`).join('').replace(/border-bottom:1px solid #F0EEE4;">\s*$/,'">')}
    </div>
    <div style="font-size:32px;font-weight:600;color:${l.sub};margin-top:-14px;">Know who&rsquo;s paid. In seconds.</div>
  </div>
  ${brand(l)}
</div>`;

// ---------- 3 DARK · 127 messages (chat stack) ----------
const bubbles = [
  ['Mom','Is practice still on?'],
  ['Dad','What field are we at?'],
  ['Parent','Did my payment go through?'],
  ['Mom','Can Emma bring a friend?'],
];
const A3 = `
<div class="ab">
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 64px;gap:48px;">
    <div style="font-size:118px;font-weight:900;line-height:0.98;letter-spacing:-5px;color:${d.text};">
      <span style="color:${d.accent};">127</span> messages.<br>Saturday<br>morning.
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;width:720px;">
      ${bubbles.map(([w,m],i)=>`
      <div style="background:${d.cardBg};border:1px solid ${d.cardBorder};border-radius:20px;padding:20px 28px;width:fit-content;max-width:100%;${i%2?'margin-left:52px;':''}">
        <span style="font-size:24px;font-weight:800;color:${d.accent};">${w}</span>
        <span style="font-size:26px;font-weight:500;color:#C9CEC2;margin-left:12px;">${m}</span>
      </div>`).join('')}
    </div>
  </div>
  ${brand(d)}
  ${tag(d,'One assistant. Every answer.')}
</div>`;

// ---------- 4 LIGHT · 73% (editorial minimo) ----------
const A4 = `
<div class="ab">
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 64px;">
    <div style="font-size:300px;font-weight:900;line-height:0.9;letter-spacing:-12px;color:${l.accent};">73%</div>
    <div style="font-size:54px;font-weight:800;line-height:1.16;letter-spacing:-1.6px;color:${l.text};max-width:860px;margin-top:40px;">
      of US youth sports clubs run on zero paid software.
    </div>
  </div>
  ${brand(l)}
  ${tag(l,'The infrastructure gap.')}
</div>`;

// ---------- 5 DARK · Game day ----------
const A5 = `
<div class="ab">
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 64px;">
    <div style="font-size:150px;font-weight:900;line-height:0.98;letter-spacing:-6px;color:${d.text};text-transform:uppercase;">
      Game day.<br><span style="color:${d.accent};">Not</span><br>admin day.
    </div>
  </div>
  ${brand(d)}
  ${tag(d,'You coach. Widdo handles the rest.')}
</div>`;

// ---------- 6 LIGHT · Cleared to play (torneos) ----------
const A6 = `
<div class="ab">
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 64px;gap:52px;">
    <div style="font-size:96px;font-weight:900;line-height:1.0;letter-spacing:-4px;color:${l.text};text-transform:uppercase;">
      Cleared<br>to <span style="color:${l.accent};">play.</span>
    </div>
    <div style="width:660px;background:${l.cardBg};border:1.5px solid ${l.cardBorder};border-radius:26px;padding:34px 38px;display:flex;flex-direction:column;gap:24px;box-shadow:0 24px 60px -30px #13171133;">
      <div style="font-size:32px;font-weight:800;color:${l.text};">Thunder 12U</div>
      ${['Waivers signed','Roster verified','Entry paid'].map(x=>`
      <div style="display:flex;align-items:center;gap:12px;">
        <svg width="30" height="30" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#DCFCE7"/><path d="M4.5 8.4 7 10.9 11.5 5.6" stroke="#16A34A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span style="font-size:30px;font-weight:600;color:#374151;">${x}</span>
      </div>`).join('')}
    </div>
    <div style="font-size:32px;font-weight:600;color:${l.sub};margin-top:-12px;">Every team. One glance. No paper waivers.</div>
  </div>
  ${brand(l)}
</div>`;

const tiles = [
  ['Main.dc.html', A1, d], ['Payments.dc.html', A2, l], ['Mensajes.dc.html', A3, d],
  ['Stat.dc.html', A4, l], ['GameDay.dc.html', A5, d], ['Cleared.dc.html', A6, l],
];
for (const [f, body, t] of tiles) fs.writeFileSync(__dirname+'/'+f, SHELL(f, body, t));

// renders
const page=(body,t)=>`<!doctype html><html><head><meta charset="utf-8"><style>${FONT_FACE}html,body{margin:0;background:${t.bg}}.ab{position:relative;width:1080px;height:1080px;overflow:hidden;background:${t.bg};font-family:'Red Hat Display','Segoe UI',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}</style></head><body>${body}</body></html>`;
tiles.forEach(([f,body,t],i)=>fs.writeFileSync(__dirname+`/r2-${i+1}.html`, page(body,t)));

// canvas: tablero 3x2 alternado
fs.writeFileSync(__dirname+'/canvas.json', JSON.stringify({
  artboards: [
    { file:'Main.dc.html',     title:'1 - Stop (oscuro)',          x:0,    y:0,    w:1080, h:1080 },
    { file:'Payments.dc.html', title:'2 - Payments (claro)',       x:1120, y:0,    w:1080, h:1080 },
    { file:'Mensajes.dc.html', title:'3 - 127 messages (oscuro)',  x:2240, y:0,    w:1080, h:1080 },
    { file:'Stat.dc.html',     title:'4 - 73% (claro)',            x:0,    y:1120, w:1080, h:1080 },
    { file:'GameDay.dc.html',  title:'5 - Game day (oscuro)',      x:1120, y:1120, w:1080, h:1080 },
    { file:'Cleared.dc.html',  title:'6 - Cleared to play (claro)',x:2240, y:1120, w:1080, h:1080 },
  ],
  annotations: [
    { id:'sistema', x:3400, y:0, w:330, text:'Sistema AJEDREZ — v2 tras feedback de Miguel (menos texto, menos negro, verde vivo).\n\nDos superficies, un esqueleto: oscuro #12140F con verde brillante #5BE584 / claro calido #F4F3EC con verde #16A34A.\n\nReglas: una idea por pieza, max ~10 palabras, UNA palabra en verde, un solo componente (burbujas, mini-card, chips) o ninguno. Lockup W. widdo abajo-izquierda, tagline abajo-derecha.\n\nSe publica alternando oscuro-claro: en Instagram forma el tablero; en LinkedIn da ritmo.' },
    { id:'fotos', x:3400, y:520, w:330, text:'Fotografia (como en las referencias): entra como TERCERA superficie cuando haya imagenes propias o generadas con derechos — coach en golden hour, manos con telefono. Nunca menores identificables sin consentimiento.\n\nOJO con las referencias originales: mencionan WhatsApp (prohibido: el canal es propio), estan en espanol y COP, y algunas usan U-15. Este sistema ya lo corrige: EN, USD, 12U/14U, sin WhatsApp.' }
  ],
  launch: { view:'canvas' }
}, null, 2));
console.log('listo v2');
