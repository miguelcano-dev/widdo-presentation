## 🚨 RONDA 0 — SUSCRIPCIONES & LIMITES (BLOCKER)

**CRITICO:** Debe implementarse ANTES de monetizar Colombia y ANTES de demo USA.

### Backend Tasks
- [ ] Migracion: tabla `bas_plan_modules` (plan_id, module_id, is_included)
- [ ] Migracion: tabla `bas_payment_methods_by_country` (country_id, name, code, gateway_slug, is_active, sort_order)
- [ ] Modelo `BasPlanModule` con relaciones y scopes
- [ ] Modelo `BasPaymentMethodByCountry` con relaciones y scopes
- [ ] Seeder: asignar modulos a planes (Basico/Pro/Enterprise)
- [ ] Seeder: payment methods CO (Efectivo, Transferencia, Nequi, Daviplata, PSE, Tarjeta) + USA (Credit Card, Debit Card, ACH, Cash, Check)
- [ ] Validar `max_members` en `PlaClubTeamPlayerController@store`
- [ ] Aplicar middleware `CheckModuleAccess` a rutas reales (existe pero no se usa)
- [ ] Endpoint: GET/PUT `/api/admin/plans/{id}/modules`
- [ ] Endpoint: GET `/api/countries/{id}/payment-methods`
- [ ] Grace period 7 dias si falla pago (logica downgrade/bloqueo)
- [ ] Super Admin override: habilitar modulos manualmente por club

### Referencia
- Spec completa: `desarrollo/usa/USA-TECHNICAL.md` → Ronda 0
- Spec frontend: `desarrollo/frontend/.claude/todos.md` → Ronda 0

---

# TODOs and Improvements - Widdo Backend

## TODOs Found in Code

### High Priority

| Location | TODO | Description |
|----------|------|-------------|
| `Handler.php:99` | Sentry integration | Add Sentry error reporting |
| `PlaClubTeamPlayerContact.php:49` | Encrypt PII | Encrypt email/phone contacts |
| `PlaClubTeam.php:91` | Encrypt PII | Encrypt telephone fields |
| `WebhookController.php:117` | ePayco integration | Implement ePayco webhook |
| `WebhookController.php:134` | MercadoPago integration | Implement MercadoPago webhook |
| `SubscriptionService.php:175` | Storage calculation | Calculate actual storage usage |

### Medium Priority

| Location | TODO | Description |
|----------|------|-------------|
| `PlayerCardController.php:122` | Player signature | Implement signature for 14+ players |
| `PlayerCardController.php:474` | QR code | Implement QR code generation for ID cards |
| `PlaTournamentController.php:1322-24` | Guardian data | Implement guardian info export |
| `AttendanceController.php:485` | Trend calculation | Calculate real attendance trends |
| `ContextController.php:570` | Pending payments | Implement pending payments model |
| `CountryManagementController.php:411` | Usage check | Verify item usage before deletion |

---

## Tests Needed

### Authorization Tests
- [ ] Cross-tenant data isolation (Club A cannot see Club B data)
- [ ] Role escalation prevention
- [ ] Context switching authorization
- [ ] API rate limiting verification

### Payment Tests
- [ ] Discount calculation edge cases
- [ ] Installment workflow complete
- [ ] Late fee tier application
- [ ] Webhook idempotency

### Event Tests
- [ ] Event reminder deduplication
- [ ] Participant notification delivery
- [ ] Session recurrence edge cases
- [ ] Holiday exception handling

### Integration Tests
- [ ] Wompi webhook signature validation
- [ ] File upload to Spaces in production
- [ ] Email delivery via Resend
- [ ] Push notification delivery

---

## Technical Debt

### Code Quality
1. **Console logging cleanup** - Some controllers still have debug logs
2. **Service method sizes** - Some services have 500+ line methods
3. **Duplicated validation** - Form request validation not consistently used
4. **Error messages** - Inconsistent error message format

### Performance
1. **N+1 queries** - Some nested relationships not eager loaded
2. **Cache usage** - Not all frequently-accessed data is cached
3. **Query optimization** - Some complex queries need review

### Security
1. **PII encryption** - Phone/email fields should be encrypted at rest
2. **Audit completeness** - Not all sensitive actions are audited
3. **Rate limiting** - Per-endpoint rate limits not configured

---

## Feature Improvements

### Short-term
- [ ] Implement QR code for player ID cards
- [ ] Add signature pad for consent forms
- [ ] Calculate real storage usage per club
- [ ] Add attendance trend calculations

### Medium-term
- [ ] ePayco payment gateway
- [ ] MercadoPago payment gateway
- [ ] WebSocket notifications (Laravel Reverb)
- [ ] SMS notifications (Twilio/AWS SNS)

### Long-term
- [ ] Mobile app API optimizations
- [ ] GraphQL API layer
- [ ] Real-time collaboration features
- [ ] AI-powered insights dashboard

---

## Migration Notes

### Laravel 12 Preparation
When upgrading to Laravel 12:
1. Replace FCM with Web Push nativo
2. Implement Laravel Reverb for WebSockets
3. Update Sanctum configuration
4. Review middleware changes

### Database Optimizations
Consider:
1. Partitioning large tables (payments, attendance)
2. Archive old data strategy
3. Read replicas for reporting queries

---

## Documentation Gaps

- [ ] API documentation (OpenAPI/Swagger)
- [ ] Postman collection update
- [ ] Webhook payload documentation
- [ ] Error code catalog
