/**
 * Flechas tipo pincel: cola fina que engorda hacia la punta, como el original.
 * Un stroke de SVG no puede variar de grosor, asi que cada flecha se emite como
 * un path RELLENO construido a partir de una curva de Bezier cubica.
 *
 * Coordenadas en el sistema del lienzo (1600 x 1990).
 */

const B = (p0, p1, p2, p3, t) => {
  const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
           y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
};

const dB = (p0, p1, p2, p3, t) => {
  const u = 1 - t, a = 3 * u * u, b = 6 * u * t, c = 3 * t * t;
  return { x: a * (p1.x - p0.x) + b * (p2.x - p1.x) + c * (p3.x - p2.x),
           y: a * (p1.y - p0.y) + b * (p2.y - p1.y) + c * (p3.y - p2.y) };
};

/** Normal unitaria a la curva en t. */
function normal(p0, p1, p2, p3, t) {
  const d = dB(p0, p1, p2, p3, t);
  const m = Math.hypot(d.x, d.y) || 1;
  return { x: -d.y / m, y: d.x / m };
}

const n = v => Math.round(v * 10) / 10;

/**
 * @param {number[]} c   [x0,y0, x1,y1, x2,y2, x3,y3] curva central; x3,y3 = punta
 * @param {object} o     colaW  grosor en la cola
 *                       cuerpoW grosor justo antes de la cabeza
 *                       cabezaW semi-ancho de la cabeza
 *                       cabezaL fraccion de la curva que ocupa la cabeza (0-1)
 */
function flecha(c, o = {}) {
  const { colaW = 3, cuerpoW = 15, cabezaW = 25, cabezaL = 0.2 } = o;
  const p0 = { x: c[0], y: c[1] }, p1 = { x: c[2], y: c[3] },
        p2 = { x: c[4], y: c[5] }, p3 = { x: c[6], y: c[7] };

  const tb = 1 - cabezaL;              // donde arranca la cabeza
  const PASOS = 26;
  const izq = [], der = [];

  for (let i = 0; i <= PASOS; i++) {
    const t = (i / PASOS) * tb;
    const p = B(p0, p1, p2, p3, t);
    const nv = normal(p0, p1, p2, p3, t);
    // la cola arranca en punta y engorda de forma no lineal (pincel)
    const k = Math.pow(t / tb, 0.65);
    const w = (colaW + (cuerpoW - colaW) * k) / 2;
    izq.push({ x: p.x + nv.x * w, y: p.y + nv.y * w });
    der.push({ x: p.x - nv.x * w, y: p.y - nv.y * w });
  }

  const base = B(p0, p1, p2, p3, tb);
  const nb = normal(p0, p1, p2, p3, tb);
  const punta = p3;
  const alaI = { x: base.x + nb.x * cabezaW, y: base.y + nb.y * cabezaW };
  const alaD = { x: base.x - nb.x * cabezaW, y: base.y - nb.y * cabezaW };
  // el filo trasero se hunde hacia la base: da el corte concavo del original
  const hundir = 0.42;
  const muescaI = { x: base.x + nb.x * cabezaW * hundir + (punta.x - base.x) * 0.12,
                    y: base.y + nb.y * cabezaW * hundir + (punta.y - base.y) * 0.12 };
  const muescaD = { x: base.x - nb.x * cabezaW * hundir + (punta.x - base.x) * 0.12,
                    y: base.y - nb.y * cabezaW * hundir + (punta.y - base.y) * 0.12 };

  const d = [
    `M${n(izq[0].x)} ${n(izq[0].y)}`,
    ...izq.slice(1).map(p => `L${n(p.x)} ${n(p.y)}`),
    `L${n(alaI.x)} ${n(alaI.y)}`,
    `Q${n(muescaI.x)} ${n(muescaI.y)} ${n(punta.x)} ${n(punta.y)}`,
    `Q${n(muescaD.x)} ${n(muescaD.y)} ${n(alaD.x)} ${n(alaD.y)}`,
    ...der.reverse().map(p => `L${n(p.x)} ${n(p.y)}`),
    'Z',
  ].join(' ');

  return `<path d="${d}"/>`;
}

/**
 * Trayectorias calcadas del original (direccion, curvatura y longitud),
 * reapuntadas a la posicion real de cada elemento de esta plantilla.
 * El ultimo par de cada arreglo es la PUNTA.
 */
const FLECHAS = [
  // Documentos -> paso 3: barrido largo hacia abajo-izquierda
  { c: [1150, 548, 1140, 600, 1120, 632, 1074, 650], o: { cuerpoW: 16, cabezaW: 27, cabezaL: 0.26 } },
  // paso 3 -> Autorizacion de datos: casi vertical, leve S
  { c: [466, 760, 460, 810, 470, 856, 486, 896], o: { cuerpoW: 15, cabezaW: 25, cabezaL: 0.24 } },
  // Autorizaciones -> paso 4: casi horizontal, sube al final
  { c: [1186, 806, 1230, 800, 1268, 790, 1306, 784], o: { cuerpoW: 14, cabezaW: 23, cabezaL: 0.26 } },
  // Inscripcion exitosa -> paso 5: baja hacia abajo-izquierda
  { c: [1196, 1046, 1188, 1090, 1170, 1120, 1136, 1146], o: { cuerpoW: 15, cabezaW: 25, cabezaL: 0.26 } },
  // paso 5 -> tarjeta de invitacion: hacia la izquierda, leve curva
  { c: [570, 1130, 530, 1126, 490, 1112, 446, 1096], o: { cuerpoW: 15, cabezaW: 25, cabezaL: 0.24 } },
  // tarjeta de invitacion -> paso 7: baja hacia abajo-derecha
  { c: [446, 1250, 476, 1284, 508, 1304, 546, 1322], o: { cuerpoW: 15, cabezaW: 25, cabezaL: 0.25 } },
  // boton Registrar -> tarjeta de bienvenida: corta y casi horizontal
  { c: [1000, 1484, 1046, 1492, 1094, 1500, 1152, 1510], o: { cuerpoW: 14, cabezaW: 23, cabezaL: 0.28 } },
];

const svgFlechas = () => FLECHAS.map(f => flecha(f.c, f.o)).join('\n      ');

module.exports = { flecha, svgFlechas };
