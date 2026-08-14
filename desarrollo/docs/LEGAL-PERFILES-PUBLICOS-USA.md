# Perfiles públicos de jugadores menores en USA — revisión legal informativa

**Para:** Miguel Angel Cano (fundador) y el abogado de Widdo Inc.
**Fecha de la investigación:** 13 de agosto de 2026
**Alcance:** funcionalidad "página pública del jugador" (enlace secreto) + "consulta entre clubes", ambas creadas y controladas por la familia. Mercado inicial: Florida; se revisan también TX, CA, NY, GA, CO y CT.

---

## ⚠️ ESTO NO ES ASESORÍA LEGAL

Este documento es **investigación informativa** hecha por un agente de IA a partir de fuentes públicas.
No es asesoría legal, no crea relación abogado-cliente y no sustituye la revisión de un abogado
licenciado en Florida / privacidad USA. Widdo no debe encender el feature flag apoyándose solo en
este documento.

**Cómo leer las marcas:**

| Marca | Significado |
|-------|-------------|
| ✅ **HECHO** | Verificado en fuente primaria (texto legal) o en análisis de despacho reconocido. |
| 🔎 **INTERPRETACIÓN** | Mi lectura de la norma aplicada al diseño de Widdo. Discutible. |
| ❓ **DUDA** | No se pudo cerrar investigando. Va a la lista del abogado. |

---

## 🔴 ¿Hay algún bloqueo absoluto?

**No.** No encontré ninguna ley federal ni estatal que **prohíba** que un padre publique una página
con el nombre, año de nacimiento, foto y estadísticas deportivas de su hijo menor. El diseño
descrito es defendible y se parece mucho a lo que ya hace Hudl en producción desde hace años.

Pero hay **un punto naranja que sí obliga a cambiar el producto antes de encender el flag**:

> ### 🟠 Menores de 13 años: el consentimiento "por correo" NO sirve
>
> ✅ **HECHO.** Bajo COPPA, *disclosure* incluye expresamente "hacer la información
> públicamente disponible a través de publicaciones en internet, páginas de inicio…"
> (16 CFR § 312.2). Y los dos métodos baratos de consentimiento parental —email con
> confirmación y SMS con confirmación— están disponibles **solo para operadores que NO
> divulgan información personal** (16 CFR § 312.5(b)(2), métodos 8 y 9).
>
> 🔎 **INTERPRETACIÓN.** Si Widdo publica la página de un menor de 13, y COPPA nos aplica,
> hace falta un método **de nivel alto**: tarjeta de crédito con cargo/notificación,
> formulario firmado escaneado, llamada a personal entrenado, videollamada, verificación
> contra ID oficial, preguntas de conocimiento (KBA) o reconocimiento facial contra ID.
> Un "acepto" en la app **no cumple**.
>
> **Dos salidas, ambas válidas:**
> - **(A) Edad mínima 13 para la página pública.** Es lo que hace MaxPreps ("no hacemos
>   públicamente disponible la información personal recolectada de menores de 13"). Coste de
>   ingeniería: un `if`. **Es mi recomendación para el lanzamiento.**
> - **(B) Integrar un proveedor de verificación parental** (tipo PRIVO, k-ID, Yoti) y habilitar
>   <13. Coste real, meses, y una dependencia externa. Dejarlo para la v2.

---

## 1. Resumen ejecutivo

**¿El diseño es defendible como práctica estándar del sector?** Sí, y con bastante margen.

El diseño de Widdo ya incorpora, por decisión propia, casi todos los controles que la doctrina
y los competidores tratan como buenas prácticas:

- Solo el padre/acudiente (o el jugador adulto) crea la página — **nunca el club**.
- Token no adivinable, caducidad obligatoria ≤90 días, revocable.
- `noindex`, sin directorio, sin buscador.
- Sin datos de contacto, sin documento de identidad, sin fecha completa de nacimiento (solo año).
- Foto opcional, decidida por la familia.
- Consulta entre clubes: temporal (≤30 días), revocable, auditada, sin export ni copia.

Esto es **más restrictivo** que Hudl (que permite perfil público permanente e indexable) y que
MaxPreps (que publica estadísticas de atletas de secundaria de forma abierta). El vector de riesgo
no es el concepto: es la **ejecución del consentimiento y del borrado**.

**¿Qué le falta?** Seis cosas, en orden de importancia:

1. **Edad mínima 13** para la página pública (o verificación parental de nivel alto para <13). Ver bloque naranja arriba.
2. **Consentimiento del propio menor de 13-17 años**, no solo del padre. Nueva York lo exige
   literalmente para esa franja; el padre no puede consentir por él.
3. **Política de retención escrita y publicada** en el aviso de privacidad. Es una obligación
   nueva y explícita de COPPA desde junio de 2025; no basta con borrar bien, hay que **publicar
   la política**.
4. **Evaluación de riesgo documentada (DPIA)** de la función. Colorado y Connecticut la exigen
   para servicios online usados por menores, **sin umbral de tamaño de empresa**. Es un
   documento, no código, pero hay que tenerlo firmado antes de encender.
5. **Texto de consentimiento específico y sin patrones oscuros**: qué campos exactos se publican,
   con la opción de rechazar igual de visible que la de aceptar, y revocación tan fácil como la
   concesión.
6. **Programa escrito de seguridad de la información** para datos de menores (obligación nueva de
   COPPA 2025, con evaluación anual de riesgos y pruebas de efectividad).

**El riesgo real que no es legal.** Un enlace "secreto" que el padre pega en un grupo de WhatsApp
o en Facebook deja de ser secreto. Legalmente Widdo probablemente está cubierto (fue el padre
quien lo difundió), pero reputacionalmente no. Recomiendo mitigarlo con: sin *Open Graph preview*
con la foto del menor (que el enlace no genere miniatura con la cara del niño al pegarlo en
WhatsApp), aviso explícito al copiar el enlace, y un panel donde la familia vea cuántas veces se
ha abierto y desde dónde.

---

## 2. Análisis por ley

### Tabla resumen

| Norma | ¿Aplica a Widdo? | Qué exige | Diseño actual | Qué falta |
|---|---|---|---|---|
| **COPPA** (federal, <13) | 🔎 Probablemente sí (por precaución, asumir que sí) | Aviso directo, consentimiento parental verificable, derecho de revisión/borrado, retención mínima, seguridad | Padre controla, revocable, caducidad | Método VPC de nivel alto para <13 **o** edad mínima 13; política de retención publicada; programa de seguridad escrito |
| **FTC Policy Statement 25-feb-2026** (verificación de edad) | Sí, si usamos verificación de edad | Discrecionalidad de no perseguir a quien recoja datos **solo** para verificar edad | — | Aprovecharlo si vamos por la opción (B) |
| **Florida HB 3** (Online Protections for Minors) | ❌ No | Prohibir cuentas <14, consentimiento 14-15 en redes sociales | — | Nada. No cumplimos los 4 criterios acumulativos |
| **Florida Digital Bill of Rights** (SB 262) — parte general | ❌ No | Derechos tipo CCPA | — | Nada: exige >$1.000M de ingresos globales |
| **FDBR — parte de menores** | ❓ Probablemente no | Sin perfilado dañino de <18 | — | Confirmar que no somos "social media platform" según su definición amplia |
| **Fla. Stat. § 540.08** (derecho de imagen) | ✅ Sí, si usamos fotos en marketing | Consentimiento expreso escrito del padre/tutor para uso comercial o publicitario | — | Consentimiento separado para marketing de Widdo. **No mezclar con el de la página pública** |
| **Texas SCOPE Act** (HB 18) | ❓ Probablemente no | Consentimiento parental, filtrado de contenido dañino, herramientas parentales | Padre controla todo | Confirmar los 3 requisitos acumulativos |
| **Texas TDPSA** | 🔎 Exentos (pequeña empresa SBA) | Consentimiento parental para datos de <13 ("sensible") | — | No vender jamás datos de menores: la venta anula la exención |
| **California CCPA/CPRA** | ❌ Todavía no | Opt-in para venta/compartición: menor 13-15, padre <13 | No vendemos datos | Revisar al cruzar umbrales ($25M ingresos / 100k consumidores) |
| **California AADC** (AB 2273) | ⏸️ Mayormente suspendida | DPIA, diseño apropiado a la edad | — | Vigilar: en marzo 2026 el 9º Circuito **redujo** la suspensión |
| **California "Online Eraser"** (B&P § 22581) | 🔎 Probablemente no | Menor registrado puede borrar su propio contenido publicado | Padre puede revocar | Si damos cuenta propia a jugadores 13-17, dar botón de borrado al menor |
| **New York Child Data Protection Act** | ✅ **Sí** (sin umbral de ingresos) | Consentimiento informado para todo procesamiento no "estrictamente necesario"; <13 según COPPA, **13-17 consiente el propio menor** | Consentimiento del padre | **Consentimiento del menor 13-17**; rechazo igual de prominente; sin patrones oscuros; revocación fácil; addendum con procesadores |
| **NY Civil Rights Law §§ 50-51** | ✅ Sí, si usamos fotos en marketing | Consentimiento escrito; en menores, también del padre | — | Igual que Florida 540.08 |
| **Georgia SB 351** | ❌ No (además, suspendida judicialmente) | Verificación de edad en redes sociales | — | Nada |
| **Colorado CPA — enmiendas de menores** (SB 24-041) | ✅ **Sí** (sin umbral alguno) | Deber de cuidado razonable, DPIA, consentimiento; <13 padre, 13-17 el menor | Controles ya buenos | **DPIA escrita**; consentimiento del menor 13-17 |
| **Connecticut CTDPA** (SB 3 + reforma jul-2026) | 🔎 Sí en la práctica | DPIA para riesgo a menores; deber de cuidado; desde jul-2026 basta **un** residente con datos sensibles | — | Misma DPIA; no vender ni hacer publicidad dirigida a <18 |
| **FERPA** | ❌ No | Derechos sobre expedientes educativos | — | Nada, **salvo** que vendamos a distritos escolares |

---

### 2.1 COPPA (federal — menores de 13)

✅ **HECHO — a quién aplica.** COPPA aplica a (a) sitios o servicios *dirigidos a niños* menores de
13, y (b) sitios de audiencia general **con conocimiento efectivo** de que están recogiendo
información personal de un menor de 13. La FTC no obliga a preguntar la edad, pero *pedir o
recoger información que establece que un visitante es menor de 13 dispara COPPA*.

🔎 **INTERPRETACIÓN.** Widdo **no** es un sitio dirigido a niños (el usuario es el club y la
familia; el test multifactor de la FTC mira temática, personajes animados, música, lenguaje
infantil, edad de los modelos… nada de eso encaja). Pero Widdo **sí** recoge la fecha de nacimiento
del jugador. Eso es conocimiento efectivo de la edad. Así que sobre esos registros concretos,
**hay que asumir que COPPA aplica**.

❓ **DUDA IMPORTANTE.** El texto legal dice información recogida *"from a child"* (**del** niño), y
la definición de "collection" habla siempre de que sea **el niño** quien envía o publica. En Widdo
el dato lo aporta el **padre**. Existe un argumento serio de que COPPA no aplica a información que
un adulto proporciona sobre su hijo. **No encontré una FAQ de la FTC que resuelva esto de forma
inequívoca** (el sitio de la FTC bloqueó el acceso automatizado durante esta investigación).
El sector no se apoya en ese argumento: Hudl, MaxPreps, GameChanger y SportsRecruits piden
consentimiento parental igual. **Recomiendo cumplir como si aplicara** y dejar el matiz al abogado.

✅ **HECHO — qué es "información personal".** Incluye nombre y apellido, y **fotos, vídeos o audio
que contengan la imagen o la voz de un niño**. La foto del jugador es dato personal por sí sola.
Desde 2025 también se añadieron los identificadores biométricos.

✅ **HECHO — "disclosure" incluye publicar.** "Divulgación" incluye "hacer disponible públicamente
la información personal … a través de publicaciones en internet, páginas de inicio, servicios de
correspondencia, correo electrónico, tablones o salas de chat" (§ 312.2). **Una página pública es
una divulgación**, aunque el enlace sea secreto y lleve `noindex`.

✅ **HECHO — obligaciones del operador:**
- Aviso claro en la web **y** aviso directo al padre antes de recoger.
- Consentimiento parental verificable **antes** de recoger, usar o divulgar.
- **Consentimiento separado y distinto** para divulgar a terceros cuando no sea integral al
  servicio (novedad de 2025). El padre debe poder decir sí al servicio y no a la divulgación.
- Derecho del padre a revisar, borrar y prohibir recolección futura.
- **§ 312.10:** retener solo lo razonablemente necesario, y **mantener una política de retención
  escrita** con propósitos, necesidad de negocio y plazo de borrado, **publicada dentro del aviso
  de privacidad**.
- **Programa escrito de seguridad de la información** con evaluación anual de riesgos y pruebas de
  efectividad (novedad de 2025).
- § 312.7: no se puede condicionar la participación del niño en una actividad a que entregue más
  información de la razonablemente necesaria.

✅ **HECHO — plazos.** Las enmiendas entraron en vigor el **23 de junio de 2025** y el plazo de
cumplimiento pleno venció el **22 de abril de 2026**. Ya es exigible.

✅ **HECHO — novedad favorable.** El **25 de febrero de 2026** la FTC emitió un *policy statement*:
no perseguirá bajo COPPA a operadores de sitios de audiencia general o mixta que recojan, usen o
divulguen datos personales **exclusivamente para verificar la edad**, si cumplen ciertas
condiciones. Esto abarata la opción (B) del bloque naranja: verificar la edad ya no es en sí mismo
un riesgo COPPA.

**Qué hace ya el diseño:** el padre controla, se puede revocar, hay caducidad, no se piden datos
de contacto ni documento del menor, la página no es condición para usar Widdo (§ 312.7 ✔).

**Qué falta:** método VPC de nivel alto para <13 (o edad mínima 13); consentimiento separado y
explícito para la publicación, distinto del consentimiento de la cuenta; política de retención
publicada; programa de seguridad escrito; aviso directo al padre.

---

### 2.2 Florida

#### Florida HB 3 — Online Protections for Minors

✅ **HECHO — estado.** Entró en vigor 1-ene-2025, fue suspendida parcialmente por el juez Walker
(N.D. Fla.) en junio de 2025, y el **11º Circuito levantó la suspensión el 25 de noviembre de
2025**. Hoy **es exigible en Florida** mientras el litigio sigue.

✅ **HECHO — a quién aplica.** Una "social media platform" debe cumplir **los cuatro** criterios:
1. permite subir contenido o ver el contenido/actividad de otros usuarios;
2. **el 10% o más de sus usuarios activos diarios menores de 16 pasan una media de 2+ horas
   diarias** en la plataforma;
3. emplea algoritmos que analizan datos del usuario para seleccionarle contenido;
4. tiene al menos una función adictiva (scroll infinito, notificaciones push, métricas de
   interacción, autoplay, live-streaming).

🔎 **INTERPRETACIÓN — no aplica a Widdo.** Widdo tiene notificaciones push (criterio 4 ✓) y podría
argumentarse el criterio 1, pero **falla claramente el 2 y el 3**: ningún niño pasa dos horas
diarias en un gestor de club, y Widdo no selecciona contenido por algoritmo. Los cuatro son
acumulativos. Además la ley regula *cuentas de menores en redes sociales*, no páginas creadas por
el padre. Riesgo bajo. Merece una línea en el memo del abogado, no más.

#### Florida Digital Bill of Rights (SB 262)

✅ **HECHO — parte general: no aplica.** Exige que el controlador tenga **más de $1.000 millones**
de ingresos globales anuales, más criterios adicionales (50% de ingresos por publicidad online,
altavoz inteligente, app store con 250.000+ apps). Widdo está a varios órdenes de magnitud.

✅ **HECHO — parte de menores: sin umbral de ingresos.** La sección de protección de menores aplica
a "social media platforms" y "online gaming platforms", con "child" = menor de 18, bajo el estándar
de servicios *"likely to be predominantly accessed by children"*. Prohíbe el perfilado salvo
necesidad o ausencia de riesgo sustancial, y procesar datos de <18 con conocimiento efectivo de que
puede causar "daño sustancial o riesgo de privacidad". Vigor: 1-jul-2024. Sanciones civiles hasta
$50.000 por infracción, **triplicadas a $150.000** si es intencional y afecta a menores.

❓ **DUDA.** La FDBR define "social media platform" de forma **muy amplia**: *"una forma de
comunicación electrónica a través de la cual los usuarios crean comunidades o grupos en línea para
compartir información, ideas, mensajes personales y otro contenido"*. Widdo tiene comunidades de
club, mensajes y contenido compartido. **No descarto que un fiscal general agresivo intente
encajarnos.** Es la pregunta de Florida que más necesita respuesta de abogado. Nota tranquilizadora:
aunque aplicara, Widdo no perfila menores ni hace publicidad dirigida, que es lo que la norma
persigue.

#### Fla. Stat. § 540.08 — derecho de imagen

✅ **HECHO.** Nadie puede publicar o usar públicamente "con fines comerciales o publicitarios" el
nombre, retrato o fotografía de una persona sin consentimiento expreso escrito u oral; **tratándose
de un menor, lo da el padre o tutor**. Si hay compensación de por medio, hace falta aprobación
judicial del contrato.

🔎 **INTERPRETACIÓN.** La página pública en sí **no** es "uso comercial o publicitario": es la
página de la propia familia. Pero el momento en que Widdo ponga la foto de un jugador real en un
deck, en la landing, en un post de LinkedIn o en un caso de éxito, **eso sí lo es** y necesita
consentimiento escrito separado del padre. Muy relevante dado el uso actual de screenshots en los
decks de `decks/`.

---

### 2.3 Texas

#### SCOPE Act (HB 18)

✅ **HECHO — a quién aplica.** A un servicio digital que cumpla **los tres**: (1) conecta usuarios
de forma que puedan **interactuar socialmente** entre sí; (2) permite crear un **perfil público o
semipúblico** para iniciar sesión y usar el servicio; (3) permite crear o publicar contenido
**visible por otros usuarios** (tablón, chat, canal de vídeo o feed principal).

✅ **HECHO — "known minor".** Menor de 18 sobre el que el proveedor tiene conocimiento efectivo o
ignora deliberadamente la edad; quien registra edad <18 se considera "known minor" hasta cumplir 18.

🔎 **INTERPRETACIÓN.** Widdo cumple algo del (2) y del (3), pero **falla el (1)**: no es una red de
interacción social entre usuarios; la interacción es club→familia, jerárquica y cerrada. Los tres
son acumulativos. Probablemente fuera de alcance. Conviene que el abogado lo confirme, porque la
página pública sí se parece a "un perfil visible por otros".

#### Texas Data Privacy and Security Act (TDPSA)

✅ **HECHO.** Sin umbral de ingresos —aplica a cualquier empresa que opere en Texas— **pero con
exención de pequeña empresa** según la definición de la SBA (orientativamente, <500 empleados).
La exención **decae si se venden datos sensibles**, y los **datos personales de un menor de 13 son
dato sensible** bajo TDPSA. Además exige consentimiento parental para procesar datos de un "known
child" <13, prohíbe la venta de datos de <13 y exige opt-in para publicidad dirigida a menores.

🔎 **INTERPRETACIÓN.** Widdo está exenta hoy. La regla operativa es simple y absoluta:
**Widdo no vende ni comparte datos de menores con nadie, nunca.** El día que eso cambie, TDPSA
entra en pleno.

---

### 2.4 California

✅ **HECHO — CCPA/CPRA.** Umbrales de aplicación: ingresos anuales sobre ~$25M, o datos de 100.000+
consumidores/hogares, o 50%+ de ingresos por vender/compartir datos. Widdo no alcanza ninguno.
Cuando lo haga: prohibido vender o compartir datos de menores de 16 sin consentimiento afirmativo
—el propio menor de 13 a 15, el padre si es menor de 13—, y **desatender deliberadamente la edad
equivale a conocerla**.

✅ **HECHO — AADC (AB 2273), estado del litigio.** El **12 de marzo de 2026** el 9º Circuito emitió
su segunda opinión en *NetChoice v. Bonta*, **estrechando** la suspensión: confirmó la suspensión de
Cal. Civ. Code §§ 1798.99.31(b)(1)–(4) y (b)(7) —restricciones de uso de datos y prohibición de
patrones oscuros, por vaguedad— y **levantó el resto**. El tribunal **no** dio la razón a NetChoice
sobre la definición de cobertura ni sobre la estimación de edad, que vuelven al distrito.

🔎 **INTERPRETACIÓN.** La AADC está viva a medias y puede revivir. Su lógica (DPIA, alta privacidad
por defecto, minimización) es exactamente la que Colorado y Connecticut ya exigen. Si Widdo hace la
DPIA por Colorado, queda razonablemente preparada para California.

✅ **HECHO — "Online Eraser" (B&P § 22581, SB 568, vigente desde 2015).** Los sitios dirigidos a
menores, o con conocimiento efectivo de que un usuario es menor, deben permitir a los **usuarios
registrados menores de 18** eliminar el contenido que **ellos mismos** publicaron. **No** obliga a
eliminar contenido publicado por un tercero distinto del menor.

🔎 **INTERPRETACIÓN.** En el diseño actual publica el padre, no el menor → probablemente no aplica.
**Pero** si Widdo da cuenta propia a jugadores de 13-17 y ellos completan logros o suben foto,
entonces sí: hay que darles a ellos un botón de borrado, no solo al padre.

---

### 2.5 New York — la norma más exigente para Widdo

✅ **HECHO.** La **New York Child Data Protection Act** está en vigor desde el **20 de junio de
2025**. **No tiene umbral de ingresos ni de volumen.** Aplica a operadores de webs, apps y
servicios online accesibles en Nueva York, cuando el servicio está dirigido principalmente a
menores **o** el operador tiene conocimiento efectivo de la edad. Prohíbe recoger, usar, compartir
o vender datos personales de cualquier persona en NY **menor de 18**, salvo que sea *estrictamente
necesario* para el propósito del servicio o medie consentimiento informado.

✅ **HECHO — quién consiente.**
- **Menores de 13:** solo procesamiento conforme a COPPA → consentimiento parental.
- **13 a 17:** **consentimiento del propio menor** (el "covered user"), no del padre.

✅ **HECHO — mecánica del consentimiento.** Debe presentarse "clara y separadamente de otro
contenido", con **una opción de rechazo igual de prominente**; el fiscal general de NY subraya que
la negativa debe ser la opción más prominente. No se puede pedir más de una vez al año, debe ser
revocable con la misma facilidad con que se concede, no puede usar patrones oscuros y no se puede
condicionar el acceso al servicio a darlo. Hay obligación de **contratos con procesadores** y un
**plazo de 14 días para borrar** una vez confirmada la edad cuando corresponde.

✅ **HECHO — límite antitrampa.** El fiscal general aclaró que una empresa no puede sortear la
restricción "simplemente comercializando su servicio principal como uno que incluye el rastreo de
datos personales del usuario para dar personalización".

🔎 **INTERPRETACIÓN — este es el hueco de diseño número dos.** Una página pública **no es
"estrictamente necesaria"** para gestionar un club: es un extra opcional. Por tanto necesita
consentimiento informado. Y si el jugador tiene entre 13 y 17, **la ley de Nueva York quiere el sí
del propio chaval**, no el de su padre. El diseño actual ("solo la crea el padre") es más protector
en un eje y **queda corto en otro**.

**Recomendación:** para 13-17, **doble confirmación** — el padre inicia y el menor confirma desde
su propia sesión (o al revés). Es una pantalla más y resuelve NY, Colorado y Connecticut a la vez.
Como bonus, es lo correcto: a los 15 años uno tiene opinión sobre si su cara está en internet.

✅ **HECHO — NY Civil Rights Law §§ 50-51.** Prohíbe usar nombre, retrato, imagen o voz "con fines
publicitarios o comerciales" sin consentimiento escrito; si es menor, también del padre o tutor.
Mismo tratamiento que Florida 540.08: afecta al marketing de Widdo, no a la página familiar.

---

### 2.6 Georgia

✅ **HECHO.** La *Protecting Georgia's Children on Social Media Act of 2024* (SB 351) exigía
esfuerzos comercialmente razonables de verificación de edad desde el 1 de julio de 2025 y
consentimiento parental para menores de 16 en redes sociales. **La jueza Amy Totenberg (N.D. Ga.)
la suspendió** a instancias de NetChoice, por las exenciones que crea (problemas de Primera
Enmienda). El fiscal general Carr sigue litigando (marzo 2026).

🔎 **INTERPRETACIÓN.** No aplica a Widdo por objeto (redes sociales) y además está suspendida.
Riesgo prácticamente nulo hoy.

---

### 2.7 Colorado y Connecticut — las que sí muerden a una empresa pequeña

Estas dos son las más relevantes después de Nueva York, precisamente porque **ignoran el tamaño de
la empresa**.

#### Colorado — enmiendas de menores al CPA (SB 24-041), vigor 1-oct-2025

✅ **HECHO.** Aplica a **cualquier** controlador o procesador que ofrezca un servicio, producto o
función online a consumidores de Colorado que sabe, o ignora deliberadamente, que son menores de
18 — **"con independencia del volumen de datos o de los umbrales de ingresos"**.

Exige:
- **Deber de cuidado razonable** para evitar cualquier riesgo elevado de daño al menor (trato
  injusto, daño financiero, físico o **reputacional**, divulgación no autorizada, intrusión en la
  privacidad que ofendería a una persona razonable).
- **Consentimiento**: del padre si es menor de 13; **del propio menor si tiene 13-17**. Necesario
  antes de publicidad dirigida, venta de datos, perfilado con efectos jurídicos significativos,
  **procesamiento para fines secundarios distintos de los divulgados originalmente**, y **retener
  datos más tiempo del necesario para prestar el servicio**.
- **Evaluación de protección de datos (DPIA)** obligatoria para servicios que presenten riesgo
  elevado de daño a menores; hay que documentarla, conservarla y entregarla al fiscal general si la
  pide.
- Sin consentimiento, no se pueden usar funciones de diseño que aumenten o prolonguen
  significativamente el uso del servicio por el menor.
- Geolocalización precisa: solo si es razonablemente necesaria, por el tiempo necesario y con señal
  visible y continua mientras se recoge.
- Enforcement: fiscal general y fiscales de distrito, con periodo de subsanación de 60 días **hasta
  el 31 de diciembre de 2026**; después, sanción sin aviso previo.

🔎 **INTERPRETACIÓN.** "Daño reputacional" y "divulgación no autorizada" describen exactamente el
riesgo de una página pública mal gestionada. **Si Widdo hace una DPIA seria de esta función y la
archiva firmada, tiene su mejor defensa escrita** — y en Connecticut, además, una presunción legal
a favor.

#### Connecticut — CTDPA (SB 3, vigor 1-oct-2024, + reforma 1-jul-2026)

✅ **HECHO — provisiones de menores.** El controlador que ofrece un servicio, producto o función
online a consumidores que sabe, o ignora deliberadamente, que son menores, tiene **deber de
cuidado** frente al riesgo elevado de daño. Necesita consentimiento del menor —o del padre si es
menor de 13— para vender sus datos, hacer publicidad dirigida o perfilado. Debe realizar **DPIA**
que cubra propósito del servicio, categorías de datos de menores procesadas, finalidades y riesgos
previsibles. **Quien haya hecho la DPIA se presume que actuó con cuidado razonable**, salvo prueba
en contrario del fiscal general.

✅ **HECHO — reforma de julio 2026.** El umbral general baja a **35.000 residentes** de Connecticut,
y —clave— **cualquier empresa que controle o procese datos sensibles de un solo residente queda
sujeta a la ley**. La exención de GLBA pasa de ser por entidad a ser por dato, y se prohíbe
expresamente vender datos sensibles sin consentimiento.

❓ **DUDA.** No pude confirmar en esta investigación si los datos de un menor conocido cuentan como
"dato sensible" bajo la definición actualizada de Connecticut (la fuente consultada no lo listaba).
Bajo la mayoría de leyes estatales sí lo son. 🔎 **Si lo son, un solo niño de Connecticut mete a
Widdo en el CTDPA completo.** Vale la pena que el abogado lo cierre antes de vender en el noreste.

Además, las enmiendas de Connecticut **prohíben la publicidad dirigida a menores de 18 y la venta
de sus datos con independencia de que haya consentimiento** — es decir, ni siquiera con permiso.

---

### 2.8 FERPA — no aplica

✅ **HECHO.** FERPA aplica a agencias e instituciones educativas que **reciben fondos del
Departamento de Educación de EE. UU.**: colegios públicos, distritos escolares y universidades.
Los colegios privados de primaria y secundaria, al no recibir esos fondos, **generalmente no están
sujetos** a FERPA.

🔎 **INTERPRETACIÓN.** Un club deportivo privado no es una institución educativa. FERPA **no** aplica
a Widdo. Dos advertencias:
1. Si Widdo llega a contratar con un **distrito escolar** (equipos de high school), el distrito sí
   está sujeto y Widdo pasaría a ser un "school official" bajo la excepción de FERPA, con
   obligaciones contractuales serias: uso limitado, no divulgación, control directo del distrito.
   Eso **sería incompatible con una página pública** creada por el padre sin pasar por el colegio.
2. La comparación con MaxPreps no traslada: MaxPreps publica datos de deporte escolar por acuerdos
   con las federaciones estatales, no por FERPA.

---

## 3. Qué hace el sector (la mejor señal de práctica aceptada)

✅ **HECHO.** Comparativa de políticas públicas consultadas el 13-ago-2026:

| Plataforma | Edad mínima | Papel del padre | Perfil público de menores |
|---|---|---|---|
| **Hudl** | No recoge de <13 conscientemente; los menores del "age of digital consent" no pueden usarlo y **deben pedir a un adulto del equipo, padre o tutor que aporte los datos** | Si detecta un usuario <13, **envía un mensaje al padre pidiendo consentimiento verificado**. Los entrenadores pueden añadir menores al roster **solo con consentimiento escrito expreso** del padre o tutor | **Sí, con consentimiento parental SEPARADO** por función: "Public Profile" (perfil visible por cualquiera en internet) y "Highlights" son consentimientos distintos |
| **MaxPreps** | <13 no pueden usar el servicio; deben pedir a un adulto que aporte los datos | El padre puede revisar, actualizar o borrar; puede impedir recolección futura | **No.** "No hacemos públicamente disponible la información personal recolectada de menores de 13" |
| **GameChanger** | No dirigido a <13; no se recoge sin consentimiento parental expreso | Quien publica contenido de un menor **debe ser el padre/tutor, o tener consentimiento verificable del padre/tutor** | Datos de jugador y contenido multimedia sí, vía Team Admin, con ese consentimiento |
| **SportsRecruits** | No dirigido a <13; no recoge sin supervisión del tutor | El staff del club **no puede alterar ni borrar datos de la cuenta del atleta sin consentimiento explícito del atleta o de su padre** | Sí, es su producto central (perfiles de reclutamiento) |

**Lectura para Widdo.** Tres conclusiones:

1. **El diseño de Widdo está alineado o por delante.** Todos coinciden en el pilar: el adulto aporta
   y consiente, el club nunca decide solo. Widdo ya lo tiene.
2. **Hudl valida la pieza más delicada:** un perfil público de un menor **con consentimiento
   parental separado y específico para esa función** es práctica aceptada en el mercado
   estadounidense desde hace años, en un producto grande y bien asesorado. Y Widdo va más allá
   (caducidad obligatoria, `noindex`, sin datos de contacto).
3. **Nadie publica menores de 13 alegremente.** MaxPreps directamente no lo hace. Ese es el
   consenso del sector, y refuerza la recomendación de la edad mínima 13.

---

## 4. Checklist accionable — antes de encender el flag

Ordenado por si bloquea el lanzamiento o no.

### 🔴 Bloqueante — sin esto no se enciende

1. **Edad mínima 13 para la página pública.** Si `birth_year` implica <13, la función no se ofrece
   (ni siquiera se muestra el botón). Alternativa si se quiere <13: integrar verificación parental
   de nivel alto (tarjeta, ID, videollamada, KBA) — no antes de la v2.
2. **Consentimiento separado, específico y por función.** Tres consentimientos independientes, no
   uno: (a) cuenta/gestión del club, (b) publicación de la página pública, (c) consulta por otro
   club. Aceptar uno no implica los otros. Nunca preseleccionados.
3. **Consentimiento del propio menor de 13-17**, además del padre, para publicar. Doble
   confirmación. Exigido por NY, Colorado y Connecticut.
4. **Pantalla de consentimiento sin patrones oscuros**: lista literal y exhaustiva de **qué campos
   exactos se publican** (nombre, año de nacimiento, deporte, foto si la hay, clubes y años, logros,
   estadísticas), botón de rechazo **igual o más prominente** que el de aceptar, y revocación tan
   fácil como la concesión (un clic, desde el mismo sitio).
5. **La foto es un opt-in independiente y apagado por defecto**, con aviso de que es la imagen de un
   menor y será visible por quien tenga el enlace.
6. **Política de retención escrita y publicada** dentro del aviso de privacidad: propósitos,
   necesidad de negocio y plazo de borrado por tipo de dato (COPPA § 312.10 lo exige literalmente).
7. **Borrado real y en cascada, verificable.** Revocar debe invalidar el token en el backend, no
   ocultarlo en el frontend. Purga de caché y de CDN. Prueba automatizada que confirme 404 tras
   revocar. Botón "eliminar todo lo publicado" para la familia.
8. **DPIA / evaluación de riesgo documentada y firmada** de la función completa (Colorado y
   Connecticut). Debe cubrir: propósito, categorías de datos de menores, finalidades, riesgos
   previsibles de daño (incluido el reputacional y el de difusión no autorizada del enlace) y
   mitigaciones. Guardarla; es la mejor defensa escrita que Widdo puede tener y en Connecticut
   genera presunción de cuidado razonable.

### 🟠 Muy recomendable — antes o inmediatamente después

9. **Sin preview enriquecido del enlace.** Que pegar la URL en WhatsApp, iMessage o Facebook no
   genere miniatura con la cara ni el nombre del menor. `og:image` genérico de Widdo, `og:title`
   neutro.
10. **Refuerzo del enlace:** token de ≥128 bits de entropía, `noindex` + cabecera `X-Robots-Tag`,
    `robots.txt`, fuera del sitemap, rate limiting por IP, sin enumeración posible, y aviso al
    copiar el enlace ("cualquiera con este enlace podrá ver esta página").
11. **Programa escrito de seguridad de la información** para datos de menores, con evaluación anual
    de riesgos y prueba de efectividad (COPPA 2025).
12. **Panel de transparencia para la familia:** cuántas veces se abrió la página, qué clubes
    consultaron, cuándo, y revocar desde ahí. Convierte una obligación legal en una función que
    vende.
13. **Registro de auditoría inmutable** de consentimientos: quién consintió, cuándo, desde qué IP,
    y **con qué versión del texto**. Sin la versión del texto, el registro vale la mitad.
14. **Regla dura, en código y en política:** los datos de menores no se venden, no se comparten con
    terceros, no se usan para publicidad dirigida ni para perfilado, ni siquiera con consentimiento
    (Connecticut lo prohíbe incluso con permiso). Declararlo en el aviso de privacidad.
15. **Consentimiento escrito separado para marketing de Widdo** si alguna vez se usa la foto o el
    nombre de un jugador real en decks, landing, redes o casos de éxito (Fla. Stat. § 540.08, NY
    Civ. Rights §§ 50-51). Revisar retroactivamente los screenshots ya usados en `decks/`.
16. **Addenda de tratamiento de datos con todos los procesadores** (hosting, email, storage,
    proveedor de IA) que mencionen expresamente datos de menores — exigido por la NY CDPA.
17. **Aviso de privacidad específico para menores** y una sección visible de "derechos de los
    padres" con canal de contacto y plazo de respuesta comprometido.

### 🟢 Para la siguiente iteración

18. Si se dan cuentas propias a jugadores de 13-17: botón de borrado para el **propio menor**
    (California B&P § 22581).
19. Recordatorio automático a la familia antes de que caduque el enlace, con opción de dejar que
    caduque. La caducidad silenciosa por defecto es la opción correcta.
20. Revisar CCPA cuando se crucen umbrales, y AADC según evolucione *NetChoice v. Bonta* en el
    distrito.

---

## 5. Preguntas para el abogado

Las que no se pueden cerrar investigando. Ordenadas por impacto.

1. **¿COPPA aplica a información que aporta el padre sobre su hijo?** El texto habla de información
   recogida *"from a child"* y la definición de "collection" siempre se refiere a que sea el niño
   quien envía. ¿Hay guía, FAQ de la FTC o *consent decree* que resuelva esto? De la respuesta
   depende todo el diseño de <13.
2. **Si COPPA aplica: ¿una página con token secreto, `noindex` y caducidad es "making publicly
   available" bajo § 312.2?** Si lo es, quedan vetados los métodos de consentimiento por email y
   SMS del § 312.5(b)(2), y hace falta verificación de nivel alto. ¿Cambia algo el hecho de que el
   enlace no sea indexable ni adivinable?
3. **¿Basta el consentimiento del padre en Nueva York para un jugador de 13-17, o hace falta el del
   propio menor?** Y si hacen falta ambos: ¿en qué orden, y qué pasa si el menor revoca y el padre
   no? (Vale también para Colorado y Connecticut.)
4. **¿Widdo encaja en la definición de "social media platform" de la parte de menores de la FDBR?**
   La definición ("comunicación electrónica a través de la cual los usuarios crean comunidades para
   compartir información… y otro contenido") es lo bastante amplia como para preocupar. Es la
   pregunta de Florida.
5. **¿Widdo es un "covered digital service" bajo el SCOPE Act de Texas?** Los tres requisitos son
   acumulativos y creo que fallamos el de "interacción social entre usuarios", pero la página
   pública se parece a un "perfil semipúblico".
6. **¿Los datos de un menor conocido son "dato sensible" bajo el CTDPA reformado (jul-2026)?** Si
   sí, un solo niño de Connecticut somete a Widdo a toda la ley.
7. **¿Quién es el "controller" de la página pública: Widdo o el club?** En el resto del producto
   Widdo es probablemente procesador del club. Pero aquí el club no interviene: consiente la
   familia directamente con Widdo. 🔎 Mi lectura es que en esta función **Widdo es controlador**, lo
   que cambia obligaciones, contratos y quién responde. Necesita confirmación y debe reflejarse en
   los ToS.
8. **Custodia compartida y desacuerdo parental.** ¿Basta el consentimiento de un progenitor?
   ¿Qué hace Widdo si el otro se opone, o si hay una orden de protección o de confidencialidad de
   domicilio? ¿Necesitamos una vía de objeción?
9. **Responsabilidad si el padre difunde el enlace públicamente** (lo pega en Facebook y acaba
   indexado por un tercero). ¿Nos convierte en publicador? ¿Sirve la Sección 230? ¿Qué lenguaje
   protector va en los ToS?
10. **Retención tras la baja.** El jugador deja el club o cumple 18. ¿Cuánto se conservan trayectoria
    y logros? ¿Puede el jugador adulto reclamar su propia trayectoria? ¿Y el club, alegar que las
    estadísticas de sus torneos son suyas?
11. **DPIA:** ¿quién debe firmarla, con qué formato, y hace falta actualizarla en cada cambio de la
    función?
12. **Menores fuera de EE. UU.** Widdo tiene clubes en Colombia y apunta a LATAM. GDPR (si hay
    europeos), LGPD brasileña y la Ley 1581 colombiana tienen sus propias reglas sobre datos de
    menores, más estrictas en algunos puntos. ¿La página pública se restringe a USA en la v1?
13. **Seguro y ToS:** ¿conviene póliza cyber / E&O que cubra explícitamente datos de menores? ¿Qué
    indemnidad razonable se puede pedir al padre que publica?

---

## 6. Fuentes

Todas consultadas el **13 de agosto de 2026**.

**Normativa federal (fuente primaria)**
- 16 CFR § 312.2 — Definiciones (COPPA Rule): https://www.law.cornell.edu/cfr/text/16/312.2
- 16 CFR § 312.5 — Consentimiento parental verificable y métodos aprobados: https://www.law.cornell.edu/cfr/text/16/312.5
- 16 CFR § 312.10 — Retención y borrado: https://www.law.cornell.edu/cfr/text/16/312.10

**Análisis de COPPA y enmiendas 2025-2026**
- Koley Jessen, *COPPA Rule Update Now in Effect*: https://www.koleyjessen.com/insights/publications/ftcs-strengthened-childrens-online-privacy-rules-now-in-effect
- White & Case, *Unpacking the FTC's COPPA amendments*: https://www.whitecase.com/insight-alert/unpacking-ftcs-coppa-amendments-what-you-need-know
- Hunton, *COPPA Rule Amendment Compliance Deadline Approaches*: https://www.hunton.com/privacy-and-cybersecurity-law-blog/coppa-rule-amendment-compliance-deadline-approaches
- Fenwick, *What the Amended COPPA Rule Means for Data Retention Practices*: https://www.fenwick.com/insights/publications/what-the-amended-coppa-rule-means-for-data-retention-practices
- FTC, nota de prensa del *policy statement* sobre verificación de edad (25-feb-2026): https://www.ftc.gov/news-events/news/press-releases/2026/02/ftc-issues-coppa-policy-statement-incentivize-use-age-verification-technologies-protect-children
- Mayer Brown, *FTC Issues Policy Statement on Age Verification Technologies Under COPPA*: https://www.mayerbrown.com/en/insights/publications/2026/02/ftc-issues-policy-statement-on-age-verification-technologies-under-coppa

> ⚠️ Nota metodológica: `ftc.gov` devolvió HTTP 403 a las peticiones automatizadas durante esta
> investigación, así que las FAQ oficiales de COPPA **no se leyeron directamente**. Lo que aquí se
> atribuye a la FTC procede de citas en despachos y de extractos de buscador. **El abogado debe
> verificar contra el original**, especialmente la pregunta 1 de la sección 5.

**Florida**
- TechPolicy.Press, tracker de HB 3: https://www.techpolicy.press/tracker/florida-hb3/
- PRIVO, análisis de la definición y requisitos de HB 3: https://www.privo.com/blog/what-is-floridas-hb-3-act-online-protection-for-minors
- Losey Law, sobre la resolución del 11º Circuito (nov-2025): https://www.losey.law/federal-appeals-court-allows-florida-to-enforce-social-media-law-regulating-social-media-use-by-minors/
- Future of Privacy Forum, *Shining a Light on the Florida Digital Bill of Rights*: https://fpf.org/blog/shining-a-light-on-the-florida-digital-bill-of-rights/
- IAPP, *The ranging impacts of Florida's Digital Bill of Rights*: https://iapp.org/news/a/the-ranging-impacts-of-floridas-digital-bill-of-rights
- Digital Media Law Project, Fla. Stat. § 540.08: https://www.dmlp.org/legal-guide/florida-right-publicity

**Texas**
- PRIVO, *What is the Texas SCOPE Act (HB 18)*: https://www.privo.com/blog/what-is-the-texas-scope-act-hb-18
- Texas HB 18, texto: https://capitol.texas.gov/tlodocs/88R/billtext/html/HB00018F.htm
- Davis Wright Tremaine, *Texas Data Privacy and Security Act – An Overview*: https://www.dwt.com/blogs/privacy--security-law-blog/2023/07/texas-data-privacy-and-security-act-overview
- Akin, *Texas Data Privacy Act: What Businesses Need to Know*: https://www.akingump.com/en/insights/alerts/texas-data-privacy-act-what-businesses-need-to-know

**California**
- Holland & Knight, *Ninth Circuit Issues Mixed Ruling on California AADC* (mar-2026): https://www.hklaw.com/en/insights/publications/2026/03/ninth-circuit-issues-mixed-ruling-on-california-age-appropriate-design
- Cooley, *NetChoice v. Bonta: Ninth Circuit Narrows Injunction*: https://www.cooley.com/news/insight/2026/2026-03-30-netchoice-v-bonta-ninth-circuit-narrows-injunction-against-californias-ageappropriate-design-code-act
- Opinión del 9º Circuito (12-mar-2026), PDF: https://netchoice.org/wp-content/uploads/2026/03/NetChoiice-v-Bonta-Ruling-Ninth-Circuit-March-12-2026.pdf
- Carlton Fields, *The CCPA's Impact on Businesses Processing Personal Data of Minors and Children*: https://www.carltonfields.com/insights/publications/2019/ccpa-businesses-processing-personal-data-minors
- Cal. B&P § 22581, texto: https://law.justia.com/codes/california/code-bpc/division-8/chapter-22-1/section-22581/
- Orrick, guía de cumplimiento de SB 568: https://www.orrick.com/en/Insights/2015/02/New-California-Law-for-Minors-Went-Into-Effect-Jan-1-What-You-Need-to-Know-to-Comply

**Nueva York**
- Goodwin, *New York's Child Data Protection Act Is Now In Effect*: https://www.goodwinlaw.com/en/insights/publications/2025/06/alerts-practices-dpc-new-yorks-child-data-protection-act-now-effect
- Covington (Inside Privacy), *New York Attorney General Issues Guidance on NY CDPA*: https://www.insideprivacy.com/childrens-privacy/new-york-attorney-general-issues-guidance-on-new-york-child-data-protection-act/
- Fiscalía General de NY, *Protecting Children Online*: https://ag.ny.gov/resources/individuals/consumer-issues/technology/protecting-children-online
- Romano Law, sobre NY Civil Rights Law §§ 50-51: https://www.romanolaw.com/right-of-publicity-law/

**Georgia**
- Georgia Recorder, sobre la suspensión judicial de SB 351: https://georgiarecorder.com/briefs/judge-blocks-georgias-new-social-media-age-verification-law-just-before-it-was-set-to-start/
- Courthouse News, *Georgia becomes latest state to block law restricting social media for children*: https://www.courthousenews.com/georgia-becomes-latest-state-to-block-law-restricting-social-media-for-children/

**Colorado y Connecticut**
- Lowenstein Sandler, *Colorado Tightens Rules on Minors' Online Data*: https://www.lowenstein.com/news-insights/publications/client-alerts/colorado-tightens-rules-on-minors-online-data-are-you-ready-for-october-1-data-privacy
- Colorado SB 24-041, texto firmado: https://content.leg.colorado.gov/sites/default/files/2024a_041_signed.pdf
- Connecticut SB 3 / Public Act 23-56, texto: https://www.cga.ct.gov/2023/act/Pa/pdf/2023PA-00056-R00SB-00003-PA.PDF
- Mintz, *Connecticut Overhauls Its Privacy Law* (jun-2026): https://www.mintz.com/insights-center/viewpoints/2826/2026-06-05-connecticut-overhauls-its-privacy-law-what-businesses
- Benesch, *Connecticut Broadens Data Privacy Act Requirements Effective July 1, 2026*: https://www.beneschlaw.com/insight/connecticut-broadens-data-privacy-act-requirements-effective-july-1-2026/

**FERPA**
- U.S. Dept. of Education, *To which educational agencies or institutions does FERPA apply?*: https://studentprivacy.ed.gov/faq/which-educational-agencies-or-institutions-does-ferpa-apply
- U.S. Dept. of Education, carta sobre aplicabilidad de FERPA a colegios privados (oct-2002): https://studentprivacy.ed.gov/resources/letter-parent-regarding-applicability-ferpa-private-schools-october-2002
- U.S. Dept. of Education, *FERPA and Volunteer and Partnership Organizations*: https://studentprivacy.ed.gov/sites/default/files/resource_document/file/ferpa-and-community-based-orgs_2021.pdf

**Práctica del sector**
- Hudl, política de privacidad: https://www.hudl.com/privacy
- MaxPreps, política de privacidad: https://www.maxpreps.com/privacy-policy/
- GameChanger, política de privacidad: https://gc.com/privacy
- SportsRecruits, términos de servicio: https://sportsrecruits.com/terms
