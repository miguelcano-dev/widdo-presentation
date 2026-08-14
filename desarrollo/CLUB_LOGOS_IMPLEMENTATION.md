# 🎯 Sistema de Logos Públicos + Documentos Privados

## 📋 Resumen

Implementación completa de almacenamiento híbrido:
- **Logos de clubes**: Públicos, URLs permanentes (no expiran)
- **Documentos sensibles**: Privados, URLs firmadas temporales

## 🏗️ Arquitectura

```
📁 DigitalOcean Spaces (widdo-files)
│
├── 🌐 PÚBLICO (public-read)
│   └── clubs/{id}/club-logos/
│       └── logo_20260122_153045_XyZ.webp  ← URL permanente
│
└── 🔒 PRIVADO (private)
    └── clubs/{id}/
        ├── player-documents/       ← URLs firmadas (60 min)
        ├── player-photos/          ← URLs firmadas (60 min)
        ├── payment-receipts/       ← URLs firmadas (60 min)
        └── legal-signatures/       ← URLs firmadas (60 min)
```

## ⚙️ Configuración

### 1. Variables de Entorno (.env)

```bash
# DigitalOcean Spaces
DO_SPACES_KEY=your_access_key
DO_SPACES_SECRET=your_secret_key
DO_SPACES_REGION=nyc3
DO_SPACES_BUCKET=widdo-files
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com

# URL pública del CDN (para logos)
DO_SPACES_PUBLIC_URL=https://widdo-files.nyc3.cdn.digitaloceanspaces.com
```

### 2. Discos de Almacenamiento

**Archivo**: `config/filesystems.php`

- **`spaces`**: Disco privado (documentos sensibles)
- **`spaces-public`**: Disco público (logos de clubes)

Ambos usan el mismo bucket pero con diferentes configuraciones de visibilidad.

## 📡 API Pública - Directorio de Clubes

### Endpoints Disponibles

#### 1. Listar Clubes
```bash
GET /api/public/clubs

# Query params opcionales:
?country=Colombia
?sport=Fútbol
?city=Bogotá
?limit=50
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Baqueros Basketball Club",
      "slug": "baqueros-basketball-club",
      "description": "Club de baloncesto profesional",
      "address": "Calle 100 #15-20",
      "city": "Bogotá",
      "state": "Cundinamarca",
      "country": "Colombia",
      "sports": ["Baloncesto"],
      "logo_url": "https://widdo-files.nyc3.cdn.digitaloceanspaces.com/clubs/5/club-logos/logo_xxx.webp",
      "webpage": "https://baquerosbc.com",
      "instagram": "@baquerosbc",
      "founded_date": "2020-01-15"
    }
  ],
  "meta": {
    "total": 1,
    "filters_applied": {
      "country": "Colombia",
      "sport": null,
      "city": null
    }
  }
}
```

#### 2. Detalle de Club (por slug)
```bash
GET /api/public/clubs/baqueros-basketball-club
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "Baqueros Basketball Club",
    "slug": "baqueros-basketball-club",
    "logo_url": "https://widdo-files.nyc3.cdn.digitaloceanspaces.com/clubs/5/club-logos/logo_xxx.webp",
    "categories": [
      { "id": 1, "name": "Sub-12", "min_age": 8, "max_age": 12 }
    ],
    "sports": [
      { "id": 1, "name": "Baloncesto" }
    ]
  }
}
```

#### 3. Logo Directo (redirect)
```bash
GET /api/public/clubs/5/logo

# Redirige a la URL pública permanente del logo
```

## 🌐 Uso en Landing Pages Externas

### React/Next.js

```jsx
import { useState, useEffect } from 'react';

function ClubDirectory() {
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    fetch('https://api.widdo.co/api/public/clubs?country=Colombia')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setClubs(data.data);
        }
      });
  }, []);

  return (
    <div className="clubs-grid">
      {clubs.map(club => (
        <div key={club.id} className="club-card">
          <img
            src={club.logo_url}  // ✅ URL pública permanente
            alt={club.name}
            loading="lazy"
          />
          <h3>{club.name}</h3>
          <p>{club.description}</p>
          <p>📍 {club.city}, {club.country}</p>
        </div>
      ))}
    </div>
  );
}
```

### HTML Vanilla

```html
<!DOCTYPE html>
<html>
<head>
    <title>Directorio de Clubes</title>
</head>
<body>
    <div id="clubs"></div>

    <script>
        fetch('https://api.widdo.co/api/public/clubs')
            .then(res => res.json())
            .then(data => {
                const container = document.getElementById('clubs');
                data.data.forEach(club => {
                    const card = `
                        <div class="club-card">
                            <img src="${club.logo_url}" alt="${club.name}">
                            <h3>${club.name}</h3>
                            <p>${club.description}</p>
                        </div>
                    `;
                    container.innerHTML += card;
                });
            });
    </script>
</body>
</html>
```

### SEO - Meta Tags Open Graph

```html
<!-- Para compartir en redes sociales -->
<meta property="og:title" content="Baqueros Basketball Club">
<meta property="og:description" content="Club de baloncesto profesional">
<meta property="og:image" content="https://widdo-files.nyc3.cdn.digitaloceanspaces.com/clubs/5/club-logos/logo_xxx.webp">
<meta property="og:url" content="https://widdo.co/clubs/baqueros-basketball-club">
```

## 🎨 Componente React Centralizado

El componente `ClubLogoImage` maneja automáticamente:
- Loading states (skeleton mientras carga)
- Error handling (fallback si falla)
- Tamaños predefinidos
- URLs públicas permanentes

```jsx
import ClubLogoImage from '@/components/elements/ClubLogoImage';

<ClubLogoImage
  src={club.profile_img_url}
  alt={club.name}
  size="lg"           // xs, sm, md, lg, xl, custom
  rounded={true}
/>
```

**Usado en:**
- ✅ Sidebar
- ✅ TopBar
- ✅ PublicEnrollmentPage
- ✅ ClubLogoUpload (preview)
- ✅ Dashboards
- ✅ Emails (próximo)
- ✅ Recibos PDF (próximo)

## 🔒 Seguridad

### Qué es Público
- ✅ Logos de clubes
- ✅ Portadas de clubes
- ✅ Información básica (nombre, ciudad, deportes)

### Qué es Privado
- 🔒 Documentos de identidad
- 🔒 Certificados médicos
- 🔒 Recibos de pago
- 🔒 Fotos de jugadores
- 🔒 Contratos y firmas
- 🔒 Datos personales sensibles

## 🚀 Ventajas de Este Enfoque

| Aspecto | Público | Privado |
|---------|---------|---------|
| **Performance** | ⚡ Excelente (cache indefinido) | 🐌 Temporal (expira) |
| **SEO** | ✅ Indexable | ❌ No indexable |
| **Compartir** | ✅ Funciona siempre | ⚠️ Expira en 60 min |
| **Costo** | 💰 Bajo | 💸 Medio |
| **UX** | 😊 Sin problemas | 😊 Seguro |

## 📊 Casos de Uso

### ✅ Logos Públicos Ideales Para:
- Directorios de clubes
- Landing pages de marketing
- Compartir en WhatsApp/Telegram
- Redes sociales (Instagram, Facebook)
- Google Maps / Apple Maps
- Material promocional
- Emails de marketing
- Open Graph / SEO

### 🔒 Documentos Privados Para:
- Documentos de identidad de jugadores
- Certificados médicos
- Recibos de pago personalizados
- Contratos y acuerdos
- Fotos de menores de edad
- Información personal sensible

## 🔧 Mantenimiento

### Cambiar Logo de un Club

```php
// Backend - PlaClubTeamController::uploadLogo()
// Automáticamente:
// 1. Elimina logo anterior
// 2. Sube nuevo logo al disco público
// 3. Retorna URL pública permanente
```

### Migrar Logos Existentes (si es necesario)

```php
// Script para migrar logos de privado a público
php artisan tinker

$clubs = \App\Models\PlaClubTeam::whereNotNull('profile_img')->get();

foreach ($clubs as $club) {
    $oldPath = $club->profile_img;

    // Copiar de privado a público
    if (Storage::disk('spaces')->exists($oldPath)) {
        $content = Storage::disk('spaces')->get($oldPath);
        Storage::disk('spaces-public')->put($oldPath, $content, [
            'visibility' => 'public-read',
            'CacheControl' => 'max-age=31536000',
        ]);

        echo "✅ Migrado: {$club->name}\n";
    }
}
```

## 📝 Checklist de Implementación

- [x] Configurar disco `spaces-public` en filesystems.php
- [x] Crear método `uploadPublicLogo()` en FileStorageService
- [x] Actualizar modelo PlaClubTeam (URLs públicas)
- [x] Actualizar PlaClubTeamController::uploadLogo()
- [x] Crear PublicClubDirectoryController
- [x] Agregar rutas públicas en api.php
- [x] Configurar CORS para acceso externo
- [x] Crear componente ClubLogoImage
- [x] Actualizar Sidebar con ClubLogoImage
- [x] Actualizar TopBar con ClubLogoImage
- [x] Actualizar PublicEnrollmentPage con ClubLogoImage
- [ ] Actualizar recibos PDF (próximo)
- [ ] Actualizar emails con logos públicos (próximo)

## 🎯 Próximos Pasos

1. **Recibos de Pago PDF**: Usar `$club->profile_img_url` directamente
2. **Emails Transaccionales**: Incluir logo en templates de Resend
3. **Invitaciones**: Logos en emails de invitación
4. **Landing Page Oficial**: Directorio público en widdo.co/clubes

---

**Fecha de Implementación**: 22 de Enero de 2026
**Versión**: 1.0
**Estado**: ✅ Completo y funcional
