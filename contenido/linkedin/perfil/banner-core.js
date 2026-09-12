// Fuente unica del arte del banner. La usan Main.dc.html, Preview.dc.html y el render PNG.
const fs = require('fs');
const FONT = fs.readFileSync(__dirname + '/font-a.b64', 'utf8').trim();

const FONT_FACE = `
  @font-face {
    font-family: 'Red Hat Display';
    font-style: normal;
    font-weight: 300 900;
    font-display: block;
    src: url(data:font/woff2;base64,${FONT}) format('woff2');
  }`;

const SPARK = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.4 9.5 5.9a2.6 2.6 0 0 0 1.6 1.6L15.6 9l-4.5 1.5a2.6 2.6 0 0 0-1.6 1.6L8 16.6l-1.5-4.5a2.6 2.6 0 0 0-1.6-1.6L0.4 9l4.5-1.5a2.6 2.6 0 0 0 1.6-1.6L8 1.4Z" fill="currentColor"/></svg>`;

const THEMES = {
  dark: {
    accent: '#00C853',
    bg: '#0A1410',
    claim: '#FFFFFF',
    meta: '#A6BCAF',
    pillText: '#DFF7E9',
    sep: '#FFFFFF1F',
    line: '#FFFFFF',
    lineOpacity: [0.11, 0.07, 0.09, 0.09, 0.045],
    chipBg: 'linear-gradient(180deg, #12241C 0%, #0D1A15 100%)',
    chipBorder: '#FFFFFF1A',
    chipShadow: '0 18px 40px -22px #000000',
    chipQ: '#9AB2A4',
    chipA: '#FFFFFF',
    chipDo: '#C0D6C8',
    chipRule: '#FFFFFF14',
    glowAlpha: ['2E', '14'],
  },
  light: {
    accent: '#16A34A',
    bg: '#F6F8F6',
    claim: '#0B1A12',
    meta: '#5A6B61',
    pillText: '#14532D',
    sep: '#0B1A1220',
    line: '#0B1A12',
    lineOpacity: [0.07, 0.045, 0.055, 0.055, 0.03],
    chipBg: '#FFFFFF',
    chipBorder: '#DCE5DF',
    chipShadow: '0 14px 32px -20px #0B1A1259',
    chipQ: '#6B7C72',
    chipA: '#0B1A12',
    chipDo: '#41564A',
    chipRule: '#0B1A1214',
    glowAlpha: ['1F', '12'],
  },
};

const bannerCss = (themeName, claimSize) => {
  const t = THEMES[themeName] || THEMES.dark;
  const a = t.accent;
  return `
  .wb-banner {
    position: relative;
    width: 1128px;
    height: 191px;
    overflow: hidden;
    background: ${t.bg};
    font-family: 'Red Hat Display', 'Segoe UI', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .wb-glow {
    position: absolute; inset: 0;
    background:
      radial-gradient(560px 300px at 88% 6%, ${a}${t.glowAlpha[0]}, transparent 64%),
      radial-gradient(520px 300px at 24% 118%, ${a}${t.glowAlpha[1]}, transparent 60%);
  }
  .wb-pitch { position: absolute; inset: 0; opacity: 0.5; }
  .wb-content {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 13px;
    padding: 0 56px 0 232px;
  }
  .wb-claim {
    margin: 0;
    max-width: 566px;
    font-size: ${claimSize}px;
    font-weight: 800;
    line-height: 1.14;
    letter-spacing: -0.9px;
    color: ${t.claim};
  }
  .wb-claim em { font-style: normal; color: ${a}; }
  .wb-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13.5px;
    font-weight: 600;
    letter-spacing: 0.1px;
    color: ${t.meta};
  }
  .wb-url { color: ${a}; font-weight: 800; font-size: 14.5px; letter-spacing: 0.2px; }
  .wb-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 11px 5px;
    border: 1px solid ${a}59;
    border-radius: 999px;
    color: ${t.pillText};
    font-weight: 700;
    font-size: 13px;
    white-space: nowrap;
  }
  .wb-dot { width: 5px; height: 5px; border-radius: 50%; background: ${a}; flex: none; }
  .wb-sports { white-space: nowrap; }
  .wb-sep { width: 1px; height: 15px; background: ${t.sep}; flex: none; }
  .wb-proof {
    box-sizing: border-box;
    position: absolute;
    right: 44px;
    top: 50%;
    transform: translateY(-50%);
    width: 268px;
    padding: 13px 16px 14px;
    border: 1px solid ${t.chipBorder};
    border-radius: 12px;
    background: ${t.chipBg};
    box-shadow: ${t.chipShadow};
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .wb-proof-q { margin: 0; font-size: 12.5px; font-weight: 500; color: ${t.chipQ}; line-height: 1.25; }
  .wb-proof-a { margin: 0; display: flex; align-items: center; gap: 7px; font-size: 14.5px; font-weight: 800; color: ${t.chipA}; letter-spacing: -0.2px; }
  .wb-pill-ai { color: ${a}; border-color: ${a}59; }
  .wb-pill-ai svg { margin-right: -1px; }
  .wb-proof-head {
    margin: 0 0 1px;
    display: flex; align-items: center; gap: 6px;
    font-size: 10.5px; font-weight: 800;
    letter-spacing: 1.1px; text-transform: uppercase;
    color: ${a};
  }
  .wb-proof-do {
    margin: 0;
    display: flex; align-items: center; gap: 7px;
    padding-top: 8px;
    border-top: 1px solid ${t.chipRule};
    font-size: 12.5px; font-weight: 600; color: ${t.chipDo};
  }
  .wb-check { flex: none; color: ${a}; }`;
};

const bannerHtml = (opts) => {
  const t = THEMES[(opts && opts.theme) || 'dark'];
  const o = t.lineOpacity;
  return `
<div class="wb-banner">
  <div class="wb-glow"></div>
  <svg class="wb-pitch" viewBox="0 0 1128 191" fill="none" preserveAspectRatio="none" aria-hidden="true">
    <circle cx="1010" cy="96" r="128" stroke="${t.line}" stroke-opacity="${o[0]}" stroke-width="1.5"/>
    <circle cx="1010" cy="96" r="196" stroke="${t.line}" stroke-opacity="${o[1]}" stroke-width="1.5"/>
    <circle cx="1010" cy="96" r="64" stroke="${t.line}" stroke-opacity="${o[2]}" stroke-width="1.5"/>
    <path d="M1010 -60V452" stroke="${t.line}" stroke-opacity="${o[3]}" stroke-width="1.5"/>
    <path d="M170 -40V231" stroke="${t.line}" stroke-opacity="${o[4]}" stroke-width="1.5"/>
  </svg>
  <div class="wb-content">
    <h1 class="wb-claim">Run your club <em>without chasing parents for money.</em></h1>
    <div class="wb-meta">
      <span class="wb-url">widdo.co</span>
      <span class="wb-sep"></span>
      <span class="wb-pill wb-pill-ai">${SPARK(12)}AI&#8209;native</span>
      <span class="wb-pill"><span class="wb-dot"></span>0% platform fee</span>
      <span class="wb-sep"></span>
      <span class="wb-sports">33 sports, basketball to cheer</span>
    </div>
  </div>
  ${(opts && opts.proof) ? `<div class="wb-proof">
    <p class="wb-proof-head">${SPARK(11)}Ask Widdo</p>
    <p class="wb-proof-q">&ldquo;Who hasn&rsquo;t paid in the U15 team?&rdquo;</p>
    <p class="wb-proof-a"><span class="wb-dot"></span>4 families &middot; $520 outstanding</p>
    <p class="wb-proof-do"><svg class="wb-check" width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 8.6 6.2 12.3 13.5 4.4" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>Reminders sent to all four</p>
  </div>` : ''}
</div>`;
};

module.exports = { FONT_FACE, bannerCss, bannerHtml, THEMES };
