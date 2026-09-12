const fs = require('fs');
const FONT = fs.readFileSync(__dirname + '/font-a.b64', 'utf8').trim();
const FONT_FACE = `@font-face{font-family:'Red Hat Display';font-style:normal;font-weight:300 900;font-display:block;src:url(data:font/woff2;base64,${FONT}) format('woff2');}`;

const T = {
  dark:  { bg:'#12140F', text:'#F4F3EC', accent:'#5BE584', sub:'#9AA394', cardBg:'#1D211A', cardBorder:'#FFFFFF17',
           aiCardBg:'#20251D', bubbleUser:'#2E5C3F', bubbleUserText:'#E9FBEF', body:'#C9CEC2',
           glow:'radial-gradient(720px 520px at 85% -5%, #5BE58418, transparent 60%)' },
  light: { bg:'#F4F3EC', text:'#131711', accent:'#16A34A', sub:'#6E7566', cardBg:'#FFFFFF', cardBorder:'#E2E0D6',
           aiCardBg:'#FFFFFF', bubbleUser:'#DCFCE7', bubbleUserText:'#14532D', body:'#374151',
           glow:'radial-gradient(720px 520px at 85% -5%, #16A34A0E, transparent 60%)' },
};

const brand = (t) => `
  <div style="position:absolute;left:64px;bottom:56px;display:flex;align-items:center;gap:12px;">
    <div style="width:40px;height:40px;border-radius:50%;background:#16A34A;display:flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-weight:800;font-size:21px;letter-spacing:-1px;">W<span style="font-size:23px;">.</span></span>
    </div>
    <span style="font-weight:800;font-size:23px;color:${t.text};letter-spacing:-0.5px;">widdo</span>
  </div>`;
const tag = (t, txt) => `<div style="position:absolute;right:64px;bottom:62px;font-size:24px;font-weight:600;color:${t.sub};">${txt}</div>`;

// --- componentes de la conversacion IA ---
const SPARK = `<svg width="17" height="17" viewBox="0 0 16 16" fill="none" style="flex:none;"><path d="M8 1.4 9.5 5.9a2.6 2.6 0 0 0 1.6 1.6L15.6 9l-4.5 1.5a2.6 2.6 0 0 0-1.6 1.6L8 16.6l-1.5-4.5a2.6 2.6 0 0 0-1.6-1.6L0.4 9l4.5-1.5a2.6 2.6 0 0 0 1.6-1.6L8 1.4Z" fill="currentColor"/></svg>`;
const CHECK = (c)=>`<svg width="24" height="24" viewBox="0 0 16 16" fill="none" style="flex:none;"><circle cx="8" cy="8" r="8" fill="${c}22"/><path d="M4.5 8.4 7 10.9 11.5 5.6" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const chatQ = (t, txt, w=null) => `
  <div style="align-self:flex-end;background:${t.bubbleUser};color:${t.bubbleUserText};border-radius:22px 22px 6px 22px;padding:20px 28px;font-size:27px;font-weight:600;${w?`max-width:${w}px;`:''}">${txt}</div>`;

const aiHead = (t) => `
  <div style="display:flex;align-items:center;gap:10px;color:${t.accent};font-weight:800;font-size:19px;letter-spacing:1.6px;text-transform:uppercase;">${SPARK}Widdo AI</div>`;

const aiCard = (t, inner, w=640) => `
  <div style="align-self:flex-start;width:${w}px;background:${t.aiCardBg};border:1.5px solid ${t.cardBorder};border-radius:24px;padding:26px 30px;display:flex;flex-direction:column;gap:16px;box-shadow:0 28px 70px -34px rgba(0,0,0,0.45);">
    ${aiHead(t)}
    ${inner}
  </div>`;

const doneLine = (t, txt) => `
  <div style="align-self:flex-start;display:flex;align-items:center;gap:12px;background:${t.accent}1A;border:1.5px solid ${t.accent}55;border-radius:999px;padding:14px 26px;">
    ${CHECK(t.accent)}
    <span style="font-size:25px;font-weight:700;color:${t.text};">${txt}</span>
  </div>`;

const SHELL = (body, t) => `<!doctype html>
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
    .glow { position:absolute; inset:0; background:${t.glow}; }
    .col { position:relative; height:100%; display:flex; flex-direction:column; justify-content:center; padding:0 64px; }
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

const d = T.dark, l = T.light;

// ---------- 1 DARK · Just ask (la conversacion completa) ----------
const A1 = `
<div class="ab"><div class="glow"></div>
  <div class="col" style="gap:40px;">
    <div style="font-size:88px;font-weight:900;line-height:0.98;letter-spacing:-3.5px;color:${d.text};text-transform:uppercase;">
      Just <span style="color:${d.accent};">ask.</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:20px;width:100%;">
      ${chatQ(d, 'Who hasn&rsquo;t paid in the 14U team?', 560)}
      ${aiCard(d, `
        <div style="font-size:36px;font-weight:900;color:${d.text};letter-spacing:-1px;">4 families &middot; <span style="color:${d.accent};">$520</span> outstanding</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[['The Harpers','$140'],['The Garcias','$140'],['The Millers','$120'],['+1 more family','$120']].map(([n,v])=>`
          <div style="display:flex;justify-content:space-between;font-size:25px;">
            <span style="font-weight:600;color:${d.body};">${n}</span><span style="font-weight:800;color:${d.text};">${v}</span>
          </div>`).join('')}
        </div>`, 640)}
      ${doneLine(d, 'Reminders sent &mdash; you approved, Widdo did the chasing.')}
    </div>
  </div>
  ${brand(d)}
  ${tag(d,'Your club, one question away.')}
</div>`;

// ---------- 2 LIGHT · Still chasing payments ----------
const A2 = `
<div class="ab"><div class="glow"></div>
  <div class="col" style="gap:38px;">
    <div style="font-size:80px;font-weight:900;line-height:1.0;letter-spacing:-3px;color:${l.text};text-transform:uppercase;">
      Still chasing<br><span style="color:${l.accent};">payments?</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:20px;width:100%;">
      ${chatQ(l, 'Remind everyone who&rsquo;s late', 480)}
      ${aiCard(l, `
        <div style="display:flex;flex-direction:column;">
          ${[['Paid','23','#16A34A'],['Pending','7','#B45309'],['Overdue','$1,420','#DC2626']].map(([k,v,c],i)=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:${i?'18px':'4px'} 0 18px;${i<2?'border-bottom:1px solid #F0EEE4;':''}">
            <span style="font-size:28px;font-weight:600;color:#6E7566;">${k}</span>
            <span style="font-size:36px;font-weight:900;color:${c};">${v}</span>
          </div>`).join('')}
        </div>`, 600)}
      ${doneLine(l, '7 reminders sent. Nothing written by hand.')}
    </div>
  </div>
  ${brand(l)}
</div>`;

// ---------- 3 DARK · 127 messages -> Widdo answered ----------
const A3 = `
<div class="ab"><div class="glow"></div>
  <div class="col" style="gap:36px;">
    <div style="font-size:78px;font-weight:900;line-height:0.98;letter-spacing:-3px;color:${d.text};">
      <span style="color:${d.accent};">127</span> messages.<br>Saturday morning.
    </div>
    <div style="display:flex;flex-direction:column;gap:13px;width:640px;">
      ${[['Mom','Is practice still on?',0],['Dad','What field are we at?',1],['Parent','Did my payment go through?',0]].map(([w,m,off])=>`
      <div style="background:${d.cardBg};border:1px solid ${d.cardBorder};border-radius:18px;padding:16px 24px;width:fit-content;${off?'margin-left:48px;':''}">
        <span style="font-size:22px;font-weight:800;color:${d.accent};">${w}</span>
        <span style="font-size:24px;font-weight:500;color:${d.body};margin-left:12px;">${m}</span>
      </div>`).join('')}
    </div>
    ${aiCard(d, `
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${['Answered all 127 &mdash; schedule, field, payments','Registered 1 new signup','Flagged 3 families for follow-up'].map(x=>`
        <div style="display:flex;align-items:center;gap:12px;">${CHECK(d.accent)}<span style="font-size:25px;font-weight:600;color:${d.body};">${x}</span></div>`).join('')}
      </div>
      <div style="font-size:27px;font-weight:800;color:${d.text};margin-top:4px;">While you were at the field.</div>`, 660)}
  </div>
  ${brand(d)}
  ${tag(d,'One assistant. Every answer.')}
</div>`;

// ---------- 4 LIGHT · The morning brief ----------
const A4 = `
<div class="ab"><div class="glow"></div>
  <div class="col" style="gap:38px;">
    <div style="font-size:80px;font-weight:900;line-height:1.0;letter-spacing:-3px;color:${l.text};text-transform:uppercase;">
      Coffee first.<br><span style="color:${l.accent};">Then this.</span>
    </div>
    ${aiCard(l, `
      <div style="font-size:29px;font-weight:800;color:${l.text};">Good morning &mdash; your club today</div>
      <div style="display:flex;flex-direction:column;gap:14px;">
        ${[
          ['$2,340 collected this week','#16A34A'],
          ['3 families need a nudge &mdash; drafts ready','#B45309'],
          ['14U practice tonight &middot; 18 confirmed','#374151'],
        ].map(([x,c])=>`
        <div style="display:flex;align-items:center;gap:12px;">${CHECK(c)}<span style="font-size:26px;font-weight:600;color:#374151;">${x}</span></div>`).join('')}
      </div>`, 660)}
    <div style="font-size:30px;font-weight:600;color:${l.sub};">Every morning. Without asking.</div>
  </div>
  ${brand(l)}
  ${tag(l,'The daily brief.')}
</div>`;

// ---------- 5 DARK · Game day ----------
const A5 = `
<div class="ab"><div class="glow"></div>
  <div class="col" style="gap:38px;">
    <div style="font-size:96px;font-weight:900;line-height:0.98;letter-spacing:-4px;color:${d.text};text-transform:uppercase;">
      Game day.<br><span style="color:${d.accent};">Not</span> admin day.
    </div>
    <div style="display:flex;flex-direction:column;gap:20px;width:100%;">
      ${chatQ(d, 'Are we ready for the tournament?', 540)}
      ${aiCard(d, `
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${['8 of 8 players checked in &mdash; QR at the gate','Waivers signed &middot; roster locked','Bracket updated &middot; next game 10:40 AM'].map(x=>`
          <div style="display:flex;align-items:center;gap:12px;">${CHECK(d.accent)}<span style="font-size:25px;font-weight:600;color:${d.body};">${x}</span></div>`).join('')}
        </div>
        <div style="font-size:27px;font-weight:800;color:${d.text};margin-top:4px;">Cleared to play. Go coach.</div>`, 660)}
    </div>
  </div>
  ${brand(d)}
</div>`;

// ---------- 6 LIGHT · 73% (el editorial, ahora con remate IA) ----------
const A6 = `
<div class="ab"><div class="glow"></div>
  <div class="col" style="gap:30px;">
    <div style="font-size:230px;font-weight:900;line-height:0.9;letter-spacing:-9px;color:${l.accent};">73%</div>
    <div style="font-size:48px;font-weight:800;line-height:1.14;letter-spacing:-1.5px;color:${l.text};max-width:880px;">
      of US youth clubs run on spreadsheets, group chats and Venmo.
    </div>
    <div style="display:flex;flex-direction:column;gap:18px;width:100%;margin-top:16px;">
      ${chatQ(l, 'There&rsquo;s a better way to run a club&hellip;', 560)}
      ${doneLine(l, 'Ask Widdo. It answers &mdash; and it does the work.')}
    </div>
  </div>
  ${brand(l)}
  ${tag(l,'The infrastructure gap.')}
</div>`;

const tiles = [
  ['Main.dc.html', A1, d], ['Payments.dc.html', A2, l], ['Mensajes.dc.html', A3, d],
  ['Brief.dc.html', A4, l], ['GameDay.dc.html', A5, d], ['Stat.dc.html', A6, l],
];
for (const [f, body, t] of tiles) fs.writeFileSync(__dirname+'/'+f, SHELL(body, t));

const page=(body,t)=>`<!doctype html><html><head><meta charset="utf-8"><style>${FONT_FACE}html,body{margin:0;background:${t.bg}}
.ab{position:relative;width:1080px;height:1080px;overflow:hidden;background:${t.bg};font-family:'Red Hat Display','Segoe UI',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
.glow{position:absolute;inset:0;background:${t.glow};}
.col{position:relative;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 64px;}
</style></head><body>${body}</body></html>`;
tiles.forEach(([f,body,t],i)=>fs.writeFileSync(__dirname+`/r3-${i+1}.html`, page(body,t)));

fs.writeFileSync(__dirname+'/canvas.json', JSON.stringify({
  artboards: [
    { file:'Main.dc.html',     title:'1 - Just ask (oscuro)',        x:0,    y:0,    w:1080, h:1080 },
    { file:'Payments.dc.html', title:'2 - Payments (claro)',         x:1120, y:0,    w:1080, h:1080 },
    { file:'Mensajes.dc.html', title:'3 - 127 messages (oscuro)',    x:2240, y:0,    w:1080, h:1080 },
    { file:'Brief.dc.html',    title:'4 - Morning brief (claro)',    x:0,    y:1120, w:1080, h:1080 },
    { file:'GameDay.dc.html',  title:'5 - Game day (oscuro)',        x:1120, y:1120, w:1080, h:1080 },
    { file:'Stat.dc.html',     title:'6 - 73% (claro)',              x:2240, y:1120, w:1080, h:1080 },
  ],
  annotations: [
    { id:'sistema', x:3400, y:0, w:330, text:'Sistema AJEDREZ v3 — la IA es el protagonista.\n\nCada pieza muestra la conversacion completa: pregunta del dueno (burbuja verde) → respuesta de Widdo AI con datos reales (card) → accion ejecutada (pildora con check).\n\nDos superficies alternadas: oscuro #12140F / crema #F4F3EC. Verde vivo #5BE584 en oscuro, #16A34A en claro. Titular arriba (~80-96px), conversacion abajo.' },
    { id:'reglas', x:3400, y:560, w:330, text:'Reglas del sistema:\n- El componente estrella es la conversacion Widdo AI (pregunta → datos → accion hecha).\n- "You approved" aparece cuando la IA envia algo a familias.\n- EN, USD, 14U/12U. Sin WhatsApp, sin marcas de terceros.\n- Fotografia entra despues como tercera superficie (con derechos, sin menores identificables).' }
  ],
  launch: { view:'canvas' }
}, null, 2));
console.log('listo v3');
