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
const L1 = `
<div class="ab"><div class="glow"></div>
  <div class="col" style="gap:40px;">
    <div style="font-size:88px;font-weight:900;line-height:0.98;letter-spacing:-3.5px;color:${l.text};text-transform:uppercase;">
      Just <span style="color:${l.accent};">ask.</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:20px;width:100%;">
      ${chatQ(l, 'Who hasn&rsquo;t paid in the 14U team?', 560)}
      ${aiCard(l, `
        <div style="font-size:36px;font-weight:900;color:${l.text};letter-spacing:-1px;">4 families &middot; <span style="color:${l.accent};">$520</span> outstanding</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[['The Harpers','$140'],['The Garcias','$140'],['The Millers','$120'],['+1 more family','$120']].map(([n,v])=>`
          <div style="display:flex;justify-content:space-between;font-size:25px;">
            <span style="font-weight:600;color:${l.body};">${n}</span><span style="font-weight:800;color:${l.text};">${v}</span>
          </div>`).join('')}
        </div>`, 640)}
      ${doneLine(l, 'Reminders sent &mdash; you approved, Widdo did the chasing.')}
    </div>
  </div>
  ${brand(l)}
  ${tag(l,'Your club, one question away.')}
</div>`;
const L3 = `
<div class="ab"><div class="glow"></div>
  <div class="col" style="gap:36px;">
    <div style="font-size:78px;font-weight:900;line-height:0.98;letter-spacing:-3px;color:${l.text};">
      <span style="color:${l.accent};">127</span> messages.<br>Saturday morning.
    </div>
    <div style="display:flex;flex-direction:column;gap:13px;width:640px;">
      ${[['Mom','Is practice still on?',0],['Dad','What field are we at?',1],['Parent','Did my payment go through?',0]].map(([w,m,off])=>`
      <div style="background:${l.cardBg};border:1px solid ${l.cardBorder};border-radius:18px;padding:16px 24px;width:fit-content;${off?'margin-left:48px;':''}">
        <span style="font-size:22px;font-weight:800;color:${l.accent};">${w}</span>
        <span style="font-size:24px;font-weight:500;color:${l.body};margin-left:12px;">${m}</span>
      </div>`).join('')}
    </div>
    ${aiCard(l, `
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${['Answered all 127 &mdash; schedule, field, payments','Registered 1 new signup','Flagged 3 families for follow-up'].map(x=>`
        <div style="display:flex;align-items:center;gap:12px;">${CHECK(l.accent)}<span style="font-size:25px;font-weight:600;color:${l.body};">${x}</span></div>`).join('')}
      </div>
      <div style="font-size:27px;font-weight:800;color:${l.text};margin-top:4px;">While you were at the field.</div>`, 660)}
  </div>
  ${brand(l)}
  ${tag(l,'One assistant. Every answer.')}
</div>`;
const L5 = `
<div class="ab"><div class="glow"></div>
  <div class="col" style="gap:38px;">
    <div style="font-size:96px;font-weight:900;line-height:0.98;letter-spacing:-4px;color:${l.text};text-transform:uppercase;">
      Game day.<br><span style="color:${l.accent};">Not</span> admin day.
    </div>
    <div style="display:flex;flex-direction:column;gap:20px;width:100%;">
      ${chatQ(l, 'Are we ready for the tournament?', 540)}
      ${aiCard(l, `
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${['8 of 8 players checked in &mdash; QR at the gate','Waivers signed &middot; roster locked','Bracket updated &middot; next game 10:40 AM'].map(x=>`
          <div style="display:flex;align-items:center;gap:12px;">${CHECK(l.accent)}<span style="font-size:25px;font-weight:600;color:${l.body};">${x}</span></div>`).join('')}
        </div>
        <div style="font-size:27px;font-weight:800;color:${l.text};margin-top:4px;">Cleared to play. Go coach.</div>`, 660)}
    </div>
  </div>
  ${brand(l)}
</div>`;

const tiles = [['MainL.dc.html', L1], ['MensajesL.dc.html', L3], ['GameDayL.dc.html', L5]];
for (const [f, body] of tiles) fs.writeFileSync(__dirname+'/'+f, SHELL(body, l));
const page=(body,t)=>`<!doctype html><html><head><meta charset="utf-8"><style>${FONT_FACE}html,body{margin:0;background:${t.bg}}
.ab{position:relative;width:1080px;height:1080px;overflow:hidden;background:${t.bg};font-family:'Red Hat Display','Segoe UI',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
.glow{position:absolute;inset:0;background:${t.glow};}
.col{position:relative;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 64px;}
</style></head><body>${body}</body></html>`;
tiles.forEach(([f,body],i)=>fs.writeFileSync(__dirname+`/r4-${i+1}.html`, page(body,l)));
console.log('listo claros');
