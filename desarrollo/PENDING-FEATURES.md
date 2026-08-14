# Features Pendientes — Widdo

> **Estado del documento:** backlog, no fuente de verdad del producto.
> Revisado el 17 de julio de 2026 contra los repositorios de Clubs y Landing.
> Academy y Tournaments quedan fuera de alcance. Los ítems 3 y 4 estaban
> desactualizados y se marcan como resueltos abajo.

## 1. Agente IA de Ventas (Landing Chat)

**Estado verificado:** parcial. Ya existe un widget de soporte público y su
backend, pero no el CRM de leads, scoring y analítica comercial definidos en
esta propuesta. No debe describirse como terminado.

### Objetivo
Widget de chat en la landing (como Holafly) que responde preguntas de ventas, captura leads, y almacena conversaciones para analisis.

### Arquitectura

```
Landing (Next.js)                    Backend (Laravel)
┌─────────────────┐                 ┌─────────────────────┐
│ ChatWidget.tsx  │ ──POST────────→ │ /api/public/chat    │
│ (burbuja float) │ ←───JSON──────  │ SalesChatController │
│                 │                 │       ↓              │
│ - Sin auth      │                 │ Claude Haiku 4.5    │
│ - Multi-idioma  │                 │       ↓              │
│ - Captura leads │                 │ landing_chats (BD)  │
└─────────────────┘                 └─────────────────────┘
```

### Backend (Laravel)

#### Tabla `landing_chat_conversations`
```sql
id, session_id (uuid), visitor_country, visitor_locale,
visitor_name, visitor_email, visitor_phone, visitor_club_name,
visitor_club_size, visitor_sport, messages (json),
lead_score (0-100), status (active/closed/converted),
source_page, created_at, updated_at
```

#### Tabla `landing_chat_messages`
```sql
id, conversation_id, role (user/assistant), content,
metadata (json), created_at
```

#### Controller: `SalesChatController`
```php
// POST /api/public/chat — sin auth, rate limited
public function sendMessage(Request $request) {
    // 1. Buscar o crear conversacion por session_id
    // 2. Agregar mensaje del usuario
    // 3. Llamar Claude Haiku con system prompt de ventas
    // 4. Guardar respuesta
    // 5. Extraer lead info si la hay (nombre, email, club)
    // 6. Retornar respuesta
}

// GET /api/admin/landing-chats — Super Admin
public function index() {
    // Lista de conversaciones con filtros
    // Preguntas mas frecuentes agregadas
}
```

#### System Prompt del Agente de Ventas
```
Eres el asistente de ventas de Widdo, la plataforma de gestion de clubes deportivos.

CONTEXTO:
- Widdo es una C Corp de USA que opera en Americas
- Pricing: Starter $99, Pro $199, Enterprise $349 USD/mes
- Colombia: Basico $69K, Pro $129K, Enterprise $299K COP/mes
- Deportes: futbol, baloncesto, football americano, baseball, voleibol, natacion, tenis, hockey, cheerleading, artes marciales, patinaje, gimnasia, atletismo, ciclismo, y mas
- Competidores: TeamSnap ($10-30/jugador), SportsEngine (3.25% + $1.50 fees), Jersey Watch
- Diferenciadores: tarifa fija (no per-player), IA integrada, datos permanentes, multi-deporte, multi-idioma

REGLAS:
- Responde en el idioma del usuario
- Se breve y amigable (3-4 oraciones max)
- Si preguntan precio, da el del pais detectado
- Intenta capturar: nombre, email, nombre del club, tamano, deporte
- Si no puedes responder algo, ofrece contacto humano
- NUNCA inventes features que no existen
- NO des informacion tecnica interna
```

### Frontend (Landing — Next.js)

#### Componente: `ChatWidget.tsx`
- Burbuja flotante en esquina inferior derecha (reemplaza WhatsApp)
- Click abre chat panel
- Input de texto + historial de mensajes
- Auto-detect locale del visitante
- Session ID en cookie (persiste si vuelve)
- Typing indicator mientras Claude responde
- CTA inline: "Prueba Gratis" / "Start Free" dentro del chat

#### Integracion
- Reemplaza `WhatsAppFloat.tsx` o se pone al lado
- Se carga lazy (no afecta performance)
- Solo en landing pages, no en el app

### Metricas a Trackear
- Total conversaciones / dia
- Preguntas mas frecuentes (top 20)
- Tasa de conversion (chat → registro)
- Tiempo promedio de conversacion
- Paises de origen
- Deportes mas preguntados

### Orden de Implementacion
1. Tabla + modelo + controller (1 hora)
2. System prompt + integracion Claude (30 min)
3. Widget React en landing (2 horas)
4. Dashboard admin para ver conversaciones (1 hora)
5. Analytics de preguntas frecuentes (1 hora)

---

## 2. Deportes Adicionales (Seeder)

**Estado verificado:** pendiente. Existe administración de deportes, pero no la
migración multi-idioma y el seeder completo descritos en esta sección.

### Deportes actuales (8)
Atletismo, Baloncesto, Ciclismo, Futbol, Natacion, Patinaje, Tenis, Volleyball

### Deportes a agregar (por mercado)

#### USA (prioritarios)
- [ ] Football (Americano)
- [ ] Baseball / Softball
- [ ] Hockey (Ice Hockey)
- [ ] Lacrosse
- [ ] Cheerleading
- [ ] Wrestling
- [ ] Soccer (alias de Futbol para USA)
- [ ] Track & Field (alias de Atletismo)
- [ ] Cross Country
- [ ] Gymnastics (Gimnasia)
- [ ] Field Hockey
- [ ] Golf
- [ ] Rugby

#### LATAM (complementarios)
- [ ] Futbol Sala / Futsal
- [ ] Artes Marciales / Martial Arts
- [ ] Taekwondo
- [ ] Judo
- [ ] Karate
- [ ] Boxeo / Boxing
- [ ] Gimnasia / Gymnastics
- [ ] Rugby
- [ ] Handball / Balonmano
- [ ] Waterpolo
- [ ] Esgrima / Fencing
- [ ] Badminton
- [ ] Squash
- [ ] Surf
- [ ] Skateboarding

### Estructura del Seeder

La tabla `bas_sports` necesita soporte multi-idioma. Opciones:
1. **Campo `name_en`** adicional (simple)
2. **JSON `translations`** (flexible)
3. **Tabla pivot `bas_sport_translations`** (mas complejo)

**Recomendacion:** Campo `name_en` + `name_pt` adicionales. Mas simple, suficiente para 3 idiomas.

### Migracion necesaria
```php
Schema::table('bas_sports', function (Blueprint $table) {
    $table->string('name_en')->nullable()->after('name');
    $table->string('name_pt')->nullable()->after('name_en');
    $table->string('slug')->nullable()->after('name_pt'); // para URLs
    $table->string('icon')->nullable(); // nombre del icono lucide
    $table->boolean('popular_us')->default(false);
    $table->boolean('popular_latam')->default(false);
});
```

### Seeder: `AdditionalSportsSeeder`
```php
// Usar updateOrCreate con 'slug' como key para evitar duplicados
$sports = [
    ['name' => 'Futbol', 'name_en' => 'Soccer', 'name_pt' => 'Futebol', 'slug' => 'soccer', 'popular_us' => true, 'popular_latam' => true],
    ['name' => 'Baloncesto', 'name_en' => 'Basketball', 'name_pt' => 'Basquete', 'slug' => 'basketball', 'popular_us' => true, 'popular_latam' => true],
    ['name' => 'Football Americano', 'name_en' => 'Football', 'name_pt' => 'Futebol Americano', 'slug' => 'football', 'popular_us' => true, 'popular_latam' => false],
    ['name' => 'Beisbol', 'name_en' => 'Baseball', 'name_pt' => 'Beisebol', 'slug' => 'baseball', 'popular_us' => true, 'popular_latam' => true],
    ['name' => 'Hockey sobre Hielo', 'name_en' => 'Ice Hockey', 'name_pt' => 'Hockey no Gelo', 'slug' => 'ice-hockey', 'popular_us' => true, 'popular_latam' => false],
    ['name' => 'Cheerleading', 'name_en' => 'Cheerleading', 'name_pt' => 'Cheerleading', 'slug' => 'cheerleading', 'popular_us' => true, 'popular_latam' => false],
    ['name' => 'Lacrosse', 'name_en' => 'Lacrosse', 'name_pt' => 'Lacrosse', 'slug' => 'lacrosse', 'popular_us' => true, 'popular_latam' => false],
    ['name' => 'Lucha', 'name_en' => 'Wrestling', 'name_pt' => 'Luta', 'slug' => 'wrestling', 'popular_us' => true, 'popular_latam' => false],
    ['name' => 'Futbol Sala', 'name_en' => 'Futsal', 'name_pt' => 'Futsal', 'slug' => 'futsal', 'popular_us' => false, 'popular_latam' => true],
    ['name' => 'Artes Marciales', 'name_en' => 'Martial Arts', 'name_pt' => 'Artes Marciais', 'slug' => 'martial-arts', 'popular_us' => true, 'popular_latam' => true],
    ['name' => 'Taekwondo', 'name_en' => 'Taekwondo', 'name_pt' => 'Taekwondo', 'slug' => 'taekwondo', 'popular_us' => true, 'popular_latam' => true],
    ['name' => 'Gimnasia', 'name_en' => 'Gymnastics', 'name_pt' => 'Ginastica', 'slug' => 'gymnastics', 'popular_us' => true, 'popular_latam' => true],
    ['name' => 'Boxeo', 'name_en' => 'Boxing', 'name_pt' => 'Boxe', 'slug' => 'boxing', 'popular_us' => true, 'popular_latam' => true],
    ['name' => 'Balonmano', 'name_en' => 'Handball', 'name_pt' => 'Handebol', 'slug' => 'handball', 'popular_us' => false, 'popular_latam' => true],
    ['name' => 'Rugby', 'name_en' => 'Rugby', 'name_pt' => 'Rugby', 'slug' => 'rugby', 'popular_us' => true, 'popular_latam' => true],
    ['name' => 'Golf', 'name_en' => 'Golf', 'name_pt' => 'Golfe', 'slug' => 'golf', 'popular_us' => true, 'popular_latam' => false],
    ['name' => 'Softball', 'name_en' => 'Softball', 'name_pt' => 'Softball', 'slug' => 'softball', 'popular_us' => true, 'popular_latam' => false],
    ['name' => 'Hockey sobre Cesped', 'name_en' => 'Field Hockey', 'name_pt' => 'Hockey de Campo', 'slug' => 'field-hockey', 'popular_us' => true, 'popular_latam' => true],
    ['name' => 'Cross Country', 'name_en' => 'Cross Country', 'name_pt' => 'Cross Country', 'slug' => 'cross-country', 'popular_us' => true, 'popular_latam' => false],
    ['name' => 'Waterpolo', 'name_en' => 'Water Polo', 'name_pt' => 'Polo Aquatico', 'slug' => 'water-polo', 'popular_us' => true, 'popular_latam' => true],
    ['name' => 'Esgrima', 'name_en' => 'Fencing', 'name_pt' => 'Esgrima', 'slug' => 'fencing', 'popular_us' => true, 'popular_latam' => true],
    ['name' => 'Badminton', 'name_en' => 'Badminton', 'name_pt' => 'Badminton', 'slug' => 'badminton', 'popular_us' => true, 'popular_latam' => true],
    ['name' => 'Skateboarding', 'name_en' => 'Skateboarding', 'name_pt' => 'Skate', 'slug' => 'skateboarding', 'popular_us' => true, 'popular_latam' => true],
    ['name' => 'Surf', 'name_en' => 'Surfing', 'name_pt' => 'Surfe', 'slug' => 'surfing', 'popular_us' => true, 'popular_latam' => true],
    ['name' => 'Judo', 'name_en' => 'Judo', 'name_pt' => 'Judo', 'slug' => 'judo', 'popular_us' => true, 'popular_latam' => true],
    ['name' => 'Karate', 'name_en' => 'Karate', 'name_pt' => 'Karate', 'slug' => 'karate', 'popular_us' => true, 'popular_latam' => true],
    ['name' => 'Squash', 'name_en' => 'Squash', 'name_pt' => 'Squash', 'slug' => 'squash', 'popular_us' => true, 'popular_latam' => true],
];
```

### Notas
- Los 8 deportes existentes se actualizan (agregan name_en, name_pt, slug)
- `updateOrCreate` con slug como key evita duplicados
- El frontend debe mostrar `name_en` o `name` segun el idioma del usuario
- El landing ya tiene los deportes clave en los diccionarios de i18n

---

## 3. Landing — Paginas de Deportes bajo [locale]

### Estado actual
**Implementado parcialmente con una estructura distinta a la propuesta.** Las
páginas existen bajo `src/app/[locale]/{deporte}/page.tsx`; no están agrupadas
en `sports/` y actualmente su contenido especializado es principalmente ES.

### Por hacer
- [x] Publicar paginas de deportes bajo `[locale]`
- [ ] Decidir si se conserva la URL corta actual o se migra a `sports/`
- [ ] Crear versiones EN de cada pagina
- [ ] Redirects 301 de URLs legacy

---

## 4. Landing — Terminos y Privacidad Multinacionales

### Estado actual
**Implementado parcialmente.** Existen páginas multi-idioma para términos y
privacidad. Las URLs españolas legacy todavía sirven documentos independientes
en lugar de redirigir y contienen definiciones legales que deben unificarse.

### Por hacer
- [x] `app/[locale]/terms/page.tsx` — C Corp USA + tabla de leyes por pais
- [x] `app/[locale]/privacy/page.tsx` — responsable Widdo Inc. + derechos por jurisdiccion
- [ ] Unificar contenido y responsable legal de las páginas legacy
- [ ] Redirects: `/terminos` → `/es/terms`, `/privacidad` → `/es/privacy`

---

## 5. Versionado de Precios (Grandfathering)

**Estado verificado:** pendiente de validación funcional específica. Stripe
conserva `price_id` por suscripción, pero la UI administrativa de migración de
versión no está certificada por pruebas dedicadas.

### Objetivo
Clubes existentes mantienen su precio cuando suban los precios para nuevos.

### Por hacer (backend)
- [ ] Stripe maneja nativamente (cada suscripcion tiene su price_id)
- [ ] Super Admin puede ver price version de cada club
- [ ] Opcion para migrar club a nuevo precio
