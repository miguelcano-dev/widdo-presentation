# Clubs Attendance Family Alerts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver idempotent attendance alerts to authorized guardians across every Widdo Clubs attendance path, with production-grade browser push.

**Architecture:** Attendance mutations emit normalized descriptors only after persistence. A dedicated service resolves eligible guardians, claims a persistent unique dispatch, and queues delivery through NotificationManager. The push channel fans out to native FCM/Expo tokens and standards-compliant VAPID subscriptions.

**Tech Stack:** Laravel 12, MySQL, queues, PHPUnit, minishlink/web-push 10.1, React/Vite Node contract tests.

## Global Constraints

- Do not modify Tournaments or Academy.
- Notify guardians only for minor players with authorized parent-child relationships and active, non-expired `parent` membership in the same club.
- Notify `present`, `late`, and `checked_out` immediately after commit.
- Notify `absent` only when an event is ended or a complete training attendance list is saved.
- A repeated unchanged attendance state must not generate a second logical alert.
- Notification failures must never roll back attendance.
- Tests must not contact email, FCM, Expo, or browser push services.
- Keep plans/specifications local and do not push.

---

### Task 1: Replace simplified Web Push with RFC-compliant delivery

**Files:**
- Modify: `desarrollo/saas_sport/composer.json`
- Modify: `desarrollo/saas_sport/composer.lock`
- Modify: `desarrollo/saas_sport/app/Services/WebPushService.php`
- Create: `desarrollo/saas_sport/app/Jobs/SendWebPushNotificationJob.php`
- Modify: `desarrollo/saas_sport/app/Services/Notifications/Channels/PushChannel.php`
- Create: `desarrollo/saas_sport/tests/Feature/WebPushDeliveryTest.php`

**Interfaces:**
- Consumes: stored `PushSubscription`, VAPID configuration, and NotificationManager push payloads.
- Produces: queued FCM/Expo and VAPID delivery under one logical `push` channel.

- [ ] Add a failing test proving a user with only a VAPID subscription makes `PushChannel::isAvailable()` true and dispatches `SendWebPushNotificationJob`.
- [ ] Add a failing service test with a fake Minishlink sender proving payload, content encoding, 201 success, and 404/410 subscription removal behavior without network access.
- [ ] Install `minishlink/web-push:^10.1` through Composer.
- [ ] Replace manual VAPID JWT and plaintext payload logic with `Minishlink\WebPush\Subscription` and `WebPush::sendOneNotification`.
- [ ] Give the web-push job three attempts and `[10, 60, 300]` backoff; retry transport/5xx failures and do not retry a removed subscription.
- [ ] Update `PushChannel` to dispatch native-token and VAPID jobs and mark unavailable only when neither mechanism exists.
- [ ] Run the focused tests and Composer validation.

### Task 2: Build persistent guardian resolution and idempotency

**Files:**
- Create: `desarrollo/saas_sport/database/migrations/2026_07_17_000002_create_attendance_notification_dispatches_table.php`
- Create: `desarrollo/saas_sport/app/Models/AttendanceNotificationDispatch.php`
- Create: `desarrollo/saas_sport/app/Services/Notifications/AttendanceGuardianResolver.php`
- Create: `desarrollo/saas_sport/app/Services/Notifications/AttendanceAlertService.php`
- Create: `desarrollo/saas_sport/app/Jobs/SendAttendanceAlertJob.php`
- Create: `desarrollo/saas_sport/tests/Feature/AttendanceAlertServiceTest.php`

**Interfaces:**
- Produces: `AttendanceAlertService::queue(array $descriptor): int` returning the number of newly claimed guardian alerts.
- Descriptor keys: `source_type`, `source_id`, `club_id`, `player_user_id`, `occurrence_date`, `status`, `occurred_at`, `activity_name`, `created_by`, `action_url`.

- [ ] Write failing tests for authorized guardian, pending/denied relationship, inactive/expired parent role, adult player, no guardian, two guardians, and duplicate descriptor.
- [ ] Store a SHA-256 idempotency key unique across source type/id, occurrence date, player, state, and guardian.
- [ ] Resolve only `ParentChildRelationship::authorized()` parents with a valid `UserClubRole::ROLE_PARENT` in the descriptor club.
- [ ] Use the user's real `isMinor()` result; adult/no-recipient returns zero without error.
- [ ] Create claims with `firstOrCreate`; dispatch jobs with `DB::afterCommit` only for newly created rows.
- [ ] `SendAttendanceAlertJob` sends `attendance_marked` for present/late/checkout and `attendance_absent` for absent, using guardian-facing copy and NotificationManager.
- [ ] Mark dispatch `sent` after delivery orchestration and `failed` only after final job failure.
- [ ] Run focused service tests until green.

### Task 3: Integrate event attendance once per real transition

**Files:**
- Modify: `desarrollo/saas_sport/app/Services/AttendanceService.php`
- Create: `desarrollo/saas_sport/tests/Feature/EventAttendanceFamilyAlertTest.php`

**Interfaces:**
- Consumes: AttendanceAlertService descriptor contract.
- Produces: alerts from manual API, auto check-in, and QR event check-in because all delegate to AttendanceService.

- [ ] Write failing tests for present, late without an intermediate present alert, checkout, repeated check-in, and absence emitted by `endAttendanceSession`.
- [ ] Capture the persisted prior state before mutation and queue only when the normalized state changes.
- [ ] Refactor late handling so it does not call a notifying check-in path before emitting `late`.
- [ ] At event end, create missing absence records for participants and queue absence once; existing present/late attendees are not marked absent.
- [ ] Verify QR event and auto check-in inherit the same behavior without controller duplication.

### Task 4: Integrate training list and QR attendance

**Files:**
- Modify: `desarrollo/saas_sport/app/Http/Controllers/PlaClubTeamSessionController.php`
- Modify: `desarrollo/saas_sport/app/Http/Controllers/ClubCredentialController.php`
- Modify: `desarrollo/saas_sport/tests/Feature/SessionAttendanceStoreTest.php`
- Modify: `desarrollo/saas_sport/tests/Feature/ClubCredentialQrTest.php`
- Create: `desarrollo/saas_sport/tests/Feature/TrainingAttendanceFamilyAlertTest.php`

**Interfaces:**
- Consumes: AttendanceAlertService descriptor contract.
- Produces: list-save alerts for present/late/absent and QR alerts for present.

- [ ] Write failing tests for list statuses, unchanged second save, status transition, QR first scan, repeated QR scan, and guardian eligibility.
- [ ] Preserve the original normalized state before `fill()` and compare it with the incoming status.
- [ ] Queue descriptors only after each record is saved; a complete list save is the absence-finalization boundary.
- [ ] In QR attendance, use `wasRecentlyCreated` plus the original attended/notes state to suppress repeat scans.
- [ ] Preserve existing payment generation/cancellation behavior and N+1 query limits.

### Task 5: Align the browser subscription frontend contract

**Files:**
- Create: `desarrollo/frontend/src/services/webPushContract.js`
- Modify: `desarrollo/frontend/src/services/webPushService.js`
- Create: `desarrollo/frontend/tests/config/web-push-contract.test.mjs`

**Interfaces:**
- Produces canonical `/api/push-subscriptions` base, public-key, status, test, and delete URLs.

- [ ] Write a failing Node test for all methods and URLs using a fake HTTP client.
- [ ] Move endpoints and request construction into a pure tested service factory.
- [ ] Keep browser feature detection and service-worker behavior unchanged.
- [ ] Run config tests, changed-file ESLint, and production build.

### Task 6: Full 3A.3 verification

- [ ] Run all notification and attendance focused tests.
- [ ] Run Pint, Composer validate, migration status, and `git diff --check`.
- [ ] Run `./start.sh --test` and require zero failures.
- [ ] Run frontend config tests, changed-file ESLint, and `npm run build`.
- [ ] Run `./start.sh --e2e`; if an existing E2E defect fails, isolate it with logs and prove whether it predates this phase.
- [ ] Confirm no Tournaments or Academy code changed.
- [ ] Commit backend and frontend production/test files separately; never include local plan/spec files in a push.
