# Torneos y ligas grandes — Master (FL + TX) · el segmento de mayor valor

> ICP ordenado por capacidad de pago: **organizadores de torneos / operadores de liga grande** cobran inscripciones a escala (cientos de equipos × $250-830/equipo) = whale accounts. Fuente: `../_archivo/torneos/_raw_florida_torneos.md`, `../_archivo/torneos/_raw_texas_torneos.md` (crudo, archivado). 28 orgs verificadas.

---

## ⚠️ Lectura estratégica antes de contactar

**Gate de producto RESUELTO** (ver `AUDITORIA-MODULO-TORNEOS.md`): el módulo de torneos es real y completo, y **aguanta con honestidad hasta ~250-500 equipos/torneo**. Weston (1,200+) aún no (necesita colas + optimización + load testing, semanas). Esto reordena las capas:

**✅ Alcanzables YA (hasta ~500 equipos) — incluye el borde inferior de las "grandes":**
HTX Houston Youth Cup (275), SMC/Texas Gold Cup (251-295), y todo el sweet-spot. → Pitcheables ahora **con piloto cuidadoso** (empezar powereando su evento, Fase 0 del `PLAN-WIDDO-CUP.md`).

**🐋 Ballenas reales (1,000+ equipos) — NO pitchear aún:**
Weston Cup (1,200+), iFlag (1,400+), Super6 (2,000+/año), USSSA FL/TX, Disney, Florida Premier FC, U90C, ASC/Summit.
→ El producto NO está probado a ese volumen (scheduling síncrono/cuadrático + endpoints sin paginar). Requiere el **camino mínimo de la auditoría** antes de pitchear. Tratar como Enterprise/custom a futuro, no cold email ahora.

**⭐ Sweet spot (100-500 equipos + DECISOR con nombre + usan GotSport/AES = reemplazo claro): EMPEZAR AQUÍ**
| Organización | Estado | Deporte | Decisor | Contacto | Sistema → gancho |
|---|---|---|---|---|---|
| **SMC Soccer** (Winter Cup FL + Texas Gold Cup) | FL+TX | Soccer | Justin McFarland (FL) · Zarin Santos (TX) | justin@smcsoccer.com · zarin@smcsoccer.com | GotSport → 1 relación = 45+ eventos en 13 estados |
| **Dallas Skyline Juniors** | TX | Volleyball | Jon T. Rye (Tourn. Dir.) | jonrye@skylinejuniors.com · (214) 514-1717 | Vstar/AES → alternativa más barata + bilingüe |
| **Court 23 Basketball** | TX | Basketball | Ricky Talkington | (972) 571-0559 | Formulario propio → plataforma real con pagos |
| **GCFYSL** (Greater Central FL Youth Soccer) | FL | Soccer | Mike Sroka (President) | admin@gcfsoccer.com | GotSport → liga multi-división, en español |
| **The Florida League** | FL | Soccer | "Tom" (President) | tom@thefloridaleague.com | GotSport → la liga más grande sur FL |
| **Texas Sports Group** | TX | Soccer | "director" | director@texassportsgroup.com | 8 torneos + liga → consolida en una |
| **JVC Tournaments** | FL | Volleyball | no visible | JVCtournaments@gmail.com · 719-201-7323 | SportWrench → ~300 eq/evento |
| **Alodia Basketball** | TX | Basketball | no visible | tournaments@alodiaconsulting.com · 281-255-2552 | SportsEngine+Exposure → une torneos+ligas |
| **Rated Sports Group** | TX | Soccer | no visible | support@ratedsports.com · (805) 741-3476 | GotSport → Texas Super Cup |
| **Orlando Cup** | FL | Soccer | "Thiago" | registration@orlandosoccercup.com | GotSport → torneo internacional LATAM |

**🌱 Menor escala / entrada fácil:** MagiCup, Tiger Tournaments, Big Time Hoops, DFW World Series, South FL Soccer Cup.

---

## Incumbentes a desplazar (por deporte)
| Deporte | Incumbente dominante | Nº de prospectos que lo usan | Gancho Widdo |
|---|---|---|---|
| **Soccer** | **GotSport** | ~11 (Weston, SMC, U90C, HTX, TFL, GCFYSL, Orlando Cup, Disney, Rated, South FL Cup…) | Reemplazo directo, más barato + bilingüe + soporte real |
| **Volleyball** | **Advanced Event Systems (AES)** / SportWrench | ASC, Summit, Dallas Skyline, JVC | Alternativa moderna sin el lock-in de AES |
| **Basketball** | **Exposure Events** + SportsEngine | Super6, OTR, Alodia, Big Time | Registro+pagos+brackets sin app fragmentada |
| **Baseball/Softball** | **USSSA** (sancionador) | USSSA FL/TX, DFW World Series | Complemento/alternativa para eventos no-sancionados |

---

## Por qué este segmento cambia el plan
1. **Valor por cierre 10-50× un club suelto:** un torneo de 275 equipos × $300 = ~$82k que hoy pasa por GotSport. Widdo capturando eso (o su gestión) es una cuenta enterprise real.
2. **GotSport es un blanco único:** domina soccer y todos lo odian por lo mismo (caro, anticuado). Un mensaje de "alternativa a GotSport" sirve para ~11 prospectos a la vez.
3. **SMC = palanca:** opera FL + TX + 11 estados más. Un solo design partner ahí = escaparate nacional.
4. **QA ejecutado, gate a medias:** el módulo soporta brackets/pagos/check-in/live scoring (`AUDITORIA-MODULO-TORNEOS.md`) y el scheduler es **funcionalmente correcto** (10/10). Pero sigue **lento a escala** (round-robin 32 = 496 fixtures → 7,5 min síncrono) y eso **no está resuelto**. Sweet-spot en eliminación/grupos pitcheable ya; antes de eventos medianos-grandes o round-robins grandes hace falta el fix de colas + optimización de scheduling. Qué se puede prometer y qué no: **`PENDIENTES-PERFORMANCE.md`**.

**Recomendación:** el segmento torneos pasa a ser **Tier 1 real** (por encima de clubes sueltos). Empezar por los ⭐ sweet-spot con decisor nombrado (SMC, Dallas Skyline, Court 23, GCFYSL, TFL, Texas Sports Group).
