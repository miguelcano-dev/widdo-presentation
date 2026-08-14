 Mi análisis

  Tu sistema de pagos ya tiene la arquitectura correcta:

  - Modelo de datos → Sólido (charges, payments, installments, descuentos,
  exenciones)
  - Generación automática → Funciona bien, valida categorías
  - Cálculo de descuentos → Centralizado en ChargeService
  - appliesToPlayer() → Ya existe, solo no se usa en la validación manual
  - Installments → Bien diseñado con estados PEV/APR/REJ

  El problema real es pequeño y específico: el formulario manual no filtra ni valida.
   Migrar datos o reconstruir el sistema sería:
  - Riesgoso (hay pagos reales en producción)
  - Innecesario (la base está bien)
  - Costoso en tiempo sin ganancia real

  Lo que haría concretamente

  Son 3 cambios puntuales:

  1. Backend - Nuevo endpoint que filtra cobros por jugador (usa appliesToPlayer()
  que ya existe)

  2. Backend - Agregar validación en StorePlaClubTeamPaymentRequest (una función)

  3. Frontend - Que el dropdown de cobros en RegisterPaymentDialog llame al endpoint
  filtrado cuando se selecciona un jugador

  No se mueve data, no se cambian tablas, no se rompe nada existente.