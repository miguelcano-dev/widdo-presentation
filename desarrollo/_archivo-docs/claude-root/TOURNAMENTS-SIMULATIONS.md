# Widdo Tournaments — Simulaciones Completas

> 6 simulaciones paso a paso que muestran cómo funciona cada fase del sistema.
> Usar como referencia de UX esperado al implementar.
> Índice general: ver `TOURNAMENTS-INDEX.md`

---

# SIMULACIÓN COMPLETA: TORNEO DE FÚTBOL SUB-15

## "Copa Antioquia Sub-15 Masculino 2026"

Simulación paso a paso de cómo un organizador usa Widdo Tournaments para crear y gestionar un torneo de fútbol. Cada paso indica qué fase/sub-fase lo habilita.

---

### CAPÍTULO 1: REGISTRO Y CONFIGURACIÓN

#### 1.1 — Juan Martínez se registra como organizador (Fase 0)

Juan Martínez dirige "Copa T&E", una empresa que organiza torneos departamentales. Entra a widdo.co/register.

```
Pantalla de registro:
┌──────────────────────────────────────────────────┐
│  Bienvenido a Widdo                              │
│                                                  │
│  ¿Qué quieres hacer?                            │
│                                                  │
│  ┌──────────────────┐  ┌──────────────────┐     │
│  │  Gestionar       │  │  Organizar       │     │
│  │  mi club          │  │  torneos         │     │
│  └──────────────────┘  └──────────────────┘     │
│                                                  │
│  [Ambos]                                         │
└──────────────────────────────────────────────────┘
```

Juan selecciona "Organizar torneos". Llena:
- Nombre: Juan Martínez
- Email: juan@copate.co
- Contraseña: ****
- Organización: "Copa T&E"

**Backend crea:** User + PlaOrganizer + user_club_role (role='organizer', club_id=NULL)

Juan entra al dashboard de organizador:
```
┌──────────────────────────────────────────────────┐
│  Copa T&E — Dashboard Organizador                │
│                                                  │
│  Resumen                                         │
│  Torneos activos: 0                              │
│  Inscripciones pendientes: 0                     │
│  Pagos recibidos: $0                             │
│                                                  │
│  [+ Crear Torneo]                                │
└──────────────────────────────────────────────────┘
```

#### 1.2 — Crear torneo (Fase 1)

Juan hace clic en "Crear Torneo". Se abre el wizard:

**Paso 1: Deporte y Tipo** (Fase 1)
```
Deporte: Fútbol
Tipo: Equipos
Formato: Fase de grupos + Eliminación directa
```

**Paso 2: Información Básica** (ya existe)
```
Nombre: Copa Antioquia Sub-15 Masculino 2026
Descripción: Torneo departamental de fútbol...
Fecha inicio: 15 de marzo 2026
Fecha fin: 26 de abril 2026
Ubicación: Canchas Sintéticas del Estadio, Medellín
Fecha límite inscripción: 5 de marzo 2026
```

**Paso 3: Categorías** (ya existe + adaptado Fase 1)
```
Categoría 1:
  Nombre: Sub-15 Masculino
  Género: Masculino
  Año nacimiento: 2011-2012
  Permite menores: Sí (máx 2 por equipo, nacidos 2013)
  Máx equipos: 24
  Mín equipos: 8
  Jugadores por equipo: 18 (mín 11)
```

**Paso 4: Documentos Requeridos** (ya existe)
```
✅ Registro Civil / TI (obligatorio)
✅ Certificado EPS vigente (obligatorio)
✅ Foto tipo documento (obligatorio)
✅ Autorización de padres (obligatorio, menores de 14)
```

**Paso 5: Staff** (ya existe)
```
Director del torneo: Juan Martínez
Comité disciplinario: María López
```

**Paso 6: Inscripción y Pagos** (Fase 6)
```
Cobrar inscripción: ✅ Sí
Monto: $200.000 COP por equipo
Moneda: COP
Auto-aprobar al pagar: Sí
```

**Paso 7: Premios** (Fase 1)
```
1°: Trofeo + $2.000.000 COP
2°: Trofeo + $1.000.000 COP
3°: Medallas
Goleador: Balón de oro + guayos
```

**Paso 8: Reglamento** (Fase 1)
```
Formato: PDF subido
Reglas especiales:
  - 2 tiempos de 30 minutos (fase grupos)
  - 2 tiempos de 35 minutos (eliminación)
  - Penales en eliminación si empate
  - Máximo 5 cambios por partido
  - Tarjeta roja = suspensión 1 partido mínimo
```

**Paso 9: Revisión y Publicar**

Juan revisa todo y hace clic en "Crear Torneo". Estado: **Borrador**.

---

### CAPÍTULO 2: CONVOCATORIA E INSCRIPCIONES

#### 2.1 — Invitar clubes (Fase 2)

Juan abre el torneo y va al tab "Invitaciones".

**Invitar clubes de Widdo:**
Juan busca "Antioquia" y aparecen 20 clubes registrados en Widdo en el departamento:
```
┌──────────────────────────────────────────────────┐
│  Buscar clubes Widdo: [Antioquia          ] 🔍   │
│                                                  │
│  ✅ Club Siempre Fuertes (Medellín) — 45 jugadores│
│  ✅ Independiente Medellín Sub (Medellín) — 60     │
│  ✅ Academia Envigado (Envigado) — 38              │
│  ✅ Club Deportivo Itagüí (Itagüí) — 32           │
│  ... 16 más                                      │
│                                                  │
│  [Invitar 20 seleccionados]                      │
└──────────────────────────────────────────────────┘
```

Backend envía 20 emails con link personalizado + botón "Ver Torneo".

**Invitar clubes externos (no están en Widdo):**
Juan pega una lista de 10 emails de clubes que conoce:
```
contacto@clubrionegro.com, info@academiacaldas.co, ...
```

Backend envía 10 emails con link de inscripción pública: `widdo.co/inscribirse/copa-antioquia-sub15-2026?token=abc123`

Juan también copia el link público y lo comparte en WhatsApp/Instagram.

**Estado del torneo cambia a: Abierto (inscripciones abiertas).**

#### 2.2 — Los clubes se inscriben (Fase 2)

**Club Widdo (Club Siempre Fuertes):**

El owner del club, Diego, ve la invitación en su dashboard:
```
┌──────────────────────────────────────────────────┐
│  Invitaciones a Torneos                          │
│                                                  │
│  Copa Antioquia Sub-15 Masculino 2026            │
│  Fútbol — 15 mar al 26 abr — Medellín           │
│  Inscripción: $200.000 COP                       │
│  Plazas: 24 equipos                              │
│                                                  │
│  [Ver Detalle]  [Inscribir mi Equipo]            │
└──────────────────────────────────────────────────┘
```

Diego hace clic en "Inscribir mi Equipo":

```
Paso 1: Seleccionar categoría
→ Sub-15 Masculino (nacidos 2011-2012)

Paso 2: Nombre del equipo para el torneo
→ "Siempre Fuertes FC" (puede ser diferente al nombre del club)

Paso 3: Seleccionar jugadores
┌──────────────────────────────────────────────────┐
│  Jugadores elegibles de tu club:                  │
│                                                  │
│  ✅ Juan Pérez — 12/03/2011 (14 años) ✓ en rango │
│  ✅ Carlos López — 08/07/2011 (14 años) ✓         │
│  ✅ Pedro Gómez — 22/11/2012 (13 años) ✓          │
│  ✅ Santiago Torres — 15/03/2013 (12 años) ⚠️ menor│
│  ... 14 más                                      │
│                                                  │
│  18 / 18 seleccionados (2 menores de 18 permitidos)│
│                                                  │
│  [Confirmar Plantilla]                           │
└──────────────────────────────────────────────────┘
```

Paso 4: Pago
→ Wompi widget se carga → Diego paga $200.000 COP
→ Pago confirmado → Inscripción automáticamente aprobada

```
✅ ¡Inscripción completada!
Tu equipo "Siempre Fuertes FC" está inscrito en la Copa Antioquia Sub-15.
Documentos pendientes: 3 jugadores (EPS)
Te notificaremos cuando el fixture esté listo.
```

**Club externo (Club Rionegro — no está en Widdo):**

El contacto del Club Rionegro recibe email con link. Hace clic:
```
widdo.co/inscribirse/copa-antioquia-sub15-2026?token=xyz789
```

Ve la página pública del torneo:
```
┌──────────────────────────────────────────────────┐
│  Copa Antioquia Sub-15 Masculino 2026            │
│  Fútbol — 15 mar al 26 abr — Medellín           │
│  Organiza: Copa T&E                               │
│                                                  │
│  Categoría: Sub-15 Masculino                      │
│  Equipos inscritos: 8 / 24                        │
│  Inscripción: $200.000 COP                        │
│                                                  │
│  [Inscribir mi Equipo →]                          │
└──────────────────────────────────────────────────┘
```

Hace clic y como no tiene cuenta:
```
1. Registro rápido → Crea cuenta en Widdo (plan gratis)
2. Crear club → "Club Deportivo Rionegro", ciudad, logo
3. Agregar jugadores → Nombre, documento, fecha nacimiento (18 jugadores)
4. Seleccionar categoría → Sub-15 Masculino
5. Pagar → $200.000 COP
6. ✅ Inscrito
```

**El Club Rionegro ahora está en Widdo con plan gratis.** Puede usar Widdo para gestionar su club. Si le gusta → upgrade a plan pago. **Canal de adquisición a costo $0.**

#### 2.3 — El organizador gestiona inscripciones (Fase 2 + Agente IA Fase 3)

Después de 2 semanas, Juan abre su dashboard:

```
Inscripciones — Copa Antioquia Sub-15
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sub-15 Masculino: 22 / 24 equipos

✅ Aprobados (20):
  Club Siempre Fuertes — pagado, docs 15/18 ✅
  Independiente Medellín Sub — pagado, docs 18/18 ✅
  Academia Envigado — pagado, docs 16/18 ⚠️
  Club Deportivo Itagüí — pagado, docs 18/18 ✅
  ... 16 más

⏳ Pendientes (2):
  Club Caldas — pago pendiente
  Club Girardota — docs incompletos (4/18)

Recaudado: $4.000.000 COP
Pendiente: $400.000 COP
```

**Juan habla con el agente IA:**
```
Juan:    "¿Cuántos clubes tienen documentos pendientes?"

Agente:  "8 clubes tienen documentos incompletos:
          • Club Siempre Fuertes: 3 EPS faltantes
          • Academia Envigado: 2 fotos faltantes
          ... (6 más)

          ¿Quieres que envíe recordatorio masivo?"

Juan:    "Sí, envía recordatorio a todos los que les faltan docs"

Agente:  "✅ Enviados 8 emails de recordatorio con detalle de
          documentos faltantes por jugador."
```

```
Juan:    "Dale plazo hasta mañana a Club Caldas. Si no pagan, quedan fuera."

Agente:  "✅ Envié ultimátum a Club Caldas:
          'Tienen hasta viernes 6 de marzo a las 6pm para
          completar el pago. De lo contrario, su inscripción
          será cancelada.'

          Te aviso mañana a las 6pm."
```

Al día siguiente:
```
Agente:  "⏰ Resultado del ultimátum:
          ✅ Club Caldas pagó ($200.000)

          22 equipos confirmados. ¿Cierro inscripciones?"

Juan:    "Sí, cierra."

Agente:  "✅ Inscripciones cerradas. 22 equipos confirmados.
          Total recaudado: $4.400.000 COP
          Comisión Widdo (5%): $220.000
          Neto para ti: $4.180.000 COP

          ¿Quieres que genere el fixture?"
```

---

### CAPÍTULO 3: GENERACIÓN DEL FIXTURE

#### 3.1 — Generar fase de grupos (Fase 3)

```
Juan:    "Genera el fixture. Quiero fase de grupos con clasificación
          a eliminación. Los mejores clasifican a cuartos."

Agente:  "Con 22 equipos, opciones para fase de grupos:

          A) 4 grupos de 5 + 1 grupo de 2
             → Desbalanceado (un grupo juega 1 partido, otros juegan 10)

          B) 6 grupos: 4 de 4 + 2 de 3
             → Clasifican 12 (2 por grupo) → octavos
             ⚠️ Grupos de 3 tienen menos partidos

          C) 4 grupos de 5 + descartar 2 equipos en waitlist
             → 20 equipos, 4 grupos de 5 perfectos

          D) 5 grupos de 4 + 1 grupo de 2 (22 equipos)
             → Clasifican 10 + 2 mejores terceros = 12 → octavos

          Recomiendo B: 6 grupos (4 de 4 + 2 de 3).
          Clasifican los 2 primeros = 12 equipos → octavos.
          ¿O prefieres otra opción?"

Juan:    "Vamos con la B. 6 grupos, clasifican los 2 primeros."

Agente:  "Sorteo realizado:

          GRUPO A (4 equipos):
          1. Siempre Fuertes FC
          2. Club Sabaneta
          3. Club Rionegro ⭐ (nuevo en Widdo)
          4. Academia Caldas

          GRUPO B (4 equipos):
          1. Independiente Medellín Sub
          2. Club Deportivo Bello
          3. Club Copacabana
          4. Club Yarumal

          GRUPO C (4 equipos):
          1. Academia Envigado
          2. Club Deportivo Itagüí
          3. Club La Estrella
          4. Club Santa Rosa

          GRUPO D (4 equipos):
          1. Club Turbo
          2. Club Apartadó
          3. Club Caucasia
          4. Club Carmen de Viboral

          GRUPO E (3 equipos):
          1. Club Marinilla
          2. Club Andes
          3. Club Jericó

          GRUPO F (3 equipos):
          1. Club Girardota
          2. Club Barbosa
          3. Club San Juan

          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          Fase de grupos: 33 partidos
          Grupos de 4: 6 partidos c/u (3 jornadas) × 4 = 24
          Grupos de 3: 3 partidos c/u (3 jornadas) × 2 = 6
          Más: 3 partidos de jornada libre

          Clasifican 12 equipos → Octavos (12 no es potencia de 2)
          → 4 equipos van directo a cuartos (1°s de los 4 mejores grupos)
          → 8 equipos juegan octavos (4 partidos)
          → Cuartos con 8 equipos

          ¿Quieres que programe horarios y canchas?"
```

#### 3.2 — Programar horarios (Fase 3)

```
Juan:    "Tenemos 3 canchas. Sábados de 8am a 6pm. Domingos de 8am a 1pm.
          Partidos de 60 minutos + 15 de descanso."

Agente:  "Con 3 canchas y partidos de 75 min (60 + 15 descanso):

          Por sábado: 8 partidos × 3 canchas = 24 partidos
          Por domingo mañana: 4 partidos × 3 canchas = 12 partidos

          JORNADA 1 — Sábado 15 de marzo
          ─────────────────────────────────
          Cancha 1:
            8:00  Siempre Fuertes vs Club Sabaneta (Grupo A)
            9:15  Indep. Medellín vs Club Bello (Grupo B)
            10:30 Acad. Envigado vs Club Itagüí (Grupo C)
            11:45 Club Turbo vs Club Apartadó (Grupo D)
            13:00 Club Marinilla vs Club Andes (Grupo E)
            14:15 Club Girardota vs Club Barbosa (Grupo F)

          Cancha 2:
            8:00  Club Rionegro vs Acad. Caldas (Grupo A)
            9:15  Club Copacabana vs Club Yarumal (Grupo B)
            10:30 Club La Estrella vs Club Santa Rosa (Grupo C)
            11:45 Club Caucasia vs Club Carmen (Grupo D)
            13:00 Club Jericó vs Libre (Grupo E — no juega)
            14:15 Club San Juan vs Libre (Grupo F — no juega)

          Cancha 3: (reserva para partidos aplazados)

          JORNADA 2 — Sábado 22 de marzo
          [... fixture completo ...]

          JORNADA 3 — Sábado 29 de marzo
          [... fixture completo ...]

          Total fase de grupos: 33 partidos en 3 sábados

          ¿Publico el fixture?"

Juan:    "Sí, publica y manda a todos los clubes."

Agente:  "✅ Publicado en widdo.co/torneo/copa-antioquia-sub15-2026
          📧 22 emails enviados. Cada club recibió SUS partidos
          con fechas, horas y canchas.
          📱 Link para compartir en redes generado."
```

---

### CAPÍTULO 4: DÍA DEL TORNEO — JORNADA 1

#### 4.1 — Mañana del sábado 15 de marzo (Fase 5)

```
Agente:  "Buenos días Juan. Hoy: Jornada 1 — Copa Antioquia Sub-15

          12 partidos programados (2 canchas, 8:00-15:30)

          Estado de equipos:
          ✅ 20/22 equipos confirmaron asistencia
          ⚠️ 1 sin confirmar: Club Yarumal
          ❌ 1 avisó que no viene: Club Jericó (bus se dañó)

          Club Jericó tiene libre en Jornada 1 (Grupo E).
          Su primer partido real es Jornada 2.
          Pero avisaron que no vienen AL TORNEO COMPLETO.

          ¿Qué hacemos con Club Jericó?"

Juan:    "Si no vienen a ningún partido, retíralos del torneo.
          Sus partidos son walkover para los rivales."

Agente:  "✅ Club Jericó retirado del torneo.

          Grupo E queda con 2 equipos:
          Club Marinilla vs Club Andes (1 solo partido)
          Los otros 2 partidos son W.O.:
          • Marinilla vs Jericó → W.O. Marinilla (3-0)
          • Andes vs Jericó → W.O. Andes (3-0)

          El Grupo E tiene poco sentido con 2 equipos.
          ¿Quieres:
          A) Dejar así (2 equipos, 1 partido real + 2 W.O.)
          B) Pasar al mejor equipo de espera al Grupo E
          C) Fusionar Grupo E y F (5 equipos, un super-grupo)

          Recomiendo A: ya está publicado el fixture."

Juan:    "Sí, déjalo así. Es lo más simple."
```

#### 4.2 — Primer partido: Scoring en vivo (Fase 5)

Juan abre su celular y va al partido de las 8:00, Cancha 1:

**Siempre Fuertes FC vs Club Sabaneta**

Juan (o un delegado) abre la planilla digital:

```
┌──────────────────────────────────────────────────┐
│  PLANILLA EN VIVO — Cancha 1                     │
│                                                  │
│  Siempre Fuertes    vs    Club Sabaneta          │
│                                                  │
│         0                    0                   │
│                                                  │
│  ⏱️ 1T — 00:00                    [Iniciar]      │
│                                                  │
│  ┌──────────────┐      ┌──────────────┐         │
│  │   GOL        │      │   GOL        │         │
│  └──────────────┘      └──────────────┘         │
│                                                  │
│  [Amarilla] [Roja] [Cambio]                      │
│                                                  │
│  Eventos: (vacío)                                │
│                                                  │
│  [Deshacer]                                      │
│  [Fin 1T]  [Fin Partido]                        │
└──────────────────────────────────────────────────┘
```

Juan toca [Iniciar]. Cronómetro empieza.

**Minuto 12 — Gol de Siempre Fuertes:**
Juan toca [GOL] del lado izquierdo. Aparece selección rápida de jugadores:
```
¿Quién anotó?
[#7 Juan Pérez] [#10 Carlos López] [#9 Pedro Gómez]
[#4 Andrés M.] [#11 Diego S.] [Skip — solo sumar gol]
```
Toca [#7 Juan Pérez].

```
⏱️ 12' ⚽ Juan Pérez (#7) — Siempre Fuertes 1 - 0 Club Sabaneta
```

**WebSocket dispara `ScoreUpdated` → Portal público se actualiza en tiempo real.**

En `widdo.co/torneo/copa-antioquia-sub15-2026/vivo`:
```
EN VIVO

Cancha 1: Siempre Fuertes 1 - 0 Club Sabaneta (12')
Cancha 2: Club Rionegro 0 - 0 Acad. Caldas (15')
```

**Minuto 23 — Tarjeta amarilla:**
Juan toca [Amarilla] → selecciona equipo "Club Sabaneta" → jugador #6 Luis Gómez.
```
⏱️ 23' 🟡 Luis Gómez (#6) — Club Sabaneta
```

**Minuto 30 — Fin del primer tiempo:**
Juan toca [Fin 1T].
```
Fin del primer tiempo.
Siempre Fuertes 1 - 0 Club Sabaneta

Resumen 1T:
⚽ 12' Juan Pérez (SF)
🟡 23' Luis Gómez (SAB)

[Iniciar 2T]
```

**Segundo tiempo — Minuto 47:**
Gol de Club Sabaneta. Juan toca [GOL] → #9 Mateo Ríos.
```
Siempre Fuertes 1 - 1 Club Sabaneta
```

**Minuto 55:**
Gol de Siempre Fuertes. Juan toca [GOL] → #10 Carlos López.
```
Siempre Fuertes 2 - 1 Club Sabaneta
```

**Minuto 58:**
Otro gol de Siempre Fuertes. → #7 Juan Pérez (doblete).
```
Siempre Fuertes 3 - 1 Club Sabaneta
```

**Minuto 60 — Fin del partido:**
Juan toca [Fin Partido].

```
✅ PARTIDO FINALIZADO

Siempre Fuertes FC 3 - 1 Club Sabaneta

⚽ 12' Juan Pérez (SF)
⚽ 47' Mateo Ríos (SAB)
⚽ 55' Carlos López (SF)
⚽ 58' Juan Pérez (SF)
🟡 23' Luis Gómez (SAB)

Tabla Grupo A actualizada:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                PJ  PG  PE  PP  GF  GC  DG  PTS
Siempre Fuertes  1   1   0   0   3   1  +2   3
Rionegro         0   0   0   0   0   0   0   0
Acad. Caldas     0   0   0   0   0   0   0   0
Club Sabaneta    1   0   0   1   1   3  -2   0

Siguiente partido Cancha 1: 9:15
Indep. Medellín vs Club Bello (Grupo B)
```

#### 4.3 — Imprevistos durante la jornada (Fase 3 + 5)

**Situación 1: Club Yarumal no llega**
```
Juan:    "Club Yarumal no llegó al partido de las 9:15.
          Ya pasaron 15 minutos."

Agente:  "Según el reglamento, tolerancia de 15 minutos superada.

          Opciones:
          A) W.O. para Club Copacabana (3-0)
          B) Esperar 15 min más
          C) Reprogramar

          ¿Qué prefieres?"

Juan:    "Walkover."

Agente:  "✅ W.O. registrado. Copacabana gana 3-0.
          Tabla Grupo B actualizada.
          Club Yarumal notificado."
```

**Situación 2: Lluvia fuerte**
```
Juan:    "Empezó a llover muy fuerte. La cancha 2 se inundó.
          Suspende los partidos de cancha 2."

Agente:  "Partidos suspendidos en Cancha 2:

          Rionegro vs Acad. Caldas — 2T, minuto 52, va 1-1
          (Guardé marcador parcial y minuto)

          Próximos en cancha 2:
          La Estrella vs Santa Rosa (10:30) — no empezó
          Caucasia vs Carmen (11:45) — no empezó

          Opciones:
          A) Mover partidos pendientes a Cancha 3 (está libre)
          B) Reprogramar para mañana domingo
          C) Esperar que pare la lluvia

          El partido Rionegro vs Caldas se debe completar
          desde donde iba (minuto 52, 1-1)."

Juan:    "Mueve todo a Cancha 3. El partido suspendido
          lo completan en Cancha 3 cuando termine de llover."

Agente:  "✅ Movidos a Cancha 3:
          • 10:30 La Estrella vs Santa Rosa (confirmado)
          • 11:45 Caucasia vs Carmen (confirmado)
          • Rionegro vs Caldas: pendiente de reanudación
            (se reanuda desde min 52, 1-1)

          Equipos notificados del cambio de cancha."
```

#### 4.4 — Mientras tanto, el público ve en vivo (Fase 4 + 5)

Un padre de un jugador de Siempre Fuertes abre en su celular:
```
widdo.co/torneo/copa-antioquia-sub15-2026/vivo
```

Ve:
```
EN VIVO — Copa Antioquia Sub-15

Cancha 1: Indep. Medellín 2 - 0 Club Bello (38')
Cancha 3: La Estrella 0 - 1 Santa Rosa (22')

Resultados de hoy:
✅ Siempre Fuertes 3 - 1 Club Sabaneta
✅ Club Copacabana 3 - 0 Club Yarumal (W.O.)
⏸️ Club Rionegro 1 - 1 Acad. Caldas (suspendido min 52)

👥 127 personas viendo ahora
```

Sin login, sin app, solo el link.

---

### CAPÍTULO 5: DESPUÉS DE LA FASE DE GRUPOS

#### 5.1 — 3 jornadas completadas (Fase 3 + 7)

Después de 3 sábados, todos los partidos de grupos se jugaron.

```
Agente:  "Fase de grupos completada. Resultados finales:

          GRUPO A          PJ  PG  PE  PP  GF  GC  DG  PTS
          Siempre Fuertes   3   3   0   0   9   2  +7   9  🟢
          Club Rionegro     3   2   0   1   5   3  +2   6  🟢
          Acad. Caldas      3   1   0   2   3   5  -2   3
          Club Sabaneta     3   0   0   3   1   8  -7   0

          GRUPO B          PJ  PG  PE  PP  GF  GC  DG  PTS
          Indep. Medellín   3   3   0   0   8   1  +7   9  🟢
          Club Copacabana   3   2   0   1   6   3  +3   6  🟢
          Club Bello        3   1   0   2   4   6  -2   3
          Club Yarumal      3   0   0   3   0   8  -8   0

          GRUPO C          PJ  PG  PE  PP  GF  GC  DG  PTS
          Acad. Envigado    3   2   1   0   6   2  +4   7  🟢
          Club Itagüí       3   2   0   1   5   3  +2   6  🟢
          Club La Estrella  3   1   0   2   3   5  -2   3
          Club Santa Rosa   3   0   1   2   2   6  -4   1

          GRUPO D          PJ  PG  PE  PP  GF  GC  DG  PTS
          Club Turbo        3   2   1   0   5   1  +4   7  🟢
          Club Apartadó     3   1   2   0   4   3  +1   5  🟢
          Club Caucasia     3   1   1   1   3   3   0   4
          Club Carmen       3   0   0   3   1   6  -5   0

          GRUPO E          PJ  PG  PE  PP  GF  GC  DG  PTS
          Club Marinilla    2   2   0   0   6   1  +5   6  🟢
          Club Andes        2   1   0   1   2   3  -1   3  🟢
          Club Jericó       RETIRADO

          GRUPO F          PJ  PG  PE  PP  GF  GC  DG  PTS
          Club Girardota    2   2   0   0   4   1  +3   6  🟢
          Club Barbosa      2   1   0   1   3   3   0   3  🟢
          Club San Juan     2   0   0   2   1   4  -3   0

          CLASIFICADOS (12 equipos):
          2 primeros de cada grupo = 12 equipos

          12 no es potencia de 2 para eliminación directa.
          Opciones:
          A) 4 mejores 1°s van directo a cuartos + 8 restantes juegan octavos
          B) 12 equipos: 4 BYEs (1°s de los 4 mejores grupos pasan directo)
          C) Sorteo octavos: 4 partidos → 8 cuartos... no, 12 no funciona limpio

          Recomiendo A:
          • Top 4 (mejores 1°s): directo a cuartos
          • Los otros 8 juegan octavos (4 partidos)
          • Cuartos: 4 + 4 ganadores = 8 equipos (perfecto)

          ¿Vamos con A?"

Juan:    "Sí, con la opción A. Los 4 mejores primeros directo
          a cuartos."

Agente:  "Ranking de primeros de grupo:
          1. Siempre Fuertes (9pts, +7 DG) → DIRECTO A CUARTOS
          2. Indep. Medellín (9pts, +7 DG) → DIRECTO A CUARTOS
          3. Acad. Envigado (7pts, +4 DG) → DIRECTO A CUARTOS
          4. Club Turbo (7pts, +4 DG) → DIRECTO A CUARTOS

          Octavos (8 equipos):
          5. Marinilla (1° Grupo E)
          6. Girardota (1° Grupo F)
          7. Rionegro (2° Grupo A)
          8. Copacabana (2° Grupo B)
          9. Itagüí (2° Grupo C)
          10. Apartadó (2° Grupo D)
          11. Andes (2° Grupo E)
          12. Barbosa (2° Grupo F)

          Cruces de octavos (1° vs 2° de diferente grupo):
          OCT-1: Marinilla vs Barbosa
          OCT-2: Girardota vs Andes
          OCT-3: Rionegro vs Itagüí
          OCT-4: Copacabana vs Apartadó

          Cuartos:
          CF-1: Siempre Fuertes vs Ganador OCT-1
          CF-2: Indep. Medellín vs Ganador OCT-2
          CF-3: Acad. Envigado vs Ganador OCT-3
          CF-4: Club Turbo vs Ganador OCT-4

          Semis → Final → 3er puesto

          ¿Programo para el sábado 5 de abril (octavos) y
          sábado 12 (cuartos)?
          Semis el 19, final el 26."

Juan:    "Perfecto, programa así. La final a las 4pm."

Agente:  "✅ Fixture de eliminación generado y publicado.

          SÁB 5 ABR — OCTAVOS DE FINAL
          8:00 C1: Marinilla vs Barbosa
          8:00 C2: Girardota vs Andes
          9:30 C1: Rionegro vs Itagüí
          9:30 C2: Copacabana vs Apartadó

          SÁB 12 ABR — CUARTOS DE FINAL
          8:00 C1: Siempre Fuertes vs Gan. OCT-1
          8:00 C2: Indep. Medellín vs Gan. OCT-2
          10:00 C1: Acad. Envigado vs Gan. OCT-3
          10:00 C2: Club Turbo vs Gan. OCT-4

          SÁB 19 ABR — SEMIFINALES
          10:00 C1: Gan. CF-1 vs Gan. CF-4
          12:00 C1: Gan. CF-2 vs Gan. CF-3

          SÁB 26 ABR — FINAL
          14:00 C1: 3er y 4to puesto
          16:00 C1: GRAN FINAL

          22 clubes notificados."
```

---

### CAPÍTULO 6: ELIMINACIÓN DIRECTA

#### 6.1 — Octavos de final (Fase 3 + 5)

Los partidos de eliminación se juegan igual que en fase de grupos, con la planilla digital.

**Pero hay un empate en el minuto 60:**
```
Cancha 1: Club Rionegro 1 - 1 Club Itagüí — 60'

Juan toca [Fin Partido].

Agente:  "⚠️ Empate 1-1 en eliminación directa.
          Según la configuración del torneo:
          → Penales directos (no hay tiempo extra configurado)

          ¿Inicio tanda de penales?"

Juan:    "Sí."
```

La planilla cambia a modo penales:
```
┌──────────────────────────────────────────────────┐
│  PENALES — Rionegro vs Itagüí                   │
│                                                  │
│  Rionegro        Itagüí                          │
│  ──────────      ──────────                      │
│  1. ✅ Gol       1. ✅ Gol                        │
│  2. ✅ Gol       2. ❌ Fallo                      │
│  3. ❌ Fallo     3. ✅ Gol                        │
│  4. ✅ Gol       4. ✅ Gol                        │
│  5. ✅ Gol       5. (por patear)                  │
│                                                  │
│  Rionegro 4 - 3 Itagüí                           │
│                                                  │
│  [⚽ Gol] [❌ Fallo]  ← Itagüí patea el 5to      │
└──────────────────────────────────────────────────┘
```

Itagüí mete el 5to: 4-4. Van a muerte súbita.

```
│  6. (por patear)  6. (por patear)                │
```

Rionegro mete, Itagüí falla:
```
✅ Club Rionegro gana por penales 5-4
(Partido: 1-1 — Penales: 5-4)

Rionegro avanza a Cuartos de Final.
→ CF-3: Acad. Envigado vs Club Rionegro (sáb 12 abr, 10:00)
```

#### 6.2 — Hasta la final (Fase 3)

Semanas pasan. Los cuartos, semis y la final se juegan con la misma dinámica.

**Gran Final:**
```
✅ GRAN FINAL — Sábado 26 de abril, 4:00pm

Siempre Fuertes FC  2 - 1  Independiente Medellín Sub

⚽ 22' Juan Pérez (SF)
⚽ 38' Santiago Restrepo (IM)
⚽ 72' Carlos López (SF)
🟡 45' Luis Herrera (IM)
🟡 68' Diego Sánchez (SF)

CAMPEÓN: SIEMPRE FUERTES FC
```

---

### CAPÍTULO 7: POST-TORNEO

#### 7.1 — Resultados y estadísticas (Fase 7)

```
Agente:  "COPA ANTIOQUIA SUB-15 2026 — FINALIZADO

          Campeón: Siempre Fuertes FC
          Subcampeón: Independiente Medellín Sub
          3er puesto: Academia Envigado

          ESTADÍSTICAS DEL TORNEO:
          • 37 partidos jugados (34 regulares + 3 W.O.)
          • 22 equipos participantes (1 retirado)
          • 396 jugadores
          • 89 goles anotados (2.4 goles/partido)
          • 45 tarjetas amarillas, 3 rojas

          GOLEADOR: Juan Pérez (Siempre Fuertes) — 8 goles
          2°: Santiago Restrepo (Indep. Med.) — 6 goles
          3°: Mateo Ríos (Club Sabaneta) — 5 goles

          MVP: Juan Pérez — 8 goles + 3 asistencias en 9 partidos

          Mejor defensa: Club Turbo — 3 goles recibidos en 6 partidos

          FINANCIERO:
          • Recaudado: $4.200.000 COP (21 equipos pagaron, 1 retirado sin reembolso)
          • Comisión Widdo (5%): $210.000 COP
          • Neto organizador: $3.990.000 COP

          ¿Qué quieres hacer?"
```

#### 7.2 — Publicar y compartir (Fase 4)

```
Juan:    "Publica los resultados finales."

Agente:  "✅ Publicado en widdo.co/torneo/copa-antioquia-sub15-2026

          La página ahora muestra:
          ✅ Podio (campeón, sub, tercero)
          ✅ Bracket completo con todos los resultados
          ✅ Tabla de posiciones final por grupo
          ✅ Goleadores y estadísticas
          ✅ Todos los partidos con resultados

          📧 Email enviado a los 22 clubes con resumen.
          📱 Link listo para compartir en redes."
```

#### 7.3 — Informe oficial (Fase 7)

```
Juan:    "Necesito un informe para Indeportes Antioquia."

Agente:  "Generé informe completo:

          • Acta del torneo (datos generales, fechas, sedes)
          • Listado de 22 equipos y 396 jugadores
          • Resultados de los 37 partidos
          • Tablas de posiciones
          • Bracket de eliminación
          • Estadísticas individuales y por equipo
          • Incidencias (1 retiro, 1 suspensión por lluvia, 3 W.O.)
          • Informe financiero
          • Sanciones disciplinarias (3 rojas)

          Disponible en PDF. ¿Lo envío a algún email?"

Juan:    "Sí, a indeportes@antioquia.gov.co"

Agente:  "✅ Enviado."
```

#### 7.4 — Efecto de red (Resultado para Widdo)

Resultado del torneo para el negocio de Widdo:

```
ANTES del torneo:
  20 clubes en Widdo Antioquia

DESPUÉS del torneo:
  20 clubes originales
  + 2 clubes nuevos que se registraron para participar (plan gratis)
  = 22 clubes en Widdo

  De los 2 nuevos:
  • Club Rionegro: llegó a cuartos, sus jugadores y padres usaron Widdo
    para ver resultados en vivo. El owner vio las funcionalidades →
    "Esto es mejor que mi Excel" → UPGRADE a plan pago ($129K/mes)
  • Club Jericó: se retiró, probablemente no se queda.
    Pero su cuenta sigue ahí para el próximo torneo.

REVENUE GENERADO:
  • Comisión Widdo: $210.000 COP (~$50 USD)
  • 1 nuevo suscriptor: $129.000 COP/mes recurrente
  • Exposición: 127 personas vieron en vivo → conocen Widdo
  • El organizador Juan crea otro torneo el próximo mes → más clubes entran
```

**Cada torneo es un canal de adquisición a costo $0.**

---

---

# SIMULACIONES ADICIONALES: DEPORTES INDIVIDUALES Y ESPECIALES

## Simulación 2: Torneo de Tenis — Eliminación Directa

### Creación (Fase 0 + 1)
```
Organizador: "Quiero un torneo de tenis. Abierto masculino y femenino.
              32 jugadores por categoría. Eliminación directa.
              Mejor de 3 sets. Canchas de tierra batida."

Agente:      "Creé torneo de tenis:
              🎾 Tipo: Individual
              Formato: Eliminación directa
              Sets: Mejor de 3 (tiebreak a 6-6)

              2 categorías:
              • Abierto Masculino: 32 jugadores → 31 partidos
              • Abierto Femenino: 32 jugadoras → 31 partidos
              Total: 62 partidos

              ¿Inscripción individual (sin club) o por club?"

Organizador: "Individual. Cada jugador se inscribe solo."
```

### Inscripción individual (Fase 2 — adaptación)

Los jugadores se inscriben directamente, sin necesidad de club:
```
widdo.co/inscribirse/torneo-tenis-abierto-2026

┌──────────────────────────────────────────────────┐
│  Torneo Abierto de Tenis 2026                    │
│  Categoría: Abierto Masculino (28/32 plazas)     │
│                                                  │
│  Nombre: [____________]                          │
│  Documento: [____________]                       │
│  Fecha nacimiento: [__/__/____]                  │
│  Ranking (opcional): [____]                      │
│  Club/Academia (opcional): [____________]        │
│  Foto: [Subir]                                   │
│                                                  │
│  Inscripción: $50.000 COP                        │
│  [Inscribirme]                                   │
└──────────────────────────────────────────────────┘
```

### Bracket con seeding (Fase 3)
```
Organizador: "Genera el bracket. Los 8 mejores rankeados son cabezas de serie."

Agente:      "Bracket generado con seeding:
              [1] Pérez vs [32] González    ← 1° seed vs último
              [16] Morales vs [17] Ríos
              ...
              [2] López vs [31] Torres      ← 2° seed en la otra mitad

              1° y 2° seed en lados opuestos del bracket.
              No se cruzan hasta la final.

              5 rondas: R32 → R16 → QF → SF → F
              ¿Programo horarios?"
```

### Scoring en vivo — SetsGamesAdapter (Fase 5)
```
Organizador: "Empezó el partido Pérez vs González. Cancha 1."

Planilla digital:
┌──────────────────────────────────────┐
│  🎾 [1] Pérez  vs  [32] González    │
│                                      │
│  Sets:  0        0                   │
│  Game:  0   -    0                   │
│  Pts:   0   -    0                   │
│                                      │
│  Sirviendo: Pérez 🎾                 │
│                                      │
│  [Punto Pérez]    [Punto González]   │
│  [Ace] [Doble falta]                 │
│                                      │
│  [Deshacer]                          │
└──────────────────────────────────────┘

Toque "Punto Pérez" → 15-0
Toque "Punto Pérez" → 30-0
Toque "Punto González" → 30-15
Toque "Ace" (Pérez) → 40-15
Toque "Punto Pérez" → Game Pérez. 1-0, cambio de servicio.

[... partido continúa ...]

Resultado final:
Pérez def. González: 6-4, 6-7(5), 6-2

Pérez avanza a R16.
Bracket actualizado automáticamente.
```

### Escenarios especiales de tenis
```
Organizador: "El partido de cancha 3 se suspendió por lluvia.
              Van en el segundo set, Morales gana 6-3, 4-4."

Agente:      "Partido suspendido. Guardé:
              Morales 6-3, 4-4 Ríos (sirviendo Ríos)
              Se reanuda mañana desde 4-4 en el 2° set."

Organizador: "López se retiró del torneo por lesión antes de cuartos."

Agente:      "López se retira. Su rival (Torres) avanza a semis
              por W.O. Bracket actualizado."
```

---

## Simulación 3: Torneo de Judo — Por Categorías de Peso

### Creación (Fase 0 + 1)
```
Organizador: "Torneo departamental de judo sub-18. 5 categorías de peso.
              Eliminación directa. Combates de 4 minutos."

Agente:      "Creé torneo de judo:
              Tipo: Individual
              5 categorías de peso:
              • -60 kg Masculino
              • -66 kg Masculino
              • -73 kg Masculino
              • -81 kg Masculino
              • +81 kg Masculino

              Formato: Eliminación directa por categoría
              ¿Quieres agregar categorías femeninas?"

Organizador: "Sí, las mismas 5 pero en femenino."

Agente:      "10 categorías total (5 masc + 5 fem).
              ¿Inscripción por club o individual?"

Organizador: "Por club. Cada club inscribe a sus judokas."
```

### Scoring en vivo — RoundsPointsAdapter (Fase 5)
```
Planilla digital (combate de judo):
┌──────────────────────────────────────┐
│  -66kg Masc — Cuartos de Final      │
│                                      │
│  García         vs        López      │
│  Waza-ari: 1              0          │
│  Shidos:   0              1          │
│                                      │
│  ⏱️ 2:45 / 4:00                      │
│                                      │
│  García:            López:           │
│  [Ippon]            [Ippon]          │
│  [Waza-ari]         [Waza-ari]       │
│  [Shido]            [Shido]          │
│                                      │
│  [Deshacer] [Fin Combate]           │
└──────────────────────────────────────┘

Toque [Ippon] para García →
  "¡IPPON! García gana el combate.
   García avanza a semifinal."

--- O si no hay ippon al terminar el tiempo: ---

⏱️ Tiempo agotado.
García: 1 Waza-ari, 0 Shidos
López: 0 Waza-ari, 1 Shido

García gana por decisión (más técnicas de scoring, menos penalizaciones).

--- O si hay empate: ---

"Empate. Se va a Golden Score (tiempo extra ilimitado).
 El primero que anote cualquier técnica, gana."
```

---

## Simulación 4: Torneo de Natación — Series y Tiempos

### Creación (Fase 0 + 1)
```
Organizador: "Torneo de natación infantil. 50m libre, 100m libre,
              200m libre. Categorías: 10-11 años, 12-13 años, 14-15 años.
              Masculino y femenino. 50 nadadores inscritos."

Agente:      "Creé torneo de natación:
              Tipo: Individual contra tiempo
              9 pruebas (3 distancias × 3 categorías de edad)
              × 2 géneros = 18 eventos

              Formato: Series clasificatorias → Final (8 mejores tiempos)
              ¿Cuántos carriles tiene la piscina?"

Organizador: "6 carriles"

Agente:      "Con ~50 nadadores por género y 6 carriles:

              Ejemplo para 50m Libre Masc 12-13 (18 nadadores):
              • 3 series de 6 nadadores
              • Los 8 mejores tiempos van a la final

              Total estimado: ~54 series + 18 finales = 72 carreras
              ¿Programo horarios? ¿Cuántos minutos entre series?"

Organizador: "3 minutos entre series, 10 minutos entre pruebas."
```

### Scoring — TimesMarksAdapter (Fase 5)
```
Planilla digital (serie de natación):
┌──────────────────────────────────────┐
│  50m Libre Masc 12-13 — Serie 2/3   │
│                                      │
│  Carril 1: García, M.    [  :  .  ] │
│  Carril 2: López, J.     [  :  .  ] │
│  Carril 3: Pérez, A.     [  :  .  ] │
│  Carril 4: Ríos, D.      [  :  .  ] │
│  Carril 5: Torres, S.    [  :  .  ] │
│  Carril 6: Gómez, C.     [  :  .  ] │
│                                      │
│  [Registrar llegada]                 │
│  [DNS] [DNF] [DQ]                    │
└──────────────────────────────────────┘

Toque [Registrar llegada] para Carril 3:
→ Se abre teclado numérico: [ 0:27.82 ]
→ Confirmar

Resultado después de registrar todos:
┌──────────────────────────────────────┐
│  Serie 2/3 — Resultados:             │
│                                      │
│  1° Carril 6: Gómez     27.15 ⭐ MP │
│  2° Carril 2: López     27.82       │
│  3° Carril 4: Ríos      28.03       │
│  4° Carril 1: García    28.45       │
│  5° Carril 3: Pérez     29.11       │
│  6° Carril 5: Torres    30.22       │
│                                      │
│  ⭐ MP = Marca Personal              │
│                                      │
│  Ranking general 50m Libre 12-13:    │
│  1° Gómez     27.15 (Serie 2)       │
│  2° Martínez  27.45 (Serie 1)        │
│  3° López     27.82 (Serie 2)        │
│  ... 15 más                          │
│  Top 8 van a la final.               │
└──────────────────────────────────────┘
```

### El agente maneja la logística
```
Organizador: "El nadador del carril 4 de la serie 3 fue descalificado
              por salida en falso."

Agente:      "Ríos descalificado (DQ) en Serie 3 de 50m Libre.
              Motivo: salida en falso.
              Su tiempo se invalida. El 9° mejor tiempo ahora
              entra a la final como 8°.
              Ranking actualizado."

Organizador: "¿Cómo van los resultados generales del torneo?"

Agente:      "Medallero por club:
              🥇🥈🥉
              Club Acuático Medellín:   3  2  1
              Academia Natación ENV:    2  1  3
              Club Rionegro Natación:   1  2  0
              ...

              Récords del torneo establecidos:
              • 50m Libre Masc 14-15: Gómez 25.03 (nuevo récord)
              • 100m Libre Fem 12-13: Pérez 1:05.22 (nuevo récord)"
```

---

## Simulación 5: Torneo de Baloncesto — Con Overtime

### Scoring — PointsAdapter (Fase 5)
```
Planilla digital (baloncesto):
┌──────────────────────────────────────┐
│  Final — Liga Antioqueña Sub-17     │
│                                      │
│  Panthers    vs    Águilas           │
│        68              68            │
│                                      │
│  ⏱️ Q4 — 0:00  EMPATE               │
│                                      │
│  Se va a OVERTIME (5 min)            │
│  [Iniciar OT]                        │
└──────────────────────────────────────┘

[Overtime]
┌──────────────────────────────────────┐
│  ⏱️ OT1 — 3:15                       │
│        72              70            │
│                                      │
│  Panthers:          Águilas:          │
│  [+1] [+2] [+3]   [+1] [+2] [+3]   │
│  [Falta]           [Falta]           │
│                                      │
│  Faltas equipo: Panthers 3 | Águilas 4│
│                                      │
│  Parciales: Q1:18-15 Q2:14-20       │
│             Q3:18-15 Q4:18-18       │
│             OT1: 4-2                 │
│                                      │
│  [Deshacer] [Fin OT]                │
└──────────────────────────────────────┘

Resultado final: Panthers 75 - 72 Águilas (OT)
Parciales: 18-15, 14-20, 18-15, 18-18, 7-4
MVP: Juan Pérez — 28pts, 8reb, 5ast
```

---

## Simulación 6: Escenario de Fallo Completo (Offline + Crash)

### La peor pesadilla: todo falla durante la final

```
Situación: Final de fútbol. Min 35, va 1-0.
El delegado está en un coliseo rural sin WiFi.
Solo tiene datos móviles que van y vienen.

PASO 1 — Sin internet desde el minuto 20
┌──────────────────────────────────────┐
│  Sin conexión — datos guardados      │
│  Siempre Fuertes 1 - 0 Itagüí       │
│  ⏱️ 1T — 35:22                       │
│                                      │
│  Todo funciona normal.               │
│  El delegado ni se entera.           │
│  12 eventos pendientes de sync.      │
└──────────────────────────────────────┘

PASO 2 — Gol en el minuto 38 (sin internet)
  Delegado toca [GOL] → se guarda local
  UI muestra: Siempre Fuertes 2 - 0 Itagüí
  13 eventos pendientes de sync.

PASO 3 — Fin del primer tiempo (sin internet)
  Delegado toca [Fin 1T]
  Estado guardado localmente: 2-0, 5 eventos del 1T

PASO 4 — Descanso. El delegado va a buscar señal.
  Conecta WiFi del vestidor
  → Cola de sync: 13 eventos enviados al servidor en 2 segundos
  → Portal público se actualiza: "SF 2-0 Itagüí (Descanso)"
  → WebSocket a 200 espectadores online

PASO 5 — Segundo tiempo. Vuelve a la cancha. Sin señal otra vez.
  Sigue registrando normalmente (offline)
  Minuto 55: Gol de Itagüí → 2-1 (guardado local)
  Minuto 70: Amarilla para SF #4 (guardado local)
  Minuto 85: Gol de SF → 3-1 (guardado local)

PASO 6 — ¡SE DESCARGA EL CELULAR! Minuto 88.
  La pantalla se apaga.
  Pero los datos del minuto 0 al 85 están en IndexedDB.
  Los 3 eventos sin sync (gol 55', amarilla 70', gol 85')
  están guardados localmente.

PASO 7 — El organizador (Juan) está en el centro de control.
  Ve que la planilla de Cancha 1 se desconectó.

  Centro de Control:
  🔴 Cancha 1: SF 2-0 Itagüí (último sync: min 45)
       Delegado: Carlos (DESCONECTADO hace 43 min)
       ⚠️ Partido sin actualizar

  Juan tiene 3 opciones:

  A) Esperar a que Carlos cargue el celular
  B) Abrir la planilla en SU celular y continuar
  C) Ingresar resultado por chat con el agente

  Juan elige C (el partido ya casi termina):

Juan:    "El resultado final de cancha 1 fue Siempre Fuertes 3,
          Itagüí 1. Goles de Pérez minuto 12 y 85, López minuto 38
          para Siempre Fuertes. Gol de Ríos minuto 55 para Itagüí.
          Amarilla para el 4 de Siempre Fuertes minuto 70."

Agente:  "Registré el resultado completo:

          Siempre Fuertes 3 - 1 Club Itagüí
          ⚽ 12' Pérez (SF)
          ⚽ 38' López (SF)
          ⚽ 55' Ríos (IT)
          🟡 70' #4 (SF)
          ⚽ 85' Pérez (SF)

          ¿Confirmas?"

Juan:    "Confirmado."

Agente:  "✅ Resultado registrado. Bracket actualizado.
          Portal público actualizado."

PASO 8 — Carlos carga el celular 2 horas después.
  Abre la app. Ve el modal:

  "Tienes un partido sin terminar:
   SF 3-1 Itagüí (min 85)

   ⚠️ Este partido ya fue finalizado por el organizador.

   [Descartar datos locales]  [Ver diferencias]"

  Carlos toca "Descartar" — los datos locales se eliminan.
  (Si hubiera tocado "Ver diferencias", vería que los eventos
   coinciden con lo que Juan ingresó manualmente.)
```

**Resultado:** El partido NO se perdió. El peor caso fue perder la transmisión en vivo a los espectadores durante 43 minutos, pero el resultado final se registró correctamente.

---

## RESUMEN FINAL: ORDEN DE IMPLEMENTACIÓN

```
RONDA 1 (semana 1):
  └─ Fase 0 — Rol Organizador (fundamento de todo)

RONDA 2 (semanas 2-3):
  ├─ Fase 1 — Multi-Deporte + Config Scoring (en paralelo)
  └─ Fase 2 — Inscripción Cross-Club (en paralelo)

RONDA 3 (semanas 3-5):
  ├─ Fase 3 — Motor de Brackets + Agente IA (la más grande)
  └─ Fase 6 — Pagos de Inscripción (en paralelo con Fase 3)

RONDA 4 (semanas 5-7):
  ├─ Fase 4 — Portal Público (en paralelo)
  └─ Fase 5 — Resultados en Vivo + Planillas + Resiliencia (en paralelo)

RONDA 5 (semanas 7-9):
  ├─ Fase 7 — Estadísticas y Rankings (en paralelo)
  └─ Fase 8 — Mobile (en paralelo)

MVP MÍNIMO: Fases 0+1+2+3+4 + GoalsAdapter + PointsAdapter (~20-25 días)
PRODUCTO COMPLETO: Las 9 fases + todos los adaptadores (~35-45 días)
```
