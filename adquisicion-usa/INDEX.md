# ÍNDICE — Adquisición USA de Widdo

> **Cómo volver a esto en otra sesión:** abre `Widdo/adquisicion-usa/` y empieza por este INDEX. Si vas a operar
> (enviar, responder, clasificar), lo que necesitas es **`MOTOR/RUNBOOK.md`**. Si vas a escribir o editar copy,
> lee antes **`CLAUDE.md`** (claims prohibidos, firma, framing).
>
> Última actualización: **13 ago 2026**. Cubre los 49 archivos vivos; los retirados están en `_archivo/`.

## Estado en cuatro líneas (13-ago-2026)

- **Tanda 1 EN ENVÍO** desde hoy, por **Brevo** con sender `miguel@widdo.co`.
- **Framing: enero 2027.** Eventos y temporadas 2026 descartados como puerta de entrada. Se vende
  *"founding organizer, arrancas en enero 2027"*. Excepción: ofertas de Fall 2 / otoño ya escritas (BNA).
- **Gate 0 (Stripe live): en curso**, parte manual de Miguel casi lista. Bloquea cobrar, no escribir.
- **Torneos: QA ejecutado, performance NO resuelta.** Techo honesto: ~250-500 equipos por evento.

---

## ⭐ Operar hoy — el motor de outreach

- **`MOTOR/RUNBOOK.md`** — **la fuente correcta.** Una página: qué comprobar antes del primer envío, la rutina
  de 15 minutos de cada mañana, qué hacer cuando alguien responde, la métrica que importa (tasa de respuesta) y
  la lista de verificación manual pendiente por prospecto. **Léelo antes que nada.**
- **`MOTOR/calendario-envio.md`** — orden y ritmo de envío, lote por lote, con los avisos de "antes de darle a
  enviar" de cada uno. ⚠️ Las fechas originales (29 jul – 21 ago) **vencieron sin ejecutarse**: el orden sigue
  valiendo, las fechas hay que recalendarizarlas sobre el 13-ago.
- **`MOTOR/emails-nuevos.md`** — 30 emails redactados (28-jul), uno por sección.
- **`MOTOR/brevo-import.csv`** — 🔒 61 contactos con email + **estado de envío**. Lo mantiene Miguel. **No editar.**

## ⭐ Copy canónico — tanda 1 Florida

- **`emails/01-academy-cfl.md` … `emails/10-impress-me.md`** — un email por prospecto, cada uno con sus
  verificaciones al día. **Este es el modelo de copy a seguir**: firma correcta (Miguel), footer CAN-SPAM,
  sin claims prohibidos.
- **`emails/TODOS-LOS-EMAILS.md`** — los 10 en un solo archivo.
- **`emails/README.md`** — orden de envío sugerido y reglas.
- **`emails/TRACKING.csv`** — 🔒 estado y respuestas. Lo mantiene Miguel. **No editar.**

## 🚀 Lanzamiento y cobro

- **`LANZAMIENTO-GO-NOGO.html`** — los 5 gates go/no-go (Stripe live → mensaje valida → primer dólar →
  repetible → escala) con criterios medibles. Se revisa a diario. Ábrelo en el navegador.
- **`GATE-0-STRIPE-LIVE.md`** — paso a paso para poner Stripe en live: activar la cuenta, los **dos** webhooks
  (uno por endpoint, con secrets distintos), cargar credenciales en los **dos** sitios, smoke tests con dinero
  real. Estado: en curso.

## 📖 Manual

- **`CLAUDE.md`** — manual de operación: hechos canónicos, claims prohibidos, firma, wedge, reglas duras,
  estructura de la carpeta, skills. Leer antes de escribir cualquier cosa.
- **`INDEX.md`** — este archivo.
- **`_archivo/README.md`** — qué se retiró el 13-ago y por qué. Nada de ahí sirve para operar.

---

## 📋 Prospectos y mensajes, por segmento

### A) Torneos y ligas grandes — mayor valor ⭐
- **`torneos/00-TORNEOS-MASTER.md`** — 28 orgs de FL y TX; ballenas vs sweet-spot; incumbentes a desplazar
  (GotSport, AES, Exposure, USSSA).
- **`torneos/01-MENSAJES-TORNEOS.md`** — 11 mensajes listos (sweet-spot, inglés, ángulo anti-GotSport).
- **`torneos/AUDITORIA-MODULO-TORNEOS.md`** — hasta qué escala se puede vender con honestidad.
- **`torneos/PENDIENTES-PERFORMANCE.md`** — ⚠️ **lo único que sigue abierto del gate técnico**: el scheduling
  es cuadrático (round-robin de 32 = 7,5 min). Qué prometer y qué no. Leer antes de cotizar tamaños.
- **`torneos/GUIA-PRUEBAS-TORNEOS.md`** — 20 escenarios de prueba (deporte × equipos × formato).
- **`torneos/ESTUDIO-PERFECT-GAME.md`** — teardown del gigante del béisbol: monetización en capas, qué replicar.
- **`torneos/PLAN-WIDDO-CUP.md`** — el torneo propio como cuña, en 3 niveles (empezar powereando el de un
  prospecto, gratis, no montando uno de cero).

### B) Florida — clubes y ligas
- **`00-LISTA-MAESTRA-FLORIDA.md`** — 82+ orgs, Tier 1 y Tier 2, + FYSA Club Finder para escalar.
- **`03-TIER1-MENSAJES.md`** — 18 mensajes Tier 1 (decisor + sistema actual + gancho, P1/P2/P3).
- **`06-SECUENCIA-FOLLOWUPS-CLUBES.md`** — follow-ups (FU2 + break-up) EN/ES para FL y TX.
- **`prospectos-raw/_enrich_D_pendientes.md`** — ⏳ **deuda viva**: 2 decisores sin confirmar (PFL, Liga
  Hispana de Tampa). No usar sus nombres como si fueran seguros.

### C) Texas — clubes y ligas
- **`texas/00-LISTA-MAESTRA-TEXAS.md`** — 51 orgs; Tier 1 de 18 con sistema verificado.
- **`texas/03-TIER1-MENSAJES-TX.md`** — 18 mensajes Tier 1 (P1/P2/P3, EN/ES).

### D) Nichos sin plataforma dominante
- **`NICHOS-SIN-PLATAFORMA.md`** — barrido de ~30 verticales buscando dónde NO hay un "GotSport del vertical".
- **`nichos/01-LIGAS-LATINAS-PROSPECTOS.md`** — nicho #1: ligas latinas de fútbol adulto.
- **`nichos/01-LIGAS-LATINAS-MENSAJES.md`** — 🟡 borradores **huérfanos**: no están en ningún motor de envío.
  Materia prima de la **tanda 2**; hay que integrarlos a `MOTOR/emails-nuevos.md` y ajustarlos al framing 2027.
- **`nichos/02-PADEL-PROSPECTOS.md`** — nicho #2: clubes y circuitos de pádel.

---

## 🗡️ Munición de venta (por qué nos compran)

- **`reseñas-teamsnap.md`** · **`reseñas-sportsengine-leagueapps.md`** — quejas reales de los rivales
  convertidas en frases de venta.
- **`TAREAS-REPETITIVAS-RESEARCH.md`** — las tareas que de verdad les duelen a clubes, torneos, coaches y
  familias (research de 4 agentes + Reddit). El mejor material para escribir ganchos.
- **`ANALISIS-COPAFACIL.md`** — teardown de CopaFacil y cómo llegar a sus organizadores.
- **`ANALISIS-SOFASCORE.md`** — teardown de Sofascore.
- **`fuentes/coach-survey.txt`** · **`fuentes/parent-survey.txt`** — encuestas fuente en crudo (National Coach
  Survey, Parenting Survey 2024). Para citar datos duros sin inventarlos.

## 📈 Crecimiento no-outbound

- **`05-CRECIMIENTO-ORGANICO.md`** — playbook de canales orgánicos: video bilingüe, grupos de Facebook, Reddit
  evergreen, SEO, build-in-public, product-led.
- **`PATRONES-CRECIMIENTO-STARTERSTORY.md`** — patrones destilados de 163 casos, aplicados a Widdo.
- **`PLAN-SEO-LOCAL.md`** — qué falta de verdad en SEO (reescrito tras verificar la arquitectura real).
- **`BRIEF-LANDING.md`** — brief para el agente que trabaja la landing de comparación vs incumbentes.

---

## Reglas duras (el resumen; el detalle en `CLAUDE.md`)

- **Nunca inventar contactos.** Marcar confirmado o probable. Contacto vacío > contacto falso.
- **Prohibido** "0% churn", "21 clubes" y "50-70% más barato". Reales: 9 clubes, 3 pagando — y mejor no citar
  cifras en frío.
- **Firma siempre Miguel** (ex jugador profesional de baloncesto). Alwin se menciona en el cuerpo
  ("Alwin is based in Orlando"), nunca firma.
- **Reverificar cada prospecto el día del envío**: plataforma, email vivo, ciudades, temporada. Lección BNA.
- **Solo email.** Cero DMs, WhatsApp o llamadas en frío. Máximo dos toques por prospecto.
- **CAN-SPAM** en todo email frío: identidad + dirección física + línea de baja.
- **No prometer** más de ~250-500 equipos por torneo.
