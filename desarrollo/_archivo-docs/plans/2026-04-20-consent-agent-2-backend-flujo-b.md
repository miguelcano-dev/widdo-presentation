<!-- ARCHIVADO 13-ago-2026 — plan EJECUTADO y en produccion; se archiva para que sus 'checkboxes sin marcar' no se confundan con trabajo pendiente. Verificado contra el codigo. -->

# Agente #2 — Backend Flujo B (PDF del torneo) + Infra transversal

> ## ✅ EJECUTADO — plan cerrado, en producción (archivado 13-ago-2026)
>
> Los 4 planes `2026-04-20-consent-agent-*` se implementaron. Verificado contra el código:
> `DataConsent`, `PlaClubConsentTemplate`, `PlaClubTeamConsentForm`,
> `PlaClubTeamSignedConsent`, `PlaClubTeamExternalConsentDoc` +
> `PlaClubTeamExternalConsentSignature`, `BasCountryConsentConfig`, los seeders
> `ConsentConfigCOSeeder` / `ConsentConfigUSSeeder` / `ConsentPermissionsSeeder` y el
> middleware `check-consent` cableado en `routes/api.php`.
>
> **Los `- [ ]` de abajo NO son pendientes**: son el formato del plan, que nunca se fue
> marcando. No los ejecutes.
>
> Diseño de referencia: `docs/superpowers/specs/2026-04-19-consentimiento-informado-design.md`.
> ⚠️ Conviven **seis** sistemas de consentimiento en el producto; este plan cubre uno.


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Cuenta con tu contexto del spec. Steps checkbox-tracked.

**Goal:** Entregar el backend de (1) Flujo B — subida de PDF/Word por organizador + firma digital del padre sobre PDF externo; (2) CRONs de renovación anual y detección de cambios legales; (3) Notificaciones; (4) Middleware de gate para pagos; (5) Widdo AI tools.

**Architecture:** Upload de PDF/Word → conversión DOCX→PDF vía Gotenberg LibreOffice module → viewer frontend (lo maneja agente #4) → captura firma → generación de "página certificado de firma electrónica" via Gotenberg → merge PDF original + certificado vía FPDI (`setasign/fpdi`).

**Tech Stack:** Laravel 12, Gotenberg 8 (Chromium + LibreOffice modules), `setasign/fpdi` + `setasign/fpdf` para merge, Spatie Permissions, Spatie Notifications.

**Rama:** `feature/consent-forms` en repo `saas_sport`. Worktree `/tmp/widdo-consent-2-backend-b`.

**Spec:** `/Users/miguelcano/Desktop/todo/Widdo/desarrollo/docs/superpowers/specs/2026-04-19-consentimiento-informado-design.md`

**Contratos compartidos con otros agentes:** Ver sección 20 del spec.

**Bloqueador que atiendes primero:** POC merge PDF (30 min) para validar stack antes de codear todo el flujo.

---

## File Structure

**Crear:**

```
database/migrations/
├── 2026_04_20_200001_create_pla_club_teams_external_consent_docs_table.php
└── 2026_04_20_200002_create_pla_club_teams_external_consent_signatures_table.php

app/Models/
├── PlaClubTeamExternalConsentDoc.php
└── PlaClubTeamExternalConsentSignature.php

app/Http/Controllers/
├── ExternalConsentController.php
└── ConsentVoiceWebhookController.php

app/Http/Requests/
├── UploadExternalConsentRequest.php
└── SignExternalConsentRequest.php

app/Services/
├── ExternalConsentDocService.php
├── GotenbergDocxConverter.php
├── PdfMergeService.php                 # wrapper FPDI
└── AI/ConsentAiTools.php               # read/write tools

app/Http/Middleware/
└── CheckConsentBeforePayment.php

app/Console/Commands/
├── AutoRenewConsentTemplates.php
├── DetectConsentLawChanges.php
└── ExpireOutdatedConsents.php

app/Notifications/
├── ConsentPendingNotification.php
└── ConsentSignedConfirmationNotification.php

resources/views/
├── pdf/external-consent-certificate.blade.php
└── emails/
    ├── consent-pending.blade.php
    └── consent-signed-confirmation.blade.php

routes/api.php — bloque de external-consents + voice webhook

tests/Feature/
├── ExternalConsentUploadTest.php
├── ExternalConsentSignTest.php
├── PdfMergeServiceTest.php
├── AutoRenewCommandTest.php
└── CheckConsentBeforePaymentTest.php
```

---

## Task 0: POC merge PDF (hacer ANTES de escribir código real)

**Objetivo:** Validar que FPDI + Gotenberg juntos pueden: (a) convertir DOCX→PDF, (b) mergear PDF A + PDF B en PDF C. Si falla, ajustar aproach.

- [ ] **Step 1: Instalar FPDI**

```bash
docker compose exec saas_sport_app composer require setasign/fpdi setasign/fpdi-fpdf setasign/fpdf
```

Expected: packages added to composer.json, autoload regenerated.

- [ ] **Step 2: POC script merge**

Crear `tests/poc/merge-pdf-poc.php` temporal:

```php
<?php
require __DIR__ . '/../../vendor/autoload.php';

use setasign\Fpdi\Fpdi;

$pdf = new Fpdi();
$file1 = __DIR__ . '/sample1.pdf'; // cualquier PDF
$file2 = __DIR__ . '/sample2.pdf'; // otro PDF

$pageCount1 = $pdf->setSourceFile($file1);
for ($i = 1; $i <= $pageCount1; $i++) {
    $tpl = $pdf->importPage($i);
    $size = $pdf->getTemplateSize($tpl);
    $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
    $pdf->useTemplate($tpl);
}

$pageCount2 = $pdf->setSourceFile($file2);
for ($i = 1; $i <= $pageCount2; $i++) {
    $tpl = $pdf->importPage($i);
    $size = $pdf->getTemplateSize($tpl);
    $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
    $pdf->useTemplate($tpl);
}

$pdf->Output('F', __DIR__ . '/merged.pdf');
echo "Merged OK\n";
```

Poner sample1.pdf y sample2.pdf en el mismo directorio, correr:

```bash
docker compose exec saas_sport_app php tests/poc/merge-pdf-poc.php
```

Expected: "Merged OK" + archivo `merged.pdf` generado, 2+ páginas.

- [ ] **Step 3: POC conversión DOCX→PDF via Gotenberg**

```bash
curl -X POST http://localhost:3011/forms/libreoffice/convert \
  -F "files=@sample.docx" \
  -o converted.pdf && echo "OK" || echo "FAIL"
```

Expected: `converted.pdf` generado. Si falla → gotenberg no tiene libreoffice module habilitado. Verificar `docker-compose.yml`.

- [ ] **Step 4: Si ambos POCs pasan**, borrar directorio temporal y continuar:

```bash
rm -rf tests/poc/
```

Si alguno falla → documentar en el PR y proponer alternativa (e.g., pdf.js-convert en frontend, stock-pdf + image overlay, etc.).

---

## Task 1: Migraciones external consent

**Files:**
- Create: `database/migrations/2026_04_20_200001_create_pla_club_teams_external_consent_docs_table.php`
- Create: `database/migrations/2026_04_20_200002_create_pla_club_teams_external_consent_signatures_table.php`

- [ ] **Step 1: Migración docs**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pla_club_teams_external_consent_docs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('club_id')->nullable()->constrained('pla_club_teams');
            $table->foreignId('tournament_id')->nullable()->constrained('pla_tournaments');
            $table->string('title', 255);
            $table->string('original_filename', 500);
            $table->string('file_path', 500);
            $table->string('file_hash', 64);
            $table->enum('source_format', ['pdf','docx','doc']);
            $table->enum('applies_to', ['all_players','specific_category','specific_tournament'])->default('specific_tournament');
            $table->json('signers_required');
            $table->boolean('is_active')->default(true);
            $table->foreignId('uploaded_by_user_id')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
            $table->index(['club_id', 'tournament_id']);
        });
    }

    public function down(): void { Schema::dropIfExists('pla_club_teams_external_consent_docs'); }
};
```

- [ ] **Step 2: Migración signatures**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pla_club_teams_external_consent_signatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('external_doc_id')->constrained('pla_club_teams_external_consent_docs');
            $table->foreignId('player_id')->nullable()->constrained('pla_club_team_players');
            $table->foreignId('tournament_player_id')->nullable()->constrained('pla_tournament_players');

            $table->foreignId('signer_user_id')->nullable()->constrained('users');
            $table->enum('signer_role', ['parent','guardian','player_adult','player_minor']);
            $table->string('signer_name', 255);
            $table->string('signer_document_type', 20)->nullable();
            $table->string('signer_document_number', 50);
            $table->string('signer_relationship', 50)->nullable();
            $table->string('signer_email', 255)->nullable();
            $table->longText('signature_data');
            $table->longText('cosigner_signature_data')->nullable();
            $table->string('cosigner_name', 255)->nullable();

            $table->timestamp('signed_at');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('document_file_hash', 64);
            $table->string('verification_hash', 64)->unique();
            $table->string('signed_pdf_path', 500);
            $table->enum('status', ['signed','revoked'])->default('signed');
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->index(['external_doc_id', 'player_id']);
        });
    }

    public function down(): void { Schema::dropIfExists('pla_club_teams_external_consent_signatures'); }
};
```

- [ ] **Step 3: Run + commit**

```bash
docker compose exec saas_sport_app php artisan migrate
git add database/migrations/2026_04_20_20*.php
git commit -m "feat(consent): add external consent tables (Flujo B)"
```

---

## Task 2: Modelos Eloquent external consent

- [ ] **Step 1: `PlaClubTeamExternalConsentDoc`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlaClubTeamExternalConsentDoc extends Model
{
    use SoftDeletes;
    protected $table = 'pla_club_teams_external_consent_docs';
    protected $fillable = [
        'club_id','tournament_id','title','original_filename','file_path','file_hash',
        'source_format','applies_to','signers_required','is_active','uploaded_by_user_id',
    ];
    protected $casts = ['signers_required' => 'array', 'is_active' => 'boolean'];

    public function club(): BelongsTo { return $this->belongsTo(PlaClubTeam::class, 'club_id'); }
    public function signatures(): HasMany { return $this->hasMany(PlaClubTeamExternalConsentSignature::class, 'external_doc_id'); }
}
```

- [ ] **Step 2: `PlaClubTeamExternalConsentSignature`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlaClubTeamExternalConsentSignature extends Model
{
    protected $table = 'pla_club_teams_external_consent_signatures';
    protected $fillable = [
        'external_doc_id','player_id','tournament_player_id','signer_user_id',
        'signer_role','signer_name','signer_document_type','signer_document_number',
        'signer_relationship','signer_email','signature_data',
        'cosigner_signature_data','cosigner_name',
        'signed_at','ip_address','user_agent','document_file_hash',
        'verification_hash','signed_pdf_path','status','revoked_at',
    ];
    protected $casts = ['signed_at' => 'datetime', 'revoked_at' => 'datetime'];

    public function doc(): BelongsTo { return $this->belongsTo(PlaClubTeamExternalConsentDoc::class, 'external_doc_id'); }
    public function player(): BelongsTo { return $this->belongsTo(PlaClubTeamPlayer::class, 'player_id'); }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/Models/PlaClubTeamExternalConsent*.php
git commit -m "feat(consent): add external consent models"
```

---

## Task 3: Service `GotenbergDocxConverter`

```php
<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class GotenbergDocxConverter
{
    public function convert(string $localPath): string
    {
        $url = config('services.gotenberg.url') . '/forms/libreoffice/convert';

        $response = Http::attach('files', file_get_contents($localPath), basename($localPath))
            ->timeout(60)
            ->post($url);

        if (!$response->ok()) {
            throw new \RuntimeException('Gotenberg conversion failed: ' . $response->body());
        }

        return $response->body();
    }
}
```

```bash
git add app/Services/GotenbergDocxConverter.php
git commit -m "feat(consent): add DOCX→PDF converter via Gotenberg"
```

---

## Task 4: Service `PdfMergeService`

```php
<?php

namespace App\Services;

use setasign\Fpdi\Fpdi;

class PdfMergeService
{
    public function merge(string $pdfA, string $pdfB): string
    {
        $out = tempnam(sys_get_temp_dir(), 'merged_') . '.pdf';
        $pdf = new Fpdi();

        foreach ([$pdfA, $pdfB] as $file) {
            $count = $pdf->setSourceFile($file);
            for ($i = 1; $i <= $count; $i++) {
                $tpl = $pdf->importPage($i);
                $size = $pdf->getTemplateSize($tpl);
                $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                $pdf->useTemplate($tpl);
            }
        }

        $pdf->Output('F', $out);
        return $out;
    }
}
```

```bash
git add app/Services/PdfMergeService.php
git commit -m "feat(consent): add PDF merge service via FPDI"
```

---

## Task 5: Service `ExternalConsentDocService`

```php
<?php

namespace App\Services;

use App\Models\PlaClubTeamExternalConsentDoc;
use App\Models\PlaClubTeamExternalConsentSignature;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ExternalConsentDocService
{
    public function __construct(
        protected GotenbergDocxConverter $converter,
        protected PdfMergeService $merger,
        protected CertificationPdfService $pdfService,
    ) {}

    public function upload(UploadedFile $file, User $user, array $meta): PlaClubTeamExternalConsentDoc
    {
        $ext = strtolower($file->getClientOriginalExtension());
        $sourceFormat = in_array($ext, ['pdf','docx','doc']) ? $ext : throw new \InvalidArgumentException('Unsupported file format');

        $pdfBytes = match ($sourceFormat) {
            'pdf' => file_get_contents($file->getRealPath()),
            'docx','doc' => $this->converter->convert($file->getRealPath()),
        };

        $hash = hash('sha256', $pdfBytes);
        $path = sprintf('clubs/%s/external-consents/%s.pdf', $meta['club_id'] ?? 'nocl', $hash);
        Storage::disk(config('filesystems.default'))->put($path, $pdfBytes);

        return PlaClubTeamExternalConsentDoc::create([
            'club_id' => $meta['club_id'] ?? null,
            'tournament_id' => $meta['tournament_id'] ?? null,
            'title' => $meta['title'],
            'original_filename' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_hash' => $hash,
            'source_format' => $sourceFormat,
            'applies_to' => $meta['applies_to'] ?? 'specific_tournament',
            'signers_required' => $meta['signers_required'] ?? ['parent'],
            'uploaded_by_user_id' => $user->id,
        ]);
    }

    public function sign(PlaClubTeamExternalConsentDoc $doc, array $signerData, ?int $playerId, ?int $tournamentPlayerId, $request = null): PlaClubTeamExternalConsentSignature
    {
        $verificationHash = (string) Str::uuid();

        // Generar página de certificado
        $certHtml = view('pdf.external-consent-certificate', [
            'doc' => $doc,
            'signer' => $signerData,
            'signedAt' => now(),
            'verificationHash' => $verificationHash,
            'verificationUrl' => config('app.url') . '/verify/consent/' . $verificationHash,
        ])->render();

        $certBytes = $this->pdfService->htmlToPdf($certHtml);

        // Guardar cert temporal
        $certTmp = tempnam(sys_get_temp_dir(), 'cert_') . '.pdf';
        file_put_contents($certTmp, $certBytes);

        // Descargar original + merge
        $originalTmp = tempnam(sys_get_temp_dir(), 'orig_') . '.pdf';
        file_put_contents($originalTmp, Storage::disk(config('filesystems.default'))->get($doc->file_path));

        $mergedPath = $this->merger->merge($originalTmp, $certTmp);
        $finalBytes = file_get_contents($mergedPath);

        $finalStoragePath = sprintf('clubs/%s/external-consents/%s/signed-%s.pdf', $doc->club_id ?? 'nocl', $doc->id, $verificationHash);
        Storage::disk(config('filesystems.default'))->put($finalStoragePath, $finalBytes);

        @unlink($certTmp); @unlink($originalTmp); @unlink($mergedPath);

        return PlaClubTeamExternalConsentSignature::create([
            'external_doc_id' => $doc->id,
            'player_id' => $playerId,
            'tournament_player_id' => $tournamentPlayerId,
            'signer_user_id' => $request?->user()?->id,
            'signer_role' => $signerData['signer_role'],
            'signer_name' => $signerData['signer_name'],
            'signer_document_type' => $signerData['signer_document_type'] ?? null,
            'signer_document_number' => $signerData['signer_document_number'],
            'signer_relationship' => $signerData['signer_relationship'] ?? null,
            'signer_email' => $signerData['signer_email'] ?? null,
            'signature_data' => $signerData['signature_data'],
            'cosigner_signature_data' => $signerData['cosigner_signature_data'] ?? null,
            'cosigner_name' => $signerData['cosigner_name'] ?? null,
            'signed_at' => now(),
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'document_file_hash' => $doc->file_hash,
            'verification_hash' => $verificationHash,
            'signed_pdf_path' => $finalStoragePath,
            'status' => 'signed',
        ]);
    }
}
```

Blade cert (`resources/views/pdf/external-consent-certificate.blade.php`):

```blade
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
body{font-family:'Helvetica',sans-serif;font-size:11pt;color:#222;margin:40px;line-height:1.5}
h1{color:#00C853;border-bottom:2px solid #00C853;padding-bottom:10px}
.row{margin:6px 0}.lbl{font-weight:bold;display:inline-block;min-width:180px}
.sig{max-height:100px;max-width:300px;margin:10px 0;display:block}
.hash{font-family:monospace;word-break:break-all}
.footer{margin-top:40px;font-size:9pt;color:#666;border-top:1px solid #ddd;padding-top:10px}
</style></head><body>
<h1>Certificado de Firma Electrónica</h1>
<p>Este documento certifica que la(s) persona(s) abajo firmante(s) leyó y aceptó el contenido del documento:</p>
<div class="row"><span class="lbl">Documento:</span> {{ $doc->title }}</div>
<div class="row"><span class="lbl">Archivo original:</span> {{ $doc->original_filename }}</div>
<div class="row"><span class="lbl">Hash documento:</span> <span class="hash">{{ $doc->file_hash }}</span></div>
<hr>
<div class="row"><span class="lbl">Firmante:</span> {{ $signer['signer_name'] }}</div>
<div class="row"><span class="lbl">Documento:</span> {{ $signer['signer_document_number'] }}</div>
@if(!empty($signer['signer_relationship']))
<div class="row"><span class="lbl">Parentesco:</span> {{ $signer['signer_relationship'] }}</div>
@endif
<div class="row"><span class="lbl">Email:</span> {{ $signer['signer_email'] ?? '—' }}</div>
<div class="row"><span class="lbl">Fecha de firma:</span> {{ $signedAt->format('d/m/Y H:i') }}</div>
<div class="row"><span class="lbl">Firma:</span></div>
<img class="sig" src="{{ $signer['signature_data'] }}" alt="Firma">
@if(!empty($signer['cosigner_signature_data']))
<hr>
<div class="row"><span class="lbl">Co-firmante:</span> {{ $signer['cosigner_name'] ?? '' }}</div>
<img class="sig" src="{{ $signer['cosigner_signature_data'] }}" alt="Firma co-firmante">
@endif
<div class="footer">
<div class="row"><span class="lbl">ID verificación:</span> <span class="hash">{{ $verificationHash }}</span></div>
<div class="row">Verifique este documento en: <br>{{ $verificationUrl }}</div>
</div>
</body></html>
```

```bash
git add app/Services/ExternalConsentDocService.php resources/views/pdf/external-consent-certificate.blade.php
git commit -m "feat(consent): add external consent upload + sign service with PDF merge"
```

---

## Task 6: Controller + routes Flujo B

**Files:**
- Create: `app/Http/Controllers/ExternalConsentController.php`
- Create: `app/Http/Requests/UploadExternalConsentRequest.php`
- Create: `app/Http/Requests/SignExternalConsentRequest.php`

- [ ] **Step 1: Request classes**

```php
<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class UploadExternalConsentRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,docx,doc|max:10240',
            'applies_to' => 'nullable|in:all_players,specific_category,specific_tournament',
            'signers_required' => 'nullable|array',
        ];
    }
}
```

```php
<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class SignExternalConsentRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'signer_role' => 'required|in:parent,guardian,player_adult,player_minor',
            'signer_name' => 'required|string|max:255',
            'signer_document_type' => 'nullable|string|max:20',
            'signer_document_number' => 'required|string|max:50',
            'signer_relationship' => 'nullable|string|max:50',
            'signer_email' => 'nullable|email',
            'signature_data' => 'required|string|starts_with:data:image/',
            'cosigner_signature_data' => 'nullable|string|starts_with:data:image/',
            'cosigner_name' => 'nullable|string|max:255',
            'accepted_terms' => 'required|accepted',
        ];
    }
}
```

- [ ] **Step 2: Controller**

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadExternalConsentRequest;
use App\Http\Requests\SignExternalConsentRequest;
use App\Models\PlaClubTeamExternalConsentDoc;
use App\Models\PlaClubTeamExternalConsentSignature;
use App\Services\ConsentTokenService;
use App\Services\ExternalConsentDocService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ExternalConsentController extends Controller
{
    public function __construct(
        protected ExternalConsentDocService $service,
        protected ConsentTokenService $tokens,
    ) {}

    public function store(UploadExternalConsentRequest $request, int $clubId)
    {
        $meta = $request->validated() + ['club_id' => $clubId];
        $doc = $this->service->upload($request->file('file'), $request->user(), $meta);
        return response()->json(['data' => $doc], 201);
    }

    public function storeForTournament(UploadExternalConsentRequest $request, int $tournamentId)
    {
        $meta = $request->validated() + ['tournament_id' => $tournamentId];
        $doc = $this->service->upload($request->file('file'), $request->user(), $meta);
        return response()->json(['data' => $doc], 201);
    }

    public function index(int $clubId)
    {
        return response()->json(['data' => PlaClubTeamExternalConsentDoc::where('club_id', $clubId)->get()]);
    }

    public function indexSignatures(int $tournamentId, PlaClubTeamExternalConsentDoc $doc)
    {
        return response()->json(['data' => $doc->signatures()->paginate(50)]);
    }

    public function showByToken(string $token)
    {
        $claims = $this->tokens->validate($token);
        $doc = PlaClubTeamExternalConsentDoc::findOrFail($claims['external_doc_id']);
        $fileUrl = Storage::disk(config('filesystems.default'))->temporaryUrl($doc->file_path, now()->addMinutes(30));

        return response()->json([
            'doc' => ['id' => $doc->id, 'title' => $doc->title, 'signers_required' => $doc->signers_required],
            'file_url' => $fileUrl,
            'file_hash' => $doc->file_hash,
        ]);
    }

    public function signByToken(SignExternalConsentRequest $request, string $token)
    {
        $claims = $this->tokens->validate($token);
        $doc = PlaClubTeamExternalConsentDoc::findOrFail($claims['external_doc_id']);

        $sig = $this->service->sign(
            $doc,
            $request->validated(),
            $claims['player_id'] ?? null,
            $claims['tournament_player_id'] ?? null,
            $request,
        );

        $url = Storage::disk(config('filesystems.default'))->temporaryUrl($sig->signed_pdf_path, now()->addMinutes(15));
        return response()->json(['data' => ['id' => $sig->id, 'verification_hash' => $sig->verification_hash, 'pdf_url' => $url]], 201);
    }

    public function revoke(Request $request, PlaClubTeamExternalConsentSignature $signature)
    {
        $request->validate(['reason' => 'required|string|max:500']);
        $signature->update(['status' => 'revoked', 'revoked_at' => now()]);
        return response()->json(['data' => $signature->fresh()]);
    }
}
```

- [ ] **Step 3: Routes**

```php
// Admin
Route::post('/pla_club_teams/{clubId}/external-consents', [\App\Http\Controllers\ExternalConsentController::class, 'store']);
Route::get('/pla_club_teams/{clubId}/external-consents', [\App\Http\Controllers\ExternalConsentController::class, 'index']);
Route::post('/tournaments/{tournamentId}/external-consents', [\App\Http\Controllers\ExternalConsentController::class, 'storeForTournament']);
Route::get('/tournaments/{tournamentId}/external-consents/{doc}/signatures', [\App\Http\Controllers\ExternalConsentController::class, 'indexSignatures']);
Route::post('/external-consent-signatures/{signature}/revoke', [\App\Http\Controllers\ExternalConsentController::class, 'revoke']);

// Público
Route::get('/public/external-consents/{token}', [\App\Http\Controllers\ExternalConsentController::class, 'showByToken'])->middleware('throttle:30,1');
Route::post('/public/external-consents/{token}/sign', [\App\Http\Controllers\ExternalConsentController::class, 'signByToken'])->middleware('throttle:10,1');
```

- [ ] **Step 4: Commit**

```bash
git add app/Http/Controllers/ExternalConsentController.php app/Http/Requests/*ExternalConsent*.php routes/api.php
git commit -m "feat(consent): add external consent controller + routes (Flujo B)"
```

---

## Task 7: CRONs (3 commands)

- [ ] **Step 1: `AutoRenewConsentTemplates`**

`app/Console/Commands/AutoRenewConsentTemplates.php`:

```php
<?php

namespace App\Console\Commands;

use App\Models\PlaClubTeamConsentForm;
use App\Services\ConsentFormService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class AutoRenewConsentTemplates extends Command
{
    protected $signature = 'consent:auto-renew';
    protected $description = 'On December 1st, duplicate this year\'s annual templates for next year as drafts';

    public function handle(ConsentFormService $service): int
    {
        $now = Carbon::now();
        if ($now->month !== 12 || $now->day !== 1) {
            $this->info("Not Dec 1. Skipping.");
            return self::SUCCESS;
        }

        $currentYear = $now->year;
        $templates = PlaClubTeamConsentForm::withoutGlobalScopes()
            ->where('document_type', 'annual_club')
            ->where('year_valid', $currentYear)
            ->where('is_active', true)
            ->get();

        foreach ($templates as $t) {
            try {
                $copy = $service->duplicate($t, $currentYear + 1);
                $this->info("Duplicated {$t->id} → {$copy->id} for year " . ($currentYear + 1));
            } catch (\Throwable $e) {
                $this->error("Failed for club {$t->club_id}: {$e->getMessage()}");
            }
        }

        return self::SUCCESS;
    }
}
```

- [ ] **Step 2: `DetectConsentLawChanges`**

```php
<?php

namespace App\Console\Commands;

use App\Models\BasCountryConsentConfig;
use App\Models\PlaClubTeamConsentForm;
use Illuminate\Console\Command;

class DetectConsentLawChanges extends Command
{
    protected $signature = 'consent:detect-law-changes';
    protected $description = 'Flag consent forms whose base config has a newer version';

    public function handle(): int
    {
        $flagged = 0;
        $configs = BasCountryConsentConfig::all()->keyBy('id');

        PlaClubTeamConsentForm::withoutGlobalScopes()
            ->whereNotNull('based_on_config_id')
            ->where('is_active', true)
            ->chunkById(200, function ($forms) use ($configs, &$flagged) {
                foreach ($forms as $form) {
                    $cfg = $configs->get($form->based_on_config_id);
                    if ($cfg && version_compare($cfg->template_version, $form->based_on_config_version ?? '0.0.0', '>')) {
                        if (!$form->needs_review) {
                            $form->update(['needs_review' => true, 'flagged_for_review_at' => now()]);
                            $flagged++;
                        }
                    }
                }
            });

        $this->info("Flagged {$flagged} forms.");
        return self::SUCCESS;
    }
}
```

- [ ] **Step 3: `ExpireOutdatedConsents`**

```php
<?php

namespace App\Console\Commands;

use App\Models\PlaClubTeamConsentForm;
use App\Models\PlaClubTeamSignedConsent;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ExpireOutdatedConsents extends Command
{
    protected $signature = 'consent:expire-outdated';
    protected $description = 'On Jan 1st, deactivate last year\'s active annual templates and mark signatures superseded';

    public function handle(): int
    {
        $now = Carbon::now();
        if ($now->month !== 1 || $now->day !== 1) {
            $this->info("Not Jan 1. Skipping.");
            return self::SUCCESS;
        }

        $last = $now->year - 1;
        $forms = PlaClubTeamConsentForm::withoutGlobalScopes()
            ->where('document_type', 'annual_club')
            ->where('year_valid', $last)
            ->where('is_active', true)
            ->get();

        foreach ($forms as $f) {
            $f->update(['is_active' => false]);
            PlaClubTeamSignedConsent::withoutGlobalScopes()
                ->where('consent_form_id', $f->id)
                ->where('status', 'signed')
                ->update(['status' => 'superseded']);
        }

        $this->info("Expired {$forms->count()} templates.");
        return self::SUCCESS;
    }
}
```

- [ ] **Step 4: Schedule en `app/Console/Kernel.php` (o `routes/console.php`)**

```php
$schedule->command('consent:auto-renew')->dailyAt('02:00');
$schedule->command('consent:detect-law-changes')->weeklyOn(1, '03:00');
$schedule->command('consent:expire-outdated')->dailyAt('00:05');
```

- [ ] **Step 5: Commit**

```bash
git add app/Console/Commands/*Consent*.php app/Console/Kernel.php
git commit -m "feat(consent): add 3 scheduled commands for renewal + law changes + expiration"
```

---

## Task 8: Middleware `CheckConsentBeforePayment`

`app/Http/Middleware/CheckConsentBeforePayment.php`:

```php
<?php

namespace App\Http\Middleware;

use App\Models\PlaClubTeamConsentForm;
use App\Models\PlaClubTeamSignedConsent;
use Closure;
use Illuminate\Http\Request;

class CheckConsentBeforePayment
{
    public function handle(Request $request, Closure $next)
    {
        $playerId = $request->input('player_id') ?? $request->route('playerId');
        $clubId = $request->route('clubId');

        if (!$playerId || !$clubId) return $next($request);

        $currentYear = now()->year;
        $form = PlaClubTeamConsentForm::withoutGlobalScopes()
            ->where('club_id', $clubId)
            ->where('document_type', 'annual_club')
            ->where('year_valid', $currentYear)
            ->where('is_active', true)
            ->where('gate_mode', 'hard')
            ->first();

        if (!$form) return $next($request);

        $signed = PlaClubTeamSignedConsent::withoutGlobalScopes()
            ->where('consent_form_id', $form->id)
            ->where('player_id', $playerId)
            ->where('status', 'signed')
            ->exists();

        if (!$signed) {
            return response()->json([
                'error' => 'consent_required',
                'message' => 'Se requiere firmar el Consentimiento Informado antes de procesar pagos.',
                'consent_form_id' => $form->id,
            ], 403);
        }

        return $next($request);
    }
}
```

Registrar en `app/Http/Kernel.php` en `$middlewareAliases`:

```php
'check-consent' => \App\Http\Middleware\CheckConsentBeforePayment::class,
```

Aplicar en rutas de pago (ejemplo):

```php
Route::post('/checkout/subscription', [SubscriptionController::class, 'start'])->middleware('check-consent');
```

```bash
git add app/Http/Middleware/CheckConsentBeforePayment.php app/Http/Kernel.php
git commit -m "feat(consent): add middleware to gate payments by signed consent"
```

---

## Task 9: Notifications (email + push)

`app/Notifications/ConsentPendingNotification.php`:

```php
<?php

namespace App\Notifications;

use App\Models\PlaClubTeamConsentForm;
use App\Models\PlaClubTeamPlayer;
use App\Services\ConsentTokenService;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ConsentPendingNotification extends Notification
{
    use Queueable;

    public function __construct(
        public PlaClubTeamConsentForm $form,
        public PlaClubTeamPlayer $player,
    ) {}

    public function via(object $notifiable): array { return ['mail', 'database']; }

    public function toMail(object $notifiable): MailMessage
    {
        $token = app(ConsentTokenService::class)->generate([
            'form_id' => $this->form->id,
            'player_id' => $this->player->id,
        ], 30);

        $url = config('app.frontend_url') . '/consent/sign/' . $token;

        return (new MailMessage)
            ->subject('Consentimiento ' . $this->form->year_valid . ' pendiente - ' . $this->form->club->name)
            ->view('emails.consent-pending', [
                'form' => $this->form,
                'player' => $this->player,
                'url' => $url,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'consent_pending',
            'form_id' => $this->form->id,
            'player_id' => $this->player->id,
            'year' => $this->form->year_valid,
        ];
    }
}
```

`resources/views/emails/consent-pending.blade.php`:

```blade
@component('mail::message')
# Consentimiento Informado {{ $form->year_valid }}

Hola,

El club **{{ $form->club->name ?? '' }}** requiere que firmes el Consentimiento Informado para **{{ $player->name }} {{ $player->last_name ?? '' }}** antes de continuar.

@component('mail::button', ['url' => $url])
Firmar ahora
@endcomponent

El link expira en 30 días.

Gracias,
Widdo
@endcomponent
```

Disparar desde `ConsentFormController::publish` (modificar):

```php
public function publish(int $clubId, PlaClubTeamConsentForm $consentForm)
{
    $this->authorize('publish', $consentForm);
    $form = $this->service->publish($consentForm);

    // Disparar notificaciones a todos los padres/responsables de jugadores activos
    $players = \App\Models\PlaClubTeamPlayer::where('club_id', $form->club_id)
        ->whereNull('deleted_at')
        ->with('responsibleAdult')
        ->get();
    foreach ($players as $player) {
        $responsible = $player->responsibleAdult ?? null;
        if ($responsible) {
            $responsible->notify(new \App\Notifications\ConsentPendingNotification($form, $player));
        }
    }

    return response()->json(['data' => $form]);
}
```

```bash
git add app/Notifications/*.php resources/views/emails/consent-*.blade.php app/Http/Controllers/ConsentFormController.php
git commit -m "feat(consent): add pending notifications triggered on publish"
```

---

## Task 10: Widdo AI tools

`app/Services/AI/ConsentAiTools.php`:

```php
<?php

namespace App\Services\AI;

use App\Models\PlaClubTeamConsentForm;
use App\Models\PlaClubTeamSignedConsent;
use App\Services\ConsentFormService;
use App\Services\ConsentTokenService;

class ConsentAiTools
{
    public function __construct(
        protected ConsentFormService $forms,
        protected ConsentTokenService $tokens,
    ) {}

    // READ tools

    public function getConsentStatus(int $playerId, ?int $year = null): array
    {
        $year ??= now()->year;
        $sig = PlaClubTeamSignedConsent::withoutGlobalScopes()
            ->whereHas('consentForm', fn ($q) => $q->where('year_valid', $year)->where('document_type', 'annual_club'))
            ->where('player_id', $playerId)
            ->where('status', 'signed')
            ->latest('signed_at')
            ->first();

        return [
            'player_id' => $playerId,
            'year' => $year,
            'signed' => (bool) $sig,
            'signed_at' => $sig?->signed_at?->toIso8601String(),
            'signer_name' => $sig?->signer_name,
        ];
    }

    public function getPendingConsents(int $clubId, ?int $year = null): array
    {
        $year ??= now()->year;
        $form = PlaClubTeamConsentForm::withoutGlobalScopes()
            ->where('club_id', $clubId)
            ->where('document_type', 'annual_club')
            ->where('year_valid', $year)
            ->where('is_active', true)
            ->first();
        if (!$form) return ['pending' => []];

        $allPlayers = \App\Models\PlaClubTeamPlayer::where('club_id', $clubId)->whereNull('deleted_at')->pluck('id');
        $signedPlayers = PlaClubTeamSignedConsent::withoutGlobalScopes()
            ->where('consent_form_id', $form->id)
            ->where('status', 'signed')
            ->pluck('player_id');

        $pending = $allPlayers->diff($signedPlayers)->values();
        return ['form_id' => $form->id, 'pending_count' => $pending->count(), 'pending_player_ids' => $pending->toArray()];
    }

    public function countConsents(int $clubId, array $filters = []): array
    {
        $q = PlaClubTeamSignedConsent::withoutGlobalScopes()->where('club_id', $clubId);
        if (!empty($filters['status'])) $q->where('status', $filters['status']);
        if (!empty($filters['year'])) $q->whereHas('consentForm', fn ($c) => $c->where('year_valid', $filters['year']));
        return ['total' => $q->count()];
    }

    // WRITE tools

    public function duplicateConsentForm(int $sourceFormId, int $newYear): array
    {
        $source = PlaClubTeamConsentForm::withoutGlobalScopes()->findOrFail($sourceFormId);
        $copy = $this->forms->duplicate($source, $newYear);
        return ['new_form_id' => $copy->id, 'year' => $newYear];
    }

    public function sendReminders(int $formId): array
    {
        $form = PlaClubTeamConsentForm::withoutGlobalScopes()->findOrFail($formId);
        $pending = $this->getPendingConsents($form->club_id, $form->year_valid)['pending_player_ids'] ?? [];

        $sent = 0;
        foreach ($pending as $playerId) {
            $player = \App\Models\PlaClubTeamPlayer::find($playerId);
            $resp = $player?->responsibleAdult;
            if ($resp) {
                $resp->notify(new \App\Notifications\ConsentPendingNotification($form, $player));
                $sent++;
            }
        }
        return ['sent' => $sent, 'form_id' => $formId];
    }
}
```

Registrar en tu sistema de tools (sigue el patrón que Widdo ya usa en `ai-agent.md`).

```bash
git add app/Services/AI/ConsentAiTools.php
git commit -m "feat(consent): add Widdo AI read/write tools"
```

---

## Task 11: Webhook voz ElevenLabs

`app/Http/Controllers/ConsentVoiceWebhookController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\PlaClubTeamConsentForm;
use App\Models\PlaClubTeamPlayer;
use App\Services\ConsentTokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ConsentVoiceWebhookController extends Controller
{
    public function sendLink(Request $request, ConsentTokenService $tokens)
    {
        $request->validate([
            'player_id' => 'required|integer',
            'channel' => 'required|in:sms,whatsapp',
        ]);

        $player = PlaClubTeamPlayer::findOrFail($request->input('player_id'));
        $year = now()->year;
        $form = PlaClubTeamConsentForm::withoutGlobalScopes()
            ->where('club_id', $player->club_id)
            ->where('year_valid', $year)
            ->where('is_active', true)
            ->where('document_type', 'annual_club')
            ->firstOrFail();

        $token = $tokens->generate(['form_id' => $form->id, 'player_id' => $player->id], 30);
        $url = config('app.frontend_url') . '/consent/sign/' . $token;

        // TODO: integrar con Twilio / Meta WhatsApp real
        return response()->json(['sent' => true, 'url' => $url, 'channel' => $request->input('channel')]);
    }
}
```

Ruta:

```php
Route::post('/ai/voice/send-consent-link', [\App\Http\Controllers\ConsentVoiceWebhookController::class, 'sendLink'])
    ->middleware('auth:api');
```

```bash
git add app/Http/Controllers/ConsentVoiceWebhookController.php routes/api.php
git commit -m "feat(consent): add ElevenLabs voice webhook for sending sign link"
```

---

## Task 12: Tests Feature principales

`tests/Feature/ExternalConsentSignTest.php` (ejemplo):

```php
<?php

namespace Tests\Feature;

use App\Models\PlaClubTeam;
use App\Models\PlaClubTeamExternalConsentDoc;
use App\Models\User;
use App\Services\ConsentTokenService;
use Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

class ExternalConsentSignTest extends TestCase
{
    use RefreshDatabase;

    public function test_parent_signs_external_pdf_via_token(): void
    {
        Storage::fake();
        $club = PlaClubTeam::factory()->create();
        $admin = User::factory()->create();

        // subir doc via service directo (simulando upload)
        $pdfContent = file_get_contents(base_path('tests/fixtures/sample.pdf')); // fixture PDF simple
        $doc = PlaClubTeamExternalConsentDoc::create([
            'club_id' => $club->id,
            'title' => 'Exoneración Torneo Prueba',
            'original_filename' => 'sample.pdf',
            'file_path' => 'test/sample.pdf',
            'file_hash' => hash('sha256', $pdfContent),
            'source_format' => 'pdf',
            'applies_to' => 'specific_tournament',
            'signers_required' => ['parent'],
            'uploaded_by_user_id' => $admin->id,
        ]);
        Storage::disk(config('filesystems.default'))->put('test/sample.pdf', $pdfContent);

        $token = app(ConsentTokenService::class)->generate(['external_doc_id' => $doc->id], 30);

        $response = $this->postJson("/api/public/external-consents/{$token}/sign", [
            'signer_role' => 'parent',
            'signer_name' => 'Ana',
            'signer_document_number' => '12345',
            'signature_data' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
            'accepted_terms' => true,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseCount('pla_club_teams_external_consent_signatures', 1);
    }
}
```

Asegura que `tests/fixtures/sample.pdf` existe (un PDF mínimo de 1 página). Si no, añadir uno.

```bash
git add tests/Feature/ExternalConsentSignTest.php tests/fixtures/sample.pdf
git commit -m "test(consent): add external consent sign end-to-end"
```

---

## Entrega

```bash
docker compose exec saas_sport_app php artisan test --filter=Consent
git log --oneline -n 30
git push -u origin feature/consent-forms
```

**Integración con otros agentes:**
- Agente #1 define las tablas `consent_forms` y `signed_consents` — depender de ellas para AI tools y middleware.
- Agente #4 consume `/api/public/external-consents/{token}` + `/sign`.
- Frontend admin (agente #3) consume `/api/pla_club_teams/{clubId}/external-consents` para subir docs.

**Métricas de éxito:**
- POC merge PDF + conversión DOCX→PDF funcionan
- Migrations corren limpio
- Test de firma externa end-to-end pasa (archivo fixture incluido)
- 3 CRONs se ejecutan sin error (al menos dry-run)
- Middleware bloquea pagos sin consent cuando gate=hard
