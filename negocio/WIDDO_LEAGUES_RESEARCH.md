# Widdo Leagues - Investigacion de Producto

Fecha: Febrero 2026
Proposito: Fundamentar el diseno de Widdo Leagues como producto peer dentro del ecosistema Widdo

---

## Ecosistema Widdo (4 Productos)

```
widdo.co/register
    ├── "Voy a gestionar un CLUB"        → Widdo Clubs       (EXISTE)
    ├── "Voy a gestionar una LIGA"        → Widdo Leagues     (NUEVO)
    ├── "Voy a organizar TORNEOS"         → Widdo Tournaments (EN DESARROLLO)
    └── (futuro) "Quiero capacitarme"     → Widdo Academy     (FUTURO)
```

Un solo usuario puede tener multiples roles en multiples productos:
- Maria puede ser presidenta de la Liga Antioquena (Leagues)
- Y al mismo tiempo mama de un jugador en Club X (Clubs, rol padre)
- Y organizar un torneo invitacional (Tournaments)
- Todo desde la misma cuenta, cambiando contexto

---

## 1. Jerarquia del Deporte Organizado

### Estructura Universal

```
Federacion Internacional (FIFA, FIBA, World Athletics, etc.)
  └── Federacion Nacional (FCF, Fecolcesto, etc.)
        └── Liga Departamental / State Association
              └── Club Deportivo
                    └── Equipo (por categoria)
                          └── Jugador / Deportista
```

### Modelo Colombiano (Ley 181/1995 + Decreto 1228/1995)

- Ministerio del Deporte (antes Coldeportes)
- Federacion Nacional por deporte
- Liga Departamental (una por deporte por departamento)
- Club Deportivo
- Deportista

**Fuentes legales:**
- [Ley 181 de 1995 - Ley del Deporte](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=3424)
- [Decreto 1228 de 1995 - Organismos Deportivos](https://www.mineducacion.gov.co/1780/articles-86226_archivo_pdf.pdf)
- [Requisitos Liga Departamental - JurisDeportiva](https://jurisdeportiva.com/requisitos-minimos-para-la-constitucion-de-una-liga-departamental-en-colombia/)

---

## 2. Funciones de una Liga (que NO existen en Widdo Clubs)

| Funcion | Descripcion | Existe en Clubs? |
|---------|-------------|------------------|
| **Afiliacion de clubes** | Gestionar clubes miembros, verificar requisitos, aprobar/rechazar | NO |
| **Registro centralizado de deportistas** | Ver jugadores de TODOS los clubes, verificar elegibilidad, emitir pases | NO |
| **Convocatorias a seleccion** | Crear "Seleccion Antioquia Sub-15", pruebas fisicas/psicologicas | NO |
| **Transferencias** | Mover jugador de Club A a Club B, verificar deudas/sanciones | NO |
| **Sistema disciplinario** | Sanciones, tribunal, apelaciones, historial | NO |
| **Calendario competitivo** | Campeonatos departamentales con fixtures, arbitros, resultados | PARCIAL (torneos basicos) |
| **Reportes a Indeportes** | Censo deportistas, estados financieros, actas asamblea | NO |
| **Cobros a clubes** | Afiliaciones anuales, inscripciones a torneos, multas | NO (solo cobra a familias) |
| **Comunicaciones oficiales** | Circulares, convocatorias a asambleas, resoluciones | PARCIAL |

**Conclusion:** La liga tiene funcionalidades completamente diferentes al club. No es un modulo, es un producto.

---

## 3. Convocatorias - El Diferenciador

### Como funciona en la realidad (Colombia)

**Ejemplo real - Liga de Baloncesto del Huila (Feb 2026):**
La liga publico su Boletin Informativo 001 convocando jugadores nacidos 2009-2010 para la preseleccion Sub-17. Se esperaban 50-60 deportistas en jornadas de evaluacion en el coliseo Alvaro Sanchez.

Fuente: [La Nacion - Liga Baloncesto Huila](https://www.lanacion.com.co/liga-de-baloncesto-del-huila-hara-convocatoria-en-categoria-sub-17/)

### El proceso tipico

```
1. Liga publica convocatoria (fechas, categorias, requisitos)
2. Clubes nominan jugadores / jugadores se inscriben con aval del club
3. Pruebas fisicas: velocidad, resistencia, fuerza, agilidad
4. Pruebas tecnicas: especificas del deporte
5. Evaluacion por cuerpo tecnico (puntaje)
6. Lista final de seleccionados + suplentes
7. Microciclos de entrenamiento de la seleccion
```

### Tests fisicos estandar usados

| Test | Mide | Unidad |
|------|------|--------|
| Sprint 20m / 40m | Velocidad | Segundos |
| Test de Leger (beep test) | Resistencia aerobica | Nivel |
| Test de Cooper (12 min) | VO2 max estimado | Metros |
| Salto vertical (CMJ) | Potencia piernas | Centimetros |
| Salto horizontal | Potencia explosiva | Centimetros |
| T-Test | Agilidad | Segundos |
| Illinois Agility | Cambios de direccion | Segundos |
| Sit and Reach | Flexibilidad | Centimetros |

### Evaluacion psicologica (indicadores)

| Indicador | Escala | Metodo |
|-----------|--------|--------|
| Motivacion competitiva | 1-5 | Observacion + cuestionario |
| Trabajo en equipo | 1-5 | Observacion en juego |
| Liderazgo | 1-5 | Observacion en juego |
| Control emocional | 1-5 | Observacion bajo presion |
| Disciplina tactica | 1-5 | Observacion en juego |
| Resiliencia | 1-5 | Observacion ante adversidad |

### Estado actual: gestion informal

Un estudio de la Universidad de Caldas sobre ligas y clubes deportivos encontro:
- **69.56% de las ligas usan herramientas TIC** (pero eso incluye Excel y WhatsApp)
- **Solo 30.43% enfatizan innovacion** en sus procesos
- Existe una **brecha entre adopcion tecnologica e innovacion real**: usan tecnologia para "fortalecer la administracion existente", no para transformar procesos

Fuente: [Redalyc - Administracion, Gestion y Cluster en Ligas y Clubes Deportivos](https://www.redalyc.org/journal/646/64678795002/html/)

Otro estudio de la Universidad Tecnologica de Pereira encontro que muchos clubes y ligas "no estan suficientemente estructurados administrativa y deportivamente" y operan "informalmente y sin los requisitos exigidos por las instituciones municipales y departamentales".

Fuente: [UTP - Caracterizacion Administrativa Clubes Deportivos](https://repositorio.utp.edu.co/server/api/core/bitstreams/0e7fd4b5-df6e-4327-9622-7076013367b0/content)

### Lo verificado vs lo inferido

| Afirmacion | Verificado? | Fuente |
|------------|-------------|--------|
| Las ligas hacen convocatorias con pruebas fisicas | SI | Convocatoria Liga Huila 2026, proceso de seleccion colombiano documentado |
| Ningun competidor automatiza convocatorias con tests | SI | Revision de 9 competidores (TeamSnap, SportsEngine, LeagueApps, GotSport, Stack Sports, Demosphere, Jersey Watch, SportLoMo, Playinga) |
| Las ligas usan Excel/metodos manuales para esto | PARCIALMENTE | 69.56% usa TIC (incluye Excel), solo 30.43% innova. No encontre fuente que diga textualmente "usan Excel para convocatorias" |
| Es el killer feature de Widdo | OPINION FUNDAMENTADA | Ningun competidor lo tiene + es un dolor real de las ligas |

---

## 4. Flujos de Pago Reales (Liga ≠ Split Payments)

### Como funcionan los pagos en la realidad

```
Jugador/Familia  → paga a →  Club        (mensualidad, inscripcion, uniforme)
Club             → paga a →  Liga        (afiliacion anual, inscripcion a torneo)
Liga             → paga a →  Federacion  (cuotas de la liga a la federacion)
```

**Cada flujo es una transaccion separada.** El jugador NO le paga a la liga directamente. Por lo tanto, split payments (como hace SportLoMo en Europa) **NO aplica** para el modelo colombiano.

### Lo que SI necesita Widdo Leagues en cobros

La liga necesita cobrarle a sus clubes afiliados:
- **Afiliacion anual** — cuota para pertenecer a la liga
- **Inscripcion a torneos** — para participar en campeonatos departamentales
- **Multas/Sanciones** — cobros del sistema disciplinario
- **Cuotas extraordinarias** — aprobadas en asamblea

Esto es un sistema de cobros Liga → Club (similar al sistema de cobros Club → Familia que ya existe en Widdo Clubs, pero en otro nivel jerarquico).

### Nota sobre SportLoMo

SportLoMo (Irlanda) es la unica plataforma que tiene "split payments" donde un solo pago del jugador se divide entre club, liga y federacion. Esto funciona en modelos europeos donde el jugador paga una membresia unica. En Colombia el modelo es diferente: los pagos fluyen por niveles separados. No es un referente aplicable.

Fuente para referencia: [SportLoMo - Split Payments](https://www.sportlomo.com/split-payments-registration/)

---

## 5. Competidores - Precios Verificados

### Tabla con fuentes directas

| Plataforma | Precio Verificado | Transaction Fee | Fuente Directa |
|---|---|---|---|
| **TeamSnap** Clubs & Leagues | Custom quote (antes $599/ano, ahora no publican) | Per-event fees (no especificado) | [teamsnap.com/pricing](https://www.teamsnap.com/pricing) |
| **SportsEngine Motion** | $295 setup unico, sin mensualidad | 1% tech fee + 2.9% + $0.30 por tx | [sportsengine.com/motion/pricing](https://www.sportsengine.com/motion/pricing/) |
| **SportsEngine HQ** | $79-$219/mes o desde $799/ano | Incluido en suscripcion | [g2.com/sportsengine/pricing](https://www.g2.com/products/sportsengine/pricing) |
| **LeagueApps** | $495 one-time | % por transaccion (no publican el %) | [leagueapps.com/pricing](https://leagueapps.com/pricing/) |
| **Jersey Watch** Basic | $29/mes (anual) o $45/mes (mensual) | 3.5% + $1 por tx | [jerseywatch.com/pricing](https://www.jerseywatch.com/pricing) |
| **Jersey Watch** Plus | $49/mes (anual) o $75/mes (mensual) | 3.5% + $1 por tx | [jerseywatch.com/pricing](https://www.jerseywatch.com/pricing) |
| **Jersey Watch** Pro | $79/mes (anual) | 3.5% + $1 por tx | [jerseywatch.com/pricing](https://www.jerseywatch.com/pricing) |
| **GotSport** | Custom/Enterprise (no publica) | N/A | [gotsport.com](https://home.gotsport.com/software/) |
| **Stack Sports** | Custom | $3 por transaccion | [stacksports.com](https://stacksports.com/sports-management) |
| **SportLoMo** | Custom | 3.5% + $0.50 por tx | [sportlomo.com](https://www.sportlomo.com/) |

### Rangos de mercado USA (verificado)

- Liga pequena (5-20 equipos): $29-200/mes
- Liga mediana (20-100 equipos): $200-800/mes o $600-2,000/ano
- Liga grande (100+ equipos): $2,000-10,000+/ano, custom

### Pricing propuesto para Widdo Leagues (propuesta, NO dato de mercado)

**Colombia/LATAM:**

| Plan | Precio/mes | Clubes | Jugadores | Features |
|------|-----------|--------|-----------|----------|
| Starter | $149K COP (~$35 USD) | Hasta 15 | Hasta 500 | Afiliacion, registro, calendario, comunicaciones |
| Pro | $349K COP (~$80 USD) | Hasta 40 | Hasta 2,000 | + Convocatorias, transfers, disciplinario, reportes Indeportes |
| Enterprise | $699K COP (~$160 USD) | Ilimitados | Ilimitados | + API, multi-deporte, soporte dedicado |

**USA:**

| Plan | Precio/mes | Features |
|------|-----------|----------|
| Starter | $99 USD | Core league management |
| Pro | $249 USD | + Selections, transfers, compliance |
| Enterprise | $499 USD | + API, multi-sport, dedicated support |

**Nota:** Estos precios son propuestas basadas en el analisis del mercado. No son datos verificados del mercado. Widdo actualmente cobra $0 a clubes. Hay que validar estos precios con clientes reales.

---

## 6. Gaps en el Mercado

| Gap | Explicacion | Verificado? |
|-----|-------------|-------------|
| **Cero competidores en LATAM** | Todos los competidores fuertes son USA/Europa/Irlanda | SI - revise 9 plataformas |
| **Nadie automatiza convocatorias con tests** | Ningun competidor ofrece modulo de pruebas fisicas/psicologicas | SI - revise features de los 9 |
| **Nadie conecta club ops con liga ops nativamente** | La mayoria requiere el mismo vendor o integraciones manuales | SI - solo SportLoMo se acerca |
| **Sin reportes para gobierno LATAM** | Ningun competidor genera reportes para Indeportes | SI - son todos USA/Europa |
| **Sin cobros liga→club digitalizados en LATAM** | Ningun competidor LATAM permite que la liga cobre afiliaciones/inscripciones digitalmente | SI - no hay competidor LATAM |

---

## 7. Relacion entre los Productos Widdo

### Widdo Clubs vs Widdo Leagues

```
WIDDO CLUBS (perspectiva del club)     WIDDO LEAGUES (perspectiva de la liga)
─────────────────────────────────      ────────────────────────────────────
Club gestiona sus jugadores     ──→    Liga ve rosters oficiales (read-only)
Club cobra cuotas a familias    ✕      Liga NO ve estos pagos
Club registra asistencia        ✕      Liga NO ve asistencia
Club entrena jugadores          ──→    Liga ve staff con credenciales
Club paga afiliacion a liga     ←──    Liga registra cobro
Club inscribe equipos en torneo ←──    Liga gestiona el torneo
Club nomina jugadores           ──→    Liga gestiona convocatorias
Club acepta/rechaza transfer    ←──    Liga gestiona transferencias
```

### Widdo Leagues vs Widdo Tournaments

```
WIDDO LEAGUES                          WIDDO TOURNAMENTS
──────────────                         ──────────────────
Organiza campeonatos departamentales   Organiza torneos individuales/invitacionales
Entre sus clubes afiliados             Abierto a cualquier club/equipo
Con sistema disciplinario              Sin sistema disciplinario
Con transferencias                     Sin transferencias
Liga es la organizadora permanente     Cualquiera puede organizar un torneo
```

**Integracion:** Cuando una liga organiza un campeonato, puede usar Widdo Tournaments como motor del torneo (brackets, resultados, fixtures) pero con la capa de liga encima (solo clubes afiliados, disciplinario, elegibilidad verificada).

### Dato critico sobre afiliacion

Un club puede existir en Widdo Leagues SIN usar Widdo Clubs. La liga registra los datos minimos del club manualmente. Pero si el club USA Widdo Clubs, la integracion es automatica:

```
Sin Widdo Clubs: Liga registra manualmente → Club X, 25 jugadores, DT Juan Perez
Con Widdo Clubs: Liga vincula club → ve automaticamente roster, docs, estado → cero duplicacion
```

Esto crea el flywheel:
```
Liga adopta Widdo Leagues
  → Liga requiere que clubes se registren
    → Clubes descubren Widdo Clubs
      → Clubs adoptan Widdo para su gestion interna
        → Mas datos conectados → mas valor para todos
```

---

## 8. Modelo de Datos Conceptual (Liga)

```
Liga
├── tiene muchos → Clubes Afiliados (con estado de afiliacion)
│   ├── tiene muchos → Equipos (por categoria)
│   │   └── tiene muchos → Jugadores (referencia, no duplicacion)
│   └── tiene muchos → Staff (entrenadores, directivos)
├── tiene muchos → Torneos/Campeonatos (via Widdo Tournaments)
│   ├── tiene muchas → Divisiones/Categorias
│   │   ├── tiene muchos → Partidos
│   │   └── tiene → Tabla de posiciones
│   └── tiene muchos → Arbitros asignados
├── tiene muchas → Convocatorias
│   ├── tiene muchos → Candidatos
│   │   ├── tiene muchos → Resultados de Pruebas (fisicas, tecnicas, psicologicas)
│   │   └── tiene → Ranking/Score global
│   └── tiene → Lista final de seleccionados
├── tiene muchas → Transferencias (Jugador Club A → Club B)
├── tiene muchos → Expedientes Disciplinarios
│   ├── tiene muchos → Sanciones
│   └── tiene muchas → Audiencias
├── tiene muchos → Cobros (afiliaciones, inscripciones, multas)
│   └── cobro digital o registro manual
└── genera → Reportes (Indeportes, internos, estadisticos)
```

---

## 9. Reportes para Indeportes (Colombia)

Las ligas son obligadas a reportar ante el ente deportivo departamental (Indeportes). Obligaciones:

| Reporte | Contenido | Frecuencia |
|---------|-----------|------------|
| Acta de Asamblea Ordinaria | Con todos sus anexos | Anual |
| Estados Financieros | Balance, P&L, segun normas contables CGN | Anual |
| Plan de Actividades | Programas deportivos, competencias, formacion | Anual |
| Presupuesto | Ingresos y gastos proyectados | Anual |
| Informe de Gestion | Logros, indicadores, cobertura | Anual |
| Censo de deportistas | Por modalidad, genero, edad, municipio | Anual |
| Lista de clubes afiliados | Con reconocimiento deportivo vigente | Anual |
| Informacion bajo demanda | Lo que solicite el ente | Variable |

Fuentes:
- [Manual de Asambleas Coldeportes](https://administracion.inder.gov.co/uploads/manual_de_asambleas_coldeportes_0_451289edc9.pdf)
- [Sistema Nacional del Deporte - Indeportes Antioquia](https://indeportesantioquia.gov.co/sdd-nacional/)

---

## 10. Fuentes Completas

### Legislacion Colombia
- [Ley 181 de 1995 - Ley del Deporte](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=3424)
- [Decreto 1228 de 1995 - Organismos Deportivos](https://www.mineducacion.gov.co/1780/articles-86226_archivo_pdf.pdf)
- [Requisitos Liga Departamental - JurisDeportiva](https://jurisdeportiva.com/requisitos-minimos-para-la-constitucion-de-una-liga-departamental-en-colombia/)
- [Liga Antioquena de Baloncesto - Indeportes](https://altoslogros.deportesant.gov.co/organizacion/organizacion/604)

### Estudios Academicos
- [Administracion, Gestion y Cluster en Ligas y Clubes - Redalyc](https://www.redalyc.org/journal/646/64678795002/html/)
- [Organizacion Administrativa Ligas Bogotanas - Scielo](http://www.scielo.org.co/scielo.php?script=sci_arttext&pid=S0123-42262018000200319)
- [Caracterizacion Administrativa Clubes - UTP](https://repositorio.utp.edu.co/server/api/core/bitstreams/0e7fd4b5-df6e-4327-9622-7076013367b0/content)

### Competidores (paginas de pricing verificadas feb 2026)
- [TeamSnap - Pricing](https://www.teamsnap.com/pricing)
- [SportsEngine Motion - Pricing](https://www.sportsengine.com/motion/pricing/)
- [SportsEngine HQ - Pricing](https://www.sportsengine.com/pricing-and-bundling/)
- [LeagueApps - Pricing](https://leagueapps.com/pricing/)
- [Jersey Watch - Pricing](https://www.jerseywatch.com/pricing)
- [GotSport - Platform](https://home.gotsport.com/software/)
- [Stack Sports - Management](https://stacksports.com/sports-management)
- [SportLoMo - Split Payments](https://www.sportlomo.com/split-payments-registration/)
- [SportLoMo - Membership](https://www.sportlomo.com/membership-registration/)
- [Playinga - Features](https://playinga.com/en/features)

### Noticias/Evidencia
- [Liga Baloncesto Huila - Convocatoria Sub17 2026](https://www.lanacion.com.co/liga-de-baloncesto-del-huila-hara-convocatoria-en-categoria-sub-17/)
- [Antioquenos preseleccionados seleccion Colombia baloncesto](https://www.elcolombiano.com/deportes/antioquenos-preseleccionados-colombia-baloncesto-mundial-2027-JG33717835)
