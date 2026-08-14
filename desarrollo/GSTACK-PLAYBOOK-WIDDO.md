# Widdo — Diagnóstico y Playbook (lente founder-mode / estilo Garry Tan)

> **Qué es esto:** un diagnóstico de Widdo escrito *en la lente* de cómo Garry Tan usaría
> Claude Code + gstack, para que Miguel sepa qué hacer. Es un ejercicio de asesoría en su
> estilo — NO una cita ni declaración real de Garry Tan.
> Fecha: 2026-07-16.

---

## 1. Lo que veo cuando aterrizo en Widdo

Voy a ser directo, porque es lo útil.

- **Tienes un producto real, en producción, y $0 de revenue con 21 clubes.** Eso no es un
  problema de código. Tu código está *sobre-construido* para donde estás: 282K LOC, torneos
  con 6 formatos de bracket, suscripciones con dunning, multi-gateway. Eso es lo que
  construye alguien que confunde "hacer la cosa bien" con "hacer la cosa correcta".
- **La velocidad de ingeniería NO es tu cuello de botella.** Ya shippeas rápido (solo/full-time).
  Tu cuello de botella es **distribución y aprendizaje**: nadie paga todavía. El riesgo #1 de
  Widdo no es técnico, es *"¿alguien quiere esto lo suficiente para pagar?"*.
- **Tenías gstack instalado y sin usar.** Eso es como comprar un equipo de ingeniería senior
  y dejarlo en la banca. El valor de gstack no es codear más rápido (ya lo haces) — es
  ponerte una **capa de CEO/Diseño/QA encima** para que dejes de construir cosas que nadie pidió.

**Traducción brutal:** Widdo no necesita más features. Necesita **1 cliente que pague** y un
**loop de aprendizaje** con clientes reales. gstack te sirve para eso *si* usas primero los
engranajes de arriba (CEO/office-hours), no los de abajo (code review).

---

## 2. El error que gstack te obliga a no cometer

Sin engranajes, un agente de IA hace *exactamente lo que le pides* — y tú, en modo maker,
le pides features. Resultado: más superficie de producto, cero validación.

gstack introduce **marchas cognitivas**. La disciplina es: **empieza siempre arriba.**

```
QUÉ construir  →  /office-hours  /plan-ceo-review        ← aquí ganas o pierdes
CÓMO           →  /plan-eng-review  /plan-design-review
CONSTRUIR      →  (Claude codea)
VERIFICAR      →  /review  /qa  /cso
SHIPPEAR       →  /ship  /land-and-deploy  /canary
APRENDER       →  /retro  /learn
```

El 80% de tu apalancamiento está en las dos primeras líneas. El código ya no es el trabajo.

---

## 3. Qué haría YO con Widdo esta semana

No abro el editor. Abro `/office-hours` sobre **la pregunta que decide todo**:

> *"¿Por qué ninguno de los 21 clubes paga, y cuál es la UNA cosa que haría que el primero pague?"*

Y dejaría que las 6 preguntas de forcing me quiten la respuesta cómoda ("falta feature X")
y me lleven a la incómoda (probablemente: *no le he pedido dinero a nadie con un motivo
irresistible, o el wedge de entrada no está afilado*).

Mi hipótesis mirando tu roadmap: **tu caballo de Troya es el QR check-in de torneos para USA**,
no otra feature de clubes. Un torneo trae 20-40 clubes de golpe; el check-in con QR es dolor
real y visible. Eso es distribución, no producto. Está en tu plan y **sin construir**.

---

## 4. Plan de adopción de gstack — 2 semanas, sin fricción

No adoptes los 23 comandos. Adopta **4**, en orden de retorno:

**Semana 1 — mete `/review` y `/qa` a tu loop actual.**
- Cada vez que termines una feature (aunque sea chica): `/review` (staff engineer te caza bugs
  y arregla los obvios) y luego `/qa` (abre navegador real, clickea el flujo, arregla lo que rompe).
- Esto es retorno inmediato y no te cambia el estilo de trabajo. Solo cierra el loop de calidad.
- **Termina la prueba E2E de pago Stripe con `/qa`.** Es tu bloqueador de "cobrar online" y lleva
  pendiente. Un agente en navegador real la cierra.

**Semana 2 — mete `/plan-ceo-review` antes de construir.**
- Antes de tu próxima feature grande (candidata: QR check-in de torneos), corre
  `/office-hours` → `/plan-ceo-review`. Que te reten el alcance ANTES de codear.
- Cierra con `/ship` (corre tests + abre PR) en vez de commitear a mano.

Si después de 2 semanas los 4 comandos te dan valor, sumas `/design-shotgun` (para la UI pública
de torneos, que es lo que ve un desconocido) y `/cso` (seguridad, ya tuviste hallazgos críticos de RBAC).

**Requisito técnico:** Bun instalado (`brew install bun`). Nada más.

---

## 5. Cadencia semanal (lo que haría cada lunes)

- **Lunes:** `/office-hours` sobre la métrica que importa esta semana (clientes que pagan, no LOC).
- **Durante la semana:** construir → `/review` → `/qa` → `/ship` por feature.
- **Viernes:** `/retro` (qué se shippeó, qué aprendiste de clientes) y `/learn` (graba los
  patrones/errores para que el agente no los repita).

La regla de oro de mi propio uso: **mido cambios lógicos que mueven el negocio, no líneas de
código.** La IA infla LOC; no te dejes engañar por sentirte productivo.

---

## 6. Cómo se conecta con lo que YA tienes bien

Acabas de hacer lo correcto con tu setup de Claude (jul 16):
- CLAUDE.md adelgazados (3468→156, 1205→111) → el agente ya no ignora tus reglas.
- Hook que bloquea `migrate:fresh` en prod → red de seguridad determinista.
- 16 skills bajo demanda + auditores auto-descubribles.
- Memoria persistente (`memory/` + MEMORY.md) → tu segundo cerebro.

Eso es la **base**. gstack es la **capa de disciplina de producto** encima. Base sin disciplina
= shippeas rápido en la dirección equivocada. Disciplina sin base = el agente te ignora. Ahora
tienes las dos mitades — úsalas juntas.

---

## 7. Anti-patrones que te van a matar (vigílalos)

1. **Construir features en vez de conseguir clientes.** Si una semana no hablaste con un club
   real ni le pediste dinero, la perdiste.
2. **Usar solo los engranajes de abajo** (`/review`, `/qa`) y saltarte los de arriba
   (`/office-hours`, `/plan-ceo-review`). Eso es pulir la cosa equivocada.
3. **Medir LOC o "features shippeadas"** en vez de clientes que pagan y retención.
4. **Sobre-ingeniería por review agresivo.** `/review` siempre encuentra "gaps"; no persigas
   todos — solo los que afectan correctness o al cliente. El resto es sobre-construcción.

---

## 8. El resumen en una frase

> Widdo no tiene un problema de ingeniería. Tiene un producto en producción y cero clientes que
> pagan. Usa gstack de **arriba hacia abajo** — CEO/office-hours para decidir la UNA cosa, luego
> review/qa/ship para ejecutarla limpia — y ponle toda la máquina a **conseguir el primer cliente
> que pague vía el wedge de torneos**, no a construir la feature #97.

---

### Próximo paso concreto (hoy)
1. `brew install bun`
2. `/office-hours` con la pregunta: *"¿cuál es la UNA cosa que hace que el primer club pague?"*
3. Esta semana: cierra la prueba E2E de Stripe con `/qa`.
