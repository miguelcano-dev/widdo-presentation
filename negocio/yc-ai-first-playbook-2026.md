# Playbook AI-First de Y Combinator (2025-2026) aplicado a Widdo

> **Investigación ejecutada:** Jul 20, 2026 · Deep research con 98 agentes, 16 fuentes, 68 claims extraídos, 25 verificados adversarialmente (3 votos independientes c/u) → **25 confirmados, 0 refutados**. Fuentes casi todas primarias (YC Library, ensayos de partners).
>
> **Memoria asociada:** `memory/yc-ai-first-playbook-jul2026.md` (resumen operativo para sesiones de Claude)

---

## 1. Resumen ejecutivo

El playbook AI-first de YC converge en una tesis: **la IA no es una feature, es el sistema operativo del producto y de la empresa**. En producto: agentes con autonomía parcial (slider), envueltos sobre tools deterministas, con evals verticales profundos como moat. En equipo: tiny teams de ingenieros que dominan LLMs, automatizando growth en vez de contratar. En GTM: top-down a decisores que la IA no reemplaza. En mercado: los agentes verticales pueden ser ~10x el SaaS que disrumpen.

**Para Widdo:** valida la dirección (vertical correcto, tiny team, tools deterministas, GTM top-down) y deja 8 gaps concretos, ejecutables en ~3 días con orquestación multiagente.

---

## 2. Los 10 hallazgos verificados

### 2.1 IA = sistema operativo, no feature ⭐ (tesis central)
Pete Koomen ("Inside YC's AI Playbook", may 27 2026) y Diana Hu ("The Playbook For Building An AI Native Company", abr 2026) lo formulan idéntico: cada workflow, decisión y proceso debe fluir por una capa inteligente que aprende en loop cerrado. YC lo practica internamente: infraestructura propia de agentes con **350+ tools** liderada por Koomen.

> *"Building superintelligence inside a company isn't about adding AI as a feature. It's about making it the operating system the whole organization runs on."* — Koomen

- Fuentes: [Inside YC's AI Playbook](https://www.ycombinator.com/library/Qh-inside-yc-s-ai-playbook) · [AI Native Company Playbook](https://www.ycombinator.com/library/OX-the-playbook-for-building-an-ai-native-company)
- Verificación: 3-0

### 2.2 Arquitectura interna de YC
1. **SQL read-only sobre UNA base de datos consolidada** fue su punto de inflexión ("SQL Access Changes Everything", "One Database to Rule Them All"), incluyendo **desnormalizar datos específicamente para agentes** (GBrain).
2. **Loops de auto-mejora nocturnos** ("Dream Cycle"): los agentes mejoran sin intervención humana; skills creadas vía proceso "Skillify" (principios DRY y MECE).
3. **"Agent-wrapped deterministic tools"**: el agente envuelve herramientas deterministas, no al revés.

- Fuente: [Inside YC's AI Playbook](https://www.ycombinator.com/library/Qh-inside-yc-s-ai-playbook) (capítulos verificados verbatim)
- Verificación: 2-1 + 3-0 · Nota: el acceso SQL es SOLO LECTURA

### 2.3 "AI Horseless Carriages" — framework de producto de Koomen (abr 2025)
La mayoría de apps IA atornillan IA a patrones viejos (ej. Gemini en Gmail) en vez de rediseñar alrededor de la capacidad. Prescripciones:
1. **System prompts editables por los usuarios**, no ocultos y genéricos.
2. Los productos AI-first deben ser **"agent builders", no agentes únicos**: UI para crear agentes del dominio, templates, feedback loops para iterar prompts.
3. El software AI-native debe **HACER el trabajo mundano completo**, no asistir dentro del workflow existente.
4. **"Tools provide the security layer for agents"** — las tools codificadas definen capacidades y fronteras.

- Fuente: [koomen.dev/essays/horseless-carriages](https://koomen.dev/essays/horseless-carriages/)
- Verificación: 3-0 (x3) + 2-1

### 2.4 Karpathy: autonomía parcial, no agentes totales (AI Startup School, jun 2025)
Estamos en "Software 3.0" (lenguaje natural como interfaz), pero el diseño correcto son **"partial autonomy apps" con "autonomy slider"**: el usuario gradúa el control desde asistencias hasta acciones autónomas. Ejemplo: gradiente de Cursor (tab → Cmd+K → Cmd+L → agent mode).

> *"This is the decade of agents... We need humans in the loop. We need to do this carefully."*

- Fuente: [Software Is Changing (Again)](https://www.ycombinator.com/library/MW-andrej-karpathy-software-is-changing-again)
- Verificación: 3-0 (x3)

### 2.5 Agentes verticales ~10x el SaaS que disrumpen (Friedman/Tan, Lightcone)
Capturan presupuesto de **nómina** además de software (el software es fracción pequeña del gasto empresarial). Friedman predice ~300 unicornios de agentes verticales ($300B+).

> *"Literally every company that is a SaaS unicorn, you could imagine there's a vertical AI unicorn equivalent."*

- Fuente: [Vertical AI Agents Could Be 10x Bigger Than SaaS](https://www.ycombinator.com/library/Lt-vertical-ai-agents-could-be-10x-bigger-than-saas)
- Verificación: 3-0 (x3)
- ⚠️ **Matiz Widdo (Miguel, jul 20):** la tesis "reemplaza nómina" aplica a enterprise. En SMB deportivo el admin ES el dueño/familiar → ver §4.8.

### 2.6 El moat son los evals, no el prompting
Las categorías de agentes que parecen saturadas están abiertas: casi todos hacen zero-shot prompting que demoya bien pero no reemplaza trabajo real (<1% penetración acumulada en soporte). Lo que gana: **workflow vertical profundo con eval sets grandes** (caso GigaML: ~30.000 tickets/día para Zepto con ~10.000 test cases específicos). Cómo elegir vertical: *"trabajo administrativo aburrido y repetitivo que el founder conoce de primera mano — ahí probablemente hay una startup de agentes de mil millones."*

- Fuente: [Vertical AI Agents](https://www.ycombinator.com/library/Lt-vertical-ai-agents-could-be-10x-bigger-than-saas) · Verificación: 3-0

### 2.7 GTM: top-down a quien la IA no reemplaza
Vender al equipo que la IA sustituye provoca sabotaje (*"they're going to sabotage it, man. It just does not work"*). Casos: Salient (voz IA cobranza → vendido a bancos top-down), Momentic (agente QA → vendido a ingeniería, saltándose QA).

- Fuente: [Vertical AI Agents](https://www.ycombinator.com/library/Lt-vertical-ai-agents-could-be-10x-bigger-than-saas) · Verificación: 3-0

### 2.8 Equipo y velocidad
- Post-PMF: contratar ingenieros que dominan LLMs para **automatizar bottlenecks de growth**, no armar equipos de sales/CS/ops. Un unicornio de 10 personas "escribiendo evals y prompts" es plausible.
- **Vibe coding** (mar 2025): en W25 ~25% del batch tenía codebases ~95% generadas por IA. Matiz: se sigue necesitando taste, debugging y leer código para escalar.
- **Tokenmaxxing** (may 2026): una persona con agentes de código construye lo que antes requería equipos.
- **Andrew Ng**: velocidad de ejecución = predictor #1 de éxito; *"concreteness buys you speed"*.

- Fuentes: [Tokenmaxxing](https://www.ycombinator.com/library/Pa-tokenmaxxing-how-top-builders-use-ai-to-do-the-work-of-400-engineers) · [Andrew Ng: Building Faster with AI](https://www.ycombinator.com/library/Mf-andrew-ng-building-faster-with-ai) · Vibe Coding Is The Future (Lightcone, mar 2025)
- Verificación: 3-0 (x3) + 2-1

### 2.9 La oportunidad está en la capa de aplicación
Retrospectiva YC dic 2025: la mayor oportunidad IA se mueve de vuelta a las apps sobre modelos, no a la capa de modelos. *"2025 fue el año en que la IA dejó de sentirse caótica y empezó a sentirse construible."*

- Fuente: [What Surprised Us Most in 2025](https://www.ycombinator.com/library/NB-what-surprised-us-most-in-2025) · Verificación: 3-0

### 2.10 Empresa "queryable" por IA (Diana Hu)
AI note takers en reuniones, minimizar DMs/email a favor de canales rastreados, agentes en todos los canales, dashboards centralizados. Hu reporta equipos que cortaron sprint time a la mitad con ~10x output (anécdota autorreportada — citar como tal).

- Fuente: [AI Native Company Playbook](https://www.ycombinator.com/library/OX-the-playbook-for-building-an-ai-native-company) · Verificación: 3-0 (confianza media solo en las cifras)

### Contexto adicional (menos verificado)
- **RFS Summer 2026** incluye: "SaaS Challengers" (la IA colapsó el costo del software 10-100x; un equipo de 5 puede superar a incumbentes en workflows específicos), "AI-Native Service Companies", "Software for Agents", "The AI Operating System for Companies", "Dynamic Software Interfaces".
- **Charlie Warren (Startup School jun 2026)** — mercados para servicios AI-native: trabajo ya externalizado, bajo juicio por tarea, umbral de inteligencia alto, regulación como moat.

---

## 3. Caveats de la investigación
1. Los episodios de agentes verticales (nov 2024) y vibe coding (mar 2025) son anteriores a la ventana pedida, pero YC los reforzó (no retractó) en contenido posterior.
2. Casi todo es **tesis de partners**, no evidencia empírica independiente. Las predicciones (300 unicornios, 10x) están hedgeadas en las propias fuentes.
3. Correcciones de verificación: el caso QA es **Momentic** (no "uMuch"); el SQL de YC es **read-only**; "sign-off del CEO" no aparece en la fuente de GTM.
4. Los Requests for Startups específicos y el pricing explícito de YC quedaron como preguntas abiertas (la implicación de pricing por nómina es inferencia).

---

## 4. Widdo vs el playbook

### ✅ Ya alineado (sin haberlo leído)
| Prescripción YC | Estado en Widdo |
|---|---|
| Vertical = admin aburrido que el founder conoce de primera mano | Exacto: ex jugador pro, padre de jugador, 10+ años con la idea |
| Tiny team + ingenieros que dominan LLMs | 282K LOC por 1 founder orquestando Claude Code/Codex |
| Capa de aplicación sobre modelos de terceros | Claude Haiku vía API, model routing propio |
| Tools deterministas como security layer | 75 tools con confirmed=false/true + scoping multi-tenant |
| GTM top-down a decisores no reemplazados | Se vende al dueño/director y organizador de torneos |
| Automatizar growth con agentes, no headcount | Agentes widdo-ventas/widdo-qa/widdo-tech ya operando |

### ❌ Los 8 gaps (orden de impacto)

**4.1 Reencuadre: de asistente a sistema operativo del club** — El agente hoy es un panel de chat lateral (asistente). Debe EJECUTAR workflows completos: cierre de mes, ciclo de cobranza entero (detectar → recordar → escalar → reportar), armado completo de torneo. Los 13 workflow patterns del prompt → workflows ejecutables end-to-end.

**4.2 Evals del dominio = el moat** — No existen. Construir eval set desde conversaciones reales de producción: cobros, asistencia, torneos, roles, 3 idiomas. Base ya existente: `TournamentAssistantLifecycleTest` (ciclo IA sin LLM) — generalizar ese patrón. Es el gap que más se encarece con el tiempo.

**4.3 Autonomy slider explícito** — Hoy todo requiere confirmación. Niveles por módulo/rol: sugerir → borrador → ejecutar con confirmación → autónomo. Primer caso: recordatorios de pago autónomos nocturnos con reporte matutino.

**4.4 Prompt editable por club** — Las 27 secciones están ocultas. Dar al director una sección propia: tono, reglas del club, políticas de cobro.

**4.5 Loop cerrado** — Daily brief hoy informa; debe proponer y ejecutar acciones (con el slider). Job nocturno tipo "dream cycle": el agente analiza el club de madrugada y amanece con acciones preparadas. Base buena: AgentClubMemory + auto-resumen cada 20 mensajes.

**4.6 SQL read-only scoped** — Evolucionar `advancedQuery` (5 templates) hacia consulta read-only más amplia scoped por club (patrón YC). ⚠️ Prerequisito: cerrar hallazgos de la auditoría multi-tenant de jul 17.

**4.7 Agent builder** — Agentes nombrados por función (cobranza, comunicación con padres) con templates que el director activa. Fase posterior.

**4.8 Pricing/mensaje (corregido por Miguel, jul 20)** — NO usar "reemplaza a tu administrador": en este mercado el admin es el dueño, un familiar o voluntario — nadie se despide a sí mismo. Ancla correcta: **tiempo devuelto al dueño** ("deja de perseguir pagos a las 10pm") + **plata recuperada** (morosidad que baja el agente de cobranza — medible: "Widdo te recuperó $X este mes"). El precio se mantiene; cambia el argumento de valor. Bonus: comprador = beneficiado directo → cero riesgo de sabotaje.

---

## 5. Ejecución: ~3 días con orquestación multiagente

| Día | Trabajo |
|---|---|
| 1 | **En paralelo:** prompt editable por club (migración + UI + inyección) · extracción de conversaciones reales de prod · harness de evals generalizando `TournamentAssistantLifecycleTest` |
| 2 | Autonomy slider (secuencial — toca el core: `ClubAssistantService`, `ClubAssistantToolExecutor`, system prompt) · curaduría de evals en paralelo |
| 3 | Workflows e2e (cobranza autónoma) sobre el slider ya mergeado · QA manual de Miguel · deploy |

**Por qué no menos:** slider y workflows tocan los mismos archivos (serial obligado o worktrees con costo de merge); el eval set depende de la extracción previa; y el QA manual de Miguel sobre acciones autónomas de cobro en producción no se delega.

**Regla de secuencia:** todo se ataca solo si sirve al foco actual (growth USA, torneo FL). El agente que arma torneos por chat = arma de venta/demo primero. Filtro vigente: *"¿esto me ayuda a crecer esta semana?"*

**Narrativa (0 código, ya):** Widdo = "the AI-native operating system for youth sports clubs". Encaja en la RFS "SaaS Challengers" si se aplica a YC.

---

## 6. Preguntas abiertas
1. ¿RFS 2025-2026 menciona deportes, gestión de comunidades o pagos recurrentes?
2. ¿Guía explícita de pricing de YC para agentes verticales (por resultado, por trabajo, por asiento)?
3. ¿Qué métricas usa YC para evaluar startups AI-first en 2026 (retención de uso del agente, % workflows autónomos) vs MRR/churn clásicos?
4. ¿Cómo se adapta "reemplaza al equipo" a SMB donde el equipo es el dueño? (parcialmente respondida en §4.8)

## 7. Fuentes primarias
- [Inside YC's AI Playbook](https://www.ycombinator.com/library/Qh-inside-yc-s-ai-playbook) — Koomen, may 27 2026
- [AI Horseless Carriages](https://koomen.dev/essays/horseless-carriages/) — Koomen, abr 2025
- [Vertical AI Agents Could Be 10x Bigger Than SaaS](https://www.ycombinator.com/library/Lt-vertical-ai-agents-could-be-10x-bigger-than-saas) — Friedman/Tan, nov 2024
- [Andrej Karpathy: Software Is Changing (Again)](https://www.ycombinator.com/library/MW-andrej-karpathy-software-is-changing-again) — jun 2025
- [The Playbook For Building An AI Native Company](https://www.ycombinator.com/library/OX-the-playbook-for-building-an-ai-native-company) — Diana Hu, abr 2026
- [Tokenmaxxing](https://www.ycombinator.com/library/Pa-tokenmaxxing-how-top-builders-use-ai-to-do-the-work-of-400-engineers) — may 2026
- [Andrew Ng: Building Faster with AI](https://www.ycombinator.com/library/Mf-andrew-ng-building-faster-with-ai) — jun 2025
- [What Surprised Us Most in 2025](https://www.ycombinator.com/library/NB-what-surprised-us-most-in-2025) — dic 2025
- [How to Build an AI-Native Services Company](https://www.ycombinator.com/library/Rk-how-to-build-an-ai-native-services-company) — jun 2026
- [Requests for Startups](https://www.ycombinator.com/rfs) — Summer 2026
- [AI Startup School (carousel, 15 talks)](https://www.ycombinator.com/library/carousel/AI%20Startup%20School)
