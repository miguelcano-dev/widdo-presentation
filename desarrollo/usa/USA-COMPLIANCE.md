# Widdo USA — Compliance y Requisitos Legales

> **Verificado:** Feb 2026 · **Fechas revisadas:** 13 Ago 2026
> **Fuentes:** FHSAA, Florida Legislature, NCSA, U.S. Center for SafeSport, Aspen Institute
> **Insight clave:** Compliance es por TIPO DE ORGANIZACION, no por deporte

---

## 🔴 TODO — Hueco de compliance sin cubrir: privacidad de menores

**Este documento NO cubre COPPA ni FERPA.** Es un hueco real, no un detalle.

Widdo es un producto de deporte juvenil en USA: recoge nombre, fecha de nacimiento,
foto, datos medicos, GPA y calificaciones de menores de edad, y en muchos casos el
menor tiene su propia cuenta. Eso toca de lleno dos regimenes federales que aqui no
estan analizados:

| Norma | Por que nos toca | Estado |
|-------|------------------|--------|
| **COPPA** (Children's Online Privacy Protection Act) | Servicio online que recoge datos personales de menores de 13. Exige consentimiento verificable de los padres, aviso de privacidad especifico, limites de retencion y derecho de borrado | ⬜ **Sin analizar** |
| **FERPA** (Family Educational Rights and Privacy Act) | Si un club o school athletic dept nos pasa expedientes academicos (GPA, core courses NCAA), esos datos pueden ser "education records" y arrastran obligaciones al proveedor | ⬜ **Sin analizar** |

**Pendiente:** revision legal, no de ingenieria. Antes de vender a school athletic
departments o de abrir cuentas a menores de 13 hay que saber que aplica y que
tenemos que cambiar (consentimiento parental verificable, retencion, borrado,
acuerdos de tratamiento de datos con el club). Ninguno de los flujos actuales de
Widdo se ha auditado contra esto.

---

## Principio: Compliance configurable

Widdo implementa compliance como un dashboard CONFIGURABLE por club. El owner activa los requisitos que aplican a su estado y tipo de organizacion. No se puede hardcodear porque cada estado tiene leyes diferentes.

```
Settings → Compliance Requirements

☑ Sports Physical (annual)        → cualquier club serio
☑ Concussion Protocol             → cualquier club serio
☑ Background Check (coaches)      → OBLIGATORIO FL, VIGENTE (desde 1-jul-2026)
☐ ECG Screening                   → solo FHSAA
☐ SafeSport Certification         → solo NGB-affiliated
☐ Insurance Verification          → opcional
☐ CPR/First Aid (coaches)         → opcional
☑ Custom: ________________        → el club define
```

---

## Obligatorio por ley en Florida

### 1. Background Check Level 2 (fingerprinting)

| Campo | Detalle |
|-------|---------|
| Ley | HB 975, pospuesta por SB 1546 |
| Fecha efectiva | **Julio 1, 2026 — YA VIGENTE** (entro en vigor hace mes y medio) |
| Consecuencia comercial | Ya no es "va a entrar": un club de FL sin background checks Level 2 **hoy esta fuera de norma**. Argumento de urgencia real, no hipotetico |
| Aplica a | TODA organizacion privada que organice deportes juveniles en FL |
| Personas | Coaches, asistentes, managers, referees — cualquier adulto con contacto con menores (pagado o voluntario) |
| Proceso | Fingerprints via FDLE (Florida Department of Law Enforcement), cruce contra registros de ofensores sexuales estatales y nacionales |
| Responsabilidad | De la organizacion (sanctioning authority), NO del individuo |

### 2. Sports Physical EL-2 (solo escuelas FHSAA)

- Examen medico anual, valido 365 dias
- Formulario revisado julio 2025 (version actual)
- No transferible entre escuelas (cambio de escuela requiere re-completar pagina 1)
- Requiere firma de medico + padre + estudiante

### 3. Concussion Protocol (FHSAA + buena practica universal)

- Video anual obligatorio "Concussion in Sports" en NFHSlearn.com
- Remocion inmediata si hay sintomas (perdida de consciencia, dolor de cabeza, mareo, confusion)
- NO puede volver a jugar el mismo dia
- Clearance de medico (AHCP) para volver a practicar/competir

### 4. ECG Screening (solo FHSAA)

- **Fecha efectiva:** Julio 1, 2026 — **YA VIGENTE**
- Solo grados 9-12, primera vez en actividad atletica FHSAA
- Electrocardiograma antes de cualquier tryout, practica o entrenamiento
- Va en el formulario EL-2 del año escolar 2026-27, que arranca ahora
  (⚠️ conviene reconfirmar en FHSAA.org la version publicada del formulario:
  la ultima verificacion de fuentes de este doc es de feb-2026)

---

## Obligatorio si estan afiliados a un NGB

### 5. SafeSport Certification

- **Ley federal:** Protecting Young Victims from Sexual Abuse and Safe Sport Authorization Act (2017, enmendada 2020)
- Obligatoria para cualquier adulto en contacto con menores en orgs afiliadas a NGBs del USOPC: USA Soccer, USA Basketball, USA Swimming, USA Track & Field, USA Volleyball, USA Gymnastics, etc.
- Curso online de 4 partes en uscenterforsafesport.org
- Renovacion anual
- Politicas MAAPP 2025 (Minor Athlete Abuse Prevention Policies)
- Si el club inscribe equipos en torneos de USA Basketball, USA Soccer, etc., sus coaches la necesitan

---

## Buena practica (no obligatorio pero esperado)

### 6. Waivers y consent forms
- Liability waiver (exencion de responsabilidad)
- Medical release / emergency authorization
- Photo/video consent
- Concussion acknowledgment firmado por padres
- Padres en USA son litigiosos — sin waivers firmados el club se expone a demandas

### 7. Insurance verification
- Verificar que cada atleta tenga seguro medico activo
- Aseguradoras del club lo exigen cada vez mas

### 8. CPR/First Aid certification (coaches)
- Muchas organizaciones lo requieren internamente
- No es ley estatal pero si politica comun

---

## NIL (Name, Image, Likeness) — Florida HB 981

- **Fecha efectiva:** Julio 1, 2025 — vigente desde hace mas de un año
- Menores de 18 requieren permiso escrito de padres
- NO puede usar uniforme, logo, nombre del club, ni marcas FHSAA/NFHS
- **Prohibido promover:** alcohol, tabaco, vaping, nicotina, gambling (incluye sports betting, loteria), armas, municiones, farmaceuticos, entretenimiento para adultos
- NIL Collectives PROHIBIDOS para high school (a diferencia de college)
- Debe cumplir FHSAA Bylaw 9.9 (amateurismo)

---

## NCAA Eligibility (para academias orientadas a college)

| Division | GPA minimo | Core Courses | Regla 10/7 | SAT/ACT |
|----------|-----------|--------------|------------|---------|
| D1 | 2.3 | 16 | Si (10 de 16 antes del 7mo semestre) | Eliminados permanentemente (ene 2023) |
| D2 | 2.2 | 16 | No | Eliminados |
| D3 | Ninguno (cada universidad define) | N/A | No | Varia por universidad |
| NAIA | 2.0 (con 2 de 3 criterios) | N/A | No | Opcional |

**16 core courses:** 4 English, 3 Math (Algebra 1+), 2 Science (1 lab), 1 adicional EN/Math/Science, 2 Social Science, 4 adicionales

Universidades individuales pueden pedir test scores para admision general, pero NCAA Eligibility Center ya no los usa.

---

## ¿Que varia por estado vs que es federal?

| Requisito | ¿Igual en todos los estados? | Notas |
|-----------|------------------------------|-------|
| Background checks | ❌ VARIA | Cada estado tiene su propia ley. FL es Level 2 fingerprinting |
| Sports physical | ❌ VARIA | Cada state athletic association tiene su formulario. EL-2 es SOLO de FL |
| Concussion protocol | ✅ 50 estados tienen ley | Pero detalles varian (video, formulario, quien da clearance) |
| ECG screening | ❌ SOLO Florida (por ahora) | Vigente desde el 1-jul-2026 |
| SafeSport | ✅ FEDERAL | Igual en todo USA para orgs afiliadas a NGB |
| NCAA eligibility | ✅ NACIONAL | Mismas reglas en los 50 estados |
| NIL high school | ❌ VARIA | No todos los estados lo permiten. FL si (desde julio 2025) |
| Waivers | ✅ Buena practica en todo USA | No hay ley federal, pero todos los clubs los usan |
| Stripe/pagos | ✅ Igual en todo USA | Stripe funciona en todo el pais |

---

## Cada requisito → Feature de Widdo → Fase de implementacion

| Requisito | Feature Widdo | Fase |
|-----------|--------------|------|
| Background Check Level 2 | Compliance Dashboard: tracking fecha, status, vencimiento (anual) | Fase 6 |
| Sports Physical EL-2 | Compliance Dashboard: tracking fecha, documento subido, alerta vencimiento | Fase 6 |
| Concussion Protocol | Compliance Dashboard: tracking certificado video + firma padres | Fase 6 |
| ECG Screening | Compliance Dashboard: compliance type configurable, tracking fecha y resultado | Fase 6 |
| SafeSport Certification | Coach Credentials: tracking certificacion por coach, fecha, alerta renovacion | Fase 6 |
| Insurance Verification | Compliance Dashboard: compliance type configurable | Fase 6 |
| CPR/First Aid | Coach Credentials: compliance type configurable | Fase 6 |
| Waivers digitales | Enrollment Page: templates configurables, firma digital, PDF con timestamp | Fase 5 |
| NCAA GPA tracking | NCAA Eligibility Tab: GPA vs requirement, regla 10/7, college interests | Fase 9 |
| NCAA Core Courses | NCAA Eligibility Tab: progress bar 16 courses, alerta deadline | Fase 9 |
| NIL tracking | NIL module: contrato, marca, monto, consent parental | Fase 11 |
| Todo en ingles | i18n system: **JSON estaticos en el frontend** (`frontend/src/i18n/locales/{en,es,pt-BR}/`, 37 namespaces × 14.389 keys) + `lang/` de Laravel para emails y validaciones. **No hay traducciones en base de datos**: ese enfoque se descarto | Fases 2-3 |
| Stripe payments | Stripe Gateway (`StripeGateway.php`) + Connect + webhooks. ⚠️ **Integrado pero en `sandbox`**: pasar a live es el **Gate 0** | Fase 4 |

---

## Fuentes verificadas (Feb 2026)

| Tema | Fuente |
|------|--------|
| EL-2 Physical | FHSAA.org (formulario julio 2025), Winter Park Athletics |
| ECG nuevo | FHSAA Health & Wellness, formulario EL-3 enero 2026 |
| Background checks FL | Sadler Sports, BackgroundChecks.com, FRPA, Florida Statutes 943.0438 |
| SB 1546 (postpone) | Florida Legislature |
| Concussion protocol | FHSAA Health & Wellness |
| SafeSport | U.S. Center for SafeSport, Global Sports Advocates, Sadler Sports, MAAPP 2025 |
| NCAA eligibility | NCSA Sports, NCAA D1 Fact Sheet, Higher Ed Dive |
| NIL Florida | Florida Senate HB 981 Analysis, Romano Law, FHSAA NIL Resources, Opendorse |
| rSchool cierre | Arbiter PR Newswire, rSchoolToday Blog, Bound migration guide |
| Title IX | U.S. Dept of Education, Congress.gov, Bricker Graydon |
