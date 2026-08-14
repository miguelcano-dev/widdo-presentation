# Plan Widdo Mobile — Reescritura en Flutter

> Fecha: 30 julio 2026 · Autor: Claude (análisis CEO + mobile)
> **Estado: EN EJECUCIÓN — B0–B4 en `main`, B5 arrancado. Ver `mobile_flutter/specs/ARRANQUE.md`.**
>
> Ya no es una propuesta: el repo existe (`github.com/miguelcano-dev/widdo-mobile-flutter`, checkout
> local en `desarrollo/mobile_flutter/`), la app está **en TestFlight** y Miguel la usa en su teléfono.
> Este documento conserva el **razonamiento y el diseño** (por qué Flutter, las 3 experiencias, la
> arquitectura, los riesgos). Para saber **qué está hecho y qué sigue, la fuente es `ARRANQUE.md`**;
> si los dos se contradicen, manda `ARRANQUE.md`.
>
> ⚠️ **La secuencia de entrega F-1…F6 de §11 quedó sustituida** por los bloques **B0–B8** de
> `ARRANQUE.md`, que son los que se están ejecutando de verdad. Lee la tabla F como intención
> original, no como plan vigente. (Ojo también: los `B0`…`B8` de `PLAN-FLUTTER-BACKEND-READINESS.md`
> eran bloqueadores de servidor, otra cosa; allí se renumeraron a `A1`/`A2.x`/`A3.x` para evitar
> justo esta confusión.)
>
> Repo: `desarrollo/mobile_flutter/` (git independiente, como frontend y saas_sport)
>
> **Ajuste técnico de Codex — 31 julio 2026.** Miguel confirmó que React Native queda descartado y
> Flutter es la única app móvil futura. Codex corrigió contrato API, multi-club, centralización,
> bloqueadores y secuencia de entrega después de volver a revisar `frontend/` y `saas_sport/`.
> **Claude debe revisar y confirmar estas enmiendas; este texto no presume su aprobación.**

---

## 0. Diagnóstico histórico y decisión cerrada

### 0.1 Archivo histórico: lo que se encontró en React Native

> Esta sección conserva lecciones del intento anterior. La app RN quedó archivada el 13-ago-2026 en
> `desarrollo/_archivo-mobile-rn/` (antes `desarrollo/mobile/`); lo que seguía vigente se extrajo a
> `mobile_flutter/specs/HALLAZGOS-HEREDADOS-RN.md` y `specs/contrato/CONTRATOS-MODULOS.md`. No se
> mantiene, no recibe hotfixes y no es fuente de UI, arquitectura ni contratos para Flutter.

El stack RN **ya es el moderno**: RN 0.81.5 + React 19 + Expo SDK 54, New Architecture activada
(Fabric/TurboModules), Hermes, build nativo real con dev-client. No hay Expo Go ni bridge viejo.

La lentitud que percibiste tiene causas identificadas, y **ninguna es el framework**:

| # | Causa | Impacto |
|---|-------|---------|
| 1 | ~20 flujos de escritura llamaban endpoints inexistentes (contrato de API "imaginado"). Con timeout 15s + retry 2 de React Query = hasta **45 segundos de spinner** antes del error | El origen más probable de "la app es lenta". Ya corregido en 3 lotes, pero sin probar en tu teléfono |
| 2 | Reanimated prohibido por convención vieja (Expo Go, que ya no se usa). Toda animación gestual corre en hilo JS | Bottom sheets, drags y scroll se sienten pesados |
| 3 | 8 pantallas monolito de 1.000–2.000 líneas, **cero `React.memo`** en el repo | Cada tecleo re-renderiza el árbol entero |
| 4 | ~25 pantallas con `ScrollView` + `.map()` sin virtualizar (los 5 dashboards, calendar, reports...) | Jank en listas medianas |
| 5 | Splash bloqueado hasta cargar 6 TTF + hidratar SecureStore | Arranque lento |

**Traducción CEO:** arreglar eso en RN son ~1–2 semanas. La reescritura Flutter con paridad son ~10–14 semanas.
Pasando la idea por tu propio `WIDDO-FRAMEWORK-DECISION.md`: ningún cliente la pidió, no mueve retención ni
conversión directamente → el gate da 🔴. La app RN además ya tiene TestFlight activo (build #3), EAS, OTA updates
y 52 pantallas funcionando.

### 0.2 Por qué se eligió Flutter

La decisión se sostiene por estas razones:

1. **Decisión estratégica de largo plazo**: quieres un solo codebase mobile de alta calidad por 5+ años, UI 100%
   consistente iOS/Android, rendimiento predecible con motor de render propio (Impeller), y no depender del
   ecosistema Expo/EAS.
2. **La deuda RN te parece irrecuperable**: prefieres pagar el costo una vez que arrastrar 52 pantallas JSX sin
   tipos (el repo RN es JS puro; eso es lo que permitió que el contrato de API divergiera en silencio).
3. **Quieres empezar con el corte de producto correcto** (AI-native, menos pantallas, contract-first) en vez de
   seguir parchando la réplica CRUD.

Flutter es la decisión final. Capacidades que se reponen:
- **OTA updates de EAS** → se repone con **Shorebird** (code push para Flutter, funciona en App Store/Play).
- **Push de Expo** → se reemplaza por **FCM + APNs directo** (requiere ajuste menor en backend, ver §6.14).
- Las lecciones de rutas equivocadas se conservan, pero los fixes del cliente archivado **no son el contrato**:
  manda OpenAPI validado contra respuestas reales del backend.

---

## 1. Decisión de alcance (versión sencilla, paridad funcional con web)

### Regla de corte

**Decisión de Miguel (30-jul): v1 para 3 experiencias, no 6 roles.**

| Experiencia | Roles que la usan | Qué hace |
|-------------|-------------------|----------|
| **Director** | owner + admin (misma UI) | Cobrar, aprobar comprobantes, jugadores, asistencia, calendario, asistente IA |
| **Familia** | parent + **player mayor de 18** (misma UI: "mi cuenta" en vez de "mis hijos") | Pagar, ver deuda, subir comprobante, horarios, asistencia propia/de hijos, documentos |
| **Entrenador** | trainer | Sus categorías, sus jugadores, pasar asistencia + QR, sesiones, calendario |

- El jugador menor de edad NO usa la app: lo gestiona el padre (como en la práctica real).
- El jugador 18+ entra con su cuenta y ve la experiencia Familia sobre sí mismo (mis pagos, mi asistencia, mis horarios).
- **Accountant queda en web** por ahora (v1.1 si un club lo pide).
- Móvil replica la funcionalidad web **en versión sencilla y con UX móvil**; lo administrativo denso se queda en web.

### Queda FUERA de v1 (web-only, confirmado contra el inventario web)

- Super Admin completo (19 pantallas de plataforma)
- Vertical Organizer de torneos (back-office: wizard 53KB, brackets admin, sponsors, voluntarios, disputas, Stripe Connect onboarding) → **Fase 2 del producto**, es el wedge USA pero merece su propio ciclo
- Editores de plantillas (consentimientos, certificados, docs legales, requisitos de documentos) — en móvil solo se **consume/firma**, no se edita
- Matriz de permisos de rol, Import/Export masivo, File Vault admin (solo lectura en móvil), onboarding wizard de creación de club (se hace en web; móvil enlaza)
- Compliance/NCAA, Tryouts, Exenciones (WIP sin rutas ni siquiera en web)
- Config avanzada de pagos (niveles de mora escalonados) — solo lectura

---

## 2. Stack técnico Flutter (mejores prácticas 2026)

| Capa | Elección | Por qué |
|------|----------|---------|
| SDK | Flutter stable (3.32+), Dart 3.8+ | Impeller por defecto en iOS/Android |
| Estado | **Riverpod 3** (con codegen `riverpod_generator`) | Testeable, compile-safe, sin context, patrón idéntico a React Query con `AsyncNotifier` + invalidación |
| Navegación | **go_router** | Declarativo, deep links, guards por redirect, rutas tipadas con `go_router_builder` |
| HTTP | **dio** + interceptores | Refresh queue, headers, logging, retry configurable |
| Modelos | **freezed** + **json_serializable** | Inmutables, tipos estrictos — la vacuna contra el "contrato imaginado" |
| Storage seguro | **flutter_secure_storage** | Keychain (iOS) / Keystore+EncryptedSharedPreferences (Android) |
| Biometría | **local_auth** | FaceID/TouchID/huella, mismo flujo que hoy |
| Push | **firebase_messaging** + APNs | Estándar; reemplaza Expo Push |
| Realtime | **dart_pusher_channels** (o pusher_channels_flutter) apuntando a **Reverb** | Reverb habla protocolo Pusher; auth de canales privados vía POST `/broadcasting/auth` con Bearer |
| Chat IA streaming | `http` con `StreamedRequest` + parser SSE propio (o `flutter_client_sse`) | El endpoint `/assistant/chat-stream` es SSE; dio no lo maneja bien |
| Markdown chat | **gpt_markdown** (o flutter_markdown_plus) | Render de respuestas del asistente |
| i18n | **slang** (codegen, tipos) | EN default, ES y pt-BR obligatorios (regla del proyecto). Claves tipadas = imposible olvidar una traducción |
| QR | **mobile_scanner** | Cámara nativa para asistencia y check-in; es LA killer feature móvil |
| Imágenes | **image_picker** + **flutter_image_compress** | Comprobantes de pago, fotos de jugador, documentos |
| Cache local | **drift** (SQLite) o Hive CE — solo para cache de lectura | Arranque instantáneo con datos stale + refetch (stale-while-revalidate) |
| Errores | **sentry_flutter** | Org `widdo` ya existe; crear proyecto `flutter-mobile` |
| Calendario UI | **table_calendar** | Vista mes/agenda |
| Gráficas reportes | **fl_chart** | Reportes ligeros |
| OTA | **Shorebird** | Code push; recupera la iteración rápida que da EAS Update |
| Lint | **very_good_analysis** | Estricto desde el día 1 |
| E2E | **patrol** | Tests de integración con permisos nativos (cámara, biometría, push) |
| CI | GitHub Actions + Fastlane (o Codemagic) | Build, test, contract-check, deploy a TestFlight/Play Internal |

**Entornos: DOS, no tres** (corregido 2-ago). `dev` → servidor local (`localhost:8010`, o la IP de la
máquina para probar en un teléfono físico) y `prod` → `api.widdo.co`. Con `--dart-define-from-file`,
nunca credenciales escritas en el código.

**Por qué no hay un tercero llamado `staging`: no existe un servidor de pruebas.** Verificado — solo hay
desarrollo, el backend aislado de los tests automáticos (`:8020`) y producción. Un entorno `staging` no
tendría a dónde apuntar y acabaría señalando a producción, que es lo peor de los dos mundos: crees estar
en un sitio seguro y estás tocando datos de clubes reales. Se añade el día que exista un servidor de
pruebas de verdad.

El backend de tests (`:8020`) NO es un entorno de la app: es una variable de configuración para las
pruebas en dispositivo, no una versión distinta que se instale.

---

## 3. Arquitectura

### 3.1 Estructura (feature-first + capas)

```
mobile_flutter/
├── lib/
│   ├── main_dev.dart / main_prod.dart
│   ├── app/                    # MaterialApp, router, theme, bootstrap
│   ├── core/
│   │   ├── api/                # dio client, interceptores (auth, refresh queue, X-Mobile-Platform, unwrap data.data)
│   │   ├── auth/               # sesión, tokens, contexto activo, biometría
│   │   ├── realtime/           # cliente Reverb, canales, reconexión con backoff
│   │   ├── push/               # FCM/APNs, registro de token, deep link desde notificación
│   │   ├── storage/            # secure storage + cache drift
│   │   ├── theme/              # design system (§4)
│   │   ├── i18n/               # slang, resolución de locale (persistente como hoy)
│   │   └── utils/              # formatCurrency (COP default), fechas (¡puerto de dateUtils.js: fechas pierden 1 día!), status codes
│   ├── features/
│   │   └── <modulo>/
│   │       ├── data/           # repositorio + DTOs freezed + endpoints
│   │       ├── providers/      # Riverpod (queries + mutations)
│   │       └── ui/             # screens + widgets
│   └── shared/widgets/         # primitivas: AppScaffold, BottomSheet, FormField, SelectSheet, DateField, EmptyState, Skeleton, StatusBadge, RoleAvatar...
├── test/                       # unit + widget + golden
├── integration_test/           # patrol E2E
└── tool/contract_check.dart    # compatibilidad contra OpenAPI (§7)
```

### 3.2 Reglas duras del producto y del backend (no negociables)

- **Multi-tenant por petición**: Flutter mantiene un `ActiveContextProvider` y envía
  `X-Widdo-Context-Id` en toda petición autenticada. Un middleware del backend valida que ese contexto
  pertenezca a una membresía activa y lo aplica solo durante la petición. Nunca se cambia el club global
  del usuario para atender una petición móvil. Si la cabecera no viene, el backend conserva temporalmente
  `users.current_club_id` como fallback exclusivo de clientes web legacy. Al cambiar, Flutter elimina la
  cache sensible del club anterior.
- **Unwrap Laravel**: respuestas pueden venir `data.data` o `data` — un solo helper en `core/api`, nunca repetido por pantalla.
- **Status codes**: `COM=pagado, PEN=pendiente, OVD=vencido, PAR=parcial, CXL/BOR=cancelado, ACT=pagado, PEV=por verificar, AGR=acuerdo (fuera de deuda)`. **Vencido se calcula por `due_date`, nunca por status OVD** (regla canónica del proyecto).
- **Deuda** = `DEBT_STATUSES` + `owed()`/`overdue()` — replicar la definición canónica, no inventar otra.
- Header `X-Mobile-Platform: ios|android` en toda petición (mantener; el backend lo usa).
- `teams` es alias legacy de `categories` en la API.
- RBAC: la visibilidad en cliente es cosmética; **el servidor es quien autoriza**. Nunca asumir que ocultar un botón protege nada.

### 3.3 Patrón de datos (equivalente a React Query)

- `AsyncNotifierProvider.family` por recurso con `clubId` como parámetro.
- Stale-while-revalidate: render inmediato desde cache drift, refetch en background.
- Mutaciones invalidan su recurso + dashboard (mismo convenio que hoy).
- **Timeout 10s, retry 1** (no 15s×2 — la lección de los 45 segundos de spinner).
- Estados de error SIEMPRE visibles con acción de reintento; jamás spinner infinito.
- Eventos realtime → invalidar providers (mismo patrón que la web con React Query).

---

## 4. Design system (puerto del actual)

- Primario `#16a34a`, marca AI-native verde bosque `#0A3D2C`, light mode only en v1 (como hoy; dark mode = fase posterior).
- Fuentes: Inter (400/500/600/700) + Bricolage Grotesque (títulos AI-native) vía `google_fonts` con assets locales (no descarga en runtime).
- Colores por rol: owner `#16a34a`, trainer `#0891b2`, player `#7c3aed`, parent `#db2777`, accountant `#64748b` (DEFAULT + light).
- Componentes base con Material 3 + tema propio; el diseño sale de los specs aprobados, la marca Widdo y
  pruebas en dispositivo. El cliente archivado no es fuente de componentes ni medidas.
- Haptics en acciones primarias (`HapticFeedback`), skeletons en toda carga, pull-to-refresh universal.
- Íconos: `lucide_flutter` para mantener lenguaje visual con web.

---

## 5. Autenticación y seguridad (mejores prácticas)

### 5.1 Flujo de auth (idéntico al backend actual, Sanctum)

1. Login email+password → access token Bearer + `contexts[]`.
2. Tokens y usuario en **flutter_secure_storage** (Keychain/Keystore). NUNCA en SharedPreferences plano.
3. Refresh: `POST /api/auth/refresh-mobile` vía interceptor dio con **single-flight queue** (una sola petición de refresh; las demás esperan; el endpoint de refresh excluido del retry para evitar loops — mismo diseño que hoy).
4. 401 con refresh fallido → wipe de sesión + redirect a login (go_router redirect global).
5. **Biometría**: credenciales cifradas en secure storage con `accessControl` biométrico; `local_auth` para el prompt; luego login normal. Toggle en ajustes.
6. Registro (wizard), forgot/reset password, verificación de email, aceptar invitación por deep link `widdo://invitation/{token}` + universal links `https://app.widdo.co/...`.

### 5.2 Claves de storage y ciclo de vida

| Clave | Se borra al logout |
|-------|--------------------|
| access_token, user_data, contexts, active_context | Sí |
| onboarding_seen | No |
| biometrics_enabled, biometric_credentials | No |
| language_preference | No (elección explícita, como hoy) |

### 5.3 Hardening

- **Build**: `--obfuscate --split-debug-info` en release (símbolos a Sentry).
- **TLS**: solo HTTPS en prod; considerar pinning del cert de `api.widdo.co` con estrategia de rotación (pin del intermediate, no del leaf). Opcional v1, recomendado v1.1.
- **Sin datos sensibles en logs**: interceptor de logging solo en dev; 0 `print` en release (lint lo bloquea).
- **Deep links**: validar token/formato antes de navegar; pantallas públicas (enrollment, invitación) aisladas del shell autenticado.
- **Pantallas financieras**: `FLAG_SECURE` opcional en Android para bloquear screenshots (decisión de producto, no default).
- **Jailbreak/root detection**: NO en v1 (fricción > beneficio para este producto).
- **Secretos**: cero secretos en el repo; config por flavor con dart-define; llaves de firma en CI secrets.
- **Dependencias**: `dependabot` + `dart pub audit` en CI.
- Rate limiting y lockouts ya viven en backend — el cliente solo muestra los errores con claridad.

---

## 6. Plan módulo a módulo

Prioridad: **P0** = sin esto no hay app · **P1** = paridad esencial · **P2** = paridad completa · **F2** = fase producto 2.

| # | Módulo | P | Roles | Pantallas móvil | Notas UX móvil |
|---|--------|---|-------|-----------------|----------------|
| 1 | **Auth + onboarding** | P0 | todos | Login, registro (wizard 3 pasos), forgot/reset, verificar email, carrusel onboarding, biometría | Deep links de invitación e inscripción |
| 2 | **Shell + contexto** | P0 | todos | Tabs por rol, switcher de club/rol (bottom sheet), header con estado WS | Visibilidad derivada de roles/capacidades del contrato y specs aprobados |
| 3 | **Dashboard "Hoy"** | P0 | todos | 1 dashboard por rol (5), feed proactivo con daily brief IA + decision cards (owner/admin) | Hero + cards accionables; skeleton siempre |
| 4 | **Asistente IA** | P0 | todos | Chat SSE streaming, historial de conversaciones, suggested prompts, tool-result cards (PaymentCard, PlayerCard, SessionCard, BracketCard), envío de imágenes | Tab central para todos; sin voz en v1 (decisión ya tomada en el pivote). Autonomía IA: pantalla de configuración owner/admin (`/autonomy`) |
| 5 | **Jugadores** | P1 | owner, admin, trainer, accountant(ver) | Lista (búsqueda+filtros, virtualizada), detalle (tabs: datos, médico, pagos, asistencia, docs), crear/editar (form por pasos), foto con cámara | Validar elegibilidad edad↔categoría (bug conocido de RN: no validaba) |
| 6 | **Mis hijos** | P1 | parent | Lista hijos, detalle (4 tabs), editar contacto | |
| 7 | **Sesiones + calendario** | P1 | todos | Calendario mes/agenda, detalle sesión, CRUD + recurrencia (owner/admin/trainer), mis sesiones / sesiones de hijos | Pickers nativos de fecha/hora (en RN eran texto libre — corregir) |
| 8 | **Asistencia** | P1 | owner, admin, trainer / player+parent (propia) | Tomar asistencia (lista rápida tap-tap), **escaneo QR con cámara**, historial propio, reportes por jugador | La killer feature móvil; offline-tolerante (cola local si se cae la red) |
| 9 | **Pagos (admin)** | P1 | owner, admin, accountant | Lista con filtros (categoría, estado, mes), registrar pago, **verificar comprobantes** (viewer imagen + aprobar/rechazar), morosos, recordatorios | Verificación de comprobantes = flujo estrella del admin en móvil |
| 10 | **Mis pagos** | P1 | player, parent | Estado de cuenta, registrar pago + **foto de comprobante** (cámara + compresión), historial, recibos | El flujo real es manual: transferencia/Nequi/Daviplata/efectivo + comprobante → verificación. NO hay pasarela para padres (decisión vigente: Widdo cobra al club, no a padres) |
| 11 | **Cobros + descuentos** | P1 | owner, admin, accountant | Lista/CRUD cobros (mensualidad, matrícula...), descuentos | Formularios simples en bottom sheets |
| 12 | **Gastos** | P2 | owner, admin, accountant | Lista/CRUD, foto de factura | |
| 13 | **Reportes financieros** | P2 | owner, admin, accountant | Versión ligera: ingresos/gastos/balance del mes, cartera morosa (fl_chart) | Export PDF/Excel se queda en web; móvil enlaza |
| 14 | **Notificaciones** | P0 | todos | Centro in-app, push FCM/APNs, preferencias | ⚠️ Backend: hoy registra tokens Expo; hay que aceptar tokens FCM/APNs nativos (tarea backend pequeña, el soporte FCM ya existe según preferencias) |
| 15 | **Realtime** | P1 | todos | Canales `notifications.{userId}`, `club.{id}.payments`, `club.{id}.sessions` → invalidación; indicador de conexión; fallback polling suave (60s, no 30s) | |
| 16 | **Documentos** | P2 | player, parent / owner, admin | Mis documentos (subir foto/PDF), revisión y aprobación (admin) | Cámara + compresión; misma cola de calidad/visión LLM del backend |
| 17 | **Consentimientos/firmas** | P2 | firmantes | Ver pendientes de firma, firmar (canvas) vía flujo por token | Solo consumo; edición de plantillas = web |
| 18 | **Categorías, entrenadores, sedes, staff** | P2 | owner, admin | Listas + CRUD simple, invitar staff/entrenador | |
| 19 | **Inscripción pública** | P1 | público | Deep link `/inscripcion/{club}/{token}` — wizard completo sin auth | Normalización de documento con puntos YA resuelta en backend |
| 20 | **Inventario** | P2 | owner, admin | Lista stock, entregas | |
| 21 | **Cobranza (collections)** | P2 | owner, admin, accountant | Vista simple de ciclo + acciones de recordatorio | La vista web `/home/collections` como referencia |
| 22 | **Torneos (club)** | P2 | todos | Mis torneos, detalle, resultados live (canal público `tournament.{id}`), rankings | Solo consumo; crear/administrar = web |
| 23 | **Perfil + ajustes** | P0 | todos | Perfil, cambiar password, idioma, notificaciones, biometría, privacidad, eliminar cuenta (obligatorio Apple), ayuda | |
| 24 | **Suscripción SaaS** | P2 | owner | **Solo lectura** (plan, límites) + enlace a web para gestionar | ⚠️ Apple IAP: cobrar la suscripción con Stripe dentro de la app viola guidelines → nunca checkout in-app; solo informativo |
| 25 | **Referidos** | P2 | todos | Ver código, compartir (share sheet nativo) | |
| 26 | **Organizer / torneos back-office** | F2 | organizer | Check-in QR día-del-torneo, live scoring móvil, monitor | El wedge USA; ciclo propio post-v1 |

---

## 7. Contract-first: la vacuna contra una API imaginada

Documento operativo: `mobile_flutter/specs/00-CONTRATO-API.md`.

La lección más cara del intento anterior: **se escribió contra una API imaginada**. En Flutter esto se previene desde el día 1:

1. **Publicar OpenAPI real para el subconjunto móvil**, no para las 1.087 rutas de una vez: ruta,
   autenticación, headers, parámetros, request, respuesta exitosa, errores y ejemplos.
2. **Normalizar primero las salidas** con API Resources o DTOs explícitos. Los Form Requests describen
   lo que entra; no describen lo que sale. `route:list` solo demuestra que una ruta existe.
3. **Generar/verificar DTOs Dart** contra OpenAPI. Campos incompatibles y enums nuevos deben fallar en CI.
4. **Test de compatibilidad en el backend**: un cambio incompatible del esquema móvil bloquea el merge;
   las pruebas funcionales comprueban que la respuesta real cumple el documento.
5. **Regla de oro**: contrato → Resource/DTO backend → modelo Dart → repositorio/provider → UI → E2E.
6. Envelope, errores, `Money`, paginación, enums y `available_actions` son comunes a todos los módulos.

---

## 8. Testing y calidad

| Nivel | Herramienta | Gate |
|-------|------------|------|
| Estático | very_good_analysis + `dart analyze` | 0 warnings (ratchet desde día 1, sin el falso verde de rtk: verificar salida literal) |
| Unit | test estándar — repos, providers, utils (fechas, moneda, deuda) | Por PR |
| Widget/golden | golden_toolkit — pantallas clave por rol | Por PR |
| Contrato | OpenAPI + prueba de esquema real + compatibilidad Dart | Por PR, obligatorio |
| Integración E2E | patrol contra backend E2E aislado (puerto 8020, `db_e2e`) con usuarios seed (`director@bogotafc.co`...) | Nightly + pre-release |
| Crash/monitor | Sentry (proyecto nuevo `flutter-mobile`) | Desde el primer TestFlight |

CI (GitHub Actions): analyze → tests → contract-check → build por flavor. Release: Fastlane → TestFlight / Play Internal; Shorebird patch para fixes de Dart sin pasar por review.

---

## 9. Roadmap por fases (founder + agentes Codex/Claude)

> ⚠️ **SUSTITUIDO.** Esta tabla F-1…F6 fue el plan original de julio. La ejecución real va por los
> bloques **B0–B8** de `mobile_flutter/specs/ARRANQUE.md`, que es donde está el estado vigente.
> Se conserva por el reparto de alcance y las estimaciones, no como secuencia a seguir.

Estimaciones realistas asumiendo tu ritmo actual con agentes; cada fase termina con QA tuyo en dispositivo (la lección del RN: "probado con llamadas API" ≠ probado en el teléfono).

| Fase | Contenido | Duración |
|------|-----------|----------|
| **F-1 — Backend listo para móvil** | Bugs de corrupción, contexto por petición, auth/refresh/realtime, OpenAPI base, Resources/DTOs e idempotencia de dinero | 1–2 sem, en paralelo parcial con F0 |
| **F0 — Fundaciones** | Repo, flavors, CI, theme, dio + interceptores (refresh queue, unwrap, headers), secure storage, go_router + guards, slang EN/ES/PT, Sentry, catálogo de contrato + contract-check | 1,5 sem |
| **F1 — Auth + shell** | Login/registro/recuperación/verificación, biometría, contextos multi-club, tabs por rol, perfil/ajustes, deep links | 1,5 sem |
| **F2 — Núcleo diario** | Dashboards por rol, asistente IA (SSE + historial + tool cards), notificaciones (push FCM + centro + realtime) | 2,5 sem |
| **F3 — Operación** | Jugadores, mis hijos, sesiones + calendario, asistencia + QR | 2,5 sem |
| **F4 — Dinero** | Pagos admin + verificación de comprobantes, mis pagos + comprobante foto, cobros, descuentos | 2 sem |
| **F5 — Paridad P2** | Gastos, reportes ligeros, documentos, consentimientos, categorías/entrenadores/sedes/staff, inventario, cobranza, torneos consumo, referidos, suscripción read-only, inscripción pública | 3 sem |
| **F6 — Ship** | Hardening (obfuscación, pinning), Shorebird, QA E2E patrol, TestFlight externo + Play Internal, metadata/screenshots | 1 sem |

**Recalculado por Codex el 31-jul para ejecución intensiva con agentes y alcance progresivo:**

| Hito | Contenido | Cuándo |
|------|-----------|--------|
| Semanas 1–2 | F-1 backend + F0 Flutter en paralelo; login/contexto instalable al cerrar los gates | **alpha técnica** |
| Semanas 3–5 | Asistencia+QR offline, familia+comprobante y director+aprobación, en cortes verticales | **beta reducida** |
| Semanas 6–8 | Calendario/jugadores, push/realtime, IA, hardening y tiendas | **release candidate** |
| Semanas 10–14 | Solo si se exige la paridad completa de las 67 pantallas inventariadas | **paridad amplia** |

Lo que la IA comprime: escribir el código (días, sí). Lo que NO se comprime: QA de Miguel en su teléfono
(viernes mínimo), revisión de Apple (1–3 días por build externo), arreglos backend con su propio QA, y la
aprobación de los specs. Varios agentes comprimen implementación y revisión, pero no eliminan dependencias,
integración, QA real, seguridad de pagos ni aprobación de tiendas. Objetivo: alpha 1–2 semanas, beta reducida
3–5, RC 6–8; la paridad completa sigue siendo 10–14 semanas.

---

## 10. Riesgos y decisiones abiertas

| Riesgo | Mitigación / decisión |
|--------|----------------------|
| Confundir el archivo RN con una segunda app activa | RN está archivado: cero mantenimiento y cero reutilización como fuente; Flutter es la única app futura |
| Intentar construir las 67 pantallas a la vez | Cortes verticales usables y medibles; máximo dos cortes en vuelo al inicio |
| Tokens push: backend espera Expo | Tarea backend: aceptar FCM/APNs (pequeña; FCM ya soportado en preferencias) |
| SSE + markdown streaming en Flutter | Más artesanal que en RN; spike de 1 día en F0 para validar contra `/chat-stream` real |
| Reverb desde Dart | Protocolo Pusher estándar; spike en F0 con canal `club.{id}.payments` |
| Apple: cuenta Individual, conversión a Organization pausada | La reescritura no lo cambia; mismo bundle `co.widdo.app` puede reutilizar el ASC App ID existente (misma app, binario nuevo) — evita review desde cero |
| i18n: la web tiene 34 namespaces | v1 traduce solo el subconjunto móvil (~equivalente a las 188 claves actuales + P2); default EN, regla del proyecto |
| Pérdida de OTA EAS | Shorebird desde F6 |
| Fechas pierden 1 día (bug histórico web) | Portar la lógica de `dateUtils.js` a `core/utils/dates.dart` con tests desde F0 |

---

## 11. Playbook de producto (modo YC) — en lenguaje simple

> Añadido 30-jul a petición de Miguel. Sin jerga: cómo montaría Widdo móvil una startup de Silicon Valley.

### 11.1 Decisión cerrada: Flutter

Miguel eligió Flutter por fluidez y mantenibilidad móvil. La decisión no se reabre en cada sesión. El éxito
depende además de contrato verificable, cortes verticales, pruebas semanales y medición de uso.

### 11.2 Qué haría un CEO de YC

1. **Elegir AL usuario, no a los 6 roles.** ¿Quién abre la app todos los días? Dos personas:
   - **El director del club**: cobrar, ver quién pagó, aprobar comprobantes, pasar asistencia.
   - **El padre**: pagar, ver cuánto debe, ver a su hijo (horarios, asistencia).
   El resto de roles entran después. La app v1 se diseña para esas dos personas y sus 5 acciones más frecuentes.
2. **Design partners**: los 3 clubes que pagan son los co-diseñadores. Cada viernes reciben la versión nueva
   en su teléfono y se les pregunta: ¿qué usaste? ¿qué te estorbó? Sus respuestas mandan sobre cualquier opinión interna.
3. **Spec primero, código después.** Nada se construye sin su ficha escrita y aprobada (ver 11.4).
   Es la lección más cara de la app actual: se construyó contra suposiciones y la mitad de los botones fallaba.
4. **Enviar cada semana.** Versión instalable en tu iPhone todos los viernes desde la semana 3, aunque solo
   tenga login. Lo que no se puede tocar en un teléfono no existe.
5. **Medir 2 números, no 20:**
   - ¿Los padres de los 3 clubes abren la app cada semana? (retención)
   - ¿% de pagos reportados desde el móvil vs web/WhatsApp? (¿resuelve el trabajo real?)
   Si a las 6 semanas los padres no la abren, el problema es de producto, no de código — y se corrige el spec, no se agregan pantallas.

### 11.3 Principios UI/UX (el estándar a exigir)

- **Referencia de calidad**: Revolut / Rappi / Cash App. No "app de gestión": app de consumo que maneja dinero.
- **Regla de los 2 taps**: las 5 acciones frecuentes (ver deuda, pagar/subir comprobante, aprobar pago, pasar asistencia, ver horario) a máximo 2 toques desde abrir la app.
- **Una mano**: todo lo importante en la mitad inferior de la pantalla. Botones de acción abajo, nunca arriba.
- **Cada pantalla con sus 4 estados diseñados**: cargando (esqueleto gris animado, nunca ruedita), vacío (mensaje + qué hacer), error (qué pasó + botón reintentar), y con datos. La app actual falló por saltarse esto: error = ruedita infinita.
- **Nunca esperar sin saber por qué**: toda acción responde al instante (el resultado aparece ya y se confirma por detrás; si falla, se avisa y se deshace).
- **El teléfono es el superpoder**: cámara para comprobantes y carnés QR de asistencia, notificaciones push como canal al padre (regla ya establecida: push, no WhatsApp), huella/cara para entrar.
- **Idioma**: inglés por defecto, español y portugués completos (regla del proyecto).
- **Escribir poco**: formularios mínimos, selectores en vez de texto libre, fechas con rueda nativa, autocompletar todo lo posible.

### 11.4 El "spec de todo todo": ficha por módulo (PRD)

Cada módulo tendrá una ficha en `mobile_flutter/specs/<modulo>.md` extraída del frontend web real + backend real
(no de memoria). Plantilla:

| Sección | Contenido |
|---------|-----------|
| Historia | "Como [padre], quiero [ver cuánto debo] para [pagar a tiempo]" |
| Quién la ve | Roles exactos y qué ve cada uno |
| Pantallas | Lista con boceto en texto de cada una |
| Estados | Cargando / vacío / error / con datos — qué muestra cada uno |
| Campos y validaciones | Cada campo, obligatorio u opcional, formato, mensaje de error exacto (fuente: reglas del servidor, que son las que mandan) |
| Conexiones al servidor | Qué se pide, qué se envía, qué responde (copiado del código real) |
| Casos borde | Sin internet, dato duplicado, permiso denegado, club suspendido... |
| Qué NO hace | Explícito, para que nadie lo agregue "de paso" |
| Cómo se prueba | Pasos de verificación en el teléfono |

Los specs pueden investigarse con agentes en paralelo, con propietario único por módulo y revisión cruzada
Codex/Claude según `00-ORQUESTACION-AGENTES.md`. **Tú apruebas cada ficha antes de construirla**: apruebas
comportamiento en español claro, no código.

## 12. Primer paso si apruebas

1. Crear `desarrollo/mobile_flutter/` con git propio + F0 completa.
2. Spikes de riesgo (3 días): SSE chat real, Reverb desde Dart, FCM contra backend.
3. Marcar `mobile/` como archivo histórico y excluirlo de decisiones y generación de código.
4. QA checkpoint contigo al final de cada fase, en tu iPhone vía TestFlight interno.

— Fin del plan —
