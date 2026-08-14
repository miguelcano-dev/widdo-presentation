# Clubs Announcement Security Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure only authorized Clubs administrators can send announcements and every recipient is an active member of the same club.

**Architecture:** A focused domain service validates the sender and resolves the complete authorized audience before delivery. The controller delegates to it and uses `NotificationManager` so preferences and delivery channels remain centralized.

**Tech Stack:** Laravel 12, Sanctum, Eloquent, PHPUnit, existing NotificationManager.

## Global Constraints

- Do not modify Tournaments or Academy.
- Allowed senders are active club `owner`, active club `admin`, and Super Admin.
- Every requested recipient must have an active, non-expired role in the same club.
- Reject the whole request when any recipient is invalid; never send partially.
- Do not expose exception messages in HTTP responses.
- Keep the implementation and plan local; do not push.

---

### Task 1: Prove the authorization and tenant boundary

**Files:**
- Create: `desarrollo/saas_sport/tests/Feature/ClubAnnouncementSecurityTest.php`

**Interfaces:**
- Consumes: `POST /api/notifications/club-announcement`.
- Produces: executable security requirements for sender roles and audience membership.

- [ ] Write feature tests for owner, admin and Super Admin success; trainer/parent/player/anonymous rejection; external and inactive recipients; duplicate IDs; and all-or-nothing behavior.
- [ ] Seed only the `club_announcement` notification type and use `Mail::fake`, `Queue::fake`, and broadcast fakes where required.
- [ ] Run the file in Docker with `TEST_DB_DATABASE=db_testing_b` and confirm security cases fail against the current unprotected endpoint.

Expected success assertion:

```php
$this->postJson('/api/notifications/club-announcement', $payload)
    ->assertOk()
    ->assertJsonPath('data.recipients_count', 1);

$this->assertDatabaseHas('pla_club_teams_notifications', [
    'user_id' => $recipient->id,
    'club_id' => $this->club->id,
    'type' => 'club_announcement',
    'created_by' => $sender->id,
]);
```

Expected tenant rejection assertion:

```php
$this->postJson('/api/notifications/club-announcement', $mixedAudience)
    ->assertUnprocessable()
    ->assertJsonValidationErrors('user_ids');

$this->assertDatabaseCount('pla_club_teams_notifications', 0);
```

### Task 2: Centralize authorization and audience resolution

**Files:**
- Create: `desarrollo/saas_sport/app/Services/Notifications/ClubAnnouncementService.php`
- Modify: `desarrollo/saas_sport/app/Http/Controllers/NotificationController.php`

**Interfaces:**
- Produces: `ClubAnnouncementService::send(User $sender, int $clubId, string $title, string $message, array $userIds): array`.
- Consumes: `User::hasAnyRoleInClub`, `UserClubRole::valid`, and `NotificationManager::sendToMany`.

- [ ] Implement sender authorization with `owner`/`admin` constants and Super Admin bypass.
- [ ] Deduplicate IDs after request validation and resolve users in one query constrained by `clubRoles.valid()` and the requested club.
- [ ] Throw `ValidationException::withMessages(['user_ids' => ...])` unless the resolved ID set exactly equals the requested set.
- [ ] Call `NotificationManager::sendToMany('club_announcement', ...)` only after the entire audience is valid. Include `club_id`, `club_name`, `message`, `created_by`, and route metadata.
- [ ] Return `recipients_count` and per-channel logs without exposing internal errors.
- [ ] Replace the controller's broad `try/catch` for this action with normal Laravel validation and the service call. Validate `user_ids` as `required|array|min:1` and each entry as `integer|distinct|exists:users,id`.
- [ ] Re-run the focused test until all cases pass.

### Task 3: Respect type defaults for unset channel preferences

**Files:**
- Modify: `desarrollo/saas_sport/app/Models/UserNotificationSetting.php`
- Modify: `desarrollo/saas_sport/app/Services/Notifications/PreferenceResolver.php`
- Test: `desarrollo/saas_sport/tests/Feature/ClubAnnouncementSecurityTest.php`

**Interfaces:**
- Produces: `isPushEnabledFor(string $category, bool $fallback = true): bool` and `isEmailEnabledFor(string $category, bool $fallback = true): bool`.

- [ ] Add a failing test proving an unset `club` email preference honors `club_announcement.default_email = false` while an explicit true preference enables it.
- [ ] Pass each notification type's `default_push` and `default_email` into the model fallback methods from `PreferenceResolver`.
- [ ] Preserve global channel switches as the highest-priority disable.
- [ ] Re-run preference and announcement tests.

### Task 4: Regression gate

**Files:**
- No production changes unless a failing test proves a regression.

- [ ] Run Pint on changed PHP files and `git diff --check`.
- [ ] Run `NotificationSettingsTest` and `ClubAnnouncementSecurityTest` together.
- [ ] Run `./start.sh --test` and require zero failures.
- [ ] Confirm no Tournaments or Academy paths changed.
- [ ] Commit only 3A.2 backend files on `codex/clubs-notifications`.
