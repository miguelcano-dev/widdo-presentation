# Guía de pruebas — Módulo de Torneos

> Escenarios para probar el motor (por UI de organizador o por tests). Cada uno: **config → pasos → qué verificar → qué vigilar**. Ordenado de smoke → formatos → bordes → gaps de riesgo → escala.
> Basado en lo que el motor SÍ soporta (single/double elim, round-robin, grupos, Swiss, grupos→elim) y en los gaps conocidos (`AUDITORIA-MODULO-TORNEOS.md`, `PENDIENTES-PERFORMANCE.md`).

## Cómo correr
- **Manual (UI):** crea el torneo con el Wizard del organizador → crea categoría/bracket → inscribe equipos → genera bracket → registra resultados → mira standings/scheduling.
- **Automático (rápido, dentro de Docker):**
  `docker exec saas_sport-saas_sport_app-1 php artisan test tests/Feature/TournamentScaleTest.php`
  `docker exec saas_sport-saas_sport_app-1 php artisan test tests/Feature/SchedulingServiceTest.php`
- Para un escenario concreto sembrado, pídeselo a `widdo-qa` (usa las factories ya creadas).

---

## Nivel 0 — Smoke test (happy path)
| Campo | Valor |
|---|---|
| Deporte | Soccer |
| Equipos | 8 |
| Formato | Single elimination |
| Ramas/brackets | 1 |
**Verificar:** 8→4→2→1; **7 partidos**; se corona 1 campeón; standings coherentes.

---

## Nivel 1 — Un escenario por formato (8 equipos, chico)
| # | Deporte | Equipos | Formato | Ramas | Qué verificar |
|---|---|---|---|---|---|
| 1 | Soccer | 8 | Single elim | 1 | 7 partidos; +3er puesto = 8; campeón único |
| 2 | Basketball | 8 | Double elim | winners+losers | Cada eliminado tiene 2 derrotas; grand final (+reset si pierde el de winners) |
| 3 | Volleyball | 6 | Round-robin | 1 liga | **15 partidos** (n(n-1)/2); todos vs todos 1 vez; nadie contra sí mismo |
| 4 | Soccer | 8 | Group stage | **2 grupos de 4** | 6 partidos/grupo; standings por grupo; reparto snake equitativo |
| 5 | Basketball | 8 | Swiss | 3 rondas | Sin repetir emparejamiento; floor(n/2) partidos/ronda |
| 6 | Soccer | 8 | Groups→elim | 2 grupos → top 2 avanzan | 4 equipos a eliminación; avanzan por **rank real**, no por conteo |

---

## Nivel 2 — Byes y tamaños impares (bordes)
| # | Deporte | Equipos | Formato | Qué verificar |
|---|---|---|---|---|
| 7 | Soccer | **6** | Single elim | nextPow2=8 → **2 byes**; byes a los mejores seeds; el que pasa por bye avanza bien |
| 8 | Soccer | **5** | Single elim | 3 byes; bracket resuelve sin deadlock |
| 9 | Volleyball | **5** (impar) | Round-robin | Cada ronda 1 equipo descansa; todos juegan n-1 |
| 10 | Basketball | **7** (impar) | Swiss | 1 bye/ronda; **ningún equipo recibe 2 byes** |

---

## Nivel 3 — Seeding
| # | Config | Qué verificar |
|---|---|---|
| 11 | 8 equipos, single elim, **seeds manuales 1-8** | seed1 vs seed8 en R1; seed1 y seed2 solo se cruzan en la final |
> ⚠️ **Gap:** `SEEDING_RATING` = igual que manual y `SEEDING_SNAKE` = aleatorio (NO implementados). **Prueba solo seeding manual/random**; no confíes en rating/snake.

---

## Nivel 4 — Scheduling multi-cancha + constraints
| # | Config | Qué verificar |
|---|---|---|
| 12 | 16 equipos, cualquier formato, **3 canchas, 2 días** | Ninguna cancha con 2 partidos en el mismo slot; ningún equipo en 2 partidos solapados; `max_games_per_day` y `min_rest_between_games` respetados; blackout respetado; todo partido no-bye recibe slot o sale como "unscheduled" con aviso |

---

## Nivel 5 — Torneo real multi-división (varias ramas)
| Categoría | Deporte | Equipos | Formato |
|---|---|---|---|
| U10 | Soccer | 8 | Groups→elim (2×4, top2) |
| U12 | Soccer | 16 | Single elim |
| U14 | Soccer | 12 | Groups→elim (4×3, top2) |
**Verificar:** un mismo torneo con **3 brackets independientes** (así escala Widdo — por categoría, no por torneo entero); cada bracket resuelve su campeón; el calendario global no choca canchas entre categorías.

---

## Nivel 6 — Pagos y check-in
| # | Qué probar | Verificar |
|---|---|---|
| 13 | Inscripción + pago de entry fee (Stripe **test mode**) | Se cobra al club; refund funciona; organizer sin Stripe → error claro |
| 14 | Check-in día de evento | Marcar check-in manual/auto; gate tickets; sync offline si aplica |

---

## Nivel 7 — Live scoring (tiempo real)
| # | Qué probar | Verificar |
|---|---|---|
| 15 | Registrar resultados en vivo | El ganador **avanza en el bracket en tiempo real** (Reverb/WebSocket); standings se actualizan |

---

## Nivel 8 — Gaps de riesgo (probar A PROPÓSITO — se espera fricción)
| # | Escenario | Qué esperar / vigilar |
|---|---|---|
| 16 | **Volleyball con sets** (best-of-5) | ⚠️ El motor **no modela sets**, solo score entero → ver cómo se comporta. Gap conocido. |
| 17 | **Empate en partido de eliminación** | ⚠️ No hay OT/tiebreak modelado → puede no avanzar ganador. Verificar el comportamiento. |
| 18 | **Basketball, empate en standings** | Debe resolverse por tiebreak (no hay empates reales en basket) |
| 19 | **Round-robin de 32 equipos (496 partidos)** | 🔴 **PERF:** el scheduling es lento a esta escala (cuadrático, documentado en `PENDIENTES-PERFORMANCE.md`). Probar para sentir el límite. |

---

## Nivel 9 — Escala
| # | Config | Verificar |
|---|---|---|
| 20 | **~500 equipos** en ~20 categorías de ~25 (formatos mixtos) | Correctitud (cada bracket resuelve) ✓; **vigilar:** tiempo de scheduling y carga de la lista de inscripciones (paginación) |

---

## Matriz rápida de cobertura
**Deportes:** soccer · basketball · volleyball · baseball/softball · flag football
**Formatos:** single elim · double elim · round-robin · grupos · Swiss · grupos→elim
**Tamaños:** 5 · 6 · 7 · 8 · 12 · 16 · 32 · (500 en multi-categoría)
**Opciones:** byes · 3er puesto · seeding manual · multi-cancha · constraints · multi-división

## Regla al probar
Registra por escenario: **config → resultado esperado → resultado real → ✅/❌**. Si algo falla en Nivel 0-7 = bug a reportar (widdo-qa/widdo-tech). Si falla en Nivel 8-9 = gap conocido ya documentado.
