# Anexo al Plan Flutter — Preparación del backend saas_sport

> ## ✅ CERRADO — los 9 bloqueadores están arreglados y en producción (13-ago-2026)
>
> **Este anexo ya no es una lista de trabajo pendiente.** Todo lo de §2 se cerró y desplegó
> (los seis de A3 con los merges `196045c` + `5a8c858` el 3-ago; el resto antes). Se conserva
> porque el **diagnóstico** sigue siendo la mejor explicación de *por qué* el backend funciona como
> funciona hoy: por qué existe `X-Widdo-Context-Id`, por qué el refresh móvil es rotatorio, por qué
> hay `Idempotency-Key`, por qué `pending-verification` solo pagina si le mandas `per_page`.
>
> Estado vivo y siguiente paso: **`mobile_flutter/specs/ARRANQUE.md`**.
> Único pendiente heredado de aquí: 🔴 definir **`REVERB_PUBLIC_HOST`** en el servidor (operación,
> no código). Hasta entonces `app-config` devuelve `realtime.enabled = false` a propósito.
>
> ### ⚠️ Renumerado para no chocar con los bloques B0–B8 de ARRANQUE.md
>
> La tabla de §2 usaba `B0`…`B8` para *bloqueadores de servidor*. `ARRANQUE.md` usa `B0`…`B8` para
> *slices de la app Flutter* (B3 = asistencia, B4 = familia…). Son cosas distintas y se confundían.
> **Los de este documento pasan a la numeración `A` de ARRANQUE.md**; entre paréntesis queda la letra
> vieja por si algún documento antiguo la cita.

> Fecha: 30 julio 2026 · Complementa `PLAN-WIDDO-FLUTTER.md` (§5 auth y §10 riesgos)
> **Ajuste técnico de Codex — 31 julio 2026.** Segunda revisión del backend real. La autenticación base
> sirve para un cliente nativo, pero el sistema completo **no está listo tal cual**: contexto multi-club,
> refresh, realtime y contratos requieren cambios previos. Claude debe revisar y confirmar esta enmienda.
> React Native queda archivado y no forma parte del flujo futuro.
> **Endurecimiento de Codex — 3 agosto 2026, pendiente de revisión/commit:** la idempotencia ya
> desplegada necesitaba alcance por endpoint, recuperación de reservas abandonadas y limpieza; además,
> la cancelación de un cobro debía ser atómica. Cambios en `codex/mobile-readiness-backend`.

---

## 1. Auth desde Flutter — flujo real que ya funciona

Base: `{APP_URL}/api`. Envelope: `{status, message, data}` (`app/Traits/HttpResponses.php`).

**Headers obligatorios en todas las peticiones:**

| Header | Valor | Nota |
|--------|-------|------|
| `Accept` | `application/json` | sin él, redirect a `/login` |
| `X-Mobile-Platform` | `ios` \| `android` | **sin este header el login NO devuelve `access_token`** — setea cookie de sesión (`AuthController.php:125`) |
| `X-Language` | `es` \| `en` \| `pt` | `SetLocale.php` |
| `Authorization` | `Bearer <token>` | tras login |

**Flujo:**
1. `POST /api/login {email, password}` → `data`: `user`, `contexts[]` (con `role`, `club_id`, `permissions[]`...), `default_context_id`, `modules[]`, `onboarding{}`, `access_token` (PAT Sanctum `widdo-mobile-{platform}`, abilities `*`). Rate limit 5/min por IP en prod.
2. Registro: `POST /api/register` → código de 6 dígitos por email (15 min) →
   `POST /api/verify-email {email, code}` → crea usuario + auto-login con `access_token`.
3. Con invitación: `GET /api/invitations/{token}/validate` → `POST /api/register` con `invitation_token` → salta verificación.
4. ⚠️ **Desactualizado — usa `POST /api/auth/token/refresh`** (ver A3.4 en §2). Es el refresh rotativo
   real, va **sin auth** a propósito y el `refresh_token` llega en el cuerpo del login nativo.
   `POST /api/auth/refresh-mobile` (lo que describía esta línea) quedó **DEPRECADO** aunque siga vivo.
   NO usar `/api/auth/refresh` ni `/revoke` (leen cookie httpOnly, inservibles en móvil).
   NO usar `/api/refresh-token` legacy (crea PATs infinitos sin revocar — fuga).
5. `POST /api/logout` → borra solo el token en uso.
6. Reset password: `POST /api/forgot-password` → email con URL **web** (no deep link) → `POST /api/reset-password`.

**No hace falta:** `/sanctum/csrf-cookie`, `SANCTUM_STATEFUL_DOMAINS`, CORS (no aplica a clientes nativos, no hay lógica por Origin).

**Ya listo también:** asistente IA SSE con Bearer (`/api/v1/assistant/chat-stream`, `text/event-stream` sin buffering — usar Dio `ResponseType.stream`), endpoints públicos (enrollment, invitaciones, torneos `/api/public/*`), canales públicos de torneo (no pasan por `/broadcasting/auth`), y **push tokens FCM**: `POST /api/push-tokens` acepta tokens no-Expo y `PushChannel` los enruta a FCM HTTP v1 (FCM ya configurado con `FCM_PROJECT_ID`/`FCM_CREDENTIALS_PATH`). Mejor de lo que asumía el plan (§10 decía "backend espera Expo" — en realidad FCM ya está soportado).

---

## 2. Bloqueadores backend — ✅ TODOS CERRADOS Y EN PRODUCCIÓN

Numeración `A` de `ARRANQUE.md`; entre paréntesis, la letra `B` vieja de este documento.

| # | Problema | Dónde | Cómo se resolvió |
|---|----------|-------|------------------|
| **A1** (ex B0) | **Bugs capaces de corromper dinero o personas**: exclusión de cobranza por nombre/null, duplicado que actualiza jugador, borrador con efectos, categoría sin aislamiento | cobranza + jugadores | ✅ En prod el 31-jul (`9384f8b`, `24242ac`): 4 bugs + 5 fallos de autorización entre clubes + 3 extra, 27 tests adversos verificados fallando antes del arreglo |
| **A3.1** (ex B1) | **`/broadcasting/auth` no acepta Bearer** por doble registro con middleware distinto | bootstrap + provider | ✅ `POST /api/broadcasting/auth` con las mismas reglas de `channels.php`; la ruta web queda intacta |
| **A3.2** (ex B2) | **El contexto activo vive en `users` y lo comparten web, tokens y dispositivos.** Dos peticiones concurrentes pueden cambiarse de club entre sí | `ContextController`, `ClubScope`, middleware | ✅ `X-Widdo-Context-Id` → `ResolveRequestContext`, **en memoria y sin escribir en BD**, registrado antes de `SetClubTimezone`. Sin cabecera se lee `users.current_club_id` como siempre (fallback para la web legacy) |
| **A3.3** (ex B3) | **`contexts/switch` asume sesión** y da 500 con Bearer | `ContextController` | ✅ Reproducido (`Session store not set on request`, 500 **después** de escribir) y arreglado con `hasSession()` |
| **A3.4** (ex B4) | **Refresh móvil no recupera un token vencido y rota de forma destructiva** | `AuthController` | ✅ `POST /auth/token/refresh`, **sin auth a propósito**; el login nativo devuelve `refresh_token` en el cuerpo. Reutilizar uno gastado se trata como robo y caen todas las sesiones. `/auth/refresh-mobile` queda DEPRECADO pero vivo |
| **A2.1** (ex B5) | **Contrato de salida irregular**: 45 Form Requests y un solo API Resource; envelopes distintos por controlador | API completa | ✅ `saas_sport/openapi/mobile-v1.yaml` en prod (`982e1b9`) + prueba de conformidad en CI (verificado que muerde) + `oasdiff` y `php artisan api:contract-check` (811 llamadas, 25 dinámicas, **0 muertas**) |
| **A3.6** (ex B6) | **Idempotencia implementada; endurecimiento pendiente** | pagos/installments | ✅ `Idempotency-Key` acotada por endpoint, liberación tras error, recuperación de reservas a los 10 min y poda diaria. `pending-verification` pagina **solo si llega `per_page`** (tope 100): la web sigue recibiendo su lista plana |
| **A3.7** (ex B7) | **Autorización/errores incompletos**: lecturas de asistencia sin permiso, catches que devuelven 500, `password-policy` sin método, consumidor web de `payments/pending-summary` sin ruta | asistencia/auth/pagos | ✅ Corregido por slice con tests 401/403/404/422. Los huecos que destaparon los specs (consentimientos, ocurrencias, Ley 1581, canal `club.{id}.consents`) se cerraron el 7-ago (`3451088`, 14 tests adversos) |
| **A3.5 + A3.8** (ex B8 y R3) | **Payloads pesados y sin versión mínima**: pendientes sin paginar, daily brief cacheado 15 min sin invalidación, FCM sin config APNs/Android | dashboard/push | ✅ Paginación opt-in, invalidación tras mutaciones y `GET /api/app-config` público, con la **versión mínima decidida por el servidor**, no por el cliente. Push nativo con `installation_id` sigue pendiente y va con la slice B7 de la app |

**El patrón que permitió centralizar sin romper la web: el cliente nuevo OPTA POR ENTRAR.** Sin la
cabecera y sin `per_page`, el servidor responde exactamente igual que antes. La web no manda ninguna
de las dos, así que su comportamiento es idéntico — y hay test de ello en las dos mitades.

## 3. Recomendados (no bloquean arranque)

> De esta lista ya se hicieron **R2** (el refresh rotativo de A3.4 con su ventana de gracia; el mutex
> single-flight está implementado en Flutter) y **R3** (`GET /api/app-config`, que además resolvió
> **R6**: host/puerto de Reverb se descubren ahí — falta solo definir `REVERB_PUBLIC_HOST` en el
> servidor). El resto sigue abierto; **R4** (`installation_id`) va con la slice B7 de push.

| # | Qué | Detalle |
|---|-----|---------|
| R1 | Push iOS incompleto | `buildFcmPayload` sin bloque `apns` (sound, badge, content-available) ni `android.notification.channel_id` (`PushChannel.php:195-215`). Push básico funciona; silent push y badge no |
| R2 | Rotación destructiva en refresh | `refreshMobile` borra el token ANTES de crear el nuevo; respuesta perdida en red móvil = logout. Añadir ventana de gracia. Y en Flutter: mutex single-flight obligatorio (N 401 concurrentes = N refreshes = logout espurio) |
| R3 | Sin endpoint de versión mínima / forced upgrade ni `X-App-Version` | Crear `GET /api/app-config` con `min_version` por plataforma |
| R4 | Push tokens sin `device_id` | Reinstalar = fila nueva; tokens FCM rotados quedan huérfanos. Añadir `installation_id` + upsert |
| R5 | Reset password apunta a web | Añadir deep link `widdo://reset-password` o parámetro `platform` |
| R6 | Reverb sin descubrimiento | Host/puerto/scheme hardcodeados en cliente; `.env` dev incoherente (`REVERB_PORT=6001` vs `REVERB_SERVER_PORT=8080`). Meter en `/api/app-config` |
| R7 | Versionado mezclado (`/api/login` vs `/api/v1/assistant`) | Documentar; no tocar rutas existentes |
| R8 | Sesiones móviles invisibles | Todos los PAT se llaman `widdo-mobile-{platform}`; `GET /api/auth/active-sessions` solo lista refresh_tokens web. Usuario no puede revocar un dispositivo suelto (solo `revoke-all`, que mata también la web) |
| R9 | Header `X-Session-Refresh-Suggested` nunca se emite para PATs móviles (`expires_at` null a nivel de fila) | El cliente debe refrescar proactivo (cada 30–45 min de app activa) — ya contemplado en el plan |

## 4. Impacto en el roadmap del plan

- **F-1 es un track backend explícito**, no un “mini-lote”: B0–B6 tienen gates por corte vertical.
- F0 Flutter puede avanzar en paralelo en repo, CI, diseño, navegación, observabilidad y modelos generados.
- Login/contexto no pasa de alpha hasta B1–B4. Dinero no entra en beta hasta B0, B5 y B6.
- SSE es viable; Reverb requiere B1; FCM ya existe, pero faltan payload nativo, `installation_id` y app-config.
- Orden de cortes: login+contexto → asistencia+QR → familia+comprobante → director+aprobación →
  calendario/jugadores → push/realtime → IA → paridad restante.

### Retiro controlado del fallback web

- Registrar métrica/log estructurado cuando una petición autenticada con club use el fallback.
- No aceptar fallback en rutas declaradas `mobile-v1`; ausencia de cabecera desde Flutter es error estable.
- Migrar la web módulo por módulo, empezando por pagos y operaciones de escritura.
- Eliminar `users.current_club_id` como fuente de autorización cuando el uso del fallback sea cero durante
  un ciclo de release y pasen tests concurrentes con dos clubes, navegador y teléfono.

— Fin del anexo —
