# Widdo Tournaments — Design Specification

> ## ✅ MOTOR IMPLEMENTADO — el «Implementation status: 0%» de abajo es FALSO (13-ago-2026)
>
> Este documento se quedó congelado en su versión de diseño. El motor de torneos **está
> construido y desplegado**: verificado el 13-ago hay ~66 archivos de torneos en
> `saas_sport/app` (`PlaTournament`, `PlaTournamentBracket`, `PlaTournamentMatch`,
> `PlaTournamentSeed`, `PlaTournamentGroup`, `PlaTournamentRegistration`, series,
> standings, check-in, staff, premios, carpooling) y 42 archivos que tocan brackets, más
> 6 specs E2E en `frontend/tests/e2e/tournaments/`.
>
> **El estado real vive en su spec gemelo:**
> `saas_sport/docs/superpowers/specs/2026-05-21-tournament-engine-design.md`.
> Usa este archivo solo para entender el *diseño*, nunca para saber qué falta.
>
> 🔴 Lo que sí bloquea la venta no es código: son las **claves live de Stripe** sin
> configurar (Gate 0).


> **Date:** 2026-05-19
> **Status:** Approved
> **Author:** Miguel Cano + Claude Code
> **Module:** Independent tournament management platform within the Widdo ecosystem
> **Implementation status:** 0% (planning 100%)

---

## 1. Purpose

Widdo Tournaments is the **growth engine** of the Widdo ecosystem. It is NOT a revenue source — it is a free, zero-commission tournament management platform designed to bring clubs, coaches, parents, and athletes into the Widdo ecosystem. Once inside, clubs convert to paid Widdo Clubs subscriptions.

**Strategic role:** Every tournament organized through Widdo exposes 5-10 new clubs to the platform. Those clubs see the operational tools their competitors are using and convert organically.

**Competitive gap:** Exposure Events (the only real competitor in USA basketball) has 15 years of iteration but a fragmented, outdated tech stack — broken directory (no updates since 2019), white-label apps with ad revenue (including pornographic ads), $2/team fees, English only, no mobile app, no player profiles, no cross-event data.

---

## 2. Core Decisions

### 2.1 Independent Module, Not Sub-Module

Tournaments is a **standalone module** with its own role system, its own data isolation trait (`ProtectedTournamentModel`), and its own route groups. It shares infrastructure (auth, payments, WebSockets) with Clubs but never shares data boundaries.

A user can be both a club owner AND a tournament organizer. Context switching handles this via `current_context_type ENUM('club','organizer')` on the users table.

### 2.2 Teaser Public + Everything Inside

The public/private content model follows the LinkedIn/Instagram pattern:

**Public (Next.js landing — `widdo.co/tournaments/*`):**
- Tournament directory grid with filters and search
- Tournament preview page: flyer, dates, location, sport, price range, age categories
- Blurred/locked sections for brackets, scores, schedule, teams
- SEO-optimized programmatic pages by city/sport (e.g., `/tournaments/basketball/orlando`)
- CTA buttons always redirect to `app.widdo.co` (React app)

**Private (React app — `app.widdo.co`):**
- All valuable content: brackets, live scores, full schedule, team rosters, player stats
- Registration flow (requires Widdo account)
- Gate ticket purchase (requires Widdo account)
- Organizer dashboard (tournament management, scheduling, payments)

**Rationale:** Free public content brings SEO traffic and social sharing. Locking valuable content behind signup ensures every interaction grows the Widdo user base. No anonymous consumption of tournament data.

### 2.3 No Public Player Profiles

Player profiles are **never public**. There are no `/player/[slug]` pages. All player data (stats, tournament history, market value) stays inside the Widdo ecosystem, visible only to authenticated users with appropriate permissions.

**Legal rationale:** This eliminates COPPA compliance requirements for public data disclosure entirely. Since no minor's data is publicly accessible, Widdo avoids the complex consent and parental verification requirements that apply to child-directed public content under US law.

### 2.4 AI Scheduling from Day 1

The smart scheduling engine ships with the initial release — not as a later add-on. This is the #1 competitive differentiator against Exposure Events, whose manual scheduling workflow is complex and error-prone.

The algorithm generates time slots per court, prioritizes matches by bracket position, filters by hard constraints, ranks by soft constraints, assigns optimal slots, and validates with a quality score (0-100).

### 2.5 Tournaments Are 100% Free

Zero commission on registrations. Zero gate ticket surcharge. Widdo earns only from Stripe payment processing (~2.9% + $0.30) when payments flow through the platform. The organizer receives 100% minus Stripe's standard fee.

### 2.6 "Create in Parallel" Pattern

For any component that touches existing club code (AI Agent, Payment Service, ProtectedModel), the approach is to create new parallel implementations — never refactor existing code in-place. The club system is in production with 21+ active clubs and cannot risk regressions.

---

## 3. Architecture Overview

### 3.1 Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Backend | Laravel 12 | Same codebase as Clubs, shared `saas_sport/` repo |
| Frontend (private) | React + Vite | Same codebase as Clubs, shared `frontend/` repo |
| Frontend (public) | Next.js | Existing landing site, add tournament pages |
| Mobile | React Native / Expo | Existing app, add tournament screens |
| Payments | Stripe Connect | USA-first, organizer receives funds directly |
| Real-time | Laravel Reverb | New channels `tournament.{id}` for live scores |
| AI | Claude API | Scheduling optimization, organizer assistant |

### 3.2 Route Groups

```
/api/organizer/*           — Authenticated organizer endpoints (CRUD, management)
/api/tournaments/*         — Authenticated user endpoints (registration, reviews)
/api/public/tournaments/*  — Unauthenticated public endpoints (directory, SEO)
```

### 3.3 Database Prefix

All new tables use the `pla_tournament_*` prefix. Approximately 25 new tables, all purely additive.

### 3.4 Data Isolation

New trait `ProtectedTournamentModel` filters by `organizer_id`. Existing `ProtectedModel` (which filters by `club_id`) is NOT modified for tournament models. Conditional logic in `ClubScope` handles the context switch: when `current_context_type === 'organizer'`, the club scope is bypassed.

---

## 4. User Roles and Context

### 4.1 Organizer Role

A new role `organizer` is added to `UserClubRole`. An existing Widdo user (club owner, parent, coach) can activate an organizer profile via `POST /api/organizer/activate`. New users can register directly as organizers.

The organizer entity (`PlaOrganizer`) stores: organization name, logo, description, website, phone, email, city, social media, verification status.

### 4.2 Context Switching

The existing `ContextController` and `UserContextProvider.jsx` are extended (not refactored) to support organizer contexts. The `current_context_type` column on the `users` table determines which branch of logic applies throughout the system.

When switching from club → organizer or organizer → club, all React Query caches are invalidated and the sidebar menu reconfigures for the appropriate role.

### 4.3 Frontend Guards

A new `OrganizerGuard` component protects organizer-only routes. Existing `AdminRouteGuard` and role-based guards remain untouched.

---

## 5. Tournament Lifecycle

### 5.1 Creation

Organizer creates tournament via wizard:
1. Basic info (name, sport, dates, location, description)
2. Categories (age groups, gender, skill level)
3. Registration settings (open/invite, deadlines, required documents, fields)
4. Venues and courts
5. Scheduling constraints
6. Pricing (free or paid registration, gate tickets)
7. Flyer upload (promotional image with zoom overlay)

### 5.2 Registration

Two registration types:

**Club registration** (cross-club): A club owner registers their team for a tournament. Players from that club are automatically linked. This is the primary flow — it connects the tournament ecosystem to the club ecosystem.

**Individual registration**: For tournaments that accept individuals (not teams). User must have a Widdo account.

Registration redirects always go to `app.widdo.co/tournaments/[slug]/register` — never to a public Next.js page. This ensures every registrant enters the Widdo ecosystem.

### 5.3 Bracket Generation

Six bracket formats supported:
1. **Single elimination** — standard knockout
2. **Double elimination** — losers bracket, second chance
3. **Group stage** — round-robin groups, then knockout
4. **Round robin** — everyone plays everyone
5. **Swiss system** — paired by similar records
6. **Groups → elimination** — hybrid format

The `BracketGeneratorService` generates matches (who vs who). The `SchedulingService` then assigns when and where.

### 5.4 Scheduling

The AI Scheduling Engine takes matches, courts, and constraints as input and produces an optimized schedule.

**11 constraint types:**

| Constraint | Type | Description |
|-----------|------|-------------|
| `min_rest_between_games` | Hard/Soft | Minimum rest between games for same team |
| `max_games_per_day` | Hard/Soft | Maximum games per team per day |
| `no_back_to_back` | Hard | No consecutive games without rest |
| `blackout_times` | Hard | Blocked time slots (lunch, setup, etc.) |
| `team_venue_preference` | Soft | Team prefers specific venue |
| `avoid_early_late` | Soft | Allowed time range (e.g., 8am-8pm) |
| `championship_primetime` | Soft | Finals scheduled for prime time |
| `referee_availability` | Hard | Referee available time windows |
| `travel_time_between_venues` | Hard | Travel time between multi-venue locations |
| `balanced_am_pm` | Soft | Even distribution of AM/PM slots |
| `stay_to_play` | Soft | Traveling teams get minimum N games/day |

**Quality score (0-100):**
- 90-100: Excellent — all constraints satisfied
- 70-89: Good — minor soft constraint violations
- 50-69: Acceptable — some compromises needed
- Below 50: Poor — organizer should review and adjust

Manual override: organizers can drag-and-drop matches to different slots after auto-generation.

### 5.5 Live Competition

Real-time scoring via WebSocket channels (`tournament.{id}`). Multiple concurrent courts supported. Offline capability with sync on reconnect.

### 5.6 Post-Tournament

- Automatic bracket completion and standings calculation
- Review requests sent to coaches/parents (24h after completion)
- Stats aggregation to player profiles (inside ecosystem only)
- Tournament rating calculated (Widdo Score)

---

## 6. Public Pages (Next.js)

### 6.1 Tournament Directory

**Route:** `/tournaments`

Grid of tournament cards with filters:
- Sport, location (city/state), date range, age category, gender
- Sort by: date, rating, distance, price, participants
- Cursor-based pagination

Each card shows: flyer thumbnail, name, sport, dates, location, price range, Widdo Score, participant count.

### 6.2 Tournament Preview

**Route:** `/tournaments/[slug]`

Teaser page with:
- Full flyer with pinch-zoom overlay (mobile) / scroll-zoom (desktop)
- Tournament info: name, dates, location, sport, organizer
- Categories list with registration status (open/closed/full)
- Map embed showing venue location
- **Blurred sections:** brackets, schedule, scores, teams (with "Sign in to view" overlay)
- CTA: "Register Now" → redirects to `app.widdo.co/tournaments/[slug]/register`

Three flyer image sizes served: thumbnail (400px), medium (800px), full (1600px).

### 6.3 Programmatic SEO Pages

**Routes:**
- `/tournaments/[sport]/[city]` — e.g., `/tournaments/basketball/orlando`
- `/tournaments/[sport]/[state]` — e.g., `/tournaments/soccer/florida`

Auto-generated pages listing tournaments filtered by sport and location. Structured data (JSON-LD Event schema) for Google rich results.

### 6.4 Social Sharing

Each tournament generates Open Graph meta tags:
- `og:title`: Tournament name
- `og:description`: Sport, dates, location, categories
- `og:image`: Flyer image (medium size)

WhatsApp, Instagram, and Twitter share buttons on preview page.

---

## 7. Gate Tickets

Parents/spectators can purchase gate admission tickets through Widdo. This is a **user acquisition tool**, not a revenue stream.

**Flow:**
1. Parent sees tournament (via social share, directory, or direct link)
2. Clicks "Buy Tickets" → redirected to `app.widdo.co` login/register
3. Creates Widdo account (or logs in)
4. Selects ticket type + quantity
5. Pays via Stripe
6. Receives QR code ticket in Widdo app
7. Scans QR at gate for entry

**Pricing:** Widdo charges ZERO convenience fee. Only Stripe's standard processing (~2.9% + $0.30). Organizer sets ticket price and receives full amount minus Stripe fees.

**QR check-in:** Organizer staff scans QR codes at venue entry using the Widdo mobile app. Real-time check-in counter on organizer dashboard.

---

## 8. Payment Architecture

### 8.1 Separation from Club Payments

Tournament payments use a **separate table** (`pla_tournament_payments`) and a **separate controller** (`TournamentPaymentController`). They do NOT flow through the existing `PaymentService` or `PlaClubTeamPayments`.

**Webhook routing:** The `WebhookController` uses a `payment_context ENUM('subscription','tournament')` field in the Stripe metadata reference to route webhooks to the correct handler.

**Reference format:** Tournament references use prefix `TRN-{tournamentId}-{regId}-{random}` (club subscriptions use `SUB-{clubId}-{planId}-{random}`).

### 8.2 Money Flow

Stripe Connect (Express accounts). Money goes **directly to the organizer's Stripe account**, never to Widdo's account. This avoids Money Transmitter License requirements.

Organizer onboarding: 5-minute Stripe Connect Express setup embedded in organizer activation flow.

---

## 9. Legal Compliance

### 9.1 COPPA (Children's Online Privacy Protection Act)

**Risk level: LOW** — by design.

No player profiles are publicly accessible. All minor data is behind authentication. Parents must create accounts to register children, providing implicit consent through account creation and registration actions.

No public collection, display, or sharing of minor data eliminates the need for:
- Verifiable parental consent mechanisms for public data
- Public data deletion requests from non-users
- Age verification on public pages

### 9.2 State Privacy Laws

Tournament organizers must acknowledge compliance responsibilities during tournament creation. Widdo provides tools (required documents, waivers, consent forms) but the organizer is the data controller for their tournament.

Data collected during registration is scoped to the tournament and the organizer. Cross-tournament data aggregation (for player profiles) requires explicit user consent within the Widdo ecosystem.

### 9.3 NIL (Name, Image, Likeness)

Player market value data generated from club + tournament activity stays inside the Widdo ecosystem. No public exposure. Parents can package their child's data to share with college coaches — but this is a deliberate export action, not a public profile.

The NIL infrastructure is a future monetization opportunity ($1.17B market) but does NOT affect tournament implementation.

### 9.4 SafeSport and Background Checks

Tournament organizers can require staff background checks as part of tournament setup. Integration with FDLE Level 2 checks (Florida requirement for working with minors) is available as an optional configuration.

---

## 10. Risk Analysis

### 10.1 Critical Risk (4 points — require regression testing)

| # | Component | Phase | Risk | Mitigation |
|---|-----------|-------|------|-----------|
| 1 | Context Switcher | 0 | `current_club_id` never null in current code. Organizer without club triggers cascade of nulls | Add `current_context_type` column. Branch in downstream: `if context_type === 'club'` uses existing logic untouched |
| 2 | ProtectedModel + ClubScope | 0 | `ClubScope` applies `WHERE club_id = user.current_club_id` to ALL 17 ProtectedModel models. Null club_id breaks queries | In `ClubScope::apply()`: if context is organizer, skip scope. Tournament models use new `ProtectedTournamentModel` trait |
| 3 | AI Assistant | 3 | `ClubAssistantService` + `ClubAssistantToolExecutor` (56 tools) are coupled to club_id | Create new `AgentService` + `TournamentAgentToolExecutor` in parallel. Test all 56 existing tools before migration |
| 4 | Payment Service | 6 | `PaymentService` assumes all payments = club subscriptions | Separate `TournamentPaymentController` + `pla_tournament_payments` table. Different webhook reference prefix |

### 10.2 Protection Strategy (5 rules)

1. **Phase 0 first and alone** — touches context switcher + ProtectedModel. Full regression tests before proceeding
2. **"Create in parallel" pattern** — for AI (Phase 3) and Payments (Phase 6): create NEW services alongside old ones
3. **100% separate routes** — `/api/organizer/*` and `/api/tournaments/*` never touch `/api/pla_club_teams/{clubId}/*`
4. **New trait for tournaments** — `ProtectedTournamentModel` filters by `organizer_id`, does NOT reuse `ProtectedModel`
5. **Regression tests per phase** — login, club CRUD, subscription payments, AI chat, context switch

---

## 11. Implementation Phases

### Layer 1 — ORGANIZE (core functionality)

| Phase | Name | Tasks | Days | Risk |
|-------|------|-------|------|------|
| 0 | Organizer Role (multi-role) | 20 | 3-4 | HIGH |
| 1 | Multi-Sport + Scoring Config | 18 | 3-4 | Medium |
| 2 | Cross-Club Registration | 25 | 5-7 | Medium |
| 3 | Bracket Engine + AI Agent | 32 | 8-12 | HIGH |
| 4 | Public Portal (Next.js teaser pages) | 9 | 2-3 | Low |
| 5 | Live Scoring + Offline | 26 | 8-10 | Low |
| 6 | Registration Payments | 11 | 2-3 | HIGH |
| 7 | Stats + Recruiting | 48 | 8-12 | Low |
| 8 | Mobile Optimized | 6 | 2-3 | Low |
| 9 | Smart Scheduling Engine | 15 | 3-5 | Medium |

### Layer 2 — DISCOVER (marketplace)

| Phase | Name | Tasks | Days | Risk |
|-------|------|-------|------|------|
| 10 | Tournament Directory + Rating + Reviews | 18 | 4-5 | Low |
| 11 | Map View + Recommendations + Alerts | 12 | 3-4 | Low |

### Layer 3 — COMPETE (social sports)

| Phase | Name | Tasks | Days | Risk |
|-------|------|-------|------|------|
| 12 | Private Profiles + Rankings + Follow | 20 | 5-7 | Low |
| 13 | Achievements + Head-to-Head + Highlights | 14 | 3-4 | Low |

### Gaps vs Competition

| Phase | Name | Tasks | Days | Risk |
|-------|------|-------|------|------|
| 14 | Gate QR + Check-in + Monitor | 12 | 3-4 | Low |
| 15 | PDF Reports + Scoresheets | 8 | 2-3 | Low |
| 16 | SMS + Social Auto-Post + Streaming | 10 | 2-3 | Low |
| 17 | Stripe + PayPal (USA) | 8 | 3-4 | Medium |
| 18 | Weather + Volunteers + Sponsors | 12 | 3-4 | Low |
| 19 | Carpool + Dispute/Protest | 8 | 2-3 | Low |
| 20 | Tournament Templates + Series/Circuits | 10 | 2-3 | Low |

### Totals

| Layer | Phases | Tasks | Estimated Days |
|-------|--------|-------|---------------|
| Organize (core) | 0-9 | ~210 | ~45-65 |
| Discover | 10-11 | ~30 | ~7-9 |
| Compete | 12-13 | ~34 | ~8-11 |
| Gaps | 14-20 | ~68 | ~18-24 |
| **TOTAL** | **21 phases** | **~342** | **~78-109 days** |

**MVP (phases 0-6, 9, 15, 17):** ~150 tasks, ~35-50 days — a fully organizable tournament with scheduling, payments, brackets, PDFs, Stripe.

---

## 12. Database Tables (~25 new)

### Core

| Table | Phase | Purpose |
|-------|-------|---------|
| `pla_organizers` | 0 | Organizer profiles |
| `pla_tournament_venues` | 9 | Tournament venues/locations |
| `pla_tournament_courts` | 9 | Courts/fields within venues |
| `pla_tournament_schedule_slots` | 9 | Time slots per court |
| `pla_tournament_schedule_constraints` | 9 | Scheduling rules |
| `pla_tournament_registrations` | 2 | Team/individual registrations |
| `pla_tournament_registration_players` | 2 | Players in a registration |
| `pla_tournament_invitations` | 2 | Organizer invites to clubs |
| `pla_tournament_brackets` | 3 | Bracket definitions |
| `pla_tournament_matches` | 3 | Individual matches |
| `pla_tournament_match_events` | 5 | Goals, fouls, cards, etc. |
| `pla_tournament_payments` | 6 | Registration/gate payments |
| `pla_tournament_ratings` | 10 | Calculated tournament scores |
| `pla_tournament_reviews` | 10 | Coach/parent reviews |
| `pla_tournament_gate_tickets` | 14 | Spectator admission tickets |

### Existing Tables Modified

| Table | Phase | Change |
|-------|-------|--------|
| `users` | 0 | Add `current_context_type ENUM('club','organizer')` |
| `user_club_roles` | 0 | Add `organizer` role, make `club_id` nullable |
| `pla_club_teams_tournaments` | 0 | Add `organizer_id` FK, make `club_id` nullable |
| `pla_tournament_matches` | 9 | Add `court_id`, `schedule_slot_id` FKs |

---

## 13. Existing Code That Gets Modified

### Backend (13 files)

| File | Phase | Risk | Change |
|------|-------|------|--------|
| `ProtectedModel.php` | 0 | HIGH | Conditional: skip club scope for organizer context |
| `ClubScope.php` | 0 | HIGH | Check `context_type` before applying |
| `ContextController.php` | 0 | HIGH | Support organizer contexts |
| `ClubAssistantService.php` | 3 | HIGH | Extract to `AgentService` (parallel) |
| `ClubAssistantToolExecutor.php` | 3 | HIGH | Create `TournamentAgentToolExecutor` (parallel) |
| `PaymentService.php` | 6 | HIGH | Route tournament payments to separate handler |
| `UserClubRole.php` | 0 | Medium | Add `ROLE_ORGANIZER` constant |
| `PlaTournament.php` | 0 | Medium | Add organizer relation |
| `WebhookController.php` | 6 | Medium | Route by payment context |
| `AuthController.php` | 0-2 | Medium | Organizer registration + context loading |
| `routes/api.php` | All | Low | Add route groups |
| `routes/channels.php` | 5 | Low | Add tournament channels |
| `RolesSeeder.php` | 0 | Low | Add organizer role |

### Frontend (10 files)

| File | Phase | Risk | Change |
|------|-------|------|--------|
| `UserContextProvider.jsx` | 0 | HIGH | Handle organizer context type |
| `AuthContext.jsx` | 0 | HIGH | Organizer awareness in auth flow |
| `useTournaments.js` | 0 | Medium | Separate query keys for organizer |
| `TournamentWizard.jsx` | 1 | Medium | Add sport selection step |
| `AssistantChatBubble.jsx` | 3 | Medium | Context-aware agent switching |
| `App.jsx` | All | Low | Add organizer routes |
| `MenuList.jsx` | 0 | Low | Add organizer menu config |
| `ContextSwitcher.jsx` | 0 | Low | Show organizer option |
| `TournamentDetailPage.jsx` | 5-7 | Low | Add live/stats tabs |
| `OrganizerGuard.jsx` | 0 | Low | NEW guard component |

---

## 14. Competitive Advantages vs Exposure Events

| Feature | Exposure Events | Widdo Tournaments |
|---------|----------------|-------------------|
| Price | $2/team | Free |
| Directory | Broken since 2019 | Real-time, filterable, rated |
| Scheduling | Complex manual workflow | AI-powered with constraints |
| Player profiles | None (transactional) | Persistent across tournaments |
| Mobile app | White-label with ads | Native app, ad-free |
| Languages | English only | EN/ES/PT |
| Gate tickets | External (GoFan, etc.) | Integrated with QR check-in |
| Club integration | None | Zero re-entry from club management |
| Data continuity | Per-event only | Career stats across all events |
| SEO | Minimal | Programmatic pages by city/sport |
| Map view | None | Interactive with filters |
| Reviews/ratings | None | Verified participant reviews |

---

## 15. Success Metrics

| Metric | Target (6 months) | Target (12 months) |
|--------|-------------------|---------------------|
| Tournaments organized | 20 | 100 |
| Clubs converted (tournament → subscription) | 10 | 50 |
| New user accounts from tournaments | 500 | 5,000 |
| Scheduling quality score (avg) | >80 | >85 |
| Organizer retention (% organizing >1) | >40% | >50% |
| Tournament directory page views | 5,000/mo | 50,000/mo |

---

## 16. Out of Scope

- **Public player profiles** — explicitly rejected. All player data stays behind authentication
- **BNPL / financing** — removed from Widdo's business model
- **Pathways / Academy** — Academy remains a future Widdo vertical in standby and is outside the current product and production scope
- **Revenue from tournaments** — tournaments are free. Revenue comes from club SaaS subscriptions
- **Exposure Events integration** — no partnership or data import from competitors
- **Referee management** — referees are modeled as a scheduling constraint, not a full management module
