# Fichas de matrícula

| Archivo | Qué es |
|---------|--------|
| `ficha-matricula-baqueros.html` | Ficha REAL de Club Baqueros International Basketball. Es la única versión buena. |
| `ficha-matricula-baqueros.pdf` | PDF generado con `node generate-ficha-matricula.js`. |
| `ficha-registro-widdo.html` | Ficha genérica de registro con marca Widdo (no de un club concreto). |

## La plantilla genérica no existe (13-ago-2026)

`ficha-matricula-clubes.html` decía ser la plantilla genérica, pero era **byte-idéntica** a la de
Baqueros —mismo `<title>`, mismo logo, mismos datos del club— así que no servía para ningún otro
club. Quedó archivada en `_archivo-negocio/clubes/`.

**Cuando se necesite una ficha para otro club**, regenerarla partiendo de la de Baqueros:

1. Copiar `ficha-matricula-baqueros.html` con el nombre del club nuevo.
2. Cambiar el `<title>` (línea 6) y el nombre del club en el encabezado.
3. Sustituir `logo-baqueros.png` por el logo del club.
4. Revisar los campos específicos del club (categorías, valores de matrícula y mensualidad).
5. Generar el PDF adaptando `generate-ficha-matricula.js`, que hoy tiene la ruta de Baqueros
   fijada a mano en las líneas 11 y 22.

Alternativa recomendada para clubes nuevos: la infografía de inscripción parametrizada de
`clubes/plantilla-inscripcion/` (lee `clubes.json`, ya soporta varios clubes).
