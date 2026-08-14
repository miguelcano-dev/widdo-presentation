# Widdo USA — Progreso de Implementacion

> **Ejecuta:** Claude Code con agentes en paralelo
> **Regla:** Cada fase se marca solo cuando esta 100% funcional
> **Spec tecnico:** `USA-TECHNICAL.md`
> **Ultima auditoria:** 13 Ago 2026

---

## Estado General

```
Fases 0-7 (hasta demo):   8/8 completadas  ▓▓▓▓▓▓▓▓▓▓ 100%
Fases 8-10 (post-demo):   3/3 completadas  ▓▓▓▓▓▓▓▓▓▓ 100%
Fase 11 (ongoing):        0/7 (11.3 parcial) ░░░░░░░░░░ 0%

i18n: 14,389 keys en 37 namespaces (en / es / pt-BR en paridad exacta)
Build: ✅ Exitoso
```

> **Stripe:** integrado ✅ / live ❌ — produccion sigue en `sandbox`. Pasar a llaves
> live es el **Gate 0** del lanzamiento USA (en curso). Ver Fase 4.

> **Medicion i18n (13-ago-2026):** `ls frontend/src/i18n/locales/en/ | wc -l` → 37 ficheros
> (= namespaces); conteo de hojas del JSON en los 3 idiomas → 14.389 en cada uno
> (`en`, `es`, `pt-BR` dan el mismo numero, o sea paridad completa).

---

## Ronda 0 — Suscripciones & Limites ✅

### Fase 0: Suscripciones, Limites y Payment Methods

| # | Tarea | Estado | Notas |
|---|-------|--------|-------|
| 0.1 | Plan → modulos | ✅ YA EXISTIA | `enabled_modules` JSON en `bas_subscription_plans` |
| 0.2 | Migracion bas_payment_methods_by_country | ✅ | Tabla + modelo `BasPaymentMethodByCountry` |
| 0.3 | Seeder modulos por plan | ✅ YA EXISTIA | `SubscriptionPlansSeeder.php` |
| 0.4 | Seeder payment methods CO + USA | ✅ | CO (6 metodos) + USA (5 metodos) |
| 0.5 | Validar max_members | ✅ YA EXISTIA | `ChecksSubscriptionLimits` trait |
| 0.6 | CheckModuleAccess en rutas | ✅ YA EXISTIA | 11 grupos de rutas protegidos |
| 0.7 | PUT admin plans/modules | ✅ | `SubscriptionPlanController@updateModules` |
| 0.8 | GET payment methods por pais | ✅ | `BasCountryStateCityController@paymentMethodsByCountry` |
| 0.9 | Grace period 7 dias | ✅ | `PlaSubscription::isInGracePeriod()` + middlewares actualizados |
| 0.10 | Super Admin override modulos | ✅ | Tabla `pla_club_module_overrides` + controller + 3 endpoints |
| 0.11 | Admin UI toggle modulos | ✅ | Verificado en SubscriptionPlansPage |
| 0.12 | ModuleGuard.jsx | ✅ YA EXISTIA | `ModuleGuard` + `UpgradePrompt` |
| 0.13 | Sidebar modulos bloqueados | ✅ YA EXISTIA | `MenuList.jsx` con candado |
| 0.14 | Banner trial | ✅ YA EXISTIA | `TrialBannerStrip.jsx` |
| 0.15 | Pantalla limite alcanzado | ✅ | Backend 403 + frontend `UpgradePrompt` migrado a i18n |

---

## Ronda 1 — Config base ✅

### Fase 1: USA Country Config

| # | Tarea | Estado |
|---|-------|--------|
| 1.1 | Seeder USA en bas_countries | ✅ |
| 1.2 | Seeder 50 estados + DC + territorios | ✅ |
| 1.3 | Seeder document types USA | ✅ |
| 1.4 | Seeder payment methods USA | ✅ (en Fase 0.4) |
| 1.5 | countryFeatures.js | ✅ |
| 1.6 | AddressFields.jsx adaptivo | ✅ |
| 1.7 | dateUtils.js multi-locale | ✅ |
| 1.8 | currencyUtils.js + useCurrency hook | ✅ |
| 1.9 | Seed deportes en ingles (name_en) | ✅ |

**Extras:** `useCountryFeatures` hook, `country_short_name` agregado a respuestas del backend (listClub + club detail).

### Fase 2: i18n Infraestructura (JSONs Estaticos)

| # | Tarea | Estado |
|---|-------|--------|
| 2.1 | Instalar i18next + react-i18next | ✅ |
| 2.2 | Estructura i18n/locales/es + en | ✅ |
| 2.3 | Configurar i18n/index.js | ✅ |
| 2.4 | TranslationProvider.jsx | ✅ |
| 2.5 | check-translations.js (falla build si falta key) | ✅ |
| 2.6 | ESLint plugin i18next | ✅ |
| 2.7 | Backend lang files (validation, emails, notifications, api) | ✅ |
| 2.8 | Import i18n en main.jsx | ✅ |

---

## Ronda 2 — Features core ✅

### Fase 3: Traducciones Criticas

| # | Tarea | Estado |
|---|-------|--------|
| 3.1 | selectOptions.js → get*Options(t) | ✅ |
| 3.2 | MenuList.jsx → t('menu:key') | ✅ |
| 3.3 | roles.js → getRoleLabels(t) | ✅ |
| 3.4 | modules.js → getModuleLabels(t) | ✅ |
| 3.5 | paymentStatusConfig.js → i18n | ✅ |
| 3.6 | statusConfigs.js → i18n | ✅ |
| 3.7 | Permisos → i18n | ✅ |
| 3.8 | Auth Pages (Login, Register, Forgot, Reset) | ✅ |
| 3.9 | 6 Dashboards (Owner, Trainer, Player, Parent, Accountant, SuperAdmin) | ✅ |
| 3.10 | Players (lista, grid, detalle) | ✅ |
| 3.11 | Layouts (TopBar, Sidebar, PrivateLayout) | ✅ |
| 3.12 | Payments, Charges, Discounts | ✅ |
| 3.13 | Calendar + Events + Sessions + Attendance | ✅ |
| 3.14 | Onboarding | ✅ |

### Fase 4: Stripe Connect Payment Gateway — integrado ✅ / live ❌ (Gate 0 en curso)

> **Estado real:** el codigo esta completo y funcionando —
> `saas_sport/app/Services/Payments/StripeGateway.php`,
> `StripeConnectService.php`, webhooks reales y registro en `PaymentGatewayFactory`.
> **Pero produccion sigue en `sandbox`**: `StripeCountryPaymentConfigSeeder.php:59`
> decide el entorno por el prefijo de la llave (`sk_live_` → `production`, si no
> `sandbox`), y hoy son llaves de test. **Hasta que no haya llaves live no se cobra
> un dolar real.** Ese salto es el **Gate 0** del lanzamiento USA.
>
> Stripe es la **UNICA** pasarela para USA/Canada/Mexico. Wompi y MercadoPago
> quedaron descartados por decision de negocio (el codigo sigue en el repo, sin uso
> en USA). Config y credenciales: `saas_sport/docs/PAYMENTS-STRIPE.md`.

| # | Tarea | Estado |
|---|-------|--------|
| 4.1 | stripe/stripe-php instalado | ✅ |
| 4.2 | Migracion pla_stripe_accounts | ✅ |
| 4.3 | config/stripe.php | ✅ |
| 4.4 | StripeGateway.php (PaymentGatewayInterface) | ✅ |
| 4.5 | StripeConnectService.php | ✅ |
| 4.6 | Registrar en PaymentGatewayFactory | ✅ |
| 4.7 | Webhook handler (handleStripe) | ✅ |
| 4.8 | Ruta /api/webhooks/stripe | ✅ |
| 4.9 | Seeder Stripe gateway | ✅ |
| 4.10 | application_fee_percent en planes | ✅ |
| 4.11 | StripeConnectController (4 endpoints) | ✅ |
| 4.12 | StripeConnectPage.jsx (frontend) | ✅ |
| 4.13 | StripeCheckout.jsx (embedded payments) | ✅ |
| 4.14 | SubscriptionPage → Stripe redirect | ✅ |
| 4.15 | Menu item Stripe Connect (usaOnly) | ✅ |
| 4.16 | **Llaves live en produccion (Gate 0)** | ⬜ **BLOQUEANTE** — sigue en `sandbox` |

### Fase 6 Backend: Compliance

| # | Tarea | Estado |
|---|-------|--------|
| 6.1 | Migracion pla_club_teams_compliance_types | ✅ |
| 6.2 | Migracion pla_club_teams_compliance_items | ✅ |
| 6.3 | Modelos con ProtectedModel + scopes + accessors | ✅ |
| 6.4 | ComplianceController (11 endpoints) | ✅ |
| 6.5 | Rutas con module.access:compliance | ✅ |
| 6.6 | ComplianceTypesSeeder (7 defaults USA) | ✅ |
| 6.7 | compliance:check-expirations command (diario 7am) | ✅ |
| 6.8 | MODULE_COMPLIANCE en CheckModuleAccess | ✅ |

---

## Ronda 3 — UI features ✅

### Fase 5: Enrollment + Waivers

| # | Tarea | Estado |
|---|-------|--------|
| 5.1 | PublicEnrollmentPage adaptada por pais | ✅ |
| 5.2 | Migracion pla_club_teams_waiver_templates | ✅ |
| 5.3 | Migracion pla_club_teams_signed_waivers | ✅ |
| 5.4 | Modelos PlaWaiverTemplate + PlaSignedWaiver | ✅ |
| 5.5 | WaiverTemplatesSeeder (5 templates legales EN) | ✅ |
| 5.6 | WaiverController (7 endpoints) | ✅ |
| 5.7 | PublicEnrollmentController adaptado (waivers) | ✅ |
| 5.8 | SignatureCanvas.jsx (HTML5 touch/mouse) | ✅ |
| 5.9 | WaiverSigningFlow.jsx (paso a paso) | ✅ |
| 5.10 | WaiverTemplatesPage.jsx (admin CRUD) | ✅ |
| 5.11 | Menu item Waiver Templates (usaOnly) | ✅ |

### Fase 6 Frontend: Compliance UI

| # | Tarea | Estado |
|---|-------|--------|
| 6.8 | ComplianceDashboardPage.jsx (metricas + semaforo) | ✅ |
| 6.9 | ComplianceAthleteDetailPage.jsx (upload + approve/reject) | ✅ |
| 6.10 | CoachCredentialsPage.jsx | ✅ |
| 6.11 | ComplianceSettingsPage.jsx (CRUD tipos) | ✅ |
| 6.12 | 4 rutas en App.jsx con guards | ✅ |
| 6.13 | Menu Compliance con 3 subitems (usaOnly) | ✅ |
| 6.14 | Namespace compliance (65 keys ES + EN) | ✅ |

---

## Ronda 4 — Verificacion ✅

### Fase 7: Seed Demo + Verificacion

| # | Tarea | Estado |
|---|-------|--------|
| 7.1 | USADemoClubSeeder (The Academy CFL, Orlando) | ✅ |
| 7.2 | 30 atletas con nombres americanos | ✅ |
| 7.3 | Compliance items mix (green/yellow/red) | ✅ |
| 7.4 | USASetupSeeder (master, ejecuta 7 seeders en orden) | ✅ |
| 7.5 | USAVerificationSeeder (15+ checks automaticos) | ✅ |
| 7.6 | Frontend build exitoso | ✅ |
| 7.7 | i18n ES ↔ EN en sync | ✅ |
| 7.8 | Colombia no se rompe (items usaOnly filtrados) | ✅ |
| 7.9 | Fix bug: WaiverTemplatesPage import incorrecto | ✅ |

---

## Post-Demo ✅

### Fase 8: Traducciones Restantes

| # | Tarea | Estado |
|---|-------|--------|
| 8.1 | Categories + Trainers → namespaces | ✅ |
| 8.2 | Sessions + Venues → namespaces | ✅ |
| 8.3 | Parent Portal → namespace | ✅ |
| 8.4 | Player Portal | ✅ (cubierto en players namespace) |
| 8.5 | Settings + Club Config → namespace | ✅ |
| 8.6 | Documents + FileVault + Inventory | ✅ |
| 8.7 | Tournaments → namespace | ✅ |
| 8.8 | Subscription + Referrals → namespace | ✅ |
| 8.9 | Super Admin pages → namespace | ✅ |
| 8.10 | Backend: lang/en/validation.php | ✅ |
| 8.11 | Backend: lang/en/emails.php | ✅ |
| 8.12 | Backend: lang/en/notifications.php | ✅ |
| 8.13 | Backend: lang/en/api.php | ✅ |

### Fase 9: NCAA Eligibility Tracker

| # | Tarea | Estado |
|---|-------|--------|
| 9.1 | Migracion pla_club_teams_ncaa_eligibility | ✅ |
| 9.2 | Migracion pla_club_teams_ncaa_core_courses | ✅ |
| 9.3 | Migracion pla_club_teams_college_interests | ✅ |
| 9.4 | 3 modelos con ProtectedModel | ✅ |
| 9.5 | NcaaEligibilityController (13 endpoints) | ✅ |
| 9.6 | MODULE_NCAA en CheckModuleAccess | ✅ |
| 9.7 | NcaaEligibilityTab.jsx (GPA + courses + interests) | ✅ |
| 9.8 | Tab NCAA en player detail (usaOnly) | ✅ |
| 9.9 | Menu item NCAA Eligibility (usaOnly) | ✅ |
| 9.10 | Namespace ncaa (120+ keys ES + EN) | ✅ |

### Fase 10: Tryout Management

| # | Tarea | Estado |
|---|-------|--------|
| 10.1 | Migracion pla_club_teams_tryouts | ✅ |
| 10.2 | Migracion pla_club_teams_tryout_registrations | ✅ |
| 10.3 | 2 modelos con ProtectedModel | ✅ |
| 10.4 | TryoutController (9 endpoints autenticados) | ✅ |
| 10.5 | PublicTryoutController (2 endpoints publicos) | ✅ |
| 10.6 | TryoutResultMail + template | ✅ |
| 10.7 | TryoutManagementPage.jsx | ✅ |
| 10.8 | TryoutDetailPage.jsx (evaluacion + conversion) | ✅ |
| 10.9 | PublicTryoutPage.jsx (/tryout/:slug) | ✅ |
| 10.10 | Rutas en App.jsx + menu item | ✅ |
| 10.11 | Namespace tryouts (80+ keys ES + EN) | ✅ |

---

## Fase 11: Features Avanzados (Ongoing, no iniciado)

| # | Feature | Estado | Prioridad |
|---|---------|--------|-----------|
| 11.1 | NIL tracking (Florida HB 981) | ⬜ | Alta si hay demanda |
| 11.2 | Unidades imperial (ft/in, lbs) | ⬜ | Media |
| 11.3 | Recruiting profile publico | 🟡 PARCIAL | Media |
| 11.4 | National Sports ID API | ⬜ | Baja |
| 11.5 | Ticketing para eventos | ⬜ | Baja |
| 11.6 | Transportation coordination | ⬜ | Baja |
| 11.7 | Fundraising tools | ⬜ | Baja |

**11.3 — que existe ya (verificado 13-ago-2026):**

| Pieza | Evidencia |
|-------|-----------|
| Endpoint para marcar el perfil como publico | `PATCH pla_club_teams/{club}/players/{playerId}/public-profile` → `saas_sport/routes/api.php:839` (`players.toggle-public-profile`) |
| Metodo del controlador | `saas_sport/app/Http/Controllers/PlaClubTeamPlayerController.php:655` (`togglePublicProfile`) |
| Cliente frontend | `frontend/src/services/playerApiService.js:111` |
| Modulo de trayectoria del jugador | `saas_sport/routes/api.php:2232-2234` (`PlayerCareerController`: `myCareer`, `show`, `tournaments`) + `frontend/src/pages/profile/PlayerCareerPage.jsx` |

**Lo que FALTA para cerrarlo como ✅:** las rutas de trayectoria estan bajo
autenticacion (el propio `api.php:2231` las rotula «Player career (private —
authenticated only)») y no hay ninguna ruta publica sin auth que sirva el perfil,
ni pagina publica en el frontend. O sea: el interruptor existe, la vitrina no.
Un recruiter externo hoy no puede abrir nada.

**Los otros ⬜ de Fase 11 siguen sin empezar** — verificado por busqueda:
`grep -rln "nil_" saas_sport/app saas_sport/database/migrations` no devuelve nada
(11.1 NIL), y no hay helper de unidades imperiales en `frontend/src/helpers`
ni `frontend/src/utils` (11.2).

---

## Metricas Finales

### Backend (saas_sport/)
| Categoria | Cantidad |
|-----------|----------|
| Migraciones nuevas | ~15 |
| Modelos nuevos | ~15 |
| Controllers nuevos | ~10 |
| Seeders nuevos | 8 + 1 master |
| Archivos modificados | ~20 |
| Archivos lang (en + es) | 8 |

### Frontend (frontend/)
| Categoria | Cantidad |
|-----------|----------|
| Paginas/componentes nuevos | ~25 |
| Archivos migrados a i18n | 62 (cifra de mar-2026, no re-medida) |
| Keys i18n totales | 14,389 por idioma (13-ago-2026) |
| Namespaces | 37 (13-ago-2026) |
| Idiomas | en / es / pt-BR (paridad exacta: 14.389 en los tres) |
| Dependencias nuevas | 5 (i18next, react-i18next, stripe-js, react-stripe-js, eslint-plugin-i18next) |

### Credenciales Demo USA
```
Owner: academy_owner@theacademycfl.com / Password123!
Club: The Academy CFL (Orlando, FL)
Sport: Basketball
Categorias: Varsity, JV, Middle School, Youth Dev, Elite
30 jugadores, 5 entrenadores, compliance items mixtos
```

---

## Bugs Encontrados y Corregidos

| Bug | Archivo | Fix |
|-----|---------|-----|
| Import incorrecto api | WaiverTemplatesPage.jsx | `@/services/api` → `@/services/axiosInstance` |
| Import default vs named | TryoutManagementPage.jsx, TryoutDetailPage.jsx | `import apiService from` → `import { apiService } from` |
| country_short_name faltante | routes/api.php, PlaClubTeamController.php | Agregado al response de listClub y club detail |

---

## Log de Ejecucion

| Fecha | Ronda | Fase | Accion | Resultado |
|-------|-------|------|--------|-----------|
| 15 Mar 2026 | - | - | Auditoria completa del codebase | ✅ |
| 16 Mar 2026 | 0+1 | 0,1,2 | Backend gaps + country config + i18n infra (3 agentes paralelo) | ✅ |
| 16 Mar 2026 | 2 | 3,4,6BE | Traducciones + Stripe + Compliance backend (3 agentes paralelo) | ✅ |
| 16 Mar 2026 | 3 | 5,6FE | Enrollment/Waivers + Compliance UI (2 agentes paralelo) | ✅ |
| 16 Mar 2026 | 4 | 7 | Seed demo + verificacion (1 agente) | ✅ |
| 16 Mar 2026 | post | 8,9,10 | Traducciones restantes + NCAA + Tryouts (3 agentes paralelo) | ✅ |
| 16 Mar 2026 | - | - | Migracion masiva i18n: 62 archivos, 3323 keys (3 agentes paralelo) | ✅ |
| 16 Mar 2026 | - | - | Fix bugs (imports, country_short_name) | ✅ |
| 16 Mar 2026 | - | - | Build final exitoso + i18n sync verificado | ✅ |
| Abr–Ago 2026 | - | - | **Este log se quedo atras.** El detalle real de todo lo que se hizo de abril a agosto esta en el `git log` de `saas_sport/` y `frontend/`, no aqui. Para saber que paso: `git -C saas_sport log --oneline --since=2026-04-01` y lo mismo en `frontend/`. No confies en esta tabla para nada posterior a marzo | ⚠️ |
| 13 Ago 2026 | - | - | Auditoria de documentacion: Stripe re-etiquetado integrado/no-live (Gate 0), i18n re-medido (14.389 keys / 37 ns / +pt-BR), 11.3 pasado a parcial con evidencia, borrada la linea muerta de branch/commits | ✅ |
