# Revisar 1 - Dispatch de Cobros Club Aba + Mejoras Generales

**Fecha:** 9-10 Feb 2026
**Club afectado:** Corporacion Deportiva Familia Aba (ID: 4, produccion)
**Servidor:** 167.71.88.31 en /var/www/widdo

---

## Problema Original

El owner del club Aba intento despachar un cobro a un jugador especifico y no paso nada. Investigacion completa revelo que **la request NUNCA llego al servidor** (0 registros en Nginx access logs y 0 en Laravel logs).

### Causa raiz
- `DispatchChargeDialog.jsx` linea 187: `if (!charge || !clubId) return;` - retornaba silenciosamente sin feedback al usuario
- `clubId` probablemente llegaba como undefined/null

---

## Estado de Implementacion

### COMPLETADO - Backend

1. **`PlaClubTeamChargeController.php` - index()** (linea 48)
   - Agregado `paymentMethod` al eager loading
   - Antes: `->with(['frequency', 'sports.sport', 'categories.gender', 'categories.sport', 'discounts', 'players.user'])`
   - Ahora: `->with([...mismo..., 'paymentMethod'])`

2. **`PlaClubTeamChargeController.php` - generatePaymentsForCharge()** (linea ~631)
   - Agregado `'payment_method_id' => $charge->payment_method_id` al crear pagos
   - Antes los pagos se creaban SIN payment_method_id

### COMPLETADO - Frontend

3. **`DispatchChargeDialog.jsx`** - Reescrito completamente
   - Muestra metodo de pago del cobro (nombre + cuenta bancaria)
   - Muestra fecha de vencimiento calculada (misma logica que backend)
   - Flujo de 2 pasos: Configurar -> Confirmar -> Generar
   - Invalida queries de charges y payments despues de generar
   - Cierra el dialogo automaticamente tras generacion exitosa
   - Fix del bug silencioso: ahora muestra toast de error si falta charge o clubId
   - Muestra cantidad de jugadores activos en modo "todos"

4. **`ChargesSheetContent.jsx`** - Flujo de edicion modificado
   - Nuevo prop `onDispatch`
   - Boton "Generar Pagos Ahora" ahora llama `onDispatch(chargeSelected)` en vez de despachar directamente
   - Eliminada funcion `handleDispatchPayments` (estaba inline, sin confirmacion, sin seleccion de jugadores)
   - Eliminados imports no usados: `useQueryClient`, `Loader2`, `dispatchCharge`

5. **`ChargesSheetForm.jsx`** - Acepta y pasa prop `onDispatch`

6. **`ChargesTable.jsx`** - Conecta todo
   - Nuevo handler `handleDispatchFromSheet(charge)`:
     - Cierra el sheet de edicion
     - Espera 200ms
     - Abre el DispatchChargeDialog con el cobro
   - Pasa `onDispatch={handleDispatchFromSheet}` a ambas instancias de ChargesSheetForm

### Flujo resultante

```
EDITAR cobro (Sheet) -> Click "Generar Pagos Ahora"
  -> Cierra sheet -> Abre DispatchChargeDialog
  -> Configurar (jugadores, notificacion) -> Confirmar resumen -> Generar -> Toast + cierre

DESDE TABLA (boton rayo) -> Abre DispatchChargeDialog directamente
  -> Mismo flujo de configurar -> confirmar -> generar
```

---

## PENDIENTE - No implementado aun

### 1. Quitar is_hidden de 4 cobros en produccion (Club Aba, ID: 4)

Los siguientes cobros deben cambiar `is_hidden = false` para que se generen automaticamente:

| Cobro | ID (verificar en prod) | Tipo |
|-------|------------------------|------|
| Mensualidad Tipo 1 | 1 | Mensual, due_day: 10 |
| Mensualidad Tipo 2 | 7 | Mensual, due_day: 10 |
| Matricula Mayores | 2 | Anual |
| Matricula Menores | 9 | Anual |

**Comando para ejecutar en produccion:**
```bash
ssh root@167.71.88.31
cd /var/www/widdo
php artisan tinker --execute="
\$ids = [1, 7, 2, 9]; // VERIFICAR IDs correctos antes
\$charges = App\Models\PlaClubTeamCharge::withoutGlobalScopes()
    ->where('club_id', 4)
    ->whereIn('id', \$ids)
    ->get();
foreach(\$charges as \$c) {
    echo 'Antes: '.\$c->name.' is_hidden='.\$c->is_hidden.PHP_EOL;
    \$c->update(['is_hidden' => false]);
    echo 'Despues: '.\$c->name.' is_hidden='.\$c->is_hidden.PHP_EOL;
}
"
```

### 2. Deploy a produccion

Los cambios de backend y frontend deben subirse:

**Backend:**
```bash
cd /Users/miguelcano/Desktop/todo/Widdo/desarrollo/saas_sport
git add app/Http/Controllers/PlaClubTeamChargeController.php
git commit -m "fix: copy payment_method_id to payments and eager load paymentMethod"
git push origin main
# Deploy automatico via GitHub Actions
```

**Frontend:**
```bash
cd /Users/miguelcano/Desktop/todo/Widdo/desarrollo/frontend
git add src/components/charges/DispatchChargeDialog.jsx
git add src/pages/dashboard/Chargers/ChargesSheetContent.jsx
git add src/pages/dashboard/Chargers/ChargesSheetForm.jsx
git add src/pages/dashboard/Chargers/ChargesTable.jsx
git commit -m "fix: unified dispatch flow with confirmation, payment method and due date display"
git push origin main
# Deploy automatico en Netlify
```

### 3. Verificar dispatch funciona en produccion

Despues del deploy:
1. Login como owner de club Aba
2. Ir a Cobros
3. Click en rayo de un cobro -> debe abrir DispatchChargeDialog
4. Verificar que muestra metodo de pago y fecha vencimiento
5. Generar pagos -> confirmar -> verificar que se crean

### 4. Probar localmente (pendiente)

- Crear un cobro nuevo con send_immediately marcado
- Editar un cobro existente -> click "Generar Pagos Ahora" -> verificar flujo completo
- Verificar que payment_method_id se copia al pago generado

---

## Datos de produccion Club Aba (ID: 4)

### Cobros (8 total, todos is_hidden=true actualmente)

| ID | Nombre | Frecuencia | Monto | due_day | payment_method_id |
|----|--------|-----------|-------|---------|-------------------|
| 1 | Mensualidad Tipo 1 | Mensual | ? | 10 | 1 (Bancolombia) |
| 2 | Matricula Mayores | Anual | ? | null | 1 (Bancolombia) |
| 3 | Uniforme Principal | Pago Unico | ? | null | 2 (Nequi) |
| 4 | Uniforme Alterno | Pago Unico | ? | null | 2 (Nequi) |
| 5 | Trimestre Sub 7-12 | Pago Unico | ? | null | 1 (Bancolombia) |
| 6 | Trimestre Sub 13-18 | Pago Unico | ? | null | 1 (Bancolombia) |
| 7 | Mensualidad Tipo 2 | Mensual | ? | 10 | 1 (Bancolombia) |
| 9 | Matricula Menores | Anual | ? | null | 1 (Bancolombia) |

### Metodos de pago del club

| ID | Nombre | Cuenta |
|----|--------|--------|
| 1 | Bancolombia | 36000002931 |
| 2 | Nequi | 3005939756 |

---

## Archivos modificados (resumen)

| Archivo | Cambio |
|---------|--------|
| `saas_sport/app/Http/Controllers/PlaClubTeamChargeController.php` | Eager load paymentMethod + copy payment_method_id |
| `frontend/src/components/charges/DispatchChargeDialog.jsx` | Reescrito: 2 pasos, metodo pago, fecha vencimiento |
| `frontend/src/pages/dashboard/Chargers/ChargesSheetContent.jsx` | onDispatch prop, eliminado dispatch inline |
| `frontend/src/pages/dashboard/Chargers/ChargesSheetForm.jsx` | Pass-through de onDispatch |
| `frontend/src/pages/dashboard/Chargers/ChargesTable.jsx` | handleDispatchFromSheet, conecta sheet con dialog |

---

## Contexto adicional

- El flujo de CREAR cobro con `send_immediately=true` sigue funcionando igual (el backend lo maneja en el store)
- El DispatchChargeDialog calcula la fecha de vencimiento con la misma logica que el backend:
  - Si tiene `specific_due_date` -> usa esa fecha
  - Si tiene `due_day` -> usa ese dia del mes actual (si ya paso, mes siguiente)
  - Si no tiene nada -> fin de mes
- Los pagos generados ahora tendran `payment_method_id` del cobro, lo cual permite que los padres vean donde pagar
- El flujo de confirmacion muestra: cobro, monto, jugadores, metodo, vencimiento, notificacion
