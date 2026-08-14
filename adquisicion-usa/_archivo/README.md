# _archivo — documentos retirados de adquisición USA

Nada de aquí se borró: todo se movió el **13-ago-2026** durante la depuración de esta carpeta.
Cada archivo lleva en su primera línea un banner con la razón y con qué se sustituye.

**Regla:** si un documento está aquí, **no se usa para operar**. Está guardado por si hace falta
reconstruir el razonamiento, no como referencia. Si vas a citarlo, cita el sustituto.

## Por qué se archivó cada cosa

### Canal de envío descartado (Instantly / Smartlead / try-widdo.com)
El canal vigente es **Brevo con sender `miguel@widdo.co`**, documentado en `../MOTOR/RUNBOOK.md`.
Estos docs mandaban montar otra cosa:

| Archivo | Problema |
|---|---|
| `02-AUTOMATIZACION.md` | Stack MCP + Instantly/Smartlead como infra de envío |
| `04-ENVIO-EMAIL-SETUP.md` | Plataformas de envío y dominio secundario descartados |
| `07-ESTRATEGIA-LANZAMIENTO-JUL2026.md` | Su L99 decía "NUNCA enviar frío desde widdo.co" — contradice el canal vigente |
| `DASHBOARD.html` | Panel que manda montar Instantly |
| `PLAYBOOK-IMPLEMENTACION.html` | Checklist que manda montar Instantly |

### Claims prohibidos o datos falsos
| Archivo | Problema | Vigente |
|---|---|---|
| `01-GUIONES-OUTREACH.md` | Claim "50-70% más barato" sin verificar + firma `[Alwin]` (nunca firma Alwin) | `../emails/` |
| `PLAN-ADQUISICION-USA-LIGAS.md` | Claim prohibido "0% churn" (L11) + plan de 90 días vencido | `../MOTOR/RUNBOOK.md` + `../MOTOR/calendario-envio.md` |
| `torneos-fl-target-list-outreach.md` | Email erróneo de Academy CFL, ya corregido aguas abajo | `../MOTOR/brevo-import.csv` + `../emails/` |

### Eventos y temporadas 2026 — descartados por decisión del 13-ago-2026
Todas las fechas estaban caducadas (FYSA Summit fue el 31-jul; los avisos de "caduca esta semana"
eran de hacía seis semanas). El onboarding de clubes nuevos apunta a **enero 2027**.

- `CALENDARIO-EVENTOS.md` — **su formato es el bueno para reconstruir la v2027** (fecha, ciudad, coste, acción).
- `COMUNIDADES-Y-EVENTOS.md` — duplicado del anterior, formato peor.
- `eventos-widdo-2026-2027.ics` — importable a Google Calendar de esos mismos eventos caducados.
  Es el único sin banner: el formato ICS no admite comentarios sin romperse.

**Excepción que sigue viva:** las ofertas de **Fall 2 / otoño ya escritas (BNA)** siguen válidas y están
en `../emails/07-bna-sports.md`.

### Copia duplicada del copy
- `TANDA-1-FLORIDA-DRAFTS.md` — tercera copia del mismo texto de la tanda 1. El canónico es
  `../emails/01-academy-cfl.md` … `../emails/10-impress-me.md`, que es el único con las correcciones
  de firma del 28-jul y las verificaciones por prospecto.

### Research crudo ya consolidado
El insumo ya está volcado en las listas maestras y en el CSV de envío.

- `prospectos-raw/_raw_*.md` y `_enrich_A/B/C.md` → `../00-LISTA-MAESTRA-FLORIDA.md`
- `texas/_raw_*.md` → `../texas/00-LISTA-MAESTRA-TEXAS.md`
- `torneos/_raw_*.md` → `../torneos/00-TORNEOS-MASTER.md`

> ⚠️ **`prospectos-raw/_enrich_D_pendientes.md` NO está aquí a propósito.** Sigue en su sitio original
> porque es **deuda viva**: dos decisores sin confirmar (PFL, Liga Hispana de Tampa).

### QA de torneos ya ejecutado
Eran planes e instrucciones para correr un QA que **ya se corrió**.

- `torneos/PLAN-TESTS-TORNEOS.md` · `torneos/REPORTE-P0-TESTS.md` · `torneos/OPTIMIZACION-STATUS.md` · `torneos/RUNBOOK-QA-TORNEOS.md`

> Lo que seguía abierto se extrajo antes de archivar: **`../torneos/PENDIENTES-PERFORMANCE.md`**
> (el scheduling sigue siendo cuadrático; correctitud sí verificada). Los 20 escenarios de prueba
> siguen vivos en `../torneos/GUIA-PRUEBAS-TORNEOS.md`.
