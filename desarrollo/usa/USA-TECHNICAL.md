# Widdo USA — Spec Tecnico de Implementacion

> **Enfoque:** Un solo codebase, una sola DB, i18n con JSONs en el repo, multi-country por configuracion del club
> **Ejecucion:** Claude Code con agentes en paralelo, cada fase al 100%
> **Contexto legal:** Ver `USA-COMPLIANCE.md`
> **Contexto de negocio:** Ver `USA-BUSINESS.md`

## Estado real (verificado 13-ago-2026)

Este documento se escribio como PLAN en marzo 2026. **Casi todo esta construido.** Las
auditorias con fecha "15 Mar 2026" que aparecen en cada fase estaban desactualizadas y se
han reemplazado por el estado verificado contra el codigo.

| Fase | Estado verificado | Evidencia |
|------|-------------------|-----------|
| 0 — Suscripciones y limites | ✅ HECHA, en produccion | `CheckModuleAccess.php`, `CheckSubscriptionLimits.php`, `SubscriptionPlansSeeder.php` |
| 1 — USA Country Config | ✅ Hecha | `USStatesSeeder.php`, `USDocumentTypesSeeder.php`, `USACountryConfigSeeder.php`, `frontend/src/constants/countryFeatures.js` |
| 2 — Infra i18n | ✅ Hecha | `frontend/src/i18n/index.js`, `TranslationProvider.jsx`, `scripts/check-translations.js` |
| 3 y 8 — Traducciones | ✅ Hechas | 37 namespaces × 3 idiomas (`en`, `es`, `pt-BR`) |
| 4 — Stripe Connect | ✅ Hecha en codigo · 🔴 **sandbox en produccion** | `StripeGateway.php`, `StripeConnectService.php`. Pasar a live = **Gate 0** del lanzamiento |
| 5 — Enrollment publico + waivers | ✅ Hecha | `PublicEnrollmentPage.jsx`, `WaiverController.php`, `WaiverTemplatesPage.jsx`, `WaiverSigningFlow.jsx` |
| 6 — Compliance Dashboard | ✅ Hecha | `ComplianceController.php` + rutas `module.access:compliance`, `ComplianceDashboardPage.jsx`, `CoachCredentialsPage.jsx` |
| 7 — Seed demo + verificacion E2E | ✅ Seeders hechos · ⏳ verificacion en vivo | `USADemoClubSeeder.php`, `USAVerificationSeeder.php`, `USATournamentsSeeder.php` |
| 9 — NCAA Eligibility | ✅ Hecha | `NcaaEligibilityController.php` + rutas `module.access:ncaa`, `NcaaEligibilityTab.jsx` |
| 10 — Tryouts | ✅ Hecha | `TryoutController.php`, `PublicTryoutController.php`, `TryoutManagementPage.jsx`, `PublicTryoutPage.jsx` |
| 11 — Features avanzados | ⏳ Pendiente | Sin evidencia de NIL, `unitConverter.js` ni perfil publico de atleta |

**Bloqueador unico del lanzamiento USA:** Stripe en modo live (Gate 0). Todo lo demas de
las fases 0-10 esta construido.

### Notas de entorno que evitan re-diagnostico

- **Laravel 12:** no existe `app/Http/Kernel.php`. El scheduler vive en `routes/console.php`
  y el registro de middleware en `bootstrap/app.php`.
- **CI/deploy:** los tests se corren **en local** y el deploy es **directo con push**.
  `tests.yml` esta en `workflow_dispatch` (manual). El unico gate vivo en CI es
  `api-contract.yml`. No tratar CI como bloqueante.
- **Movil:** el cliente movil real es **Flutter** (repo aparte `widdo-mobile-flutter`,
  specs en `desarrollo/mobile_flutter/`). El directorio `mobile/` (React Native) esta
  abandonado.
- **Prefijo de tablas:** el patron es `pla_club_teams_*` para las tablas de negocio por
  club. Este documento usaba nombres pre-rename (`pla_compliance_types`, `pla_tryouts`…)
  que **ya no existen**; se corrigieron contra las migraciones reales.

---

## Arquitectura General

```
UN SOLO CODEBASE (main) — UN SOLO DEPLOY — UNA SOLA DB
│
├── Club se registra → selecciona pais → country_id determina TODO
│
├── Pais = Colombia (ya funciona)
│   ├── Idioma: ES
│   ├── Moneda: COP, 0 decimales
│   ├── Docs: CC, TI, CE, NIT, Pasaporte
│   ├── Pagos: Stripe (Wompi/MercadoPago = codigo legacy, NO se ofrece)
│   ├── Direccion: Departamento → Municipio → Barrio
│   └── Compliance: NO (countryFeatures.CO.compliance = false)
│
├── Pais = USA (implementado)
│   ├── Idioma: EN
│   ├── Moneda: USD, 2 decimales
│   ├── Docs: Driver's License, Passport, Birth Certificate, State ID
│   ├── Pagos: Stripe (Credit Card, ACH) — 🔴 en sandbox, pasar a live = Gate 0
│   ├── Direccion: Street → City → State → ZIP Code
│   └── Compliance + NCAA: CONFIGURABLE por club
│
└── Pais = Brasil (parcial)
    ├── Idioma: PT-BR (37 namespaces traducidos)
    ├── Moneda: BRL
    ├── Pagos: Stripe
    └── Compliance/NCAA: NO
```

**Pasarela de pagos:** Stripe es la **UNICA** pasarela ofrecida (USA, Canada, Mexico y el
resto de paises de `StripeGatewaySeeder.php`). Wompi y MercadoPago quedaron **descartados
por decision de negocio**: `WompiGateway.php` y `MercadoPagoGateway.php` siguen en el repo
como codigo legacy, pero no se presentan como opciones activas ni se documentan como tales.
Doc canonico: `saas_sport/docs/PAYMENTS-STRIPE.md`.

**Modulos por pais:** el gating por modulo NO depende del pais sino de la suscripcion — ver
"Politica comercial vs gating tecnico" mas abajo. Lo que si depende del pais es la
VISIBILIDAD en la UI: `frontend/src/constants/countryFeatures.js` marca `compliance: true`
y `ncaa: true` solo para `US`, asi que el menu de Compliance/NCAA no aparece en clubes CO
o BR aunque el plan los tenga habilitados.

## Infraestructura

```
Landing:   widdo.co, widdo.co/us    → Vercel (ya esta)
App:       app.widdo.co             → Droplet DO (UNA sola instancia)
API:       api.widdo.co             → Droplet DO (UN solo backend)
MySQL:     mismo cluster DO         → UNA sola DB (widdo)
Frontend:  servido desde Droplet con Nginx
Costo extra: $0

NO crear us.widdo.co, api-us.widdo.co, ni DB separada.
El pais del club (country_id) determina idioma, moneda, compliance, pasarela, formatos.
```

---

## Resumen de Fases

> Tabla historica del plan original. El estado real de cada fase esta arriba, en
> "Estado real (verificado 13-ago-2026)".

| Fase | Nombre | Duracion | Prioridad |
|------|--------|----------|-----------|
| **0** | **Suscripciones & Limites** | **2-3h** | ✅ **HECHA** |
| 1 | USA Country Config + Adaptaciones por pais | 3-4 dias | CRITICA |
| 2 | i18n Infraestructura (DB + JSON + admin + frontend) | 5-7 dias | CRITICA |
| 3 | Traducciones — Constantes + Paginas criticas para demo | 5-7 dias | CRITICA |
| 4 | Stripe Connect Payment Gateway (Marketplace) | 2-3 dias | CRITICA |
| 5 | Public Enrollment Page + Waiver Templates + Waivers digitales | 3-4 dias | CRITICA |
| 6 | Compliance Dashboard (configurable por club) | 5-7 dias | ALTA |
| 7 | Seed data demo + Verificacion end-to-end | 1-2 dias | ALTA |
| 8 | Traducciones — Restantes (backend, emails, admin, portales) | 5-7 dias | MEDIA |
| 9 | NCAA Eligibility Tracker | 5-7 dias | MEDIA |
| 10 | Tryout Management | 3-4 dias | MEDIA |
| 11 | Features avanzados USA (NIL, recruiting, imperial units) | Ongoing | BAJA |

---

## Estrategia de Ejecucion (Agentes en Paralelo)

### Grafico de dependencias

```
RONDA 0 (✅ COMPLETADA — suscripciones en produccion):
  └── Agente: FASE 0 (Suscripciones, limites, payment methods, ModuleGuard)

RONDA 1 (en paralelo, cuando Ronda 0 termina):
  ├── Agente A: FASE 1 (Country Config + seeders + formularios)
  └── Agente B: FASE 2 (i18n infra: tabla + servicio + controller + i18next + admin UI)

RONDA 2 (en paralelo, cuando Fase 1 y 2 terminan):
  ├── Agente A: FASE 3 (Traducciones criticas ~480 strings + seeder)
  ├── Agente B: FASE 4 (Stripe Connect marketplace completo)
  └── Agente C: FASE 6 backend (Compliance migraciones + modelos + controller)

RONDA 3 (en paralelo, cuando Fases 3 y 4 terminan):
  ├── Agente A: FASE 5 (Enrollment publico + waiver templates editables + waivers digitales)
  └── Agente B: FASE 6 frontend (Compliance dashboard + coach credentials + settings + alertas + IA tools)

RONDA 4 (secuencial, cuando todo lo anterior termina):
  └── FASE 7 (Seed demo + verificacion end-to-end + fix bugs)

POST-DEMO (en paralelo):
  ├── Agente A: FASE 8 (Traducciones restantes ~300 strings)
  ├── Agente B: FASE 9 (NCAA Eligibility Tracker)
  └── Agente C: FASE 10 (Tryout Management)
```

### Estimacion con agentes paralelos (revisada 15 Mar 2026)

| Ronda | Fases | Estimacion | Acumulado | Notas |
|-------|-------|-----------|-----------|-------|
| 0 | Fase 0 (solo gaps) | ~2 horas | 2h | 90% ya implementado |
| 1 | Fase 1 + Fase 2 (paralelo) | ~4 horas | 6h | Fase 2 reducida: JSONs estaticos vs DB |
| 2 | Fase 3 + Fase 4 + Fase 6 backend (paralelo) | ~5 horas | 11h | Fase 3 = extraer strings a JSONs |
| 3 | Fase 5 + Fase 6 frontend (paralelo) | ~5 horas | 16h | |
| 4 | Fase 7 seed + verificacion + fixes | ~3 horas | 19h | |
| **Total hasta demo** | **Fases 0-7** | **~19 horas** | | |
| Post-demo | Fase 8 + 9 + 10 (paralelo) | ~8 horas | 27h | |
| **Total completo** | **Fases 0-10** | **~27 horas** | | |

### Riesgos
- Leer codigo existente para entender patrones (~1-2h por fase, ya incluido)
- Conflictos entre agentes editando archivos compartidos (MenuList.jsx, routes/api.php)
- Bugs de integracion entre fases (descubiertos en Fase 7)

### Regla de completitud: 100% por fase
Cada fase se marca SOLO cuando:
- Backend: migraciones, modelos, controllers, servicios, rutas — TODO funcional
- Frontend: paginas, componentes, hooks — TODO funcional
- Traducciones: strings extraidos, seeder con ES+EN, JSONs generados
- Integracion: flujo completo funciona end-to-end
- NO se deja nada pendiente dentro de una fase

---

## RONDA 0 — Suscripciones & Limites ✅ HECHA

Prerequisito: Ninguno. **Estado: completada y en produccion.** Ya no es un blocker.

### Politica comercial vs gating tecnico (leer antes de tocar planes)

Son dos cosas distintas y el documento original las confundia:

**Politica comercial (lo que se vende):** el precio depende de la **CANTIDAD DE JUGADORES**
(`max_members`), NO de los modulos contratados. Todos los modulos van abiertos a todos los
planes; la unica palanca comercial es el limite de jugadores.

| Plan | USD/mes | `max_members` |
|------|---------|---------------|
| Starter (`basico`) | $99 | 80 |
| Pro (`pro`) | $199 | 200 |
| Enterprise (`enterprise`) | $349 | 500 |

Anual: paga 12 meses, recibe 13. Verificado en
`saas_sport/database/seeders/SubscriptionPlansSeeder.php` (9900 / 19900 / 34900 centavos USD).

**Gating tecnico (lo que el codigo puede hacer):** el mecanismo de modulos **SI existe y
sigue vivo**. `enabled_modules` (JSON en `bas_subscription_plans`) alimenta el middleware
`module.access:*`, aplicado a 11 grupos de rutas en `routes/api.php` — entre ellos
`module.access:compliance` y `module.access:ncaa`. En frontend lo consumen `ModuleGuard.jsx`
y `MenuList.jsx` via `hasModule()`.

⚠️ **Desalineacion viva a resolver:** `SubscriptionPlansSeeder.php` todavia reparte
`enabled_modules` DISTINTOS por plan — p. ej. `compliance` y `ncaa` solo estan en
Enterprise, y `tournaments`/`reports` no estan en Basico. Eso contradice la politica
comercial de "todos los modulos abiertos". No se toca desde este documento (es codigo, no
doc), pero **antes de vender Starter a un club USA hay que decidir**: o se abren todos los
modulos en los tres planes en el seeder, o el discurso comercial deja de decir "todos los
modulos incluidos". Hoy un club USA en Starter NO veria Compliance ni NCAA.

### Fase 0: Suscripciones, Limites y Payment Methods — ✅ COMPLETA

> **Verificacion 13-ago-2026:** todos los gaps que este documento listaba como pendientes
> estan cerrados (detalle abajo).

**YA IMPLEMENTADO (no tocar):**

| # | Tarea | Implementacion actual |
|---|-------|----------------------|
| 0.1 | Plan → modulos | ✅ `enabled_modules` JSON en `bas_subscription_plans` (no se necesita tabla separada `bas_plan_modules`). Ojo: es el mecanismo TECNICO, no la politica de precio — ver arriba |
| 0.3 | Seeder modulos por plan | ✅ `SubscriptionPlansSeeder.php` — 3 planes con enabled_modules y precios CO + USD |
| 0.5 | Validar max_members | ✅ `ChecksSubscriptionLimits` trait en PlayerController + `CheckSubscriptionLimits` middleware |
| 0.6 | CheckModuleAccess en rutas | ✅ Middleware `module.access` en `bootstrap/app.php`, aplicado a 11 grupos de rutas |
| 0.12 | ModuleGuard.jsx | ✅ `components/guards/ModuleGuard.jsx` + `UpgradePrompt.jsx` |
| 0.13 | Sidebar con candado | ✅ `MenuList.jsx` usa `hasModule()` del SubscriptionContext |
| 0.14 | Banner trial | ✅ `TrialBannerStrip.jsx` — cyan (trial) / amber (expirado) |

**Archivos clave existentes:**
- `saas_sport/app/Http/Middleware/CheckModuleAccess.php` — 14 modulos definidos, core modules siempre enabled
- `saas_sport/app/Http/Middleware/CheckSubscriptionLimits.php` — Valida members/trainers/categories
- `saas_sport/app/Http/Controllers/Traits/ChecksSubscriptionLimits.php` — Trait usado en controllers
- `saas_sport/app/Models/BasSubscriptionPlan.php` — hasModule(), allowsMore*(), getLimit()
- `saas_sport/app/Models/PlaSubscription.php` — isActive(), isTrial(), hasModule(), scopes
- `frontend/src/context/SubscriptionContext.jsx` — hasModule(), canAddResource(), hasActiveSubscription()
- `frontend/src/components/subscription/TrialBannerStrip.jsx`
- `frontend/src/components/guards/ModuleGuard.jsx`

**GAPS QUE ESTE DOC LISTABA COMO PENDIENTES — TODOS CERRADOS:**

| # | Tarea | Estado verificado |
|---|-------|-------------------|
| 0.2 | Migracion `bas_payment_methods_by_country` | ✅ Tabla creada (`Schema::create('bas_payment_methods_by_country')`) |
| 0.4 | Seeder payment methods CO + USA | ✅ `database/seeders/PaymentMethodsByCountrySeeder.php` |
| 0.7 | Endpoint PUT modulos por plan | ✅ `PUT /api/.../subscription-plans/{id}/modules` → `SubscriptionPlanController@updateModules` (`routes/api.php` L1510) |
| 0.8 | Endpoint metodos de pago por pais | ✅ `GET /api/countries/{countryId}/payment-methods` → `BasCountryStateCityController@paymentMethodsByCountry` (`routes/api.php` L723) |
| 0.9 | Grace period 7 dias | ✅ `PlaSubscription::gracePeriodEndsAt()` + `CheckModuleAccess` devuelve header `X-Grace-Period-Days-Remaining` |
| 0.10 | Override de modulos por club | ✅ Tabla `pla_club_module_overrides` + lectura en `CheckModuleAccess` |
| 0.11 | Admin UI: toggle modulos por plan | ✅ Respaldado por el endpoint `updateModules` (0.7) |
| 0.15 | Frontend maneja limite alcanzado | ✅ `ModuleGuard.jsx` + `UpgradePrompt.jsx` |

**Verificacion Fase 0 — completa:**
- [x] Modulos asignados a planes via enabled_modules JSON
- [x] Tabla bas_payment_methods_by_country creada y seeded (CO + USA)
- [x] max_members se valida al crear jugador → error si excede plan
- [x] Middleware CheckModuleAccess bloquea rutas de modulos no incluidos en plan
- [x] Super Admin puede editar modulos por plan (PUT endpoint)
- [x] Super Admin puede override modulos por club (`pla_club_module_overrides`)
- [x] Sidebar muestra candado en modulos bloqueados
- [x] Banner trial visible cuando corresponde
- [x] Grace period funciona: 7 dias antes de bloqueo
- [x] Pantalla "limite alcanzado" aparece correctamente en frontend

---

## FASE 1: USA Country Config + Adaptaciones por Pais

**Prerequisitos:** Ninguno

> **ESTADO VERIFICADO 13-ago-2026: ✅ HECHA.** La auditoria anterior ("~5% implementado,
> no existe countryFeatures.js") era falsa.
>
> Verificado: `frontend/src/constants/countryFeatures.js` existe con las tres entradas
> `CO`, `US` y `BR` (address fields, compliance, ncaa, unitSystem, dateFormat,
> currencyDecimals, phoneFormat, defaultLocale) y el helper `getCountryFeatures()`.
> Seeders USA presentes en `saas_sport/database/seeders/`: `USACountryConfigSeeder.php`,
> `USStatesSeeder.php`, `USDocumentTypesSeeder.php`, `PaymentMethodsByCountrySeeder.php`,
> `USASetupSeeder.php`, `USADemoClubSeeder.php`, `USAVerificationSeeder.php`.
>
> ⏳ **Lo unico sin confirmar de esta fase:** el punto 1.9 (nombres de deportes en ingles).
> Existe el seeder pero **no esta confirmado que se haya corrido en produccion**.

### 1.1 — Seeder USA en `bas_countries`
```
name: United States
country_short_name: US
currency: USD
simbol_currency: $
currency_decimals: 2
decimal_separator: .
thousand_separator: ,
date_format: MM/DD/YYYY
default_tax_rate: 0
tax_name: Sales Tax
timezone: America/New_York
start_of_week: Sunday
phone_code: +1
phone_min_length: 10
phone_max_length: 10
phone_format_example: (555) 123-4567
available: true
payments_enabled: true (cuando Stripe este listo)
```

### 1.2 — Seeder US states
- **Archivo:** `database/seeders/USStatesSeeder.php`
- 50 estados + DC + territorios en `bas_states`

### 1.3 — Seeder US document types
- Via seeder en `bas_types_documents_by_country`: Driver's License, Passport, Birth Certificate, State ID

### 1.4 — Seeder US payment methods
- Credit Card, Debit Card, Bank Transfer (ACH), Cash, Check

### 1.5 — Frontend: `countryFeatures.js` ✅ EXISTE
- **Archivo:** `frontend/src/constants/countryFeatures.js` — el archivo real tiene mas
  campos que este boceto (labels de direccion, dateFormat, currencyDecimals, phoneFormat,
  defaultLocale) y ademas la entrada `BR`. Leerlo antes de asumir el shape de abajo.
```javascript
const countryFeatures = {
  CO: {
    address: ['department', 'city', 'neighborhood'],
    compliance: false,
    ncaa: false,
    unitSystem: 'metric',
  },
  US: {
    address: ['street', 'city', 'state', 'zipCode'],
    compliance: true,
    ncaa: true,
    unitSystem: 'imperial',
  }
};
```

### 1.6 — Adaptar formularios por pais
- Formulario de direccion: detectar pais → State/ZIP (US) o Departamento/Municipio (CO)
- Formulario de telefono: detectar pais → formato correcto
- Formulario de documentos: dropdown dinamico segun pais (ya existe `bas_types_documents_by_country`)
- Metodos de pago: filtrar por pais
- Campos condicionales: ocultar "Barrio" en USA, ocultar "ZIP" en Colombia

### 1.7 — Adaptar `dateUtils.js` por pais
- **Archivo:** `frontend/src/helpers/dateUtils.js`
- Detectar locale del usuario → formato de fecha correcto
- Cambiar date-fns locale de `es` a dinamico

### 1.8 — Adaptar currency formatting por pais
- Leer `currency_decimals`, `decimal_separator`, `thousand_separator` del pais del club
- Formatear: $1,500.00 (USD) vs $1.500 (COP)

### 1.9 — Seed deportes en ingles
- Agregar nombres en ingles a `bas_sports` (columna name_en o via i18n):
  Futbol→Soccer, Baloncesto→Basketball, Beisbol→Baseball, Voleibol→Volleyball, Futbol Americano→Football, Tenis→Tennis, Atletismo→Track & Field, Natacion→Swimming

**Verificacion Fase 1:**
- [ ] Club USA se puede crear con country_id = US
- [ ] Formularios muestran State + ZIP (no Departamento + Municipio)
- [ ] Fechas en MM/DD/YYYY
- [ ] Moneda en $1,500.00 (no $1.500)
- [ ] Telefono formato +1 (XXX) XXX-XXXX
- [ ] Documentos USA en dropdown (Driver's License, etc.)

---

## FASE 2: Infraestructura i18n (JSONs Estaticos + Validacion Automatica)

**Prerequisitos:** Ninguno (paralelo con Fase 1)

> **ESTADO VERIFICADO 13-ago-2026: ✅ HECHA. La auditoria anterior ("0% implementado, NO
> hay i18next instalado") es FALSA y no debe repetirse.**
>
> Verificado en el codigo:
> - `frontend/package.json`: `i18next ^25.8.18` y `react-i18next ^16.5.8` instalados
> - `frontend/src/i18n/index.js` (12.5 KB) — config con los namespaces cableados
> - `frontend/src/providers/TranslationProvider.jsx` — existe
> - `frontend/src/i18n/locales/` con **3 idiomas: `en`, `es`, `pt-BR`**
> - **37 namespaces por idioma** (los 10 que planteaba este doc mas 27 que no existian en
>   el plan: admin, adminHome, assistant, attendanceScan, categories, charges, collections,
>   compliance, documents, enrollment, home, incapacities, ncaa, notifications, organizer,
>   parent, publicTournaments, seasonRenewal, sessions, settings, subscription, tournaments,
>   trainers, trajectory, tryouts, venues, dashboard)
> - `frontend/scripts/check-translations.js` — el validador de completitud existe
>
> ⚠️ **Matiz real (esto si sigue vivo):** la paridad de keys entre idiomas no garantiza que
> el texto llegue a pantalla — un namespace nuevo hay que importarlo en `i18n/index.js`, y
> hay inventario de espanol hardcodeado pendiente en
> `frontend/scripts/hardcoded-spanish-inventory.json`. Para verificar traducciones hay que
> leer el DOM, no comparar archivos JSON.
>
> **DECISION historica (15 Mar 2026):** Se descarto el enfoque DB-driven (tabla bas_translations + admin UI + generacion de JSONs) por over-engineering para el stage actual. Se adopta JSONs estaticos en el repo + validacion automatica en build. Si en el futuro se necesita admin UI para traducciones, se agrega encima sin cambiar nada del frontend.

### Flujo del sistema
```
Developer edita JSONs en el repo (es/*.json, en/*.json)
  → check-translations.js valida completitud en build/CI
  → Si falta UNA key en en/ → build FALLA (no llega a produccion)
  → ESLint plugin detecta strings hardcodeados en JSX
  → i18next carga JSONs locales, detecta idioma del club
  → Fallback: si key no existe en EN, muestra ES
```

### 2.1 — Instalar dependencias
```bash
cd frontend
npm install i18next react-i18next
npm install -D eslint-plugin-i18next
```

### 2.2 — Estructura de archivos de traduccion
```
frontend/src/i18n/
├── index.js                    ← Config de i18next
└── locales/
    ├── es/
    │   ├── common.json         ← Botones, acciones, estados genericos
    │   ├── menu.json           ← Items del sidebar
    │   ├── auth.json           ← Login, registro, reset password
    │   ├── players.json        ← Modulo jugadores
    │   ├── payments.json       ← Pagos y cobros
    │   ├── calendar.json       ← Calendario y sesiones
    │   ├── onboarding.json     ← Wizard de onboarding
    │   ├── options.json        ← selectOptions.js (tipos de sangre, genero, etc.)
    │   ├── status.json         ← Estados y badges
    │   └── errors.json         ← Mensajes de error y toasts
    └── en/
        ├── common.json
        ├── menu.json
        ├── auth.json
        ├── players.json
        ├── payments.json
        ├── calendar.json
        ├── onboarding.json
        ├── options.json
        ├── status.json
        └── errors.json
```

### 2.3 — Configurar i18next
- **Archivo:** `frontend/src/i18n/index.js`
```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importar todos los namespaces
import esCommon from './locales/es/common.json';
import enCommon from './locales/en/common.json';
// ... (todos los namespaces)

i18n.use(initReactI18next).init({
  resources: {
    es: { common: esCommon, menu: esMenu, /* ... */ },
    en: { common: enCommon, menu: enMenu, /* ... */ },
  },
  lng: 'es',                    // Default: español
  fallbackLng: 'es',            // Si falta key en EN, muestra ES
  defaultNS: 'common',
  interpolation: { escapeValue: false },

  // DEV: detectar keys faltantes
  saveMissing: import.meta.env.DEV,
  missingKeyHandler: (lngs, ns, key) => {
    console.warn(`🔑 i18n missing: [${ns}] ${key}`);
  },

  // DEV: mostrar key si falta traduccion (obvio en QA)
  // PROD: mostrar fallback en español (mejor UX)
  parseMissingKeyHandler: import.meta.env.DEV
    ? (key) => `[${key}]`
    : undefined,
});

export default i18n;
```

### 2.4 — TranslationProvider.jsx
- **Archivo:** `frontend/src/providers/TranslationProvider.jsx`
- Detecta `country_id` del club activo del usuario
- Si el club es USA → `i18n.changeLanguage('en')`
- Si el club es CO → `i18n.changeLanguage('es')`
- Cambia idioma automaticamente al cambiar de club (multi-contexto)

### 2.5 — Script de validacion (proteccion contra faltantes en produccion)
- **Archivo:** `frontend/scripts/check-translations.js`
- Lee todos los JSONs de `es/` y `en/`
- Compara keys: si alguna key de ES no existe en EN → **FALLA el build**
- Se ejecuta como parte de `npm run build`
- Tambien se puede ejecutar en CI/CD (`npm run check:i18n`)

```json
// package.json
"scripts": {
  "check:i18n": "node scripts/check-translations.js",
  "build": "node scripts/check-translations.js && vite build"
}
```

### 2.6 — ESLint: detectar strings hardcodeados
- **Archivo:** `.eslintrc` o `eslint.config.js`
- Agregar `eslint-plugin-i18next` con regla `no-literal-string` en modo `warn`
- Esto avisa cuando hay texto hardcodeado en JSX que deberia usar `t()`
- En modo `warn` para no romper el build existente (activar `error` gradualmente)

### 2.7 — Backend: helper para traducciones en emails/API
- **Archivo:** `app/Helpers/TranslationHelper.php`
- Funcion `trans_by_country($key, $countryCode, $params = [])` que lee de archivos `resources/lang/{locale}/`
- Para emails y respuestas API: detectar pais del club → usar locale correcto
- Laravel ya tiene sistema de traducciones nativo (`resources/lang/en/`, `resources/lang/es/`)
- NO se necesita tabla ni servicio custom — usar `__('key')` con locale dinamico

### 2.8 — Agregar import de i18n en main.jsx
- **Archivo:** `frontend/src/main.jsx`
- Agregar `import './i18n';` antes de renderizar App
- Envolver App con `TranslationProvider`

**Verificacion Fase 2:**
- [ ] `npm install i18next react-i18next` exitoso
- [ ] `i18n/index.js` configurado con resources ES + EN
- [ ] `TranslationProvider.jsx` cambia idioma segun pais del club
- [ ] `t('common.save')` funciona en un componente de prueba
- [ ] `npm run check:i18n` detecta keys faltantes y falla si hay alguna
- [ ] `npm run build` ejecuta check antes de compilar
- [ ] ESLint avisa de strings hardcodeados en JSX
- [ ] En DEV: keys faltantes muestran `[namespace.key]` (obvio en QA)
- [ ] En PROD: keys faltantes muestran fallback en español

---

## FASE 3: Traducciones — Constantes + Paginas Criticas

**Prerequisitos:** Fase 2 completada
**Total:** ~480 strings
**Enfoque:** Extraer strings hardcodeados → moverlos a JSONs → reemplazar con t()

### Prioridad 1: Constantes centralizadas (~280 strings)

| Tarea | Archivo | Namespace i18n | Strings | Notas |
|-------|---------|---------------|---------|-------|
| 3.1 | `frontend/src/constants/selectOptions.js` | options | ~120 | Tipos de sangre, genero, tallas, etc. |
| 3.2 | `frontend/src/layouts/MenuList.jsx` | menu | ~80 | Items del sidebar por rol |
| 3.3 | roles.js | common | ~6 | Propietario, Entrenador, etc. |
| 3.4 | modules.js | common | ~14 | Jugadores, Pagos, etc. |
| 3.5 | paymentStatusConfig.js | status | ~8 | Pendiente, Pagado, Vencido, etc. |
| 3.6 | statusConfigs.js | status | ~50 | Estados de jugador, sesion, etc. |
| 3.7 | Permisos | common | ~7 | Ver, Crear, Editar, Eliminar, etc. |

### Prioridad 2: Paginas criticas para demo (~200 strings)

| Tarea | Paginas | Namespace | Strings |
|-------|---------|-----------|---------|
| 3.8 | Login, Register, Forgot/Reset Password, Verify Email | auth | ~40 |
| 3.9 | Dashboard (6 dashboards por rol) | dashboard | ~30 |
| 3.10 | Players (perfil completo, tabs, formularios) | players | ~60 |
| 3.11 | Layouts globales (Sidebar, TopBar, toasts, errores) | common, errors | ~30 |
| 3.12 | Finanzas (Charges, Payments, dialogs) | payments | ~50 |
| 3.13 | Calendar + Sessions + Attendance | calendar | ~60 |
| 3.14 | Onboarding Wizard | onboarding | ~30 |

### 3.15 — Patron de migracion por archivo

Para cada archivo con strings hardcodeados:

```jsx
// ANTES (hardcodeado en español)
<Button>Guardar cambios</Button>
<p>No se encontraron jugadores</p>

// DESPUES (usando t())
import { useTranslation } from 'react-i18next';
const { t } = useTranslation('players');

<Button>{t('save_changes')}</Button>
<p>{t('no_players_found')}</p>
```

Para constantes (selectOptions, statusConfigs, etc.):
```javascript
// ANTES
export const bloodTypes = [
  { value: 'A+', label: 'A Positivo' },
  { value: 'A-', label: 'A Negativo' },
];

// DESPUES — usar funcion que recibe t()
export const getBloodTypes = (t) => [
  { value: 'A+', label: t('options.blood_a_pos') },
  { value: 'A-', label: t('options.blood_a_neg') },
];
```

**Verificacion Fase 3:**
- [ ] Login, Dashboard, Menu, Players, Calendar, Charges, Payments — 100% en ingles
- [ ] Toasts y errores en ingles
- [ ] Onboarding wizard en ingles
- [ ] Seeder ejecuta sin errores y genera JSONs

---

## FASE 4: Stripe Connect Payment Gateway (Marketplace Model)

**Prerequisitos:** Fase 1 completada

> **ESTADO VERIFICADO 13-ago-2026: ✅ HECHA en codigo. La auditoria anterior ("0%
> implementado, `stripe/stripe-php` NO esta en composer.json") es FALSA.**
>
> Verificado en el codigo:
> - `saas_sport/composer.json`: `"stripe/stripe-php": "^19.4"`
> - `saas_sport/app/Services/Payments/StripeGateway.php` (31.7 KB) — implementado
> - `saas_sport/app/Services/Payments/StripeConnectService.php` (11.4 KB) — implementado
> - Migracion `2026_03_16_100001_create_pla_stripe_accounts_table.php` + tabla
>   `pla_stripe_accounts`, y `2026_03_16_100002_add_stripe_fee_percent_to_bas_subscription_plans.php`
> - Ruta `POST /api/webhooks/stripe` → `WebhookController@handleStripe` (`routes/api.php` L615)
> - Seeders `StripeGatewaySeeder.php` (24 paises soportados, incluidos US, CA, MX, BR) y
>   `StripeCountryPaymentConfigSeeder.php`
> - Torneos con su propio Connect: `TournamentStripeConnectController.php`,
>   `TournamentWebhookController.php`
>
> 🔴 **LO QUE SI FALTA — el unico bloqueador del lanzamiento USA:** produccion sigue en
> **sandbox**. Pasar Stripe a **live** es el **Gate 0**, en curso. No es trabajo de codigo
> de esta fase sino de configuracion y verificacion de credenciales/webhooks en vivo.
>
> **Modelo:** Stripe Connect marketplace — Widdo es la plataforma, cada club tiene su propia Stripe Connected Account. Widdo cobra `application_fee` por transaccion. Los clubes reciben pagos directamente en su cuenta.

### 4.1 — Instalar Stripe SDK
- Backend: `composer require stripe/stripe-php`
- Frontend: `npm install @stripe/stripe-js @stripe/react-stripe-js`

### 4.2 — Migracion: tabla `pla_stripe_accounts`
- **Columnas:** id, club_id (FK unique), stripe_account_id (string unique), status (enum: 'pending'|'onboarding'|'active'|'restricted'|'disabled'), charges_enabled (boolean default false), payouts_enabled (boolean default false), details_submitted (boolean default false), country (string 2), default_currency (string 3), onboarding_completed_at (timestamp nullable), timestamps
- Un club = una Connected Account

### 4.3 — `StripeConnectService.php`
- **Archivo:** `app/Services/Payments/StripeConnectService.php`
- Metodos:
  - `createAccount($club)` — crea Connected Account tipo Express
  - `createOnboardingLink($club, $returnUrl, $refreshUrl)` — genera link para que Owner complete KYC
  - `handleAccountUpdated($event)` — actualiza charges_enabled, payouts_enabled, details_submitted
  - `createLoginLink($club)` — acceso al Stripe Express Dashboard (payouts, balances)
  - `getAccountStatus($club)` — estado actual de la cuenta

### 4.4 — `StripeGateway.php`
- **Archivo:** `app/Services/Payments/StripeGateway.php`
- Implementar `PaymentGatewayInterface`
- Metodos: `createCheckoutSession()`, `createPaymentIntent()`, `handleWebhook()`, `getPaymentStatus()`
- **Clave:** Cada pago usa `transfer_data.destination` (connected account) + `application_fee_amount` (comision Widdo)
- `application_fee_percent` configurable por plan en Super Admin (ej: 3% Basic, 2% Pro, 1.5% Enterprise)
- checkout_type: 'redirect' (Stripe Checkout) para subscriptions, 'embedded' (Stripe Elements) para pagos individuales

### 4.5 — Config
- **Archivo:** `config/stripe.php`
- Variables: STRIPE_KEY, STRIPE_SECRET, STRIPE_WEBHOOK_SECRET, STRIPE_CONNECT_CLIENT_ID

### 4.6 — Webhook handler
- **Archivo:** `app/Http/Controllers/WebhookController.php`
- Agregar `handleStripe()` method
- Eventos:
  - `payment_intent.succeeded` — marcar pago como completado
  - `account.updated` — actualizar status de Connected Account (charges_enabled, payouts_enabled)
  - `checkout.session.completed` — confirmar checkout redirect
  - `invoice.paid`, `invoice.payment_failed` — subscripciones recurrentes

### 4.7 — Ruta webhook
- `POST /api/webhooks/stripe` en `routes/api.php`

### 4.8 — Registrar en factory
- **Archivo:** `app/Services/Payments/PaymentGatewayFactory.php`
- `'stripe' => StripeGateway::class` en `GATEWAY_CLASSES`

### 4.9 — Seeder
- Stripe en `bas_payment_gateways`, configurar para USA con credenciales de test

### 4.10 — Frontend: Stripe Connect Onboarding (Owner)
- **Archivo:** `frontend/src/pages/settings/StripeConnectPage.jsx`
- Flujo: Owner va a Settings → Payments → "Connect Stripe Account"
- Boton redirige a Stripe Express onboarding (KYC, banco, identidad)
- Al volver: mostrar status (charges_enabled, payouts_enabled)
- Link al Stripe Express Dashboard para ver payouts y balances

### 4.11 — Frontend: Stripe Elements (Padres pagan)
- **Archivo:** `frontend/src/components/payments/StripeCheckout.jsx`
- Padre paga charge → Stripe Elements embebido (tarjeta + Apple Pay + Google Pay)
- `PaymentIntent` con `transfer_data.destination` al Connected Account del club
- Mostrar receipt con desglose: monto + fee

### 4.12 — Frontend: Payouts Dashboard (Owner)
- Seccion en Settings → Payments: ver balance, proximos payouts, historial
- Link directo al Stripe Express Dashboard

### 4.13 — Super Admin: application_fee_percent por plan
- **Archivo:** `frontend/src/pages/admin/PlansPage.jsx` (agregar campo)
- Endpoint: `PUT /api/admin/plans/{id}` incluir `stripe_fee_percent`
- Default: 3% Basic, 2% Pro, 1.5% Enterprise

### 4.14 — Testing con Stripe test mode
- Tarjetas de prueba (4242 4242 4242 4242), verificar webhook con Stripe CLI
- Test Connected Account con `stripe listen --forward-connect-to`
- Verificar que application_fee llega a Widdo y el resto al club

**Verificacion Fase 4:**
- [ ] StripeGateway implementa PaymentGatewayInterface con transfer_data.destination
- [ ] Club USA detecta Stripe como gateway
- [ ] Owner puede conectar Stripe account (Express onboarding)
- [ ] pla_stripe_accounts se actualiza via webhook account.updated
- [ ] Padre paga con Stripe Elements → pago llega a Connected Account del club
- [ ] application_fee se cobra correctamente segun plan
- [ ] Webhook payment_intent.succeeded actualiza status del pago
- [ ] Owner puede ver payouts dashboard / link a Stripe Express
- [ ] Super Admin puede configurar application_fee_percent por plan
- [ ] Tarjeta de prueba completa flujo exitosamente end-to-end

---

## FASE 5: Public Enrollment Page + Waivers Digitales

**Prerequisitos:** Fases 1 y 4 completadas
**Esta pagina reemplaza Google Forms de The Academy CFL**

> **ESTADO VERIFICADO 13-ago-2026: ✅ HECHA.** La auditoria anterior ("~25%, faltan waivers,
> firma digital y templates configurables") esta desactualizada.
>
> Verificado: `saas_sport/app/Http/Controllers/WaiverController.php` con rutas reales en
> `routes/api.php` — CRUD de templates (`waivers/templates` GET/POST/PUT/DELETE, L874-877),
> firmados por jugador (`waivers/signed/{playerId}`, L878) y rutas publicas sin auth
> (`public/waivers/{clubId}`, L691). Frontend:
> `frontend/src/pages/settings/WaiverTemplatesPage.jsx`,
> `frontend/src/components/enrollment/WaiverSigningFlow.jsx`,
> `frontend/src/pages/PublicEnrollmentPage.jsx`. Seeder
> `database/seeders/WaiverTemplatesSeeder.php` (9.9 KB). Torneos tienen su propio flujo de
> waivers (`WaiverSigningModal.jsx` + rutas `tournaments/{id}/waivers`, L1323-1329).
>
> ⏳ Sin verificar en esta pasada: que el PDF generado con la firma se vea correctamente
> end-to-end (requiere prueba en vivo, no lectura de codigo).

### 5.1 — PublicEnrollmentPage en ingles
- **Archivo:** `frontend/src/pages/PublicEnrollmentPage.jsx`
- Campos adaptados por pais del club (detecta country_id):
  - USA: First Name, Last Name, DOB (MM/DD/YYYY), State, ZIP, Phone (+1)
  - CO: Primer Nombre, Apellido, Fecha Nacimiento (DD/MM/YYYY), Departamento, Municipio
- Pago con Stripe embebido si el club cobra registration fee

### 5.2 — Migracion: tabla `pla_club_teams_waiver_templates`
- Tabla de firmas: `pla_club_teams_signed_waivers`. Para torneos existen ademas
  `pla_club_teams_tournament_waivers` y `pla_club_teams_tournament_waiver_signatures`
- **Columnas:** id, club_id (FK), name (string), content (text — HTML/rich text del waiver), is_required (boolean default true), is_default (boolean default false — templates que vienen por defecto), applies_to (enum: 'enrollment'|'tryout'|'event'|'all'), sort_order (int default 0), is_active (boolean default true), timestamps

### 5.3 — Seeder: 5 waiver templates default
- **Archivo:** `database/seeders/WaiverTemplatesSeeder.php`
- Templates default (is_default=true, asignados al crear club USA):
  1. **Liability Waiver** — Asuncion de riesgo y liberacion de responsabilidad
  2. **Medical Release** — Autorizacion de tratamiento medico de emergencia
  3. **Photo/Video Consent** — Consentimiento para uso de imagen en redes/marketing
  4. **Concussion Acknowledgment** — Reconocimiento de protocolo de conmocion cerebral
  5. **NIL Consent** — Consentimiento Name/Image/Likeness (menores de 18 requieren firma de padres)
- Cada template incluye texto legal en ingles, adaptable por el Owner

### 5.4 — `WaiverTemplatesPage.jsx` (Owner)
- **Archivo:** `frontend/src/pages/settings/WaiverTemplatesPage.jsx`
- Owner puede:
  - Ver templates default y custom
  - Editar texto de cualquier template (editor rich text)
  - Crear templates propios (name, content, is_required, applies_to)
  - Activar/desactivar templates
  - Reordenar con drag & drop
- Guard: Owner/Admin del club

### 5.5 — Sistema de waivers/consent forms digitales
- **Implementacion:** firma digital (canvas/touch), PDF generado con firma + timestamp, vinculado al jugador tab "Documents"
- **Flujo enrollment:** Padre llena datos → ve waivers requeridos del club → firma cada uno → paga (si aplica) → jugador registrado
- **Flujo tryout:** Padre registra al hijo → firma waivers aplicables a tryouts → confirmacion

### 5.6 — Email confirmacion de enrollment
- Email al padre con resumen de registro + copia de waivers firmados

**Verificacion Fase 5:**
- [ ] Link publico funciona sin login
- [ ] Campos USA correctos
- [ ] 5 waiver templates default creados al crear club USA
- [ ] Owner puede editar texto de templates y crear custom
- [ ] WaiverTemplatesPage funciona (CRUD, reorder, toggle)
- [ ] Waivers firmables con dedo/mouse
- [ ] PDF se genera con firma visible
- [ ] Pago Stripe funciona (si el club cobra registration fee)
- [ ] Email confirmacion llega al padre
- [ ] Jugador aparece en roster del club

---

## FASE 6: Compliance Dashboard (Configurable por Club)

**Prerequisitos:** Fase 1 completada
**Solo visible si `countryFeatures.compliance === true`**
**Contexto legal:** Ver `USA-COMPLIANCE.md`

> **ESTADO VERIFICADO 13-ago-2026: ✅ HECHA. La auditoria anterior ("0% implementado, no
> existen tablas, modelos, controllers ni UI de compliance") es FALSA y no debe repetirse.**
>
> Verificado en el codigo:
> - `saas_sport/app/Http/Controllers/ComplianceController.php` (25.4 KB)
> - Rutas reales en `routes/api.php` (~L1358-1385) bajo `Route::middleware('module.access:compliance')`:
>   `/compliance/dashboard`, `/athletes`, `/athletes/{playerId}`, `/coaches`,
>   `/coaches/{userId}`, `/items` (POST), `/items/{id}` (PUT), `/expiring`, y CRUD de
>   `/types` (GET/POST/PUT/DELETE)
> - Tablas `pla_club_teams_compliance_types` y `pla_club_teams_compliance_items`
>   (migraciones `2026_03_16_200001` y `2026_03_16_200002`)
> - Seeder `database/seeders/ComplianceTypesSeeder.php`
> - Comando de alertas `app/Console/Commands/CheckComplianceExpirations.php`, **agendado**
>   en `routes/console.php` (`compliance:check-expirations`, diario 7:00 AM)
> - Frontend: `pages/dashboard/Compliance/ComplianceDashboardPage.jsx`,
>   `ComplianceAthleteDetailPage.jsx`, `ComplianceSettingsPage.jsx`, `CoachCredentialsPage.jsx`
> - i18n: namespace `compliance` en `en`, `es` y `pt-BR`
>
> ⚠️ **Diferencias respecto al plan original de esta fase:**
> - El endpoint `GET /api/compliance/export` (reporte PDF/Excel) **NO existe** en las rutas.
>   Es lo unico del alcance 6.4 que falta.
> - El endpoint real de detalle de coach es `/compliance/coaches/{userId}`, que el plan no
>   listaba.
> - Las tools de IA (6.9) no se verificaron en esta pasada.

### Backend

#### 6.1 — Migracion: tabla `pla_club_teams_compliance_types`
- Columnas: id, club_id, name (string), applies_to (enum: 'athletes'|'coaches'|'both'), is_required (boolean), expiration_days (int nullable), alert_days_before (int default 30), description (text nullable), is_active (boolean default true), timestamps
- Seed defaults: Sports Physical (365d), Concussion Protocol (365d), Background Check (365d), ECG Screening (null), SafeSport (365d), Insurance (365d), CPR/First Aid (730d)

#### 6.2 — Migracion: tabla `pla_club_teams_compliance_items`
- Columnas: id, club_id, compliance_type_id (FK), player_id (nullable), user_id (nullable, para coaches), status (enum: 'pending'|'uploaded'|'approved'|'expired'|'rejected'), document_path (nullable), issued_date (date nullable), expiration_date (date nullable), notes (text nullable), verified_by (FK users nullable), verified_at (timestamp nullable), timestamps

#### 6.3 — Modelos
- `PlaComplianceType`: belongsTo(PlaClubTeam), hasMany(PlaComplianceItem)
- `PlaComplianceItem`: belongsTo(PlaClubTeam, PlaComplianceType, Player/User)
- Scopes: expiringSoon($days), expired(), byType(), byStatus()
- Accessors: isExpired(), daysUntilExpiration(), statusColor()

#### 6.4 — `ComplianceController`
- Endpoints:
  - `GET /api/compliance/dashboard` — resumen semaforo (green/yellow/red)
  - `GET /api/compliance/athletes` — lista atletas con status
  - `GET /api/compliance/athletes/{id}` — detalle atleta
  - `GET /api/compliance/coaches` — coaches con credentials status
  - `POST /api/compliance/items` — crear/subir documento
  - `PUT /api/compliance/items/{id}` — approve/reject
  - `GET /api/compliance/expiring` — items que expiran en 30 dias
  - `GET /api/compliance/export` — reporte PDF/Excel
  - `GET /api/compliance/types` — tipos activos del club
  - `POST /api/compliance/types` — crear tipo custom
  - `PUT /api/compliance/types/{id}` — editar/activar/desactivar

#### 6.5 — Alertas automaticas
- Artisan command: `php artisan compliance:check-expirations` (cron diario)
- Notification 30 dias y 7 dias antes de vencimiento
- Email al padre cuando physical de su hijo esta por vencer

### Frontend

#### 6.6 — `ComplianceDashboardPage.jsx`
- **Archivo:** `frontend/src/pages/dashboard/Compliance/ComplianceDashboardPage.jsx`
- Resumen: X athletes cleared, Y need attention, Z expired
- Tabla atletas con columnas semaforo por compliance type
- Verde=vigente, Amarillo=expira <30d, Rojo=expirado/pendiente
- Filtros: All, Needs Attention, Expired, Fully Cleared

#### 6.7 — `CoachCredentialsPage.jsx`
- Tabla coaches con: Background Check | SafeSport | CPR/First Aid + semaforo

#### 6.8 — `ComplianceSettingsPage.jsx`
- Owner configura compliance types, toggle on/off + crear custom types

#### 6.9 — AI Assistant tools
- Read tools: "Which athletes have expired physicals?", "Show compliance status for [name]", "How many athletes fully cleared?", "Which coaches need background check renewal?"
- **Archivos:** `ClubAssistantToolExecutor.php`, `ClubAssistantService.php`, `AssistantChatBubble.jsx`

#### 6.10 — Menu
- MenuList.jsx: "Compliance" solo si `countryFeatures.compliance === true`
- Submenu: Dashboard, Coach Credentials, Settings

#### 6.11 — Traducciones (~30 strings)
- Grupo i18n: `compliance`

**Verificacion Fase 6:**
- [ ] Dashboard semaforo correcto por atleta
- [ ] Click atleta → detalle con todos sus items
- [ ] Subir documento (PDF/imagen) funciona
- [ ] Owner puede aprobar/rechazar documentos
- [ ] Coach credentials page funciona
- [ ] Settings toggle on/off cada compliance type
- [ ] Compliance types custom funcionan
- [ ] Notificaciones se generan correctamente
- [ ] Menu "Compliance" solo aparece en clubs USA
- [ ] AI responde "Which athletes have expired physicals?"

---

## FASE 7: Seed Data Demo + Verificacion End-to-End

**Prerequisitos:** Fases 1-6 completadas

### 7.1 — Seed data de demo
- Club: "The Academy CFL", 5 deportes (Basketball, Baseball, Soccer, Volleyball, Tennis)
- Categorias: Varsity, JV, Middle School
- 20-30 atletas con nombres en ingles
- Admin user para demo
- Compliance items (mix green/yellow/red)

### 7.2 — Verificar todo funciona
- Login → UI en ingles
- Moneda USD con 2 decimales
- Fechas MM/DD/YYYY
- Documentos USA en dropdown
- Direccion State + ZIP
- Pagos Stripe test mode
- Compliance dashboard con semaforo
- Public enrollment link funcionando
- Waivers firmables
- Club Colombia sigue funcionando (no romper nada)

### 7.3 — Fix bugs

**Criterio DEMO READY:**
- [ ] Club USA funciona 100% en ingles
- [ ] Club Colombia sigue funcionando 100% en espanol
- [ ] Pagos Stripe end-to-end
- [ ] Compliance dashboard funcional
- [ ] Enrollment publico reemplaza Google Forms
- [ ] Cero errores en consola
- [ ] Cero textos en espanol visibles en club USA

---

## FASE 8: Traducciones Restantes (~300+ strings)

**Prerequisitos:** Fase 3 completada

| Tarea | Seccion | Strings |
|-------|---------|---------|
| 8.1 | Categories + Trainers | ~20 |
| 8.2 | Sessions + Venues | ~15 |
| 8.3 | Portal Padre (My Kids, My Payments) | ~25 |
| 8.4 | Portal Jugador | ~15 |
| 8.5 | Settings + Config | ~30 |
| 8.6 | Documents, FileVault, Inventory | ~20 |
| 8.7 | Tournaments | ~25 |
| 8.8 | Subscription + Referrals | ~20 |
| 8.9 | Super Admin pages (baja prioridad) | ~40 |
| 8.10 | Backend: validation messages (`resources/lang/en/validation.php`) | ~40 |
| 8.11 | Backend: email templates | ~30 |
| 8.12 | Backend: notification messages | ~20 |
| 8.13 | Backend: API error responses | ~15 |

---

## FASE 9: NCAA Eligibility Tracker

**Prerequisitos:** Fase 1 completada
**Solo visible para `countryFeatures.ncaa === true`**
**Contexto NCAA:** Ver `USA-COMPLIANCE.md`

> **ESTADO VERIFICADO 13-ago-2026: ✅ HECHA.** `app/Http/Controllers/Api/NcaaEligibilityController.php`
> con rutas reales en `routes/api.php` (~L1387+) bajo `Route::middleware('module.access:ncaa')`:
> `/ncaa/overview`, `/ncaa/player/{playerId}` (GET/POST/PUT), `/ncaa/player/{playerId}/courses`
> (GET/POST), `/ncaa/courses/{courseId}` (PUT/DELETE). Modelos `PlaNcaaEligibility.php` y
> `PlaNcaaCoreCourse.php`. Frontend `pages/dashboard/Players/components/NcaaEligibilityTab.jsx`.
> i18n: namespace `ncaa` en los 3 idiomas.
>
> ⏳ Sin verificar: 9.5 (export del recruiting profile en PDF).

### 9.1 — Migracion: `pla_club_teams_ncaa_eligibility`
- Columnas: id, player_id (FK), ncaa_id (string nullable), gpa (decimal 3,2 nullable), target_division (enum: D1/D2/D3/NAIA/undecided), gpa_requirement (decimal 3,2 calculado), core_courses_completed (int default 0), core_courses_required (int default 16), eligibility_status (enum: eligible/on_track/at_risk/ineligible/not_evaluated), current_semester (int nullable), notes (text nullable), timestamps

### 9.2 — Migracion: `pla_club_teams_ncaa_core_courses`
- Checklist de 16 courses: 4 English, 3 Math (Algebra 1+), 2 Science (1 lab), 1 additional, 2 Social Science, 4 additional
- Columnas: id, eligibility_id, course_name, category (English/Math/Science/Social/Additional), grade, credits, completed (boolean), semester

### 9.3 — Migracion: `pla_club_teams_college_interests`
- Columnas: id, player_id, college_name, division, sport, contact_name, contact_email, status (interested/contacted/visited/offered/committed), notes, timestamps

### 9.4 — Modelo + Controller + Frontend
- Tab en perfil del jugador: "NCAA Eligibility" (solo USA)
- Vista: GPA vs requirement, core courses progress bar (X/16), status badge, college interests
- **Alertas:** GPA bajo minimo, regla 10/7 (D1: semestre 5-6 con <10 courses), deadline de core courses

### 9.5 — Export recruiting profile
- PDF: foto, stats deportivos, GPA, core courses, sports history, achievements

---

## FASE 10: Tryout Management

**Prerequisitos:** Fase 5 completada

> **ESTADO VERIFICADO 13-ago-2026: ✅ HECHA.** `TryoutController.php` (13 KB) con rutas
> reales en `routes/api.php` (~L1346-1357): CRUD de tryouts, `/{id}/registrations`,
> `PUT /{id}/registrations/{regId}`, `POST /{id}/registrations/{regId}/convert`
> (convertir a jugador) y `POST /{id}/notify`. Registro publico sin auth:
> `PublicTryoutController.php` + rutas `public/tryouts` (L672-673). Frontend:
> `pages/dashboard/Tryouts/TryoutManagementPage.jsx`, `TryoutDetailPage.jsx`,
> `pages/PublicTryoutPage.jsx`. i18n: namespace `tryouts` en los 3 idiomas.
>
> ⚠️ Ojo: las rutas de tryouts NO estan bajo `module.access` (a diferencia de compliance y
> ncaa) — estan abiertas a todos los clubes con sesion, no solo a los USA.

### 10.1 — Migracion: `pla_club_teams_tryouts`
- Columnas: id, club_id, name, sport_id, category_id (nullable), date, location, max_capacity, registration_deadline, status (upcoming/open/closed/completed), description, public_link_slug
- Public page: `app.widdo.co/tryout/{slug}`

### 10.2 — Migracion: `pla_club_teams_tryout_registrations`
- Columnas: id, tryout_id, player_name, player_email, parent_name, parent_email, parent_phone, date_of_birth, previous_experience (text), status (registered/evaluated/accepted/waitlist/rejected), evaluation_score (decimal), evaluator_notes (text)

### 10.3 — Frontend: TryoutManagementPage
- Crear tryout, ver registrations, evaluar con scoring rubric
- Comunicar resultados (email: accepted/waitlist/not accepted)
- Boton "Convert to Player" → crea jugador en roster

### 10.4 — Public Tryout Registration Page
- Pagina publica compartible en redes
- Formulario: nombre, edad, experiencia, contacto de padres
- Confirmacion por email

---

## FASE 11: Features Avanzados USA (Ongoing)

| # | Feature | Prioridad | Estimacion |
|---|---------|-----------|------------|
| 11.1 | NIL tracking (Florida HB 981) — ver `USA-COMPLIANCE.md` | Alta si hay demanda | 3-5 dias |
| 11.2 | Unidades imperial (ft/in, lbs) — `unitConverter.js` | Media | 2 dias |
| 11.3 | Recruiting profile publico (`widdo.co/athlete/{slug}`) | Media | 3-5 dias |
| 11.4 | Integracion National Sports ID API | Baja | 2-3 dias |
| 11.5 | Ticketing para eventos/torneos | Baja | 5-7 dias |
| 11.6 | Transportation coordination | Baja | 3-5 dias |
| 11.7 | Fundraising tools | Baja | 3-5 dias |
