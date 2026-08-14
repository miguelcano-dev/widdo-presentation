# Widdo USA Launch Plan

> **IMPORTANTE:** Este documento contiene TODA la estrategia de lanzamiento de Widdo en USA.
> Cualquier sesión de IA que trabaje en el proyecto Widdo debe leer este archivo primero.
>
> **Estado (13-ago-2026):** el producto USA ya está construido (i18n EN/ES/PT-BR, Stripe,
> compliance, NCAA, tryouts, waivers, enrollment público — ver `USA-TECHNICAL.md`). Lo que
> queda vivo de este documento es la parte comercial: pricing, canales, outreach y validación
> de disposición a pagar. La ventana de onboarding de clubes es **enero 2027**.

---

## Core Pitch (APROBADO)

> **"Run your club in minutes, not hours. One platform for rosters, payments, scheduling, compliance, and communication. Flat fee. No hidden costs. No per-player charges."**

---

## Target Markets (USA)

| Segmento | Pricing | Tamaño USA |
|----------|---------|-----------|
| Youth sports clubs (soccer, baseball, basketball, martial arts) | $99-349/mo según cantidad de jugadores | 10,000+ clubs solo en US Youth Soccer |
| Adult rec leagues (hockey, softball, kickball, volleyball) | $99/mo (Starter, hasta 80 jugadores) | Miles por ciudad |
| Tournaments | Incluido en todos los planes | USSSA: 3.7M members, 13 deportes |

> **Nota:** el sistema NO tiene un plan por debajo de $99/mo. El precio depende solo de la
> cantidad de jugadores (`max_members`), no del segmento ni de los módulos contratados.

---

## Competitive Landscape

| Platform | Price | Rating | Key Weakness |
|----------|-------|--------|-------------|
| TeamSnap (teams) | $9.99-17.99/mo | 1.2/5 Trustpilot (691 reviews) | Terrible support, intrusive ads, abandoned adult leagues |
| TeamSnap ONE (clubs) | ~$599/yr+ custom | Same | Forces sales calls, no public pricing |
| SportsEngine | $69-79/mo + hidden fees | 3.2/5 Trustpilot | Class action lawsuit for hidden fees, PlayMetrics acquired May 2026 |
| LeagueApps | ~5% per transaction | 4.8/5 G2 | No flat fee, transaction-based |
| Jersey Watch | $29/mo flat | 4.7/5 G2 | Limited features, 2,800 orgs after years |
| TeamSideline | $39/mo | N/A | League-only, no payments, no compliance |

**Widdo advantage:** More features than all competitors + flat fee + no per-player charges + compliance/waivers included.

> ⚠️ **Matiz que hay que decir bien en ventas:** "no per-player charges" significa que no se
> cobra por jugador añadido ni un % por transacción (a diferencia de LeagueApps). Pero el
> precio SÍ sube por tramos de cantidad de jugadores (80 → 200 → 500). Es tarifa plana
> **dentro del tramo**, no independiente del tamaño del club. Decirlo de otra forma en una
> demo se convierte en una objeción cuando el club vea la factura al pasar de tramo.

---

## Pricing Strategy

**El precio depende de la CANTIDAD DE JUGADORES, no de los módulos.** Todos los planes
llevan todos los módulos abiertos (torneos, compliance, NCAA, tryouts, waivers, reportes).
La única palanca comercial es el límite de jugadores (`max_members`).

| Plan | Price USD/mes | Límite de jugadores | Target |
|------|---------------|---------------------|--------|
| Starter | $99/mo | hasta 80 | Rec leagues, beer leagues, clubes pequeños |
| Pro | $199/mo | hasta 200 | Youth clubs, academias |
| Enterprise | $349/mo | hasta 500 | Clubes grandes, multi-sport orgs |
| >500 jugadores | Plan a medida | — | Contacto comercial, no self-serve |

**Anual:** paga 12 meses, recibe 13 (mes 13 gratis, ~8% de descuento efectivo).
Starter $1,188/yr · Pro $2,388/yr · Enterprise $4,188/yr.

> Verificado contra `saas_sport/database/seeders/SubscriptionPlansSeeder.php`
> (9900 / 19900 / 34900 centavos USD; `max_members` 80 / 200 / 500).
>
> ⚠️ **Pendiente de decidir:** no existe "founding price" ni descuento de lanzamiento
> modelado en el sistema. Si se quiere ofrecer, hay que crear el precio en el seeder o
> como plan dedicado — hoy no está.

---

## Positioning Principles

- Lead with the PROBLEM (clubs waste hours on admin), NOT with competitors
- Flat fee is the key differentiator
- Don't be opportunistic about SportsEngine acquisition
- Target both youth clubs AND rec leagues
- "Alternative to X" is weak — build a brand that stands on its own

---

## Facility-First Strategy (Highest Leverage)

**1 facility = 10-20 leagues. Convince the facility, get all their leagues.**

| Facility Type | Count in USA | Leagues per facility |
|--------------|-------------|---------------------|
| YMCA branches | ~10,000 | 5-10/year |
| Parks & Rec departments | ~10,000 | 5-15/year |
| Boys & Girls Clubs | 5,400+ | 3-5/year |
| JCC | 170+ | 3-8/year |
| **Total** | **~25,000+** | **~150K-250K leagues** |

**The gap:** Facilities have software for registration/booking (ActiveNet, CivicRec, RecDesk) but for league operations (schedules, standings, rosters, refs) they still use spreadsheets and email. TeamSideline ($39/mo) is the only league-specific competitor.

**Pitch to facility managers:**
> "You handle registration and booking. But who manages the leagues? Give every league that uses your facility a modern platform — and you get a dashboard to see it all. Zero cost to you."

**Decision makers:** Sports Director, Program Director (YMCA), Recreation Coordinator, Parks & Rec Director

---

## Sales Funnel (Correct Order)

**Phase 1: Free + concierge (Month 1-3)**
- Concierge onboarding FREE — "give me your spreadsheet, I'll set everything up"
- Free trial 30-60 days, no credit card
- Miguel does migration work personally
- Goal: 10-20 clubs using Widdo actively

**Phase 2: Start charging subscription (Month 2-4)**
- After 30-60 days free → convert to $99-199/mo (Starter o Pro según cantidad de jugadores)
- Data is already there, switching back is painful
- Goal: 70%+ free convert to paid

**Phase 3: Paid setup (Month 4+)**
- With case studies and testimonials
- Basic (DIY): $0 | Managed: $499 | Full launch: $1,499
- Only after trust is established

**Phase 4: Scale (Month 6+)**
- Premium tiers, annual plans, referral program, facility partnerships

---

## Revenue Projections (Realistic)

Columna "Clubes" = MRR ÷ $99 (plan Starter, el piso real de precio). Es el número de clubes
que hay que tener firmados para llegar a ese MRR **si todos entran en el plan más barato**;
con mezcla de Pro/Enterprise hacen falta menos.

| Month | Actions | MRR | Clubes @ $99 |
|-------|---------|-----|--------------|
| 1 | Cold emails + free concierge | $500-1K | 5-10 |
| 2 | More emails + facility partnerships + referrals | $2K-4K | 20-40 |
| 3 | Product Hunt + SEO pages + first referrals | $4K-6K | 40-60 |
| 4-5 | Inbound starts + facilities bring leagues + paid setup | $6K-10K | 60-100 |
| 6 | Flywheel: all channels working | $10K-15K | 100-150 |
| 8-10 | Full scale | $15K-20K | 150-200 |

> ⚠️ Estas cifras de MRR se escribieron con el pricing viejo ($29 de entrada). Con el piso
> real de $99 los MRR siguen siendo alcanzables con menos clubes, pero **la curva de clubes
> de los meses 6-10 (100-200 clubes) no se ha revalidado** contra la capacidad real de
> onboarding ni contra el pipeline de Florida. Tratar como objetivo, no como proyección.

---

## 6 Channels (Prioritized)

### 1. SEO + Content
- /teamsnap-alternative (500-800 searches/mo)
- /sportsengine-alternative (200-400/mo)
- /league-management-software (1,000-1,500/mo)
- Blog: "How to collect team fees without chasing parents"
- Blog: "Youth sports compliance checklist by state"
- Blog: "Top 5 TeamSnap Alternatives 2026"

### 2. Communities (trust before selling)
- Rule: 10 value posts per 1 Widdo mention
- Reddit: r/hockeyplayers (48K), r/bjj (500K+), r/pickleball (100K+), r/softball, r/volleyball
- Facebook: YOUTH SOCCER COACH, Little League Officers, Beer League Players Association (19K+), AYSO (38K+)
- F5Bot (f5bot.com) monitors Reddit mentions of "TeamSnap", "SportsEngine" automatically

### 3. Direct outreach (Apollo.io free)
- 10K credits/month, 250 emails/day, built-in sequencing
- Filter by: title + industry + geography
- 20 personalized emails/day
- 1 qualified lead per ~306 emails average

### 4. Partnerships
- Facility managers (YMCA, rec centers) — 1 facility = 10-20 leagues
- Referee associations — access to all leagues
- Sports equipment stores — co-marketing
- Insurance providers — compliance tracking helps audits

### 5. Free tier (growth engine) — ⚠️ NO EXISTE HOY
- Idea original: 1 team, 20 players, basic features
- **Realidad del sistema:** no hay plan gratuito. La entrada es trial de 14 días
  (30 en Enterprise), y el gating es por cantidad de jugadores, no por features —
  así que un free tier "sin pagos ni compliance" no es implementable tal cual está
- Decisión pendiente: crear un plan Free con `max_members` bajo, o quedarse con el trial

### 6. Software directories (passive leads)
- Capterra, G2, GetApp, TrustRadius, SaaSWorthy, Product Hunt

---

## Conferences 2026

| Event | Date | Location | Attendees |
|-------|------|----------|-----------|
| NRPA Annual Conference | Sep 29 - Oct 1 | Philadelphia, PA | ~7,000 |
| NAYS Youth Sports Congress | Nov 17-20 | Orlando, FL | 500-1,000 |
| United Soccer Coaches Convention | Jan 2027 | TBD | 11,000+ |

## Podcasts to Pitch

- The Playbook For Youth Sports (Jennifer Peacock)
- Youth Sports Insider (Bill Flitter & Andy Thwaite)
- Youth Inc. (Greg Olsen, former NFL)
- Sideline Talk (Eric Utterback)
- Sports Management Podcast

---

## Club Directories to Scrape

| Directory | URL | Data |
|-----------|-----|------|
| SportsEngine | discover.sportsengineplay.com | 100K+ listings |
| US Youth Soccer | usyouthsoccer.org/state-associations | 54 state associations, 10K clubs |
| USA Hockey | usahockey.com/districtregistry | 567K+ members |
| Little League | littleleague.org/play-little-league/league-finder | By city |
| USSSA | usssa.com | 3.7M members, 13 sports |
| YMCA | ymca.org/find-your-y | ~10,000 branches |

---

## VALIDATION TODOs (validación comercial)

### Week 1: Setup + first emails

- [ ] **TODO 1:** Create Apollo.io account (free) at apollo.io
- [ ] **TODO 2:** Build prospect list — filter "Sports Director" / "Recreation Coordinator" in Florida — export 50 contacts
- [ ] **TODO 3:** Create 3-step email sequence in Apollo (templates below)
- [ ] **TODO 4:** Send first 20 personalized emails, continue 10-20/day
- [ ] **TODO 5:** Set up F5Bot (f5bot.com) — monitor "TeamSnap", "SportsEngine", "league management software"
- [ ] **TODO 6:** Post in Reddit: r/hockeyplayers, r/softball, r/soccercoaches (ask genuine questions, don't sell)

### Week 2: Evaluate

- [ ] **TODO 7:** Review Apollo metrics — opens, replies, calls booked
- [ ] **TODO 8:** Decision: 3-5 positive replies = SIGNAL → expand. 0 replies after 100 emails = reassess.
- [ ] **TODO 9:** If signal → book 5 demo calls, show Widdo live
- [ ] **TODO 10:** If signal → join Facebook groups, participate 1 week before mentioning Widdo

### Week 3-4: Validate willingness to pay

- [ ] **TODO 11:** Offer free pilot to 5 interested clubs — concierge setup, free 60 days
- [ ] **TODO 12:** After 30 days → ask for payment: "$99/mo (Starter) or $1,188/year
      (paga 12 meses, recibe 13)". Ver aviso de "founding price" en Pricing Strategy:
      hoy no existe ese precio en el sistema

### Success criteria

- ✅ 5+ demo calls completed
- ✅ 3+ clubs actively using Widdo in free trial
- ✅ 2+ clubs willing to pay (verbal or actual)
- ✅ Clear feedback on what to build/change

---

## Email Templates

### Email 1 (Day 0):
```
Subject: Quick question about [Club/Facility Name]

Hi [First Name],

I saw that [Club/Facility Name] runs [sport] leagues. Quick question — how are your coordinators currently handling schedules, standings, and team communication?

We built a platform specifically for sports clubs and leagues — scheduling, rosters, payments, compliance, all in one place. Flat monthly fee, no per-player charges.

Would 10 minutes this week work for a quick call?

[Your name]
widdo.co
```

### Email 2 (Day 3, if no reply):
```
Subject: Re: Quick question about [Club/Facility Name]

Hi [First Name],

Just following up — I know league season keeps you busy.

If you're currently using spreadsheets or TeamSnap, I'd love to show you how clubs like yours are saving 5-10 hours/week on admin.

Happy to do a quick screen share whenever works for you.

[Your name]
```

### Email 3 (Day 7, if no reply):
```
Subject: Last one from me

Hi [First Name],

Don't want to be a bother. If league management tools aren't a priority right now, totally understand.

If it ever becomes one, widdo.co is here. We handle scheduling, rosters, payments, and compliance for sports clubs — flat fee, no surprises.

Best of luck this season.

[Your name]
```

### Email to Facility Managers:
```
Subject: Quick question about your league programs

Hi [Name],

I saw that [YMCA Branch / City Parks & Rec] runs [basketball, softball, volleyball] leagues. Quick question — how are your league coordinators currently handling schedules, standings, and team communication?

We built Widdo (widdo.co) — a league management platform that gives each of your leagues their own scheduling, rosters, standings, and payment tools. You'd get a dashboard to see all leagues at a glance.

Zero cost to [facility name]. The leagues handle their own subscription.

Would 10 minutes this week work to show you how it looks?

[Name]
```

---

## Tools (All Free)

| Tool | Purpose | URL |
|------|---------|-----|
| Apollo.io | Email outreach, 10K credits/mo | apollo.io |
| F5Bot | Reddit monitoring | f5bot.com |
| Instant Data Scraper | Chrome extension for scraping directories | Chrome Web Store |
| Google Alerts | Monitor competitor mentions | google.com/alerts |
| Mailchimp | Waitlist + newsletter (500 free) | mailchimp.com |
| LinkedIn Sales Navigator | 30-day free trial | linkedin.com |
| Canva | Graphics for PH and social | canva.com |

---

## Tech Changes — estado real (13-ago-2026)

Esta lista era el backlog técnico del lanzamiento. Casi todo está hecho; detalle por fase
en `USA-TECHNICAL.md`.

| Item | Estado | Evidencia |
|------|--------|-----------|
| Stripe como pasarela | ✅ Hecho | `saas_sport/app/Services/Payments/StripeGateway.php` + `StripeConnectService.php`, `stripe/stripe-php` en `composer.json`. **Stripe es la ÚNICA pasarela para USA/Canadá/México** — Wompi y MercadoPago quedaron descartados por decisión de negocio (el código legacy sigue en el repo pero no se ofrece) |
| Stripe en modo live | 🔴 **Gate 0, en curso** | Producción sigue en `sandbox`. Es el bloqueador único del lanzamiento USA |
| Traducir UI a inglés | ✅ Hecho | 37 namespaces × 3 idiomas (`en`, `es`, `pt-BR`) en `frontend/src/i18n/locales/` |
| USA data (states, cities, docs) | ✅ Hecho | `USStatesSeeder.php`, `USDocumentTypesSeeder.php`, `USACountryConfigSeeder.php` |
| English landing page | ⏳ Fuera de estos dos repos (landing Next.js) |  |
| Simplify UX for casual rec leagues | ⏳ Pendiente, sin especificar |  |
| Auto-calculate standings/stats | ✅ Existe para torneos | `pla_tournament_group_standings`, `pla_tournament_player_stats` |
| Facility dashboard | ⏳ Pendiente, no empezado |  |
