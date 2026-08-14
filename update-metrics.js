const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================
// WIDDO METRICS UPDATER
// Actualiza metrics.json → corre: node update-metrics.js
// Agrega --pdf para regenerar los PDFs (6 generadores)
//
// Alcance: 11 archivos con reemplazos activos (6 HTML de decks + 5 docs de
// negocio). DATA-ROOM-CHECKLIST.md figura en la lista pero no tiene patrones.
// La metrica de churn NO se propaga: se retiro el 13-ago-2026 (ver metrics.json).
// ============================================================

const generatePdfs = process.argv.includes('--pdf');

// Load metrics
const metrics = JSON.parse(fs.readFileSync(path.join(__dirname, 'metrics.json'), 'utf8'));

// Clubes que PAGAN (subset de metrics.clubs = clubes activos). Fallback al total si no existe
const payingClubs = metrics.paying_clubs ?? metrics.clubs;

// ============================================================
// ESCAPADO DE "$" EN LAS CADENAS DE REEMPLAZO
// ============================================================
// String.replace() interpreta "$" seguido de un digito como referencia a un
// grupo de captura. Un MRR de 101 escrito como "$101" dentro de un replacement
// se lee como "grupo 1" + "01" y destroza el texto:
//   pattern /\$[\d,]+ (de )?MRR/ + replace "$1,475 $1MRR"  →  "de ,475 de MRR"
// (asi quedo corrupto TOUGH-QUESTIONS.md).
//
// Regla: TODA cifra que venga de metrics.json y lleve "$" delante pasa por
// money() o lit(). Los "$1", "$2" escritos a mano siguen siendo grupos.
const lit = (v) => String(v).replace(/\$/g, '$$$$'); // texto literal seguro (escapa los $ del dato)
const money = (v) => '$$' + lit(v);                  // "$101" seguro dentro de un replacement

// ============================================================
// RECALCULATE DERIVED VALUES
// ============================================================
metrics.arr = metrics.mrr * 12;
const actualCost = metrics.clubs > 0 ? Math.round(metrics.infra_cost / metrics.clubs) : 4;
metrics.cost_per_club = Math.max(actualCost, 4); // Min $4 (conservative for investors)
const margin = ((metrics.arpc - metrics.cost_per_club) / metrics.arpc * 100).toFixed(0);
metrics.gross_margin = margin + '%';
metrics.ltv = metrics.arpc * 24;
if (metrics.cac_projected > 0) {
  metrics.ltv_cac_ratio = Math.round(metrics.ltv / metrics.cac_projected) + 'x';
}

// LATAM derived values
const latam_arpc = metrics.pricing_starter;
const latam_ltv = latam_arpc * 24;
const latam_ltv_cac = metrics.cac_projected > 0 ? Math.round(latam_ltv / metrics.cac_projected) + 'x' : '14x';
const latam_breakeven = 40;

console.log('╔══════════════════════════════════════════════╗');
console.log('║         WIDDO METRICS UPDATER                ║');
console.log('╚══════════════════════════════════════════════╝');
console.log('');
console.log(`  Clubs: ${metrics.clubs} activos (${payingClubs} pagando) | MRR: $${metrics.mrr.toLocaleString()} | ARR: $${metrics.arr.toLocaleString()}`);
console.log(`  ARPC: $${metrics.arpc} | Cost/club: $${metrics.cost_per_club} | Margin: ${metrics.gross_margin}`);
console.log(`  LTV: $${metrics.ltv.toLocaleString()} | LTV/CAC: ${metrics.ltv_cac_ratio}`);
console.log(`  Usuarios: ${metrics.users.toLocaleString()} | Jugadores: ${metrics.players.toLocaleString()} | Infra: $${metrics.infra_cost}/mes`);
console.log(`  Raising: $${metrics.raising_amount} @ ${metrics.valuation_premoney} pre-money`);
console.log(`  PDF generation: ${generatePdfs ? 'YES' : 'NO (add --pdf to generate)'}`);
console.log('');

// Common patterns used across multiple files
const clubsPayingEN = { pattern: /\b\d+ clubs? paying/gi, replace: `${payingClubs} clubs paying` };
const clubsPagandoES = { pattern: /\b\d+ clubs? pagando/gi, replace: `${payingClubs} clubs pagando` };
const mrrPattern = { pattern: /\$[\d,]+ MRR/g, replace: `${money(metrics.mrr.toLocaleString())} MRR` };
const marginEN = { pattern: /\d+% gross margin/gi, replace: `${metrics.gross_margin} gross margin` };
// LTV/CAC aparece en los dos ordenes: "LTV/CAC 16x" y "16x LTV/CAC"
const ltvCacPattern = { pattern: /LTV\/CAC (ratio )?\d+x/gi, replace: `LTV/CAC $1${metrics.ltv_cac_ratio}` };
const ltvCacInvertedPattern = { pattern: /\b\d+x LTV\/CAC/gi, replace: `${metrics.ltv_cac_ratio} LTV/CAC` };
// Los patrones de dinero aceptan CUALQUIER cifra previa, no la del ultimo update:
// anclarlos a un valor concreto ("$59 ARPC") los deja muertos en el siguiente cambio.
const arpcPattern = { pattern: /\$\d+ ARPC/g, replace: `${money(metrics.arpc)} ARPC` };
const preSeedPattern = { pattern: /\$[\d.,]+K?(?:-\$?[\d.,]+K?)? pre-seed/gi, replace: `${money(metrics.raising_amount)} pre-seed` };
// Titular del slide "The Ask" de los decks HTML. preSeedPattern no lo ve: entre la
// cifra y la palabra "Pre-Seed" hay un </span>, y a veces un " USD" en medio.
// El grupo 2 (" USD") es opcional; si no participa, replace lo sustituye por vacio.
const askHeadlinePattern = { pattern: /(<span class="text-green">)\$[\d.,]+K?(?:&ndash;\$?[\d.,]+K?)?( USD)?(<\/span> Pre-Seed)/g, replace: `$1${money(metrics.raising_amount)}$2$3` };
// El ask suelto en prosa. preSeedPattern exige la palabra "pre-seed" pegada a la
// cifra; en TOUGH-QUESTIONS y PITCH-PRACTICE el monto va solo ("¿Por que $200K?",
// "Los $200K son para", "raising 200K"). Van anclados a la frase concreta A PROPOSITO:
// un patron suelto de "$NNNK" pisaria el sweat equity de $150K y los rangos del
// metodo Berkus del glosario, que NO son el raising.
const raisingProsePatterns = [
  { pattern: /¿Por que \$[\d.,]+K\?/g, replace: `¿Por que ${money(metrics.raising_amount)}?` },
  { pattern: /Los \$[\d.,]+K son para/g, replace: `Los ${money(metrics.raising_amount)} son para` },
  { pattern: /Porque \$[\d.,]+K compran/g, replace: `Porque ${money(metrics.raising_amount)} compran` },
  { pattern: /(We're raising )[\d.,]+K\./g, replace: `$1${lit(metrics.raising_amount)}.` },
];
const valuationPattern = { pattern: /\$[\d.,]+[KM]?(?:-\$?[\d.,]+[KM]?)? pre-money/gi, replace: `${lit(metrics.valuation_premoney)} pre-money` };
const valuationLoosePattern = { pattern: /\$[\d.,]+[KM]?(?:-\$?[\d.,]+[KM]?)? valuation/gi, replace: `${lit(metrics.valuation_premoney)} valuation` };
// Usuarios en prosa ("1,100+ users", "1,050 usuarios"). Minimo 3 digitos para no
// pisar ejemplos del glosario del tipo "5 users".
const usersPattern = { pattern: /\b\d[\d,]{2,}\+? (users|usuarios)\b/gi, replace: `${lit(metrics.users.toLocaleString())} $1` };
// Atletas del slide de traccion. Anclado a "N users and/&middot; N athletes" A PROPOSITO:
// un patron suelto de "N athletes" pisaria los topes de plan ("Up to 200 athletes",
// "Up to 500 athletes") y los ejemplos de moat ("un club con 200 jugadores").
const athletesPattern = { pattern: /([\d,]+\+? users (?:and|&middot;) )[\d,]+\+? athletes/g, replace: `$1${lit(metrics.players.toLocaleString())} athletes` };
// Infraestructura en prosa (ES y EN)
const infraESPattern = { pattern: /\$\d+\/mes en infraestructura/gi, replace: `${money(metrics.infra_cost)}/mes en infraestructura` };
const infraENPattern = { pattern: /\$\d+\/(?:mo|month) (in|on) infra/gi, replace: `${money(metrics.infra_cost)}/mo $1 infra` };

// Traction slide (compartida por deck USA dark y light)
const traccionUSA = [
  { pattern: /\d+\+? active clubs across Colombia/gi, replace: `${metrics.clubs} active clubs across Colombia` },
  { pattern: /\d+ paying annual subscriptions/gi, replace: `${payingClubs} paying annual subscriptions` },
  { pattern: /\d+ clubs paid a full year/gi, replace: `${payingClubs} clubs paid a full year` },
  { pattern: /(<div class="metric-value">)[\d,]+\+?(<\/div>\s*<div class="metric-label">Active Clubs)/g, replace: `$1${metrics.clubs}$2` },
  { pattern: /(<div class="metric-value">)[\d,]+\+?(<\/div>\s*<div class="metric-label">Paying Clubs)/g, replace: `$1${payingClubs}$2` },
  { pattern: /([\d,]+\+?)(<\/div>\s*<div style="font-size: 10px;" class="text-muted">Active clubs<)/g, replace: `${metrics.clubs}$2` },
  { pattern: /([\d,]+\+?)(<\/div>\s*<div style="font-size: 10px;" class="text-muted">Paying \(annual\)<)/g, replace: `${payingClubs}$2` },
];

// Reemplazos completos del deck USA (compartidos por variante dark y light)
const deckUSAReplacements = [
  // Traction
  { pattern: /(\d+)\s*clubs\s*in\s*Colombia/gi, replace: `${metrics.clubs} clubs in Colombia` },
  ...traccionUSA,
  // Revenue projection
  { pattern: /Q1 2026 &middot; \d+ clubs/g, replace: `Q1 2026 &middot; ${metrics.projection_q1_2026_clubs} clubs` },
  { pattern: /(Q1 2026.*?)\$[\d,]+\/mo/g, replace: `$1${money(metrics.projection_q1_2026_mrr.toLocaleString())}/mo` },
  { pattern: /Q2 2026 &middot; \d+ clubs/g, replace: `Q2 2026 &middot; ${metrics.projection_q2_2026_clubs} clubs` },
  { pattern: /(Q2 2026.*?)\$[\d,]+\/mo/g, replace: `$1${money(metrics.projection_q2_2026_mrr.toLocaleString())}/mo` },
  { pattern: /Q3 2026 &middot; \d+ clubs/g, replace: `Q3 2026 &middot; ${metrics.projection_q3_2026_clubs} clubs` },
  { pattern: /(Q3 2026.*?)\$[\d,]+\/mo/g, replace: `$1${money(metrics.projection_q3_2026_mrr.toLocaleString())}/mo` },
  { pattern: /Q4 2026 &middot; \d+ clubs/g, replace: `Q4 2026 &middot; ${metrics.projection_q4_2026_clubs} clubs` },
  { pattern: /(Q4 2026.*?)\$[\d,]+\/mo/g, replace: `$1${money(metrics.projection_q4_2026_mrr.toLocaleString())}/mo` },
  // Unit economics table
  { pattern: /(ARPC[^<]*<\/td><td[^>]*>)\$\d+/g, replace: `$1${money(metrics.arpc)}` },
  { pattern: /(Cost to serve[^<]*<\/td><td[^>]*>)\$\d+/g, replace: `$1${money(metrics.cost_per_club)}` },
  { pattern: /(Gross margin[^<]*<\/td><td[^>]*>)\d+%/g, replace: `$1${metrics.gross_margin}` },
  { pattern: /(LTV \([^)]*\)[^<]*<\/td><td[^>]*>)\$[\d,]+/g, replace: `$1${money(metrics.ltv.toLocaleString())}` },
  { pattern: /(LTV\/CAC ratio[^<]*<\/td><td[^>]*>)\d+x/g, replace: `$1${metrics.ltv_cac_ratio}` },
  // Break-even & infra
  { pattern: /~\d+ clubs/g, replace: `~${metrics.breakeven_clubs} clubs` },
  { pattern: /(DigitalOcean[^<]*<\/td><td[^>]*>)\$\d+/g, replace: `$1${money(metrics.infra_cost)}` },
  { pattern: /(Total infra[^<]*<\/td><td[^>]*>)\$\d+/g, replace: `$1${money(metrics.infra_cost)}` },
  // Usuarios y atletas del slide de traccion (usersPattern primero: athletesPattern
  // se ancla al numero de usuarios ya actualizado)
  usersPattern,
  athletesPattern,
  // Pricing (anclado a las tarjetas de precio; los patrones sueltos tipo /Pro[^$]*\$/ pisaban
  // la tabla de unit economics via "USA projection" y la tarjeta de CAC)
  { pattern: /(>Starter<\/p>\s*<div class="price[^"]*">\$)\d+/g, replace: `$1${metrics.pricing_starter}` },
  { pattern: /(>Pro<\/p>\s*<div class="price[^"]*">\$)\d+/g, replace: `$1${metrics.pricing_pro}` },
  { pattern: /(>Enterprise<\/p>\s*<div class="price[^"]*">\$)\d+/g, replace: `$1${metrics.pricing_club_plus}` },
  // Header de la tabla (los valores son actuales de CO, no proyeccion USA)
  { pattern: /Per-Club Metrics \(USA projection\)/g, replace: 'Per-Club Metrics (current &mdash; Colombia)' },
  // Titular del slide The Ask
  askHeadlinePattern,
];

// ============================================================
// ALL FILES AND THEIR REPLACEMENTS
// ============================================================
const updates = [

  // ===== 1. DECK USA =====
  {
    file: 'decks/usa/deck-usa-widdo.html',
    replacements: deckUSAReplacements,
  },

  // ===== 1b. DECK CLUBS USA (deck de VENTAS a clubes, no de inversores) =====
  // Solo pricing. Las tarjetas son <div class="plan-name">NOMBRE</div> seguido de
  // <div class="plan-price">$NNN...; se ancla igual que el deck USA (nombre + precio)
  // para no pisar otras cifras del slide.
  // Mapeo de tiers: STARTER = pricing_starter | GROWTH = pricing_pro | CLUB = pricing_club_plus
  {
    file: 'decks/clubes/deck-widdo-clubs-usa.html',
    replacements: [
      { pattern: /(class="plan-name"[^>]*>BASIC<\/div>\s*<div class="plan-price">\$)\d+/g, replace: `$1${metrics.pricing_starter}` },
      { pattern: /(class="plan-name"[^>]*>PRO<\/div>\s*<div class="plan-price">\$)\d+/g, replace: `$1${metrics.pricing_pro}` },
      { pattern: /(class="plan-name"[^>]*>ENTERPRISE<\/div>\s*<div class="plan-price">\$)\d+/g, replace: `$1${metrics.pricing_club_plus}` },
    ]
  },

  // ===== 2. DECK LATAM =====
  {
    file: 'decks/latam/deck-latam-widdo.html',
    replacements: [
      // Traction (LATAM uses different club count text)
      { pattern: /\d+ clubs? using Widdo/gi, replace: `${metrics.clubs} clubs using Widdo` },
      // LATAM unit economics (uses $29 ARPC, different LTV)
      { pattern: /(ARPC[^<]*<\/td><td[^>]*>)\$\d+/g, replace: `$1${money(latam_arpc)}` },
      { pattern: /(LTV \([^)]*\)[^<]*<\/td><td[^>]*>)\$[\d,]+/g, replace: `$1${money(latam_ltv.toLocaleString())}` },
      { pattern: /(LTV\/CAC ratio[^<]*<\/td><td[^>]*>)\d+x/g, replace: `$1${latam_ltv_cac}` },
      // Break-even LATAM
      { pattern: /~\d+ clubs/g, replace: `~${latam_breakeven} clubs` },
      // Revenue projection LATAM
      { pattern: /Q2 2026 &middot; \d+ clubs/g, replace: `Q2 2026 &middot; ${metrics.projection_q2_2026_clubs} clubs` },
      { pattern: /Q4 2026 &middot; \d+ clubs/g, replace: `Q4 2026 &middot; ${metrics.projection_q4_2026_clubs} clubs` },
      askHeadlinePattern,
    ]
  },

  // ===== 3. PRESENTACION INGLES =====
  {
    file: 'decks/espanol/presentacion-widdo-en.html',
    replacements: [
      { pattern: /(>)\d+(% of sports clubs)/g, replace: `$187$2` },
    ]
  },

  // ===== 4. DECK INVERSORES =====
  {
    file: 'decks/otros/deck-inversores-widdo.html',
    replacements: [
      { pattern: /MRR: \$[\d,]+ USD/g, replace: `MRR: ${money(metrics.mrr.toLocaleString())} USD` },
      usersPattern,
      askHeadlinePattern,
    ]
  },

  // ===== 5. ONE-PAGER USA =====
  {
    file: 'decks/otros/one-pager-widdo-usa.html',
    replacements: [
      { pattern: /(>)150M\+(<)/g, replace: `$1${metrics.athletes_usa}$2` },
      { pattern: /(<div class="value">)\d+\+?(<\/div>\s*<div class="label">Clubs \(CO \+ US\))/g, replace: `$1${metrics.clubs}$2` },
      { pattern: /(<div class="value">)\d+(<\/div>\s*<div class="label">Paying Clubs)/g, replace: `$1${payingClubs}$2` },
      // La cifra vive en su propio <div>, sin la palabra "users" al lado: usersPattern
      // no la ve, hay que anclarla a la etiqueta
      { pattern: /(<div class="value">)[\d,]+\+?(<\/div>\s*<div class="label">Total Users)/g, replace: `$1${lit(metrics.users.toLocaleString())}$2` },
      { pattern: /(<div class="value">)\d+%?(<\/div>\s*<div class="label">Gross Margin)/g, replace: `$1${metrics.gross_margin}$2` },
    ]
  },

  // ===== 6. PITCH SCRIPT =====
  {
    file: 'negocio/pitch/PITCH-SCRIPT.md',
    replacements: [
      clubsPayingEN,
      clubsPagandoES,
      { pattern: /with \d+ clubs paying/gi, replace: `with ${payingClubs} clubs paying` },
      { pattern: /live with \d+ clubs(?! paying)/gi, replace: `live with ${metrics.clubs} clubs` },
      { pattern: /\d+ paying annual subscriptions/gi, replace: `${payingClubs} paying annual subscriptions` },
      mrrPattern,
      usersPattern,
      { pattern: /\$\d+ average revenue/gi, replace: `${money(metrics.arpc)} average revenue` },
      { pattern: /\$\d+ cost to serve/gi, replace: `${money(metrics.cost_per_club)} cost to serve` },
      marginEN,
      { pattern: /LTV-to-CAC ratio is \d+x/gi, replace: `LTV-to-CAC ratio is ${metrics.ltv_cac_ratio}` },
      ltvCacPattern,
      ltvCacInvertedPattern,
      { pattern: /break even at just \d+ clubs/gi, replace: `break even at just ${metrics.breakeven_clubs} clubs` },
      // NO hay patron de churn: la metrica se retiro de metrics.json (ver _churn_removed)
      { pattern: /raising \$[\d.,]+K?(?:-\$?[\d.,]+K?)?(?= in| pre)/gi, replace: `raising ${money(metrics.raising_amount)}` },
      valuationPattern,
      { pattern: /\$\d+K MRR and ready/gi, replace: `${money((metrics.projection_q4_2026_mrr/1000).toFixed(0))}K MRR and ready` },
      { pattern: /reach \d+ paying clubs/gi, replace: `reach ${metrics.projection_q4_2026_clubs} paying clubs` },
      { pattern: /At \d+ clubs/gi, replace: `At ${metrics.projection_q4_2026_clubs} clubs` },
      { pattern: /Starter at \$\d+/gi, replace: `Starter at ${money(metrics.pricing_starter)}` },
      { pattern: /Pro at \$\d+/gi, replace: `Pro at ${money(metrics.pricing_pro)}` },
      { pattern: /Club\+ at \$\d+/gi, replace: `Club+ at ${money(metrics.pricing_club_plus)}` },
    ]
  },

  // ===== 7. TOUGH QUESTIONS =====
  {
    file: 'negocio/pitch/TOUGH-QUESTIONS.md',
    replacements: [
      clubsPayingEN,
      clubsPagandoES,
      // OJO: este es el replacement que corrompio el archivo. El "$1" del literal
      // "$101" se leia como el grupo (de )?. money() lo escapa.
      { pattern: /\$[\d,]+ (de )?MRR/gi, replace: `${money(metrics.mrr.toLocaleString())} $1MRR` },
      { pattern: /\d+% (de )?margen/gi, replace: `${metrics.gross_margin} $1margen` },
      marginEN,
      ltvCacPattern,
      ltvCacInvertedPattern,
      arpcPattern,
      preSeedPattern,
      valuationPattern,
      usersPattern,
      { pattern: /\$\d+K\+? MRR/gi, replace: `${money((metrics.projection_q4_2026_mrr/1000).toFixed(0))}K MRR` },
      { pattern: /\d+\+? clubs,/gi, replace: `${metrics.projection_q4_2026_clubs}+ clubs,` },
      infraESPattern,
      ...raisingProsePatterns,
    ]
  },

  // ===== 8. FOLLOW-UP TEMPLATES =====
  {
    file: 'negocio/pitch/FOLLOW-UP-TEMPLATES.md',
    replacements: [
      clubsPayingEN,
      clubsPagandoES,
      mrrPattern,
      marginEN,
      ltvCacPattern,
      ltvCacInvertedPattern,
      preSeedPattern,
      valuationPattern,
      valuationLoosePattern,
      usersPattern,
      arpcPattern,
    ]
  },

  // ===== 9. PITCH PRACTICE =====
  {
    file: 'negocio/pitch/PITCH-PRACTICE.md',
    replacements: [
      clubsPayingEN,
      clubsPagandoES,
      marginEN,
      ltvCacPattern,
      ltvCacInvertedPattern,
      mrrPattern,
      arpcPattern,
      ...raisingProsePatterns,
    ]
  },

  // ===== 10. STARTUP GLOSSARY =====
  {
    file: 'negocio/STARTUP-GLOSSARY.md',
    replacements: [
      { pattern: /\d+ clubs × \$\d+ = \$[\d,]+ MRR/g, replace: `${payingClubs} clubs × ${money(metrics.arpc)} = ${money(metrics.mrr.toLocaleString())} MRR` },
      { pattern: /\$[\d,]+ × 12 = \$[\d,]+ ARR/g, replace: `${money(metrics.mrr.toLocaleString())} × 12 = ${money(metrics.arr.toLocaleString())} ARR` },
      { pattern: /"\$[\d,]+ con \d+ clubs/g, replace: `"${money(metrics.mrr.toLocaleString())} con ${payingClubs} clubs` },
      preSeedPattern,
      // Formulas de las tablas del glosario. Sin anclar a "$59"/"$4": si se anclan
      // al valor vigente, dejan de matchear en cuanto cambia una cifra.
      { pattern: /\(\$\d+ - \$\d+\) \/ \$\d+ = \d+%/g, replace: `(${money(metrics.arpc)} - ${money(metrics.cost_per_club)}) / ${money(metrics.arpc)} = ${metrics.gross_margin}` },
      { pattern: /\$\d+ × 24 meses = \$[\d,]+/g, replace: `${money(metrics.arpc)} × 24 meses = ${money(metrics.ltv.toLocaleString())}` },
      { pattern: /\$[\d,]+ \/ \$\d+ = \d+x/g, replace: `${money(metrics.ltv.toLocaleString())} / ${money(metrics.cac_projected)} = ${metrics.ltv_cac_ratio}` },
      { pattern: /\$\d+ \/ \$\d+ margen/g, replace: `${money(metrics.cac_projected)} / ${money(metrics.arpc - metrics.cost_per_club)} margen` },
      { pattern: /\$\d+ actual \(organico\) \/ \$\d+ proyectado/g, replace: `${money(metrics.cac_current)} actual (organico) / ${money(metrics.cac_projected)} proyectado` },
      { pattern: /~\$\d+\/mes infra/g, replace: `~${money(metrics.infra_cost)}/mes infra` },
      { pattern: /\$\d+\/club \(\d+ clubs\)/g, replace: `${money(metrics.cost_per_club)}/club (${metrics.clubs} clubs)` },
      { pattern: /~\d+ clubs \(con equipo/g, replace: `~${metrics.breakeven_clubs} clubs (con equipo` },
      { pattern: /\$10K \/ \$\d+ = ~[\d,]+ meses/g, replace: `${money('10K')} / ${money(metrics.infra_cost)} = ~${Math.round(10000 / metrics.infra_cost).toLocaleString()} meses` },
    ]
  },

  // ===== 11. DATA ROOM CHECKLIST =====
  {
    file: 'negocio/pitch/DATA-ROOM-CHECKLIST.md',
    replacements: [
      // No dynamic metrics, but keeping entry for future
    ]
  },
];

// ============================================================
// APPLY UPDATES
// ============================================================
let totalChanges = 0;

updates.forEach(({ file, replacements }) => {
  if (replacements.length === 0) return;

  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠ Not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanges = 0;

  replacements.forEach(({ pattern, replace }) => {
    const before = content;
    content = content.replace(pattern, replace);
    if (content !== before) fileChanges++;
  });

  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ ${file} — ${fileChanges} updates`);
    totalChanges += fileChanges;
  } else {
    console.log(`    ${file} — no changes`);
  }
});

// Save recalculated metrics
metrics._updated = new Date().toISOString().split('T')[0];
fs.writeFileSync(
  path.join(__dirname, 'metrics.json'),
  JSON.stringify(metrics, null, 2) + '\n',
  'utf8'
);

console.log(`\n  Total: ${totalChanges} updates across all files`);
console.log(`  metrics.json saved: ${metrics._updated}`);

// ============================================================
// GENERATE PDFs (if --pdf flag)
// ============================================================
if (generatePdfs) {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║         GENERATING PDFs                       ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  const pdfScripts = [
    { name: 'Deck USA (2x rasterized)', script: 'decks/usa/generate-deck-usa.js' },
    { name: 'Deck LATAM', script: 'decks/latam/generate-deck-latam.js' },
    { name: 'Deck Clubs USA (ventas, 2x rasterized)', script: 'decks/clubes/generate-deck-clubs-usa.js' },
    // Deck de VENTAS a organizadores de torneos. Sin reemplazos de metrics.json:
    // el pricing es "Free for organizers, 0% platform fee", no hay tabla de precios.
    { name: 'Deck Tournaments USA (ventas, 2x rasterized)', script: 'decks/torneos/generate-deck-tournaments-usa.js' },
    { name: 'Presentacion ES', script: 'decks/espanol/generate-pdf.js' },
    { name: 'Presentacion EN', script: 'decks/espanol/generate-pdf-en.js' },
  ];

  pdfScripts.forEach(({ name, script }) => {
    const scriptPath = path.join(__dirname, script);
    if (!fs.existsSync(scriptPath)) {
      console.log(`  ⚠ Script not found: ${script}`);
      return;
    }
    try {
      process.stdout.write(`  Generating ${name}...`);
      execSync(`node "${scriptPath}"`, { cwd: __dirname, timeout: 60000, stdio: 'pipe' });
      console.log(' ✓');
    } catch (err) {
      console.log(` ✗ Error: ${err.message.split('\n')[0]}`);
    }
  });

  console.log('\n  All PDFs generated.');
}

// ============================================================
// SUMMARY
// ============================================================
console.log('\n──────────────────────────────────────────────');
console.log('  Usage:');
console.log('    node update-metrics.js        → Update all files');
console.log('    node update-metrics.js --pdf   → Update + regenerate PDFs');
console.log('──────────────────────────────────────────────');
