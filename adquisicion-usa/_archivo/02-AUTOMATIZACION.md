<!-- ARCHIVADO 13-ago-2026 — stack de envío Instantly/Smartlead/try-widdo.com DESCARTADO — sustituido por MOTOR/RUNBOOK.md (canal vigente: Brevo, sender miguel@widdo.co) -->
> ⚠️ **DOC ARCHIVADO (13-ago-2026).** El stack de envío que describe (Instantly/Smartlead, dominio secundario try-widdo.com) fue descartado.
> **Canal vigente: Brevo con sender `miguel@widdo.co`. Única fuente correcta: `../MOTOR/RUNBOOK.md`.**

# Automatización y MCP — Adquisición USA

Respuesta a: *"¿podemos tener un MCP o algo para automatizar todo?"* → **Sí, en gran parte.** Pero hay que entender qué hace cada pieza.

## Qué es (y qué NO es) un MCP aquí
Un **MCP** conecta a Claude/un agente con herramientas externas (Gmail, Sheets, CRM, scraping) para que **actúe**, no solo sugiera. Es "las manos" del agente.

⚠️ **MCP solo NO basta** para cold email: el envío en frío necesita **deliverability** (dominio secundario, warmup, límites, opt-out) que dan herramientas especializadas. La arquitectura ganadora combina 3 capas:

| Capa | Rol | Herramienta |
|---|---|---|
| **Inteligencia** | research, enriquecer, personalizar, redactar respuestas | Claude + agentes (ya lo usas) |
| **Acciones/datos (MCP)** | leer/escribir Sheets, CRM, Gmail, scraping | MCP servers (abajo) |
| **Envío/deliverability** | mandar secuencias en frío sin quemar dominio | Instantly / Smartlead |

## Stack recomendado (2 opciones)

### Opción A — Lean / barata (para arrancar ya)
- **Google Sheets** = tu CRM y base de prospectos (MCP de Google Workspace).
- **Instantly** o **Smartlead** = envío de cold email con warmup + secuencias + opt-out (CAN-SPAM).
- **Claude + agentes** = research, enriquecer, personalizar mensajes, redactar respuestas.
- **Instagram/WhatsApp** = a mano (Alwin), con los guiones.
- Coste: ~$30-100/mes.

### Opción B — Escala (cuando funcione)
- **Clay** o **Apollo** = enriquecimiento masivo (emails verificados, decisores) + waterfall.
- **Smartlead** = envío multi-inbox a escala.
- **HubSpot free** o **Airtable** = CRM real (MCP disponible).
- **n8n / Make** = orquestador que pega todo (dispara secuencias, mueve datos, notifica).
- **Claude vía MCP** = el cerebro que personaliza y decide.

## Lo que YA tienes (aprovéchalo)
- **MCP a la BD MySQL de Widdo** (`negocio/widdo mcp.txt`, `@benborla29/mcp-server-mysql`, insert/update habilitados). Con esto un agente puede **leer/escribir datos reales de Widdo** (clubes, jugadores, estados) — útil para conectar el pipeline con el producto (ej. detectar leads que ya crearon cuenta, disparar el onboarding).
- **`TOURNAMENT-AGENT-PLAN.md`** — ya define el enfoque de agentes (Prospector, personalización, follow-up, CRM en Sheets). Este workstream lo **ejecuta y extiende** a ligas/clubes.
- **`sales/KNOWLEDGE-BASE.md`** — el "entrenamiento" que todo agente de ventas debe leer antes de actuar (diferenciadores, competidores, pain points).

## MCP servers relevantes (oficiales o de comunidad)
- **Google Workspace / Gmail / Sheets MCP** → leer prospectos, escribir estados, borradores de email.
- **HubSpot MCP** (oficial) → CRM: crear contactos, deals, notas.
- **Airtable MCP** / **Notion MCP** → base de datos de prospectos y pipeline.
- **Firecrawl / Apify MCP** → scraping y enriquecimiento web (buscar el email/decisor que falta).
- **Slack MCP** → notificar al equipo cuando alguien responde/agenda demo.
- (Instantly/Smartlead se integran por su **API** o vía n8n/Make; hay wrappers MCP de comunidad.)

> Nota: la disponibilidad y madurez de cada MCP varía (unos oficiales, otros comunidad). Verifica antes de casarte con uno.

## El embudo en 3 capas (no confundir herramientas)
Cada capa es una herramienta distinta; no compiten:

| Capa | Objetivo | Herramienta | ¿Ahora? |
|---|---|---|---|
| **1. Outreach** | Captar atención en frío | Cold email (orgs con email) + **IG DM/WhatsApp** (ligas hispanas) — Alwin | ✅ Ahora |
| **2. Demo** | Convertir al interesado | Demo lean: **video grabado EN/ES (Loom) + Alwin en vivo**. Escalar con **Karumi.ai** (agente IA que da el demo en videollamada, multilingüe, 24/7) | 🔜 Karumi después |
| **3. Onboarding** | Activar al cliente | **Agente de IA propio de Widdo** que guía paso a paso | ✅ Ya existe |

### Cuándo activar Karumi.ai
Karumi es un **agente IA que da el demo del producto en videollamada** (no es email ni cold-calling). Encaja con el wedge por ser **multilingüe (EN/ES)** e **instantáneo 24/7**. Pero:
- **NO ahora** (0 clientes USA): es sobre-ingeniería y coste (YC, precios de startup — verificar).
- **Actívalo cuando** ya haya **volumen de inbound** y agendar demos sea el cuello de botella. Hasta entonces, demo grabado + Alwin en vivo basta y sobra.

### Ojo con el canal por segmento
Muchos prospectos Tier 1 (ligas hispanas) **solo tienen Instagram/WhatsApp**, no email. Si mandas solo correos, pierdes esa mitad → usa **DM/WhatsApp para hispanos pequeños** y **email para orgs establecidas**.

## El pipeline concreto para Widdo (end-to-end)
```
1. Research (agentes IA)  → filas en Google Sheet (vía MCP)
2. Enriquecer faltantes   → Clay/Apify + agente → completa email/decisor en el Sheet
3. Personalizar mensaje   → agente lee el Sheet + reseñas rivales → escribe DM/email por lead
   ── GATE HUMANO: Alwin revisa lista + mensajes ──
4. Cargar a Instantly/Smartlead → secuencia de 3 toques con warmup y opt-out
5. Link a DEMO ONLINE en el email (self-serve)
6. Respuesta/positiva → MCP crea deal en CRM + avisa por Slack
7. ONBOARDING → lo toma el AGENTE de Widdo (asistente propio)
8. Caso de estudio → agente IA redacta borrador
```

## Ventaja Widdo: demo online + agente de onboarding
Como el **demo es online** y el **onboarding lo hace el agente propio de Widdo**, los dos pasos que normalmente frenan la automatización (demo presencial, migración manual) **ya están resueltos en tu producto**. Eso hace que el embudo USA sea **casi self-serve**: outreach automatizado → demo online → agente onboarda. Alwin solo entra en objeciones y en cerrar ligas grandes (Tier 2).

## Compliance (no saltárselo)
- **CAN-SPAM:** cada email en frío con identidad real, dirección física y baja en 1 clic.
- **Dominio secundario** para cold email (no el dominio principal de Widdo) + warmup 2-3 semanas.
- **Instagram/WhatsApp:** manual. Nada de automatización de DMs.
- Volumen inicial bajo (20-40 emails/día por buzón) e ir subiendo.

## Orden para montarlo
1. Sheet de prospectos (ya tienes los datos) + MCP de Sheets.
2. Comprar dominio secundario + configurar Instantly/Smartlead + warmup.
3. Skill `draft-outreach` para personalizar en lote (con gate humano).
4. Conectar el link de demo online y el agente de onboarding al final del flujo.
5. Cuando convierta, sumar Clay + CRM (Opción B).
