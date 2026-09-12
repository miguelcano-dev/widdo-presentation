# Configuración completa de la página de Widdo en LinkedIn

Todo copy-paste. Cada afirmación del About está verificada contra producción (18-ago-2026).
Portada y logo: ya subidos. Lo que queda, en orden de impacto:

---

## 1. Acerca de / Overview  (límite 2.000 caracteres)

Pegar tal cual en **Editar página → Acerca de → Descripción**:

```
Youth sports clubs run on volunteers, spreadsheets, and group chats — and the person holding it all together spends more time chasing payments than coaching.

Widdo is the AI-native operating system for youth sports clubs. Owners see the money and the roster in one place, coaches take attendance in seconds, and parents pay, sign, and stay informed from their phone — in English or Spanish. At the center is an assistant that does the work instead of just answering: ask "Who hasn't paid in the 14U team?" and it pulls the list, totals what's owed, and sends the reminders. You approve; it executes.

What makes Widdo different:

• 0% platform fee. Families' money lands straight in your club's own Stripe account — we never take a cut of dues, registrations, or tournament entries.

• AI-native, not AI-added. Collections, reminders, and the morning brief run themselves, with you in control.

• Any sport, any age. 33 sports today, from basketball to cheer. Built for youth clubs first — and it runs adult teams and leagues just as well.

• Clubs and tournaments in one platform, from registration to live scoring.

Flat, transparent pricing by roster size — every feature on every plan.

Built in Orlando, Florida. Start a 14-day free trial at widdo.co, or book a 15-minute demo.
```

## 2. Eslogan  (límite 120 — 92 usados)

```
The AI-native operating system for youth sports clubs — it chases the dues so you can coach.
```

## 3. Sitio web + botón

- **Sitio web:** `https://widdo.co`
- **Botón de la página:** `Learn more` →

```
https://widdo.co/?utm_source=linkedin&utm_medium=organic&utm_campaign=company_page
```

(El UTM separa en GA4 (`G-CDDV6ED53Y`) el tráfico del botón del resto de LinkedIn.)

## 4. Datos de la organización

| Campo | Valor |
|---|---|
| Sector | **Software Development** (dejar como está — ver nota) |
| Tamaño | 2-10 empleados |
| Sede | Orlando, Florida |
| Tipo | Privately Held |
| Año de fundación | 2026 |
| Especialidades | ver punto 5 |

**Nota sector:** antes sugerí cambiarlo a Spectator Sports; lo retiro. El sector describe
qué ES la empresa, no a quién vende, y quien filtra páginas por sector son inversores y
reclutadores — para ellos Software Development es lo correcto. Los términos que buscan los
clubes ya viven en el eslogan, el About y las especialidades.

## 5. Especialidades  (hasta 20)

```
Youth Sports Management, Sports Club Software, Club Management, Dues Collection, Online Registration, Attendance Tracking, Team Communication, Sports Payments, Tournament Management, AI Assistant, Bilingual Software, SaaS
```

## 6. Hashtags de comunidad  (máx. 3)

```
#youthsports  #sportstech  #clubmanagement
```

## 7. Después de guardar todo, en este orden

1. **Publicar el primer post** — `posts/01-the-problem.md` ya tiene imagen lista
   (`images/01-the-problem.png`). Una página con contenido antes de invitar a nadie.
2. **Fijar ese post** en la parte superior de la página.
3. **Invitar conexiones** — 200 invitaciones gratis/mes. Primero red personal de Miguel y Alwin.
4. Perfil personal de Miguel: titular que mencione Widdo y enlace a la página
   (según el playbook, el perfil personal rinde ~10x más que la página).

## Verificación del About (por si alguien pregunta)

| Frase | Respaldo |
|---|---|
| "0% platform fee... never take a cut" | Código en prod: no se envía `application_fee_amount` |
| "You approve; it executes" | Tool `approveCollectionReminders` del agente en prod |
| "33 sports today" | `GET api.widdo.co/api/sports` → 33 activos |
| "English or Spanish" | i18n EN/ES/PT en prod; PT se omite por posicionamiento USA |
| "pricing by roster size" | API pública de planes: 99/249/499 por `max_members` (cifras fuera del About a propósito: no envejecen ahí) |
| "14U team" | Notación USA (no U15 — el hero de widdo.co aún dice U15, pendiente) |
| "registration to live scoring" | Motor de torneos en prod. ⚠️ Cobro real de torneos pendiente de Gate 0 — el About afirma capacidad, no facturación |

**Regla de estilo (patrón verificado en ServiceTitan, Brightwheel, Jobber, TeamSnap):** el About
dice resultados y audiencias, nunca spec sheet. Los detalles finos (75+ acciones del agente,
6 formatos de brackets, onboarding conversacional, precios exactos) van en POSTS del feed, uno
por semana — mismo patrón de ServiceTitan: About sobrio, feed específico.
