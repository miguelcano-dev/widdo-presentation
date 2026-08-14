# Widdo Tournaments — Resultados en Vivo, Planillas Digitales y Resiliencia

> Fase 5: WebSockets, 7 adaptadores de scoring, offline-first, multi-cancha, centro de control
> Indice general: ver `TOURNAMENTS-INDEX.md`

---

# FASE 5: RESULTADOS EN VIVO

**Objetivo:** Marcadores en tiempo real + planillas digitales genericas.

### ✅ Riesgo vs Clubes: BAJO

> Esta fase es casi 100% aditiva. Los canales WebSocket de club (`club.{clubId}`, `club.{clubId}.payments`)
> NO se tocan. Se crean canales NUEVOS (`tournament.{tournamentId}`).
> Los eventos broadcast son NUEVOS (`MatchStarted`, `ScoreUpdated`, etc.).
> Los hooks React son NUEVOS (`useTournamentLive`). No interfieren con `useClubRealtimeEvents`.
> El único archivo compartido que se toca es `routes/channels.php` (agregar reglas de autorización nuevas).

## Sub-fase 5.A — WebSockets Backend

| # | Tarea | Detalle |
|---|-------|---------|
| 5.A.1 | Canal publico `tournament.{tournamentId}` | Sin auth — cualquiera escucha |
| 5.A.2 | Eventos broadcast | MatchStarted, ScoreUpdated, MatchEnded, StandingsUpdated, BracketAdvanced, MatchEventRegistered |
| 5.A.3 | Disparar eventos al actualizar score | En TournamentBracketController, despues de cada PATCH /score |
| 5.A.4 | Bitacora de eventos (`pla_tournament_match_events`) | match_id, event_type, minute, player_id, registration_id, description, created_by |

## Sub-fase 5.B — Planilla Digital Generica (Motor de Scoring)

| # | Tarea | Detalle |
|---|-------|---------|
| 5.B.1 | `AdaptiveScorePanel.jsx` (componente principal) | Lee SportConfig JSON del torneo y renderiza la UI de scoring adaptada al deporte |
| 5.B.2 | Adaptador `GoalsAdapter.jsx` | Futbol, hockey, futsal. Boton +1 gol por equipo. Registro de goleador. Tarjetas. Cambios |
| 5.B.3 | Adaptador `PointsAdapter.jsx` | Basquet, handball. Botones +1, +2, +3. Faltas personales/tecnicas |
| 5.B.4 | Adaptador `SetsGamesAdapter.jsx` | Tenis, padel, volley. Sets con puntos dentro. Tiebreak |
| 5.B.5 | Adaptador `RoundsPointsAdapter.jsx` | Artes marciales, boxeo. Rounds con puntos/tecnicas |
| 5.B.6 | Adaptador `TimesMarksAdapter.jsx` | Natacion, atletismo. Cronometro, marcas, heats, series/carriles |
| 5.B.7 | Adaptador `InningsAdapter.jsx` | Beisbol, softball. Entradas, carreras, outs, hits, cambio de turno |
| 5.B.8 | Adaptador `JudgesAdapter.jsx` | Gimnasia, clavados, surf. Panel de N jueces, dificultad, calculo automatico. Prioridad P3 (V2) |
| 5.B.9 | `PlayerQuickSelect.jsx` | Al registrar evento, seleccion rapida del jugador (tap en nombre/numero) |
| 5.B.10 | Boton "Deshacer ultimo" | Revertir ultima accion. API: DELETE ultimo match_event + recalcular score |

### Interfaz de cada adaptador

**GoalsAdapter (futbol):**
```
┌──────────────────────────────────────┐
│  🟢 Equipo A    vs    Equipo B 🔵   │
│         2              1             │
│  ⏱️ 2T — 67:23                       │
│  [⚽ GOL]           [⚽ GOL]          │
│  [🟡 Amarilla] [🔴 Roja] [🔄 Cambio]│
│  [◀️ Deshacer] [Fin 2T] [Fin Partido]│
└──────────────────────────────────────┘
```

**PointsAdapter (basquet):**
```
┌──────────────────────────────────────┐
│  🟢 Equipo A    vs    Equipo B 🔵   │
│        45             38             │
│  ⏱️ Q3 — 5:23                        │
│  [+1] [+2] [+3]   [+1] [+2] [+3]   │
│  [🤚 Falta]          [🤚 Falta]      │
│  [⏸️ Timeout]      [⏸️ Timeout]     │
│  [◀️ Deshacer] [Fin Q3] [Fin Partido]│
└──────────────────────────────────────┘
```

**SetsGamesAdapter (tenis):**
```
┌──────────────────────────────────────┐
│  Pérez    vs    Gómez                │
│  Sets: 1        1                    │
│                                      │
│  Set 3:  3  -  2                     │
│  Game:  30  -  15                    │
│                                      │
│  Sirviendo: Pérez 🎾                 │
│                                      │
│  [Punto Pérez]    [Punto Gómez]      │
│  [💨 Ace] [❌ Doble falta]           │
│  Sets: 6-4, 6-7(5), 3-2             │
│  [◀️ Deshacer]                       │
└──────────────────────────────────────┘
```

**RoundsPointsAdapter (judo):**
```
┌──────────────────────────────────────┐
│  García    vs    López               │
│  Waza-ari: 1      0                  │
│  Shidos:   0      1                  │
│  ⏱️ 2:45 / 4:00                      │
│                                      │
│  García:                 López:      │
│  [🥇 Ippon]             [🥇 Ippon]   │
│  [🥈 Waza-ari]          [🥈 Waza-ari]│
│  [🟡 Shido]             [🟡 Shido]   │
│                                      │
│  [◀️ Deshacer] [Fin Round] [Fin]     │
└──────────────────────────────────────┘
```

**TimesMarksAdapter (natacion):**
```
┌──────────────────────────────────────┐
│  🏊 50m Libre — Serie 3 de 7         │
│                                      │
│  Carril 1: García      [  :  .  ]    │
│  Carril 2: López       [ 27.82 ] ✅  │
│  Carril 3: Pérez       [  :  .  ]    │
│  Carril 4: Ríos        [ 28.03 ] ✅  │
│  Carril 5: Torres      [  :  .  ]    │
│  Carril 6: Gómez       [ 27.15 ] ⭐  │
│                                      │
│  [🏁 Registrar tiempo] [🚫 DNS]      │
│  [❌ DNF] [🔴 DQ]                    │
│                                      │
│  Ranking parcial: Gómez 27.15 (1°)   │
└──────────────────────────────────────┘
```

**InningsAdapter (beisbol):**
```
┌──────────────────────────────────────┐
│  ⚾ Equipo A  vs  Equipo B           │
│                                      │
│  Entrada: 5ta (alta)                 │
│  Outs: ●●○                           │
│  Bases: 1B ● 2B ○ 3B ○              │
│                                      │
│     1  2  3  4  5  6  7  8  9  R H E │
│  A  2  0  1  0  _              3 5 1 │
│  B  0  1  0  1                 2 4 0 │
│                                      │
│  [🏃 Carrera] [K Strikeout] [👎 Out] │
│  [🏏 Hit] [💣 HR] [🚶 Walk] [⚠️ Err]│
│  [◀️ Deshacer] [Cambio turno]        │
└──────────────────────────────────────┘
```

**JudgesAdapter (gimnasia) — V2:**
```
┌──────────────────────────────────────┐
│  🤸 Gimnasia — Suelo — García        │
│                                      │
│  Dificultad (D): [ 5.2 ]            │
│                                      │
│  Jueces de Ejecución:                │
│  J1: [ 8.5 ]  J2: [ 8.3 ]           │
│  J3: [ 8.7 ]  J4: [ 8.4 ]           │
│  J5: [ 8.6 ]  J6: [ 8.2 ]           │
│                                      │
│  Eliminar: max (8.7) y min (8.2)     │
│  Promedio E: 8.45                    │
│  Penalización: [ 0.0 ]              │
│                                      │
│  NOTA FINAL: 13.65                   │
│  [Confirmar] [Corregir]              │
└──────────────────────────────────────┘
```

**Interfaz de la planilla de futbol:**
```
┌──────────────────────────────────────┐
│  🟢 Siempre Fuertes  vs  Club Itagüí│
│                                      │
│         2              1             │
│                                      │
│  ⏱️ 2T — 67:23                       │
│                                      │
│  ┌────────────┐   ┌────────────┐    │
│  │  ⚽ GOL    │   │  ⚽ GOL    │    │
│  └────────────┘   └────────────┘    │
│                                      │
│  [🟡 Amarilla] [🔴 Roja] [🔄 Cambio]│
│                                      │
│  Eventos:                            │
│  23' ⚽ Juan Pérez (SF)              │
│  45' ⚽ Carlos López (IT)            │
│  67' ⚽ Pedro Gómez (SF)             │
│                                      │
│  [◀️ Deshacer]                       │
│  [Fin 2T]  [Fin Partido]            │
└──────────────────────────────────────┘
```

## Sub-fase 5.C — Frontend En Vivo (Espectador)

| # | Tarea | Detalle |
|---|-------|---------|
| 5.C.1 | `useTournamentLive(tournamentId)` hook | Escucha canal WebSocket, actualiza datos en tiempo real |
| 5.C.2 | `LiveScoreboard.jsx` | Marcador con indicador "EN VIVO" parpadeante. Timeline de eventos |
| 5.C.3 | Auto-refresh de bracket/standings | Cuando un match termina, refrescar automaticamente |
| 5.C.4 | Contador de espectadores online | "47 personas viendo ahora" |

## Sub-fase 5.D — Resiliencia: Offline, Bateria, Recuperacion

**Esta sub-fase es CRITICA.** Un torneo se juega en canchas, coliseos, piscinas — lugares donde el internet es inestable y los dispositivos se descargan. El sistema DEBE funcionar en estas condiciones.

### Arquitectura de resiliencia (3 capas)

```
CAPA 1 — OFFLINE-FIRST (sin internet)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cada evento (gol, falta, punto, tiempo) se guarda PRIMERO
en almacenamiento local del dispositivo. El envio al servidor
es secundario y asincrono.

  Toque "⚽ Gol" →
    1. Guardar en IndexedDB/SQLite (INMEDIATO, <5ms)
    2. Actualizar UI local (INMEDIATO)
    3. Intentar enviar al servidor (ASINCRONO)
       ├── Si hay internet → envia → servidor procesa → WebSocket a espectadores
       └── Si NO hay internet → encola → reintenta cada 10s
           └── Cuando vuelve internet → envia cola completa en orden

  El delegado NUNCA nota diferencia entre online y offline.
  La planilla funciona 100% local.

CAPA 2 — PERSISTENCIA (bateria/crash)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IndexedDB (web) y SQLite (app Capacitor) persisten
incluso si:
  - Se cierra el browser/app
  - Se apaga el celular
  - Se descarga la bateria
  - La app crashea
  - Se reinicia el dispositivo

Al reabrir la app, detecta partidos sin terminar y ofrece:
  A) Continuar desde donde iba (con marcador y minuto guardados)
  B) Ingresar resultado final manualmente
  C) Descartar (si ya se ingreso por otro medio)

CAPA 3 — MULTI-DISPOSITIVO (respaldo humano)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El mismo partido puede estar abierto en N dispositivos.
  - El organizador en su tablet
  - Un co-organizador en su celular
  - Un delegado de cancha en otro celular

Si un dispositivo muere, cualquier otro puede continuar.
El servidor reconcilia eventos por timestamp (ultima escritura gana
si hay conflicto en el mismo evento).
```

| # | Tarea | Detalle |
|---|-------|---------|
| 5.D.1 | `OfflineEventStore` (servicio JS) | Almacen local con IndexedDB (web) o SQLite (Capacitor). Guarda: match_id, event_type, timestamp_local, payload, synced (bool), sync_attempts |
| 5.D.2 | Cola de sincronizacion | Al detectar conexion (`navigator.onLine` + heartbeat cada 10s), envia eventos pendientes al servidor en orden de timestamp. Retry con backoff exponencial (10s, 20s, 40s, max 5min) |
| 5.D.3 | Indicador de estado de conexion en la planilla | Banner sutil: 🟢 "Conectado" / 🟡 "Sin conexion — datos guardados localmente" / 🔴 "Error de sincronizacion (X eventos pendientes)". NO bloquear la UI nunca |
| 5.D.4 | Endpoint `POST /api/tournaments/{id}/matches/{matchId}/sync-events` | Recibe array de eventos offline con timestamps. Servidor los procesa en orden, ignora duplicados (por evento_id local), recalcula score y standings |
| 5.D.5 | Reconciliacion multi-dispositivo | Si 2 dispositivos reportan eventos para el mismo partido, el servidor usa timestamp como orden. Si hay conflicto exacto (mismo segundo, mismo tipo), mantiene el primero recibido |
| 5.D.6 | Deteccion de partido sin terminar al abrir app | Al cargar la app/pagina, revisar IndexedDB por partidos con status='in_progress'. Mostrar modal de recuperacion |
| 5.D.7 | Modal de recuperacion | "Tienes un partido sin terminar: SF 2-1 Sabaneta (min 55). ¿Continuar / Ingresar resultado final / Descartar?" |
| 5.D.8 | Ingreso manual retroactivo (fallback total) | Si se pierden todos los datos locales, el organizador puede ingresar resultado completo desde el dashboard o por chat con el agente IA: "El resultado fue 3-1, goles de Perez min 12 y 58, Lopez min 55. Gol de Rios min 47 para Sabaneta" |
| 5.D.9 | Indicador de bateria baja | Cuando bateria < 20%: "⚠️ Bateria baja. Conecta el cargador o [Abrir en otro dispositivo →]". A < 10%: forzar sincronizacion inmediata de todo lo pendiente |
| 5.D.10 | "Abrir en otro dispositivo" (handoff) | Genera QR/link corto que abre el mismo partido en la planilla de otro dispositivo. El estado actual (marcador, minuto, eventos) se transfiere via servidor o se reconstruye desde los eventos sincronizados |
| 5.D.11 | Service Worker para PWA (web) | Cachea assets de la planilla para que funcione incluso sin conexion completa. La planilla se puede "instalar" como PWA en el celular |
| 5.D.12 | Test de resiliencia automatizado | Test E2E que simula: abrir partido → registrar eventos → cortar internet → seguir registrando → restaurar internet → verificar sincronizacion. Test de crash: registrar eventos → matar proceso → reabrir → verificar recuperacion |

### Escenarios de fallo y como se resuelven

| Escenario | Que pasa | Solucion |
|-----------|----------|----------|
| **Se va el internet 5 min** | Planilla sigue funcionando. Eventos se acumulan en cola local. Al volver, sincroniza. | 5.D.1 + 5.D.2 |
| **Se va el internet todo el partido** | Planilla funciona 100% local. Al terminar, conecta WiFi y sincroniza todo de golpe. Portal publico se actualiza. | 5.D.1 + 5.D.2 + 5.D.3 |
| **Se descarga la tablet al minuto 45** | Datos persisten en IndexedDB/SQLite. Al cargar y reabrir: "¿Continuar desde min 45?" | 5.D.6 + 5.D.7 |
| **Se descarga Y no se guardo nada** | (Extremadamente raro — IndexedDB persiste) Fallback: ingreso manual por agente IA o formulario | 5.D.8 |
| **La app crashea** | Igual que descarga — IndexedDB persiste. Al reabrir, recupera | 5.D.6 + 5.D.7 |
| **El celular del delegado se pierde/rompe** | Otro dispositivo abierto en el mismo partido toma el control. Si nadie mas tenia abierto: ingreso manual | 5.D.5 + 5.D.10 |
| **Dos dispositivos reportan al mismo tiempo** | Servidor reconcilia por timestamp. No hay conflicto si cada dispositivo reporta canchas diferentes. Si reportan el MISMO partido, usa timestamps | 5.D.5 |
| **Internet intermitente (va y viene)** | La cola de sincronizacion maneja esto automaticamente. Envia cuando hay conexion, encola cuando no. Sin intervencion del usuario | 5.D.2 + 5.D.3 |
| **Se cae el SERVIDOR de Widdo** | La planilla sigue funcionando local. Los eventos se encolan. Cuando el servidor vuelve, sincroniza. El partido NO se detiene por un problema de servidor | 5.D.1 + 5.D.2 |

### Datos que se guardan localmente por partido

```javascript
// IndexedDB / SQLite
{
  match_id: 123,
  tournament_id: 45,
  status: 'in_progress',          // scheduled, in_progress, completed
  current_period: 2,              // periodo actual
  current_minute: 67,             // minuto aproximado (o null si no se lleva)
  home_score: 2,                  // marcador local
  away_score: 1,
  home_team: { id: 1, name: 'Siempre Fuertes', players: [...] },
  away_team: { id: 2, name: 'Club Sabaneta', players: [...] },
  sport_config: { ... },           // config JSON del deporte (cacheada)
  events: [                        // todos los eventos del partido
    { id: 'evt_abc123', type: 'goal', minute: 12, team: 'home', player_id: 7,
      timestamp: '2026-03-15T08:12:00Z', synced: true },
    { id: 'evt_def456', type: 'yellow_card', minute: 23, team: 'away', player_id: 6,
      timestamp: '2026-03-15T08:23:00Z', synced: true },
    { id: 'evt_ghi789', type: 'goal', minute: 55, team: 'home', player_id: 10,
      timestamp: '2026-03-15T08:55:00Z', synced: false },  // ← pendiente de sync
  ],
  last_synced_at: '2026-03-15T08:23:00Z',
  offline_since: '2026-03-15T08:50:00Z',   // null si esta online
}
```

## Sub-fase 5.E — Speech-to-Text + Multi-cancha

| # | Tarea | Detalle |
|---|-------|---------|
| 5.E.1 | Speech-to-Text en el chat | Web Speech API (gratis, nativo del browser). Boton de microfono en el chat de Widdo AI. Para instrucciones complejas al agente desde la cancha sin escribir |
| 5.E.2 | Multi-cancha simultanea | El organizador puede tener N planillas abiertas (una por pestana/ventana). Cada cancha independiente. Lista de partidos del dia con estado en tiempo real |
| 5.E.3 | Delegado por cancha | El organizador puede asignar co-organizadores con permisos de scoring. Cada delegado abre SU cancha en SU celular. El organizador ve todo desde el dashboard |
| 5.E.4 | Vista "Centro de Control" del organizador | Pantalla dividida que muestra marcadores de TODAS las canchas en vivo. Sin necesidad de estar en cada planilla individual. Para el organizador que supervisa desde un punto central |

```
┌──────────────────────────────────────────────────┐
│  📊 CENTRO DE CONTROL — Copa Antioquia Sub-15     │
│  Sábado 15 de marzo — Jornada 1                  │
│                                                  │
│  🟢 Cancha 1: SF 2-1 Sabaneta (2T, 67')          │
│     Delegado: Carlos (📱 online)                  │
│                                                  │
│  🟢 Cancha 2: Rionegro 1-1 Caldas (2T, 52')      │
│     Delegado: María (📱 online)                   │
│                                                  │
│  ⏸️ Cancha 3: La Estrella vs Santa Rosa (10:30)   │
│     Delegado: Pedro (📱 sin asignar)              │
│                                                  │
│  ✅ Terminados hoy: 0                             │
│  🔜 Pendientes: 4                                 │
│                                                  │
│  [💬 Chat IA]  [📋 Fixture del día]              │
└──────────────────────────────────────────────────┘
```

**Total Fase 5: 26 tareas | ~8-10 dias** (subio por resiliencia y adaptadores nuevos)
