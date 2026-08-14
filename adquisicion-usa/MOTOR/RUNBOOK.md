# RUNBOOK — motor de outreach USA

Una página. Léela antes del primer envío y ténla abierta cada mañana.
Archivos del motor: `brevo-import.csv` (contactos), `calendario-envio.md` (qué sale cada día), `emails-nuevos.md` (los textos).

---

## ANTES DE LA PRIMERA TANDA (una sola vez, hoy)

Sin esto, no se envía nada:

- [x] ~~**Reputación del remitente en Brevo.**~~ ✅ **VERIFICADO POR DNS (28-jul-2026).** Comprobado con consultas reales al DNS de widdo.co:
  - **DKIM: correcto.** Los dos selectores de Brevo existen y apuntan a su infraestructura (`brevo1._domainkey` → `b1.widdo-co.dkim.brevo.com` → `brevo17.dkim.brevo.com`, y `brevo2` igual). Firman como `d=widdo.co`, que es lo que hace falta.
  - **DMARC: correcto.** `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com`. La política `p=none` es solo observación, que es lo correcto para empezar. Brevo recibe los informes.
  - **SPF: `v=spf1 include:_spf.mx.cloudflare.net ~all`** — solo autoriza a Cloudflare, no a Brevo. **Para Brevo NO es un problema**, porque Brevo usa su propio remitente de sobre y la validación de DMARC pasa por el DKIM, que sí está alineado.

- [ ] ⚠️ **ENVIAR SOLO POR BREVO. Nunca por Gmail.** El `emails/README.md` antiguo dice "enviar desde heywiddo@gmail.com como miguel@widdo.co". **Eso ya no vale.** Por esa vía, Gmail firma como `gmail.com` y el SPF solo autoriza a Cloudflare: no hay nada alineado con widdo.co, así que DMARC falla y los filtros lo puntúan como sospechoso. Por Brevo el DKIM sí alinea y pasa. Es la misma dirección de correo pero dos caminos muy distintos: uno llega a la bandeja y el otro a spam.

- [ ] **Comprobar que las respuestas te llegan.** Los MX de widdo.co son de Cloudflare Email Routing, o sea que el correo entrante se reenvía a otro buzón. Mándate un email a miguel@widdo.co y confirma que aterriza donde lo vas a leer. Si las respuestas se pierden, todo el motor no sirve de nada.
- [ ] **Límite de envío.** Comprobar el límite diario de tu plan de Brevo. Aunque el plan permita más, **el tope operativo son 20-25 emails al día por buzón** y el calendario nunca pasa de 18.
- [ ] **Que el "De" sea correcto.** Nombre visible "Miguel Cano – Widdo" y remitente miguel@widdo.co. Que el Responder-a sea el mismo buzón que vas a mirar. Mandarte un email de prueba a ti mismo y a un Gmail cualquiera antes del lote real.
- [x] ~~**Firma sin corchetes.**~~ ✅ **YA RESUELTO (28-jul-2026).** Las 5 firmas incompletas se unificaron con la firma verificada de Miguel Cano. Patrón: firma Miguel siempre; Alwin se menciona **en el cuerpo** cuando aporta (es el que está en Orlando). No queda ningún corchete en ningún email.
- [ ] **Enlace de baja.** Todos los textos acaban con "reply no thanks" o "reply STOP". Brevo además pone su enlace de baja: dejarlo, es obligatorio por ley en EE. UU.

---

## CADA MAÑANA — 15 MINUTOS

1. **Abrir `calendario-envio.md`** y mirar el lote de hoy (nunca más de 18 contactos).
2. **Comprobar los avisos del lote.** Cada día tiene una línea de "antes de enviar". Si un contacto tiene un aviso sin resolver, se cae del lote de hoy y pasa al de mañana. No se envía a ciegas.
3. **Enviar en Brevo.** Filtrar por la etiqueta del día, pegar el asunto y el cuerpo desde `emails-nuevos.md` o del archivo de mensajes que indique la columna ASUNTO, y enviar.
4. **Marcar estado.** En `brevo-import.csv`, cambiar `Por enviar` → `Enviado 2026-08-XX` en las filas de hoy. Dos minutos. Si no se hace, en una semana nadie sabe a quién se escribió.
5. **Mirar la bandeja de entrada** y clasificar lo que haya llegado (ver abajo). Nada más. Cerrar el portátil.

---

## CUANDO ALGUIEN RESPONDE

| Tipo | Cómo se reconoce | Qué haces |
|---|---|---|
| **Interesado** | Pide info, pregunta precio, propone hablar | Responder en menos de 2 horas. Ofrecer **dos huecos concretos** de 1 hora. Estado → `Demo agendada`. |
| **No** | "No gracias", "no nos interesa", "STOP" | Baja inmediata en Brevo. Estado → `No`. **Cero insistencia.** Es un no, no una objeción. |
| **Rebote** | Brevo lo marca como hard bounce | Borrar de la lista ese mismo día. Estado → `Rebote`. Los rebotes acumulados destruyen la reputación del dominio. |
| **Fuera de oficina** | Autorespuesta de vacaciones | No tocar nada. Reprogramar el seguimiento a la fecha de vuelta que diga el mensaje. Estado → `Reintentar DD/MM`. |
| **Sin respuesta** | Silencio | Un seguimiento a los 4-5 días laborables, en el mismo hilo. Un segundo a las 2 semanas. **Y se acabó: máximo dos toques.** |

### La demo: 1 hora máximo

Estructura: 10 min lo que hacen hoy y qué les duele → 30 min Widdo con SUS datos (no una demo genérica) → 10 min precio → 10 min siguiente paso con fecha.

**Precio USA a cotizar** (tabla de Colombia por 2, **a validar en las primeras demos**):

| Tamaño del club | Jugadores | Precio |
|---|---|---|
| Pequeño | hasta 30 | **$400** |
| Mediano | 31 a 60 | **$700** |
| Grande | 61 o más | **$1.000** |

Cómo decirlo: dar el precio con naturalidad y **preguntar qué les parece**. Si en cinco demos nadie parpadea, está bajo. Si todos se atragantan, está alto. Eso es lo que se está midiendo.

**Ojo con lo que se promete:**
- El módulo de torneos aguanta bien hasta ~250-500 equipos por evento. **No prometer nada por encima.**
- Los round-robin grandes van lentos (32 equipos = 7,5 minutos). En la demo enseñar eliminación directa o grupos.
- La visita en persona de Alwin solo se ofrece en el área de Orlando y solo si él lo ha confirmado. Panama City Beach está a 6 horas: ahí no se ofrece.

---

## REGLA DURA: CERO PROSPECCIÓN MANUAL

**Nada de DMs de Instagram ni WhatsApp ni llamadas en frío.** Solo dos cosas: email automatizado y demos ya calificadas.

Un prospecto sin email **no es un prospecto todavía**: es una tarea de enrichment. O se le encuentra el email, o no existe para este motor. Esto no es purismo: es lo único que hace el sistema repetible y lo que evita que se te vaya el día persiguiendo cuentas de Instagram.

---

## LA MÉTRICA QUE IMPORTA: TASA DE RESPUESTA

**Respuestas ÷ emails enviados.** Entre 3% y 8% es bueno en frío. Por debajo del 2%, algo falla (lista, asunto o gancho).

**Ignora las aperturas.** Apple Mail abre los emails por su cuenta para proteger la privacidad: puedes ver un 60% de aperturas y no tener a nadie leyendo. Es un número que engaña y hace tomar malas decisiones.

Los otros dos números que sí valen: **rebotes** (por debajo del 3%; si sube, parar y limpiar la lista) y **demos agendadas** (el único que paga las facturas).

---

## VERIFICACIÓN MANUAL PENDIENTE

### A) Buzones "probables" — validar antes de enviarles (10)
CFSL `office@centralfloridasoccer.com` · BASL `nefl@basl.com` · Jacksonville All Nations `info@allnations.soccer` · Greater Orlando Baseball `jennifer@dssports.com` · Grand Slam `grandslamtournaments@gmail.com` · USA Travel Ball `rick.usatb@yahoo.com` · NFBL `nfbleague@gmail.com` · CFL Pride `cjlee@cflpride.com` · Liga Hispana de Tampa `info@futbollocal.com` · Orlando Cup `registration@orlandosoccercup.com`

### B) Tres riesgos de dominio — resolver o rebota (3)
- **Hialeah City FC:** el email es de hialeahcityclub.com pero la web es hialeahcityfc.com.
- **GSA:** el email es de gsanational.org pero el research apunta a gsabaseball.org.
- **Greater Orlando Baseball:** el email es de dssports.com, que no es la marca.

### C) Sin email — hay que minarlo (13, por orden de valor)
1. **HTX Soccer / Houston Youth Cup** — 275 equipos, GotSport confirmado. **El de mejor retorno de toda la lista.**
2. South Florida Soccer Cup (Pinecrest Premier) — GotSport confirmado
3. Court 23 Basketball — Tier 1 con mensaje escrito, solo tiene teléfono
4. RBI Austin · 5. IVSA Liga Hispana · 6. H-Town Soccer · 7. Fort Worth Vaqueros (los cuatro, Tier 1 de Texas)
8. Tiger Tournaments · 9. MagiCup · 10. DFW World Series · 11. OTR Exposure · 12. ASC Events · 13. Summit Tournaments

### D) Datos que un email afirma sin tenerlos verificados — corregir o borrar la frase (2)
- **USA Travel Ball:** el email dice "runs its events through SincSports" en la primera línea. Sin confirmar. Si no se confirma, borrar esa frase entera.
- **Greater Orlando Baseball:** el email cita "47 fines de semana en 7 condados". Confirmar en su web antes de citarlo.

### E) Colisiones — elegir uno por persona (3)
- **BNA / DK Taylor:** email de ligas (recomendado, sistema confirmado) **vs** email de torneos. Sale uno.
- **SMC / Justin McFarland:** Florida Winter Cup **vs** Florida Extreme Cup. El evento de fecha más próxima.
- **Orlando Cup:** hay dos versiones del mensaje. Comprobar en `emails/TRACKING.csv` si el anterior ya salió.

### F) Bloqueados por tamaño, no por datos (9)
Weston, iFlag, Super6, Disney, USSSA Florida, ASC, Summit, Florida Premier, U90C. Superan lo que el producto aguanta hoy. **No son un problema de research: son un problema de producto.** Se desbloquean con 1-2 casos de éxito de 100-500 equipos, no antes.

### G) El agujero grande: no hay fechas de torneos
No hay fechas de los torneos de los prospectos en ninguna parte. El antiguo calendario solo tenía ferias del sector y se archivó el 13-ago con todo caducado: `../_archivo/CALENDARIO-EVENTOS.md`.

**Actualización 13-ago-2026:** esto deja de ser urgente por ahora. Los eventos y temporadas 2026 quedan **descartados como puerta de entrada**, así que la regla de "3-6 semanas antes del evento" no manda el calendario: el outreach va con framing **"founding organizer, arrancas en enero 2027"**. El research de fechas se retoma al reconstruir el calendario de enero-2027, reusando el formato del doc archivado. **Excepción: las ofertas de Fall 2 / otoño ya escritas (BNA) siguen válidas.**
