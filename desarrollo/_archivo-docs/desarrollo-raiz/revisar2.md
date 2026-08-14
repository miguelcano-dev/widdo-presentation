# Revisión 2 - Dispatch de Cobros a Jugadores Específicos

**Fecha:** 9 de Febrero de 2026
**Contexto:** Continuación de la implementación de "Solo envío manual" (is_hidden)

---

## Pregunta del Usuario

> "cuando se va a enviar a un solo jugador uno especifico pero para un mes especifico o un cobro especifico como se hace"

---

## Estado Actual del Dispatch

### Cómo funciona hoy

Desde la tabla de **Cobros** (`/home/chargers`):

1. En la fila del cobro, clic en el botón **"Generar Pagos"** (icono de rayo)
2. Se abre el **DispatchChargeDialog** que permite:
   - Marcar **"Seleccionar jugadores específicos"** y buscar al jugador
   - Elegir si enviar notificación por email o no
   - Detecta automáticamente conflictos con otros cobros de misma frecuencia
3. Al dar clic en **"Generar Pagos"**, se crea el pago pendiente solo para ese jugador

### Archivos involucrados

| Archivo | Ubicación | Función |
|---------|-----------|---------|
| `DispatchChargeDialog.jsx` | `frontend/src/components/charges/DispatchChargeDialog.jsx` | Dialog del frontend |
| `ChargesTable.jsx` | `frontend/src/pages/dashboard/Chargers/ChargesTable.jsx` | Tabla con botón dispatch |
| `PlaClubTeamChargeController.php` | `saas_sport/app/Http/Controllers/PlaClubTeamChargeController.php` | Método `dispatch()` (línea 392) |

### Limitación actual: siempre genera para el mes actual

El backend **siempre genera el pago para el mes actual** (líneas 557-558 del controller):

```php
->whereYear('created_at', $today->year)
->whereMonth('created_at', $today->month)
```

No hay opción para seleccionar un mes diferente.

---

## Problema Identificado por el Usuario

> "pero debería validar que periodicidad tiene el cobro para saber si aplica mes o no porque para un pago único o anual?"

### Frecuencias del sistema (`bas_frequencies`)

| ID | Frecuencia | `interval_count` | `interval_type` | `is_single_payment` |
|----|-----------|-------------------|------------------|---------------------|
| 1 | **Pago Único** | null | null | `true` |
| 2 | **Mensual** | 1 | months | `false` |
| 3 | **Trimestral** | 3 | months | `false` |
| 4 | **Semestral** | 6 | months | `false` |
| 5 | **Anual** | 1 | years | `false` |

**Archivo modelo:** `saas_sport/app/Models/BasFrequency.php`
**Archivo seeder:** `saas_sport/database/seeders/BasFrequencySeeder.php`

### Constantes en el modelo

```php
const FREQUENCY_SINGLE = 1;
const FREQUENCY_MONTHLY = 2;
const FREQUENCY_ANNUAL = 3; // OJO: esto dice 3 pero Anual es ID 5 en el seeder
```

---

## Solución Propuesta (PENDIENTE DE IMPLEMENTAR)

### Lógica por frecuencia

| Frecuencia | Selector en UI | Validación de duplicados |
|-----------|----------------|--------------------------|
| **Pago Único** | Sin selector de periodo | Verificar si ya existe CUALQUIER pago (sin importar fecha) |
| **Mensual** | Selector de mes (Ene 2026, Feb 2026...) | Verificar si ya existe pago en ESE mes |
| **Trimestral** | Selector de trimestre (Ene-Mar, Abr-Jun...) | Verificar si ya existe pago en ese rango de 3 meses |
| **Semestral** | Selector de semestre (Ene-Jun, Jul-Dic) | Verificar en ese rango de 6 meses |
| **Anual** | Selector de año (2026, 2027...) | Verificar si ya existe pago en ese año |

### Cambios necesarios

#### Backend (`PlaClubTeamChargeController.php`)

1. Recibir parámetro `period` en el request del dispatch
2. Cambiar la validación de duplicados según la frecuencia del cobro:

```php
// ACTUAL (incorrecto para todas las frecuencias):
->whereYear('created_at', $today->year)
->whereMonth('created_at', $today->month)

// PROPUESTO: validar según frecuencia
switch ($charge->frequency_id) {
    case 1: // Pago único
        // Solo verificar si existe algún pago (sin filtro de fecha)
        break;
    case 2: // Mensual
        // Verificar en el mes/año especificado
        ->whereYear('created_at', $period['year'])
        ->whereMonth('created_at', $period['month'])
        break;
    case 3: // Trimestral
        // Verificar en rango de 3 meses
        ->whereBetween('created_at', [$startOfQuarter, $endOfQuarter])
        break;
    case 4: // Semestral
        // Verificar en rango de 6 meses
        ->whereBetween('created_at', [$startOfSemester, $endOfSemester])
        break;
    case 5: // Anual
        // Verificar en el año
        ->whereYear('created_at', $period['year'])
        break;
}
```

3. Usar la fecha del periodo para el `due_date` del pago generado (no siempre la fecha actual)

#### Frontend (`DispatchChargeDialog.jsx`)

1. Leer `charge.frequency_id` y `charge.frequency` para determinar qué selector mostrar
2. Agregar selector dinámico de periodo:
   - **Pago único**: No mostrar selector
   - **Mensual**: Dropdown con meses (últimos 3 + próximos 3)
   - **Trimestral**: Dropdown con trimestres del año
   - **Semestral**: Dropdown con semestres
   - **Anual**: Dropdown con años
3. Enviar el `period` seleccionado en el payload del dispatch

---

## Archivos a Modificar

### Backend
- `saas_sport/app/Http/Controllers/PlaClubTeamChargeController.php`
  - Método `dispatch()` (línea 392)
  - Método `generatePaymentsForCharge()` (línea 451)

### Frontend
- `frontend/src/components/charges/DispatchChargeDialog.jsx`
  - Agregar selector de periodo dinámico
  - Enviar periodo en el payload

---

## Contexto Previo (Sesión Anterior)

Esta sesión es continuación de la implementación de **"Solo envío manual" (`is_hidden`)** para cobros. Lo implementado antes:

### Backend
- Migración: `is_hidden` boolean (default false) en `pla_club_teams_charges`
- Modelo: `is_hidden` en fillable + casts
- `GenerateMonthlyPayments`: excluye cobros hidden de auto-generación
- `ApplyLateFees`: excluye pagos de cobros hidden de mora
- `ChargeService`: excluye hidden de nuevos jugadores
- `CancelHiddenChargePendingPayments`: comando artisan para cancelar pagos pendientes

### Frontend
- Checkbox "Solo envío manual" con tooltip explicativo
- Lógica de exclusión mutua: al marcar "Solo envío manual", se deshabilitan:
  - "Aplicar automáticamente a nuevos jugadores"
  - "Mostrar en inscripción pública"
- Badge "Solo manual" en amber en la tabla de cobros

### Producción
- Club ABA (ID 4): todos los 8 cobros activos marcados como `is_hidden=true`
- Deploy automático ejecutado
