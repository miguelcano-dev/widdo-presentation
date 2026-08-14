# Especificación: Agente IA para Widdo

> Documento de referencia para implementación futura

---

## Resumen Ejecutivo

Agente de IA que permite a los administradores/propietarios del club ejecutar acciones mediante lenguaje natural, ahorrando tiempo en tareas administrativas repetitivas.

**Alcance:** Solo administradores/propietarios (no entrenadores, padres ni jugadores)

**Razón:** Costo-beneficio. Abrir a todos los usuarios (~170 por club) aumentaría costos de API sin valor proporcional. Los admins son quienes más se benefician de automatizar tareas repetitivas.

---

## Costos Estimados

### Por Interacción

| Modelo | Input (~2K tokens) | Output (~500 tokens) | Total/interacción |
|--------|-------------------|---------------------|-------------------|
| **Claude Haiku** (recomendado) | $0.25/1M | $1.25/1M | **~$0.001** |
| GPT-4o mini | $0.15/1M | $0.60/1M | ~$0.0006 |
| Claude Sonnet | $3/1M | $15/1M | ~$0.014 |
| GPT-4o | $2.50/1M | $10/1M | ~$0.01 |

### Por Club (Mensual)

**Supuestos:**
- 1-2 administradores por club
- Uso moderado: 3-5 interacciones/día
- ~100-150 interacciones/mes por club

| Modelo | 100 interacciones | 150 interacciones |
|--------|-------------------|-------------------|
| **Claude Haiku** | $0.10 USD | $0.15 USD |
| GPT-4o mini | $0.06 USD | $0.09 USD |
| Claude Sonnet | $1.40 USD | $2.10 USD |
| GPT-4o | $1.00 USD | $1.50 USD |

### Escala

| Clubes | Interacciones/mes | Costo API/mes (Haiku) |
|--------|-------------------|----------------------|
| 10 | 1,500 | $1.50 USD |
| 50 | 7,500 | $7.50 USD |
| 100 | 15,000 | $15 USD |
| 500 | 75,000 | $75 USD |

**Conclusión:** Con Haiku, el costo por club es ~$0.15 USD/mes (~$600 COP), menos del 1% de los ingresos por suscripción.

---

## Acciones del Agente (Fase 1)

### Gestión de Personas

```
crear_entrenador(nombre, email, telefono, categorias[])
crear_jugador(nombre, documento, fecha_nacimiento, categoria, acudiente{})
crear_acudiente(nombre, email, telefono, jugadores[])
asignar_categoria(entrenador_id, categorias[])
desactivar_usuario(usuario_id, motivo)
```

### Gestión de Eventos

```
crear_evento(tipo, fecha, hora, categoria, lugar, rival?)
cancelar_evento(evento_id, motivo, notificar: bool)
convocar_jugadores(evento_id, jugadores[] | "todos")
enviar_recordatorio(evento_id)
```

### Gestión de Pagos

```
registrar_pago(jugador_id, monto, concepto, fecha)
generar_cobro(categoria | jugador_id, concepto, monto, fecha_limite)
enviar_recordatorio_pago(jugadores[] | "morosos")
```

### Comunicaciones

```
enviar_notificacion(destinatarios, mensaje)
notificar_categoria(categoria_id, mensaje)
notificar_club(mensaje)
```

### Reportes/Consultas

```
resumen_pagos(mes?, categoria?)
resumen_asistencia(categoria?, rango_fechas?)
listar_morosos()
```

---

## Ejemplos de Uso

### Registro de Jugador Completo
```
Usuario: "Registra al jugador Santiago López, cédula 1234567890,
         nacido el 15 de marzo de 2012, categoría Sub-12,
         papá Carlos López, tel 3001234567, email carlos@mail.com"

Agente: "Voy a crear:
         • Jugador: Santiago López (CC 1234567890)
         • Fecha nacimiento: 15/03/2012
         • Categoría: Sub-12
         • Acudiente: Carlos López
           - Tel: 3001234567
           - Email: carlos@mail.com

         ¿Confirmo? [Sí] [Cancelar]"

Usuario: [Sí]

Agente: "Listo. Santiago López fue registrado en Sub-12.
         Carlos López recibirá un email para activar su cuenta de acudiente."
```

### Registro de Hermanos
```
Usuario: "Registra a los hermanos López: Juan (Sub-12) y María (Sub-15),
         papá Carlos López, tel 3001234567, email carlos@mail.com"

Agente: Crea 2 jugadores + 1 acudiente + los vincula automáticamente
```

### Crear Evento
```
Usuario: "Programa partido contra Club Tigres el sábado 15 a las 3pm
         en cancha principal, categoría Sub-15"

Agente: "Voy a crear:
         • Partido vs Club Tigres
         • Fecha: Sábado 15 de febrero, 3:00 PM
         • Lugar: Cancha principal
         • Categoría: Sub-15

         ¿Envío convocatoria a los jugadores? [Sí] [Solo crear] [Cancelar]"
```

### Gestión de Pagos
```
Usuario: "Envía recordatorio de pago a todos los que deben febrero"

Agente: "Encontré 12 jugadores con cuotas pendientes de febrero
         por un total de $2,400,000 COP.

         ¿Envío recordatorio por email/notificación? [Sí] [Ver lista] [Cancelar]"
```

### Comunicaciones
```
Usuario: "Notifica a la Sub-12 que mañana se cancela el entreno por lluvia"

Agente: "Enviaré notificación a 18 acudientes de Sub-12:
         'Se cancela el entrenamiento de mañana debido a lluvia.'

         ¿Confirmo? [Sí] [Editar mensaje] [Cancelar]"
```

### Consultas Rápidas
```
Usuario: "¿Cuántos jugadores tienen pagos pendientes?"

Agente: "Tienes 12 jugadores con cuotas vencidas:
         • Sub-12: 5 jugadores ($1,000,000)
         • Sub-15: 4 jugadores ($800,000)
         • Sub-17: 3 jugadores ($600,000)
         Total: $2,400,000 COP

         ¿Quieres ver el detalle o enviar recordatorios?"
```

---

## Arquitectura Técnica

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React) - Chat Widget                             │
│  • Solo visible para rol: admin/propietario                 │
│  • Floating button en esquina inferior derecha              │
│  • Modal con historial de conversación                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  POST /api/agent/chat                                       │
│  Headers: Authorization: Bearer {token}                     │
│  Body: {                                                    │
│    message: "texto del usuario",                            │
│    conversation_id?: "uuid",                                │
│    confirm_action?: "action_id"                             │
│  }                                                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  AgentController@chat (Laravel)                             │
│  1. Validar que usuario sea admin/owner del club            │
│  2. Rate limiting (30 req/min)                              │
│  3. Obtener contexto del club                               │
│  4. Delegar a AgentService                                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  AgentService                                               │
│                                                             │
│  1. Construir prompt:                                       │
│     - System prompt base                                    │
│     - Contexto del club (categorías, stats)                 │
│     - Funciones disponibles (JSON schema)                   │
│     - Historial de conversación (últimos 10 mensajes)       │
│                                                             │
│  2. Llamar a Claude/OpenAI API con function calling         │
│                                                             │
│  3. Parsear respuesta:                                      │
│     - Si es texto → devolver directamente                   │
│     - Si es function call → validar y ejecutar              │
│                                                             │
│  4. Para acciones sensibles:                                │
│     - Generar preview                                       │
│     - Guardar acción pendiente                              │
│     - Esperar confirmación del usuario                      │
│                                                             │
│  5. Ejecutar acción via Services existentes                 │
│                                                             │
│  6. Loguear todo (tokens, costo, resultado)                 │
│                                                             │
│  7. Retornar respuesta                                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Services Existentes de Widdo                               │
│  • UserService (crear entrenadores, acudientes)             │
│  • PlayerService (crear jugadores, asignar categorías)      │
│  • EventService (crear eventos, convocatorias)              │
│  • PaymentService (registrar pagos, cobros)                 │
│  • NotificationService (enviar notificaciones)              │
│                                                             │
│  El agente NUNCA accede a DB directamente                   │
└─────────────────────────────────────────────────────────────┘
```

### System Prompt Base

```
Eres el asistente administrativo del club "{nombre_club}" en Widdo.

CONTEXTO DEL CLUB:
- Categorías activas: {lista_categorias}
- Total entrenadores: {cantidad}
- Total jugadores activos: {cantidad}
- Pagos pendientes este mes: {cantidad} (${monto_total})

TU ROL:
- Ayudar al administrador a gestionar el club de forma eficiente
- Ejecutar acciones administrativas mediante las funciones disponibles
- Responder consultas sobre el estado del club

REGLAS IMPORTANTES:
1. Solo puedes ejecutar las funciones definidas abajo
2. SIEMPRE confirma antes de:
   - Crear usuarios (entrenadores, jugadores, acudientes)
   - Enviar notificaciones
   - Modificar o eliminar datos
3. Si falta información necesaria, pregunta antes de asumir
4. Responde en español, de forma concisa y amigable
5. Si no puedes hacer algo, sugiere la alternativa en la plataforma
6. Nunca inventes datos de jugadores, pagos o estadísticas

FORMATO DE RESPUESTA:
- Para confirmaciones, muestra un resumen claro de lo que harás
- Para consultas, presenta datos de forma organizada
- Usa listas y formato cuando mejore la legibilidad

FUNCIONES DISPONIBLES:
{functions_json_schema}
```

### Functions JSON Schema (para API)

```json
{
  "functions": [
    {
      "name": "crear_entrenador",
      "description": "Crea un nuevo entrenador en el club",
      "parameters": {
        "type": "object",
        "properties": {
          "nombre": {
            "type": "string",
            "description": "Nombre completo del entrenador"
          },
          "email": {
            "type": "string",
            "description": "Email del entrenador (se usará para login)"
          },
          "telefono": {
            "type": "string",
            "description": "Teléfono de contacto"
          },
          "categorias": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Categorías a asignar (ej: ['Sub-12', 'Sub-15'])"
          }
        },
        "required": ["nombre", "email"]
      }
    },
    {
      "name": "crear_jugador",
      "description": "Registra un nuevo jugador en el club",
      "parameters": {
        "type": "object",
        "properties": {
          "nombre": {
            "type": "string",
            "description": "Nombre completo del jugador"
          },
          "documento": {
            "type": "string",
            "description": "Número de documento de identidad"
          },
          "fecha_nacimiento": {
            "type": "string",
            "description": "Fecha de nacimiento (YYYY-MM-DD)"
          },
          "categoria": {
            "type": "string",
            "description": "Categoría del jugador (ej: 'Sub-12')"
          },
          "acudiente": {
            "type": "object",
            "properties": {
              "nombre": {"type": "string"},
              "email": {"type": "string"},
              "telefono": {"type": "string"},
              "parentesco": {"type": "string"}
            },
            "description": "Datos del acudiente/padre (opcional si ya existe)"
          },
          "acudiente_id": {
            "type": "integer",
            "description": "ID de acudiente existente (alternativa a crear nuevo)"
          }
        },
        "required": ["nombre", "categoria"]
      }
    },
    {
      "name": "crear_evento",
      "description": "Crea un evento (partido, entrenamiento, torneo)",
      "parameters": {
        "type": "object",
        "properties": {
          "tipo": {
            "type": "string",
            "enum": ["partido", "entrenamiento", "torneo", "reunion", "otro"],
            "description": "Tipo de evento"
          },
          "titulo": {
            "type": "string",
            "description": "Título o descripción del evento"
          },
          "fecha": {
            "type": "string",
            "description": "Fecha del evento (YYYY-MM-DD)"
          },
          "hora": {
            "type": "string",
            "description": "Hora del evento (HH:MM)"
          },
          "categoria": {
            "type": "string",
            "description": "Categoría participante"
          },
          "lugar": {
            "type": "string",
            "description": "Ubicación del evento"
          },
          "rival": {
            "type": "string",
            "description": "Nombre del equipo rival (solo para partidos)"
          },
          "notificar": {
            "type": "boolean",
            "description": "Enviar notificación a los jugadores/acudientes"
          }
        },
        "required": ["tipo", "fecha", "hora", "categoria"]
      }
    },
    {
      "name": "enviar_notificacion",
      "description": "Envía notificación a usuarios del club",
      "parameters": {
        "type": "object",
        "properties": {
          "destinatarios": {
            "type": "string",
            "enum": ["todo_el_club", "categoria", "jugadores_especificos", "morosos"],
            "description": "A quién enviar la notificación"
          },
          "categoria": {
            "type": "string",
            "description": "Categoría específica (si destinatarios='categoria')"
          },
          "jugador_ids": {
            "type": "array",
            "items": {"type": "integer"},
            "description": "IDs de jugadores específicos"
          },
          "mensaje": {
            "type": "string",
            "description": "Contenido de la notificación"
          },
          "titulo": {
            "type": "string",
            "description": "Título de la notificación (opcional)"
          }
        },
        "required": ["destinatarios", "mensaje"]
      }
    },
    {
      "name": "registrar_pago",
      "description": "Registra un pago recibido",
      "parameters": {
        "type": "object",
        "properties": {
          "jugador_id": {
            "type": "integer",
            "description": "ID del jugador"
          },
          "jugador_nombre": {
            "type": "string",
            "description": "Nombre del jugador (alternativa al ID)"
          },
          "monto": {
            "type": "number",
            "description": "Monto pagado"
          },
          "concepto": {
            "type": "string",
            "description": "Concepto del pago (ej: 'Mensualidad febrero')"
          },
          "fecha": {
            "type": "string",
            "description": "Fecha del pago (YYYY-MM-DD), default: hoy"
          },
          "metodo_pago": {
            "type": "string",
            "enum": ["efectivo", "transferencia", "tarjeta", "otro"],
            "description": "Método de pago"
          }
        },
        "required": ["monto", "concepto"]
      }
    },
    {
      "name": "consultar_morosos",
      "description": "Lista jugadores con pagos pendientes",
      "parameters": {
        "type": "object",
        "properties": {
          "categoria": {
            "type": "string",
            "description": "Filtrar por categoría (opcional)"
          },
          "mes": {
            "type": "string",
            "description": "Mes específico (YYYY-MM) (opcional)"
          }
        }
      }
    },
    {
      "name": "resumen_club",
      "description": "Obtiene resumen general del estado del club",
      "parameters": {
        "type": "object",
        "properties": {
          "incluir": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": ["pagos", "asistencia", "eventos", "jugadores"]
            },
            "description": "Qué información incluir en el resumen"
          }
        }
      }
    }
  ]
}
```

---

## Seguridad

### Rate Limiting

| Tipo de Acción | Límite | Ventana |
|----------------|--------|---------|
| Consultas (listar, buscar) | 30 | 1 minuto |
| Crear entrenador/jugador | 10 | 1 minuto |
| Enviar notificación individual | 5 | 1 minuto |
| Notificación masiva (club/categoría) | 2 | 1 minuto |
| Eliminar/desactivar | 5 | 1 minuto |

### Acciones que Requieren Confirmación

- Crear cualquier usuario (entrenador, jugador, acudiente)
- Enviar notificaciones
- Cancelar eventos
- Desactivar usuarios
- Cualquier acción que afecte a múltiples registros

### Validaciones

```php
// Antes de ejecutar cualquier acción
class AgentActionValidator
{
    public function validate(User $user, string $action, array $params): bool
    {
        // 1. Usuario debe ser admin/owner del club
        if (!$user->hasRole(['admin', 'owner'])) {
            throw new UnauthorizedException('Solo administradores pueden usar el agente');
        }

        // 2. Acción debe estar en lista permitida
        if (!in_array($action, $this->allowedActions)) {
            throw new InvalidActionException('Acción no permitida');
        }

        // 3. Parámetros deben ser válidos para el club del usuario
        $this->validateParamsForClub($user->club_id, $action, $params);

        // 4. Rate limit no excedido
        $this->checkRateLimit($user->id, $action);

        return true;
    }
}
```

---

## Base de Datos

### Tabla: agent_logs

```sql
CREATE TABLE agent_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    club_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    conversation_id CHAR(36) NULL,

    -- Request
    user_message TEXT NOT NULL,

    -- AI Response
    ai_response TEXT NULL,
    function_called VARCHAR(100) NULL,
    function_params JSON NULL,

    -- Execution
    requires_confirmation BOOLEAN DEFAULT FALSE,
    confirmed_at TIMESTAMP NULL,
    executed_at TIMESTAMP NULL,
    result ENUM('pending', 'confirmed', 'executed', 'cancelled', 'error') DEFAULT 'pending',
    error_message TEXT NULL,

    -- Metrics
    input_tokens INT UNSIGNED NULL,
    output_tokens INT UNSIGNED NULL,
    total_tokens INT UNSIGNED NULL,
    cost_usd DECIMAL(10, 6) NULL,
    response_time_ms INT UNSIGNED NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_club_date (club_id, created_at),
    INDEX idx_user (user_id),
    INDEX idx_conversation (conversation_id),
    INDEX idx_result (result),

    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Tabla: agent_conversations (opcional)

```sql
CREATE TABLE agent_conversations (
    id CHAR(36) PRIMARY KEY,
    club_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,

    title VARCHAR(255) NULL, -- Auto-generado del primer mensaje
    messages JSON NOT NULL,  -- Array de {role, content, timestamp, function_call?}

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_club_user (club_id, user_id),
    INDEX idx_updated (updated_at),

    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Tabla: agent_pending_actions

```sql
CREATE TABLE agent_pending_actions (
    id CHAR(36) PRIMARY KEY,
    club_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    log_id BIGINT UNSIGNED NOT NULL,

    action VARCHAR(100) NOT NULL,
    params JSON NOT NULL,
    preview_message TEXT NOT NULL,

    expires_at TIMESTAMP NOT NULL, -- 5 minutos desde creación
    confirmed_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_pending (user_id, expires_at),

    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (log_id) REFERENCES agent_logs(id) ON DELETE CASCADE
);
```

---

## Dependencias

### Backend (Laravel)

```bash
# Opción 1: Cliente oficial de OpenAI
composer require openai-php/laravel

# Opción 2: Cliente de Anthropic (Claude)
composer require anthropic-ai/anthropic-php

# Para UUIDs en conversaciones
composer require ramsey/uuid
```

### Frontend (React)

```bash
# UI components para el chat widget
npm install @headlessui/react @heroicons/react

# Markdown rendering (para respuestas formateadas)
npm install react-markdown

# Opcional: animaciones
npm install framer-motion
```

---

## Implementación por Fases

### Fase 1: MVP (2-3 semanas)

**Backend:**
- [ ] Migración de tablas (agent_logs, agent_pending_actions)
- [ ] AgentService con integración a Claude/OpenAI
- [ ] 5 funciones básicas:
  - crear_entrenador
  - crear_jugador
  - crear_evento
  - enviar_notificacion
  - consultar_morosos
- [ ] Sistema de confirmación para acciones sensibles
- [ ] Logging básico

**Frontend:**
- [ ] Chat widget flotante (solo visible para admin/owner)
- [ ] UI de conversación básica
- [ ] Botones de confirmación/cancelación

**Validar:**
- ¿Los admins lo usan?
- ¿Les ahorra tiempo real?
- ¿Prefieren la UI normal para algunas cosas?

### Fase 2: Expansión (si Fase 1 exitosa)

- [ ] Más funciones (pagos, reportes detallados)
- [ ] Historial de conversaciones
- [ ] Acciones en lote ("registra estos 5 jugadores")
- [ ] Sugerencias proactivas ("3 jugadores no han confirmado")

### Fase 3: Avanzado (futuro)

- [ ] Integración con WhatsApp (voice notes → texto → acción)
- [ ] Reportes automáticos semanales por email
- [ ] Integración con calendarios externos (Google, Apple)
- [ ] Modo entrenador (funciones limitadas)

---

## Métricas a Trackear

```sql
-- Uso por club
SELECT
    club_id,
    COUNT(*) as total_interactions,
    COUNT(DISTINCT DATE(created_at)) as active_days,
    SUM(cost_usd) as total_cost,
    AVG(response_time_ms) as avg_response_time
FROM agent_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY club_id;

-- Funciones más usadas
SELECT
    function_called,
    COUNT(*) as times_used,
    SUM(CASE WHEN result = 'executed' THEN 1 ELSE 0 END) as successful
FROM agent_logs
WHERE function_called IS NOT NULL
GROUP BY function_called
ORDER BY times_used DESC;

-- Tasa de confirmación
SELECT
    COUNT(CASE WHEN confirmed_at IS NOT NULL THEN 1 END) as confirmed,
    COUNT(CASE WHEN result = 'cancelled' THEN 1 END) as cancelled,
    COUNT(*) as total
FROM agent_logs
WHERE requires_confirmation = TRUE;
```

---

## Notas Finales

### Por qué NO para todos los usuarios

| Usuario | Interacciones estimadas | Valor del agente | Recomendación |
|---------|------------------------|------------------|---------------|
| Admin/Owner | 100-150/mes | Alto (ahorra horas) | ✅ Sí |
| Entrenador | 30-50/mes | Medio | ⚠️ Fase 2 |
| Padre | 10-20/mes | Bajo | ❌ UI suficiente |
| Jugador | 5-10/mes | Muy bajo | ❌ UI suficiente |

Para padres y jugadores, una UI bien diseñada con 3-4 botones claros es más efectiva y no tiene costo variable.

### Modelo recomendado

**Claude Haiku** por:
- Balance costo/calidad óptimo para tareas estructuradas
- Function calling confiable
- Respuestas rápidas (~500ms)
- Costo mínimo ($0.001/interacción)

### Consideraciones de UX

- El chat debe ser **opcional**, no obligatorio
- Mantener acceso a la UI tradicional para todo
- Respuestas del agente deben incluir links a la UI cuando sea útil
- Permitir "deshacer" acciones recientes cuando sea posible
