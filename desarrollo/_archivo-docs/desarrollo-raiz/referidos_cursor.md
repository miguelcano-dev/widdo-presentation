# Módulo de Referidos - Widdo

## Documento de Diseño Completo
**Fecha:** 27 de enero de 2026  
**Estado:** Diseño finalizado, pendiente implementación

---

## 1. Resumen Ejecutivo

Sistema de referidos donde cualquier usuario registrado puede generar un código único, los nuevos clubs obtienen descuento en el primer mes, y el referidor recibe comisión recurrente (10%) mientras el club referido siga pagando.

---

## 2. Reglas de Negocio Confirmadas

| Aspecto | Decisión |
|---------|----------|
| **¿Quién puede referir?** | Cualquier usuario registrado |
| **Límite de referidos** | Sin límite |
| **Descuento al referido** | Solo primer mes (% configurable por campaña) |
| **Comisión al referidor** | 10% recurrente mientras el club pague (lifetime) |
| **Modelo de atribución** | First-Touch (primer clic gana) |
| **Ventana de atribución** | 30 días |
| **Captura del código** | Link automático + campo manual en registro |
| **Formato código automático** | `WIDDO-XXXXXX` (6 caracteres alfanuméricos) |
| **Personalización de código** | Sí, después de crear |
| **Mínimo para retiro** | $100.000 COP |
| **Ventana de retiro** | Del 1 al 5 de cada mes |
| **Aprobación de retiros** | Manual inicialmente → Automática después |
| **Tiempo de pago** | 3-5 días hábiles |
| **Período de confirmación** | 7 días antes de liberar comisión |
| **Retención fiscal (Colombia)** | 11% persona natural no responsable IVA |
| **Vigencia del saldo** | Indefinida mientras exista la cuenta |

---

## 3. Reglas de Reembolso y Cancelación

| Escenario | Acción |
|-----------|--------|
| Club referido cancela suscripción | Comisiones ya pagadas se mantienen, futuras se detienen |
| Club referido solicita reembolso | Comisión pendiente se revierte |
| Club referido hace upgrade | Comisión se ajusta al nuevo plan |
| Club referido hace downgrade | Comisión se ajusta al nuevo plan |
| Referidor intenta fraude | Admin puede desactivar código y revocar comisiones |
| Auto-referido detectado | Bloqueado (mismo email/IP) |

---

## 4. Modelo de Datos

### 4.1. Diagrama de Relaciones

```
bas_referral_campaigns (config global)
         │
         │ 1:N
         ▼
pla_referral_codes (código por usuario)
         │
         ├──── 1:N ──── pla_referral_clicks (tracking)
         │
         └──── 1:N ──── pla_referrals (referidos)
                              │
                              └──── 1:N ──── pla_referral_commissions
                                                    │
                                                    ▼
                                          pla_referral_wallets (billetera)
                                                    │
                                                    ├──── 1:N ──── pla_wallet_transactions
                                                    │
                                                    └──── 1:N ──── pla_referral_withdrawals
                                                                          │
                                                                          ▼
                                                              pla_referral_bank_accounts
```

### 4.2. Definición de Tablas

```sql
-- =====================================================
-- MÓDULO DE REFERIDOS - WIDDO
-- =====================================================

-- -----------------------------------------------------
-- 1. CONFIGURACIÓN DE CAMPAÑAS DE DESCUENTO
-- -----------------------------------------------------
CREATE TABLE bas_referral_campaigns (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NULL,
    
    -- Descuento para el referido
    referee_discount_percent DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    referee_discount_months INT NOT NULL DEFAULT 1,
    
    -- Comisión para el referidor
    referrer_commission_percent DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    referrer_commission_type ENUM('lifetime', 'limited_months') DEFAULT 'lifetime',
    referrer_commission_months INT NULL, -- Solo si type = limited_months
    
    -- Vigencia de la campaña
    starts_at TIMESTAMP NULL,
    ends_at TIMESTAMP NULL,
    
    -- Restricciones
    applicable_codes JSON NULL, -- NULL = todos, o array de prefijos ["PARTNER-", "VIP-"]
    max_uses INT UNSIGNED NULL, -- Límite total de usos
    current_uses INT UNSIGNED DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE, -- Campaña por defecto
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active_dates (is_active, starts_at, ends_at),
    INDEX idx_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 2. CÓDIGOS DE REFERIDO (uno por usuario)
-- -----------------------------------------------------
CREATE TABLE pla_referral_codes (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    
    code VARCHAR(30) NOT NULL, -- WIDDO-A7X2K9
    custom_code VARCHAR(30) NULL, -- Código personalizado (JUAN-COACH)
    
    -- Estadísticas
    total_clicks INT UNSIGNED DEFAULT 0,
    total_signups INT UNSIGNED DEFAULT 0, -- Registros
    total_conversions INT UNSIGNED DEFAULT 0, -- Pagaron al menos 1 mes
    total_active INT UNSIGNED DEFAULT 0, -- Actualmente activos
    total_earnings_cents BIGINT UNSIGNED DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user (user_id),
    UNIQUE KEY unique_code (code),
    UNIQUE KEY unique_custom_code (custom_code),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 3. TRACKING DE CLICKS EN LINKS DE REFERIDO
-- -----------------------------------------------------
CREATE TABLE pla_referral_clicks (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    referral_code_id BIGINT UNSIGNED NOT NULL,
    
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    referer_url TEXT NULL,
    landing_url TEXT NULL,
    
    -- UTM parameters para Google Analytics
    utm_source VARCHAR(100) NULL,
    utm_medium VARCHAR(100) NULL,
    utm_campaign VARCHAR(100) NULL,
    utm_content VARCHAR(100) NULL,
    utm_term VARCHAR(100) NULL,
    
    session_id VARCHAR(100) NULL, -- Para tracking de conversión
    converted_to_signup BOOLEAN DEFAULT FALSE,
    converted_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (referral_code_id) REFERENCES pla_referral_codes(id) ON DELETE CASCADE,
    
    INDEX idx_session (session_id),
    INDEX idx_created (created_at),
    INDEX idx_code_created (referral_code_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 4. REFERIDOS (relación referidor-referido)
-- -----------------------------------------------------
CREATE TABLE pla_referrals (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    referral_code_id BIGINT UNSIGNED NOT NULL,
    campaign_id BIGINT UNSIGNED NULL, -- Campaña activa al momento del registro
    
    -- El referido
    referred_user_id BIGINT UNSIGNED NOT NULL,
    referred_club_id BIGINT UNSIGNED NULL, -- Se llena cuando crea club
    referred_subscription_id BIGINT UNSIGNED NULL,
    
    -- Estados
    status ENUM(
        'pending',      -- Se registró pero no ha pagado
        'converted',    -- Pagó primera suscripción
        'active',       -- Suscripción activa, generando comisiones
        'churned',      -- Canceló suscripción
        'refunded'      -- Pidió reembolso
    ) DEFAULT 'pending',
    
    -- Fechas importantes
    first_touch_at TIMESTAMP NOT NULL, -- Cuando usó el link/código
    signed_up_at TIMESTAMP NULL, -- Cuando se registró
    converted_at TIMESTAMP NULL, -- Cuando pagó primera vez
    churned_at TIMESTAMP NULL,
    
    -- Descuento aplicado al referido
    discount_percent_applied DECIMAL(5,2) NULL,
    discount_amount_cents INT UNSIGNED NULL,
    discount_applied_to_invoice_id BIGINT UNSIGNED NULL,
    
    -- Tracking
    attribution_source ENUM('link', 'manual_code') DEFAULT 'link',
    click_id BIGINT UNSIGNED NULL, -- Referencia al click original
    ip_address VARCHAR(45) NULL,
    
    -- Ventana de atribución
    attribution_expires_at TIMESTAMP NULL, -- first_touch + 30 días
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (referral_code_id) REFERENCES pla_referral_codes(id),
    FOREIGN KEY (campaign_id) REFERENCES bas_referral_campaigns(id) ON DELETE SET NULL,
    FOREIGN KEY (referred_user_id) REFERENCES users(id),
    FOREIGN KEY (referred_club_id) REFERENCES pla_club_teams(id) ON DELETE SET NULL,
    FOREIGN KEY (click_id) REFERENCES pla_referral_clicks(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_referred_user (referred_user_id),
    INDEX idx_status (status),
    INDEX idx_referral_code (referral_code_id),
    INDEX idx_attribution_expires (attribution_expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 5. BILLETERA DE CADA USUARIO
-- -----------------------------------------------------
CREATE TABLE pla_referral_wallets (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Saldos en centavos (COP)
    available_balance_cents BIGINT DEFAULT 0, -- Disponible para retiro
    pending_balance_cents BIGINT DEFAULT 0, -- En período de confirmación (7 días)
    
    -- Totales históricos
    total_earned_cents BIGINT UNSIGNED DEFAULT 0,
    total_withdrawn_cents BIGINT UNSIGNED DEFAULT 0,
    total_reversed_cents BIGINT UNSIGNED DEFAULT 0, -- Por reembolsos
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 6. TRANSACCIONES DE BILLETERA
-- -----------------------------------------------------
CREATE TABLE pla_wallet_transactions (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    wallet_id BIGINT UNSIGNED NOT NULL,
    
    type ENUM(
        'commission_pending',   -- Comisión en espera (7 días)
        'commission_released',  -- Comisión liberada
        'withdrawal_requested', -- Retiro solicitado
        'withdrawal_completed', -- Retiro completado
        'withdrawal_rejected',  -- Retiro rechazado (devuelve saldo)
        'reversal',             -- Reversión por reembolso
        'adjustment'            -- Ajuste manual por admin
    ) NOT NULL,
    
    amount_cents BIGINT NOT NULL, -- Positivo o negativo según tipo
    balance_after_cents BIGINT NOT NULL, -- Saldo después de la transacción
    pending_after_cents BIGINT NOT NULL, -- Pendiente después de la transacción
    
    -- Referencias
    referral_id BIGINT UNSIGNED NULL,
    commission_id BIGINT UNSIGNED NULL,
    withdrawal_id BIGINT UNSIGNED NULL,
    invoice_id BIGINT UNSIGNED NULL,
    
    description VARCHAR(255) NULL,
    admin_user_id BIGINT UNSIGNED NULL, -- Si es ajuste manual
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (wallet_id) REFERENCES pla_referral_wallets(id),
    
    INDEX idx_wallet (wallet_id),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 7. COMISIONES GENERADAS (detalle por pago del referido)
-- -----------------------------------------------------
CREATE TABLE pla_referral_commissions (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    referral_id BIGINT UNSIGNED NOT NULL,
    wallet_id BIGINT UNSIGNED NOT NULL,
    
    -- Referencia al pago del referido
    subscription_invoice_id BIGINT UNSIGNED NOT NULL,
    
    -- Montos
    invoice_amount_cents BIGINT UNSIGNED NOT NULL, -- Lo que pagó el referido
    commission_percent DECIMAL(5,2) NOT NULL,
    commission_amount_cents BIGINT UNSIGNED NOT NULL, -- La comisión calculada
    
    -- Período que cubre
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Estado
    status ENUM(
        'pending',    -- En período de confirmación
        'available',  -- Liberada, disponible
        'reversed'    -- Revertida por reembolso
    ) DEFAULT 'pending',
    
    -- Fechas
    pending_until TIMESTAMP NOT NULL, -- +7 días desde creación
    available_at TIMESTAMP NULL,
    reversed_at TIMESTAMP NULL,
    reversal_reason VARCHAR(255) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (referral_id) REFERENCES pla_referrals(id),
    FOREIGN KEY (wallet_id) REFERENCES pla_referral_wallets(id),
    FOREIGN KEY (subscription_invoice_id) REFERENCES pla_subscription_invoices(id),
    
    UNIQUE KEY unique_invoice_commission (subscription_invoice_id),
    INDEX idx_status (status),
    INDEX idx_pending_until (pending_until, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 8. CUENTAS BANCARIAS DE REFERIDORES
-- -----------------------------------------------------
CREATE TABLE pla_referral_bank_accounts (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    
    bank_name VARCHAR(100) NOT NULL,
    account_type ENUM('savings', 'checking') NOT NULL,
    account_number_encrypted VARCHAR(255) NOT NULL, -- Encriptado
    account_number_last4 VARCHAR(4) NOT NULL, -- Últimos 4 dígitos para mostrar
    account_holder_name VARCHAR(150) NOT NULL,
    
    -- Datos fiscales (obligatorio Colombia)
    tax_id_type ENUM('CC', 'CE', 'NIT', 'PP') NOT NULL,
    tax_id VARCHAR(20) NOT NULL,
    is_tax_responsible BOOLEAN DEFAULT FALSE, -- Responsable de IVA
    
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP NULL,
    verified_by BIGINT UNSIGNED NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_default (user_id, is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 9. SOLICITUDES DE RETIRO
-- -----------------------------------------------------
CREATE TABLE pla_referral_withdrawals (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    wallet_id BIGINT UNSIGNED NOT NULL,
    bank_account_id BIGINT UNSIGNED NOT NULL,
    withdrawal_window_id BIGINT UNSIGNED NULL,
    
    -- Montos
    requested_amount_cents BIGINT UNSIGNED NOT NULL,
    retention_percent DECIMAL(5,2) NOT NULL DEFAULT 11.00,
    retention_amount_cents BIGINT UNSIGNED NOT NULL,
    net_amount_cents BIGINT UNSIGNED NOT NULL, -- Lo que recibe el usuario
    
    -- Estado
    status ENUM(
        'pending',      -- Esperando aprobación
        'approved',     -- Aprobada, pendiente de pago
        'processing',   -- En proceso de transferencia
        'completed',    -- Pagada
        'rejected'      -- Rechazada
    ) DEFAULT 'pending',
    
    -- Fechas
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    approved_by BIGINT UNSIGNED NULL,
    processing_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    rejected_at TIMESTAMP NULL,
    rejection_reason VARCHAR(255) NULL,
    
    -- Comprobante de pago
    payment_reference VARCHAR(100) NULL,
    payment_proof_path VARCHAR(255) NULL,
    
    admin_notes TEXT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (wallet_id) REFERENCES pla_referral_wallets(id),
    FOREIGN KEY (bank_account_id) REFERENCES pla_referral_bank_accounts(id),
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_status (status),
    INDEX idx_user (user_id),
    INDEX idx_requested (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 10. VENTANAS DE RETIRO (1-5 de cada mes)
-- -----------------------------------------------------
CREATE TABLE bas_withdrawal_windows (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    month TINYINT UNSIGNED NOT NULL, -- 1-12
    year SMALLINT UNSIGNED NOT NULL,
    
    request_start_day TINYINT UNSIGNED NOT NULL DEFAULT 1,
    request_end_day TINYINT UNSIGNED NOT NULL DEFAULT 5,
    
    payment_deadline DATE NOT NULL, -- Fecha límite de pago (ej: día 10)
    
    is_open BOOLEAN DEFAULT FALSE,
    opened_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    
    total_requests INT UNSIGNED DEFAULT 0,
    total_amount_cents BIGINT UNSIGNED DEFAULT 0,
    total_paid_cents BIGINT UNSIGNED DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_month_year (month, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 5. Flujos de Usuario

### 5.1. Flujo del Referidor (Compartir Código)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FLUJO DEL REFERIDOR                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Usuario logueado → Menú → "Mis Referidos"                       │
│                                                                     │
│  2. Primera vez: Se genera código automático WIDDO-A7X2K9           │
│     - Puede personalizarlo después (JUAN-COACH)                     │
│                                                                     │
│  3. Opciones para compartir:                                        │
│     - Copiar link: widdo.co/r/WIDDO-A7X2K9                         │
│     - Compartir en WhatsApp (mensaje predefinido)                   │
│     - Compartir por Email                                           │
│     - Copiar solo el código                                         │
│                                                                     │
│  4. Panel de estadísticas:                                          │
│     ┌──────────────────────────────────────────────┐                │
│     │  📊 Mis Referidos                            │                │
│     │  ────────────────────────────────────────────│                │
│     │  Clicks: 45  │  Registros: 12  │  Activos: 8 │                │
│     │                                              │                │
│     │  💰 Mi Billetera:                            │                │
│     │  Disponible: $185.000                        │                │
│     │  Pendiente: $15.000 (se libera en 5 días)    │                │
│     │  Total ganado: $540.000                      │                │
│     │                                              │                │
│     │  [Solicitar Retiro]  (disponible del 1-5)    │                │
│     └──────────────────────────────────────────────┘                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2. Flujo del Referido (Usar Código)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FLUJO DEL REFERIDO                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ESCENARIO A - Por Link:                                            │
│  ─────────────────────────────────────────────────────────────────  │
│  1. Click en: widdo.co/r/JUAN-COACH                                 │
│  2. Se guarda cookie con código + timestamp (30 días)               │
│  3. Landing muestra: "15% OFF en tu primer mes"                     │
│  4. Usuario se registra → código asociado automáticamente           │
│                                                                     │
│  ESCENARIO B - Código Manual:                                       │
│  ─────────────────────────────────────────────────────────────────  │
│  1. Usuario va directo a widdo.co/registro                          │
│  2. Ve campo: "¿Tienes código de referido?" [________]              │
│  3. Ingresa: JUAN-COACH                                             │
│  4. Se valida y asocia                                              │
│                                                                     │
│  AL MOMENTO DE PAGAR:                                               │
│  ─────────────────────────────────────────────────────────────────  │
│     ┌──────────────────────────────────────────────┐                │
│     │  Plan Pro - $150.000/mes                     │                │
│     │  Código referido: JUAN-COACH ✓               │                │
│     │  Descuento primer mes: -$22.500 (15%)        │                │
│     │  ─────────────────────────────────────────── │                │
│     │  Total primer mes: $127.500                  │                │
│     │  (Siguiente mes: $150.000)                   │                │
│     └──────────────────────────────────────────────┘                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3. Flujo de Retiro

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FLUJO DE RETIRO                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Usuario tiene $150.000 disponibles                              │
│                                                                     │
│  2. Es entre el 1 y 5 del mes → Botón "Solicitar Retiro" activo     │
│                                                                     │
│  3. Primera vez: Debe agregar cuenta bancaria                       │
│     - Banco: Bancolombia                                            │
│     - Tipo: Ahorros                                                 │
│     - Número: ************4532                                      │
│     - Titular: Juan Pérez                                           │
│     - Documento: CC 1234567890                                      │
│     - ¿Responsable de IVA?: No                                      │
│                                                                     │
│  4. Confirma solicitud:                                             │
│     ┌──────────────────────────────────────────────┐                │
│     │  Monto a retirar: $150.000                   │                │
│     │  Retención (11%): -$16.500                   │                │
│     │  ─────────────────────────────────────────── │                │
│     │  Recibirás: $133.500                         │                │
│     │                                              │                │
│     │  Cuenta destino: Bancolombia *4532           │                │
│     │  Tiempo estimado: 3-5 días hábiles           │                │
│     │                                              │                │
│     │  [Confirmar Retiro]                          │                │
│     └──────────────────────────────────────────────┘                │
│                                                                     │
│  5. Admin revisa y aprueba                                          │
│                                                                     │
│  6. Se procesa transferencia                                        │
│                                                                     │
│  7. Usuario recibe email de confirmación + comprobante              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Cálculo de Retenciones (Colombia)

| Tipo de Contribuyente | Retención en la Fuente | IVA | Total |
|-----------------------|------------------------|-----|-------|
| Persona natural NO responsable de IVA | 11% | 0% | 11% |
| Persona natural responsable de IVA | 11% | 15% del 19% = 2.85% | ~13.85% |
| Persona jurídica | 11% | 19% sobre honorarios | Variable |

**Ejemplo práctico (caso más común):**
```
Retiro solicitado: $150.000
Retención (11%):   -$16.500
Neto a recibir:    $133.500
```

---

## 7. Panel de Usuario - "Mis Referidos"

```
┌─────────────────────────────────────────────────────────────────────┐
│  💰 MI BILLETERA                                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │ Disponible  │  │  Pendiente  │  │ Total Ganado│                  │
│  │  $185.000   │  │   $15.000   │  │  $540.000   │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
│                                                                     │
│  [Solicitar Retiro]  ← Solo activo del 1 al 5 del mes               │
│                        y si disponible >= $100.000                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  🔗 MI CÓDIGO DE REFERIDO                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Código: JUAN-COACH                 [✏️ Personalizar]               │
│  Link: widdo.co/r/JUAN-COACH                                        │
│                                                                     │
│  [📋 Copiar Link]  [📱 WhatsApp]  [✉️ Email]                        │
│                                                                     │
│  📊 Estadísticas:                                                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │
│  │ Clicks  │  │Registros│  │Pagaron  │  │ Activos │                 │
│  │   156   │  │    23   │  │    12   │  │    8    │                 │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  👥 MIS REFERIDOS ACTIVOS (8)                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Club                │ Plan    │ Desde      │ Comisión/mes │ Total  │
│  ─────────────────────────────────────────────────────────────────  │
│  Academia Tigres     │ Pro     │ 15/01/2026 │ $15.000      │$15.000 │
│  Club Deportivo XY   │ Basic   │ 20/12/2025 │ $8.000       │$16.000 │
│  Escuela Fútbol ABC  │ Pro     │ 01/11/2025 │ $15.000      │$45.000 │
│  ...                                                                │
│                                                                     │
│  [Ver todos]                                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  📜 HISTORIAL DE MOVIMIENTOS                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  27/01/2026 │ +$15.000  │ Comisión - Academia Tigres (Ene 2026)    │
│  20/01/2026 │ -$100.000 │ Retiro completado - Bancolombia *4532    │
│  15/01/2026 │ +$15.000  │ Comisión - Academia Tigres (primer pago) │
│  05/01/2026 │ +$8.000   │ Comisión - Club Deportivo XY (Ene 2026)  │
│  ...                                                                │
│                                                                     │
│  [Ver historial completo]                                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Panel de Admin

```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 RESUMEN DEL PROGRAMA DE REFERIDOS                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ Referidores  │  │ Referidos    │  │ Comisiones   │               │
│  │   Activos    │  │  Este Mes    │  │  Pendientes  │               │
│  │     156      │  │      23      │  │  $450.000    │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                     │
│  Total comisiones pagadas (histórico): $2.340.000                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  💳 SOLICITUDES DE RETIRO PENDIENTES (4)                            │
├──────────────┬────────────┬──────────────┬──────────────────────────┤
│ Referidor    │ Monto Neto │ Cuenta       │ Acciones                 │
├──────────────┼────────────┼──────────────┼──────────────────────────┤
│ Juan Pérez   │ $133.500   │ Bancolombia  │ [✓ Aprobar] [✗ Rechazar] │
│ María López  │ $204.700   │ Davivienda   │ [✓ Aprobar] [✗ Rechazar] │
│ Carlos Ruiz  │ $89.000    │ Nequi        │ [✓ Aprobar] [✗ Rechazar] │
│ Ana Gómez    │ $178.000   │ Bancolombia  │ [✓ Aprobar] [✗ Rechazar] │
└──────────────┴────────────┴──────────────┴──────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  ⚙️ CONFIGURACIÓN DEL PROGRAMA                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Campaña por defecto:                                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Descuento al referido:      [15] %  (solo primer mes)         │  │
│  │ Comisión al referidor:      [10] %  (lifetime)                │  │
│  │ Ventana de atribución:      [30] días                         │  │
│  │ Mínimo para retiro:         [100000] COP                      │  │
│  │ Días de retiro:             Del [1] al [5] del mes            │  │
│  │ Días confirmación comisión: [7] días                          │  │
│  │ Retención fiscal default:   [11] %                            │  │
│  │ Programa activo:            [✓]                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  [Guardar cambios]                                                  │
│                                                                     │
│  [+ Crear nueva campaña]  (para promociones especiales)             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  🚫 GESTIÓN DE FRAUDES                                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Buscar código o usuario...]                                       │
│                                                                     │
│  Acciones disponibles:                                              │
│  - Desactivar código de referido                                    │
│  - Revocar comisiones pendientes                                    │
│  - Bloquear usuario del programa                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Estructura de Archivos a Crear

### Backend (Laravel)

```
saas_sport/
├── app/
│   ├── Models/
│   │   └── Referral/
│   │       ├── ReferralCampaign.php
│   │       ├── ReferralCode.php
│   │       ├── ReferralClick.php
│   │       ├── Referral.php
│   │       ├── ReferralWallet.php
│   │       ├── WalletTransaction.php
│   │       ├── ReferralCommission.php
│   │       ├── ReferralBankAccount.php
│   │       ├── ReferralWithdrawal.php
│   │       └── WithdrawalWindow.php
│   │
│   ├── Http/Controllers/
│   │   ├── Api/
│   │   │   ├── ReferralController.php          # Panel usuario
│   │   │   ├── ReferralCodeController.php      # Gestión de códigos
│   │   │   ├── ReferralBankAccountController.php
│   │   │   └── ReferralWithdrawalController.php
│   │   │
│   │   ├── Admin/
│   │   │   ├── AdminReferralController.php
│   │   │   ├── AdminReferralCampaignController.php
│   │   │   └── AdminWithdrawalController.php
│   │   │
│   │   └── Public/
│   │       └── PublicReferralController.php    # Tracking clicks, validar código
│   │
│   ├── Services/
│   │   ├── Referral/
│   │   │   ├── ReferralService.php             # Lógica principal
│   │   │   ├── ReferralAttributionService.php  # Atribución first-touch
│   │   │   ├── ReferralCodeService.php         # Generación/validación códigos
│   │   │   ├── CommissionService.php           # Cálculo de comisiones
│   │   │   ├── WalletService.php               # Operaciones de billetera
│   │   │   └── WithdrawalService.php           # Proceso de retiros
│   │
│   ├── Jobs/
│   │   ├── Referral/
│   │   │   ├── ReleaseCommissionsJob.php       # Liberar comisiones pendientes (7 días)
│   │   │   ├── ProcessApprovedWithdrawalsJob.php
│   │   │   ├── UpdateReferralStatsJob.php      # Actualizar estadísticas
│   │   │   └── OpenWithdrawalWindowJob.php     # Abrir ventana día 1
│   │
│   ├── Console/Commands/
│   │   ├── ProcessReferralCommissions.php      # CRON: Procesar comisiones mensuales
│   │   ├── ReleaseReferralCommissions.php      # CRON: Liberar comisiones (diario)
│   │   └── ManageWithdrawalWindows.php         # CRON: Abrir/cerrar ventanas
│   │
│   ├── Notifications/
│   │   ├── Referral/
│   │   │   ├── NewReferralSignupNotification.php
│   │   │   ├── ReferralConvertedNotification.php
│   │   │   ├── CommissionEarnedNotification.php
│   │   │   ├── CommissionReleasedNotification.php
│   │   │   ├── WithdrawalRequestedNotification.php
│   │   │   ├── WithdrawalApprovedNotification.php
│   │   │   ├── WithdrawalCompletedNotification.php
│   │   │   └── WithdrawalRejectedNotification.php
│   │
│   ├── Observers/
│   │   └── SubscriptionInvoiceObserver.php     # Genera comisiones al pagar
│   │
│   ├── Policies/
│   │   ├── ReferralCodePolicy.php
│   │   ├── ReferralBankAccountPolicy.php
│   │   └── ReferralWithdrawalPolicy.php
│   │
│   └── Http/Requests/
│       └── Referral/
│           ├── StoreReferralCodeRequest.php
│           ├── UpdateReferralCodeRequest.php
│           ├── StoreBankAccountRequest.php
│           └── StoreWithdrawalRequest.php
│
├── database/
│   ├── migrations/
│   │   └── 2026_01_27_000001_create_referral_tables.php
│   │
│   └── seeders/
│       └── ReferralCampaignSeeder.php
│
└── routes/
    └── api.php  # Nuevas rutas de referidos
```

### Frontend (React)

```
frontend/src/
├── pages/
│   ├── dashboard/
│   │   └── Referrals/
│   │       ├── index.jsx                      # Página principal
│   │       ├── ReferralsPage.jsx
│   │       │
│   │       ├── components/
│   │       │   ├── WalletCard.jsx             # Tarjeta de billetera
│   │       │   ├── ReferralCodeCard.jsx       # Código + compartir
│   │       │   ├── ShareButtons.jsx           # Botones WhatsApp, Email, etc
│   │       │   ├── ReferralStats.jsx          # Estadísticas
│   │       │   ├── ActiveReferralsList.jsx    # Lista de referidos activos
│   │       │   ├── TransactionsHistory.jsx    # Historial de movimientos
│   │       │   ├── CustomizeCodeModal.jsx     # Personalizar código
│   │       │   ├── WithdrawalModal.jsx        # Solicitar retiro
│   │       │   └── BankAccountForm.jsx        # Agregar cuenta bancaria
│   │       │
│   │       └── hooks/
│   │           ├── useReferralData.js
│   │           ├── useWallet.js
│   │           ├── useReferralCode.js
│   │           └── useBankAccounts.js
│   │
│   ├── admin/
│   │   └── Referrals/
│   │       ├── index.jsx
│   │       ├── AdminReferralsPage.jsx
│   │       │
│   │       ├── components/
│   │       │   ├── ReferralsDashboard.jsx     # Métricas generales
│   │       │   ├── PendingWithdrawals.jsx     # Retiros pendientes
│   │       │   ├── CampaignsManager.jsx       # Gestión campañas
│   │       │   ├── ReferralsTable.jsx         # Todos los referidos
│   │       │   ├── WithdrawalDetail.jsx       # Detalle de retiro
│   │       │   └── ConfigurationPanel.jsx     # Configuración programa
│   │       │
│   │       └── hooks/
│   │           └── useAdminReferrals.js
│   │
│   └── auth/
│       └── Register/
│           └── components/
│               └── ReferralCodeInput.jsx      # Campo código en registro
│
├── services/
│   └── referralService.js                     # API calls
│
└── landing/
    └── ReferralLanding.jsx                    # Landing para links de referido
```

---

## 10. API Endpoints

### Públicos (sin auth)
```
GET  /api/referral/validate/{code}      # Validar código
POST /api/referral/track-click          # Registrar click
GET  /api/referral/landing/{code}       # Datos para landing
```

### Usuario autenticado
```
# Código de referido
GET  /api/referral/my-code              # Obtener mi código (o crear si no existe)
PUT  /api/referral/my-code              # Personalizar código

# Dashboard
GET  /api/referral/stats                # Mis estadísticas
GET  /api/referral/referrals            # Mis referidos
GET  /api/referral/wallet               # Mi billetera
GET  /api/referral/transactions         # Historial de transacciones
GET  /api/referral/commissions          # Historial de comisiones

# Cuentas bancarias
GET  /api/referral/bank-accounts        # Mis cuentas
POST /api/referral/bank-accounts        # Agregar cuenta
PUT  /api/referral/bank-accounts/{id}   # Actualizar cuenta
DELETE /api/referral/bank-accounts/{id} # Eliminar cuenta

# Retiros
GET  /api/referral/withdrawals          # Mis retiros
POST /api/referral/withdrawals          # Solicitar retiro
GET  /api/referral/withdrawal-window    # Estado ventana actual
```

### Admin
```
# Dashboard
GET  /api/admin/referrals/stats         # Estadísticas globales
GET  /api/admin/referrals/list          # Todos los referidos
GET  /api/admin/referrals/{id}          # Detalle de referido

# Campañas
GET  /api/admin/referrals/campaigns     # Listar campañas
POST /api/admin/referrals/campaigns     # Crear campaña
PUT  /api/admin/referrals/campaigns/{id}# Actualizar campaña

# Retiros
GET  /api/admin/referrals/withdrawals   # Listar retiros
GET  /api/admin/referrals/withdrawals/{id} # Detalle retiro
POST /api/admin/referrals/withdrawals/{id}/approve
POST /api/admin/referrals/withdrawals/{id}/reject
POST /api/admin/referrals/withdrawals/{id}/complete

# Configuración
GET  /api/admin/referrals/config        # Config actual
PUT  /api/admin/referrals/config        # Actualizar config

# Fraude
POST /api/admin/referrals/codes/{id}/deactivate
POST /api/admin/referrals/users/{id}/block
```

---

## 11. Jobs y CRONs

```php
// En app/Console/Kernel.php

protected function schedule(Schedule $schedule)
{
    // Liberar comisiones pendientes (cada día a las 6am)
    $schedule->command('referral:release-commissions')
             ->dailyAt('06:00');
    
    // Procesar comisiones mensuales (día 1 de cada mes a las 3am)
    $schedule->command('referral:process-monthly-commissions')
             ->monthlyOn(1, '03:00');
    
    // Abrir ventana de retiros (día 1 de cada mes a las 00:01)
    $schedule->command('referral:open-withdrawal-window')
             ->monthlyOn(1, '00:01');
    
    // Cerrar ventana de retiros (día 6 de cada mes a las 00:01)
    $schedule->command('referral:close-withdrawal-window')
             ->monthlyOn(6, '00:01');
    
    // Actualizar estadísticas (cada hora)
    $schedule->command('referral:update-stats')
             ->hourly();
}
```

---

## 12. Notificaciones

| Evento | Email | In-App | Destinatario |
|--------|-------|--------|--------------|
| Nuevo registro con mi código | ✓ | ✓ | Referidor |
| Referido pagó primera suscripción | ✓ | ✓ | Referidor |
| Comisión ganada (mensual) | ✓ | ✓ | Referidor |
| Comisión liberada (7 días) | ✗ | ✓ | Referidor |
| Retiro solicitado | ✓ | ✓ | Referidor + Admin |
| Retiro aprobado | ✗ | ✓ | Referidor |
| Retiro completado | ✓ | ✓ | Referidor |
| Retiro rechazado | ✓ | ✓ | Referidor |

---

## 13. Tests a Crear

### Backend (PHPUnit)

```
tests/Feature/Referral/
├── ReferralCodeGenerationTest.php     # Generación y unicidad de códigos
├── ReferralAttributionTest.php        # Lógica first-touch, ventana 30 días
├── ReferralDiscountTest.php           # Cálculo correcto del descuento
├── ReferralCommissionTest.php         # Cálculo de comisiones recurrentes
├── CommissionReleaseTest.php          # Liberación después de 7 días
├── CommissionReversalTest.php         # Reversión por reembolso
├── WalletOperationsTest.php           # Operaciones de billetera
├── WithdrawalRequestTest.php          # Solicitud de retiros
├── WithdrawalProcessingTest.php       # Procesamiento de retiros
├── WithdrawalWindowTest.php           # Ventanas de retiro
├── RetentionCalculationTest.php       # Cálculo de retenciones fiscales
└── FraudPreventionTest.php            # Auto-referido, misma IP, etc.
```

### Frontend (Playwright)

```
tests/e2e/referrals/
├── referral-code-generation.spec.js   # Generación de código
├── referral-sharing.spec.js           # Compartir en WhatsApp, Email
├── referral-landing.spec.js           # Landing page con código
├── referral-signup-flow.spec.js       # Registro con código
├── referral-dashboard.spec.js         # Panel de referidos
├── withdrawal-flow.spec.js            # Flujo de retiro
└── admin-referrals.spec.js            # Panel admin
```

---

## 14. Verificación Manual

### Flujo completo de referido:
1. Usuario A genera código → copia link
2. Usuario B (incógnito) abre link → verifica cookie creada
3. Usuario B se registra → crea club → paga primer mes
4. Verificar descuento aplicado correctamente
5. Usuario A ve referido en su dashboard
6. Esperar 7 días (o simular) → comisión pasa a disponible

### Comisión recurrente:
1. Simular pago mensual del club referido
2. Verificar comisión generada como "pendiente"
3. Ejecutar job de liberación
4. Verificar comisión ahora "disponible"

### Retiro:
1. Usuario tiene >= $100.000 disponibles
2. Es entre día 1-5 del mes
3. Solicita retiro
4. Admin aprueba
5. Admin marca como completado
6. Usuario ve retiro en historial

---

## 15. Consideraciones de Seguridad

- [ ] Encriptar número de cuenta bancaria (AES-256)
- [ ] Rate limiting en tracking de clicks
- [ ] Validar que usuario no se auto-refiera (email, IP, fingerprint)
- [ ] Logs de auditoría para operaciones de billetera
- [ ] Verificación de cuenta bancaria antes de primer pago
- [ ] Límite de retiros por período (anti-fraude)
- [ ] Notificar admin en comportamientos sospechosos

---

## 16. Orden de Implementación Sugerido

1. **Fase 1: Base de datos**
   - Crear migraciones
   - Crear modelos con relaciones
   - Seeder de campaña por defecto

2. **Fase 2: Lógica de negocio**
   - ReferralCodeService (generación de códigos)
   - ReferralAttributionService (tracking, first-touch)
   - CommissionService (cálculo de comisiones)
   - WalletService (operaciones de billetera)

3. **Fase 3: API endpoints**
   - Controllers de usuario
   - Controllers de admin
   - Rutas y políticas

4. **Fase 4: Jobs y CRONs**
   - Liberación de comisiones
   - Procesamiento mensual
   - Ventanas de retiro

5. **Fase 5: Frontend usuario**
   - Panel "Mis Referidos"
   - Compartir código
   - Solicitar retiro

6. **Fase 6: Frontend admin**
   - Dashboard de referidos
   - Gestión de retiros
   - Configuración

7. **Fase 7: Integración**
   - Observer en SubscriptionInvoice
   - Campo de código en registro
   - Landing page de referidos

8. **Fase 8: Testing**
   - Tests unitarios
   - Tests de integración
   - Tests E2E

---

*Documento generado el 27 de enero de 2026*
*Listo para implementación cuando se indique*
