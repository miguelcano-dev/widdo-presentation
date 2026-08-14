# Payment System Auditor

## Descripcion
Audita el sistema de pagos completo: flujos de cobro, integracion con Wompi, webhooks, calculos de descuentos, cuotas, y reportes financieros.

## Cuando Usar
- Antes de habilitar pagos en produccion
- Cuando hay discrepancias en montos
- Despues de cambios en logica de pagos
- Auditorias financieras

---

## Arquitectura de Pagos en Widdo

### Flujo General
```
1. Owner crea Cargo (Charge) -> Define concepto y monto
2. Sistema genera Pagos (Payments) por jugador
3. Pagos pueden tener Cuotas (Installments)
4. Usuario inicia pago -> Wompi widget
5. Wompi procesa -> Envia webhook
6. Backend actualiza estado
7. Se genera recibo/comprobante
```

### Modelos Involucrados
```
PlaClubTeamCharge        - Concepto de cobro (mensualidad, inscripcion)
PlaClubTeamPayment       - Pago individual por jugador
PlaClubTeamPaymentInstallment - Cuotas de un pago
PlaClubTeamDiscount      - Descuentos aplicables
PlaClubTeamFamilyDiscount - Descuentos por familia
PlaClubTeamLateFeeTier   - Recargos por mora
BasPaymentMethod         - Metodos de pago por pais
BasPaymentGateway        - Pasarelas (Wompi, etc)
```

### Servicios
```
PaymentService.php       - Logica principal de pagos
ChargeService.php        - Creacion de cargos
WompiService.php         - Integracion Wompi
```

---

## Checklist de Auditoria

### 1. Creacion de Cargos

```
[ ] Solo OWNER puede crear cargos
[ ] Monto es positivo y valido
[ ] Fecha de vencimiento es futura
[ ] Se asigna a jugadores correctos (por categoria o individual)
[ ] Cuotas se calculan correctamente si aplica
```

**Verificar:**
```php
// ChargeService.php
public function createCharge($data)
{
    // Validar que amount > 0
    // Validar que due_date > now()
    // Crear payments para cada jugador
}
```

### 2. Calculos de Descuentos

```
[ ] Descuentos porcentuales se calculan correctamente
[ ] Descuentos fijos se restan del total
[ ] Descuentos por familia se aplican al 2do+ hijo
[ ] No se pueden aplicar descuentos que excedan el monto
[ ] Descuentos inactivos no se aplican
```

**Formulas:**
```
Monto final = Monto base - Descuento fijo - (Monto base * Descuento %)
Monto final >= 0 (nunca negativo)
```

**Verificar logica:**
```php
// PaymentService.php
public function calculateFinalAmount($payment)
{
    $amount = $payment->base_amount;

    foreach ($payment->discounts as $discount) {
        if ($discount->type === 'percentage') {
            $amount -= $amount * ($discount->value / 100);
        } else {
            $amount -= $discount->value;
        }
    }

    return max(0, $amount);
}
```

### 3. Cuotas (Installments)

```
[ ] Numero de cuotas es positivo
[ ] Suma de cuotas = monto total
[ ] Fechas de vencimiento son consecutivas
[ ] Estado inicial es "pending"
[ ] Al pagar una cuota, se actualiza su estado
```

**Verificar:**
```php
// Al crear cuotas
$installmentAmount = $totalAmount / $numberOfInstallments;
// Ultima cuota absorbe diferencia por redondeo
```

### 4. Recargos por Mora (Late Fees)

```
[ ] Se calculan despues de fecha de vencimiento
[ ] Tiers se aplican correctamente (1-7 dias: 5%, 8-15 dias: 10%)
[ ] No se aplican si hay gracia configurada
[ ] Monto con recargo se actualiza automaticamente
```

**Verificar:**
```php
// LateFeeTier model
// tier 1: days_from=1, days_to=7, percentage=5
// tier 2: days_from=8, days_to=15, percentage=10

public function calculateLateFee($payment)
{
    $daysLate = now()->diffInDays($payment->due_date);
    $tier = LateFeeTier::where('days_from', '<=', $daysLate)
                       ->where('days_to', '>=', $daysLate)
                       ->first();

    return $payment->amount * ($tier->percentage / 100);
}
```

### 5. Integracion Wompi

```
[ ] Credenciales por ambiente (sandbox/produccion)
[ ] Firma de integridad se genera correctamente
[ ] Widget se carga con datos correctos
[ ] Moneda es correcta (COP para Colombia)
[ ] Reference es unica por transaccion
```

**Verificar configuracion:**
```php
// config/services.php
'wompi' => [
    'public_key' => env('WOMPI_PUBLIC_KEY'),
    'private_key' => env('WOMPI_PRIVATE_KEY'),
    'integrity_secret' => env('WOMPI_INTEGRITY_SECRET'),
    'events_secret' => env('WOMPI_EVENTS_SECRET'),
],
```

**Firma de integridad:**
```php
// WompiService.php
public function generateSignature($reference, $amountInCents, $currency)
{
    $concatenated = $reference . $amountInCents . $currency . $this->integritySecret;
    return hash('sha256', $concatenated);
}
```

### 6. Webhook de Wompi

```
[ ] Endpoint es publico (sin auth)
[ ] Valida firma del webhook
[ ] Procesa evento "transaction.updated"
[ ] Actualiza estado del pago correctamente
[ ] Maneja duplicados (idempotencia)
[ ] Registra evento en logs/audit
[ ] Retorna 200 OK rapidamente
```

**Verificar:**
```php
// WompiWebhookController.php
public function handle(Request $request)
{
    // 1. Validar firma
    $signature = $request->header('X-Event-Signature');
    if (!$this->validateSignature($request->getContent(), $signature)) {
        return response()->json(['error' => 'Invalid signature'], 401);
    }

    // 2. Verificar idempotencia
    $eventId = $request->input('data.transaction.id');
    if (WebhookEvent::where('external_id', $eventId)->exists()) {
        return response()->json(['message' => 'Already processed'], 200);
    }

    // 3. Procesar segun estado
    $status = $request->input('data.transaction.status');
    // APPROVED, DECLINED, VOIDED, ERROR

    // 4. Actualizar pago
    // 5. Registrar evento

    return response()->json(['message' => 'OK'], 200);
}
```

### 7. Estados de Pago

```
Estados validos:
- pending: Creado, esperando pago
- processing: Pago iniciado en pasarela
- completed: Pago exitoso
- failed: Pago rechazado
- cancelled: Cancelado manualmente
- refunded: Reembolsado

Transiciones validas:
pending -> processing -> completed
pending -> processing -> failed
pending -> cancelled
completed -> refunded
```

### 8. Reportes Financieros

```
[ ] Total cobrado = suma de pagos completed
[ ] Total pendiente = suma de pagos pending
[ ] Mora = suma de late fees aplicados
[ ] Filtros por fecha funcionan correctamente
[ ] Exportacion PDF/Excel genera datos correctos
```

---

## Pruebas de Flujo Completo

### Test 1: Pago Exitoso
```
1. Crear cargo de $100,000 COP
2. Generar pago para jugador X
3. Iniciar checkout Wompi (sandbox)
4. Usar tarjeta de prueba exitosa
5. Verificar webhook recibido
6. Verificar pago en estado "completed"
7. Verificar recibo generado
```

### Test 2: Pago Rechazado
```
1. Crear pago pending
2. Usar tarjeta de prueba rechazada
3. Verificar webhook con status DECLINED
4. Verificar pago en estado "failed"
5. Verificar que se puede reintentar
```

### Test 3: Descuento Aplicado
```
1. Crear descuento del 10%
2. Crear cargo de $100,000
3. Verificar pago tiene amount = $90,000
```

### Test 4: Cuotas
```
1. Crear cargo de $120,000 en 3 cuotas
2. Verificar 3 installments de $40,000
3. Pagar primera cuota
4. Verificar solo esa cuota es "completed"
```

### Test 5: Mora
```
1. Crear pago con due_date = hace 10 dias
2. Ejecutar job de calculo de mora
3. Verificar late_fee aplicado segun tier
```

---

## Tarjetas de Prueba Wompi

```
Exitosa:      4242 4242 4242 4242
Rechazada:    4111 1111 1111 1111
Fondos insuf: 4012 8888 8888 1881

CVV: cualquier 3 digitos
Fecha: cualquier fecha futura
```

---

## Comandos de Debug

```bash
# Ver webhooks recibidos
SELECT * FROM pla_webhook_events
WHERE gateway = 'wompi'
ORDER BY created_at DESC LIMIT 10;

# Pagos con discrepancias
SELECT p.id, p.base_amount, p.final_amount, p.status
FROM pla_club_team_payments p
WHERE p.base_amount != p.final_amount
AND p.discount_id IS NULL;

# Cuotas que no suman el total
SELECT payment_id, SUM(amount) as sum_installments,
       (SELECT amount FROM pla_club_team_payments WHERE id = payment_id) as payment_amount
FROM pla_club_team_payment_installments
GROUP BY payment_id
HAVING sum_installments != payment_amount;
```

---

## Seguridad de Pagos

```
[ ] Credenciales no estan en codigo (usar .env)
[ ] Private key nunca se expone al frontend
[ ] Webhook valida firma antes de procesar
[ ] Montos no se pueden manipular desde frontend
[ ] Reference no es predecible
[ ] Logs no contienen datos de tarjeta
```

---

## Reporte de Hallazgos

### CRITICO
- Webhook no valida firma
- Monto se puede modificar desde frontend
- Credenciales hardcodeadas

### ALTO
- Descuentos se aplican incorrectamente
- Cuotas no suman el total
- Estado no se actualiza tras webhook

### MEDIO
- Late fees no se calculan automaticamente
- Reportes muestran datos incorrectos
- Falta idempotencia en webhook

### BAJO
- Recibo no incluye todos los campos
- Formato de moneda inconsistente
