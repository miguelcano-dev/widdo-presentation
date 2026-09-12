# Perfil de la página de Widdo en LinkedIn

Portada, logo y tagline. Todo lo que afirma la portada está **verificado contra producción**
el 18-ago-2026, no redactado a ojo.

## Qué subir

| Campo de LinkedIn | Archivo |
|---|---|
| Portada | `widdo-linkedin-banner-dark-4512x764.png` (o la variante `light`, ver abajo) |
| Logotipo | `widdo-logo-linkedin-800.png` (circular) o `widdo-logo-square-800.png` (cuadrado) |
| Eslogan | `The AI-native operating system for youth sports clubs — dues, attendance, parents.` |

**Sube siempre el de 4512x764.** Los de 2256x382 se estiran y se ven pixelados: en pantalla
Retina LinkedIn muestra la portada a más de 1128 px CSS. Cada PNG tiene su `.jpg` q96 al
lado por si LinkedIn ensucia el PNG al recomprimir.

## Variantes de portada

| Archivo | Cuándo |
|---|---|
| `...-dark-4512x764.png` | La principal. Máximo contraste en el feed blanco de LinkedIn |
| `...-light-4512x764.png` | Si molesta el recuadro blanco del logo (ver abajo) |
| `...-dark-sinchip-4512x764.png` | Sin el chip de IA de la derecha |

## 🪤 El recuadro blanco detrás del logo

**LinkedIn convierte el logo a JPEG, y JPEG no tiene canal alfa.** Aplana contra blanco
siempre. Subir un PNG transparente **no** quita el recuadro — se comprobó subiéndolo y
descargándolo de vuelta. Solo hay dos salidas:

1. **Portada clara** (`...-light-*.png`): el recuadro deja de contrastar. De regalo, sobre
   fondo claro el verde correcto es `#16A34A`, el mismo del logo, así que portada y marca
   quedan del mismo verde.
2. **Logo cuadrado a sangre** (`widdo-logo-square-800.png`): verde de borde a borde, sin
   nada que aplanar. Conserva la portada oscura a costa de cambiar el círculo por un cuadrado.

⏳ **Decisión abierta:** cuál de las dos. Si se elige la 2, falta generar el cuadrado en
`#00C853` para que no choque con el verde de la portada oscura.

## Restricciones del formato (no negociables)

- Lienzo **1128x191**. El logo tapa de **x 0 a x 190 desde y 95** — por eso el texto arranca en x 232.
- En móvil se recortan los lados: todo lo esencial vive entre **x 225 y x 902**.
- El tablero `Preview.dc.html` del lienzo dibuja las dos zonas para comprobarlo.

## Regenerar

```bash
node build.js     # regenera los .dc.html y los render-*.html desde banner-core.js
node export.js    # exporta los PNG y JPG en todos los tamaños
node logo-shoot.js  # regenera el logo circular transparente
```

El arte real vive en **`banner-core.js`** — es la fuente única del banner y de las tres
variantes. `build.js` la usa para el lienzo y `export.js` para los archivos finales.

Lienzo editable: https://claude.ai/code/artifact/b5205c0e-5144-4b5d-a227-49c949a897a4

## Qué afirma la portada y dónde se verificó

| Afirmación | Verificación |
|---|---|
| `0% platform fee` | `TournamentPaymentService` no envía `application_fee_amount`; la rama del 3% de `StripeGateway` exige un `connected_account_id` que ningún llamador pasa |
| `33 sports, basketball to cheer` | `GET api.widdo.co/api/sports` → 33 activos, 30 con `popular_us`. Basketball es el #1 en USA (29,7 M, SFIA 2025); soccer es el #3 (14,1 M) |
| `AI-native` y el chip | `getDebtorsSummary`, `sendPaymentReminder`, `runCollectionCycle` existen en el agente en producción |
| La pregunta del chip | Mismo escenario que el hero de widdo.co (`landing/src/messages/en.json`, bloque `demo`) |

⏳ **Pendiente:** el chip dice `U15 team`, notación de fútbol. En USA basketball, baseball y
softball escriben `14U`. Viene copiado del hero de widdo.co — cambiarlo obliga a cambiarlo
en los dos sitios.
