<!-- ARCHIVADO 13-ago-2026 — parte del reel con metricas falsas ('21 clubs / 0% churn') — ver _archivo-negocio/README.md -->
# Widdo Social Media Reel — Expanded Production Spec

## Title + Style

**Widdo Product Demo Reel** — 45 seconds, vertical 1080x1920, Instagram Reel / TikTok

| Token | Value |
|-------|-------|
| Background | #0A0A0F |
| Surface | #12121A |
| Accent | #00C853 (Widdo green) |
| Text primary | #E8E8ED |
| Text secondary | #7C7C8A |
| Tension color | #FF4444 (Scene 2 only) |
| Display font | Space Grotesk 700 |
| Mono font | JetBrains Mono 400/700 |

## Rhythm Declaration

**hook — PUNCH — BUILD-PEAK — PEAK — resolve**

Social ad pattern adapted for 45s product demo targeting club owners/directors in USA.

## Global Rules

- **Primary transition (60%):** Blur-based (blur crossfade, directional blur)
- **Accent transition:** Zoom through (opening punch)
- **Wind-down:** Simple crossfade (CTA)
- **Energy:** High — sports promo pacing. Fast entrances (0.3-0.6s), snappy transitions (0.3-0.4s)
- **Easing vocabulary:** power3.out/power4.out for entrances, expo.out for dramatic reveals, back.out for pop, sine.inOut for ambient
- **Parallax:** Every scene has 2-5 decoratives with ambient motion (glow breathing, ghost drift, line draws)
- **No exit animations on scene content** — transitions handle exits. Internal screenshot cycling is the exception (Scene 3)

## Per-Scene Beats

### Scene 1: Hook (0-5s)

**Concept:** Dark void. The viewer recognizes their pain immediately. One question that every club director has asked themselves. The text materializes from nothing — each line a beat.

**Mood direction:** Late-night frustration. Phone glow in a dark room. The moment before you search for a solution.

**Depth layers:**
- BG: Radial green glow center (600px, breathing scale), subtle grid lines 60px (3% opacity)
- BG: Ghost "?" character at 420px, 5% opacity green, slow drift upward
- MG: Four-line question stack — "Still running / your club on / spreadsheets / & group chats?"
- FG: Horizontal accent line at mid-height (scaleX from 0)
- FG: Monospace tag "// club management in 2026" bottom-left

**Animation choreography:**
- Grid FADES in immediately (0.1s)
- Glow BREATHES in from 0.7 scale (1.8s, sine.out)
- "Still running" DROPS from y:50 (0.5s, power3.out, t=0.3)
- "your club on" SLIDES from x:-40 (0.45s, expo.out, t=0.65)
- "spreadsheets" POPS from scale:0.85 (0.6s, back.out, t=1.0) — green accent, largest text
- "& group chats?" FLOATS up from y:30 (0.4s, power2.out, t=1.45)
- Monospace tag SLIDES from x:-20 (0.6s, power2.out, t=2.0)

**Transition out:** Zoom through at 4.6s — scene zooms past camera (scale:2.5, blur:8px, 0.4s power3.in). New scene zooms in from behind (scale:0.5→1, 0.4s power3.out).

---

### Scene 2: Problem (5-12s)

**Concept:** Three punch cards of pain — each one a gut-punch the viewer has lived through. The red tension color signals danger. Cards slam in from different directions for visual variety.

**Mood direction:** Urgency, frustration. The pile of problems stacking up. Red alert energy.

**Depth layers:**
- BG: Radial red glow (700px, pulsing)
- BG: Ghost "!" at 380px, 4% opacity red, drift
- FG: Red vertical bar left edge (4px, grows from 0 to 800px)
- MG: Three pain cards with dark surface bg + red border
- FG: Green accent dividers between cards (120px, draws from left)
- MG: "Sound familiar?" in red mono at bottom

**Animation choreography:**
- Glow BREATHES in (1.2s, sine.out)
- Card 1 "Payments lost" SLAMS from x:80 with 2° rotation (0.5s, power4.out, t=5.5)
- Divider 1 DRAWS from left (0.4s, power2.out, t=6.2)
- Card 2 "Attendance?" DROPS from y:-60 (0.5s, power3.out, t=7.0)
- Divider 2 DRAWS from left (0.4s, power2.out, t=7.7)
- Card 3 "Parents confused" SLIDES from x:-80 (0.5s, expo.out, t=8.5)
- "Sound familiar?" FLOATS up (0.5s, power2.out, t=9.8)
- Red bar GROWS vertically (1.5s, power2.out, t=5.2)

**Transition out:** Directional blur at 11.5s — scene blurs + skews left (blur:12px, skewX:-8, x:-200, 0.4s power3.in). New scene enters from right with opposite skew (0.4s power3.out).

---

### Scene 3: Solution (12-28s)

**Concept:** The answer arrives clean and confident. One platform, every role. Product screenshots cycle through in a phone-less floating screen format — each one proving a claim. The green accent returns, banishing the red tension.

**Mood direction:** Relief. Confidence. Clean tech. The "aha" moment when you see the dashboard for the first time.

**Depth layers:**
- BG: Radial green glow (800px, breathing)
- BG: "WIDDO" ghost text at 200px, 4% opacity, slow horizontal drift
- FG: Bottom accent line (200px, draws from left)
- MG: Header stack — "One platform." + "Every role." (green)
- MG: Screenshot viewport (940x580px) with rounded corners + green shadow glow
- MG: Feature labels in mono uppercase
- MG: Role bar "Owners · Coaches · Parents · Players"

**Internal choreography (screenshot cycling):**
- Screenshot 1 (Dashboard): RISES from y:80 at t=13.5, Ken Burns scale 1→1.04 over 3.5s. Label "COMPLETE DASHBOARD" fades in at t=14.0. Both exit opacity→0 at t=17.0.
- Screenshot 2 (Payments): RISES at t=17.3 with expo.out. Label "PAYMENT TRACKING" at t=17.8. Exit at t=20.5.
- Screenshot 3 (Attendance): RISES at t=20.8 with back.out. Label "SMART ATTENDANCE" at t=21.3. Exit at t=24.0.
- Screenshot 4 (Family): RISES at t=24.3. Label "FAMILY PORTAL" at t=24.8. Stays visible for transition.

**Transition out:** Blur crossfade at 27.5s — scene blurs slightly (5px) + scales up (1.03), opacity out. New scene enters blurred and resolves (0.35s power2.inOut).

---

### Scene 4: Proof (28-38s)

**Concept:** Numbers that hit hard. Three stats that together tell the story: growing, massive, sticky. Each number SLAMS in with its own personality — the final "0%" in green is the mic drop.

**Mood direction:** Authority. Impact. The numbers speak for themselves. Stadium scoreboard energy.

**Depth layers:**
- BG: Largest radial green glow (900px, strong breathing)
- BG: Ghost "21" at 500px in mono, 3.5% opacity, drift up
- FG: Top accent line (full width, draws from left)
- MG: Three stat blocks stacked — number (160px mono) + label (32px mono) + green bar

**Animation choreography:**
- "21" SLAMS from scale:1.8 (0.45s, power4.out, t=28.5)
- "clubs" SLIDES from x:-15 (0.3s, power2.out, t=28.9)
- Green bar 1 FILLS from left (0.5s, power2.out, t=29.2)
- "1,200+" DROPS from y:-60 (0.5s, power3.out, t=30.5)
- "athletes" SLIDES (0.3s, t=30.9)
- Green bar 2 FILLS (0.6s, t=31.2)
- "0%" PUNCHES with scale:2 + rotation:-3° (0.4s, back.out(1.8), t=33.0)
- "churn" SLIDES (0.3s, t=33.4)
- Green bar 3 FILLS (0.4s, t=33.7)

**Transition out:** Crossfade at 37.5s — simple opacity swap (0.5s power2.inOut). Wind-down energy.

---

### Scene 5: CTA (38-45s)

**Concept:** Clean, confident close. Logo, URL, action. Let the brand breathe. The subtle grid callback to Scene 1 creates bookend symmetry. Fade to black at the end.

**Mood direction:** Resolution. Quiet confidence after the energy peak. Premium close.

**Depth layers:**
- BG: Radial green glow (600px, gentle breathing)
- BG: Subtle grid pattern (80px, 2% opacity)
- MG: Widdo logo SVG (280px, centered)
- MG: "widdo.co" in mono bold (48px)
- MG: "Try it free" green pill button
- FG: Short accent line (160px, draws from center)
- MG: Tagline in mono regular (22px)

**Animation choreography:**
- Logo POPS from scale:0.8 (0.6s, back.out(1.4), t=38.3)
- URL FLOATS up from y:30 (0.45s, power3.out, t=38.8)
- CTA button POPS from scale:0.9 (0.4s, back.out(1.6), t=39.3)
- Accent line DRAWS from center (0.5s, expo.out, t=39.6)
- Tagline FADES in from y:15 (0.4s, power2.out, t=39.9)
- **FINAL EXIT (43.5s):** All elements fade out with power2.in eases (0.4-0.8s), staggered. Glow and grid fade last.

---

## Recurring Motifs

- **Radial glow:** Every scene, accent-tinted, breathing. Green for positive scenes, red for problem scene.
- **Ghost text:** Large, low-opacity, drifting. Different content per scene (?, !, WIDDO, 21).
- **Accent lines:** Horizontal, green, draw from left. Structural rhythm-keepers.
- **Grid pattern:** Bookend scenes 1 and 5 for symmetry.

## Negative Prompt

- No gradient text (background-clip: text)
- No web-sized typography (nothing under 20px)
- No centered-and-floating layouts
- No static decoratives (all must have ambient motion)
- No pure black (#000) or pure white (#fff)
- No exit animations on scene content (except Scene 5 final and Scene 3 internal cycling)
- No corporate/slow pacing
- No emoji in text overlays
