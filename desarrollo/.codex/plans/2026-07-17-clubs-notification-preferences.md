# Clubs Notification Preferences Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Clubs notification settings UI and Laravel API use one tested contract for reading, updating, and resetting preferences.

**Architecture:** Laravel remains the source of truth at `/api/notification-settings`. The React service consumes exported endpoint constants and a pure response normalizer so the contract can be tested with Node without adding a frontend test framework.

**Tech Stack:** Laravel 12, PHPUnit, React 18, Vite 5, Node test runner, ESLint.

## Global Constraints

- Do not modify Tournaments or Academy.
- Do not add compatibility routes for `/api/notifications/preferences`.
- Reset means `POST /api/notification-settings/reset`, not “enable all”.
- Preserve unrelated frontend changes in `RichTextEditor.jsx` and `ClubMessageModal.jsx`.
- Do not contact external notification services in tests.

---

### Task 1: Lock the Laravel preferences contract

**Files:**
- Create: `desarrollo/saas_sport/tests/Feature/NotificationSettingsTest.php`
- Modify only if a failing test proves necessary: `desarrollo/saas_sport/app/Http/Controllers/Api/NotificationSettingsController.php`

**Interfaces:**
- Consumes: authenticated Sanctum API and `PreferenceResolver::getPreferencesForApi(User $user): array`.
- Produces: stable `GET`, `PUT`, and `POST reset` JSON responses under `/api/notification-settings`.

- [ ] **Step 1: Write failing feature tests**

Create tests using `RefreshDatabase` that authenticate a user and assert:

```php
$this->getJson('/api/notification-settings')
    ->assertOk()
    ->assertJsonPath('success', true)
    ->assertJsonStructure(['data' => [
        'push_enabled', 'email_enabled', 'categories',
        'quiet_hours' => ['enabled', 'start', 'end', 'timezone', 'is_active_now'],
    ]]);

$this->putJson('/api/notification-settings', [
    'push_enabled' => false,
    'categories' => ['events' => ['email' => false]],
    'quiet_hours' => [
        'enabled' => true,
        'start' => '22:00',
        'end' => '07:00',
        'timezone' => 'America/Bogota',
    ],
])->assertOk()
  ->assertJsonPath('data.push_enabled', false)
  ->assertJsonPath('data.categories.events.email', false);

$this->postJson('/api/notification-settings/reset')
    ->assertOk()
    ->assertJsonPath('data.push_enabled', true)
    ->assertJsonPath('data.email_enabled', true);
```

Also assert unauthenticated requests return `401`, invalid time/timezone returns `422`, and an unknown category does not create an arbitrary database field.

- [ ] **Step 2: Run the focused tests and confirm the baseline**

Run:

```bash
cd desarrollo/saas_sport
php artisan test tests/Feature/NotificationSettingsTest.php
```

Expected: tests either pass against the existing controller or fail only on an explicitly asserted contract detail.

- [ ] **Step 3: Apply the smallest backend correction required by the tests**

Keep validation in `NotificationSettingsController::update`. If unknown categories currently pass silently, reject them with a whitelist matching the persisted category fields:

```php
'categories' => ['sometimes', 'array:events,payments,training,matches,club,system,invitations'],
```

Do not add new endpoints or preference models.

- [ ] **Step 4: Re-run focused backend tests**

Run the command from Step 2. Expected: all tests pass with zero skipped tests.

- [ ] **Step 5: Commit the backend contract tests and correction**

```bash
git add tests/Feature/NotificationSettingsTest.php app/Http/Controllers/Api/NotificationSettingsController.php
git commit -m "test: lock notification settings contract"
```

### Task 2: Create a testable frontend contract

**Files:**
- Create: `desarrollo/frontend/src/services/notificationSettingsContract.js`
- Create: `desarrollo/frontend/tests/config/notification-settings-contract.test.mjs`
- Modify: `desarrollo/frontend/src/services/notificationService.js`
- Modify: `desarrollo/frontend/package.json`

**Interfaces:**
- Produces: `NOTIFICATION_SETTINGS_ENDPOINT`, `normalizeNotificationSettings(payload, defaults)`.
- Consumes: Laravel response `{ success, data }`.

- [ ] **Step 1: Write the failing Node contract test**

The test imports the pure module and asserts:

```js
assert.equal(NOTIFICATION_SETTINGS_ENDPOINT, '/notification-settings');
assert.deepEqual(
  normalizeNotificationSettings(
    { data: { push_enabled: false, categories: { events: { push: false } } } },
    defaults
  ),
  {
    ...defaults,
    push_enabled: false,
    categories: {
      ...defaults.categories,
      events: { ...defaults.categories.events, push: false },
    },
  }
);
```

Also assert missing data returns defaults without mutating the defaults object.

- [ ] **Step 2: Make the config test command include both config tests**

Change `test:config` to:

```json
"test:config": "node --test tests/config/*.test.mjs"
```

Run `npm run test:config`. Expected: the new test fails because the module does not exist.

- [ ] **Step 3: Implement the pure contract module**

Export:

```js
export const NOTIFICATION_SETTINGS_ENDPOINT = '/notification-settings';

export function normalizeNotificationSettings(payload, defaults) {
  const data = payload?.data;
  if (!data) return structuredClone(defaults);

  const categories = Object.fromEntries(
    Object.entries(defaults.categories).map(([category, fallback]) => [
      category,
      { ...fallback, ...(data.categories?.[category] ?? {}) },
    ])
  );

  return {
    ...structuredClone(defaults),
    ...data,
    categories,
    quiet_hours: { ...defaults.quiet_hours, ...(data.quiet_hours ?? {}) },
  };
}
```

- [ ] **Step 4: Replace the legacy service methods**

`notificationService` must expose only:

```js
getSettings: async () => (await api.get(NOTIFICATION_SETTINGS_ENDPOINT)).data,
updateSettings: async (updates) =>
  (await api.put(NOTIFICATION_SETTINGS_ENDPOINT, updates)).data,
resetSettings: async () =>
  (await api.post(`${NOTIFICATION_SETTINGS_ENDPOINT}/reset`)).data,
```

Remove `getPreferences`, `updatePreference`, `updateBulkPreferences`, `enableAll`, and `disableAll` after confirming no other consumer exists.

- [ ] **Step 5: Run frontend contract tests**

Run `npm run test:config`. Expected: all config tests pass.

- [ ] **Step 6: Commit the frontend contract**

```bash
git add package.json src/services/notificationSettingsContract.js src/services/notificationService.js tests/config/notification-settings-contract.test.mjs
git commit -m "fix: align notification settings API contract"
```

### Task 3: Align hook state and reset semantics

**Files:**
- Modify: `desarrollo/frontend/src/hooks/usePushNotifications.js`
- Modify if an interaction defect is exposed: `desarrollo/frontend/src/components/notifications/NotificationSettings.jsx`
- Test: `desarrollo/frontend/tests/config/notification-settings-contract.test.mjs`

**Interfaces:**
- Consumes: the three methods from Task 2 and `normalizeNotificationSettings`.
- Produces: `useNotificationSettings()` with server-confirmed loading, update, rollback, and reset behavior.

- [ ] **Step 1: Extend the pure normalizer tests for partial category and quiet-hour responses**

Assert nested defaults survive partial server data and `types` inside each backend category does not remove `push` or `email`.

- [ ] **Step 2: Update `loadSettings`**

Call `notificationService.getSettings()` and pass its result through `normalizeNotificationSettings(response, DEFAULT_SETTINGS)`. Remove the obsolete expectation that `types` exists at `data.types`; derive the displayed type list from category `types` values or keep it empty when the component does not consume it.

- [ ] **Step 3: Update save and reset behavior**

Use `notificationService.updateSettings(updates)`. On success, normalize and store the returned server data. On failure, reload the server state. For reset, call `notificationService.resetSettings()` and normalize the returned data instead of assigning hard-coded defaults.

- [ ] **Step 4: Run frontend checks**

Run:

```bash
npm run test:config
npm run lint
npm run build
```

Expected: all commands exit `0`; build contains no missing export or unresolved import.

- [ ] **Step 5: Commit the hook alignment**

```bash
git add src/hooks/usePushNotifications.js src/components/notifications/NotificationSettings.jsx tests/config/notification-settings-contract.test.mjs
git commit -m "fix: persist notification settings from server"
```

### Task 4: Phase 3A.1 regression gate

**Files:**
- No production changes unless a regression is found.

**Interfaces:**
- Produces: verified completion evidence for 3A.1.

- [ ] **Step 1: Run backend notification tests**

```bash
cd desarrollo/saas_sport
php artisan test tests/Feature/NotificationSettingsTest.php
```

- [ ] **Step 2: Run complete backend suite through the approved launcher**

```bash
cd desarrollo
./start.sh --test
```

Expected: exit `0`, with no new skipped or failed Clubs tests.

- [ ] **Step 3: Repeat frontend verification**

```bash
cd desarrollo/frontend
npm run test:config
npm run lint
npm run build
```

- [ ] **Step 4: Inspect scope and dirty files**

Run `git status --short` and `git diff --check` in both repositories. Confirm no Tournaments or Academy paths changed and the two pre-existing frontend modifications remain untouched.

- [ ] **Step 5: Mark 3A.1 complete only after every gate passes**

Record exact test counts and commands. If a gate fails, fix the root cause, repeat the focused test, then repeat this full regression gate.
