# File Upload Security Auditor

## Descripcion
Audita la seguridad en la subida y almacenamiento de archivos: validacion de tipos, tamanos, URLs firmadas, permisos de acceso, y proteccion de documentos sensibles.

## Cuando Usar
- Al implementar nuevos uploads
- Despues de cambios en almacenamiento
- Auditorias de seguridad
- Cuando hay acceso no autorizado a archivos

---

## Arquitectura de Archivos en Widdo

### Storage
```
Local (desarrollo): storage/app/
DigitalOcean Spaces (produccion): S3-compatible
```

### Tipos de Archivos
```
Fotos de jugadores    - Publicas (CDN)
Documentos de identidad - Privados (signed URLs)
Certificados medicos  - Privados (signed URLs)
Comprobantes de pago  - Privados (signed URLs)
Logos de clubes       - Publicos (CDN)
```

### Servicios
```
FileStorageService.php       - Manejo de storage
ImageOptimizationService.php - Compresion de imagenes
```

---

## Checklist de Auditoria

### 1. Validacion de Tipos de Archivo

**Backend - Form Request:**
```php
// StoreDocumentRequest.php
public function rules()
{
    return [
        'file' => [
            'required',
            'file',
            'mimes:pdf,jpg,jpeg,png',  // Solo tipos permitidos
            'max:10240',  // 10MB max
        ],
        'type' => 'required|in:identity,medical,payment',
    ];
}
```

**Verificar:**
```
[ ] mimes valida extension Y contenido
[ ] max limita tamano del archivo
[ ] No se permiten ejecutables (.exe, .php, .js)
[ ] No se permiten archivos peligrosos (.svg con scripts)
```

### 2. Validacion de Contenido Real

```php
// No confiar solo en extension
public function validateRealMimeType($file)
{
    $finfo = new \finfo(FILEINFO_MIME_TYPE);
    $realMime = $finfo->file($file->getPathname());

    $allowedMimes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
    ];

    return in_array($realMime, $allowedMimes);
}
```

**Verificar:**
```
[ ] Se valida MIME type real, no solo extension
[ ] Archivos renombrados son detectados
[ ] Doble extension (.pdf.exe) es rechazada
```

### 3. Nombre de Archivo Seguro

```php
// MALO - usa nombre original
$path = $file->storeAs('documents', $file->getClientOriginalName());

// BUENO - genera nombre unico
$path = $file->storeAs(
    'documents',
    Str::uuid() . '.' . $file->getClientOriginalExtension()
);

// MEJOR - hash del contenido
$path = $file->storeAs(
    'documents',
    hash('sha256', $file->getContent()) . '.' . $file->getClientOriginalExtension()
);
```

**Verificar:**
```
[ ] No se usa nombre original del archivo
[ ] Nombre generado es UUID o hash
[ ] Path no permite directory traversal (../)
```

### 4. Visibilidad de Archivos

```php
// Archivos publicos (fotos de perfil)
$path = Storage::disk('spaces')->put(
    'public/avatars',
    $file,
    'public'  // Accesible via URL directa
);

// Archivos privados (documentos)
$path = Storage::disk('spaces')->put(
    'private/documents',
    $file,
    'private'  // Requiere signed URL
);
```

**Verificar:**
```
[ ] Documentos sensibles son 'private'
[ ] Solo fotos/logos son 'public'
[ ] Bucket tiene politica correcta
```

### 5. URLs Firmadas (Signed URLs)

```php
// FileStorageService.php
public function getSecureUrl($path, $expiresInMinutes = 60)
{
    if (config('filesystems.default') === 'spaces') {
        return Storage::disk('spaces')->temporaryUrl(
            $path,
            now()->addMinutes($expiresInMinutes)
        );
    }

    // Local - usar route con firma
    return URL::temporarySignedRoute(
        'files.download',
        now()->addMinutes($expiresInMinutes),
        ['path' => encrypt($path)]
    );
}
```

**Verificar:**
```
[ ] Documentos privados usan signed URLs
[ ] URLs expiran en tiempo razonable (60 min)
[ ] Path esta encriptado en URLs locales
[ ] No se puede adivinar URLs de otros archivos
```

### 6. Control de Acceso a Archivos

```php
// DocumentController.php
public function download(PlaPlayerDocument $document)
{
    // Verificar autorizacion
    $this->authorize('view', $document);

    // Verificar que pertenece al club del usuario
    if ($document->player->club_id !== auth()->user()->currentClubId()) {
        abort(403);
    }

    // Generar URL segura
    $url = $this->fileService->getSecureUrl($document->path);

    return response()->json(['url' => $url]);
}
```

**Verificar:**
```
[ ] Policy valida permiso de ver documento
[ ] Se verifica club_id del documento
[ ] Para menores, se verifica que es el padre/tutor
[ ] Logs registran acceso a documentos sensibles
```

### 7. Documentos de Menores de Edad

```php
// Proteccion adicional para menores
public function getMinorDocument(PlaPlayerDocument $document)
{
    $player = $document->player;

    // Verificar que es menor
    if ($player->age >= 18) {
        return $this->getAdultDocument($document);
    }

    // Solo padre/tutor puede ver
    $canAccess = auth()->user()->isParentOf($player->id)
              || auth()->user()->hasRole(['owner', 'trainer']);

    if (!$canAccess) {
        abort(403, 'Solo el acudiente puede ver documentos de menores');
    }

    // URL con expiracion corta
    return $this->fileService->getSecureUrl($document->path, 15);  // 15 min
}
```

**Verificar:**
```
[ ] Documentos de menores tienen proteccion extra
[ ] Solo padre/tutor o roles autorizados pueden ver
[ ] URLs expiran mas rapido (15 min)
[ ] Se registra quien accedio
```

### 8. Optimizacion de Imagenes

```php
// ImageOptimizationService.php
public function optimize($file)
{
    $image = Image::make($file);

    // Redimensionar si es muy grande
    if ($image->width() > 1200) {
        $image->resize(1200, null, function ($constraint) {
            $constraint->aspectRatio();
        });
    }

    // Comprimir
    $image->encode('jpg', 80);  // 80% calidad

    // Limpiar metadata EXIF (puede contener ubicacion)
    $image->orientate();  // Aplica rotacion y limpia EXIF

    return $image;
}
```

**Verificar:**
```
[ ] Imagenes se redimensionan a tamano razonable
[ ] Metadata EXIF se elimina (privacidad)
[ ] Compresion reduce tamano sin perder calidad
[ ] Formatos soportados: JPG, PNG
```

### 9. Frontend - Upload Seguro

```jsx
// DocumentUpload.jsx
const handleUpload = async (file) => {
  // Validar en frontend tambien
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    toast.error('Tipo de archivo no permitido');
    return;
  }

  if (file.size > maxSize) {
    toast.error('Archivo muy grande (max 10MB)');
    return;
  }

  // Comprimir imagen antes de subir
  if (file.type.startsWith('image/')) {
    file = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
    });
  }

  const formData = new FormData();
  formData.append('file', file);

  await documentService.upload(formData);
};
```

**Verificar:**
```
[ ] Validacion de tipo en frontend
[ ] Validacion de tamano en frontend
[ ] Compresion de imagenes antes de subir
[ ] Feedback de progreso al usuario
```

---

## Pruebas de Seguridad

### Test 1: Archivo con extension falsa
```bash
# Crear PHP disfrazado de imagen
echo "<?php phpinfo(); ?>" > test.jpg
curl -X POST -F "file=@test.jpg" /api/documents
# Esperado: Rechazado por MIME type invalido
```

### Test 2: Path Traversal
```bash
curl -X POST -F "file=@test.pdf" -F "path=../../../etc/passwd" /api/documents
# Esperado: Rechazado, path sanitizado
```

### Test 3: URL sin firmar
```bash
# Intentar acceder directo a archivo privado
curl https://storage.example.com/private/documents/secret.pdf
# Esperado: 403 Forbidden
```

### Test 4: URL expirada
```bash
# Usar signed URL despues de expiracion
curl "https://storage.example.com/private/doc.pdf?signature=xxx&expires=pasado"
# Esperado: 403 Link expirado
```

### Test 5: Acceso cross-tenant
```bash
# Usuario de Club A intenta ver documento de Club B
curl -H "Authorization: Bearer token_club_a" \
     GET /api/documents/{id_documento_club_b}
# Esperado: 403 Forbidden
```

---

## Configuracion de Storage

### Local (config/filesystems.php)
```php
'local' => [
    'driver' => 'local',
    'root' => storage_path('app'),
    'throw' => false,
],
```

### DigitalOcean Spaces
```php
'spaces' => [
    'driver' => 's3',
    'key' => env('DO_SPACES_KEY'),
    'secret' => env('DO_SPACES_SECRET'),
    'region' => env('DO_SPACES_REGION'),
    'bucket' => env('DO_SPACES_BUCKET'),
    'url' => env('DO_SPACES_URL'),
    'endpoint' => env('DO_SPACES_ENDPOINT'),
    'use_path_style_endpoint' => false,
    'throw' => false,
    'visibility' => 'private',  // Default privado
],
```

---

## Reporte de Hallazgos

### CRITICO
- Archivos ejecutables permitidos
- Sin validacion de MIME type real
- Documentos privados accesibles sin auth
- Path traversal posible

### ALTO
- Signed URLs con expiracion muy larga
- Sin control de acceso para documentos de menores
- Metadata EXIF no se elimina

### MEDIO
- Sin limite de tamano de archivo
- Sin compresion de imagenes
- Logs no registran accesos

### BAJO
- Nombres de archivo predecibles
- Sin validacion en frontend
- Feedback de error generico
