# Widdo — reel de venta USA

Vertical 1080×1920, 45 s, inglés, sin voz. Se ve sin sonido.

## Colors

- Background base: `#173323`
- Background top: `#20422F`
- Background bottom: `#0E2118`
- Accent: `#00E676`
- Text primary: `#F4FAF6`
- Text secondary: `#A6BFB2`
- Surface (fichas del caos): `#2F5C46` → `#224134`
- Alert: `#FF6B60`

### Superficies de la app (tokens de `lib/app/theme/widdo_theme.dart`)

- Paper `#F3F6F2` · Surface `#FFFFFF` · Muted `#EAF0EA`
- Text primary `#14231C` · row `#1B2B24` · secondary `#5B6B62` · tertiary `#87938C`
- Brand green `#15A44A` · paid `#16A34A` · pending `#D97706` · overdue `#DC2626`
- Deep green `#083123` · forest `#0A3D2C` · neon `#5BE88B`
- Tints: `#F0FDF4` `#DCFCE7` `#FFFBEB` `#FEF3C7` `#FDE68A` `#92400E` `#F8FAFC` `#E7ECE9` `#FEE2E2` `#FECACA`
- Radios: tarjeta 20, hero 24, control 16 (a escala 1,86× dentro del teléfono: 37 / 45 / 30)
- Bordes de fila: 1.5 px

## Typography

- **Plus Jakarta Sans**, único tipo.
- Titular 700, interletrado −.045. Apoyo 500/600.
- **Un solo peso 800 en toda la pieza**: el `0%` del frame 11.
- Suelo de tamaño: 30 px. Por debajo no se lee a tamaño real de móvil.

## Motion

- Energía media. Transición primaria: **blur crossfade** (5 de 8).
- Acento: **directional blur** en los dos cambios de tema (2 de 8).
- Salida: **crossfade** lento (1 de 8).
- Entrada en todos los elementos. Sin salidas salvo la última escena.

## Layout

- El texto vive entre y=420 y y=1400. Debajo lo tapa la interfaz de Instagram y TikTok.
- Las tarjetas no pasan de x=940: a la derecha van los botones de TikTok.

## What NOT to do

- Nada de degradados lineales a pantalla completa: bandean en H.264. Radial + grano.
- Nada de marcas de terceros (WhatsApp, Excel, Sheets). El video puede ir a pauta.
- Nada de campanas de notificación: Widdo **no tiene push configurado**. El aviso es in-app.
- Nada de métricas de Widdo: 9 clubes y 3 pagando. Las cifras en pantalla son de un club ficticio.
- Nada de emoji.
