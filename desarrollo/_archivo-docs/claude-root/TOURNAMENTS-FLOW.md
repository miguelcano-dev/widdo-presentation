# Widdo Tournaments — Flujo Completo con Agente IA

> Documento complementario a `TOURNAMENTS.md`
> Flujo completo desde la perspectiva de un organizador grande (tipo Copa T&E)
> Todos los escenarios posibles incluidos

---

## Indice

1. [Pre-torneo: Planificacion](#1-pre-torneo-planificacion)
2. [Pre-torneo: Convocatoria e inscripciones](#2-pre-torneo-convocatoria-e-inscripciones)
3. [Pre-torneo: Cierre y preparacion](#3-pre-torneo-cierre-y-preparacion)
4. [Dia del torneo: Logistica](#4-dia-del-torneo-logistica)
5. [Durante el torneo: Partidos en vivo](#5-durante-el-torneo-partidos-en-vivo)
6. [Durante el torneo: Imprevistos](#6-durante-el-torneo-imprevistos)
7. [Transicion entre fases](#7-transicion-entre-fases)
8. [Post-torneo](#8-post-torneo)
9. [Escenarios especiales](#9-escenarios-especiales)

---

## 1. Pre-torneo: Planificacion

### Lo que el organizador le dice al agente

```
Organizador: "Quiero crear un torneo de baloncesto sub-15 masculino
              para el departamento de Antioquia. 24 equipos maximo.
              Fase de grupos y despues eliminacion directa.
              Del 15 de marzo al 30 de abril. En los coliseos de Medellin.
              Inscripcion $200.000 por equipo."

Agente:      "Perfecto. Creé el torneo con esta configuracion:

              📋 Torneo Departamental Sub-15 Masculino 2026
              🏀 Baloncesto — Equipos
              📅 15 mar – 30 abr 2026
              📍 Coliseos de Medellín
              🎯 Formato: Grupos + eliminacion directa
              👥 Maximo 24 equipos, 12 jugadores por equipo
              💰 Inscripcion: $200.000 COP
              📝 Estado: Borrador

              ¿Quieres agregar categorias, documentos requeridos
              o alguna otra configuracion?"
```

```
Organizador: "Si, necesito que cada jugador tenga registro civil,
              certificado EPS y foto. Y quiero cobrar online."

Agente:      "Listo. Agregué 3 documentos requeridos:
              ✅ Registro civil / TI (obligatorio)
              ✅ Certificado EPS (obligatorio)
              ✅ Foto tipo documento (obligatorio)

              Pagos online activados via Wompi ($200.000 COP).
              ¿Algo mas antes de abrir inscripciones?"
```

```
Organizador: "Tambien quiero una categoria sub-13 masculino
              y otra sub-15 femenino"

Agente:      "Agregué 2 categorias mas. El torneo ahora tiene:

              1. Sub-15 Masculino (nacidos 2011-2012)
              2. Sub-13 Masculino (nacidos 2013-2014)
              3. Sub-15 Femenino (nacidos 2011-2012)

              Cada una con max 24 equipos. ¿Las 3 con el mismo
              formato de grupos + eliminacion? ¿Mismo precio?"
```

```
Organizador: "Si. Pero la femenina solo 16 equipos max
              y la inscripcion a $150.000"

Agente:      "Actualizado:
              • Sub-15 Femenino: max 16 equipos, $150.000 COP
              ¿Listo para abrir inscripciones?"
```

### Escenarios de planificacion

| Situacion | El organizador dice | El agente hace |
|-----------|--------------------|--------------------|
| Multiples categorias | "Agrega sub-17 con las mismas reglas" | Crea categoria clonando config |
| Cambiar formato | "La femenina mejor que sea todos contra todos" | Cambia competition_format de la categoria |
| Multiples sedes | "Los partidos de grupos en Coliseo Norte, las eliminatorias en Coliseo Central" | Registra venues por fase |
| Reglamento | "Sube este PDF como reglamento" | Adjunta archivo al torneo |
| Premios | "Primer puesto trofeo + 2 millones, segundo trofeo + 1 millon, tercero medallas" | Guarda premios por posicion |
| Co-organizador | "Agrega a María Lopez como co-organizadora, su email es maria@copa.co" | Agrega usuario con permisos de gestion |
| Flyer | "Genera un flyer con esta info" | Genera imagen con los datos del torneo |
| Patrocinadores | "El patrocinador es Gatorade, sube su logo" | Adjunta logos de patrocinadores |

---

## 2. Pre-torneo: Convocatoria e inscripciones

### Abrir inscripciones

```
Organizador: "Abre las inscripciones. La fecha limite es el 5 de marzo."

Agente:      "Inscripciones abiertas hasta el 5 de marzo de 2026.

              🔗 Link publico: widdo.co/torneo/departamental-sub15-antioquia-2026
              📧 ¿Quieres que invite clubes especificos?
              📱 ¿Comparto el link por WhatsApp?"
```

### Invitar clubes

```
Organizador: "Invita a todos los clubes de Widdo que estan en Antioquia
              y que tengan jugadores en esas edades"

Agente:      "Encontré 20 clubes en Widdo de Antioquia con jugadores
              en edad sub-13 a sub-17:

              1. Club Siempre Fuertes (Medellín) — 28 jugadores elegibles
              2. Independiente Medellín Sub (Medellín) — 35 jugadores
              3. Academia Bball Envigado (Envigado) — 22 jugadores
              ... (17 mas)

              ¿Envio invitacion a los 20?"

Organizador: "Si, a todos. Y tambien manda email a estos clubes que
              no estan en Widdo..."
              [pega lista de emails]

Agente:      "Listo:
              ✅ 20 invitaciones enviadas a clubes Widdo
              ✅ 46 emails enviados a clubes externos

              Cada uno recibio: info del torneo, categorias,
              fechas, requisitos y link de inscripcion.

              Te aviso cuando empiecen a responder."
```

### Gestionar inscripciones (el agente avisa proactivamente)

```
Agente:      "📩 Club Siempre Fuertes aceptó la invitacion.
              Se inscribio en Sub-15 Masculino con 12 jugadores.
              Pago confirmado ($200.000). Documentos: 10/12 completos.
              ¿Lo apruebas o esperas los documentos faltantes?"

Organizador: "Apruébalo, que suban los documentos que faltan antes del torneo"

Agente:      "Aprobado. Le envié notificacion al club recordandoles
              que faltan 2 documentos (EPS de Juan Pérez y foto de Carlos Ruiz)."
```

```
Agente:      "📩 Club Baloncesto Itagüí se inscribio via link publico.
              Son club nuevo en Widdo (se acaban de registrar).
              Sub-15 Masculino, 12 jugadores. Pago pendiente.

              ⚠️ 2 jugadores nacieron en 2013 (fuera de rango sub-15).
              ¿Los permites como jugadores menores o los rechazas?"

Organizador: "Permitimos hasta 2 menores por equipo, esta bien.
              Pero que paguen primero."

Agente:      "Entendido. Inscripcion en estado 'pendiente de pago'.
              Le envié recordatorio de pago al contacto del club."
```

### Escenarios de inscripcion

| Situacion | El organizador dice | El agente hace |
|-----------|--------------------|--------------------|
| Club se inscribe tarde | "Aceptalo aunque ya paso la fecha" | Extiende deadline para ese club |
| Club quiere 2 equipos en misma categoria | "Permite que inscriban equipo A y equipo B" | Crea 2 registrations para el mismo club |
| Club cancela | "Club Bello se retiro" | Cambia status a withdrawn, notifica, reembolsa si aplica |
| Jugador no elegible | "Ese jugador tiene 17, no puede jugar sub-15" | Rechaza jugador, notifica al club |
| Club pide cambiar categoria | "Club Sabaneta quiere pasarse de sub-15 a sub-13" | Mueve registration a otra categoria |
| Documentos incompletos | "Cuantos clubes tienen documentos pendientes?" | Resume: "8 clubes con docs incompletos. ¿Envio recordatorio?" |
| Lista de espera | "Ya hay 24 equipos en sub-15, pon al siguiente en lista de espera" | Crea waitlist, avisa al club su posicion |
| Pago parcial | "El club pidio pagar en 2 cuotas" | Registra pago parcial, marca como pendiente del saldo |
| Club quiere cambiar jugador | "Club X quiere sacar a Juan y meter a Pedro" | El club lo hace desde su dashboard, agente valida elegibilidad |
| Verificar plantilla | "Muestrame los jugadores de Club Itagüí" | Lista los 12 jugadores con edad, documento, estado de docs |
| Invitacion no respondida | "Quienes no han respondido?" | "15 clubes no han respondido. ¿Envio recordatorio?" |
| Cerrar inscripciones antes | "Cierra inscripciones, ya tenemos 24 equipos" | Cierra registration, notifica a todos |

---

## 3. Pre-torneo: Cierre y preparacion

### Cerrar inscripciones y generar fixture

```
Organizador: "Ya cerraron inscripciones. ¿Como estamos?"

Agente:      "Resumen de inscripciones:

              Sub-15 Masculino: 22 equipos inscritos (de 24 max)
              • 20 aprobados y pagados ✅
              • 1 pendiente de pago (Club Caldas)
              • 1 pendiente de documentos (Club Girardota)

              Sub-13 Masculino: 18 equipos inscritos
              • 18 aprobados y pagados ✅

              Sub-15 Femenino: 12 equipos inscritos (de 16 max)
              • 11 aprobados ✅
              • 1 pendiente de pago (Academia Bello Fem)

              💰 Total recaudado: $9.800.000 COP
              💰 Pendiente: $550.000 COP (3 equipos)

              ¿Que hacemos con los pendientes?"

Organizador: "Dale plazo hasta mañana a los 3. Si no pagan, quedan fuera."

Agente:      "Envié ultimatum a los 3 clubes: 'Tienen hasta mañana
              viernes 6 de marzo a las 6pm para completar pago/documentos.
              De lo contrario, su inscripcion sera cancelada.'

              Te aviso mañana a las 6pm si pagaron."
```

```
[Al dia siguiente]

Agente:      "⏰ Resultado del ultimatum:
              ✅ Club Caldas pago ($200.000)
              ✅ Academia Bello Fem pago ($150.000)
              ❌ Club Girardota no subio documentos

              ¿Cancelo la inscripcion de Club Girardota?"

Organizador: "Si. Y si hay alguien en lista de espera, que entre."

Agente:      "Club Girardota cancelado y notificado.
              Club Rionegro estaba en lista de espera — les envié
              invitacion para tomar el cupo. Tienen 48h para inscribirse."
```

### Generar fixture

```
Organizador: "Genera el fixture de sub-15 masculino.
              5 grupos de 4, clasifican los 2 primeros a eliminacion."

Agente:      "Con 20 equipos en 5 grupos de 4:

              Fase de grupos: 30 partidos (6 por grupo, 3 jornadas)
              Clasifican 10 equipos (2 por grupo)

              Pero 10 equipos en eliminacion no es potencia de 2.
              Opciones:

              A) 10 equipos → 6 van a cuartos directo (los 5 primeros
                 + mejor segundo) y 4 juegan repechaje
              B) 4 grupos de 5 → clasifican 2 → octavos con 8 equipos
              C) 5 grupos de 4 → clasifican 2 + 2 mejores terceros →
                 octavos con 12... tampoco es potencia de 2
              D) Clasifican 1er lugar + 3 mejores segundos → cuartos con 8

              ¿Cual prefieres?"

Organizador: "La opcion D. Clasifican los 5 primeros y los 3 mejores
              segundos. Cuartos de final con 8."

Agente:      "Perfecto. Fixture generado:

              📋 FASE DE GRUPOS (15-29 mar)
              Grupo A: Siempre Fuertes, Itagüí, Copacabana, Barbosa
              Grupo B: Indep. Medellín, Bello, Caldas, Girardota [espera]
              Grupo C: Acad. Envigado, Sabaneta, La Estrella, Rionegro
              Grupo D: Club Turbo, Club Apartadó, Club Caucasia, Club Yarumal
              Grupo E: Club Marinilla, Club Carmen, Club Andes, Club Jericó

              3 jornadas por grupo. 30 partidos total.

              📋 CUARTOS DE FINAL (12 abr)
              5 primeros de grupo + 3 mejores segundos
              4 partidos

              📋 SEMIFINALES (19 abr)
              2 partidos

              📋 FINAL + 3ER PUESTO (26 abr)
              2 partidos

              Total: 36 partidos

              ¿Quieres que programe horarios y canchas?"
```

### Programar logistica

```
Organizador: "Si. Tenemos 3 canchas disponibles. Los sabados
              podemos jugar de 8am a 6pm. Cada partido dura
              50 minutos con 10 de descanso entre partidos."

Agente:      "Con 3 canchas y partidos de 1 hora (50 min + 10 descanso):

              Por sabado caben: 10 partidos por cancha × 3 canchas = 30 partidos

              Jornada 1 (sab 15 mar): 10 partidos → 1 sabado ✅
              Jornada 2 (sab 22 mar): 10 partidos → 1 sabado ✅
              Jornada 3 (sab 29 mar): 10 partidos → 1 sabado ✅

              Cuartos (sab 12 abr): 4 partidos → medio sabado
              Semis (sab 19 abr): 2 partidos
              Final + 3ro (sab 26 abr): 2 partidos

              📅 Programacion generada:

              SAB 15 MAR — Jornada 1
              Cancha 1: 8:00 Siempre Fuertes vs Itagüí
                        9:00 Indep. Medellín vs Bello
                        10:00 Acad. Envigado vs Sabaneta
                        11:00 ...
              Cancha 2: 8:00 Copacabana vs Barbosa
                        9:00 Caldas vs [por definir]
                        ...
              Cancha 3: 8:00 Club Turbo vs Club Apartadó
                        ...

              ¿Ajusto algo?"

Organizador: "El partido de la final hazlo a las 4pm, no tan temprano.
              Y pon a Siempre Fuertes vs Indep. Medellín en la misma
              jornada en canchas diferentes, no quiero que coincidan."

Agente:      "Listo:
              • Final movida a 4:00pm (26 abr, Cancha Central)
              • Siempre Fuertes e Indep. Medellín nunca juegan en paralelo

              Programacion completa lista. ¿La publico?"
```

### Publicar y compartir

```
Organizador: "Publica todo. Y manda el fixture a todos los clubes."

Agente:      "Publicado:
              🌐 widdo.co/torneo/departamental-sub15-antioquia-2026

              Incluye: fixture completo, horarios, canchas, categorias,
              equipos inscritos, reglamento.

              📧 Enviado a los 20 clubes con su calendario personalizado:
              cada club recibe solo SUS partidos con fechas y canchas.

              📱 Link para compartir en redes generado."
```

### Escenarios pre-torneo

| Situacion | El organizador dice | El agente hace |
|-----------|--------------------|--------------------|
| Equipo se retira despues del sorteo | "Club Barbosa se retiro del torneo" | Lo saca del grupo, recalcula. Si hay waitlist, ofrece reemplazo. Si no, grupo queda de 3 |
| Cambiar cabezas de serie | "Pon a los 5 mejores rankeados como cabezas de serie" | Redistribuye el sorteo con seeding |
| Sorteo parece injusto | "El grupo A esta muy fuerte, mueve a uno al grupo E" | Intercambia equipo entre grupos, regenera partidos |
| Agregar arbitros | "El arbitro del partido 1 es Carlos Rojas" | Asigna arbitro al match |
| Necesita mas canchas | "Consegui una 4ta cancha, redistribuye" | Recalcula horarios con 4 canchas, partidos mas temprano |
| Acreditaciones | "Genera las credenciales de todos los jugadores" | Genera PDF/QR con foto, nombre, club, categoria, dorsal |
| Cambio de sede | "La cancha 2 no esta disponible el 22 de marzo" | Redistribuye partidos de esa fecha entre cancha 1 y 3 |
| Agregar fecha | "Necesito un domingo extra para terminar grupos" | Agrega fecha, redistribuye partidos sobrantes |

---

## 4. Dia del torneo: Logistica

### Check-in de equipos

```
Agente:      "📋 Buenos dias. Hoy: Jornada 1 — Sub-15 Masculino

              10 partidos programados (3 canchas, 8am-1pm)

              Estado de equipos:
              ✅ 7/10 equipos confirmaron asistencia
              ⚠️ 2 no han confirmado (Club Caldas, Club Yarumal)
              ❌ 1 aviso que no viene (Club Jericó — bus se les daño)

              Primer partido en 45 min:
              8:00 Cancha 1: Siempre Fuertes vs Itagüí
              8:00 Cancha 2: Copacabana vs Barbosa
              8:00 Cancha 3: Club Turbo vs Club Apartadó

              ¿Que hacemos con Club Jericó?"

Organizador: "Dales walkover a su rival. Y si Club Caldas no llega
              a las 8, walkover tambien."

Agente:      "Entendido:
              ❌ Club Jericó vs Club Andes → W.O. para Club Andes (20-0)
              ⏳ Club Caldas: si no llega a las 8:00, W.O. automatico

              ¿Quieres que notifique a Club Andes que ya ganaron?"
```

### Verificacion de jugadores

```
Organizador: "El delegado de cancha 1 dice que Club Itagüí
              tiene un jugador que parece mayor. Verifica a
              Santiago Torres, dorsal 7."

Agente:      "Santiago Torres — Club Baloncesto Itagüí
              📅 Nacimiento: 15/03/2013 (12 años)
              📝 Registrado como jugador menor (2013, fuera de rango 2011-2012)
              📄 Registro civil: ✅ verificado

              Esta dentro de los 2 menores permitidos por equipo.
              Club Itagüí tiene 2 menores: Santiago Torres y Luis García.

              El jugador es legal. ¿Quieres que le informe al delegado?"
```

### Escenarios dia del torneo

| Situacion | El organizador dice | El agente hace |
|-----------|--------------------|--------------------|
| Equipo llego incompleto | "Club X llego con 8 jugadores, necesitan 10 minimo" | Verifica regla minima. Si no cumple, opciones: esperar 15 min, jugar con los que hay, o W.O. |
| Jugador no acreditado | "Hay un jugador de Club Y que no esta en la lista" | Verifica. Si no esta inscrito, no puede jugar. El club puede agregarlo si inscripciones no cerraron |
| Cambio de cancha | "Cancha 2 se inundo, mueve todo a cancha 1 y 3" | Redistribuye partidos del dia entre canchas disponibles |
| Retraso general | "Llevamos 30 min de retraso en todo" | Recalcula todos los horarios del dia +30 min, notifica equipos |
| Emergencia medica | "Se lesiono un jugador, paramos el partido 15 min" | Pausa el partido, registra interrupcion, ajusta horarios siguientes |
| Equipo quiere cambiar camiseta | "Club A y Club B tienen el mismo color" | Registra que Club B juega de visitante (camiseta alternativa) |
| Clima | "Empezo a llover, suspendemos hasta que pare" | Suspende partidos en curso (guarda marcador parcial), reprograma |
| Delegado pregunta regla | "¿Cuantos tiempos muertos tiene cada equipo?" | Consulta reglamento del torneo y responde |

---

## 5. Durante el torneo: Partidos en vivo

### Flujo de un partido completo

```
Organizador: "Empezo el partido cancha 1, Siempre Fuertes vs Itagüí"

Agente:      "⏱️ Partido iniciado: Siempre Fuertes vs Club Itagüí
              Grupo A — Jornada 1 — Cancha 1
              🔴 EN VIVO en widdo.co/torneo/..."

Organizador: "Canasta de Siempre Fuertes, Juan Pérez, 2 puntos"

Agente:      "Siempre Fuertes 2 - 0 Club Itagüí
              🏀 Juan Pérez (+2pts)"

Organizador: "Triple de Itagüí, dorsal 7"

Agente:      "Siempre Fuertes 2 - 3 Club Itagüí
              🏀 Santiago Torres #7 (+3pts)"

Organizador: "Falta personal del 4 de Siempre Fuertes"

Agente:      "Falta registrada: #4 Siempre Fuertes (2da falta personal)
              ¿Tiros libres para Itagüí?"

Organizador: "Si, metio 1 de 2"

Agente:      "Siempre Fuertes 2 - 4 Club Itagüí
              🏀 Tiro libre (+1pt)"

Organizador: "Fin del primer cuarto. 12-8 para Siempre Fuertes."

Agente:      "Primer cuarto finalizado.
              Siempre Fuertes 12 - 8 Club Itagüí

              📊 Parciales: Q1: 12-8
              🏀 Lider anotador: Juan Pérez (6pts)

              Descanso. ¿Inicio del segundo cuarto?"

[... partido continua ...]

Organizador: "Termino el partido. Final: 45-38 Siempre Fuertes."

Agente:      "Partido finalizado ✅

              Siempre Fuertes 45 - 38 Club Itagüí
              📊 Parciales: Q1: 12-8 | Q2: 10-12 | Q3: 13-8 | Q4: 10-10
              🏀 MVP: Juan Pérez (18pts, 5reb, 3ast)

              Tabla Grupo A actualizada:
              1. Siempre Fuertes  1-0  +7   2pts
              2. Copacabana       0-0   0   0pts  (juega a las 9:00)
              3. Club Itagüí      0-1  -7   0pts
              4. Club Barbosa     0-0   0   0pts  (juega a las 9:00)

              Siguiente partido cancha 1: 9:00 — Indep. Medellín vs Bello"
```

### Multiples partidos simultaneos

```
Organizador: "Empezaron los 3 partidos de las 9:00"

Agente:      "⏱️ 3 partidos en vivo:

              Cancha 1: Indep. Medellín vs Bello         0-0
              Cancha 2: Acad. Envigado vs Sabaneta       0-0
              Cancha 3: Club Marinilla vs Club Carmen     0-0

              Dame los marcadores cuando quieras. Puedo
              manejar los 3 simultaneamente."

Organizador: "Cancha 1: Medellin 8, Bello 5.
              Cancha 3: Marinilla 12, Carmen 6.
              Cancha 2 sigue 0-0."

Agente:      "Actualizado:
              Cancha 1: Indep. Medellín 8 - 5 Bello
              Cancha 2: Acad. Envigado 0 - 0 Sabaneta
              Cancha 3: Club Marinilla 12 - 6 Club Carmen

              Todo en vivo. 47 personas viendo online ahora."
```

### Modos de input para el organizador

El agente debe aceptar cualquier forma de reportar:

```
# Modo detallado (evento por evento)
"Gol de Siempre Fuertes, Juan Pérez, minuto 12"

# Modo rapido (solo marcador)
"Cancha 1: 15-12"

# Modo parcial (fin de periodo)
"Fin del primer cuarto, 12-8 Siempre Fuertes"

# Modo final (solo resultado)
"Termino cancha 2, gano Envigado 52-41"

# Modo batch (varios partidos)
"Resultados de la jornada 2:
 Siempre Fuertes 55 - Copacabana 48
 Itagüí 62 - Barbosa 51
 Medellín 70 - Caldas 45"

# Modo voz (transcripcion)
"Triple de Itagüí... no, perdon, de Siempre Fuertes"
Agente: "Registré triple para Siempre Fuertes. ¿Correcto?"
```

---

## 6. Durante el torneo: Imprevistos

### Cada imprevisto posible

#### Equipo no se presenta

```
Organizador: "Club Yarumal no llego. Ya pasaron 15 minutos."

Agente:      "Segun el reglamento, hay 15 min de tolerancia (ya pasaron).

              Opciones:
              A) W.O. para su rival (Club Caucasia gana 20-0)
              B) Esperar 15 min mas
              C) Reprogramar el partido

              ¿Que prefieres?"

Organizador: "Walkover"

Agente:      "W.O. registrado. Club Caucasia gana 20-0.
              Tabla Grupo D actualizada. Club Yarumal notificado."
```

#### Equipo se retira a mitad del torneo

```
Organizador: "Club Barbosa dice que no viene a la jornada 2 ni 3. Se retiran."

Agente:      "Club Barbosa se retira del torneo. Tiene 1 partido jugado
              (perdio 45-60 vs Copacabana).

              Opciones para sus partidos:
              A) W.O. para los rivales pendientes (Siempre Fuertes e Itagüí)
                 y MANTENER el resultado vs Copacabana
              B) ANULAR todos sus resultados (como si no hubieran existido)
                 — Copacabana pierde esos puntos
              C) Descalificacion: todos sus resultados son W.O., incluyendo
                 el partido ya jugado

              ¿Que hacemos?"

Organizador: "Opcion A. El partido contra Copacabana ya se jugo, se queda."

Agente:      "Listo:
              ✅ Barbosa vs Siempre Fuertes → W.O. Siempre Fuertes (20-0)
              ✅ Barbosa vs Itagüí → W.O. Itagüí (20-0)
              ✅ Copacabana 60 - 45 Barbosa → se mantiene

              Grupo A queda:
              1. Siempre Fuertes  2-0  +27  4pts (1 jugado, 1 W.O.)
              2. Copacabana       1-0  +15  2pts
              3. Club Itagüí      1-1   13  2pts (1 jugado, 1 W.O.)
              4. Club Barbosa     RETIRADO

              Solo falta: Siempre Fuertes vs Copacabana (J2) e
              Itagüí vs Copacabana (J3) para cerrar el grupo."
```

#### Protesta / reclamo de un club

```
Organizador: "Club Sabaneta protesto. Dicen que un jugador de Envigado
              tiene 16 años y es sub-15."

Agente:      "Revisé la plantilla de Acad. Envigado:

              Todos los jugadores tienen documentos verificados.
              El jugador mas grande es Andrés Gómez, nacido 04/01/2011
              (15 años cumplidos). Esta dentro del rango sub-15 (2011-2012).

              No hay irregularidad segun los documentos registrados.

              Si Club Sabaneta insiste, pueden presentar protesta formal.
              ¿Quieres que registre la protesta en actas?"

Organizador: "Si, regístrala pero el resultado se mantiene."

Agente:      "Protesta registrada en actas del torneo:
              'Club Sabaneta protesta contra Acad. Envigado — posible
              jugador fuera de edad. Documentos verificados, resultado
              se mantiene. Decisión del organizador: rechazo de protesta.'

              Firmada digitalmente por el organizador."
```

#### Error en el marcador

```
Organizador: "Me equivoqué, el resultado de Cancha 2 no era 52-41, era 52-44"

Agente:      "Corregido: Acad. Envigado 52 - 44 Sabaneta
              Diferencia cambia de +11 a +8.
              Tabla del Grupo C recalculada. Sin cambio de posiciones.
              Registré la correccion en el historial."
```

#### Cambio de jugador entre partidos

```
Organizador: "Club Siempre Fuertes quiere cambiar a un jugador lesionado
              por otro de su plantilla."

Agente:      "En la plantilla inscrita de Siempre Fuertes hay 12 jugadores.
              ¿El jugador nuevo ya esta en la plantilla del torneo o hay
              que agregarlo?"

Organizador: "No esta. Es uno que no inscribieron al principio."

Agente:      "Segun el reglamento, ¿se permite agregar jugadores despues
              del inicio del torneo? Si es tu decision como organizador,
              puedo agregarlo.

              Datos que necesito del club:
              - Nombre completo
              - Documento
              - Fecha nacimiento
              - Documentos requeridos (registro civil, EPS, foto)

              El club puede subirlo desde su dashboard de Widdo."

Organizador: "Que lo suban ellos, pero yo lo apruebo."

Agente:      "Le envié notificacion a Club Siempre Fuertes para que
              agreguen al jugador desde su dashboard. Te aviso cuando
              lo suban para que lo apruebes."
```

#### Empate en eliminacion directa

```
Agente:      "⚠️ Partido de cuartos finalizado en empate:
              Siempre Fuertes 58 - 58 Club Marinilla

              Segun el formato de eliminacion, no puede haber empate.

              Opciones configuradas para este torneo:
              A) Tiempo extra (5 minutos)
              B) Tiros libres (5 por equipo)
              C) Muerte subita

              ¿Que aplica?"

Organizador: "Tiempo extra de 5 minutos"

Agente:      "Tiempo extra iniciado.
              Siempre Fuertes 58 - 58 Club Marinilla
              ⏱️ Overtime — 5:00"
```

#### Partido suspendido

```
Organizador: "Se fue la luz en el coliseo. Suspende todos los partidos."

Agente:      "Partidos suspendidos:

              Cancha 1: Indep. Medellín 32 - 28 Bello (2do cuarto, 3:45)
              Cancha 2: Envigado vs La Estrella (no habia empezado)
              Cancha 3: Club Turbo 15 - 15 Club Apartadó (1er cuarto, 7:20)

              Guardé marcadores parciales y tiempo de juego.

              Opciones:
              A) Esperar que vuelva la luz y reanudar desde donde iban
              B) Reprogramar para otro dia (mantener marcadores parciales)
              C) Anular y rejugar desde cero

              El partido de Envigado que no empezó se reprograma sin problema."

Organizador: "Esperemos 30 minutos. Si no vuelve, reprogramamos todo
              para el domingo."

Agente:      "Entendido. Te aviso en 30 minutos. Si no hay luz, reprogramo
              todo para domingo a las mismas horas. Los marcadores parciales
              se mantienen."
```

---

## 7. Transicion entre fases

### De grupos a eliminacion

```
Agente:      "📋 Fase de grupos completada. Resultados finales:

              GRUPO A          PJ  PG  PP  PF   PC   DIF  PTS
              Siempre Fuertes   3   3   0  165  120  +45   6
              Copacabana        3   2   1  148  135  +13   4
              Club Itagüí       3   1   2  130  142  -12   2
              Club Barbosa      RETIRADO

              [... Grupos B, C, D, E ...]

              CLASIFICADOS A CUARTOS:
              5 primeros de grupo + 3 mejores segundos

              1. Siempre Fuertes (1° Grupo A, 6pts, +45)
              2. Indep. Medellín (1° Grupo B, 6pts, +38)
              3. Acad. Envigado (1° Grupo C, 5pts, +22)
              4. Club Turbo (1° Grupo D, 5pts, +18)
              5. Club Marinilla (1° Grupo E, 4pts, +15)
              6. Copacabana (2° Grupo A, 4pts, +13) — mejor 2do
              7. Club Bello (2° Grupo B, 4pts, +10) — 2do mejor 2do
              8. Sabaneta (2° Grupo C, 3pts, +5) — 3er mejor 2do

              ¿Genero el cuadro de cuartos? ¿Con que criterio de cruce?

              A) 1° vs 8°, 2° vs 7°, etc. (seeding por posicion)
              B) 1°A vs 2°B, 1°B vs 2°A, etc. (cruce por grupo)
              C) Sorteo aleatorio
              D) Manual (tu decides los cruces)"

Organizador: "Opcion A, por seeding."

Agente:      "Cuartos de final generados:

              QF1: Siempre Fuertes vs Sabaneta      (sab 12 abr, 8:00, Cancha 1)
              QF2: Indep. Medellín vs Club Bello     (sab 12 abr, 8:00, Cancha 2)
              QF3: Acad. Envigado vs Copacabana      (sab 12 abr, 9:30, Cancha 1)
              QF4: Club Turbo vs Club Marinilla       (sab 12 abr, 9:30, Cancha 2)

              SF1: Ganador QF1 vs Ganador QF4        (sab 19 abr, 10:00)
              SF2: Ganador QF2 vs Ganador QF3        (sab 19 abr, 11:30)

              3er puesto: Perdedor SF1 vs Perdedor SF2  (sab 26 abr, 2:00pm)
              FINAL: Ganador SF1 vs Ganador SF2         (sab 26 abr, 4:00pm)

              Publicado y enviado a los 8 clubes clasificados."
```

### Escenarios de transicion

| Situacion | El organizador dice | El agente hace |
|-----------|--------------------|--------------------|
| Empate en puntos entre segundos | "¿Quien es mejor segundo?" | Aplica criterios de desempate: confrontacion directa, diferencia, puntos a favor |
| Quiere agregar repechaje | "Que los terceros jueguen repechaje" | Crea ronda extra con los 5 terceros |
| Quiere cambiar cruces | "No quiero que Medellín y Envigado se crucen en cuartos" | Ajusta bracket manualmente |
| Wild card | "Mete al mejor cuarto como wild card" | Agrega equipo #9 al bracket, reorganiza |
| Club protesta clasificacion | "Sabaneta dice que deberian clasificar ellos, no Copacabana" | Muestra calculo detallado con criterios de desempate |

---

## 8. Post-torneo

### Finalizar torneo

```
Agente:      "🏆 FINAL — Siempre Fuertes 62 - 55 Indep. Medellín

              ¡Torneo Departamental Sub-15 Masculino 2026 finalizado!

              🥇 Campeon: Club Siempre Fuertes
              🥈 Subcampeon: Independiente Medellín Sub
              🥉 Tercer puesto: Acad. Envigado

              📊 ESTADISTICAS DEL TORNEO:
              • 36 partidos jugados (34 regulares + 2 W.O.)
              • 20 equipos participantes
              • 240 jugadores
              • 2,847 puntos anotados
              • Promedio: 79.1 pts por partido

              🏀 GOLEADOR: Juan Pérez (Siempre Fuertes) — 127 pts, 8 partidos
              🏀 MVP: Juan Pérez (Siempre Fuertes) — 15.9 pts/partido
              🏀 Mejor defensa: Acad. Envigado — 42.3 pts recibidos/partido

              💰 FINANCIERO:
              • Recaudado inscripciones: $3.900.000 COP
              • Reembolso Club Barbosa: -$200.000 COP
              • Comision Widdo (5%): -$185.000 COP
              • Neto organizador: $3.515.000 COP

              ¿Que quieres hacer ahora?"
```

### Compartir resultados

```
Organizador: "Publica los resultados finales y mandalo a todos los clubes."

Agente:      "Publicado en widdo.co/torneo/departamental-sub15-antioquia-2026

              La pagina ahora muestra:
              ✅ Podio (campeon, sub, tercero)
              ✅ Bracket completo con todos los resultados
              ✅ Tabla de posiciones final
              ✅ Estadisticas y premios individuales
              ✅ Fotos (si se subieron)

              📧 Email enviado a los 20 clubes con resumen y link.
              📊 PDF del acta final generado y adjunto."
```

### Informes y actas

```
Organizador: "Necesito un informe completo para Indeportes"

Agente:      "Generé el informe con:

              📋 Acta del torneo:
              • Datos generales (nombre, fechas, sede, organizador)
              • Listado completo de equipos y jugadores (con documentos)
              • Resultados de todos los partidos
              • Tablas de posiciones por grupo
              • Bracket de eliminacion
              • Estadisticas individuales y por equipo
              • Protestas registradas y resoluciones
              • Informe financiero
              • Historial de incidencias (W.O., retiros, cambios)

              Disponible en PDF y Excel. ¿Lo envio a algun email?"
```

### Escenarios post-torneo

| Situacion | El organizador dice | El agente hace |
|-----------|--------------------|--------------------|
| Corregir resultado historico | "El resultado de J2 Grupo B estaba mal, era 55-50 no 55-52" | Corrige, recalcula tablas. Si afecta clasificacion, avisa |
| Generar certificados | "Genera certificados de participacion para todos" | PDF personalizado por jugador/equipo |
| Planificar siguiente edicion | "Crea la edicion 2027 con la misma config" | Clona torneo sin inscripciones |
| Invitar de nuevo | "Invita a los mismos clubes para la proxima edicion" | Usa la lista de este torneo para invitar |
| Metricas para patrocinadores | "Necesito un reporte de impacto para Gatorade" | Genera: equipos, jugadores, partidos, visitas al portal, alcance redes |

---

## 9. Escenarios especiales

### Torneo de deporte individual (tenis)

```
Organizador: "Quiero hacer un torneo de tenis. 32 jugadores.
              Eliminacion directa. Mejor de 3 sets."

Agente:      "Creé torneo de tenis:
              🎾 Tipo: Individual
              🏆 Formato: Eliminacion directa (32 → 16 → 8 → 4 → 2 → Final)
              📊 Sets: Mejor de 3 (tie-break a 6-6)

              31 partidos total (5 rondas).
              ¿Categorias? ¿Abierto, por edad, por ranking?"

Organizador: "Abierto masculino y femenino. Los jugadores se inscriben solos,
              no como club."

Agente:      "Entendido. Inscripcion individual — cada jugador se registra
              por su cuenta (no necesita club).

              Formulario de inscripcion pedira:
              Nombre, documento, fecha nacimiento, ranking (opcional),
              contacto, foto.

              ¿Publico el link de inscripcion?"
```

```
[Durante el partido]

Organizador: "Primer set: Pérez gana 6-4"

Agente:      "Set 1: Pérez 6 - 4 Gómez
              Pérez lidera 1-0 en sets.
              ¿Segundo set?"

Organizador: "Segundo set: Gómez 7-6, fue tie-break 7-5"

Agente:      "Set 2: Gómez 7(7) - 6(5) Pérez
              Empate 1-1 en sets. Tercer set decisivo."

Organizador: "Tercer set: Pérez 6-2. Gana Pérez."

Agente:      "Partido finalizado ✅
              Pérez def. Gómez: 6-4, 6-7(5), 6-2
              Pérez avanza a cuartos de final.
              Siguiente partido: Pérez vs ganador de López-Martínez."
```

### Torneo multi-sede (nacional)

```
Organizador: "Copa T&E Nacional. Eliminatorias regionales en 5 ciudades,
              la final nacional en Bogotá."

Agente:      "Entendido. Estructura multi-sede:

              FASE 1 — Eliminatorias regionales (simultáneas)
              📍 Medellín: 8 equipos → clasifican 2
              📍 Cali: 8 equipos → clasifican 2
              📍 Barranquilla: 6 equipos → clasifican 2
              📍 Bucaramanga: 6 equipos → clasifican 2
              📍 Bogotá: 8 equipos → clasifican 2

              FASE 2 — Final Nacional en Bogotá
              10 equipos clasificados → grupos + eliminacion

              Cada sede tiene su propio calendario y canchas.
              ¿Quieres delegados por sede que puedan reportar resultados?"

Organizador: "Si, cada sede tiene un delegado que reporta."

Agente:      "Perfecto. Agrego 5 co-organizadores (uno por sede).
              Cada uno puede reportar resultados solo de su sede.
              Todos los resultados se ven en el portal publico unificado."
```

### Torneo con fase clasificatoria online

```
Organizador: "Quiero que los equipos envien video de sus mejores jugadas
              como clasificatoria. Los 16 mejores pasan al torneo presencial."

Agente:      "Creé fase de clasificacion:

              Fase 1: Clasificatoria por video
              • Equipos suben video (max 3 min)
              • Fecha limite: 1 de marzo
              • Tu (organizador) evaluas y seleccionas los 16 mejores

              Fase 2: Torneo presencial con los 16 clasificados

              ¿Quieres agregar criterios de evaluacion (creatividad,
              tecnica, trabajo en equipo)?"
```

### Torneo recurrente (liga)

```
Organizador: "Quiero una liga que dure todo el año. Todos contra todos,
              ida y vuelta. Se juega cada sabado."

Agente:      "Creé liga anual:
              🏆 Formato: Todos contra todos, ida y vuelta
              📅 Enero — Noviembre 2026

              Con 12 equipos: 22 jornadas (132 partidos)
              1 jornada por sabado = 22 semanas
              6 partidos por jornada (todos juegan cada sabado)

              ¿Genero el fixture completo del año?"
```

### Torneo con patrocinio y premios en especie

```
Organizador: "Gatorade nos da 500 botellas. Quiero repartir
              50 al campeon, 30 al sub, y el resto entre todos."

Agente:      "Registré premios en especie:
              🏆 Campeon: Trofeo + $2M + 50 botellas Gatorade
              🥈 Sub: Trofeo + $1M + 30 botellas Gatorade
              🥉 Tercero: Medallas + 20 botellas Gatorade
              Participacion: 400 botellas repartidas (20 por equipo)

              Logo de Gatorade como patrocinador en la pagina publica."
```

---

## Resumen: Lo que el agente IA debe poder hacer

### Capacidades del agente

| Categoria | Acciones |
|-----------|----------|
| **Crear** | Torneo, categorias, documentos requeridos, premios, reglas |
| **Invitar** | Clubes Widdo, emails externos, compartir link, reenviar, masivo |
| **Gestionar inscripciones** | Aprobar, rechazar, lista de espera, reembolsar, extender plazo |
| **Generar fixture** | Cualquier formato, con seeding, sorteo, canchas, horarios |
| **Modificar fixture** | Mover equipos, cambiar cruces, agregar rondas, regenerar |
| **Partidos** | Iniciar, marcador, eventos, pausar, reanudar, finalizar, W.O. |
| **Multiples canchas** | Manejar N partidos simultaneos, diferentes sedes |
| **Imprevistos** | W.O., descalificacion, reemplazo, suspension, reprogramacion |
| **Reglas** | Consultar reglamento, resolver dudas, aplicar criterios |
| **Transiciones** | Clasificar de grupos a eliminacion, repechajes, wild cards |
| **Verificar** | Elegibilidad de jugadores, documentos, edad, plantilla |
| **Corregir** | Cambiar resultados, recalcular todo, registrar en historial |
| **Notificar** | Emails a clubes, recordatorios, ultimatums, resultados |
| **Reportar** | Actas, informes Indeportes, estadisticas, certificados, PDF |
| **Financiero** | Cobros, reembolsos, comisiones, resumen financiero |
| **Publicar** | Portal publico, compartir redes, widget embebible |
| **Proactivo** | Avisar inscripciones nuevas, recordar pendientes, sugerir acciones |

### Lo que el agente NO hace (lo hace el club)

| Accion | Quien lo hace |
|--------|---------------|
| Aceptar invitacion al torneo | El club (owner/admin) desde su dashboard |
| Seleccionar categoria | El club |
| Asignar jugadores de SU plantilla | El club |
| Subir documentos de SUS jugadores | El club |
| Pagar inscripcion | El club |
| Cambiar jugadores de su equipo | El club (con aprobacion del organizador si ya empezo) |

### Lo que el publico ve (sin login)

| Pagina | Contenido |
|--------|-----------|
| `/torneo/{slug}` | Info del torneo, categorias, equipos, fixture, resultados |
| `/torneo/{slug}/vivo` | Marcadores en vivo, partidos en curso |
| `/torneo/{slug}/posiciones` | Tablas de posiciones por grupo/general |
| `/torneo/{slug}/estadisticas` | Goleadores, MVPs, stats por equipo |
| `/torneos` | Directorio de todos los torneos publicos |
