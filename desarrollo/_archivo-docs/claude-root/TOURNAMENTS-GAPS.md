# Widdo Tournaments — Gaps vs Competencia

> Fases 14-20. Features que Exposure Events y otros tienen y Widdo necesita.
> Índice general: ver `TOURNAMENTS-INDEX.md`
> Riesgo vs Clubes: 🟢 BAJO — 100% aditivo

---

# FASE 14: GATE QR + CHECK-IN + MONITOR TICKER

**Objetivo:** Entrada al evento con QR contactless. Check-in de equipos. Pantalla de resultados en venue.

## Sub-fase 14.A — Gate Admission QR

| # | Tarea | Detalle |
|---|-------|---------|
| 14.A.1 | Migración `create_pla_tournament_gate_admissions` | tournament_id, ticket_code (unique, UUID), ticket_type ENUM('general','vip','team_pass','staff'), purchaser_name, purchaser_email, price (decimal 10,2), currency (char 3), status ENUM('active','used','expired','refunded'), purchased_at, scanned_at, scanned_by (FK → users, nullable), gate_name (string nullable), payment_reference (string nullable) |
| 14.A.2 | Modelo `PlaTournamentGateAdmission` | QR generation via UUID. Verificación por scan |
| 14.A.3 | Compra de entradas | `POST /api/public/tournaments/{slug}/tickets` — público, pago via gateway |
| 14.A.4 | QR generation | Generar QR con ticket_code al comprar. Email con QR adjunto (PDF) |
| 14.A.5 | Scanner endpoint | `POST /api/tournaments/{id}/gate/scan` — organizador escanea → valida → marca used |
| 14.A.6 | Scanner UI | Página `/gate-scan/{tournamentId}` — cámara del celular, scan, verde/rojo |
| 14.A.7 | Dashboard de gate | Cuántos escaneados, cuántos faltan, revenue gate, por tipo |

**Revenue:** Organizador configura precio de entrada. Widdo cobra 3% fee.

## Sub-fase 14.B — Team Check-In

| # | Tarea | Detalle |
|---|-------|---------|
| 14.B.1 | Migración `create_pla_tournament_check_ins` | registration_id (FK), checked_in_at, checked_in_by (FK → users), method ENUM('qr','manual','app'), notes |
| 14.B.2 | Check-in por QR | Cada registro tiene QR. Coach lo muestra al llegar |
| 14.B.3 | Check-in manual | Organizador marca "llegó" en lista de equipos |
| 14.B.4 | Dashboard check-in | "12/20 equipos presentes. Faltan: Club X, Club Y, Club Z" |
| 14.B.5 | Alert | Si equipo no hace check-in 30min antes del primer partido → push al coach |

## Sub-fase 14.C — Monitor Ticker

| # | Tarea | Detalle |
|---|-------|---------|
| 14.C.1 | Ruta pública `/monitor/{tournamentSlug}` | Fullscreen, sin nav, auto-refresh via WebSocket |
| 14.C.2 | Layout | Rotación automática: Resultados en vivo → Próximos partidos → Standings → Bracket |
| 14.C.3 | Configuración | Organizador elige qué mostrar, velocidad de rotación, theme (dark/light) |
| 14.C.4 | Auto-highlight | Cuando hay gol/punto → flash en pantalla con animación |

**Total Fase 14: 12 tareas | ~3-4 días**

---

# FASE 15: PDF REPORTS + SCORESHEETS

**Objetivo:** Los organizadores IMPRIMEN. Scoresheets para árbitros, schedules para paredes.

## Sub-fase 15.A — PDF Generation

| # | Tarea | Detalle |
|---|-------|---------|
| 15.A.1 | `TournamentPdfService` | Usa Puppeteer (ya instalado para decks) o Laravel DomPDF |
| 15.A.2 | PDF: Schedule completo | Todos los partidos por día, cancha, hora. Formato A4 landscape |
| 15.A.3 | PDF: Scoresheet por partido | Template por deporte: nombres equipos, roster, espacio para anotar goles/puntos, firmas |
| 15.A.4 | PDF: Standings/posiciones | Tabla de posiciones por grupo/categoría. Formato A4 |
| 15.A.5 | PDF: Bracket | Árbol de eliminación visual. Formato A3 o A4 landscape |
| 15.A.6 | PDF: Rosters por equipo | Lista de jugadores con número, nombre, documento, foto |
| 15.A.7 | PDF: Credential/gafete | Carnet con foto, nombre, equipo, categoría, QR. Formato badge |
| 15.A.8 | Excel: Export datos | Teams, players, payments, results → Excel descargable |

**Endpoints:**
```
GET /api/tournaments/{id}/pdf/schedule              — Schedule completo
GET /api/tournaments/{id}/pdf/scoresheet/{matchId}  — Planilla de un partido
GET /api/tournaments/{id}/pdf/standings/{catId}      — Posiciones
GET /api/tournaments/{id}/pdf/bracket/{catId}        — Bracket
GET /api/tournaments/{id}/pdf/roster/{regId}         — Roster de equipo
GET /api/tournaments/{id}/pdf/credentials/{catId}    — Carnets (batch)
GET /api/tournaments/{id}/export/excel               — Export Excel
```

**Total Fase 15: 8 tareas | ~2-3 días**

---

# FASE 16: SMS + SOCIAL AUTO-POST + STREAMING

**Objetivo:** Comunicación multi-canal. Resultados auto-publicados en redes.

## Sub-fase 16.A — SMS Notifications

| # | Tarea | Detalle |
|---|-------|---------|
| 16.A.1 | Integrar Twilio o AWS SNS | Para SMS. Configurar en `bas_notification_channels` |
| 16.A.2 | SMS triggers | Schedule change, match starting in 15min, final score, registration approved |
| 16.A.3 | SMS opt-in | User elige en `notification_preferences` si quiere SMS (campo ya existe: `sms_notifications`) |
| 16.A.4 | SMS cost tracking | Log de SMS enviados para facturación (Widdo paga, pass-through al organizador si alto volumen) |

## Sub-fase 16.B — Social Auto-Post

| # | Tarea | Detalle |
|---|-------|---------|
| 16.B.1 | Auto-generate social image | Al terminar partido → imagen con score, logos, "powered by Widdo" |
| 16.B.2 | Auto-post al terminar partido | Organizador configura: auto-post a Twitter/X, Facebook, Instagram (via API) |
| 16.B.3 | Share story template | Template para Instagram Stories: resultado, bracket position, next match |
| 16.B.4 | WhatsApp share | Deep link con texto + imagen pre-generada |

## Sub-fase 16.C — Streaming Integration

| # | Tarea | Detalle |
|---|-------|---------|
| 16.C.1 | Campo `stream_url` en `pla_tournament_matches` | URL de YouTube Live, Twitch, etc. |
| 16.C.2 | Embed en portal público | Si match tiene stream_url → mostrar player embebido |

**Total Fase 16: 10 tareas | ~2-3 días**

---

# FASE 17: STRIPE + PAYPAL (USA)

**Objetivo:** Sin Stripe no hay USA. Agregar gateways al `PaymentGatewayFactory` existente.

### ⚠️ PRECAUCIONES — Riesgo medio: toca gateway factory

> Se agrega a `PaymentGatewayFactory::GATEWAY_CLASSES` y se crea nueva gateway class.
> El pattern ya existe (WompiGateway, MercadoPagoGateway). Solo se agrega, no se modifica.

## Sub-fase 17.A — Stripe Gateway

| # | Tarea | Detalle |
|---|-------|---------|
| 17.A.1 | `StripeGateway.php` implements `PaymentGatewayInterface` | checkout_type: 'redirect' (Stripe Checkout). Initialize con api_key del `bas_country_payment_config` |
| 17.A.2 | Stripe Connect (marketplace) | Cada organizador/club recibe pagos directo. Widdo cobra `application_fee_amount` |
| 17.A.3 | Stripe onboarding | Organizador conecta su cuenta Stripe. Store `stripe_account_id` en `pla_organizers` |
| 17.A.4 | Webhook handler | `handleStripe()` en `WebhookController`. Events: `checkout.session.completed`, `payment_intent.succeeded` |
| 17.A.5 | Registrar en `PaymentGatewayFactory::GATEWAY_CLASSES` | `'stripe' => StripeGateway::class` |
| 17.A.6 | Seeder | Agregar Stripe a `bas_payment_gateways` + configurar para country_id USA |

## Sub-fase 17.B — PayPal Gateway

| # | Tarea | Detalle |
|---|-------|---------|
| 17.B.1 | `PayPalGateway.php` implements `PaymentGatewayInterface` | checkout_type: 'redirect'. PayPal Checkout |
| 17.B.2 | Webhook handler | `handlePayPal()` en `WebhookController` |

**Total Fase 17: 8 tareas | ~3-4 días**

---

# FASE 18: WEATHER + VOLUNTEERS + SPONSORS

**Objetivo:** Herramientas operativas para organizadores.

## Sub-fase 18.A — Weather Integration

| # | Tarea | Detalle |
|---|-------|---------|
| 18.A.1 | Weather API integration | OpenWeatherMap o WeatherAPI. Consultar forecast por lat/lng del torneo |
| 18.A.2 | Weather widget en dashboard organizador | Pronóstico 5 días, alertas de lluvia/tormenta |
| 18.A.3 | Auto-alert | Si rain probability >70% → push a organizador: "Posible lluvia mañana a las 2PM" |
| 18.A.4 | Schedule impact | Sugerir re-schedule de partidos outdoor si weather es severo |

## Sub-fase 18.B — Volunteer Management

| # | Tarea | Detalle |
|---|-------|---------|
| 18.B.1 | Migración `create_pla_tournament_volunteers` | tournament_id, user_id (nullable — puede ser nombre sin cuenta), name, email, phone, role ENUM('scorekeeper','gate','logistics','medical','referee','general'), court_id (FK nullable), shift_start, shift_end, status ENUM('invited','confirmed','declined','checked_in'), notes |
| 18.B.2 | `VolunteerController` | CRUD voluntarios, asignar a canchas/turnos, check-in |
| 18.B.3 | Invitar voluntarios | Email con link para confirmar. No requiere cuenta Widdo |
| 18.B.4 | Dashboard de voluntarios | Vista por cancha y turno. Quién está, quién falta |

## Sub-fase 18.C — Sponsor Management

| # | Tarea | Detalle |
|---|-------|---------|
| 18.C.1 | Migración `create_pla_tournament_sponsors` | tournament_id, name, logo_path, website_url, tier ENUM('title','gold','silver','bronze'), placement (JSON: ['bracket','portal','scoresheet','monitor','gate_ticket']), amount_paid (decimal), currency, contact_name, contact_email, status |
| 18.C.2 | Logo display | Sponsors aparecen en: portal público, bracket PDF, monitor ticker, gate tickets |
| 18.C.3 | Sponsor dashboard | ROI básico: impressions (page views × placements), click-throughs |
| 18.C.4 | Revenue tracking | Organizador registra cuánto cobró por sponsor. Widdo no cobra fee (engagement) |

**Total Fase 18: 12 tareas | ~3-4 días**

---

# FASE 19: CARPOOL + DISPUTE/PROTEST

**Objetivo:** Feature #1 pedido por padres + sistema formal de protestas.

## Sub-fase 19.A — Carpool System

| # | Tarea | Detalle |
|---|-------|---------|
| 19.A.1 | `CarpoolController` | Crear/buscar rides para torneo |
| 19.A.2 | Crear ride | Padre ofrece: "Salgo de [ubicación] a las [hora], tengo [N] asientos" |
| 19.A.3 | Buscar ride | "Busco ride desde [ubicación] para [torneo] el [fecha]" |
| 19.A.4 | Match | Matching por ubicación (radius) + horario + mismo torneo |
| 19.A.5 | Chat básico | Mensajes entre oferente y solicitante (solo texto, no media) |
| 19.A.6 | Privacy | Solo muestra nombre y ubicación aproximada. Contacto directo después de aceptar |

## Sub-fase 19.B — Dispute/Protest System

| # | Tarea | Detalle |
|---|-------|---------|
| 19.B.1 | Migración `create_pla_tournament_disputes` | tournament_id, match_id, filed_by_registration_id, dispute_type ENUM('score_error','rule_violation','eligibility','misconduct','other'), description (text), evidence_urls (JSON), status ENUM('submitted','under_review','resolved','rejected'), resolution (text nullable), resolved_by (FK → users), resolved_at, created_at |
| 19.B.2 | `DisputeController` | Submit dispute, review, resolve (organizador), appeal |

**Total Fase 19: 8 tareas | ~2-3 días**

---

# FASE 20: TOURNAMENT TEMPLATES + SERIES/CIRCUITS

**Objetivo:** Reutilizar configuración. Circuitos con puntos acumulados.

## Sub-fase 20.A — Tournament Templates

| # | Tarea | Detalle |
|---|-------|---------|
| 20.A.1 | "Clonar torneo" | `POST /api/tournaments/{id}/clone` → copia config, categorías, docs requeridos, fee. Limpia dates + registrations |
| 20.A.2 | Template library | Organizador guarda templates: "Copa Navidad" → reutiliza cada año |
| 20.A.3 | Division templates | Configuración de brackets/grupos reutilizable |
| 20.A.4 | Historical editions | Vincular torneos como ediciones: "Copa Navidad 2025" → "Copa Navidad 2026". Historial en perfil |

## Sub-fase 20.B — Series/Circuits

| # | Tarea | Detalle |
|---|-------|---------|
| 20.B.1 | Migración `create_pla_tournament_series` | organizer_id, name, description, sport_id, points_system (JSON: {champion: 100, runner_up: 75, semifinal: 50, ...}), status, season (string: "2026"), created_at |
| 20.B.2 | Migración: add `series_id` to `pla_club_teams_tournaments` | FK nullable |
| 20.B.3 | `SeriesController` | CRUD series, asignar torneos, calcular standings |
| 20.B.4 | Series standings | Puntos acumulados por torneo. Ranking de clubes en la serie |
| 20.B.5 | Series public page | `/series/{slug}` — torneos de la serie, standings, próximo evento |
| 20.B.6 | ELO/Rating system | Rating numérico de clubes basado en resultados. Matchmaking sugerido |

**Total Fase 20: 10 tareas | ~2-3 días**
