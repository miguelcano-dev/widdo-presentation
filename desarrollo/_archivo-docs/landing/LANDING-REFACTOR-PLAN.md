<!-- ARCHIVADO 13-ago-2026 — plan de mar-2026 ya superado por la realidad: next-intl, [locale] con en/es/pt, proxy.ts de geodeteccion y ~18 paginas por idioma ya estan en produccion; el plan seguia pidiendo un middleware.ts que Next 16 sustituyo por proxy.ts (que ya existe) -->
<!-- Origen: desarrollo/landing/LANDING-REFACTOR-PLAN.md — sustituido por landing/README.md -->

# Landing Page Refactor: Multi-Country + Multi-Language + SEO

**Fecha:** 2026-03-20
**Estado:** EN PROGRESO
**Objetivo:** Landing unificada en ingles por default, deteccion automatica de pais/idioma, pricing dinamico por pais, SEO optimizado.

---

## Resumen de cambios

| Antes | Despues |
|-------|---------|
| `/` solo español (CO) | `/en/` ingles (default) |
| `/us` ingles hardcodeado | `/es/` español (LATAM) |
| Pricing hardcodeado USD en /us | `/pt/` portugues (Brasil) |
| Sin deteccion de pais | Middleware detecta pais + idioma |
| Terminos solo Ley 1581 CO | Terminos multinacionales C Corp USA |
| Componentes duplicados ES/EN | Componentes unificados con diccionarios |
| Sin hreflang ni alternates | hreflang completo para SEO |

---

## FASE 0: Preparacion y estructura [COMPLETADA ✅]

### 0.1 Instalar dependencias
- [x] `next-intl` 4.8.3 instalado
- [x] Compatible con Next 16.1.6

### 0.2 Crear estructura de directorios
```
src/
  i18n/
    request.ts            ← Config next-intl
    routing.ts            ← Locales soportados + default
  messages/
    en.json               ← Diccionario ingles (COMPLETO)
    es.json               ← Diccionario español
    pt.json               ← Diccionario portugues
  lib/
    countries.ts          ← Config por pais (email, address, showCompetitors, laws)
  middleware.ts           ← Deteccion pais + idioma
```

### 0.3 Configurar next-intl
- [x] `i18n/routing.ts` — locales: ['en', 'es', 'pt'], defaultLocale: 'en'
- [x] `i18n/request.ts` — cargar mensajes por locale
- [x] `next.config.ts` — plugin next-intl + redirects legacy (/us→/en, /terminos→/es/terms)
- [x] `middleware.ts` — detecta pais via `x-vercel-ip-country`, idioma via `Accept-Language`, cookie country

### 0.4 Mapeo pais → idioma
```
US, CA, GB, AU, NZ, IE → en
CO, MX, AR, CL, PE, EC, UY, PY, BO, VE, CR, PA, GT, HN, SV, NI, DO, PR, CU, ES → es
BR → pt
Resto → en (default)
```

---

## FASE 1: Diccionarios de traduccion [COMPLETADA ✅]

### 1.1 Diccionario EN (base completa)
- [ ] `hero` — tagline, subtitle, cta_primary, cta_secondary, badges
- [ ] `trust_bar` — 4 stats (5 Min Setup, Flat Fee, 100% Cloud, 24/7 Support)
- [ ] `ecosystem` — titulo, descripcion, 2 verticales (Clubs + Tournaments). SIN Academy
- [ ] `features` — titulo, subtitulo, 8 features (icon key + title + description)
- [ ] `competition` — titulo, subtitulo, disclaimer, 4 competidores (TeamSnap, SportsEngine, Jersey Watch, Widdo)
- [ ] `benefits` — titulo, subtitulo, 4 benefits
- [ ] `how_it_works` — titulo, subtitulo, 4 pasos
- [ ] `pricing` — titulo, subtitulo, toggle labels, feature labels, cta
- [ ] `faq` — titulo, subtitulo, 8-9 preguntas con respuestas
- [ ] `cta` — titulo, subtitulo, boton, disclaimer
- [ ] `contact` — titulo, subtitulo, labels, placeholders, boton
- [ ] `header` — nav links, logo alt, buttons (Login, Sign Up, Dashboard)
- [ ] `footer` — secciones, links, copyright, legal links
- [ ] `common` — "Get Started", "Request Demo", "Learn More", etc.

### 1.2 Diccionario ES
- [ ] Traduccion completa de EN (mismas keys)
- [ ] FAQ adaptado (menciona moneda local, contexto LATAM)

### 1.3 Diccionario PT
- [ ] Traduccion completa de EN al portugues brasileño
- [ ] FAQ adaptado para Brasil

---

## FASE 2: Configuracion por pais [PENDIENTE]

### 2.1 Archivo `lib/countries.ts`
```typescript
type CountryConfig = {
  code: string;
  name: string;
  locale: string;           // 'en' | 'es' | 'pt'
  currency: string;         // 'USD' | 'COP' | 'MXN' | 'BRL'
  currencySymbol: string;   // '$' | 'R$'
  showCompetitorTable: boolean;
  contactEmail: string;
  address?: string;
  phone?: string;
  whatsapp: string;
  lawName: string;          // Para footer legal
  lawShort: string;         // Para referencia rapida
  schemaOrg: {
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
};
```

### 2.2 Paises configurados
- [ ] US — USD, Orlando FL, hey@widdo.co, COPPA, showCompetitors=true
- [ ] CO — COP, Bogota, soporte@widdo.co, Ley 1581, showCompetitors=false
- [ ] MX — MXN, sin direccion, soporte@widdo.co, LFPDPPP, showCompetitors=false
- [ ] BR — BRL, sin direccion, hey@widdo.co, LGPD, showCompetitors=false
- [ ] AR — USD (dolares), sin direccion, soporte@widdo.co, Ley 25.326
- [ ] CL — USD, sin direccion, soporte@widdo.co, Ley 19.628
- [ ] PE — USD, sin direccion, soporte@widdo.co, Ley 29733
- [ ] EC — USD, sin direccion, soporte@widdo.co, LOPDP
- [ ] ES — EUR, sin direccion, hey@widdo.co, RGPD
- [ ] Default — USD, Orlando FL, hey@widdo.co, COPPA

---

## FASE 3: Middleware de deteccion [PENDIENTE]

### 3.1 `middleware.ts`
- [ ] Leer `x-vercel-ip-country` header (Vercel gratis)
- [ ] Leer `Accept-Language` header como fallback
- [ ] Mapear pais → idioma (ver Fase 0.4)
- [ ] Redirect `/` → `/en/` o `/es/` o `/pt/` segun deteccion
- [ ] Setear cookie `country` para uso client-side
- [ ] NO redirect si ya tiene locale en path (`/en/`, `/es/`, `/pt/`)
- [ ] Manejar bots/crawlers (no redirect, servir default)

### 3.2 Selector manual de idioma
- [ ] Dropdown en Header para cambiar idioma manualmente
- [ ] Guardar preferencia en cookie `preferred-locale`
- [ ] Cookie tiene prioridad sobre deteccion automatica

---

## FASE 4: Reestructurar App Router [PENDIENTE]

### 4.1 Migrar paginas a `app/[locale]/`
- [ ] `app/[locale]/layout.tsx` — layout con locale dinamico, metadata, hreflang
- [ ] `app/[locale]/page.tsx` — landing principal unificada
- [ ] `app/[locale]/terms/page.tsx` — terminos multinacionales
- [ ] `app/[locale]/privacy/page.tsx` — privacidad multinacional
- [ ] `app/[locale]/blog/page.tsx` — blog (si aplica multi-idioma)
- [ ] `app/[locale]/blog/[slug]/page.tsx` — post detail

### 4.2 Redirects para URLs legacy
- [ ] `/us` → `/en/` (301 redirect)
- [ ] `/us/*` → `/en/*` (301 redirect)
- [ ] `/terminos` → `/es/terms` (301 redirect)
- [ ] `/privacidad` → `/es/privacy` (301 redirect)

### 4.3 Paginas de deportes (SEO)
- [ ] `/es/escuelas-futbol` (mantener para SEO español)
- [ ] `/es/clubes-futbol` (mantener para SEO español)
- [ ] `/es/baloncesto`, `/es/natacion`, etc.
- [ ] `/en/soccer-academies` (equivalente EN para SEO)
- [ ] Evaluar si crear paginas de deporte EN o solo ES

### 4.4 Eliminar archivos viejos
- [ ] Eliminar `app/us/` (reemplazado por `app/[locale]/`)
- [ ] Eliminar componentes duplicados en `components/us/` (unificados)
- [ ] Eliminar `app/terminos/` y `app/privacidad/` (movidos a `app/[locale]/terms/` y `privacy/`)

---

## FASE 5: Componentes unificados [PENDIENTE]

### 5.1 Componentes que se unifican (usan diccionario)
- [ ] `Hero.tsx` — recibe `t()` function, renderiza segun locale
- [ ] `TrustBar.tsx` — NUEVO (solo existia en /us, ahora en todos)
- [ ] `Ecosystem.tsx` — NUEVO unificado (Clubs + Tournaments, sin Academy)
- [ ] `Features.tsx` — unificado con diccionario
- [ ] `CompetitorTable.tsx` — NUEVO (solo se muestra si `showCompetitorTable=true`)
- [ ] `Benefits.tsx` — unificado con diccionario
- [ ] `HowItWorks.tsx` — unificado con diccionario
- [ ] `Pricing.tsx` — unificado, fetch API por pais
- [ ] `Faq.tsx` — unificado con diccionario
- [ ] `Cta.tsx` — unificado con diccionario
- [ ] `Contact.tsx` — unificado, email/phone segun pais
- [ ] `Header.tsx` — unificado, nav links del diccionario + selector idioma
- [ ] `Footer.tsx` — unificado, links legales segun pais/ley

### 5.2 Componentes nuevos
- [ ] `LanguageSelector.tsx` — dropdown para cambiar idioma
- [ ] `CountryPricingFetcher.tsx` — server component que fetch pricing por pais

---

## FASE 6: Pricing dinamico [PENDIENTE]

### 6.1 API integration
- [ ] Usar endpoint existente: `GET /api/public/subscription-plans?country={code}`
- [ ] Server component fetch en build/request time
- [ ] Fallback a precios hardcodeados si API falla

### 6.2 Formato de precios por pais
- [ ] US: `$99/mo` (sin decimales)
- [ ] CO: `$69.000/mes` (separador de miles punto)
- [ ] MX: `$1,499/mes` (separador de miles coma)
- [ ] BR: `R$499/mes`
- [ ] Helper `formatPrice(amount, currency, locale)`

### 6.3 CTA de pricing
- [ ] Boton lleva a `/register?plan={slug}&billing={cycle}&country={code}`
- [ ] El registro detecta pais y pre-selecciona plan

---

## FASE 7: SEO completo [PENDIENTE]

### 7.1 Metadata por locale
- [ ] `title` traducido por idioma
- [ ] `description` traducido por idioma
- [ ] `keywords` por idioma (investigar keywords EN, ES, PT)
- [ ] `og:title`, `og:description`, `og:image` por idioma
- [ ] `twitter:title`, `twitter:description` por idioma

### 7.2 hreflang tags (CRITICO para SEO internacional)
```html
<link rel="alternate" hreflang="en" href="https://widdo.co/en/" />
<link rel="alternate" hreflang="es" href="https://widdo.co/es/" />
<link rel="alternate" hreflang="pt" href="https://widdo.co/pt/" />
<link rel="alternate" hreflang="x-default" href="https://widdo.co/en/" />
```

### 7.3 Sitemap multi-idioma
- [ ] Generar sitemap con alternates por locale
```xml
<url>
  <loc>https://widdo.co/en/</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://widdo.co/en/" />
  <xhtml:link rel="alternate" hreflang="es" href="https://widdo.co/es/" />
  <xhtml:link rel="alternate" hreflang="pt" href="https://widdo.co/pt/" />
</url>
```

### 7.4 Schema.org por pais
- [ ] Organization schema con address del pais
- [ ] SoftwareApplication schema con pricing del pais
- [ ] FAQPage schema con preguntas del idioma
- [ ] BreadcrumbList schema

### 7.5 Canonical URLs
- [ ] Cada pagina apunta a su propia URL como canonical
- [ ] Evitar contenido duplicado entre locales

### 7.6 Robots.txt
- [ ] Permitir indexacion de todas las versiones de idioma
- [ ] Sitemap reference actualizado

### 7.7 Open Graph images
- [ ] Imagen OG para EN (ingles)
- [ ] Imagen OG para ES (español)
- [ ] Imagen OG para PT (portugues)
- [ ] Alt text en cada idioma

---

## FASE 8: Terminos y privacidad multinacionales [PENDIENTE]

### 8.1 Estructura legal
- [ ] Entidad: Widdo Inc. (C Corp, Delaware, USA)
- [ ] Operaciones: USA + LATAM (Colombia, Mexico, Argentina, Brasil, Chile, Peru, Ecuador, Uruguay, España)
- [ ] Cada seccion referencia la ley local aplicable

### 8.2 Terminos de servicio (`/[locale]/terms`)
- [ ] Seccion 1: Aceptacion — general, aplica a todos
- [ ] Seccion 2: Descripcion del servicio — misma para todos
- [ ] Seccion 3: Registro y cuenta — misma
- [ ] Seccion 4: Planes y pagos — menciona monedas locales
- [ ] Seccion 5: Uso aceptable — misma
- [ ] Seccion 6: Propiedad intelectual — Widdo Inc.
- [ ] Seccion 7: Proteccion de datos — **POR PAIS** (tabla de leyes)
- [ ] Seccion 8: Limitacion de responsabilidad — ley de Delaware
- [ ] Seccion 9: Modificaciones — 15 dias aviso
- [ ] Seccion 10: Ley aplicable — Delaware, USA (con sometimiento local donde requiera)
- [ ] Seccion 11: Contacto — hey@widdo.co

### 8.3 Politica de privacidad (`/[locale]/privacy`)
- [ ] Responsable: Widdo Inc. (Delaware, USA)
- [ ] Datos recolectados — mismos para todos
- [ ] Finalidades — mismas
- [ ] Base legal — **TABLA POR PAIS** con ley local
- [ ] Compartir datos — procesadores (Stripe, Vercel, Resend)
- [ ] Seguridad — misma
- [ ] Derechos — **POR JURISDICCION** (COPPA, GDPR/RGPD, LGPD, Ley 1581, etc.)
- [ ] Cookies — mismas
- [ ] Retencion — misma
- [ ] Cambios — misma
- [ ] Contacto — hey@widdo.co + DPO si aplica

### 8.4 Tabla de leyes por pais (aparece en terminos y privacidad)
| Pais | Ley | Autoridad | Derechos especificos |
|------|-----|-----------|---------------------|
| US | COPPA, CCPA (California) | FTC | Menores <13 requieren consentimiento parental |
| CO | Ley 1581/2012 | SIC | ARCO + habeas data |
| MX | LFPDPPP | INAI | ARCO |
| AR | Ley 25.326 | AAIP | ARCO |
| BR | LGPD | ANPD | ARCO + portabilidad + anonimizacion |
| CL | Ley 19.628 | Consejo Transparencia | ARCO |
| PE | Ley 29733 | APDP | ARCO |
| EC | LOPDP | SPDP | ARCO |
| ES | RGPD/LOPDGDD | AEPD | ARCO + portabilidad + olvido |
| UY | Ley 18.331 | URCDP | ARCO |

---

## FASE 9: Testing y QA [PENDIENTE]

### 9.1 Tests funcionales
- [ ] Visitar desde IP USA → debe mostrar EN + USD pricing
- [ ] Visitar desde IP Colombia → debe mostrar ES + COP pricing
- [ ] Visitar desde IP Brasil → debe mostrar PT + BRL pricing
- [ ] Visitar desde IP Mexico → debe mostrar ES + MXN pricing
- [ ] Cambiar idioma manualmente → respeta preferencia
- [ ] Bots de Google → reciben contenido sin redirect

### 9.2 Tests SEO
- [ ] Google Search Console: verificar hreflang
- [ ] Validar sitemap multi-idioma
- [ ] Validar Schema.org con Google Rich Results Test
- [ ] Verificar canonical URLs por pagina
- [ ] Verificar Open Graph con Facebook Debugger
- [ ] Lighthouse score > 90 en todas las versiones

### 9.3 Tests de redirects
- [ ] `/us` → 301 → `/en/`
- [ ] `/terminos` → 301 → `/es/terms`
- [ ] `/privacidad` → 301 → `/es/privacy`
- [ ] `/` → 302 → `/en/` o `/es/` segun deteccion

### 9.4 Tests de rendimiento
- [ ] Verificar que diccionarios no aumenten bundle size (server-side only)
- [ ] Verificar que pricing fetch no bloquee render
- [ ] Core Web Vitals ok en todas las versiones

---

## Orden de ejecucion recomendado

1. **FASE 0** — Preparacion (deps, estructura)
2. **FASE 1** — Diccionarios (textos)
3. **FASE 3** — Middleware (deteccion)
4. **FASE 4** — App Router (estructura paginas)
5. **FASE 5** — Componentes unificados
6. **FASE 2** — Config por pais
7. **FASE 6** — Pricing dinamico
8. **FASE 7** — SEO
9. **FASE 8** — Terminos y privacidad
10. **FASE 9** — Testing

---

## Archivos que se ELIMINAN al final

```
src/app/us/                          ← Reemplazado por app/[locale]/
src/components/us/PricingUS.tsx      ← Unificado en Pricing.tsx
src/components/us/FaqUS.tsx          ← Unificado en Faq.tsx
src/components/us/ContactUS.tsx      ← Unificado en Contact.tsx
src/app/terminos/page.tsx            ← Movido a app/[locale]/terms/
src/app/privacidad/page.tsx          ← Movido a app/[locale]/privacy/
```

## Archivos que se CREAN

```
src/middleware.ts
src/i18n/request.ts
src/i18n/routing.ts
src/messages/en.json
src/messages/es.json
src/messages/pt.json
src/lib/countries.ts
src/app/[locale]/layout.tsx
src/app/[locale]/page.tsx
src/app/[locale]/terms/page.tsx
src/app/[locale]/privacy/page.tsx
src/components/landing/TrustBar.tsx
src/components/landing/Ecosystem.tsx
src/components/landing/CompetitorTable.tsx
src/components/landing/LanguageSelector.tsx
```

## Archivos que se MODIFICAN

```
next.config.ts                       ← Plugin next-intl + redirects legacy
src/components/landing/Header.tsx    ← Selector idioma + nav del diccionario
src/components/landing/Footer.tsx    ← Legal links por pais
src/components/landing/Hero.tsx      ← Textos del diccionario
src/components/landing/Features.tsx  ← Textos del diccionario
src/components/landing/Benefits.tsx  ← Textos del diccionario
src/components/landing/HowItWorks.tsx← Textos del diccionario
src/components/landing/Pricing.tsx   ← Fetch por pais + diccionario
src/components/landing/Faq.tsx       ← Textos del diccionario
src/components/landing/Cta.tsx       ← Textos del diccionario
src/components/landing/Contact.tsx   ← Email/phone por pais + diccionario
src/app/sitemap.ts                   ← Multi-locale alternates
src/app/robots.ts                    ← Actualizar sitemap URL
```
