/**
 * Portadas de los dos artículos de lista de inscripción — español y portugués.
 *
 * Por qué se rehacen: las entregadas decían «Todo listo para empezar» y
 * «Matrícula pronta» con los cuatro puntos marcados. Los dos artículos son
 * listas de lo que hay que hacer **antes** de abrir inscripciones, y su
 * argumento entero es «hazlo bien ahora o lo pagas cada mes hasta el final de
 * temporada». Prometían un estado terminado donde el texto ofrece trabajo por
 * delante: el encuadre contrario.
 *
 * El arreglo es uno solo y es el que cambia el mensaje: **el último punto
 * queda sin marcar**, con la pluma encima. Tres hechos, uno abierto.
 *
 * NO son imágenes generadas por IA como las otras 30 — aquí no hay generador
 * de imágenes. Son composiciones HTML->WebP hechas para encajar en esa
 * familia, con la misma paleta medida sobre las entregadas (casi negro
 * azulado, ámbar cálido, papel crema) y el mismo 1600x900. Comparten lenguaje
 * con la portada inglesa de `../en-automatizar/`.
 *
 *   node contenido/blog/portadas/generadores/listas-inscripcion/generar.js
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PORTADAS = [
  {
    archivo: 'lista-de-inscripcion-temporada-club-deportivo-es-portada.webp',
    titular: 'Antes de abrir',
    resalte: 'inscripciones.',
    nota: 'La temporada entera se decide aquí.',
    lista: 'Inscripciones',
    puntos: [
      { t: 'Tarifas', hecho: true },
      { t: 'Exoneraciones', hecho: true },
      { t: 'Pago automático', hecho: true },
      { t: 'Categorías', hecho: false },
    ],
    pendiente: 'Falta esto',
  },
  {
    archivo: 'checklist-de-matricula-temporada-clube-esportivo-pt-capa.webp',
    titular: 'Antes de abrir',
    resalte: 'a matrícula.',
    nota: 'A temporada inteira se decide aqui.',
    lista: 'Matrícula',
    puntos: [
      { t: 'Valores', hecho: true },
      { t: 'Termos', hecho: true },
      { t: 'Pagamento automático', hecho: true },
      { t: 'Categorias', hecho: false },
    ],
    pendiente: 'Falta isto',
  },
];

const plantilla = (p) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@700;800;900&family=Inter:wght@600;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1600px;height:900px;overflow:hidden;position:relative;
       background:#0b0d12;font-family:'Red Hat Display',sans-serif;color:#F4F1EA}

  .suelo{position:absolute;inset:0;
    background:
      radial-gradient(ellipse 62% 48% at 16% 72%, #573716 0%, transparent 64%),
      radial-gradient(ellipse 60% 50% at 88% 22%, #16233b 0%, transparent 60%),
      linear-gradient(170deg,#0d1017 0%,#090b10 55%,#05070b 100%)}
  .lineas{position:absolute;inset:0;opacity:.07}
  .lineas i{position:absolute;background:#cfd6e0}
  .l1{left:0;right:0;top:62%;height:3px;transform:rotate(-2.5deg)}
  .l2{left:9%;width:3px;top:56%;height:44%;transform:rotate(-2.5deg)}
  .arco{position:absolute;left:-6%;top:52%;width:760px;height:760px;
        border:3px solid #cfd6e0;border-radius:50%;opacity:.07;transform:rotate(-2.5deg)}
  .grano{position:absolute;inset:0;opacity:.16;mix-blend-mode:overlay;
    background-image:radial-gradient(#fff 1px,transparent 1px);background-size:3px 3px}
  .vineta{position:absolute;inset:0;
    background:radial-gradient(ellipse 85% 85% at 50% 45%,transparent 45%,#000 100%);opacity:.75}

  .wrap{position:absolute;inset:0;padding:74px 84px;display:flex;flex-direction:column;justify-content:space-between}
  h1{font-size:78px;line-height:1.03;font-weight:900;letter-spacing:-.035em;max-width:700px}
  h1 em{font-style:normal;color:#F0A23C}
  .nota{font-family:'Inter',sans-serif;font-size:25px;font-weight:600;color:#C9B994;
        border-left:3px solid #F0A23C;padding-left:20px;line-height:1.4;margin-top:36px;max-width:520px}
  .marca{font-size:40px;font-weight:900;letter-spacing:-.035em}

  /* --- la hoja --- */
  .hoja{position:absolute;right:104px;top:118px;width:512px;padding:44px 46px 52px;
        border-radius:6px;transform:rotate(1.2deg);
        background:linear-gradient(162deg,#FBF7EC 0%,#EDE4D2 100%);
        box-shadow:0 40px 90px #000c, inset 0 1px 0 #fff}
  /* La pinza del portapapeles: sin ella la hoja flota y no se lee como papel. */
  .pinza{position:absolute;left:50%;top:-22px;width:168px;height:44px;transform:translateX(-50%);
         border-radius:8px;background:linear-gradient(180deg,#8C929B 0%,#5A606A 60%,#3E434B 100%);
         box-shadow:0 8px 18px #0008}
  .hoja h2{font-size:38px;font-weight:900;color:#151820;letter-spacing:-.02em;
           padding-bottom:20px;border-bottom:2px solid #15182022}
  .punto{display:flex;align-items:center;gap:20px;padding:24px 0;border-bottom:1px solid #15182014}
  .punto .caja{width:34px;height:34px;border-radius:7px;flex:none;position:relative}
  .punto .txt{font-family:'Inter',sans-serif;font-size:25px;font-weight:700;color:#151820}

  /* Hecho: relleno ambar con su marca. */
  .hecho .caja{background:#D98A20;box-shadow:inset 0 -2px 0 #00000022}
  .hecho .caja::after{content:"";position:absolute;left:11px;top:5px;width:9px;height:17px;
                      border:solid #FBF7EC;border-width:0 3.5px 3.5px 0;transform:rotate(45deg)}

  /* Abierto: SOLO borde y el texto mas apagado. Es el punto de toda la imagen. */
  .abierto .caja{border:3px solid #15182055;background:#ffffff66}
  .abierto .txt{color:#15182099}
  .abierto{border-bottom:none}

  /* La etiqueta que nombra lo que falta, para que no se lea como un descuido. */
  .falta{position:absolute;right:-26px;bottom:74px;transform:rotate(-2deg);
         background:#D98A20;color:#1a1205;font-family:'Inter',sans-serif;
         font-size:20px;font-weight:700;padding:11px 20px;border-radius:7px;
         box-shadow:0 12px 26px #0009}

  /* Pluma apoyada sobre el punto abierto. */
  .pluma{position:absolute;left:34px;bottom:-16px;width:330px;height:14px;
         transform:rotate(-6deg);border-radius:7px;
         background:linear-gradient(90deg,#F0D67A 0%,#C9A227 12%,#2b323d 38%,#1b1f27 100%);
         box-shadow:0 14px 28px #000b}
</style></head><body>
  <div class="suelo"></div>
  <div class="lineas"><i class="l1"></i><i class="l2"></i></div>
  <div class="arco"></div>

  <div class="hoja">
    <div class="pinza"></div>
    <h2>${p.lista}</h2>
    ${p.puntos.map((x) => `
      <div class="punto ${x.hecho ? 'hecho' : 'abierto'}">
        <span class="caja"></span>
        <span class="txt">${x.t}</span>
      </div>`).join('')}
    <div class="falta">${p.pendiente}</div>
    <div class="pluma"></div>
  </div>

  <div class="grano"></div>
  <div class="vineta"></div>

  <div class="wrap">
    <div>
      <h1>${p.titular}<br><em>${p.resalte}</em></h1>
      <p class="nota">${p.nota}</p>
    </div>
    <div class="marca">Widdo</div>
  </div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1 });

  for (const p of PORTADAS) {
    // Un solo punto sin marcar. Si algun dia se tocan los datos, esto avisa:
    // con los cuatro marcados la imagen vuelve a decir lo contrario del texto.
    const abiertos = p.puntos.filter((x) => !x.hecho).length;
    if (abiertos !== 1) {
      throw new Error(`${p.archivo}: tiene que quedar exactamente 1 punto sin marcar, hay ${abiertos}`);
    }

    await page.setContent(plantilla(p), { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 400));

    const destino = path.join(__dirname, p.archivo);
    await page.screenshot({ path: destino, type: 'webp', quality: 88 });
    console.log(`  ✓ ${p.archivo}  (${Math.round(fs.statSync(destino).size / 1024)} KB)`);
  }

  await browser.close();
})();
