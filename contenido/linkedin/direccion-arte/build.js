const fs = require('fs');
const FONT = fs.readFileSync(__dirname + '/font-a.b64', 'utf8').trim();
const FONT_FACE = `@font-face{font-family:'Red Hat Display';font-style:normal;font-weight:300 900;font-display:block;src:url(data:font/woff2;base64,${FONT}) format('woff2');}`;

// Marca comun al pie
const brand = (color) => `
  <div style="position:absolute;left:72px;bottom:64px;display:flex;align-items:center;gap:14px;">
    <div style="width:44px;height:44px;border-radius:50%;background:#16A34A;display:flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-weight:800;font-size:24px;letter-spacing:-1px;">W<span style="font-size:26px;">.</span></span>
    </div>
    <span style="font-weight:800;font-size:26px;color:${color};letter-spacing:-0.5px;">widdo.co</span>
  </div>`;

const SHELL = (body, bg) => `<!doctype html>
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
    body { margin:0; background:${bg}; }
    a { color:#00C853; } a:hover { color:#00E06B; }
    .ab { position:relative; width:1080px; height:1080px; overflow:hidden; background:${bg};
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

// ---------- A · Tipografico puro ----------
const A = `
<div class="ab">
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 72px;gap:8px;">
    <div style="font-size:340px;font-weight:900;line-height:0.9;letter-spacing:-14px;color:#00C853;">73%</div>
    <div style="font-size:52px;font-weight:800;line-height:1.15;letter-spacing:-1.5px;color:#FFFFFF;max-width:860px;margin-top:28px;">
      of US youth sports clubs run on <span style="color:#00C853;">zero paid software.</span>
    </div>
    <div style="font-size:27px;font-weight:500;line-height:1.5;color:#8A8A93;max-width:800px;margin-top:18px;">
      Registration in Google Forms. Payments in Venmo. Attendance in a coach&rsquo;s head.
    </div>
  </div>
  ${brand('#E8E8ED')}
</div>`;

// ---------- B · Cancha (familia del banner) ----------
const B = `
<div class="ab">
  <div style="position:absolute;inset:0;background:radial-gradient(760px 560px at 86% 8%, #00C85326, transparent 62%),radial-gradient(680px 520px at 12% 108%, #00C85315, transparent 60%);"></div>
  <svg style="position:absolute;inset:0;opacity:0.5;" width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" aria-hidden="true">
    <circle cx="920" cy="250" r="300" stroke="#FFFFFF" stroke-opacity="0.10" stroke-width="2"/>
    <circle cx="920" cy="250" r="170" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="2"/>
    <path d="M920 -200V1280" stroke="#FFFFFF" stroke-opacity="0.07" stroke-width="2"/>
    <path d="M120 -100V500" stroke="#FFFFFF" stroke-opacity="0.05" stroke-width="2"/>
  </svg>
  <div style="position:relative;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 72px;gap:30px;">
    <div style="display:inline-flex;align-items:center;gap:8px;border:1.5px solid #00C85359;border-radius:999px;padding:9px 22px;width:fit-content;color:#00C853;font-weight:800;font-size:24px;">
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M8 1.4 9.5 5.9a2.6 2.6 0 0 0 1.6 1.6L15.6 9l-4.5 1.5a2.6 2.6 0 0 0-1.6 1.6L8 16.6l-1.5-4.5a2.6 2.6 0 0 0-1.6-1.6L0.4 9l4.5-1.5a2.6 2.6 0 0 0 1.6-1.6L8 1.4Z" fill="currentColor"/></svg>
      The infrastructure gap
    </div>
    <div style="font-size:64px;font-weight:800;line-height:1.12;letter-spacing:-2px;color:#FFFFFF;max-width:900px;">
      <span style="color:#00C853;">73%</span> of US youth clubs run on zero paid software.
    </div>
    <div style="font-size:28px;font-weight:600;color:#9BB1A4;line-height:1.5;max-width:820px;">
      Google Forms &middot; Venmo &middot; a coach&rsquo;s memory &middot; one unmuted group chat
    </div>
  </div>
  ${brand('#DFF7E9')}
</div>`;

// ---------- C · Mock UI ----------
const C = `
<div class="ab">
  <div style="position:absolute;inset:0;background:radial-gradient(700px 500px at 80% -10%, #00C85320, transparent 65%);"></div>
  <div style="position:relative;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 72px;gap:44px;">
    <div style="font-size:56px;font-weight:800;line-height:1.14;letter-spacing:-1.8px;color:#FFFFFF;max-width:900px;">
      <span style="color:#00C853;">73%</span> of youth clubs still track this in spreadsheets.
    </div>
    <div style="width:860px;border-radius:18px;overflow:hidden;box-shadow:0 40px 90px -30px #000;border:1px solid #FFFFFF1c;">
      <div style="background:#1A1A22;display:flex;align-items:center;gap:8px;padding:14px 18px;">
        <span style="width:12px;height:12px;border-radius:50%;background:#FF5F57;"></span>
        <span style="width:12px;height:12px;border-radius:50%;background:#FEBC2E;"></span>
        <span style="width:12px;height:12px;border-radius:50%;background:#28C840;"></span>
        <span style="margin-left:14px;color:#7A7A85;font-size:16px;font-weight:600;">widdo.co &mdash; Collections</span>
      </div>
      <div style="background:#FFFFFF;padding:10px 0;">
        ${[
          ['The Harpers','14U &middot; monthly dues','Paid','#16A34A','#F0FDF4'],
          ['The Garcias','12U &middot; monthly dues','$140 due Friday','#B45309','#FFFBEB'],
          ['The Millers','14U &middot; tournament entry','$85 &middot; 12 days late','#DC2626','#FEF2F2'],
        ].map(([n,d,st,c,cbg])=>`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 28px;border-bottom:1px solid #F1F5F9;">
          <div>
            <div style="font-weight:800;font-size:24px;color:#111827;">${n}</div>
            <div style="font-weight:500;font-size:18px;color:#6B7280;margin-top:3px;">${d}</div>
          </div>
          <span style="background:${cbg};color:${c};font-weight:800;font-size:19px;padding:8px 18px;border-radius:999px;">${st}</span>
        </div>`).join('')}
        <div style="display:flex;align-items:center;gap:10px;padding:18px 28px;">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M2.5 8.6 6.2 12.3 13.5 4.4" stroke="#16A34A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span style="color:#374151;font-weight:700;font-size:20px;">Reminders sent &mdash; you approved, Widdo did the chasing.</span>
        </div>
      </div>
    </div>
  </div>
  ${brand('#E8E8ED')}
</div>`;

// ---------- D · Editorial claro ----------
const D = `
<div class="ab">
  <div style="position:relative;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 84px;">
    <div style="font-size:22px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#16A34A;">US youth sports, 2026</div>
    <div style="font-size:58px;font-weight:800;line-height:1.13;letter-spacing:-1.8px;color:#0B1A12;max-width:880px;margin-top:26px;">
      73% of youth sports clubs run on zero paid software.
    </div>
    <div style="margin-top:64px;display:flex;flex-direction:column;gap:26px;max-width:880px;">
      <div>
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:23px;color:#0B1A12;margin-bottom:12px;">
          <span>Spreadsheets, group chats, Venmo</span><span style="color:#16A34A;">73%</span>
        </div>
        <div style="height:34px;border-radius:8px;background:#16A34A;width:73%;"></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:23px;color:#5A6B61;margin-bottom:12px;">
          <span>Purpose-built software</span><span>27%</span>
        </div>
        <div style="height:34px;border-radius:8px;background:#D5E3DA;width:27%;"></div>
      </div>
    </div>
    <div style="font-size:25px;font-weight:500;color:#5A6B61;line-height:1.55;margin-top:56px;max-width:840px;">
      The tools exist for restaurants, salons, and gyms &mdash; not for the 300,000+ organizations running youth athletics in America.
    </div>
  </div>
  ${brand('#0B1A12')}
</div>`;

fs.writeFileSync(__dirname+'/Main.dc.html', SHELL(A, '#0A0A0F'));
fs.writeFileSync(__dirname+'/Cancha.dc.html', SHELL(B, '#0A1410'));
fs.writeFileSync(__dirname+'/MockUI.dc.html', SHELL(C, '#0A0A0F'));
fs.writeFileSync(__dirname+'/Editorial.dc.html', SHELL(D, '#F6F8F6'));

// renders para PNG
const page = (body,bg)=>`<!doctype html><html><head><meta charset="utf-8"><style>${FONT_FACE}html,body{margin:0;background:${bg}}.ab{position:relative;width:1080px;height:1080px;overflow:hidden;background:${bg};font-family:'Red Hat Display','Segoe UI',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}</style></head><body>${body}</body></html>`;
fs.writeFileSync(__dirname+'/r-A.html', page(A,'#0A0A0F'));
fs.writeFileSync(__dirname+'/r-B.html', page(B,'#0A1410'));
fs.writeFileSync(__dirname+'/r-C.html', page(C,'#0A0A0F'));
fs.writeFileSync(__dirname+'/r-D.html', page(D,'#F6F8F6'));

fs.writeFileSync(__dirname+'/canvas.json', JSON.stringify({
  artboards: [
    { file: 'Main.dc.html',      title: 'A - Tipografico puro',        x: 0,    y: 0,   w: 1080, h: 1080 },
    { file: 'Cancha.dc.html',    title: 'B - Cancha (familia banner)', x: 1160, y: 0,   w: 1080, h: 1080 },
    { file: 'MockUI.dc.html',    title: 'C - Mock UI (producto)',      x: 0,    y: 1180, w: 1080, h: 1080 },
    { file: 'Editorial.dc.html', title: 'D - Editorial claro',         x: 1160, y: 1180, w: 1080, h: 1080 },
  ],
  annotations: [
    { id: 'brief', x: 2340, y: 0, w: 320, text: 'Direccion de arte de los posts de Widdo.\n\nEl MISMO post (01, el stat del 73%) en 4 lenguajes visuales. El elegido se vuelve ley en BRAND-GUIDE.md y mk-diseno lo aplica a las 24 piezas del backlog.\n\nTodos: Red Hat Display + verdes de marca, 1080x1080, export 2x.' },
    { id: 'tradeoffs', x: 2340, y: 460, w: 320, text: 'A Tipografico: maximo impacto en el feed, sirve para CUALQUIER post con dato. No muestra producto.\n\nB Cancha: hereda la identidad del banner, la pagina se ve uniforme. Menos flexible para posts sin claim corto.\n\nC Mock UI: ensena el producto sin screenshots reales (aun no hay EN/USD). Mas costoso por pieza.\n\nD Editorial claro: destaca en un feed lleno de cards oscuras, tono serio/datos. Menos Widdo a primera vista.' }
  ],
  launch: { view: 'canvas' }
}, null, 2));
console.log('listo');
