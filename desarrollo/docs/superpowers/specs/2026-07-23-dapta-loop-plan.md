# Plan: Loop Dapta — Señales PLG + Dogfooding Super Admin + Home AI-Native

> ## 🟡 PARCIAL — código escrito, NO desplegado (estado al 13-ago-2026)
>
> El «PENDIENTE APROBACIÓN» de abajo caducó: se aprobó y se construyó, pero **no está en
> producción**. Verificado contra el código: existen `app/Models/PlaPlatformSignal.php`,
> `PlaSignalTouchpoint.php`, `app/Observers/PlaPlatformSignalObserver.php`,
> `app/Http/Controllers/Api/V1/Admin/AdminSignalsController.php`,
> `app/Mail/HotTrialSignalMail.php`, `app/Services/Assistant/Tools/PlatformSignalTools.php`
> y `AdminDailyBriefService.php`; en frontend, `components/home/SuperAdminTodayHome.jsx` y
> `hooks/admin/useAdminDailyBrief.js`.
>
> 🔴 **Lo que falta es el push, y no es inocuo:** el trabajo está en `main` **local sin
> pushear**, a la espera de QA. Pushear = **deploy automático + backfill de señales**.
> No lo hagas sin decisión explícita de Miguel.
>
> ⚠️ Hueco conocido: el backend produce **12 señales** y el home solo dibuja **5**.


**Fecha:** 2026-07-23 · **Estado:** PENDIENTE APROBACIÓN de Miguel
**Origen:** análisis playbook Dapta (dogfooding: agente interno = producto; warm outbound por señales de uso) + investigación homes AI-native 2026 (Ramp = gold standard).

---

## 1. Contexto y objetivo

Widdo tiene el agente cara-al-cliente maduro (89 tools, autonomía, cobranza autónoma, evals con cadencia semanal) pero le faltan los 2 loops de Dapta:

1. **Dogfooding**: Miguel no opera Widdo desde el agente Widdo (super admin tiene ~2 tools). El cerebro que usa Miguel ≠ cerebro que usan clientes.
2. **Señales → warm outbound**: nadie detecta "este club en trial se está activando → llamar HOY". Los datos ya están en BD; falta la capa de señal.

Además, el home web del owner sigue siendo dashboard clásico de widgets — debe converger al patrón exception-first ya diseñado en móvil (tab "Hoy").

**Principios de diseño (investigación jul 23, no negociables):**
- Exception-first: el home muestra solo lo que requiere decisión humana; lo rutinario ya lo ejecutó el agente según autonomy slider.
- Tarjeta de decisión = veredicto + razón + botón 1-click. Nunca "ve a la página X".
- Chat disponible pero lateral — es método de entrada, no el home.
- Dashboard clásico NO se borra: queda como drill-down/audit log.
- Dinero SIEMPRE con confirmación explícita (nivel autónomo no aplica a registrar/cancelar pagos).

## 2. Alcance

**SÍ:** 6 frentes en 2 olas (abajo). Solo web (React) + backend (Laravel). i18n EN/ES/PT obligatorio, default EN.
**NO:** CRM completo (trigger futuro: 50+ trials/mes o comercial adicional). Herramientas externas de analytics (Mixpanel/PostHog). App móvil (repo aparte, roadmap propio). Envío automático de emails a prospectos (solo borradores). Pre-conciliación bancaria.

## 3. Fases

### OLA 1 — arranca ya, en paralelo (2 agentes)

#### F0 — Eventos de activación (backend, worktree `wt-signals`)
- Tabla `pla_activation_events` (club_id, event_type, occurred_at, metadata): `club_created`, `first_player`, `first_charge`, `first_payment_received`, `first_agent_conversation`, `trainer_or_family_invited`, `trial_converted`, `trial_expired_unconverted`.
- Backfill desde datos existentes (`PlanUsageLog`, suscripciones, `agent_conversations`) para los 8 clubes actuales.
- Emisión: listeners/hooks en los flujos existentes (no tocar controllers masivamente; observers de modelo donde alcance).
- Fix señal sucia: `AdminAnalyticsController` usa `users.updated_at` como proxy de actividad → cambiar a `last_activity_at` real (columna ya existe).

#### F1 — Health score + señales por club (mismo worktree, tras F0)
- `PlatformSignalService`: score por club combinando activación de trial, engagement semanal (actividad real), uso del agente, tendencia de jugadores/cobros.
- 3 señales persistidas en `pla_platform_signals`: `hot_trial` 🔥, `at_risk` ⚠️ (7 días sin actividad o trial por vencer sin activación), `expansion_ready` 📈.
- Job diario `DetectPlatformSignals` registrado en `routes/console.php`.
- **Seguridad**: queries a nivel plataforma bypasean `ClubScope` deliberadamente → SOLO accesibles vía super admin con `authorize()` explícito (regla de la auditoría RBAC jul 2026: middlewares de pertenencia no montados, no confiar en implícitos).

#### HW — Home owner web "Hoy" (frontend, rama `feature/home-ai-native`)
Reemplaza el dashboard de owner/admin por feed exception-first (dashboard actual queda accesible como drill-down; nada se borra):
- **Sección "Necesita tu decisión"** (tarjetas 1-click, ordenadas por urgencia):
  - Cobranza: casos del collection cycle esperando aprobación → [Aprobar] [Excluir] inline (reusa endpoints del tab Cobranza).
  - Pagos vencidos con acción rápida: [Enviar recordatorio] / [Registrar pago] (modal mínimo, sin navegar a Gestión de Pagos).
  - Items warning del daily brief existente (anomalía de recaudo, nuevos inactivos, links por expirar) con su acción sugerida.
- **Sección "El agente hizo hoy"**: acciones autónomas de `pla_ai_autonomous_actions` del día (transparencia = confianza; ya existe la tabla).
- **Saludo + resumen breve** estilo móvil (daily brief), NO widgets de gráficas.
- Cada tarjeta: veredicto + razón ("Familia García: 2 meses vencidos, no responde recordatorios → pasar a etapa 2") + botón.
- Componentes nuevos web (ActionCard/BriefCard) inspirados en los del móvil pero código propio (repos distintos); estilo shadcn existente.
- Roles: owner/admin (accountant/trainer en iteración posterior). Feature flag simple por si un club prefiere dashboard viejo.

### OLA 2 — arranca al cerrar Ola 1 (merges de F0/F1 en main)

#### F2 — Daily brief super admin + alertas (backend + frontend chico)
- `AdminDailyBriefService` (mismo patrón `DailyBriefService`): trials calientes, clubes en riesgo, listos para upgrade, trials por vencer, resumen de activación semanal.
- Notificación in-app + email a Miguel cuando salta `hot_trial` (mailer existente; no depende de webhook Resend — es 1 destinatario interno).
- Home super admin = mismo feed de tarjetas (reusa componentes de HW): "Club X creó 40 jugadores ayer → [Ver contexto] [Redactar contacto]".

#### F3 — Tools super admin: dogfooding (backend)
- Read tools: `getHotTrials`, `getClubsAtRisk`, `getTrialFunnel`, `getActivationReport`, `getAgentUsageByClub`, `getPlatformRevenue`.
- Write tool (confirm 2 pasos): `draftClubOutreach` — redacta borrador de email de contacto al club con contexto de sus señales. NUNCA envía; deja borrador para revisión de Miguel (CAN-SPAM + regla no-envíos).
- Integrar con la matriz `ToolDefinitions::allowedNamesForRole()` (ya en main, `d31e2c6`): estas tools SOLO en super_admin.
- Actualizar prompt super admin en `SystemPromptBuilder` (sección PLATFORM CONTEXT ampliada).

#### F4 — Cerrar el loop + medición (backend chico)
- Tabla `pla_signal_touchpoints`: signal_id, action_taken (called/emailed/ignored), outcome (converted/churned/pending), notes. NO es CRM: registro mínimo para medir qué señales predicen conversión. Se registra vía tool del agente (`logTouchpoint`) o desde la tarjeta.
- Evals: casos nuevos para las tools de F3 integrados al harness existente (nivel A determinista; el harness F2-F4 + cadencia semanal ya está en main, `7df406d`).

## 4. Infraestructura y reglas de ejecución

- Orquestador + agentes paralelos (patrón S1-S4). Worktrees en `.worktrees/` (vendor por `composer install`, NUNCA symlink). BDs: `db_testing_c` para wt-signals (evitar colisión con otras sesiones en `db_testing`/`db_testing_b`).
- `git status -sb` antes de cada commit (lección incidente jul 21). `php artisan route:clear` en main tras merges que agreguen rutas.
- Todo LOCAL en ramas feature; merge a main local solo con orden de Miguel; push NUNCA (deploy automático).
- Regla Widdo AI aplicada: las señales nacen como tools de chat (F3). Voz: N/A (solo onboarding, decisión previa).

## 5. Verificación / QA

- Tests por fase (PHPUnit backend; el harness de evals para F3). Regresión completa antes de cada merge.
- QA Miguel (~30 min al final): (1) home "Hoy" con club 1 Bogotá FC — aprobar un caso de cobranza y registrar un pago desde tarjeta; (2) chat super admin: "¿qué trials están calientes?" y "redacta contacto para X"; (3) recibir email de alerta de señal (forzar señal en BD dev).
- Datos demo: generar actividad de trial en club de prueba para que las señales disparen en dev.

## 6. Criterio de éxito (30 días)

Cada trial nuevo genera señal automática; Miguel se entera el día que se calienta o enfría (email + brief); la operación diaria de Widdo pasa por el agente super admin; el owner de un club resuelve pagos/cobranza desde el home en 1-2 clicks sin navegar menús. Bonus pitch: home "Hoy" = demo FL.

## 7. Decisiones (Miguel, jul 23 — plan APROBADO, "dale")

1. Home "Hoy" = default para TODOS los clubes; dashboard viejo queda como drill-down. ✅
2. Umbrales de señal v1: defaults del implementador en archivo de config (hot = ≥3 eventos de activación en 7 días; riesgo = 7 días sin actividad real o trial a ≤3 días de vencer sin activación; expansión = club pagando con crecimiento sostenido de jugadores/cobros 2 semanas). Ajustables sin tocar código (config), se calibran en F4 con datos reales. ✅
3. Email de alertas → **hey@widdo.co**. ✅
