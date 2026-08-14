# Consentimiento Informado — Diseño

> ## ✅ EJECUTADO Y EN PRODUCCIÓN (estado al 13-ago-2026)
>
> Verificado contra el código: 7 modelos vivos (`DataConsent`, `PlaClubConsentTemplate`,
> `PlaClubTeamConsentForm`, `PlaClubTeamSignedConsent`, `PlaClubTeamExternalConsentDoc`,
> `PlaClubTeamExternalConsentSignature`, `BasCountryConsentConfig`) + seeders
> `ConsentConfigCOSeeder` / `ConsentConfigUSSeeder` / `ConsentPermissionsSeeder` y el
> middleware `check-consent` cableado en `routes/api.php`.
>
> ⚠️ Convivencia: hay **seis** sistemas de consentimiento en el producto (ver la memoria
> `consentimientos-seis-sistemas-jul2026`). Todo permiso nuevo va **siempre en migración**.
> Este archivo es el diseño original; no lo tomes como el inventario actual.


**Fecha:** 2026-04-19
**Autor:** Miguel Angel Cano + Claude
**Estado:** Spec aprobado, pendiente implementación
**Rama destino:** `feature/consent-forms` (nueva, sale de `main` — no de `feature/usa-adaptation`)

---

## 1. Propósito

Permitir que cada club de Widdo cree, edite y administre **consentimientos informados firmables digitalmente por padres/acudientes o jugadores mayores de edad**, con soporte multi-país y renovación anual. Reemplaza el flujo actual de clubes que imprimen PDFs, los firman a mano y los escanean (PDFs muestra: Cafam, WR Sports TYE, Baqueros Basketball).

**No es:** Waiver estilo USA (ya existe en `pla_club_teams_waiver_templates`). Este módulo es paralelo, orientado a CO/LATAM donde la figura legal es "Consentimiento informado" bajo marco LOPD/GDPR.

## 2. Alcance

Dos flujos independientes:

| Flujo | Origen del texto | Edita en Widdo | Firma en Widdo | Uso |
|---|---|---|---|---|
| **A — Anual del club** | Club lo redacta en TipTap | ✅ WYSIWYG | ✅ Canvas | Una vez por temporada/año, aplica a toda actividad del club |
| **B — Torneo/convocatoria** | Organizador sube PDF/Word | ❌ Sólo visor | ✅ Canvas + certificado de firma | Una vez por torneo al inscribir jugador |

## 3. Estado actual verificado

Ejecutado `php artisan tinker` el 2026-04-19:

```
DataConsent                        : 0
PlaSignedWaiver                    : 0
PlaWaiverTemplate                  : 5     ← templates USA default (seeder)
PlaDataTreatmentAuthorization      : 0
PlaTournamentWaiver                : 0
PlaTournamentWaiverSignature       : 0
PlaClubConsentTemplate             : 0
```

**Conclusión:** Cero firmas reales en producción. Infraestructura existente puede reutilizarse selectivamente sin riesgo de ruptura.

**Infraestructura aprovechable:**
- `bas_country_consent_configs` — tabla base multi-país (ya existe, falta poblar)
- `SignaturePad.jsx` / `SignatureCanvas.jsx` — componentes canvas ya implementados
- `CertificationPdfService` + Gotenberg + Blade — stack PDF funcionando
- `HtmlSanitizer` — sanitización TipTap

**Infraestructura a NO tocar:**
- `pla_club_teams_waiver_templates` + `pla_club_teams_signed_waivers` — quedan para USA
- `pla_club_teams_tournament_waivers` — queda como extensión USA (ya multi-país, pero el Flujo B tendrá su propia tabla CO-friendly)

## 4. Arquitectura general

### 4.1 Tablas nuevas (3)

```
pla_club_teams_consent_forms          ← plantillas
pla_club_teams_signed_consents        ← firmas (Flujo A)
pla_club_teams_external_consent_docs  ← PDFs subidos por organizadores (Flujo B)

pla_club_teams_external_consent_signatures ← firmas de Flujo B
```

### 4.2 Tablas a extender (1)

`bas_country_consent_configs` — añadir columnas para templates base por país/idioma y versionado.

### 4.3 Servicios nuevos

- `ConsentFormService` — CRUD plantillas, duplicado, renovación anual
- `ConsentSignatureService` — captura de firma, generación PDF, hash
- `ExternalConsentDocService` — upload PDF/Word, conversión Word→PDF vía Gotenberg, generación PDF compuesto (original + certificado firma)

### 4.4 Controllers nuevos

- `ConsentFormController` — admin del club
- `ConsentSignatureController` — padre/jugador firmando
- `ExternalConsentController` — organizador subiendo PDF + padre firmando
- `ConsentVerificationController` — endpoint público `/api/verify/consent/{hash}`

### 4.5 Frontend nuevo

```
frontend/src/
├── pages/
│   ├── admin/
│   │   ├── ConsentTemplatesPage.jsx          # listado
│   │   ├── ConsentTemplateEditorPage.jsx     # editor TipTap
│   │   └── ConsentSignaturesPage.jsx         # dashboard firmados
│   └── signing/
│       ├── ConsentSignPage.jsx               # padre firma Flujo A (pública con link)
│       └── ExternalConsentSignPage.jsx       # padre firma Flujo B (pública con link)
├── components/consent/
│   ├── ConsentVariablesPanel.jsx             # panel insertar variables
│   ├── ConsentPreview.jsx                    # preview con datos ejemplo
│   ├── ConsentPdfViewer.jsx                  # PDF.js viewer (Flujo B)
│   ├── ConsentMultiChildFlow.jsx             # padre con N hijos en 1 sesión
│   └── ConsentFamilySignFlow.jsx             # padre + menor mismo móvil
└── services/
    └── consentFormService.js
```

## 5. Modelo de datos detallado

### 5.1 `bas_country_consent_configs` — EXTENDER

```php
Schema::table('bas_country_consent_configs', function (Blueprint $table) {
    $table->string('country_code', 2)->index();
    $table->string('language', 5)->default('es'); // es, en, pt, es-MX, etc
    $table->string('jurisdiction_law', 255); // "Ley 1581 de 2012 + Decreto 1377 de 2013"
    $table->string('data_authority_name', 255)->nullable(); // "SIC" / "ANPD" / "INAI"
    $table->longText('base_template_content'); // HTML TipTap, texto base por país
    $table->json('suggested_clauses'); // { data: "...", image: "...", medical: "..." }
    $table->integer('minor_age_threshold')->default(18);
    $table->boolean('requires_parent_for_minor')->default(true);
    $table->boolean('requires_minor_co_signature')->default(false);
    $table->string('template_version', 20)->default('1.0.0');
    $table->timestamp('law_last_reviewed_at')->nullable();
    $table->unique(['country_code', 'language']);
});
```

**Seeders iniciales:**
- `ConsentConfigCOSeeder` — CO, es, Ley 1581/2012
- `ConsentConfigUSSeeder` — US, en, Tort law (referencia a waivers)
- `ConsentConfigMXSeeder` — MX, es, LFPDPPP
- `ConsentConfigBRSeeder` — BR, pt, LGPD
- `ConsentConfigARSeeder` — AR, es, Ley 25.326
- `ConsentConfigPRSeeder` — PR, es+en, HIPAA + Ley 22
- `ConsentConfigECSeeder` — placeholder genérico con disclaimer

Cada seeder incluye cláusulas precargadas redactadas por abogado local (investigación pendiente). MVP arranca con CO y US (ya tenemos referencias). El resto se suma según demanda.

### 5.2 `pla_club_teams_consent_forms` — NUEVA

```php
Schema::create('pla_club_teams_consent_forms', function (Blueprint $table) {
    $table->id();
    $table->foreignId('club_id')->constrained('pla_club_teams')->cascadeOnDelete();
    $table->string('name', 255); // "Consentimiento Informado 2026"
    $table->string('slug', 100); // único por club
    $table->enum('document_type', ['annual_club', 'one_time'])->default('annual_club');
    $table->integer('year_valid')->nullable(); // 2026, null para one_time
    $table->date('valid_from')->nullable();
    $table->date('valid_until')->nullable();
    $table->string('language', 5)->default('es');
    $table->string('country_code', 2); // heredado del club al crear
    $table->longText('content'); // HTML TipTap sanitizado
    $table->foreignId('based_on_config_id')->nullable()
        ->constrained('bas_country_consent_configs')->nullOnDelete();
    $table->string('based_on_config_version', 20)->nullable(); // freeze version usada
    $table->boolean('needs_review')->default(false); // flag seteado por CRON DetectLawChanges
    $table->timestamp('flagged_for_review_at')->nullable();
    $table->json('signers_required'); // ["parent","player_if_adult"] | ["parent","minor"]
    $table->enum('gate_mode', ['soft', 'hard'])->default('soft');
    $table->boolean('is_active')->default(false);
    $table->foreignId('created_by_user_id')->constrained('users');
    $table->timestamp('published_at')->nullable();
    $table->integer('version')->default(1);
    $table->timestamps();
    $table->softDeletes();

    $table->unique(['club_id', 'slug']);
    $table->index(['club_id', 'year_valid', 'is_active']);
});
```

**Reglas de negocio:**
- Un club puede tener UNA sola plantilla `annual_club` activa por `year_valid`. Validación a nivel controller.
- Al editar una plantilla con firmas existentes → NO modifica firmas pasadas (snapshot inmutable en tabla firmas).
- Al publicar (`is_active=true`, `published_at=now`) se disparan notificaciones a padres.

### 5.3 `pla_club_teams_signed_consents` — NUEVA

```php
Schema::create('pla_club_teams_signed_consents', function (Blueprint $table) {
    $table->id();
    $table->foreignId('club_id')->constrained('pla_club_teams')->cascadeOnDelete();
    $table->foreignId('consent_form_id')->constrained('pla_club_teams_consent_forms');
    $table->foreignId('player_id')->constrained('pla_club_team_players');

    // Firma principal (padre/acudiente o jugador mayor)
    $table->foreignId('signer_user_id')->nullable()->constrained('users');
    $table->enum('signer_role', ['parent','guardian','player_adult','player_minor']);
    $table->string('signer_name', 255);
    $table->string('signer_document_type', 20)->nullable(); // CC, PPT, TI, Passport
    $table->string('signer_document_number', 50);
    $table->string('signer_relationship', 50)->nullable(); // padre, madre, tío, tutor
    $table->string('signer_email', 255)->nullable();
    $table->string('signer_phone', 30)->nullable();
    $table->longText('signature_data'); // base64 PNG del canvas
    $table->enum('signature_method', ['digital_canvas','physical_scan','verbal']);

    // Firma co-firmante (menor si el documento lo exige)
    $table->longText('cosigner_signature_data')->nullable();
    $table->string('cosigner_name', 255)->nullable();
    $table->string('cosigner_document_number', 50)->nullable();

    // Auditoría
    $table->timestamp('signed_at');
    $table->string('ip_address', 45)->nullable();
    $table->text('user_agent')->nullable();
    $table->longText('snapshot_content'); // HTML con variables ya reemplazadas, inmutable
    $table->string('terms_hash', 64); // sha256(snapshot_content)
    $table->string('verification_hash', 64)->unique(); // uuid para URL pública

    // Archivos
    $table->string('pdf_path', 500)->nullable(); // Storage path

    // Ciclo de vida
    $table->enum('status', ['signed','revoked','superseded'])->default('signed');
    $table->timestamp('revoked_at')->nullable();
    $table->string('revoked_reason', 500)->nullable();
    $table->foreignId('revoked_by_user_id')->nullable()->constrained('users');

    $table->json('metadata')->nullable(); // {"multi_child_batch_id": "uuid", ...}

    $table->timestamps();

    $table->unique(['consent_form_id', 'player_id', 'status'], 'unique_active_signature_per_player');
    $table->index(['club_id', 'status']);
    $table->index(['signed_at']);
});
```

### 5.4 `pla_club_teams_external_consent_docs` — NUEVA (Flujo B)

```php
Schema::create('pla_club_teams_external_consent_docs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('club_id')->nullable()->constrained('pla_club_teams');
    $table->foreignId('tournament_id')->nullable()->constrained('pla_tournaments');
    $table->string('title', 255); // "Exoneración Copa TYE 2026"
    $table->string('original_filename', 500);
    $table->string('file_path', 500); // path al PDF convertido
    $table->string('file_hash', 64); // sha256 del archivo, inmutable
    $table->enum('source_format', ['pdf','docx','doc']);
    $table->enum('applies_to', ['all_players','specific_category','specific_tournament'])->default('specific_tournament');
    $table->json('signers_required'); // ["parent","player_if_adult"]
    $table->boolean('is_active')->default(true);
    $table->foreignId('uploaded_by_user_id')->constrained('users');
    $table->timestamps();
    $table->softDeletes();

    $table->index(['club_id', 'tournament_id']);
});
```

### 5.5 `pla_club_teams_external_consent_signatures` — NUEVA

```php
Schema::create('pla_club_teams_external_consent_signatures', function (Blueprint $table) {
    $table->id();
    $table->foreignId('external_doc_id')->constrained('pla_club_teams_external_consent_docs');
    $table->foreignId('player_id')->nullable()->constrained('pla_club_team_players');
    $table->foreignId('tournament_player_id')->nullable()
        ->constrained('pla_tournament_players'); // alternativo si es flujo torneo
    // Mismos campos de firma + auditoría que signed_consents
    $table->foreignId('signer_user_id')->nullable()->constrained('users');
    $table->enum('signer_role', ['parent','guardian','player_adult','player_minor']);
    $table->string('signer_name', 255);
    $table->string('signer_document_number', 50);
    $table->string('signer_relationship', 50)->nullable();
    $table->string('signer_email', 255)->nullable();
    $table->longText('signature_data');
    $table->longText('cosigner_signature_data')->nullable();
    $table->string('cosigner_name', 255)->nullable();
    $table->timestamp('signed_at');
    $table->string('ip_address', 45)->nullable();
    $table->text('user_agent')->nullable();
    $table->string('document_file_hash', 64); // snapshot del hash del doc al momento de firmar
    $table->string('verification_hash', 64)->unique();
    $table->string('signed_pdf_path', 500); // PDF compuesto: original + página de certificado
    $table->enum('status', ['signed','revoked'])->default('signed');
    $table->timestamps();
});
```

## 6. Endpoints API

```
# Admin del club — plantillas (Flujo A)
GET    /api/pla_club_teams/{clubId}/consent-forms                 # listar
POST   /api/pla_club_teams/{clubId}/consent-forms                 # crear
GET    /api/pla_club_teams/{clubId}/consent-forms/{id}            # ver
PUT    /api/pla_club_teams/{clubId}/consent-forms/{id}            # editar
POST   /api/pla_club_teams/{clubId}/consent-forms/{id}/duplicate  # duplicar (para renovar año)
POST   /api/pla_club_teams/{clubId}/consent-forms/{id}/publish    # activar
DELETE /api/pla_club_teams/{clubId}/consent-forms/{id}            # soft delete
GET    /api/pla_club_teams/{clubId}/consent-forms/{id}/preview-pdf?player_id=X # preview

# Admin — dashboard firmados
GET    /api/pla_club_teams/{clubId}/consent-forms/{id}/signatures # listar firmas
POST   /api/pla_club_teams/{clubId}/consent-forms/{id}/send-reminders
POST   /api/pla_club_teams/{clubId}/consent-forms/{id}/signatures/{sigId}/upload-physical

# Padre/jugador — firma Flujo A (links firmados, sin auth dura)
GET    /api/public/consents/{token}                              # obtener plantilla + datos del jugador
POST   /api/public/consents/{token}/sign                         # firmar

# Verificación pública
GET    /api/verify/consent/{hash}                                # info pública del PDF firmado

# Admin — doc externo (Flujo B)
POST   /api/pla_club_teams/{clubId}/external-consents                  # subir PDF/Word
GET    /api/pla_club_teams/{clubId}/external-consents                  # listar
POST   /api/tournaments/{tournamentId}/external-consents               # subir ligado a torneo
GET    /api/tournaments/{tournamentId}/external-consents/{id}/signatures

# Padre/jugador — firma Flujo B
GET    /api/public/external-consents/{token}                     # info + URL firmada del PDF
POST   /api/public/external-consents/{token}/sign                # firma sobre PDF externo

# Revocación
POST   /api/consent-signatures/{id}/revoke
POST   /api/external-consent-signatures/{id}/revoke

# Config países (admin plataforma — superadmin)
GET    /api/admin/consent-configs
PUT    /api/admin/consent-configs/{id}
```

Todos los endpoints de club pasan por `ClubScope` (multi-tenancy). Los públicos con token firmado (HMAC) con expiración 30 días.

## 7. Generación de PDF

### 7.1 Flujo A
1. `ConsentSignatureService::sign()` recibe firma + datos del firmante
2. Reemplaza variables en `content` de la plantilla con datos reales del jugador/firmante → resultado = `snapshot_content`
3. Calcula `terms_hash = sha256(snapshot_content)` y `verification_hash = uuid`
4. Renderiza Blade `resources/views/pdf/consent-form.blade.php`:
   - Cabecera: logo club, nombre documento, año
   - Texto: `{!! $snapshot_content !!}`
   - Firma(s): imagen base64 embebida
   - Footer: datos firmante, fecha, IP, hash, URL verificación (QR opcional)
5. Envía HTML a Gotenberg → recibe PDF → guarda en `clubs/{clubId}/consents/{year}/{player_id}-{verification_hash}.pdf`
6. Guarda registro en `signed_consents`
7. Dispara evento `ConsentSigned` (Reverb → admin dashboard actualiza contador)

### 7.2 Flujo B (PDF externo)
1. `ExternalConsentDocService::upload()`:
   - Si es DOCX, envía a Gotenberg LibreOffice module para convertir a PDF
   - Calcula `file_hash = sha256(pdf_bytes)`
   - Guarda en Storage
2. Padre ve PDF con `PDF.js` viewer (frontend)
3. Al firmar:
   - Canvas captura firma
   - Backend genera **página de certificado de firma electrónica** (Blade) con: nombre firmante, cédula, email, timestamp, IP, hash doc original, hash firma, URL verificación, QR
   - Gotenberg genera PDF de certificado
   - Merge PDF original + certificado → PDF final en `clubs/{clubId}/external-consents/{doc_id}/{signature_id}.pdf`
   - Guarda `signed_pdf_path`

**Librería merge:** `setasign/fpdi` (ya disponible vía composer en otros proyectos Laravel) o usar Gotenberg `/forms/pdfengines/merge`.

## 8. Variables disponibles en editor (Flujo A)

**Universales (todas las plantillas):**
- `[NOMBRE_CLUB]`, `[NIT_CLUB]`, `[DEPORTE]`, `[CIUDAD_CLUB]`
- `[NOMBRE_MENOR]`, `[DOCUMENTO_MENOR]`, `[TIPO_DOC_MENOR]`, `[FECHA_NACIMIENTO_MENOR]`, `[EDAD_MENOR]`
- `[NOMBRE_ACUDIENTE]`, `[DOCUMENTO_ACUDIENTE]`, `[PARENTESCO]`, `[EMAIL_ACUDIENTE]`, `[TELEFONO_ACUDIENTE]`
- `[FECHA_HOY]`, `[AÑO_VIGENCIA]`, `[CATEGORIA]`

**Dinámicas por país** (resuelven desde `bas_country_consent_configs`):
- `[LEY_REFERENCIA]` → "Ley 1581 de 2012 y Decreto 1377 de 2013" (CO), "LFPDPPP" (MX), "LGPD" (BR)
- `[AUTORIDAD_DATOS]` → "SIC" (CO), "INAI" (MX), "ANPD" (BR)
- `[EDAD_MAYORIA]` → 18 (mayoría países)

**Clase Service:** `ConsentVariableResolver::resolve(string $template, ConsentForm $form, PlaClubTeamPlayer $player, User $signer): string`

## 9. UX administrador del club

### 9.1 Menú
`Mi Club → Documentos Legales → Consentimientos` (nueva sección paralela a "Certificados")

### 9.2 `ConsentTemplatesPage.jsx` — Listado
- Tabla: Nombre · Año · Idioma · Estado · Firmados (`x/y`) · Última actualización · Acciones
- Filtros: año, estado, tipo (anual/puntual)
- Botones: `+ Nueva plantilla` (modal con 3 opciones: desde cero / template base del país / duplicar existente), `+ Doc externo` (Flujo B)
- Alerta roja si año vigente no tiene plantilla `is_active`

### 9.3 `ConsentTemplateEditorPage.jsx` — Editor
- **Header**: nombre, año vigencia, idioma, tipo documento
- **Editor TipTap central** — reutilizado del certificado (`CertificationTemplatePage.jsx` patrón)
- **Panel izquierdo**:
  - Botón `Cargar cláusulas del país` → inserta texto sugerido de `bas_country_consent_configs`
  - Settings: firmantes requeridos (checkbox), gate_mode (soft/hard)
- **Panel derecho**: preview en vivo con datos ejemplo (selector para probar con otro jugador)
- **Footer**: Guardar borrador · Publicar (si publica → confirm modal: "Se notificará a X padres")

### 9.4 `ConsentSignaturesPage.jsx` — Dashboard firmados
- Estadísticas arriba: total jugadores elegibles · firmados · pendientes · vencidos
- Tabla: Jugador · Categoría · Firmante · Fecha firma · Estado · PDF · Acciones
- Filtros: estado, categoría, rango fecha
- Búsqueda por nombre jugador
- Acción masiva: "Enviar recordatorio a pendientes" (email + push + WhatsApp)
- Por fila: descargar PDF · ver auditoría (IP, hash, user_agent) · revocar · marcar firmado en papel

## 10. UX padre/acudiente (Flujo A)

### 10.1 Trigger
- Al publicar plantilla → sistema dispara por cada jugador elegible:
  - Email con link firmado (HMAC) válido 30 días
  - Push si hay app instalada
  - WhatsApp si está habilitado
  - Banner en dashboard padre: "⚠ Consentimiento Informado {año} pendiente para {nombre_menor}"

### 10.2 `ConsentSignPage.jsx` (pública con token)
Pantalla única, diseño móvil-first:

1. **Header**: logo club + "Consentimiento Informado 2026" + nombre del hijo
2. **Texto del consentimiento** — HTML ya personalizado, scroll natural
3. **Cláusula destacada al final**: "He leído y acepto" (checkbox obligatorio, bloquea firma si no marcado)
4. **Datos del firmante** (auto-llenados pero editables):
   - Nombre completo
   - Parentesco (dropdown: Padre, Madre, Abuelo/a, Tío/a, Tutor legal, Otro → input)
   - Documento identidad (tipo + número)
   - Email + Teléfono
5. **Canvas de firma** (`SignaturePad.jsx` existente, full width móvil, botón "Limpiar")
6. **Si `signers_required` incluye menor** → aparece segundo canvas debajo: "Firma del menor ({nombre})"
7. Botón: **Firmar y enviar**
8. Success state: "✅ Firmado. Descargar PDF" + "Ver en tu dashboard"

### 10.3 Múltiples hijos del mismo padre
- Si padre tiene N hijos con consentimientos pendientes y mismo tipo de documento:
- Pantalla única `ConsentMultiChildFlow.jsx` con tabs por hijo
- 1 sola firma del padre se clona con `metadata.multi_child_batch_id = uuid` para auditoría agrupada
- Cada hijo genera su propio registro en `signed_consents` con su propio `verification_hash` y PDF

### 10.4 Firma conjunta padre + menor
- Si `signers_required = ["parent","minor"]`
- Pantalla `ConsentFamilySignFlow.jsx`:
  1. Padre firma primero en canvas A, click "Pasar al menor"
  2. Canvas A queda readonly, aparece canvas B para menor
  3. Menor firma, click "Enviar"
  4. Ambas firmas en mismo PDF, cosigner fields rellenos

### 10.5 Jugador mayor de edad
- Si jugador tiene cuenta propia y `edad >= 18`: login propio → dashboard → banner "firma tu consentimiento"
- `signer_role = 'player_adult'`, no aparece campo parentesco

## 11. UX padre/acudiente (Flujo B — PDF externo del torneo)

### 11.1 Trigger
- Al inscribir jugador a torneo con `external_consent_doc_id` asignado → genera token → envía email/push/WhatsApp

### 11.2 `ExternalConsentSignPage.jsx`
1. **Header**: logo torneo + nombre del documento
2. **PDF.js viewer** — padre ve el PDF original scroll completo
3. Al llegar al final (detect scroll bottom) → aparece botón **"Firmar"** habilitado
4. Click → modal con:
   - Canvas de firma
   - Datos del firmante (mismo form que Flujo A)
   - Checkbox "He leído y acepto el contenido del documento"
5. Al enviar:
   - Backend genera página de **"Certificado de Firma Electrónica"** con todos los datos + QR verificación
   - Merge PDF original + certificado → PDF final
   - Envía por email copia al padre

## 12. Decisiones aprobadas (las 9 del brainstorming)

| # | Decisión | Implementación |
|---|---|---|
| 1 | Inmutabilidad de lo firmado | `snapshot_content` + `terms_hash` en `signed_consents`; edición de plantilla no afecta firmas existentes |
| 2 | Firma conjunta padre + menor | Campos `cosigner_*` en tabla firma + `ConsentFamilySignFlow.jsx` |
| 3 | Re-firma automática al cumplir 18 | CRON diario `App\Console\Commands\DetectAdultPlayers`: busca jugadores que cumplieron 18 con firma vigente de padre → marca signature como `superseded` y dispara nueva solicitud a jugador |
| 4 | 1 sesión para múltiples hijos | `ConsentMultiChildFlow.jsx` + `metadata.multi_child_batch_id` |
| 5 | Revocación con preservación legal | Endpoint revoke → `status='revoked'` (no se borra registro). Retención 10 años por defecto. GDPR erasure request = anonimiza pero mantiene hash+timestamp |
| 6 | URL pública de verificación | `GET /verify/consent/{hash}` → página con club, jugador (anonimizado o no), fecha, firmante, estado. QR en PDF apunta aquí |
| 7 | Gate mode (soft/hard) | Campo `gate_mode` en `consent_forms`. Middleware `EnsureConsentSigned` verifica al intentar acción sensible (pago, inscripción torneo) si gate=hard |
| 8 | Modo físico (analógico) | `signature_method='physical_scan'` + endpoint `upload-physical` que recibe PDF escaneado + datos firmante. Admin lo registra desde dashboard |
| 9 | Firma obligatoria antes del primer pago | Middleware `CheckConsentBeforePayment` en flow de Stripe/Wompi/dLocal. Si no hay firma → redirect a `ConsentSignPage` antes de iniciar checkout |

## 13. Permisos y roles

Spatie permissions nuevos:

```php
'consent-forms.view'     // Owner, Admin, Accountant
'consent-forms.create'   // Owner, Admin
'consent-forms.edit'     // Owner, Admin
'consent-forms.publish'  // Owner, Admin
'consent-forms.delete'   // Owner
'consent-signatures.view'     // Owner, Admin, Accountant, Trainer (solo de su categoría)
'consent-signatures.revoke'   // Owner, Admin
'consent-signatures.upload-physical' // Owner, Admin
'external-consents.upload'    // Owner, Admin, Tournament Organizer
```

Padre/acudiente: acceso vía token firmado (no requiere permiso Spatie). Puede firmar consentimientos de jugadores donde es `responsible_adult_id`.

Policy: `ConsentFormPolicy`, `ConsentSignaturePolicy`.

## 14. Integración Widdo AI (por regla de módulos nuevos)

### 14.1 Chat IA — Read tools
```
get_consent_status(player_id)         → estado firma del jugador actual
get_pending_consents(club_id, year)   → lista de pendientes
get_consent_signature(signature_id)   → datos de una firma específica
download_consent_pdf(signature_id)    → URL firmada del PDF
count_consents(club_id, filters)      → métricas (firmados, pendientes, revocados)
```

### 14.2 Chat IA — Write tools
```
duplicate_consent_form(source_id, new_year)  → duplicar plantilla para renovación
send_consent_reminders(form_id, only_pending=true)
publish_consent_form(form_id)
revoke_consent_signature(signature_id, reason)
```

### 14.3 Webhook ElevenLabs (agente de voz)
```
POST /api/ai/voice/send-consent-link
Body: { player_id, channel: "sms"|"whatsapp" }
Flujo voz: padre dice "quiero firmar el consentimiento" → agente llama webhook → padre recibe SMS con link
```

## 15. Renovación anual y detección de cambios legales

### 15.1 CRON `App\Console\Commands\AutoRenewConsentTemplates`
- Corre diariamente.
- El 1 de diciembre de cada año: por cada club con plantilla `annual_club` activa del año actual:
  - Crea copia (`duplicate`) con `year_valid = current_year + 1`, `is_active = false` (borrador)
  - Notifica al owner: "Revisa tu consentimiento del próximo año"

### 15.2 CRON `App\Console\Commands\DetectLawChanges`
- Corre semanalmente.
- Por cada `consent_form` activa: si `based_on_config_version < bas_country_consent_configs.template_version` → bandera `needs_review=true` (nueva columna) + notificación al admin del club: "La ley en {país} se actualizó. Revisa tu consentimiento con un abogado local."
- NO re-escribe contenido del club. Sólo avisa.

### 15.3 CRON `App\Console\Commands\ExpireOutdatedConsents`
- El 1 de enero: plantillas `year_valid < current_year` pasan a estado `is_active=false`.
- Firmas asociadas pasan a `status='superseded'`.

## 16. Notificaciones

- **Email**: template Blade nuevo `emails/consent-pending.blade.php` + `emails/consent-signed-confirmation.blade.php`
- **Push**: nuevo tipo en `NotificationType::CONSENT_PENDING`
- **WhatsApp**: si club tiene integración activada (Twilio/Meta), message template "consent_pending_{lang}"
- **In-app banner**: nuevo componente `ConsentPendingBanner.jsx` en dashboard padre y jugador

## 17. Seguridad y compliance

- **Tokens de firma** (links a padres): HMAC firmados con `APP_KEY`, claims `{sig_id, player_id, form_id, exp}`, expiración 30 días. Un solo uso para firma (revocado tras firmar).
- **IP + User-Agent** capturados en cada firma (ley de prueba digital).
- **Hash SHA-256** del contenido firmado + del PDF generado.
- **Retención legal**: 10 años por defecto (configurable por país — CO recomienda 10 años post-terminación).
- **Derecho al olvido (GDPR/LOPD)**: endpoint que anonimiza datos personales del firmante pero preserva hash+timestamp+evidencia técnica.
- **Sanitización HTML**: `HtmlSanitizer::sanitize()` antes de guardar `content`. Lista blanca conservadora (sin `<script>`, `<iframe>`, `<form>`, `on*`).
- **Rate limiting**: endpoint público de firma con throttle 10/min/IP.
- **Verificación pública**: muestra datos mínimos para no exponer PII innecesaria.

## 18. Testing

### 18.1 Tests PHPUnit (Feature)
- `ConsentFormCrudTest` — CRUD admin
- `ConsentFormPublishTest` — publicación dispara notificaciones
- `ConsentSignatureTest` — firma completa + PDF generado + hash válido
- `ConsentMultiChildTest` — padre con N hijos firma una vez
- `ConsentFamilySignTest` — firma padre + menor
- `ConsentRevocationTest` — revoca firma, mantiene evidencia
- `ConsentRenewalTest` — CRON duplica plantillas en dic
- `ConsentGateTest` — hard gate bloquea pago sin firma
- `ExternalConsentUploadTest` — sube PDF, convierte DOCX, hash correcto
- `ExternalConsentSignTest` — firma sobre PDF externo, merge correcto
- `ConsentVariableResolverTest` — reemplazo de variables por país

### 18.2 Tests Playwright (E2E)
- Admin crea plantilla → publica → ve en dashboard
- Padre recibe email → clica link → firma → descarga PDF
- Padre con 3 hijos firma en 1 sesión
- Admin sube PDF externo → padre firma con canvas → PDF final tiene certificado

## 19. Migración de datos legacy (opcional)

Algunos clubes tienen firmas en papel escaneadas. Feature opcional para MVP+1:

```
POST /api/pla_club_teams/{clubId}/consent-signatures/import
Body: zip con PDFs nombrados {player_identifier}_{date}.pdf + mapping.csv
```

Admin sube lote, sistema crea registros con `signature_method='physical_scan'`, `signer_name` extraído del CSV.

Para MVP: sólo endpoint 1-a-1 (`upload-physical`) desde dashboard.

## 20. Plan de implementación (ejecución paralela en 1 día)

Con 4 agentes corriendo en paralelo en worktrees aislados, wall-clock real ~4-5 horas.

### Contratos API (DEFINIDOS ANTES DE LANZAR AGENTES)

Los agentes de backend y frontend trabajan contra estos contratos. Quien toque contrato debe sincronizar.

```
# Flujo A — plantillas (admin)
GET    /api/pla_club_teams/{clubId}/consent-forms
POST   /api/pla_club_teams/{clubId}/consent-forms
GET    /api/pla_club_teams/{clubId}/consent-forms/{id}
PUT    /api/pla_club_teams/{clubId}/consent-forms/{id}
POST   /api/pla_club_teams/{clubId}/consent-forms/{id}/duplicate
POST   /api/pla_club_teams/{clubId}/consent-forms/{id}/publish
DELETE /api/pla_club_teams/{clubId}/consent-forms/{id}
GET    /api/pla_club_teams/{clubId}/consent-forms/{id}/preview-pdf?player_id=X

# Flujo A — firmados (admin)
GET    /api/pla_club_teams/{clubId}/consent-forms/{id}/signatures
POST   /api/pla_club_teams/{clubId}/consent-forms/{id}/send-reminders
POST   /api/pla_club_teams/{clubId}/consent-forms/{id}/signatures/{sigId}/upload-physical
POST   /api/consent-signatures/{id}/revoke

# Flujo A — firma (pública, token HMAC)
GET    /api/public/consents/{token}
POST   /api/public/consents/{token}/sign

# Verificación pública
GET    /api/verify/consent/{hash}

# Flujo B — docs externos
POST   /api/pla_club_teams/{clubId}/external-consents
GET    /api/pla_club_teams/{clubId}/external-consents
POST   /api/tournaments/{tournamentId}/external-consents
GET    /api/tournaments/{tournamentId}/external-consents/{id}/signatures
GET    /api/public/external-consents/{token}
POST   /api/public/external-consents/{token}/sign
POST   /api/external-consent-signatures/{id}/revoke

# Configs países (superadmin)
GET    /api/admin/consent-configs
PUT    /api/admin/consent-configs/{id}
```

### Agentes paralelos

| Agente | Worktree | Scope | Entrega |
|---|---|---|---|
| **#1 Backend Flujo A** | `/tmp/widdo-consent-1-backend-a` | Migrations (consent_forms + signed_consents + extend country_configs), modelos, policies, `ConsentFormService`, `ConsentSignatureService`, `ConsentVariableResolver`, controllers admin+público, Blade PDF, seeders CO+US, tests PHPUnit core | PR a `feature/consent-forms` |
| **#2 Backend Flujo B + infra** | `/tmp/widdo-consent-2-backend-b` | Migrations external_consent_docs+signatures, `ExternalConsentDocService` (upload+DOCX→PDF+FPDI merge), ExternalConsentController, 3 CRONs (auto-renew, detect-law, expire), Notifications (email+push), Widdo AI read/write tools, webhook ElevenLabs, middleware `CheckConsentBeforePayment`, tests | PR a `feature/consent-forms` |
| **#3 Frontend admin** | `/tmp/widdo-consent-3-frontend-admin` | `ConsentTemplatesPage` + `ConsentTemplateEditorPage` (TipTap con variables panel + preview) + `ConsentSignaturesPage`, rutas, menú, `consentFormService.js`, Playwright admin | PR a `feature/consent-forms` |
| **#4 Frontend padre** | `/tmp/widdo-consent-4-frontend-padre` | `ConsentSignPage` + `ExternalConsentSignPage` (PDF.js viewer) + `ConsentMultiChildFlow` + `ConsentFamilySignFlow` + `ConsentPendingBanner`, rutas públicas, Playwright padre | PR a `feature/consent-forms` |

### Precondiciones antes de lanzar agentes

1. Rama `feature/consent-forms` creada en ambos repos (backend + frontend), basada en `main`
2. Contratos API arriba confirmados y congelados (cualquier cambio requiere sincronización manual entre agentes)
3. POC merge PDF pasando (valida que FPDI/Gotenberg funcionan con uploads reales)

### Fase integración (secuencial, post-agentes) — ~1h

1. Merge de worktrees a `feature/consent-forms` en cada repo
2. Resolver conflictos menores (típicamente menú, rutas)
3. Seed DB con `ConsentConfigCOSeeder` + `ConsentConfigUSSeeder`
4. Test manual end-to-end:
   - Admin crea plantilla 2026 (club CO) → publica
   - Padre recibe email → abre link → firma con canvas → descarga PDF
   - Verificar: PDF tiene datos correctos, hash válido, URL `/verify/consent/{hash}` muestra info
   - Admin revoca firma → padre ve estado revocado
   - (Si Flujo B) Admin sube PDF externo → padre firma → verifica merge correcto
5. Commit integración + push PR

### Bloqueadores fuera del código (no paralelos)

1. **Testing real familia** (firma conjunta padre+menor) — 3 familias, 30 min total. No bloquea ship, valida UX.
2. **Revisión legal CO** del template base CO. 2-3h abogado. Bloquea habilitar feature en producción (no dev).
3. **POC merge PDF** con 5 PDFs reales (1 nativo, 1 escaneado, 1 encriptado, 1 corrupto, 1 DOCX). 30 min. Corre al arrancar agente #2.

## 21. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Widdo considerado "firma de abogados" por error | Media | Alto | Disclaimer explícito en UI + ToS. Cláusula: "Widdo no ofrece asesoría legal" |
| Templates base desactualizados por cambio de ley | Alta | Medio | CRON `DetectLawChanges` + revisión trimestral por lado Widdo |
| Merge PDF falla (FPDI incompatible con PDF cifrados) | Baja | Medio | Validar PDF en upload: rechazar encriptados; fallback a Gotenberg merge |
| Padre pierde link (HMAC expirado) | Media | Bajo | Endpoint `resend-link` en dashboard admin |
| Canvas firma mala calidad (móvil viejo) | Baja | Bajo | SignaturePad con `minWidth: 1, maxWidth: 3`; botón re-firmar |
| Clubes con mala conexión generan PDF fallido | Media | Bajo | Queue job para generación PDF + retry 3x; padre recibe email cuando esté listo |
| USA waiver se mezcla con CO consent por error de código | Baja | Alto | Tests explícitos de separación. Policies filtran por `country_code` del club |

## 22. Métricas de éxito

Primer trimestre post-lanzamiento:
- **% clubes activos** con al menos 1 plantilla publicada: 80%+
- **Tasa de firma** (firmados / pendientes): 90%+ tras 2 semanas de recordatorios
- **Tiempo promedio de firma padre** (email → PDF firmado): <5 min
- **% firmas digitales vs físicas**: 95% / 5%
- **Incidentes legales/compliance**: 0 (no somos abogados pero no queremos líos)
- **Clubes que renueven año siguiente**: 90%+

## 23. Fuera de scope (explícito)

- Firma biométrica (huella dactilar / face ID)
- Integración con eIDAS europeo / FirmaDigital.go.co (adv. electronic signature)
- Testigo notarial digital
- Audio/video del padre firmando (evidencia adicional)
- Campos mapeables sobre PDF externo (autocomplete dentro del PDF del organizador) — pospuesto a v2
- OCR de PDFs para extraer campos automáticamente
- Firma masiva admin (ej. "firmar 200 jugadores con mi firma") — contrario a espíritu

## 24. Referencias

- Ley 1581/2012 (CO) + Decreto 1377/2013 — https://www.sic.gov.co
- GDPR Art. 7 — Consent — https://gdpr-info.eu
- LGPD Brasil — Lei 13.709/2018
- LFPDPPP México
- Patrón implementado: módulo de Certificado (`CertificationController`, `CertificationPdfService`, `CertificationTemplatePage.jsx`)
- Gotenberg API — https://gotenberg.dev
- PDF.js viewer — https://mozilla.github.io/pdf.js
- FPDI (PDF merge) — https://www.setasign.com/products/fpdi

---

**Spec listo para writing-plans.** Al aprobar, se genera plan de implementación faseado con subtareas atómicas.
