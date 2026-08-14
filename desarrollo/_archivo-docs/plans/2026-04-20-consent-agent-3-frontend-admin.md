<!-- ARCHIVADO 13-ago-2026 — plan EJECUTADO y en produccion; se archiva para que sus 'checkboxes sin marcar' no se confundan con trabajo pendiente. Verificado contra el codigo. -->

# Agente #3 — Frontend Admin (Consentimientos Club)

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


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Follow patterns from `src/pages/admin/CertificationTemplatePage.jsx` and `src/pages/admin/CertificationTemplateConfigPage.jsx`. Reutiliza TipTap editor config ya configurado para certificados.

**Goal:** Entregar las 3 pantallas del admin del club para gestionar consentimientos informados: listado, editor con TipTap + variables + preview, y dashboard de firmados.

**Architecture:** React 18 + Vite + TanStack Query + React Router + shadcn/ui + TipTap v2. Sigue patrón exacto del módulo Certificado pero con soporte para N plantillas por club.

**Tech Stack:** React, Vite, TanStack Query, axios, shadcn/ui (Radix), TipTap, Playwright.

**Rama:** `feature/consent-forms` en repo `frontend`. Worktree `/tmp/widdo-consent-3-frontend-admin`.

**Spec:** `/Users/miguelcano/Desktop/todo/Widdo/desarrollo/docs/superpowers/specs/2026-04-19-consentimiento-informado-design.md`

**Endpoints consumidos (ya definidos por agente #1):**

```
GET    /api/pla_club_teams/{clubId}/consent-forms
POST   /api/pla_club_teams/{clubId}/consent-forms
GET    /api/pla_club_teams/{clubId}/consent-forms/{id}
PUT    /api/pla_club_teams/{clubId}/consent-forms/{id}
POST   /api/pla_club_teams/{clubId}/consent-forms/{id}/duplicate
POST   /api/pla_club_teams/{clubId}/consent-forms/{id}/publish
DELETE /api/pla_club_teams/{clubId}/consent-forms/{id}
GET    /api/pla_club_teams/{clubId}/consent-forms/{id}/preview-pdf?player_id=X
GET    /api/pla_club_teams/{clubId}/consent-forms/{id}/signatures
POST   /api/pla_club_teams/{clubId}/consent-forms/{id}/signatures/{sigId}/upload-physical
POST   /api/consent-signatures/{id}/revoke

GET    /api/pla_club_teams/{clubId}/external-consents
POST   /api/pla_club_teams/{clubId}/external-consents   # multipart/form-data
GET    /api/tournaments/{tournamentId}/external-consents/{id}/signatures
```

---

## File Structure

```
src/pages/admin/consents/
├── ConsentTemplatesPage.jsx
├── ConsentTemplateEditorPage.jsx
├── ConsentSignaturesPage.jsx
└── ExternalConsentUploadDialog.jsx

src/components/consent/admin/
├── ConsentFormsTable.jsx
├── ConsentFormCreateDialog.jsx
├── ConsentVariablesPanel.jsx
├── ConsentPreviewIframe.jsx
├── ConsentSignersSelector.jsx
└── ConsentUploadPhysicalDialog.jsx

src/services/
└── consentFormService.js

src/hooks/
└── useConsentForms.js

src/i18n/locales/{es,en}/consent.json    # strings

src/routes/AdminRoutes.jsx               # agregar rutas (MODIFICAR)
src/components/layout/MenuList.jsx       # añadir ítem de menú (MODIFICAR)

tests/e2e/
└── consent-admin.spec.js                # Playwright
```

---

## Task 1: API service (`consentFormService.js`)

```js
// src/services/consentFormService.js
import axiosInstance from './axiosInstance';

const base = (clubId) => `/api/pla_club_teams/${clubId}/consent-forms`;

export const consentFormService = {
  list: (clubId) => axiosInstance.get(base(clubId)).then(r => r.data.data),
  get: (clubId, id) => axiosInstance.get(`${base(clubId)}/${id}`).then(r => r.data.data),
  create: (clubId, payload) => axiosInstance.post(base(clubId), payload).then(r => r.data.data),
  update: (clubId, id, payload) => axiosInstance.put(`${base(clubId)}/${id}`, payload).then(r => r.data.data),
  duplicate: (clubId, id, { year_valid } = {}) =>
    axiosInstance.post(`${base(clubId)}/${id}/duplicate`, { year_valid }).then(r => r.data.data),
  publish: (clubId, id) => axiosInstance.post(`${base(clubId)}/${id}/publish`).then(r => r.data.data),
  destroy: (clubId, id) => axiosInstance.delete(`${base(clubId)}/${id}`),
  previewPdf: (clubId, id, playerId) =>
    axiosInstance.get(`${base(clubId)}/${id}/preview-pdf`, {
      params: { player_id: playerId },
      responseType: 'blob',
    }).then(r => r.data),
  signatures: (clubId, id, { page = 1 } = {}) =>
    axiosInstance.get(`${base(clubId)}/${id}/signatures`, { params: { page } }).then(r => r.data),
  revokeSignature: (signatureId, reason) =>
    axiosInstance.post(`/api/consent-signatures/${signatureId}/revoke`, { reason }),
  uploadPhysical: (clubId, formId, playerId, formData) =>
    axiosInstance.post(`${base(clubId)}/${formId}/signatures/${playerId}/upload-physical`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

const externalBase = (clubId) => `/api/pla_club_teams/${clubId}/external-consents`;

export const externalConsentService = {
  list: (clubId) => axiosInstance.get(externalBase(clubId)).then(r => r.data.data),
  upload: (clubId, formData) =>
    axiosInstance.post(externalBase(clubId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data),
  uploadForTournament: (tournamentId, formData) =>
    axiosInstance.post(`/api/tournaments/${tournamentId}/external-consents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data),
};
```

```bash
git add src/services/consentFormService.js
git commit -m "feat(consent): add consent form API service"
```

---

## Task 2: Hook `useConsentForms`

```js
// src/hooks/useConsentForms.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consentFormService } from '@/services/consentFormService';
import { toast } from 'sonner';

export function useConsentForms(clubId) {
  return useQuery({
    queryKey: ['consent-forms', clubId],
    queryFn: () => consentFormService.list(clubId),
    enabled: !!clubId,
  });
}

export function useConsentForm(clubId, id) {
  return useQuery({
    queryKey: ['consent-forms', clubId, id],
    queryFn: () => consentFormService.get(clubId, id),
    enabled: !!clubId && !!id,
  });
}

export function useCreateConsentForm(clubId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => consentFormService.create(clubId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consent-forms', clubId] });
      toast.success('Plantilla creada');
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Error al crear'),
  });
}

export function useUpdateConsentForm(clubId, id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => consentFormService.update(clubId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consent-forms', clubId] });
      qc.invalidateQueries({ queryKey: ['consent-forms', clubId, id] });
      toast.success('Guardado');
    },
  });
}

export function usePublishConsentForm(clubId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => consentFormService.publish(clubId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consent-forms', clubId] });
      toast.success('Publicado. Notificaciones enviadas a padres.');
    },
  });
}

export function useDuplicateConsentForm(clubId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, year_valid }) => consentFormService.duplicate(clubId, id, { year_valid }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['consent-forms', clubId] });
      toast.success('Plantilla duplicada');
    },
  });
}
```

```bash
git add src/hooks/useConsentForms.js
git commit -m "feat(consent): add TanStack Query hooks for consent forms"
```

---

## Task 3: `ConsentTemplatesPage` — listado

```jsx
// src/pages/admin/consents/ConsentTemplatesPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useConsentForms, useDuplicateConsentForm, usePublishConsentForm } from '@/hooks/useConsentForms';
import { consentFormService } from '@/services/consentFormService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { MoreVertical, Plus, AlertTriangle } from 'lucide-react';
import ConsentFormCreateDialog from '@/components/consent/admin/ConsentFormCreateDialog';
import ExternalConsentUploadDialog from '@/pages/admin/consents/ExternalConsentUploadDialog';
import { toast } from 'sonner';

export default function ConsentTemplatesPage() {
  const { user, currentClub } = useAuth();
  const clubId = currentClub?.id;
  const { data: forms = [], isLoading } = useConsentForms(clubId);
  const duplicate = useDuplicateConsentForm(clubId);
  const publish = usePublishConsentForm(clubId);
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [externalOpen, setExternalOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const hasActiveCurrentYear = forms.some(
    f => f.document_type === 'annual_club' && f.year_valid === currentYear && f.is_active
  );

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta plantilla?')) return;
    try {
      await consentFormService.destroy(clubId, id);
      toast.success('Eliminada');
      window.location.reload();
    } catch (e) {
      toast.error('No se pudo eliminar');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Consentimientos</h1>
          <p className="text-muted-foreground text-sm">Plantillas del club firmables por padres/acudientes o jugadores</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setExternalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />Doc externo (torneo)
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />Nueva plantilla
          </Button>
        </div>
      </div>

      {!hasActiveCurrentYear && !isLoading && (
        <Card className="p-4 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <div className="text-sm">
            <div className="font-medium text-red-700 dark:text-red-300">Sin consentimiento activo para {currentYear}</div>
            <div className="text-red-600 dark:text-red-400">Crea o duplica una plantilla y publícala.</div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div>Cargando...</div>
      ) : (
        <Card>
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="p-3">Nombre</th>
                <th className="p-3">Año</th>
                <th className="p-3">Idioma</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Firmados</th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {forms.map(f => (
                <tr key={f.id} className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium">{f.name}</td>
                  <td className="p-3">{f.year_valid ?? '—'}</td>
                  <td className="p-3"><Badge variant="outline">{f.language}</Badge></td>
                  <td className="p-3">
                    {f.is_active
                      ? <Badge className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300">Activo</Badge>
                      : <Badge variant="outline">Borrador</Badge>}
                    {f.needs_review && <Badge className="ml-2" variant="destructive">Revisar</Badge>}
                  </td>
                  <td className="p-3 text-sm">{f.signed_count ?? 0}</td>
                  <td className="p-3">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/home/admin/consents/${f.id}/edit`)}>Editar</DropdownMenuItem>
                        {!f.is_active && (
                          <DropdownMenuItem onClick={() => publish.mutate(f.id)}>Publicar</DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => navigate(`/home/admin/consents/${f.id}/signatures`)}>Ver firmados</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          const year = parseInt(prompt('¿Para qué año duplicar?', String(currentYear + 1)), 10);
                          if (year) duplicate.mutate({ id: f.id, year_valid: year });
                        }}>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(f.id)} className="text-red-600">Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {forms.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Aún no hay plantillas. Crea la primera.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      <ConsentFormCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} clubId={clubId} />
      <ExternalConsentUploadDialog open={externalOpen} onClose={() => setExternalOpen(false)} clubId={clubId} />
    </div>
  );
}
```

```bash
git add src/pages/admin/consents/ConsentTemplatesPage.jsx
git commit -m "feat(consent): add templates listing page"
```

---

## Task 4: `ConsentFormCreateDialog`

```jsx
// src/components/consent/admin/ConsentFormCreateDialog.jsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCreateConsentForm, useConsentForms } from '@/hooks/useConsentForms';
import { useNavigate } from 'react-router-dom';

const MODES = [
  { id: 'blank', label: 'Empezar desde cero', desc: 'Plantilla vacía' },
  { id: 'base', label: 'Desde template base del país', desc: 'Carga cláusulas legales sugeridas' },
  { id: 'duplicate', label: 'Duplicar existente', desc: 'Copia una plantilla previa' },
];

export default function ConsentFormCreateDialog({ open, onClose, clubId }) {
  const [mode, setMode] = useState('base');
  const [name, setName] = useState(`Consentimiento Informado ${new Date().getFullYear()}`);
  const [yearValid, setYearValid] = useState(new Date().getFullYear());
  const { data: existingForms = [] } = useConsentForms(clubId);
  const [sourceId, setSourceId] = useState(null);
  const create = useCreateConsentForm(clubId);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const payload = {
      name,
      document_type: 'annual_club',
      year_valid: yearValid,
      language: 'es',
      content: mode === 'base' ? '<!-- se reemplaza con base del país en backend si based_on_config_id -->' : '<p>Edita este texto...</p>',
      signers_required: ['parent'],
      gate_mode: 'soft',
    };
    const form = await create.mutateAsync(payload);
    onClose();
    navigate(`/home/admin/consents/${form.id}/edit`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva plantilla de consentimiento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nombre</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label>Año de vigencia</Label>
            <Input type="number" value={yearValid} onChange={e => setYearValid(Number(e.target.value))} />
          </div>
          <RadioGroup value={mode} onValueChange={setMode}>
            {MODES.map(m => (
              <div key={m.id} className="flex items-start gap-3 p-2 rounded hover:bg-muted">
                <RadioGroupItem value={m.id} id={m.id} />
                <div>
                  <Label htmlFor={m.id} className="font-medium">{m.label}</Label>
                  <div className="text-sm text-muted-foreground">{m.desc}</div>
                </div>
              </div>
            ))}
          </RadioGroup>
          {mode === 'duplicate' && (
            <div>
              <Label>Plantilla a duplicar</Label>
              <select className="w-full border rounded p-2" onChange={e => setSourceId(e.target.value)}>
                <option value="">Seleccionar...</option>
                {existingForms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={create.isPending}>Crear</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

```bash
git add src/components/consent/admin/ConsentFormCreateDialog.jsx
git commit -m "feat(consent): add create dialog with 3 modes"
```

---

## Task 5: `ConsentTemplateEditorPage` (TipTap + variables + preview)

```jsx
// src/pages/admin/consents/ConsentTemplateEditorPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useConsentForm, useUpdateConsentForm, usePublishConsentForm } from '@/hooks/useConsentForms';
import { consentFormService } from '@/services/consentFormService';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import ConsentVariablesPanel from '@/components/consent/admin/ConsentVariablesPanel';
import ConsentSignersSelector from '@/components/consent/admin/ConsentSignersSelector';
import { toast } from 'sonner';

export default function ConsentTemplateEditorPage() {
  const { id } = useParams();
  const { currentClub } = useAuth();
  const clubId = currentClub?.id;
  const { data: form, isLoading } = useConsentForm(clubId, id);
  const update = useUpdateConsentForm(clubId, id);
  const publish = usePublishConsentForm(clubId);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [yearValid, setYearValid] = useState(new Date().getFullYear());
  const [signersRequired, setSignersRequired] = useState(['parent']);
  const [gateMode, setGateMode] = useState('soft');
  const [previewPlayer, setPreviewPlayer] = useState(null);
  const [previewSrc, setPreviewSrc] = useState('');

  const editor = useEditor({
    extensions: [StarterKit, Heading.configure({ levels: [2, 3] })],
    content: '',
  });

  useEffect(() => {
    if (form && editor) {
      editor.commands.setContent(form.content ?? '');
      setName(form.name ?? '');
      setYearValid(form.year_valid ?? new Date().getFullYear());
      setSignersRequired(form.signers_required ?? ['parent']);
      setGateMode(form.gate_mode ?? 'soft');
    }
  }, [form, editor]);

  const insertVariable = (v) => editor?.commands.insertContent(v);

  const handleSave = async () => {
    await update.mutateAsync({
      name, year_valid: yearValid,
      signers_required: signersRequired, gate_mode: gateMode,
      content: editor?.getHTML() ?? '',
    });
  };

  const handlePreview = async () => {
    if (!previewPlayer) { toast.error('Selecciona un jugador de ejemplo'); return; }
    const blob = await consentFormService.previewPdf(clubId, id, previewPlayer);
    const url = URL.createObjectURL(blob);
    setPreviewSrc(url);
  };

  const handlePublish = async () => {
    if (!confirm('¿Publicar? Se enviarán notificaciones a todos los padres.')) return;
    await handleSave();
    await publish.mutateAsync(id);
    navigate('/home/admin/consents');
  };

  if (isLoading || !editor) return <div className="p-6">Cargando...</div>;

  return (
    <div className="p-6 grid grid-cols-12 gap-4 h-[calc(100vh-60px)]">
      <div className="col-span-3 space-y-4 overflow-y-auto">
        <Card className="p-4 space-y-3">
          <div>
            <Label>Nombre</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label>Año de vigencia</Label>
            <Input type="number" value={yearValid} onChange={e => setYearValid(Number(e.target.value))} />
          </div>
          <ConsentSignersSelector value={signersRequired} onChange={setSignersRequired} />
          <div className="flex items-center gap-2 pt-2">
            <Switch checked={gateMode === 'hard'} onCheckedChange={v => setGateMode(v ? 'hard' : 'soft')} />
            <Label>Bloquear pagos si no firma (hard gate)</Label>
          </div>
        </Card>

        <ConsentVariablesPanel onInsert={insertVariable} />
      </div>

      <div className="col-span-6 flex flex-col">
        <div className="flex gap-2 mb-2">
          <Button size="sm" variant="outline" onClick={() => editor.chain().focus().toggleBold().run()}>B</Button>
          <Button size="sm" variant="outline" onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></Button>
          <Button size="sm" variant="outline" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
          <Button size="sm" variant="outline" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Button>
          <Button size="sm" variant="outline" onClick={() => editor.chain().focus().toggleBulletList().run()}>•</Button>
        </div>
        <Card className="flex-1 overflow-y-auto p-4 prose max-w-none">
          <EditorContent editor={editor} />
        </Card>
        <div className="flex gap-2 mt-2">
          <Button onClick={handleSave} disabled={update.isPending}>Guardar borrador</Button>
          <Button variant="outline" onClick={handlePublish}>Publicar</Button>
        </div>
      </div>

      <div className="col-span-3 overflow-y-auto">
        <Card className="p-4 space-y-3">
          <Label>Preview (selecciona jugador de ejemplo)</Label>
          <Input placeholder="ID jugador" value={previewPlayer ?? ''} onChange={e => setPreviewPlayer(e.target.value)} />
          <Button size="sm" onClick={handlePreview}>Generar preview</Button>
          {previewSrc && <iframe src={previewSrc} className="w-full h-[500px]" />}
        </Card>
      </div>
    </div>
  );
}
```

`ConsentVariablesPanel.jsx`:

```jsx
// src/components/consent/admin/ConsentVariablesPanel.jsx
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GROUPS = [
  { title: 'Jugador', vars: ['[NOMBRE_MENOR]','[DOCUMENTO_MENOR]','[TIPO_DOC_MENOR]','[FECHA_NACIMIENTO_MENOR]','[EDAD_MENOR]','[CATEGORIA]'] },
  { title: 'Acudiente', vars: ['[NOMBRE_ACUDIENTE]','[DOCUMENTO_ACUDIENTE]','[PARENTESCO]','[EMAIL_ACUDIENTE]','[TELEFONO_ACUDIENTE]'] },
  { title: 'Club', vars: ['[NOMBRE_CLUB]','[NIT_CLUB]','[DEPORTE]','[CIUDAD_CLUB]'] },
  { title: 'Fechas y ley', vars: ['[FECHA_HOY]','[AÑO_VIGENCIA]','[LEY_REFERENCIA]','[AUTORIDAD_DATOS]','[EDAD_MAYORIA]'] },
];

export default function ConsentVariablesPanel({ onInsert }) {
  return (
    <Card className="p-4 space-y-3">
      <div className="font-semibold text-sm">Variables disponibles</div>
      <p className="text-xs text-muted-foreground">Click para insertar en el editor</p>
      {GROUPS.map(g => (
        <div key={g.title} className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">{g.title}</div>
          <div className="flex flex-wrap gap-1">
            {g.vars.map(v => (
              <Button key={v} size="sm" variant="outline" className="text-xs h-7" onClick={() => onInsert(v)}>
                {v}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
}
```

`ConsentSignersSelector.jsx`:

```jsx
// src/components/consent/admin/ConsentSignersSelector.jsx
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const OPTIONS = [
  { id: 'parent', label: 'Padre/Madre/Acudiente' },
  { id: 'player_adult', label: 'Jugador si es mayor de edad' },
  { id: 'player_minor', label: 'Jugador menor (co-firma junto al acudiente)' },
];

export default function ConsentSignersSelector({ value = [], onChange }) {
  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter(v => v !== id));
    else onChange([...value, id]);
  };

  return (
    <div className="space-y-2">
      <Label>Quién debe firmar</Label>
      {OPTIONS.map(o => (
        <div key={o.id} className="flex items-center gap-2">
          <Checkbox id={o.id} checked={value.includes(o.id)} onCheckedChange={() => toggle(o.id)} />
          <Label htmlFor={o.id} className="text-sm font-normal">{o.label}</Label>
        </div>
      ))}
    </div>
  );
}
```

```bash
git add src/pages/admin/consents/ConsentTemplateEditorPage.jsx src/components/consent/admin/*.jsx
git commit -m "feat(consent): add TipTap editor + variables panel + preview"
```

---

## Task 6: `ConsentSignaturesPage` (dashboard firmados)

```jsx
// src/pages/admin/consents/ConsentSignaturesPage.jsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { consentFormService } from '@/services/consentFormService';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ConsentUploadPhysicalDialog from '@/components/consent/admin/ConsentUploadPhysicalDialog';

export default function ConsentSignaturesPage() {
  const { id } = useParams();
  const { currentClub } = useAuth();
  const clubId = currentClub?.id;
  const [page, setPage] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadPlayer, setUploadPlayer] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['consent-signatures', clubId, id, page],
    queryFn: () => consentFormService.signatures(clubId, id, { page }),
    enabled: !!clubId && !!id,
  });

  const rows = data?.data ?? [];
  const stats = { total: rows.length };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Firmas del consentimiento</h1>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-sm text-muted-foreground">Total firmados</div><div className="text-2xl font-bold">{stats.total}</div></Card>
        {/* TODO agregar stats adicionales cuando backend las exponga */}
      </div>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-muted-foreground">
              <th className="p-3">Jugador</th>
              <th className="p-3">Firmante</th>
              <th className="p-3">Parentesco</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={6} className="p-6">Cargando...</td></tr> : rows.map(r => (
              <tr key={r.id} className="border-b hover:bg-muted/30">
                <td className="p-3">{r.player?.name}</td>
                <td className="p-3">{r.signer_name}</td>
                <td className="p-3 text-sm">{r.signer_relationship ?? '—'}</td>
                <td className="p-3 text-sm">{r.signed_at ? new Date(r.signed_at).toLocaleString('es-CO') : '—'}</td>
                <td className="p-3">
                  {r.status === 'signed' && <Badge className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300">Firmado</Badge>}
                  {r.status === 'revoked' && <Badge variant="destructive">Revocado</Badge>}
                  {r.status === 'superseded' && <Badge variant="outline">Superado</Badge>}
                </td>
                <td className="p-3">
                  <Button size="sm" variant="outline" onClick={() => window.open(`/api/consent-signatures/${r.id}/pdf`, '_blank')}>PDF</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => setUploadOpen(true)} variant="outline">Cargar firma física</Button>
      </div>

      <ConsentUploadPhysicalDialog open={uploadOpen} onClose={() => setUploadOpen(false)} clubId={clubId} formId={id} />
    </div>
  );
}
```

```bash
git add src/pages/admin/consents/ConsentSignaturesPage.jsx src/components/consent/admin/ConsentUploadPhysicalDialog.jsx
git commit -m "feat(consent): add signatures dashboard + upload physical"
```

---

## Task 7: `ExternalConsentUploadDialog`

```jsx
// src/pages/admin/consents/ExternalConsentUploadDialog.jsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { externalConsentService } from '@/services/consentFormService';
import { toast } from 'sonner';

export default function ExternalConsentUploadDialog({ open, onClose, clubId }) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !title) return;
    const fd = new FormData();
    fd.append('title', title);
    fd.append('file', file);
    setUploading(true);
    try {
      await externalConsentService.upload(clubId, fd);
      toast.success('Documento subido');
      onClose();
    } catch (e) {
      toast.error('Error al subir');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cargar consentimiento externo (PDF o Word)</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Título</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Exoneración Torneo X 2026" />
          </div>
          <div>
            <Label>Archivo</Label>
            <Input type="file" accept=".pdf,.docx,.doc" onChange={e => setFile(e.target.files?.[0])} />
            <p className="text-xs text-muted-foreground mt-1">Se acepta PDF o Word. Los Word se convertirán a PDF automáticamente.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleUpload} disabled={uploading || !file || !title}>{uploading ? 'Subiendo...' : 'Subir'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

```bash
git add src/pages/admin/consents/ExternalConsentUploadDialog.jsx
git commit -m "feat(consent): add external consent upload dialog"
```

---

## Task 8: Rutas + menú

- [ ] **Step 1: Agregar rutas en `AdminRoutes.jsx`**

```jsx
import ConsentTemplatesPage from '@/pages/admin/consents/ConsentTemplatesPage';
import ConsentTemplateEditorPage from '@/pages/admin/consents/ConsentTemplateEditorPage';
import ConsentSignaturesPage from '@/pages/admin/consents/ConsentSignaturesPage';

// dentro de <Routes>...
<Route path="consents" element={<ConsentTemplatesPage />} />
<Route path="consents/:id/edit" element={<ConsentTemplateEditorPage />} />
<Route path="consents/:id/signatures" element={<ConsentSignaturesPage />} />
```

- [ ] **Step 2: Item de menú en `MenuList.jsx`**

```jsx
{ label: 'Consentimientos', icon: FileSignature, path: '/home/admin/consents', permission: 'consent-forms.view' }
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/AdminRoutes.jsx src/components/layout/MenuList.jsx
git commit -m "feat(consent): add admin routes + menu entry"
```

---

## Task 9: Test Playwright admin

```js
// tests/e2e/consent-admin.spec.js
import { test, expect } from '@playwright/test';

test.describe('Consent admin flow', () => {
  test('owner crea plantilla y la publica', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'director@bogotafc.co');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.waitForURL(/home/);
    await page.goto('/home/admin/consents');

    await page.click('button:has-text("Nueva plantilla")');
    await page.fill('input[value*="Consentimiento"]', 'Consentimiento Informado 2026 Test');
    await page.click('label:has-text("Empezar desde cero")');
    await page.click('button:has-text("Crear")');

    await page.waitForURL(/\/consents\/\d+\/edit/);
    await page.click('button:has-text("Guardar borrador")');
    await expect(page.locator('text=Guardado')).toBeVisible();
  });
});
```

```bash
git add tests/e2e/consent-admin.spec.js
git commit -m "test(consent): add Playwright E2E for admin create flow"
```

---

## Entrega

```bash
npm run build
npx playwright test consent-admin
git log --oneline -n 20
git push -u origin feature/consent-forms
```

**Integración:**
- Consume endpoints definidos por agente #1 y #2.
- Agente #4 construye pantallas del padre — no toca este trabajo.
- Si el contrato API cambia, coordinar con #1 o #2.

**Métricas de éxito:**
- Build Vite sin errores
- Rutas admin accesibles y navegan correctamente
- Crear plantilla → editar con TipTap → insertar variable → guardar → publicar (end-to-end)
- Preview PDF genera desde editor
- Listado muestra correctamente estado + badges
- Playwright test pasa
