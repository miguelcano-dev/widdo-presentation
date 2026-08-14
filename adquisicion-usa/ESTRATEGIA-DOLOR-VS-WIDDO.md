# Dolor del mercado vs. Widdo — comparativa y estrategia de llegada

**Derivado de:** `TAREAS-REPETITIVAS-RESEARCH.md` (research de 4 agentes + capa Reddit, 31 jul 2026).
**Complementa, no reemplaza:** `07-ESTRATEGIA-LANZAMIENTO-JUL2026.md` (gates, canales, límites legales)
y `LANZAMIENTO-GO-NOGO.html` (checklist ejecutable).
**Fecha:** 31 jul 2026 · revisado 14 ago 2026

---

## 1. Comparativa: cada dolor del mercado contra lo que Widdo tiene HOY

| Dolor (orden del research) | ¿Widdo lo cubre? | Nota honesta |
|---|---|---|
| Perseguir pagos mensuales | ✅ **Estrella** | Cobranza autónoma + daily brief. Hueco de CATEGORÍA: nadie lo tiene |
| Jugador activo sin cobro asociado | ✅ | Embudo debería→facturado→recaudado (caso ABA). Sports Connect lo rompe de fábrica |
| Conciliar lo cobrado vs. el banco | ✅ | Stripe directo a la cuenta del club + daily brief con anomalías |
| Cambio de horario que no llega al padre | ✅ | Push nativo multi-rol. Crossbar/GotSport/Tourney Machine fallan aquí |
| RSVP / confirmar asistencia | ✅/⚠️ | Asistencia digital sí. **Verificar**: ¿alerta SOLO a quien no confirmó? Es el feature más celebrado de PlayMetrics en Reddit |
| Waivers en carpeta física | ✅ | Inscripción pública + waivers digitales + check-in |
| Brackets de torneo (6-8 h + 15-20 h) | ✅ | 6 formatos. Sweet spot ≤250-500 equipos; NO vender a ballenas |
| Cobro de inscripción de torneo | ✅ **Estrella** | Stripe Connect, 0% fee, dinero directo. GotSport cobra $20/equipo hasta en cheques |
| Resultados en papel | ✅ | Live scoring — la demo más vistosa |
| Fees ocultos / anuncios | ✅ | Precio transparente, cero ads. SportsEngine tiene demanda colectiva encima |
| Multi-hijo / multi-club | ✅ | Cuenta familiar. TeamSnap ni combina facturas de hermanos |
| Compliance FYSA/SafeSport | ⚠️ | Construido pero SIN rutas expuestas → roadmap, **no demo** |
| Modalidad de pago por jugador (trimestral vs mensual) | 🔴 | **Falta.** Detectado con ABA: se duplican cobros |
| Árbitros, voluntarios por turnos, hoteles | ❌ | No prometer. Territorio Arbiter/Assignr/SignUpGenius/EventConnect |

**Ventaja neta:** en los tres dolores más caros (cobranza, conciliación, comunicación) Widdo no
compite por features — compite contra Excel + Venmo + carpeta física, o contra software que
demostrablemente falla ahí.

---

## 2. Estrategia de llegada

### Prerrequisitos (sin esto, cualquier outreach quema prospectos)
1. **Gate 0 — Stripe live** → `GATE-0-STRIPE-LIVE.md`
2. Link de agendamiento en la landing (`DEMO_URL` apunta a `#contact`)
3. ✅ Email `miguel@widdo.co` — resuelto (Brevo + Gmail Send-As)

### Punta de lanza: TORNEOS, no clubes
Por qué: ciclo de venta corto (evento con fecha), dolor agudo y fechado, gancho verificable e
indignante, y cada torneo arrastra 30-100 clubes al ecosistema (efecto de red propio).
- Prospectos: `torneos/00-TORNEOS-MASTER.md`; mensajes en `torneos/01-MENSAJES-TORNEOS.md`
- **Timing:** 3-6 semanas antes de su evento
- **Target:** medianos (tipo Champions Cup). **NO** Weston Cup (1.200 equipos, fuera de capacidad probada)

### Clubes, por orden de facilidad
1. **Sin plataforma** (Google Forms + Venmo + GroupMe) — sin switching cost. Gancho: la carpeta
   física y la llamada incómoda del día 5. Ver `NICHOS-SIN-PLATAFORMA.md`
2. **Cuota mensual recurrente en Jersey Watch / Sports Connect / TeamSnap** — fuga de dinero
   medible, y su plataforma literalmente no factura mensualidades
3. **Soccer FL en GotSport** — pitch de **CONVIVENCIA**: *"Keep GotSport for FYSA registration.
   Run your club on Widdo."* Nunca "cámbiate"
4. **NO perseguir:** clubes contentos en PlayMetrics (5.0, quejas de refinamiento); béisbol
   (GameChanger percibido como el 99% del mercado)

### Orden de los ganchos en el mensaje
1. Abrir con la pregunta, no con el producto: *"Who on your staff sends the 'your payment was
   due on the 1st' message every month?"*
2. Validar con cifra: 37 min/día (Aspen) o 28% pierde comunicaciones (PlayMetrics)
3. Cerrar con retención: 72% vs 58% renuevan → le vendes renovaciones, no software
4. Anti-incumbente SOLO si el prospecto menciona su plataforma (ads, soporte, fees ocultos)

### Canales
- **Cold email 1-a-1 + LinkedIn el mismo día** (el prospecto googlea "Miguel Cano Widdo" antes
  de responder). Skills `draft-outreach` / `enrich-prospecto`
- **Grupos de Facebook** — donde están los organizadores hispanos HOY (FB > Reddit para ese segmento)
- **Reddit orgánico, NUNCA spam:** r/YouthSportsDirectors tiene un megathread de plataformas que
  dice explícitamente *"this thread is not a place for vendor reps"*. Jugada correcta: participar
  como founder transparente contando el caso ABA (embudo de revenue), no vendiendo. Las
  recomendaciones orgánicas mueven adopción en este mercado (así crece Spond)
- **G2/Capterra:** 30 min que pagan en meses — los LLMs citan Capterra al recomendar herramientas
- **Dato propietario:** medir horas admin reales con los clubes propios y publicarlo. No existe
  esa encuesta pública; te vuelve la fuente citada

### Armas nuevas que salieron del research
- Los clubes YA le ponen precio al trabajo admin: **25-30% de descuento** al team manager
  voluntario. Widdo cuesta menos que ese descuento
- **Un coach pidió textualmente el daily brief de Widdo en Reddit** sin saber que existe
  ("*It be glorious if ChatGPT could... give me an executive level brief every day*") — abre
  cualquier demo de Widdo AI
- Demo de lluvia para torneos FL: *"rebuild the bracket, tell 300 coaches, issue refunds — one screen"*

### Secuencia sugerida (4 semanas)
| Semana | Qué |
|---|---|
| 1 | Cerrar Gate 0 + link de agendamiento. Verificar el hueco de RSVP y los fallos de QA de acuerdos de pago |
| 2 | Tanda 1 de torneos FL (reverificada el día del envío) + primer post orgánico |
| 3 | Tanda de clubes sin plataforma + seguimientos de torneos |
| 4 | Medir respuesta POR GANCHO (cobranza vs. fees vs. comunicación) y doblar en el que convierta |

---

## 3. Riesgo principal: prometer de más

No demo de compliance (sin rutas), no árbitros, no voluntarios por turnos, no hoteles, no
torneos de 1.000+ equipos, y **no usar la cifra ABA de $12,5M** hasta validarla con la
administradora. Un prospecto que descubre una promesa vacía en la demo no vuelve.
