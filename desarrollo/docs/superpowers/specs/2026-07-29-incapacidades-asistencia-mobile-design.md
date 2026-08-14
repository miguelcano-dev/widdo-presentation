# Diseño: Incapacidades de jugadores + arreglo móvil del modal de asistencia

> ## ✅ EJECUTADO Y EN PRODUCCIÓN (estado al 13-ago-2026)
>
> Verificado contra el código: 54 archivos tocan incapacidades. Frontend:
> `components/payments/detail/PaymentDetailIncapacity.jsx`,
> `components/payments/IncapacityAdjustmentDialog.jsx`, `IncapacityOverlapNote.jsx`.
> Backend: `app/Services/IncapacityAdjustmentService.php` y las rutas de incapacidad en
> `routes/api.php`.
>
> El ajuste económico derivado vive en su spec propio:
> `2026-07-30-cobros-por-incapacidad-design.md`.


**Fecha:** 2026-07-29
**Estado:** Aprobado por Miguel (conversación 29-jul)
**Repos:** `desarrollo/frontend/` (React) + `desarrollo/saas_sport/` (Laravel)

## Problema

1. El drawer "Registrar Asistencia" (`SessionAttendanceDrawer.jsx`) falla en Android: al girar la pantalla el modal pierde scroll, el filtro no funciona bien, los nombres largos no se ajustan y no hay foto del jugador — difícil identificar quién es quién.
2. No existe forma de reportar una incapacidad médica de un jugador. Las ausencias por incapacidad cuentan como ausencias normales (badge de ausencias, % de asistencia) y generan cargos en clubes con cobro por asistencia.

## Decisiones tomadas

| Tema | Decisión |
|------|----------|
| Permisos | Trainer, Admin y Owner crean/cierran incapacidades. Padre solo lectura. |
| Cobros per-attendance | Sesiones dentro del rango de incapacidad NO generan cargo, automático. |
| Adjunto | Certificado médico opcional (imagen o PDF). Imágenes comprimidas en navegador (máx 1600px, JPEG calidad 0.8). PDF sin tocar. |
| Notificación | Push + in-app al acudiente al registrar incapacidad. NO WhatsApp. |
| Agente IA | Tools de chat: consultar incapacidades activas + registrar una. Agente de voz NO. |
| Vigencia | `end_date` nullable = "hasta nuevo aviso". Acción "dar de alta" cierra antes. |
| Visibilidad | Jugador incapacitado visible en el listado de asistencia: atenuado, badge "Incapacitado", pre-marcado `excused`, excluido de totales. Nunca oculto. |
| i18n | EN/ES/PT completo, default inglés, sin hardcodear español. |

## Backend (Laravel)

### Nueva tabla `pla_player_incapacities`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | bigint PK | |
| `club_id` | FK `bas_clubs` | ClubScope obligatorio |
| `player_id` | FK jugador | |
| `start_date` | date | |
| `end_date` | date nullable | null = hasta nuevo aviso |
| `description` | text | |
| `document_path` | string nullable | Spaces, URL firmada al servir |
| `status` | string(3) | `ACT` activa, `FIN` finalizada (alta), `BOR` borrada (soft) |
| `created_by` | FK users | |
| timestamps + softDeletes | | |

Modelo `PlaPlayerIncapacity` con trait de protección multi-tenant (mismo patrón `ProtectedModel`/ClubScope del resto), scope `active()` (status ACT y hoy dentro de [start_date, end_date ?? ∞]).

### Migración de status en asistencia de sesiones

`pla_club_teams_sessions_attendances`: agregar columna `status` string (`present|absent|late|excused`).

- Backfill: `attended=true + notes='Llegó tarde'` → `late`; `attended=true` → `present`; `attended=false` → `absent`.
- `attended` se mantiene (compatibilidad con reportes/queries existentes) y se sigue escribiendo: `excused` guarda `attended=false`.
- `storeAttendance()` en `PlaClubTeamSessionController` acepta `excused` y escribe la columna nueva; `normalizedAttendanceStatus()` lee la columna en vez de inferir por notes. El hack `notes='Llegó tarde'` muere para registros nuevos.

### Efectos automáticos de una incapacidad

Al crear (o editar rango de) una incapacidad ACT:

1. Sesiones del jugador dentro del rango con fecha >= hoy: al registrarse asistencia, el jugador llega pre-marcado `excused` (el entrenador puede sobreescribir si de hecho asistió).
2. Registros de asistencia ya guardados de fechas pasadas NO se modifican.
3. Cargos per-attendance: la generación de cargos por asistencia consulta incapacidades activas y omite sesiones dentro del rango. Al dar de alta (`FIN`) o expirar `end_date`, sesiones posteriores vuelven a comportamiento normal.

### Endpoints

- `GET /clubs/{club}/players/{player}/incapacities` — historial (roles: Owner, Admin, Trainer; Parent solo de sus hijos).
- `POST /clubs/{club}/players/{player}/incapacities` — crear (Owner, Admin, Trainer). Validación: `start_date` requerida, `end_date >= start_date` si viene, `description` requerida, `document` opcional (jpg/png/pdf, máx 10MB). Rechazar solapamiento con otra ACT del mismo jugador.
- `PATCH .../incapacities/{id}/discharge` — dar de alta (status FIN, setea `end_date` = hoy si era null).
- `DELETE .../incapacities/{id}` — soft delete (status BOR).
- **Todos con `authorize()` explícito** (regla del proyecto post-auditoría RBAC).
- Endpoint de asistencia de sesión: incluir `photo_url` (URL firmada) y `active_incapacity` (id, fechas) por jugador en la respuesta.

### Notificación

Evento al crear incapacidad → notificación in-app (canal `notifications.{userId}`) + push a acudientes del jugador. Plantilla trilingüe siguiendo `MailLocale`/plantilla única si aplica correo (solo push + in-app en v1, sin correo).

### Tools agente IA (chat)

- `get_player_incapacities` (read): incapacidades activas/historial de un jugador o listado de activas del club.
- `create_player_incapacity` (write): registrar incapacidad (jugador, fechas, descripción). Respeta roles: solo disponible para Owner/Admin/Trainer.

## Frontend (React)

### 1. `PlayerPhotoLightbox` (nuevo componente compartido)

Extraer el modal de foto inline de `PlayersModals.jsx:298` a `src/components/players/PlayerPhotoLightbox.jsx`: overlay oscuro, foto grande (`max-h-[75vh]`), nombre + edad debajo, botón cerrar, cierre por tap fuera/Escape. `PlayersGrid` y el drawer de asistencia lo consumen.

### 2. Fila de jugador en `SessionAttendanceDrawer`

- Avatar pequeño (~40px) con foto real del jugador (URL firmada del endpoint); fallback iniciales. Tap/click en avatar abre `PlayerPhotoLightbox` (no cambia el estado de asistencia).
- Tap en el resto de la fila cicla/selecciona estado como hoy.
- Nombre: wrap a 2 líneas máx (`line-clamp-2`), se reacomoda al rotar (flex + `min-w-0`). Nombre completo siempre visible en el lightbox.
- Badge "Incapacitado" cuando hay incapacidad activa; fila atenuada; estado inicial `excused`.
- Nueva acción por jugador: "Reportar incapacidad" (abre form).

### 3. Fix layout Android/iOS del drawer

- Contenedor: `h-[100dvh]` (no `vh`), `env(safe-area-inset-*)` en header/footer.
- Estructura: header fijo + zona búsqueda/acciones fija + lista `flex-1 min-h-0 overflow-y-auto` + footer fijo. Nada de alturas fijas en px.
- Al rotar: la lista conserva scroll y el input de búsqueda sigue filtrando (el filtro hoy se rompe por re-render/estado — verificar y corregir causa raíz durante implementación).
- Stats del header (Total/Presentes/Tardanzas/Ausentes) colapsan a fila compacta en landscape/alturas pequeñas.

### 4. Form "Reportar incapacidad"

Modal accesible desde: fila del drawer de asistencia, card/listado de `/home/players`, panel del jugador.

Campos: fecha inicial (default hoy), fecha final (opcional, checkbox "hasta nuevo aviso"), descripción (requerida), adjunto opcional. DatePickers existentes del catálogo. Compresión de imagen en cliente antes de subir reutilizando `src/utils/fileOptimizer.js` (`optimizeImage()`: canvas + calidad adaptativa, ya soporta HEIC); PDF sin tocar.

Atajo en el drawer: "Solo esta sesión" → crea incapacidad con `start_date = end_date = fecha de la sesión`.

### 5. Contadores y stats

- Badge de ausencias (el "4" naranja) excluye `excused`.
- % de asistencia: `excused` sale del denominador (jugador incapacitado no baja el % del equipo ni el suyo).
- Totales del header del drawer: incapacitados cuentan en Total pero NO en Ausentes; si N>0 aparece chip "N incapacitados" junto a las stats.

### 6. Vista padre

Perfil del hijo muestra incapacidad activa (fechas + descripción). Solo lectura.

### 7. i18n

Todas las cadenas nuevas en EN/ES/PT (`incapacity.*` namespace), namespace cableado en `src/i18n/index.js`.

## Testing

- **Backend (Pest/PHPUnit):** CRUD incapacidades con RBAC (Trainer sí, Parent no, cross-club 403 por ClubScope), solapamiento rechazado, backfill de status correcto, `storeAttendance` con `excused`, exclusión de cargos per-attendance dentro/fuera de rango, alta (`FIN`) restablece cargos.
- **Frontend:** unit del form (validación fechas), compresión de imagen mockeada.
- **E2E (Playwright, perfil trainer):** abrir drawer, buscar, marcar asistencia, reportar incapacidad "solo esta sesión", verificar badge y exclusión del contador. Viewport móvil + rotación (portrait→landscape) conservando scroll y filtro.

## Fuera de alcance (v1)

- Correo al padre (solo push + in-app).
- Aprobación de incapacidades reportadas por padres.
- Reportes/estadísticas de incapacidades por club.
- Sistema de asistencia de eventos (`pla_event_attendance`) — ya tiene `excused`, no se toca.
