# Análisis del Módulo de Referidos - Antigravity

## 🔴 CRÍTICO - Sí debemos agregar

### 1. Período de confirmación (holdback period)

```
Comisión generada → status: "pending" (7 días)
                  → status: "available" (puede retirar)
```

**Por qué es crítico:** Si un club paga y luego hace chargeback o disputa, ya habrías pagado la comisión. El período de espera protege tu dinero.

**Agregar:** Campo `available_at` en `pla_referral_commissions`

---

### 2. Retenciones fiscales (Colombia)

**MUY IMPORTANTE** - Esto es un tema legal serio.

En Colombia, si pagas a una persona natural:
- **Retención en la fuente:** 11% sobre honorarios/servicios
- **Debe emitir factura/cuenta de cobro** si supera cierto monto

**Opciones:**
- **A)** Asumir la retención y pagar el bruto (tu costo sube 11%)
- **B)** Descontar la retención del pago (usuario recibe menos)
- **C)** Solo pagar a personas con RUT activo que facturen

**Recomendación:** Empezar simple - pagar bruto y asumir retención. Cuando escale, implementar sistema de facturación.

**Agregar:** Campo `tax_withheld_cents` en `pla_referral_payouts`

---

## 🟡 ÚTIL - Agregar para v1.0

### 3. Wallet/Balance consolidado

Se puede implementar como método calculado en el modelo sin tabla adicional para el MVP:

```php
// En User.php
public function getReferralBalance(): int {
    return $this->referralCommissions()
        ->where('status', 'available')
        ->whereNull('payout_id')
        ->sum('amount_cents');
}
```

**Decisión:** Empezar con método calculado, migrar a tabla si hay problemas de performance.

---

### 4. Tracking de clicks detallado

Contador básico está bien para empezar. UTM tracking completo es para v2.0 cuando tengas volumen.

**Agregar mínimo:** `user_agent`, `ip_address`, `referrer_url` en una tabla simple `pla_referral_clicks`

---

## 🟢 NO CRÍTICO para MVP

### 5. Campañas múltiples

Para empezar, configuración global está bien. Cuando necesites "20% en enero", puedes:
- Cambiar el parámetro temporalmente
- O agregar tabla de campañas después

**No agregar ahora.** Complejidad innecesaria.

---

### 6. Ventana de retiro (día 1-5)

El `payout_day_of_month` es para el **proceso automático del admin**, no para restringir cuándo el usuario solicita.

El usuario puede solicitar cuando quiera, tú procesas en batch el día X del mes.

**No es problema real.**

---

### 7. Múltiples cuentas bancarias

Ya está diseñado con `is_default = true`. El usuario puede tener varias pero solo una es la principal.

**Ya está resuelto.**

---

## 📝 Resumen - Qué agregar al plan

| Punto | Acción | Prioridad |
|-------|--------|-----------|
| Período de confirmación | Agregar `available_at` + lógica de 7 días | **ALTA** |
| Retención fiscal | Agregar `tax_withheld_cents` | **ALTA** |
| Wallet balance | Método calculado (no tabla) | **MEDIA** |
| Clicks detallados | Tabla `pla_referral_clicks` básica | **MEDIA** |
| Campañas múltiples | v2.0 | BAJA |
| Historial transacciones | Derivable de comisiones + payouts | BAJA |

---

## Tabla adicional sugerida: `pla_referral_clicks`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | int | PK |
| `referral_code_id` | int | FK → pla_referral_codes |
| `ip_address` | string | IP del visitante |
| `user_agent` | string | Browser/dispositivo |
| `referrer_url` | string | De dónde viene |
| `landing_page` | string | A dónde llegó |
| `converted` | bool | Si terminó registrándose |
| `created_at` | timestamp | |

---

## Campo adicional en `pla_referral_commissions`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `available_at` | timestamp | Fecha cuando se puede retirar (created_at + 7 días) |

---

## Campo adicional en `pla_referral_payouts`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `tax_withheld_cents` | int | Retención fiscal aplicada (11% en Colombia) |
| `net_amount_cents` | int | Monto neto a pagar (amount - tax) |
