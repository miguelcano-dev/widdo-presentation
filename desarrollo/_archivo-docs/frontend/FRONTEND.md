<!-- ARCHIVADO 13-ago-2026 — duplicaba 13 de 20 secciones de frontend/CLAUDE.md y traía una tabla de credenciales E2E falsa — sustituido por frontend/CLAUDE.md (lo único y correcto se migró allí) + tests/e2e/fixtures/test-users.js para credenciales -->
<!-- Origen: frontend/FRONTEND.md -->

# Widdo Frontend - Technical Documentation

## Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| Vite | 5.4.21 | Build Tool & Dev Server |
| Tailwind CSS | 3.4.1 | Styling |
| Radix UI | Various | Accessible UI Primitives |
| React Router | 6.22.3 | Client-side Routing |
| React Query | 5.35.5 | Server State Management |
| React Hook Form | 7.51.2 | Form Management |
| Zod | 3.22.4 | Schema Validation |
| Axios | 1.6.8 | HTTP Client |
| Playwright | 1.56.1 | E2E Testing |
| date-fns | 3.6.0 | Date Manipulation |

### Key Dependencies
- `lucide-react` - Icons
- `react-select` - Advanced Select Components
- `react-datepicker` / `react-day-picker` - Date Pickers
- `react-quill` - Rich Text Editor
- `sonner` - Toast Notifications
- `jspdf` / `html2canvas` - PDF Generation
- `xlsx` - Excel Export
- `leaflet` / `react-leaflet` - Maps
- `@sentry/react` - Error Monitoring
- `laravel-echo` / `pusher-js` - Real-time Events

---

## Source Structure

```
src/
├── assets/              # Static assets (images, SVGs)
├── components/          # Reusable components
│   ├── admin/          # Blog management forms
│   ├── auth/           # PrivateRoute, PublicRoute, QuickLoginPanel
│   ├── common/         # WhatsAppButton, SafeHTML
│   ├── dashboard/      # QuickActions, StatsGrid, AlertCard
│   ├── dashboards/     # Role-specific dashboards (Accountant, Player)
│   ├── datatable/      # DataTable components (pagination, search)
│   ├── documents/      # Document management
│   ├── elements/       # Reusable UI elements
│   ├── error/          # Error boundaries
│   ├── form/           # Form inputs (DatePicker, Currency, etc.)
│   ├── guards/         # Route guards (RBAC)
│   ├── landing/        # Landing page sections
│   ├── loading/        # Loading spinners, skeletons
│   ├── onboarding/     # Onboarding wizard
│   ├── parent-child/   # Parent-child relationship manager
│   ├── payments/       # Payment dialogs, receipts
│   ├── performance/    # LazyImage, OptimizedComponents
│   ├── security/       # PasswordStrength, SessionAlert
│   ├── settings/       # NotificationPreferences
│   ├── signature/      # SignaturePad
│   ├── subscription/   # SubscriptionLimitAlert
│   └── ui/             # Radix UI primitives (button, card, dialog, etc.)
├── constants/           # roles.js, modules.js
├── context/             # React Context providers
├── helpers/             # Utility functions (date, format, etc.)
├── hooks/               # Custom React hooks
├── layouts/             # Page layouts (Public, Private, Onboarding)
├── pages/               # Page components
├── services/            # API service modules
├── tests/               # Test files (security, e2e)
└── utils/               # Utility modules
```

---

## Components Overview

### Guards (Route Protection)
| Guard | Allows | Location |
|-------|--------|----------|
| `SuperAdminGuard` | Super Admin only | `/components/guards/` |
| `AdminRouteGuard` | Owner, Admin, Trainer, Accountant | `/components/guards/` |
| `FinancialRouteGuard` | Owner, Admin, Accountant | `/components/guards/` |
| `TrainerRouteGuard` | Owner, Admin, Trainer, Accountant | `/components/guards/` |
| `OwnerOnlyGuard` | Owner (optionally +Admin) | `/components/guards/` |
| `ParentOnlyGuard` | Parent only | `/components/guards/` |
| `PlayerOrParentGuard` | Player, Parent | `/components/guards/` |

### Form Components
- `FormDateInput` - Date picker with Spanish locale
- `FormDateOfBirth` - Birth date picker with year dropdown
- `FormPasswordInput` - Password with visibility toggle
- `FormCountryStateCityComponent` - Location selector (cascading)
- `FormClubSport` - Club and sport selector
- `CurrencyInput` - Colombian peso formatting
- `TimePickerAmPm` - Time picker with AM/PM

### Loading Components
- `LoadingSpinner` - Unified spinner (inline/centered/fullscreen)
- `DataTableSkeleton` - Table loading placeholder
- `FormSkeleton` - Form loading placeholder
- `CardSkeleton` - Card loading placeholder
- `GlobalLoadingOverlay` - Full-page overlay

### UI Components (Radix-based)
`accordion`, `alert`, `badge`, `breadcrumb`, `button`, `card`, `checkbox`, `command`, `dialog`, `dropdown-menu`, `form`, `input`, `label`, `popover`, `progress`, `radio-group`, `select`, `separator`, `skeleton`, `slider`, `switch`, `table`, `tabs`, `textarea`, `toast`, `tooltip`

---

## Pages & Routes

### Public Routes
| Route | Page | Description |
|-------|------|-------------|
| `/` | LandingPage | Main landing (SEO) |
| `/login` | LoginPage | Authentication |
| `/register` | RegisterPage | New user registration |
| `/forgot-password` | ForgotPasswordPage | Password recovery |
| `/reset-password` | ResetPasswordPage | Password reset |
| `/verificar-email` | VerifyEmailPage | Email verification |
| `/blog` | BlogPage | Blog listing (SEO) |
| `/blog/:slug` | BlogPostPage | Blog article (SEO) |
| `/terminos` | TerminosPage | Terms of service (SEO) |
| `/privacidad` | PrivacidadPage | Privacy policy (SEO) |
| `/centro-ayuda` | CentroAyudaPage | Help center (SEO) |
| `/ligas` | LigasLandingPage | Leagues landing (SEO) |
| `/escuelas-futbol` | EscuelasFutbolPage | Soccer schools landing (SEO) |
| `/clubes-futbol` | ClubesFutbolPage | Soccer clubs landing (SEO) |
| `/invitation/:token` | InvitationPage | Team invitation |
| `/inscripcion/:clubName/:token` | PublicEnrollmentPage | Public enrollment |

### Private Routes (`/home/*`)
| Route | Page | Guard |
|-------|------|-------|
| `/home/dashboard` | DashboardPage | PrivateRoute |
| `/home/calendar` | CalendarPage | PrivateRoute |
| `/home/my-profile` | AccountSettingsPage | PrivateRoute |
| `/home/context-selector` | ContextSelectorPage | PrivateRoute |
| `/home/subscription` | SubscriptionPage | OwnerOnlyGuard |
| `/home/club-team` | ClubTeamPage | AdminRouteGuard |
| `/home/team-members` | TeamMembersPage | AdminRouteGuard |
| `/home/categories` | CategoriesClubTeamPage | AdminRouteGuard |
| `/home/trainers` | TrainersClubTeamPage | AdminRouteGuard |
| `/home/players` | PlayersClubTeamPage | AdminRouteGuard |
| `/home/player-create/:playerId?` | PlayerCreateEditPage | AdminRouteGuard |
| `/home/sessions` | SessionsPage | TrainerRouteGuard |
| `/home/attendance` | AttendancePage | TrainerRouteGuard |
| `/home/venues` | VenuesPage | AdminRouteGuard |
| `/home/payments` | PaymentsClubTeamPage | FinancialRouteGuard |
| `/home/chargers` | ChargesClubTeamPage | FinancialRouteGuard |
| `/home/discounts` | DiscountsClubTeamPage | FinancialRouteGuard |
| `/home/expenses` | ExpensesClubTeamPage | FinancialRouteGuard |
| `/home/financial-reports` | FinancialReportsPage | FinancialRouteGuard |
| `/home/payment-settings` | PaymentSettingsPage | FinancialRouteGuard |
| `/home/inventory` | InventoryPage | AdminRouteGuard |
| `/home/file-vault` | FileVaultPage | AdminRouteGuard |
| `/home/tournaments/*` | TournamentsPage | AdminRouteGuard |
| `/home/legal-documents` | LegalDocumentsPage | AdminRouteGuard |
| `/home/my-payments` | MyPaymentsPage | PlayerOrParentGuard |
| `/home/my-children` | MyChildrenPage | ParentOnlyGuard |
| `/home/my-documents` | MyDocumentsPage | PlayerOrParentGuard |
| `/home/children-sessions` | ChildrenSessionsPage | ParentOnlyGuard |

### Super Admin Routes (`/home/admin/*`)
`clubs`, `analytics`, `blog`, `system`, `communications`, `reports`, `subscription-plans`, `system-settings`, `sports`, `countries`, `audit-logs`, `notification-logs`, `system-diagnostics`

---

## API Integration

### Services (`/src/services/`)
| Service | Purpose |
|---------|---------|
| `axiosInstance.js` | Configured Axios with interceptors, refresh token |
| `apiService.js` | Base API service |
| `sessionService.js` | Sessions CRUD |
| `invitationService.js` | Team invitations |
| `publicEnrollmentService.js` | Public enrollment links |
| `parentChildService.js` | Parent-child relationships |
| `expenseService.js` | Expenses management |
| `inventoryService.js` | Inventory management |
| `fileVaultService.js` | File vault operations |
| `consentService.js` | Consent templates |
| `legalDocumentService.js` | Legal documents |
| `moduleService.js` | Module access |
| `notificationService.js` | Notifications |
| `onboardingService.js` | Onboarding flow |
| `contextService.js` | User context (multi-role) |
| `echo.js` | Laravel Echo (WebSockets) |
| `accessDeniedHandler.js` | 403 handling |

### API Configuration
- Base URL: `VITE_API_URL` (default: `http://localhost:8010/api`)
- Dev proxy: `/api` -> `localhost:8010`
- Auth: Bearer token with automatic refresh
- Refresh token stored in httpOnly cookie

---

## State Management

### Context Providers (`/src/context/`)
| Context | Purpose |
|---------|---------|
| `AuthContext` | User authentication, tokens, login/logout |
| `ClubContext` | Current club selection, club data |
| `LoadingContext` | Global loading state |
| `OnboardingContext` | Onboarding wizard state |
| `SubscriptionContext` | Subscription limits |
| `ModuleContext` | Module access permissions |
| `OverlayContext` | UI overlays |
| `PublicSettingsContext` | Public settings |
| `UserContextProvider` | User data provider |

### Custom Hooks (`/src/hooks/`)
**Authentication & Permissions:**
- `useAuth` - Authentication state
- `usePermissions` - RBAC permissions check
- `useClubPermissions` - Club-specific permissions
- `useModuleAccess` - Module access check

**Data Fetching (React Query):**
- `usePlayerData`, `usePlayerMutation`, `usePlayerDeleteMutation`
- `useTrainerData`, `useTrainerMutation`
- `useCategoryData`, `useCategoryMutation`
- `useChargeData`, `useChargeMutation`
- `useDiscountData`, `useDiscountMutation`
- `usePaymentData`, `usePaymentMutation`
- `useExpensesData`, `useExpensesMutations`
- `useInventoryData`, `useInventoryMutations`
- `useTournament`, `useTournamentMutation`
- `useFileVaultData`, `useFileVaultMutations`

**Utilities:**
- `useFormErrorFocus` - Focus first form error
- `useFormPersistence` - Form draft persistence
- `useSecureInput` - Input sanitization
- `useValidateDocumentNumber` - Document validation
- `useProfileCompletion` - Profile completion %
- `useResourceLimit` - Subscription limits
- `usePushNotifications` - Push notification setup
- `useRealtimeNotifications` - Real-time events
- `useDocumentScanner` - Document scanning

---

## Build Configuration

### Vite Optimizations
- **Code Splitting:** Manual chunks for react-vendor, ui-vendor, utils-vendor
- **Route-based chunks:** Dashboard, auth routes
- **Compression:** Gzip + Brotli in production
- **Minification:** Terser with console removal
- **Asset hashing:** Long-term caching

### Environment Variables
```bash
VITE_API_URL=http://localhost:8010/api
VITE_APP_ENV=development
```

---

## Testing

### E2E Tests (Playwright)
```bash
npm run test:e2e              # All tests
npm run test:e2e:ui           # Interactive UI
npm run test:e2e:owner        # Owner flow
npm run test:e2e:trainer      # Trainer flow
npm run test:e2e:player       # Player flow
npm run test:e2e:parent       # Parent flow
```

### Test Users
| Role | Email | Password |
|------|-------|----------|
| Owner | director@bogotafc.co | Password123! |
| Trainer | diego.sanchez@bogotafc.co | Password123! |
| Player | alejandro.alvarez10@player.co | Password123! |
| Parent | luzm@h.com | Password123! |
| Super Admin | admin@sportsclub.co | AdminPassword123! |

---

## Performance Features

- **Lazy Loading:** All private routes use `lazyWithRetry`
- **SEO Pages:** Pre-rendered (not lazy) for immediate content
- **Image Optimization:** LazyImage component with blur placeholders
- **Chunk Error Boundary:** Automatic retry on failed chunk loads
- **Preloading:** Critical routes preloaded after auth check
