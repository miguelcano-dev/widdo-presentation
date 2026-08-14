# Plan SEO — qué falta de verdad

> Reescrito el 29-jul-2026 tras verificar la arquitectura real.
> Las dos versiones anteriores partían de suposiciones equivocadas sobre la infraestructura. Esta parte de lo comprobado.

---

## La arquitectura real: tres frentes, no uno

| Dominio | Qué es | Dónde vive | Repositorio |
|---|---|---|---|
| **widdo.co** | Landing en Next.js (App Router) | **Vercel** (`server: Vercel`, ISR activa) | `widdo-landing` |
| **app.widdo.co** | La aplicación, SPA de React + Vite | **Netlify**, con prerenderizado `react-snap` | `weddo_frontend` |
| **api.widdo.co** | Backend Laravel 11 | DigitalOcean, despliegue por GitHub Actions | `saas_sport` |

---

## Lo que YA está hecho (y es bastante)

**En el Next.js de widdo.co:**
- Rutas `[locale]/tournaments/[slug]` y `[locale]/tournaments/[slug]/[city]` — **directorio por deporte y por ciudad**, en vivo y devolviendo 200.
- `generateMetadata()` completo: Open Graph, Twitter Card, canonical y **hreflang en `en`, `es` y `pt`**.
- `dynamicParams = true` + `generateStaticParams()` + revalidación ISR.
- Nueve deportes con página propia: `soccer`, `basketball`, `volleyball`, `swimming`, `tennis`, `baseball`, `football`, `martial_arts`, `skating`. **Ojo: los slugs son en inglés**, aunque la URL lleve el prefijo `/es/`.
- Páginas de captación ya escritas: `escuelas-futbol` con variantes de Chile, Argentina y México, `escolinha-de-futebol` en portugués, `clubes-futbol`, `ligas`, `baloncesto`, `natacion`, `patinaje`, `artes-marciales`, `youth-soccer-club-software`, `minor-hockey-club-software`.
- Datos estructurados en la portada, redirecciones permanentes de las rutas de autenticación hacia app.widdo.co.

**En la SPA de app.widdo.co:** prerenderizado con `react-snap` para 8 rutas, y un `_redirects` bien pensado que separa rutas de SPA de rutas prerenderizadas.

**Conclusión: la infraestructura de SEO no hay que construirla. Está construida.**

---

## Lo que falta, en orden

### 1. La columna `slug` en el backend (bloqueante, es el fallo real)

El Next.js pide `GET /api/public/directory/tournaments/{slug}` (`landing/src/lib/tournamentsApi.ts:223`). El backend lo resuelve así (`PublicTournamentDirectoryController.php:275-281`):

```php
->orWhere('name', 'LIKE', '%'.str_replace('-', '%', $slug).'%');
```

**El frontend pide por slug; el backend adivina por parecido de nombre.** No existe columna `slug` en `pla_tournaments` ni en `pla_club_teams`.

Consecuencias reales, no teóricas:
- `copa-bogota` se convierte en `%copa%bogota%`: con "Copa Bogotá" y "Copa Bogotá Sub-15" sirve la primera que salga — **y la ISR cachea la página equivocada**.
- Si el organizador renombra el torneo, el enlace que ya repartió deja de resolver.
- Un `LIKE` que empieza por comodín no usa índice: escaneo de tabla en cada visita.
- `[slug]` está sobrecargado (`page.tsx:32`): primero mira si es un deporte, si no cae a torneo. **Un torneo que se llame como un deporte queda invisible para siempre.** Con slug real se resuelve reservando esos nueve nombres.

Trabajo en curso en la rama `feature/seo-slug-publico` del backend.

### 2. Quitar el `noindex` (tres pasos ya documentados)

`landing/src/app/[locale]/tournaments/layout.tsx` pone `robots: index:false, follow:false` en todo `/tournaments` y sus subrutas. **Fue una decisión correcta**: la sección corría con datos de prueba y no se indexa contenido falso.

El propio archivo deja escrito qué hacer para reactivarlo:
1. Eliminar ese `noindex` (o el layout entero).
2. Volver a añadir las URLs en `src/app/sitemap.ts`.
3. Añadir el enlace de Torneos en el menú (`Header.tsx`).

El commit `c46c269 feat(tournaments): wire directory to real API` indica que ya consume la API real. **Falta confirmar que devuelve torneos de verdad y no listas vacías.**

### 3. El requisito que no es técnico

El `noindex` dice "hasta consumir torneos reales". Esa es la condición de verdad, y **no se resuelve programando**.

Indexar un directorio de torneos vacío es peor que no indexarlo: Google aprende que esas páginas no tienen contenido y cuesta meses revertirlo. **Antes de quitar el `noindex` hace falta masa crítica de torneos reales en el sistema.**

Lo cual devuelve la pelota al plan de 30 días: vender, meter clubes, correr torneos. **El SEO se desbloquea con ventas, no con código.**

### 4. Página pública de partido con imagen para compartir (lo de más valor pendiente)

No existe. Y es la pieza que sirve para dos cosas a la vez:
- El padre comparte el resultado por WhatsApp y sale una tarjeta con el marcador y los escudos, no un enlace pelado. **WhatsApp no ejecuta JavaScript**, así que las etiquetas tienen que venir en el HTML inicial.
- Google la indexa.

**Va en el Next.js**, junto a las rutas de torneo que ya existen: ahí `generateMetadata` ya funciona y Next.js genera imágenes Open Graph de forma nativa. No hay que montar nada nuevo, es añadir una ruta.

---

## Orden recomendado

1. **Slug en el backend** (en curso). Desbloquea la calidad de todo lo demás.
2. **Comprobar que el directorio devuelve torneos reales**, no listas vacías.
3. **Vender y meter torneos.** Es el requisito de fondo del punto 3.
4. **Quitar el `noindex`** cuando haya masa crítica: los tres pasos ya documentados.
5. **Página de partido con imagen** para WhatsApp y Google.
6. Sitemap y Search Console al día.

---

## Cómo se mide

Una cifra al mes: **visitas orgánicas**. Hoy, con `/tournaments` en `noindex`, la parte de torneos aporta cero por diseño.

Realista: **de 3 a 6 meses** desde que se quita el `noindex` hasta ver tráfico. Por eso el punto 3 (tener torneos reales) es urgente aunque no lo parezca: cada mes de retraso es un mes que no empieza a contar.

---

## Errores de las versiones anteriores de este documento

Anotados para no repetirlos:
- Se dijo que no había despliegue automático del frontend. **Falso**: Netlify y Vercel despliegan solos al hacer push.
- Se dijo que había que decidir cómo hacer renderizado en servidor. **Ya estaba decidido**: Next.js en Vercel para la landing, react-snap para la SPA.
- Se dijo que no había páginas por ciudad. **Existen** desde antes de este análisis.
- Se dijo que no existía el slug. **La ruta y el contrato existen**; lo que falta es la columna que los respalde.

Lección: había tres repositorios y se analizaron dos. Antes de afirmar que algo falta, mirar los tres.
