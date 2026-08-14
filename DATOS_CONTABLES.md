# DATOS CONTABLES - Widdo SAS

## Resumen Ejecutivo

Widdo es un SaaS (Software as a Service) de gestión de clubes deportivos.
Miguel Angel Cano es accionista único de la SAS.
Empresa creada en 2017 (fecha inicio actividad: 2017-03-03).

---

## 1. IVA: Widdo NO cobra IVA

- Los servicios de computación en la nube (SaaS) están **excluidos de IVA**
- Base legal: Artículo 476, Numeral 21 del Estatuto Tributario
- Confirmado por la DIAN: Oficio 190 de marzo 2024
- Widdo factura sin IVA: subtotal = total

### Qué está excluido de IVA (no cobras 19%)
- SaaS (Widdo, cualquier software en la nube)
- Hosting / computación en la nube
- Mantenimiento remoto de software

### Qué SÍ cobra IVA (19%)
- Desarrollo de software a la medida (proyectos custom)
- Consultoría (asesoría, no plataforma)
- Venta de licencias de software instalable (no cloud)
- Capacitaciones / cursos

### Ejemplo de factura

```
Widdo SAS - NIT: XXX.XXX.XXX-X

Servicio: Suscripción Widdo Plan Básico - Febrero 2026
Subtotal:    $49,000
IVA:         $0 (Excluido - Art. 476 Num. 21 E.T.)
Total:       $49,000
```

---

## 2. RUT actual de la SAS

### Actividades económicas

| Casilla | Código | Descripción |
|---------|--------|-------------|
| 46 (Principal) | **6202** | Consultoría informática / administración de instalaciones informáticas |
| 48 (Secundaria) | **9511** | Mantenimiento y reparación de computadores |
| 50 (Otras 1) | **7310** | Investigación y desarrollo |
| 50 (Otras 2) | **6190** | Otras actividades de telecomunicaciones |

### Responsabilidades actuales (casilla 53)

| Posición | Código | Significado |
|----------|--------|-------------|
| 1 | **5** | Impuesto de renta - Régimen Ordinario |
| 2 | **7** | Retención en la fuente a título de renta |
| 3 | **14** | Informante de exógena |
| 4 | **48** | Impuesto sobre las ventas - IVA |
| 5 | **52** | Facturador electrónico |
| 6 | **55** | Informante de beneficiarios finales |

---

## 3. Regímenes tributarios

### Opción A: Régimen Ordinario (ACTUAL - por defecto)
- Impuesto de renta corporativo: **35%** sobre la utilidad neta
- Declaración anual

### Opción B: Régimen Simple de Tributación (RST) - RECOMENDADO

Tarifas para actividades donde predomina el factor intelectual (software):

| Ingresos brutos anuales (UVT) | Rango en COP (2026) | Tarifa |
|-------------------------------|---------------------|--------|
| 0 - 6,000 UVT | $0 - $314M | **1.8%** |
| 6,001 - 12,000 UVT | $314M - $628M | **3.2%** |

- Límite máximo: 12,000 UVT (~$628M COP/año)
- Unifica: renta + ICA + IVA en un solo impuesto
- Anticipos bimestrales (recibo 2593): 6 veces al año
- **Inscripción: antes del último día hábil de febrero de cada año (inamovible)**

### Comparación con $650M COP de ingresos anuales

| Régimen | Impuesto total | Tasa efectiva | Dinero para el socio |
|---------|---------------|---------------|---------------------|
| Ordinario (35% renta) | ~$141M | ~21.7% | ~$180M |
| **RST (3.2%)** | **~$48M** | **~8%** | **~$272M** |
| Persona natural (sin SAS) | ~$175M+ | ~27%+ | ~$145M |

**El RST ahorra ~$92M/año vs régimen ordinario a escala de 1,000 clubes.**

---

## 4. Inscripción al RST - Cambios en el RUT

### Lo que hay que cambiar en casilla 53

| Acción | Código | Descripción |
|--------|--------|-------------|
| **QUITAR** | 5 | Renta Régimen Ordinario |
| **AGREGAR** | 47 | Régimen Simple de Tributación |
| Mantener | 7 | Retención en la fuente |
| Mantener | 14 | Informante de exógena |
| Mantener | 48 | IVA (por si se hacen desarrollos a la medida) |
| Mantener | 52 | Facturador electrónico |
| Mantener | 55 | Informante de beneficiarios finales |

### Casilla 53 objetivo:
```
Antes:  5 | 7 | 14 | 48 | 52 | 55
Después: 7 | 14 | 47 | 48 | 52 | 55
```

### IMPORTANTE: No se puede hacer 100% virtual

- El MUISCA NO permite quitar la responsabilidad 5 virtualmente
- Los códigos 04, 05, 06 y 47 son **excluyentes** entre sí
- Hay que **ir presencial** a la DIAN para quitar el 5 y agregar el 47

### Proceso presencial:
1. Agendar cita en: https://agendamientodigiturno.dian.gov.co/
2. Trámite: "Actualización RUT"
3. Llevar: Cédula original + Certificado Cámara de Comercio (vigente <30 días)
4. Decir: "Necesito quitar la responsabilidad 5 y agregar la 47 para inscribirme al RST"
5. Línea DIAN: 57 (601) 307 8064

---

## 5. Impuesto sobre dividendos (persona natural)

Cuando el socio se distribuye las utilidades de la SAS:

### Dividendos NO gravados (utilidades que ya pagaron renta en la SAS)

| Rango (UVT) | Rango en COP (2026) | Tarifa |
|-------------|---------------------|--------|
| 0 - 1,090 | $0 - ~$57,000,000 | **0%** |
| 1,090 - 1,700 | $57M - ~$89M | **15%** |
| Más de 1,700 | Más de $89M | **20%** |

### Dividendos gravados (utilidades que NO pagaron renta)
- Tarifa única: **35%**

---

## 6. Distribución de utilidades - Proceso

### Paso a paso
1. La SAS cierra el año fiscal (31 de diciembre)
2. El contador prepara estados financieros
3. El accionista único firma **Acta de Asamblea** aprobando la distribución
4. Se transfiere de la cuenta empresarial a la cuenta personal del socio
5. Se aplica retención/impuesto según la tabla de dividendos

### Anticipos de utilidades (para vivir durante el año)
- Se pueden hacer transferencias mensuales como "anticipo de utilidades"
- El contador las regulariza al cierre del año contra la distribución final
- Es la práctica estándar en SAS pequeñas de socio único

### Estrategias para reducir impuesto sobre dividendos
- **No repartir el 100%:** Lo que queda en la empresa no paga impuesto de dividendos
- **Reinvertir:** Contratar equipo, marketing, infraestructura (reduce utilidad gravable)
- **Gastos deducibles legítimos:** Computador, celular, internet, herramientas, capacitaciones, viáticos

---

## 7. Obligaciones de la SAS

### Obligatorias

| Obligación | Frecuencia | Costo estimado |
|-----------|-----------|----------------|
| Renovación Cámara de Comercio | Anual | $150,000 - $300,000 |
| Declaración de renta | Anual | Incluido en contador |
| Contabilidad (contador) | Mensual | $200,000 - $500,000/mes |
| Facturación electrónica | Continua | $0 (DIAN gratis) o $50K-$80K/mes (Alegra/Siigo) |
| ICA (impuesto industria y comercio) | Según municipio | Bajo con ingresos bajos |

### NO necesita (con ingresos bajos)

| Concepto | Umbral para obligatoriedad |
|----------|---------------------------|
| Revisor fiscal | >5,000 SMLV en activos o >3,000 SMLV en ingresos |
| Autoretención de renta | >31,300 UVT (~$1,640M COP) |
| IVA | Excluido como SaaS |

### SAS inactiva (si no se usa)
- Sigue obligada a: renovar Cámara de Comercio, declarar renta en ceros, mantener RUT
- Multa por incumplimiento: mínimo 10 UVT (~$524,000 COP) por declaración
- Si no se va a usar: mejor **disolverla formalmente**

---

## 8. Cuenta bancaria

- **TODO el dinero de clientes debe entrar a la cuenta de la SAS**
- Mezclar cuenta personal y empresarial = perder la responsabilidad limitada
- Nequi/Daviplata NO sirven para empresa
- Opciones: Bancolombia Empresarial, Davivienda Empresarial, Bold
- Documentos para abrir: RUT de la SAS, Cámara de Comercio vigente, cédula del representante legal, estados financieros

---

## 9. C Corp en USA - Análisis (NO recomendado ahora)

### Costos anuales de C Corp (Delaware)

| Concepto | Costo |
|----------|-------|
| Stripe Atlas (incorporación) | $500 USD una vez |
| Registered Agent | ~$100-$200 USD/año |
| Franchise Tax Delaware | $400 - $4,000 USD/año |
| Contador USA | $1,000 - $3,000 USD/año |
| **Total anual mínimo** | **~$1,500 - $4,000 USD (~$6M-$16M COP)** |

### Problema: CFC (Controlled Foreign Corporation)
- Como colombiano dueño de >10% de empresa en el exterior, la DIAN la clasifica como CFC
- Hay que reportar ingresos de la C Corp en la declaración de renta en Colombia
- La DIAN puede gravar esas utilidades aunque no se distribuyan
- Se termina pagando impuestos en DOS países (21% USA + obligación Colombia)

### Cuándo SÍ tiene sentido la C Corp
- Cuando se venda a clubes en otros países (México, Chile, USA)
- Cuando se levante inversión de fondos americanos
- Cuando se facture >$50K USD/mes
- Cuando haya product-market fit comprobado

### Estructura recomendada a futuro
- SAS Colombia → cobra a clientes colombianos en COP
- C Corp USA → cobra a clientes internacionales en USD

---

## 10. Planes y precios de Widdo

| Plan | Precio/mes | Miembros |
|------|-----------|----------|
| Básico | $49,000 COP | Hasta 80 |
| Pro | $129,000 COP | Hasta 200 |
| Enterprise | Desde $299,000 COP | Ilimitados |

---

## 11. Proyecciones financieras

### Escenario: 1,000 clubes (mix 60% Básico / 30% Pro / 10% Enterprise)

**Ingresos mensuales a capacidad:**
- 600 Básico × $49,000 = $29,400,000
- 300 Pro × $129,000 = $38,700,000
- 100 Enterprise × $299,000 = $29,900,000
- **Total: $98,000,000/mes → $1,176,000,000/año**

**Gastos mensuales estimados a escala (~$27.5M/mes):**

| Concepto | Mensual | Anual |
|----------|---------|-------|
| Infraestructura (servidores) | $3,000,000 | $36,000,000 |
| Desarrollador (1) | $5,000,000 | $60,000,000 |
| Soporte al cliente (1) | $3,000,000 | $36,000,000 |
| Contador + legal | $2,000,000 | $24,000,000 |
| Marketing | $5,000,000 | $60,000,000 |
| Herramientas | $1,000,000 | $12,000,000 |
| CEO anticipo | $8,000,000 | $96,000,000 |
| Misceláneos | $500,000 | $6,000,000 |
| **Total** | **$27,500,000** | **$330,000,000** |

**P&L proyectado (Régimen Ordinario):**

```
Ingresos brutos:                     $650,000,000
(-) Gastos operativos:              -$330,000,000
= Utilidad antes de impuestos:       $320,000,000
(-) Impuesto renta SAS (35%):       -$112,000,000
= Utilidad neta distribuible:        $208,000,000
(-) Impuesto dividendos:             -$28,600,000
= Neto para el socio:               ~$180,000,000
```

**P&L proyectado (RST):**

```
Ingresos brutos:                     $650,000,000
(-) Gastos operativos:              -$330,000,000
(-) Impuesto RST (~3.2%):            -$20,800,000
= Utilidad neta distribuible:        $299,200,000
(-) Impuesto dividendos:             -$48,000,000
= Neto para el socio:               ~$251,000,000
```

### Curva de crecimiento estimada (14 → 1,000 clubes)

| Mes | Clubes pagando | Ingreso mensual |
|-----|---------------|-----------------|
| Feb | 5 | $245,000 |
| Mar | 15 | $735,000 |
| Abr | 35 | $1,715,000 |
| May | 70 | $3,430,000 |
| Jun | 120 | $5,880,000 |
| Jul | 200 | $9,800,000 |
| Ago | 350 | $17,150,000 |
| Sep | 500 | $24,500,000 |
| Oct | 700 | $34,300,000 |
| Nov | 850 | $41,650,000 |
| Dic | 1,000 | $49,000,000 |

---

## 12. Estrategia de crecimiento (basado en Rockstart Growth Machine)

### Estado actual (Feb 2026)
- 14 clubes activos, 210 jugadores, 404 usuarios
- $0 ingresos, 0 suscripciones pagadas
- Varios clubes dicen que quieren pagar
- Señales de Product-Market Fit (PMF)

### Fase 1: Monetizar (Semana 1-2)
- Llamar 1 a 1 a clubes que quieren pagar
- Ofrecer "Founder's Deal": Plan Pro a precio de Básico de por vida
- Meta: 5 clubes pagando

### Fase 2: Prueba social (Semana 3-4)
- Recolectar 3-5 testimonios
- Agregar a widdo.co: logos de clubes, números, testimonios
- Crear 1 caso de éxito

### Fase 3: Crecimiento controlado (Semana 5-8)
- Programa de referidos (1 mes gratis por referido que se registre)
- Identificar ICP (Ideal Customer Profile) de los 14 clubes
- Un canal de adquisición a la vez (recomendado: WhatsApp + visitas presenciales)

### Fase 4: Retención y producto (paralelo)
- Identificar "sticky feature" y hacerla impecable
- Hablar con clubes cada 2 semanas
- Solo arreglar bugs que bloqueen retención o pagos

### Métricas objetivo

| Métrica | Hoy | Meta 30 días | Meta 90 días |
|---------|-----|-------------|-------------|
| Clubes pagando | 0 | 5 | 12 |
| MRR | $0 | $245K COP | $800K+ COP |
| Clubes totales | 14 | 20 | 30 |
| Churn | ? | <5% | <5% |

---

## 13. Fuentes legales

- [Art. 476 Num. 21 E.T. - Exclusión IVA cloud/SaaS](https://incp.org.co/publicaciones/infoincp-publicaciones/impuestos/nacionales/2024/04/dian-reafirmo-que-los-proveedores-de-servicios-en-la-nube-estan-excluidos-del-iva/)
- [Art. 242 E.T. - Tarifa dividendos personas naturales](https://estatuto.co/242)
- [Régimen Simple de Tributación - DIAN](https://micrositios.dian.gov.co/regimen-simple-tributacion/)
- [IVA para SaaS en Colombia - Phylo Legal](https://phylo.co/blog/iva-para-saas-en-colombia-lo-que-nadie-te-explica/)
- [Exclusión IVA cloud - BDO Colombia](https://www.bdo.com.co/es-co/publicaciones/boletin-informativo-normativa-tributaria-a-tu-alcance/nta-exclusion-de-iva-en-el-servicio-de-computacion-de-la-nube-solo-se-aplica-para-el-proveedor-del)
- [Obligaciones SAS - CuentaTe](https://www.cuentate.com/blog/obligaciones-y-responsabilidades-de-una-sas-en-colombia/)
- [Agendamiento citas DIAN](https://agendamientodigiturno.dian.gov.co/)
- [Inscripción RST si tienes RUT](https://micrositios.dian.gov.co/regimen-simple-tributacion/inscripcion-al-rst-si-tienes-rut/)
- [Video actualización RUT - RST](https://micrositios.dian.gov.co/regimen-simple-tributacion/video-actualizacion-rut/)
- [Delaware C Corp taxes - Kruze](https://kruzeconsulting.com/what-taxes-should-i-pay-as-a-delaware-c-corp-startup/)
- [Colombia CFC rules - PwC](https://taxsummaries.pwc.com/colombia/corporate/other-issues)
- [Stripe Atlas Review 2026](https://startupsavant.com/service-reviews/stripe-atlas)

---

*Documento generado: Febrero 2026*
*Disclaimer: Esta información es orientativa. Consultar siempre con un contador público certificado para decisiones tributarias específicas.*
