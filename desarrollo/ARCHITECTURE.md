# Widdo - System Architecture

## Overview

Widdo is a multi-tenant SaaS platform for managing sports clubs and training organizations. The system enables club owners, trainers, accountants, players, and parents to manage player registration, attendance tracking, payments, events, documents, and communications.

This document currently evaluates **Widdo Clubs only**. Widdo Academy is in
standby, and Tournaments is intentionally excluded from the July 2026 Clubs
production-readiness review.

The platform is built with a decoupled architecture: a Laravel 12 REST API backend handles business logic, authentication, and data persistence, while a React 18 SPA frontend provides the user interface. The platform started as a Colombian product (COP, Colombian geography, Spanish) and still serves those clubs, but the commercial focus is now **USA-only**, with club onboarding opening January 2027. Localization covers English, Spanish and Brazilian Portuguese across 37 namespaces.

The multi-tenancy model uses `club_id` scoping, where each club's data is isolated through global query scopes. Users can have multiple roles across different clubs (e.g., owner of Club A, trainer at Club B), with context switching to manage each role.

---

## Stack Comparison

| Aspect | Backend (saas_sport/) | Frontend (frontend/) |
|--------|----------------------|---------------------|
| **Framework** | Laravel 12 | React 18 + Vite 5 |
| **Language** | PHP 8.2+ | JavaScript (ES2022) |
| **Auth** | Sanctum + Refresh Tokens | Context API + Axios Interceptors |
| **Styling** | N/A | Tailwind CSS 3 + Radix UI |
| **State** | Eloquent ORM | React Query 5 + Context |
| **Forms** | Form Requests | React Hook Form + Zod |
| **Testing** | PHPUnit | Playwright E2E |
| **API** | REST + JSON | Axios HTTP Client |

---

## Integration Points

### Authentication Flow
```
Login Request -> Laravel Sanctum -> Access Token (60 min) + Refresh Token (30 days, httpOnly cookie)
                                         |
Token Refresh -> Backend validates cookie -> New Access Token + Rotated Refresh Token
                                         |
Frontend Interceptor -> Detects X-Token-Refresh-Suggested header -> Auto-refresh
```

### API Communication
- Base URL: `/api/*` (proxied in dev, direct in prod)
- Auth: Bearer token in Authorization header
- Multi-tenancy: `club_id` from user context
- Rate limiting: 300/min authenticated, 60/min public

### Deployment
| Component | Service | URL |
|-----------|---------|-----|
| Backend API | DigitalOcean Droplet | api.widdo.co |
| Database | DO Managed MySQL | Internal connection |
| Files | DO Spaces | CDN for public, signed URLs for private |
| Frontend | Vercel/Netlify | widdo.co |

---

## System Modules

Module presence does not imply production certification. The verified status
matrix lives in `MODULES_AND_ROLES.md`. Preferences, announcements, attendance
alerts, Web Push and report routing/export were aligned and covered in the July
2026 closure. The remaining cross-layer gap is direct feature coverage for
expenses, inventory, enrollment and import/export.

| Module | Description | Backend | Frontend |
|--------|-------------|---------|----------|
| **Auth** | Login, register, password reset, refresh tokens | AuthController, RefreshTokenController | LoginPage, AuthContext |
| **Clubs** | Club management, settings, logo upload | PlaClubTeamController | ClubTeamPage |
| **Players** | Player CRUD, documents, categories | PlaClubTeamPlayerController | PlayersPage, PlayerCreateEditPage |
| **Trainers** | Trainer management, category assignments | PlaClubTeamTrainerController | TrainersPage |
| **Sessions** | Training sessions, recurrence rules | PlaClubTeamSessionController | SessionsPage |
| **Attendance** | Session attendance tracking | AttendanceController | AttendancePage |
| **Payments** | Payment records, installments | PlaClubTeamPaymentController | PaymentsPage |
| **Charges** | Fee types, discounts | PlaClubTeamChargeController, PlaClubTeamDiscountController | ChargesPage, DiscountsPage |
| **Events** | Calendar events, invitations | EventController | CalendarPage |
| **Tournaments** | External tournaments, player assignments | PlaTournamentController | TournamentsPage |
| **Dashboards** | Role-specific dashboards | SimpleDashboardController | DashboardPage (6 variants) |
| **Subscriptions** | SaaS plans, Stripe Checkout + billing portal | SubscriptionController, StripePortalController | SubscriptionPage |
| **Admin** | Super admin: analytics, blog, system | AdminAnalyticsController, BlogAdminController | /home/admin/* |

---

## Not Covered by This Document

The July 2026 review scoped itself to Widdo Clubs. Four substantial parts of the system are
therefore missing from the tables above — not because they are immature, but because they were
out of scope. Anyone using this document to reason about the platform should know they exist.

**Tournaments** is the most developed of the four and is effectively a second product: a bracket
engine covering six formats, live scoring over Reverb, public tournament pages, QR check-in, and
payments through Stripe Connect Express where the organizer is the merchant and Widdo takes **zero
commission**. It has its own controllers, its own routes under `organizer/*`, and its own webhook
endpoint. What it does not have is the ability to bill anyone: that waits on Gate 0.

**AI agent.** Widdo ships a conversational assistant with a large tool surface (read and write)
scoped per role, plus a daily brief and an onboarding agent. Any new module is expected to decide
whether it exposes tools to it. Runs on OpenAI in production.

**Charges v2 (`cobros`).** The billing engine — charge generation with guards, versioning, closed
periods, payment modalities, exemptions — lives in `app/Services/Payments/` alongside the gateway
code and is considerably larger than the "Payments" and "Charges" rows above suggest. Debt is
defined by `due_date`, never by a status column.

**Mobile client.** The mobile app is **Flutter**, in a separate repository
(`widdo-mobile-flutter`); its specs live in `desarrollo/mobile_flutter/`. It consumes the same
REST API plus Reverb for real-time. The earlier React Native attempt was abandoned. Note that
Reverb needs `REVERB_PUBLIC_HOST` in production for the mobile client to keep real-time on, and
that variable is still missing.

---

## Role Hierarchy

| Role | Level | Scope |
|------|-------|-------|
| Super Admin | 100 | Full platform access |
| Owner | 80 | Full club access + financials |
| Accountant | 60 | Financial modules only |
| Trainer | 40 | Sessions + attendance |
| Parent | 20 | Children's data only |
| Player | 10 | Own data only |

---

## Key Architecture Decisions

1. **Multi-tenancy via club_id**: Global scopes auto-filter all queries
2. **Multi-context users**: One user can have different roles in different clubs
3. **Refresh tokens in httpOnly cookies**: Security against XSS token theft
4. **File storage strategy**: Local in dev, DigitalOcean Spaces in prod
5. **Queue-based jobs**: Email, reminders, and notifications processed async

---

## Documentation References

- **Backend details**: See `saas_sport/BACKEND.md` and `saas_sport/CLAUDE.md`
- **Database schema**: See `saas_sport/database/migrations/` and the Eloquent models in `saas_sport/app/Models/`
- **Frontend details**: See `frontend/CLAUDE.md` (`FRONTEND.md` was archived on 13-Aug-2026 into `_archivo-docs/frontend/`; its content lives in `CLAUDE.md` now)
- **Mobile app**: Flutter, separate repo `widdo-mobile-flutter` — specs in `mobile_flutter/specs/`, start at `ARRANQUE.md`. The React Native app was abandoned on 13-Aug-2026 (`_archivo-mobile-rn/`)
- **API endpoints**: See `saas_sport/BACKEND.md` (API Endpoints section)
- **Testing**: See `saas_sport/TESTING_STRATEGY.md` and `frontend/TESTING_ROUTES.md`
