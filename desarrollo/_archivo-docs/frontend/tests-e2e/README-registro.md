<!-- ARCHIVADO 13-ago-2026 — no era un README sino el ticket de un bug de mar-2026 (boton
     "Crear club" siempre disabled desde Playwright por `useForm()` en modo onSubmit).
     Se archiva por tres razones: (1) es un ticket disfrazado de documentacion; (2) el
     comando que propone usa `--project=public`, un proyecto que NO existe en
     playwright.config.js (solo hay setup, money, login, chromium), asi que ni arranca;
     (3) su spec `registro-nuevo-usuario.spec.js` esta entre los ~67 en cuarentena.
     El bug de fondo NO se ha verificado como arreglado — si vuelve a aparecer, el
     diagnostico y las dos opciones de arreglo siguen siendo validos. -->

# Test E2E: Registro Nuevo Usuario

## Ejecutar
```bash
npx playwright test registro-nuevo-usuario.spec.js --headed --project=public
```

## Estado actual
- ✅ Registro (3 pasos)
- ✅ Verificar email (Mailpit puerto 8026)
- ✅ Pre-club onboarding (3 slides)
- ❌ Crear club (bloqueado)

## Problema pendiente

El formulario de crear club (`src/pages/dashboard/ClubTeam/ClubTeamCreateEditPage.jsx`) tiene un issue:

1. Usa `useForm()` con mode por defecto (`onSubmit`)
2. El botón "Enviar" está condicionado a `isValid`
3. Los campos controlados (sports con react-select, city con CityAutocomplete) no disparan validación correctamente
4. Resultado: botón siempre disabled cuando se llena desde Playwright

## Solución necesaria

Opción A - En el formulario:
```javascript
// Cambiar línea ~76 en ClubTeamCreateEditPage.jsx
const { ... } = useForm({ mode: 'onChange' });

// Y asegurar que los campos controlados tengan reglas de validación
```

Opción B - Cambiar lógica del botón:
```javascript
// En lugar de usar isValid, validar manualmente los campos requeridos
```

## Flujo completo esperado (cuando se arregle)

1. Registro → 2. Verificar email → 3. PreClubOnboarding → 4. Crear Club → 5. ClubOwnerOnboarding (5 pasos) → 6. Dashboard con SetupChecklist

## Archivos relacionados
- `tests/e2e/registro-nuevo-usuario.spec.js` - El test
- `tests/e2e/helpers/mailhog.js` - Helper para emails (puerto 8026)
- `src/pages/dashboard/ClubTeam/ClubTeamCreateEditPage.jsx` - Formulario con el issue
- `src/components/onboarding/roles/ClubOwnerOnboarding.jsx` - Onboarding post-club
- `src/components/dashboard/SetupChecklist.jsx` - Checklist en dashboard
