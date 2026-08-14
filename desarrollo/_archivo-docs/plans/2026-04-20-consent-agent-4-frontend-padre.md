<!-- ARCHIVADO 13-ago-2026 — plan EJECUTADO y en produccion; se archiva para que sus 'checkboxes sin marcar' no se confundan con trabajo pendiente. Verificado contra el codigo. -->

# Agente #4 — Frontend Padre/Jugador (Firma de Consentimientos)

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


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Reutiliza `src/components/signature/SignaturePad.jsx` ya existente (canvas + base64).

**Goal:** Entregar las pantallas públicas donde padres/acudientes y jugadores firman consentimientos: Flujo A (anual del club, personalizado) + Flujo B (PDF externo del torneo con PDF.js viewer) + flujos especiales multi-hijo y familia (padre+menor), más el banner pendiente en dashboard.

**Architecture:** React 18 + TanStack Query + React Router + shadcn/ui + react-signature-canvas (o SignaturePad ya existente) + `pdfjs-dist` (PDF.js) para Flujo B. Rutas públicas sin auth (token HMAC).

**Tech Stack:** React, Vite, TanStack Query, axios, shadcn/ui (Radix), `pdfjs-dist`, Playwright.

**Rama:** `feature/consent-forms` en repo `frontend`. Worktree `/tmp/widdo-consent-4-frontend-padre`.

**Spec:** `/Users/miguelcano/Desktop/todo/Widdo/desarrollo/docs/superpowers/specs/2026-04-19-consentimiento-informado-design.md`

**Endpoints consumidos (definidos por agentes #1 y #2):**

```
GET    /api/public/consents/{token}
POST   /api/public/consents/{token}/sign
GET    /api/verify/consent/{hash}

GET    /api/public/external-consents/{token}
POST   /api/public/external-consents/{token}/sign
```

---

## File Structure

```
src/pages/signing/
├── ConsentSignPage.jsx              # Flujo A (texto HTML + canvas)
├── ExternalConsentSignPage.jsx      # Flujo B (PDF viewer + canvas)
├── ConsentSignSuccessPage.jsx       # pantalla de éxito con descarga PDF
└── ConsentVerifyPage.jsx            # verificación pública por hash

src/components/consent/signing/
├── ConsentCanvasSignature.jsx       # wrapper canvas
├── ConsentPdfViewer.jsx             # PDF.js viewer
├── ConsentFormFields.jsx            # nombre, doc, parentesco, email, teléfono
├── ConsentMultiChildFlow.jsx        # tabs con N hijos
├── ConsentFamilySignFlow.jsx        # padre + menor mismo dispositivo
└── ConsentPendingBanner.jsx         # banner en dashboard padre

src/services/
└── publicConsentService.js

src/routes/PublicRoutes.jsx          # nueva sección pública (MODIFICAR)
src/App.jsx                          # registrar rutas públicas (MODIFICAR)

tests/e2e/
├── consent-parent-sign.spec.js
└── consent-external-sign.spec.js
```

---

## Task 1: API service público

```js
// src/services/publicConsentService.js
import axios from 'axios';

const base = import.meta.env.VITE_API_URL;

const publicClient = axios.create({ baseURL: base });

export const publicConsentService = {
  // Flujo A
  getByToken: (token) => publicClient.get(`/api/public/consents/${token}`).then(r => r.data),
  sign: (token, payload) => publicClient.post(`/api/public/consents/${token}/sign`, payload).then(r => r.data.data),
  verify: (hash) => publicClient.get(`/api/verify/consent/${hash}`).then(r => r.data),

  // Flujo B
  externalGetByToken: (token) => publicClient.get(`/api/public/external-consents/${token}`).then(r => r.data),
  externalSign: (token, payload) => publicClient.post(`/api/public/external-consents/${token}/sign`, payload).then(r => r.data.data),
};
```

```bash
git add src/services/publicConsentService.js
git commit -m "feat(consent): add public consent API service"
```

---

## Task 2: `ConsentCanvasSignature` (wrapper)

Reutiliza `SignaturePad` ya existente. Si no tiene API conveniente, crear wrapper:

```jsx
// src/components/consent/signing/ConsentCanvasSignature.jsx
import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ConsentCanvasSignature({ label = 'Firma', onChange, disabled = false }) {
  const ref = useRef(null);
  const [empty, setEmpty] = useState(true);

  const handleEnd = () => {
    if (!ref.current) return;
    const isEmpty = ref.current.isEmpty();
    setEmpty(isEmpty);
    if (!isEmpty && onChange) {
      onChange(ref.current.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    ref.current?.clear();
    setEmpty(true);
    onChange?.('');
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="border rounded-md bg-white">
        <SignatureCanvas
          ref={ref}
          penColor="black"
          canvasProps={{ className: 'w-full h-40 rounded-md touch-none' }}
          onEnd={handleEnd}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{empty ? 'Firma aquí' : 'Firmado ✓'}</span>
        <Button size="sm" variant="ghost" onClick={handleClear} disabled={disabled}>Limpiar</Button>
      </div>
    </div>
  );
}
```

Si `react-signature-canvas` no está instalado:

```bash
npm install react-signature-canvas
```

```bash
git add src/components/consent/signing/ConsentCanvasSignature.jsx package.json package-lock.json
git commit -m "feat(consent): add signature canvas wrapper"
```

---

## Task 3: `ConsentFormFields`

```jsx
// src/components/consent/signing/ConsentFormFields.jsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

const RELATIONSHIPS = ['Padre','Madre','Tutor legal','Abuelo/a','Tío/a','Hermano/a mayor','Otro'];
const DOC_TYPES = [{v:'CC',l:'Cédula de Ciudadanía'},{v:'TI',l:'Tarjeta de Identidad'},{v:'CE',l:'Cédula de Extranjería'},{v:'PPT',l:'Permiso PPT'},{v:'PA',l:'Pasaporte'}];

export default function ConsentFormFields({ value, onChange, isPlayerAdult = false }) {
  const set = (k, v) => onChange({ ...value, [k]: v });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="col-span-2">
        <Label>Nombre completo</Label>
        <Input value={value.signer_name ?? ''} onChange={e => set('signer_name', e.target.value)} />
      </div>
      {!isPlayerAdult && (
        <div>
          <Label>Parentesco</Label>
          <Select value={value.signer_relationship ?? ''} onValueChange={v => set('signer_relationship', v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label>Tipo de documento</Label>
        <Select value={value.signer_document_type ?? 'CC'} onValueChange={v => set('signer_document_type', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {DOC_TYPES.map(d => <SelectItem key={d.v} value={d.v}>{d.l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Número de documento</Label>
        <Input value={value.signer_document_number ?? ''} onChange={e => set('signer_document_number', e.target.value)} />
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" value={value.signer_email ?? ''} onChange={e => set('signer_email', e.target.value)} />
      </div>
      <div>
        <Label>Teléfono</Label>
        <Input type="tel" value={value.signer_phone ?? ''} onChange={e => set('signer_phone', e.target.value)} />
      </div>
    </div>
  );
}
```

```bash
git add src/components/consent/signing/ConsentFormFields.jsx
git commit -m "feat(consent): add shared signer fields form"
```

---

## Task 4: `ConsentSignPage` (Flujo A — principal)

```jsx
// src/pages/signing/ConsentSignPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicConsentService } from '@/services/publicConsentService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import ConsentCanvasSignature from '@/components/consent/signing/ConsentCanvasSignature';
import ConsentFormFields from '@/components/consent/signing/ConsentFormFields';

export default function ConsentSignPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [player, setPlayer] = useState(null);
  const [personalizedContent, setPersonalizedContent] = useState('');

  const [signerData, setSignerData] = useState({
    signer_role: 'parent',
    signer_name: '',
    signer_document_type: 'CC',
    signer_document_number: '',
    signer_relationship: '',
    signer_email: '',
    signer_phone: '',
    signature_data: '',
    cosigner_signature_data: '',
    cosigner_name: '',
    cosigner_document_number: '',
  });
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    publicConsentService.getByToken(token)
      .then(d => {
        setForm(d.form);
        setPlayer(d.player);
        setPersonalizedContent(d.personalized_content);
      })
      .catch(() => toast.error('Link inválido o expirado'))
      .finally(() => setLoading(false));
  }, [token]);

  const needsCosigner = form?.signers_required?.includes('player_minor');

  const canSubmit = accepted && signerData.signature_data && signerData.signer_name && signerData.signer_document_number &&
    (!needsCosigner || (signerData.cosigner_signature_data && signerData.cosigner_name));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const result = await publicConsentService.sign(token, {
        ...signerData,
        accepted_terms: true,
      });
      navigate(`/consent/success?hash=${result.verification_hash}&pdf=${encodeURIComponent(result.pdf_url)}`);
    } catch (e) {
      toast.error(e?.response?.data?.message ?? 'Error al firmar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!form) return <div className="p-6">No se pudo cargar el documento.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
      <Card className="p-6">
        <h1 className="text-xl md:text-2xl font-bold">{form.name}</h1>
        <div className="text-sm text-muted-foreground mt-1">
          Jugador: <strong>{player?.name}</strong>
          {form.year_valid && <> · Año {form.year_valid}</>}
        </div>
      </Card>

      <Card className="p-6 max-h-[60vh] overflow-y-auto prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: personalizedContent }} />
      </Card>

      <Card className="p-6 space-y-4">
        <ConsentFormFields value={signerData} onChange={setSignerData} />

        <ConsentCanvasSignature
          label="Firma del acudiente"
          onChange={(v) => setSignerData(s => ({ ...s, signature_data: v }))}
        />

        {needsCosigner && (
          <div className="border-t pt-4 space-y-3">
            <Label className="font-semibold">Firma del menor ({player?.name})</Label>
            <div>
              <Label>Nombre del menor</Label>
              <input className="w-full border rounded p-2" value={signerData.cosigner_name} onChange={e => setSignerData(s => ({...s, cosigner_name: e.target.value}))} />
            </div>
            <div>
              <Label>Documento del menor</Label>
              <input className="w-full border rounded p-2" value={signerData.cosigner_document_number} onChange={e => setSignerData(s => ({...s, cosigner_document_number: e.target.value}))} />
            </div>
            <ConsentCanvasSignature
              label="Firma del menor"
              onChange={(v) => setSignerData(s => ({ ...s, cosigner_signature_data: v }))}
            />
          </div>
        )}

        <div className="flex items-start gap-2 pt-2">
          <Checkbox id="accept" checked={accepted} onCheckedChange={setAccepted} />
          <Label htmlFor="accept" className="text-sm">He leído y acepto el contenido de este documento</Label>
        </div>

        <Button size="lg" className="w-full" onClick={handleSubmit} disabled={!canSubmit || submitting}>
          {submitting ? 'Firmando...' : 'Firmar y enviar'}
        </Button>
      </Card>
    </div>
  );
}
```

```bash
git add src/pages/signing/ConsentSignPage.jsx
git commit -m "feat(consent): add parent sign page (Flujo A)"
```

---

## Task 5: `ConsentSignSuccessPage`

```jsx
// src/pages/signing/ConsentSignSuccessPage.jsx
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function ConsentSignSuccessPage() {
  const [params] = useSearchParams();
  const hash = params.get('hash');
  const pdfUrl = params.get('pdf');

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-8 text-center space-y-4">
        <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
        <h1 className="text-2xl font-bold">¡Firmado con éxito!</h1>
        <p className="text-muted-foreground">El documento fue firmado y registrado correctamente. Recibirás una copia por email.</p>
        {pdfUrl && (
          <Button asChild>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Descargar PDF firmado</a>
          </Button>
        )}
        {hash && (
          <div className="text-xs text-muted-foreground pt-2">
            ID de verificación: <code>{hash}</code><br />
            <Link to={`/verify/consent/${hash}`} className="underline">Verificar autenticidad</Link>
          </div>
        )}
      </Card>
    </div>
  );
}
```

```bash
git add src/pages/signing/ConsentSignSuccessPage.jsx
git commit -m "feat(consent): add sign success page"
```

---

## Task 6: `ConsentVerifyPage` (pública)

```jsx
// src/pages/signing/ConsentVerifyPage.jsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicConsentService } from '@/services/publicConsentService';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ConsentVerifyPage() {
  const { hash } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify-consent', hash],
    queryFn: () => publicConsentService.verify(hash),
  });

  if (isLoading) return <div className="p-6">Verificando...</div>;
  if (isError) return <div className="p-6">Documento no encontrado o hash inválido.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Verificación de autenticidad</h1>
        <div className="space-y-2">
          <Row label="Club">{data.club}</Row>
          <Row label="Documento">{data.form_name}</Row>
          <Row label="Año de vigencia">{data.year_valid ?? '—'}</Row>
          <Row label="Firmante">{data.signer_name}</Row>
          <Row label="Fecha de firma">{data.signed_at ? new Date(data.signed_at).toLocaleString('es-CO') : '—'}</Row>
          <Row label="Estado">
            {data.status === 'signed' && <Badge className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300">Vigente y firmado</Badge>}
            {data.status === 'revoked' && <Badge variant="destructive">Revocado</Badge>}
            {data.status === 'superseded' && <Badge variant="outline">Superado por nuevo año</Badge>}
          </Row>
          <Row label="Hash del contenido"><code className="text-xs break-all">{data.terms_hash}</code></Row>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="font-medium min-w-[150px]">{label}:</span>
      <span>{children}</span>
    </div>
  );
}
```

```bash
git add src/pages/signing/ConsentVerifyPage.jsx
git commit -m "feat(consent): add public verification page"
```

---

## Task 7: `ExternalConsentSignPage` (Flujo B — PDF viewer)

- [ ] **Step 1: Instalar PDF.js**

```bash
npm install pdfjs-dist
```

- [ ] **Step 2: Componente viewer**

```jsx
// src/components/consent/signing/ConsentPdfViewer.jsx
import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();

export default function ConsentPdfViewer({ url, onReachedEnd }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!url || !containerRef.current) return;
    let cancelled = false;
    const render = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(url).promise;
        if (cancelled) return;
        containerRef.current.innerHTML = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.3 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = 'mx-auto my-2 shadow border bg-white max-w-full h-auto';
          containerRef.current.appendChild(canvas);
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        }
        setLoaded(true);
      } catch (e) {
        setError(e.message);
      }
    };
    render();
    return () => { cancelled = true; };
  }, [url]);

  useEffect(() => {
    const el = containerRef.current?.parentElement;
    if (!el || !onReachedEnd || !loaded) return;
    const handleScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
        onReachedEnd();
      }
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [loaded, onReachedEnd]);

  if (error) return <div className="text-red-600 p-4">Error al cargar PDF: {error}</div>;
  return <div ref={containerRef} className="space-y-2" />;
}
```

- [ ] **Step 3: Pantalla Flujo B**

```jsx
// src/pages/signing/ExternalConsentSignPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicConsentService } from '@/services/publicConsentService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import ConsentPdfViewer from '@/components/consent/signing/ConsentPdfViewer';
import ConsentCanvasSignature from '@/components/consent/signing/ConsentCanvasSignature';
import ConsentFormFields from '@/components/consent/signing/ConsentFormFields';
import { toast } from 'sonner';

export default function ExternalConsentSignPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [reachedEnd, setReachedEnd] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [signerData, setSignerData] = useState({
    signer_role: 'parent',
    signer_name: '',
    signer_document_type: 'CC',
    signer_document_number: '',
    signer_relationship: '',
    signer_email: '',
    signature_data: '',
  });
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    publicConsentService.externalGetByToken(token)
      .then(d => { setDoc(d.doc); setFileUrl(d.file_url); })
      .catch(() => toast.error('Link inválido o expirado'))
      .finally(() => setLoading(false));
  }, [token]);

  const canSubmit = accepted && signerData.signature_data && signerData.signer_name && signerData.signer_document_number;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const r = await publicConsentService.externalSign(token, { ...signerData, accepted_terms: true });
      navigate(`/consent/success?hash=${r.verification_hash}&pdf=${encodeURIComponent(r.pdf_url)}`);
    } catch (e) {
      toast.error('Error al firmar');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!doc) return <div className="p-6">Documento no disponible.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Card className="p-4">
        <h1 className="text-xl font-bold">{doc.title}</h1>
        <p className="text-sm text-muted-foreground">Lee el documento completo y firma al final</p>
      </Card>

      <Card className="p-4 max-h-[70vh] overflow-y-auto">
        <ConsentPdfViewer url={fileUrl} onReachedEnd={() => setReachedEnd(true)} />
      </Card>

      <div className="flex justify-end">
        <Button size="lg" disabled={!reachedEnd} onClick={() => setSignOpen(true)}>
          {reachedEnd ? 'Firmar documento' : 'Lee hasta el final para habilitar firma'}
        </Button>
      </div>

      <Dialog open={signOpen} onOpenChange={setSignOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Firmar {doc.title}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <ConsentFormFields value={signerData} onChange={setSignerData} />
            <ConsentCanvasSignature label="Firma" onChange={v => setSignerData(s => ({...s, signature_data: v}))} />
            <div className="flex items-start gap-2">
              <Checkbox checked={accepted} onCheckedChange={setAccepted} id="acc" />
              <Label htmlFor="acc">He leído y acepto el contenido del documento</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
              {submitting ? 'Enviando...' : 'Firmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

```bash
git add src/pages/signing/ExternalConsentSignPage.jsx src/components/consent/signing/ConsentPdfViewer.jsx package.json package-lock.json
git commit -m "feat(consent): add external PDF sign page with PDF.js viewer"
```

---

## Task 8: `ConsentPendingBanner` (dashboard padre)

```jsx
// src/components/consent/signing/ConsentPendingBanner.jsx
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Este componente es llamado en el dashboard del padre. Recibe una lista de pendings: [{player_name, sign_url}]
export default function ConsentPendingBanner({ pendings = [] }) {
  if (!pendings.length) return null;
  return (
    <div className="rounded-md border-l-4 border-red-600 bg-red-50 dark:bg-red-950/30 p-4 my-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
        <div className="flex-1">
          <div className="font-medium text-red-800 dark:text-red-200">Consentimientos pendientes de firma</div>
          <ul className="mt-2 space-y-1">
            {pendings.map((p, i) => (
              <li key={i} className="text-sm">
                <Link to={p.sign_url} className="text-red-700 dark:text-red-300 underline hover:no-underline">
                  Firmar consentimiento para <strong>{p.player_name}</strong>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

Exportarlo donde se use (dashboard padre). Si tu dashboard padre ya existe, modificarlo:

```jsx
// src/pages/parent/ParentDashboard.jsx — agregar al top
import ConsentPendingBanner from '@/components/consent/signing/ConsentPendingBanner';
// ...
// dentro del render:
<ConsentPendingBanner pendings={pendings} />
```

(El dashboard padre debe cargar `pendings` via una query al endpoint que expone los consent pending del usuario; si aún no existe, dejar mock o crear hook `useConsentPendings(userId)`.)

```bash
git add src/components/consent/signing/ConsentPendingBanner.jsx
git commit -m "feat(consent): add pending consent banner for parent dashboard"
```

---

## Task 9: `ConsentMultiChildFlow` (múltiples hijos)

```jsx
// src/components/consent/signing/ConsentMultiChildFlow.jsx
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import ConsentCanvasSignature from './ConsentCanvasSignature';
import ConsentFormFields from './ConsentFormFields';
import { publicConsentService } from '@/services/publicConsentService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// tokens = [{ token, form, player, personalized_content }, ...]
export default function ConsentMultiChildFlow({ tokens = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [sharedSigner, setSharedSigner] = useState({
    signer_role: 'parent',
    signer_name: '',
    signer_document_type: 'CC',
    signer_document_number: '',
    signer_relationship: '',
    signer_email: '',
    signer_phone: '',
    signature_data: '',
  });
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const canSubmit = accepted && sharedSigner.signature_data && sharedSigner.signer_name && sharedSigner.signer_document_number;

  const handleSubmit = async () => {
    setSubmitting(true);
    const batchId = crypto.randomUUID();
    try {
      for (const t of tokens) {
        await publicConsentService.sign(t.token, { ...sharedSigner, accepted_terms: true, multi_child_batch_id: batchId });
      }
      toast.success(`${tokens.length} consentimientos firmados`);
      navigate('/consent/success?batch=' + batchId);
    } catch {
      toast.error('Error al firmar alguno de los documentos');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <Card className="p-4">
        <h1 className="text-xl font-bold">Firma de consentimientos</h1>
        <p className="text-sm text-muted-foreground">Tienes {tokens.length} consentimientos pendientes. Firma una sola vez y aplica para todos tus hijos.</p>
      </Card>

      <Tabs value={String(activeIdx)} onValueChange={v => setActiveIdx(Number(v))}>
        <TabsList className="w-full flex-wrap">
          {tokens.map((t, i) => <TabsTrigger key={i} value={String(i)}>{t.player.name}</TabsTrigger>)}
        </TabsList>
        {tokens.map((t, i) => (
          <TabsContent key={i} value={String(i)}>
            <Card className="p-4 max-h-[40vh] overflow-y-auto prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: t.personalized_content }} />
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="p-4 space-y-4">
        <Label className="font-semibold">Datos del acudiente (común para todos)</Label>
        <ConsentFormFields value={sharedSigner} onChange={setSharedSigner} />
        <ConsentCanvasSignature label="Firma" onChange={v => setSharedSigner(s => ({...s, signature_data: v}))} />
        <div className="flex items-start gap-2">
          <Checkbox checked={accepted} onCheckedChange={setAccepted} id="accmulti" />
          <Label htmlFor="accmulti" className="text-sm">He leído y acepto el contenido de todos los documentos listados arriba</Label>
        </div>
        <Button className="w-full" size="lg" onClick={handleSubmit} disabled={!canSubmit || submitting}>
          {submitting ? 'Firmando...' : `Firmar todos (${tokens.length})`}
        </Button>
      </Card>
    </div>
  );
}
```

```bash
git add src/components/consent/signing/ConsentMultiChildFlow.jsx
git commit -m "feat(consent): add multi-child sign flow"
```

---

## Task 10: Rutas públicas en App.jsx

- [ ] **Step 1: Agregar rutas en `App.jsx` o `PublicRoutes.jsx`**

```jsx
import ConsentSignPage from '@/pages/signing/ConsentSignPage';
import ExternalConsentSignPage from '@/pages/signing/ExternalConsentSignPage';
import ConsentSignSuccessPage from '@/pages/signing/ConsentSignSuccessPage';
import ConsentVerifyPage from '@/pages/signing/ConsentVerifyPage';

// dentro de <Routes>...
<Route path="/consent/sign/:token" element={<ConsentSignPage />} />
<Route path="/consent/external/:token" element={<ExternalConsentSignPage />} />
<Route path="/consent/success" element={<ConsentSignSuccessPage />} />
<Route path="/verify/consent/:hash" element={<ConsentVerifyPage />} />
```

Asegurarse de que no estén dentro del guard de auth.

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx src/routes/PublicRoutes.jsx
git commit -m "feat(consent): register public sign routes"
```

---

## Task 11: Test Playwright — firma padre

```js
// tests/e2e/consent-parent-sign.spec.js
import { test, expect } from '@playwright/test';

test('Padre abre link con token y firma', async ({ page, request }) => {
  // Generar token via API (seed de jugador + formulario ya deben existir)
  // ...
  const token = 'TOKEN_DEL_TEST'; // seed pre-generado

  await page.goto(`/consent/sign/${token}`);

  await expect(page.locator('h1')).toContainText(/Consentimiento/i);

  // Datos firmante
  await page.fill('input[type="email"]', 'madre@test.co');
  await page.fill('input[placeholder=""]:near(:text("Nombre completo"))', 'María López');
  await page.fill('input:near(:text("Número de documento"))', '79123456');

  // Firma canvas (drag)
  const canvas = page.locator('canvas').first();
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 100, box.y + 60);
  await page.mouse.move(box.x + 200, box.y + 40);
  await page.mouse.up();

  await page.check('input[type="checkbox"]');

  await page.click('button:has-text("Firmar y enviar")');

  await expect(page.locator('text=¡Firmado con éxito!')).toBeVisible({ timeout: 10000 });
});
```

(Este test necesita un seed previo con `user` + `player` + `consent_form` + `token`. Si la suite de tests Laravel ya crea estos, ajustar con un helper. En caso contrario, marcar como `test.skip` y documentar dependencia.)

```bash
git add tests/e2e/consent-parent-sign.spec.js
git commit -m "test(consent): add Playwright E2E for parent sign flow"
```

---

## Entrega

```bash
npm run build
npx playwright test consent-
git log --oneline -n 20
git push -u origin feature/consent-forms
```

**Integración:**
- Consume `/api/public/consents/{token}` y `/api/public/external-consents/{token}` — definidos por agentes #1 y #2.
- NO modifica rutas admin — eso lo hace agente #3.
- Si cambia el shape de response → sincronizar con #1/#2.

**Métricas de éxito:**
- Flujo A: padre abre link → ve texto personalizado → firma → descarga PDF
- Flujo B: padre abre PDF → scroll al final → firma canvas → recibe PDF merged
- `ConsentPendingBanner` se muestra correctamente en dashboard padre
- Multi-child flow firma N consentimientos con una sola firma y mismo batch_id
- Verify page muestra info del PDF firmado
- Build Vite sin errores
