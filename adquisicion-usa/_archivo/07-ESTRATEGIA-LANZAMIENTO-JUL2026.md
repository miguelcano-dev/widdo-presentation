<!-- ARCHIVADO 13-ago-2026 — L99 "NUNCA enviar frío desde widdo.co" contradice el canal vigente — sustituido por MOTOR/RUNBOOK.md -->
> ⚠️ **DOC ARCHIVADO (13-ago-2026).** Su regla de "NUNCA enviar en frío desde widdo.co" **contradice el canal vigente**: hoy se envía por Brevo con sender `miguel@widdo.co`, con DKIM verificado por DNS.
> **Vigente: `../MOTOR/RUNBOOK.md`.** Los gates de lanzamiento vivos están en `../LANZAMIENTO-GO-NOGO.html`.

# Estrategia de Lanzamiento USA — Julio 2026

> Sesión 20 jul 2026. Consolidado de: evidencia técnica (tests corridos hoy), informe growth (canales/SEO/casos verificados) e informe ventas (outreach/stack/límites legales).
> **Checklist ejecutable con gates:** `LANZAMIENTO-GO-NOGO.html` (ese se revisa a diario; este doc es la referencia completa).

---

## ▶️ Cómo retomar esto en otra sesión de Claude

Abrir Claude en `Widdo/desarrollo` (o en `Widdo/`) y pegar:

```
Lee adquisicion-usa/LANZAMIENTO-GO-NOGO.html y
adquisicion-usa/07-ESTRATEGIA-LANZAMIENTO-JUL2026.md.
Dime en qué gate estoy, qué falta exactamente para cerrarlo,
y ejecuta el siguiente paso que puedas hacer tú.
```

Variantes según lo que toque ese día:

| Situación | Qué pedir |
|---|---|
| Cerrar Gate 0 | `Ayúdame a cerrar Gate 0: dime paso a paso qué hago en Stripe y corre los tests de pagos para confirmar que sigue todo verde.` |
| Empezar outreach (Gate 1) | `Estoy en Gate 1. Prepárame los 10 prospectos de hoy de 00-LISTA-MAESTRA-FLORIDA.md (Tier 1, los que usan Google Forms primero) con su borrador personalizado listo para enviar.` |
| Revisar avance semanal | `Revisemos la semana contra los criterios de los gates: cuántos contactos, replies, demos y cierres llevo, y si paso de gate o repito.` |
| Contenido / SEO | `Estoy en Gate 3. Escribe la página "GotSport alternative" y la de "software para ligas de futbol" según la sección 3 del doc de estrategia.` |
| Programar agentes nocturnos | `Programa la rutina nocturna: research-ligas + enrich-prospecto + draft-outreach para que cada mañana tenga 10-15 prospectos listos.` |

La memoria del proyecto (`memory/lanzamiento-usa-gonogo-jul2026.md`) ya apunta a estos dos archivos, así que aunque no pegues nada, Claude puede encontrarlos preguntándole por "el lanzamiento USA".

---

## 0. Decisiones tomadas por Miguel (20 jul)

- **Modo DIRIGIDO, no masivo:** emails 1-a-1 personalizados desde buzón normal + LinkedIn manual. Sin Instantly/dominios secundarios/warm-up hasta Gate 3 en GO (ahorra ~$250/mes y 6 semanas).
- **Meta = 1000 CUENTAS pagando** (no usuarios finales). Expectativa realista: 30-50 cuentas en 6 meses, 150-300 en 12, 1000 en 24-36 meses con flywheel de torneos + deals de ligas. 1000 cuentas × $99-349 = $100K-350K MRR ($1.2M-4M ARR); benchmark SaaS bueno = 2-3 años solo para $1M ARR.
- Multideporte amplía el techo pero NO cambia la física de adquisición: el cuello de botella es cierres/semana, no TAM. Ganar el nicho (torneos juveniles FL) primero — mensaje hiperespecífico convierte 3-5x más (modelo Jersey Watch).

## 1. Evidencia técnica (corrida 20 jul 2026, local)

| Flujo | Tests | Resultado |
|---|---|---|
| Suscripciones clubes (compra, lifecycle, plan change, webhooks, dunning, expiración, límites, consentimiento, force-Stripe) | 36 | ✅ 36/36 |
| Torneos backend (checkout Connect, registro gratis, degradación sin pago, CRUD organizador, API pública, lifecycle) | 24 | ✅ 24/24 |
| E2E Playwright torneos (journey usuario→campeón, crear, registro club, vista jugador, scheduling, **pago Stripe Connect real con 4242**) | 6 | ✅ 6/6 (2.0 min) |

- Keys actuales: `pk_test`/`sk_test`; `PAYMENTS_FORCE_STRIPE=true`.
- Fix aplicado (local, sin commit): `ForceStripeGlobalTest` actualizado a precio Básico CO $69.000 COP (seeder cambió en `4e5ba1f` sin actualizar test).
- Pendiente conocido: ruta SPA `/organizer/stripe-connect` da 404 (no bloquea cobrar; sí el onboarding de organizadores).

**Para cobrar en vivo (Gate 0, manual Miguel ~1-2h):** live keys en .env prod → cuenta live Dashboard (business Orlando, fiscal) → webhook con signing secret live → verificación identidad Connect → branding/emails recibo → 2 smoke tests reales reembolsados (club $1 + fee torneo).

## 2. Casos verificados y tácticas (informe growth)

**Caso ancla: Jersey Watch** — mismo nicho exacto (gestión orgs deportivas juveniles), fundada 2012, ~$27M revenue 2025 con solo $1.07M levantado. Bootstrapped + founder-led. El vertical se construye sin quemar capital.

Principios verificados (YC Sales Playbook, Salespipe, ForumVC):
1. Los primeros 10-20 clientes los cierra el founder a mano; el objetivo es documentar un playbook repetible.
2. Intros calientes convierten 5-10x más que frío → pedir intro al final de CADA conversación.
3. **Regla 10-10-10:** 10 prospectos de alta intención contactados cada día; señal real en 30-45 días.
4. Precio en firme desde la primera llamada (error #1 = regalar por miedo). Gancho: "0% platform fee, money straight to your account, 15-min setup".
5. Grabar cada demo → objeciones al FAQ de la landing.
6. Un solo target primero (torneos juveniles FL); expandir con playbook probado. Motion repetible real: 9-18 meses.

Priorizar prospectos con Google Forms/Excel (dolor máximo, cero lock-in) sobre usuarios de GotSport/SportsEngine.

## 3. Canales orgánicos (compone en 6-12 semanas, NO trae clientes mañana)

### Primeras 72h
- Landing: pricing visible + checkout + Calendly + prueba social clubes CO + hero 0% fee.
- LinkedIn founder: perfil + primer post build-in-public (B2B deportivo vive en LinkedIn, no en X).
- Unirse a 5-8 grupos FB youth sports FL sin vender (incl. hispanos: "Liga de futbol Orlando", "Torneos de futbol Florida" — segmento casi sin competencia). Verificados: Elite Youth Tournaments Spring Hill FL, FYSA (fysa.com), NAYS West Palm Beach.
- Directorios gratis día 1: **G2 y Capterra** (G2 absorbió Capterra/Software Advice/GetApp = "G2 Digital Markets"; listing gratis; 100% de tools citadas por ChatGPT tenían Capterra). Product Hunt solo por backlink/credibilidad (no da leads de este nicho). Saltar TrustRadius/Gartner hasta revenue enterprise.

### Semanas 1-4
- **Video corto bilingüe** 3-4/sem (mismo guion EN+ES, TikTok/Reels/Shorts). Métrica = DMs de admins, no views.
- **Reddit evergreen (lo más valioso):** NO promo — comentar útil en hilos que ya rankean en Google (`"GotSport alternative" reddit`, `LeagueApps fees reddit`...). 61% de subreddits prohíben autopromo; r/SaaS = 1 vez/60 días. Promo permitida: r/SideProject, r/IndieBiz, r/AlphaAndBetaUsers. Comunidad genuina: r/BasketballCoaching, r/Coaching, r/youthsports.
- LinkedIn build-in-public 2-3 posts/sem.

### SEO — prioridad de páginas (volúmenes sin verificar, validar con Ahrefs/SEMrush)
1. **"GotSport alternative"** (crear PRIMERO — intención de compra ya) · "SportsEngine alternative" · "LeagueApps/TeamSnap alternative"
2. **"software para ligas de futbol"** y **"plataforma para torneos en español"** — NICHO VACÍO = ventaja injusta bilingüe (crear PRIMERO también)
3. `tournament management software` (pilar) · `youth sports registration software` · `free tournament bracket software` (imán leads)

Competidores que rankean: PlayMetrics, LeagueApps, TeamSnap, Jersey Watch, Tournify.

## 4. Outreach y motor 24/7 (informe ventas)

### Secuencia (drafts completos en `TANDA-1-FLORIDA-DRAFTS.md` + guiones en `01-GUIONES-OUTREACH.md`)
4 toques: email frío (2 variantes: **A** Google Forms/Excel "collecting tournament fees by hand?"; **B** GotSport/Playbook "keep what your platform was skimming") + 2 follow-ups + toque LinkedIn día 5. Toque 1 sin enlaces; opt-out "reply STOP"; <120 palabras; CAN-SPAM (nombre real + dirección física + baja).

### Stack para Gate 4 (volumen — NO antes)
| Herramienta | Precio aprox | Nota |
|---|---|---|
| Instantly Hypergrowth | ~$97/mes | Mejor para 1 founder. **Warm-up 4-6 semanas obligatorio** (5→50/día por buzón). 3-4 buzones en 2-3 dominios secundarios |
| Apollo | $59-99/mes | Listas de decisores |
| Hunter | $49/mes | Verificación (bounce 0.9%) |
| Clay | $349/mes | NO hace falta al inicio |

### Límites legales y deliverability (INVIOLABLES)
- **NUNCA enviar frío desde widdo.co** (quema el dominio del negocio). Volumen = dominios tipo getwiddo.com/trywiddo.com con SPF/DKIM/DMARC. Spam rate <0.1%.
- **SMS/WhatsApp frío en USA: NO rotundo.** TCPA = $500-1.500 de multa POR MENSAJE, sin excepción B2B.
- **LinkedIn:** 100 invitaciones/semana (~20-25/día), MANUAL. HeyReach/Expandi no valen el riesgo de baneo con 1 cuenta.
- CAN-SPAM: dirección física real (Widdo Inc. Orlando o CMRA), unsubscribe funcional, subject no engañoso.

### Matemática del pipeline [EST]
- Cold volumen: ~0.4-0.5 cierres por 100 prospectos → 2-5 orgs/semana requiere 100-150 nuevos/día.
- Dirigido (modo actual): personalización profunda sube reply del 5% al 15-25% → 10-15/día bastan para 3+ demos/2 semanas (criterio Gate 1).
- Demo→pago founder-led: 20-30% → ~30 cuentas requieren 100-150 demos.
- **FL: ~800-1500 orgs verificables** (FYSA 200+ clubes soccer + AAU basketball + baseball). A ritmo de volumen se agota en 3-5 semanas → GA y TX (TX ya mapeado en `texas/`).

### Rol de agentes autónomos en modo dirigido
Investigación y preparación, NO envío: cada noche dejan 10-15 prospectos enriquecidos (decisor, plataforma actual, torneo reciente) + borrador personalizado → Miguel revisa y envía en 30 min por la mañana. Piezas ya existentes: skills `research-ligas`, `enrich-prospecto`, `draft-outreach` + agentes `widdo-growth`, `widdo-datos`. Programar como rutinas cuando Miguel dé luz verde.

## 5. Multiplicadores hacia 1000 cuentas

1. **Flywheel de torneos** (mejor arma): cada torneo expone Widdo a 20-60 clubes participantes → convertirlos a Widdo Clubs post-evento es venta caliente. 20 torneos/año = 400-1200 clubes que ya probaron el producto.
2. **Deals liga/federación:** 1 deal = 50-200 clubes (modelo Liga Antioquia). 5-10 deals = cientos de cuentas.
3. **Inbound compuesto** (SEO alternative + español): demos solas hacia el mes 6.

## 6. Fuentes principales

ycombinator.com/library/Mo-the-sales-playbook-for-founders · salespipe.co/blog/founder-led-outbound-for-saas-guide-playbook · forumvc.com/thought-pieces/direct-sales-101-for-early-stage-b2b-saas-founders · jerseywatch.com · tracxn.com · oneup.today/blogs/reddit-selfpromo-rules-study-2026 · thesaasdir.com/blog/g2-vs-capterra-vs-trustradius · growthspreeofficial.com/blogs/b2b-saas-conversion-rate-benchmarks-2026 · fysa.com

**Sin verificar (confirmar antes de invertir):** volúmenes exactos de keywords; reglas de cada FB group; reglas actuales r/youthsports.
