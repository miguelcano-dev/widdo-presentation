# Revisión 4 - Protección de Validación de IDs en Frontend

**Fecha:** 11 de Febrero de 2026
**Contexto:** Continuación de sesión anterior donde se investigó el bug "Malformed playerId" y se inició la protección sistemática de todas las funciones API del frontend.

---

## Problema Original

El 10 de febrero de 2026 se detectaron 8 ocurrencias del error "Malformed playerId" en producción para el club 11. La investigación determinó que:

- Tanto frontend como backend ya tenían validación defensiva para el path específico de `updatePlayerClubTeam`
- El bug fue probablemente causado por código frontend cacheado o un problema específico del navegador
- Sin embargo, una auditoría reveló que **solo el 49.5% de las funciones API tenían validación de IDs**

---

## Solución Implementada

### 1. Validador Centralizado (creado en sesión anterior)

**Archivo:** `frontend/src/helpers/validateId.js`

```javascript
const validateId = (id, paramName = 'id', context = 'API call') => {
  // Verifica: null, undefined, '', 'undefined', 'null'
  // Verifica: typeof === 'object' (pasar entidad completa en vez de ID)
  // Verifica: contiene comas, timestamps, o length > 20 (datos malformados)
  // Si es válido: retorna true (la llamada API continúa normalmente)
  // Si es inválido: throw Error con mensaje claro para el usuario
};

export const validateClubId = (clubId, context) => validateId(clubId, 'clubId', context);
export const validatePlayerId = (playerId, context) => validateId(playerId, 'playerId', context);
```

### 2. Funciones Completadas en Esta Sesión

#### apiService.js - Últimas 4 funciones de torneos

Funciones que faltaban de la sesión anterior:

| Función | Validaciones agregadas |
|---------|----------------------|
| `removeTournamentStaff` | `validateClubId` + `validateId(tournamentId)` + `validateId(staffId)` |
| `saveTournamentBudget` | `validateClubId` + `validateId(tournamentId)` |
| `exportTournamentPlayers` | `validateClubId` + `validateId(tournamentId)` |
| `sendTournamentNotifications` | `validateClubId` + `validateId(tournamentId)` |

#### legalDocumentService.js - 9 funciones protegidas

| Función | Validaciones |
|---------|-------------|
| `getLegalDocuments` | `validateClubId` |
| `getLegalDocument` | `validateClubId` + `validateId(documentId)` |
| `getLegalDocumentByType` | `validateClubId` |
| `saveLegalDocument` | `validateClubId` |
| `restoreLegalDocumentVersion` | `validateClubId` + `validateId(documentId)` + `validateId(historyId)` |
| `getLegalDocumentHistory` | `validateClubId` + `validateId(documentId)` |
| `deactivateLegalDocument` | `validateClubId` + `validateId(documentId)` |
| `getLegalDocumentTypes` | `validateClubId` |
| `getDefaultSections` | `validateClubId` |

#### consentService.js - 9 funciones protegidas

| Función | Validaciones |
|---------|-------------|
| `fetchConsentTemplate` | `validateClubId` |
| `createConsentTemplate` | `validateClubId` |
| `updateConsentTemplate` | `validateClubId` |
| `fetchConsentVariables` | `validateClubId` |
| `downloadConsentPDF` | `validateClubId` + `validatePlayerId` |
| `downloadRegistrationCardPDF` | `validateClubId` + `validatePlayerId` |
| `getPlayerIDCardPDFUrl` | `validateClubId` + `validatePlayerId` |
| `downloadPlayerIDCardPDF` | `validateClubId` + `validatePlayerId` |
| `downloadParentIDCardPDF` | `validateClubId` + `validateId(parentId)` |

#### expenseService.js - 13 funciones protegidas

| Función | Validaciones |
|---------|-------------|
| `getExpenses` | `validateClubId` |
| `getExpense` | `validateClubId` + `validateId(expenseId)` |
| `createExpense` | `validateClubId` |
| `updateExpense` | `validateClubId` + `validateId(expenseId)` |
| `deleteExpense` | `validateClubId` + `validateId(expenseId)` |
| `approveExpense` | `validateClubId` + `validateId(expenseId)` |
| `markAsPaid` | `validateClubId` + `validateId(expenseId)` |
| `rejectExpense` | `validateClubId` + `validateId(expenseId)` |
| `getSummary` | `validateClubId` |
| `getCategories` | `validateClubId` |
| `createCategory` | `validateClubId` |
| `getReceiptData` | `validateClubId` + `validateId(expenseId)` |
| `downloadReceipt` | `validateClubId` + `validateId(expenseId)` |

#### parentChildService.js - 9 funciones protegidas

| Función | Validaciones |
|---------|-------------|
| `authorizeRelationship` | `validateId(relationshipId)` |
| `denyRelationship` | `validateId(relationshipId)` |
| `deleteRelationship` | `validateId(relationshipId)` |
| `canAccessChild` | `validateId(childId)` |
| `getAuthorizedRelationships` | `validateId(userId)` (cuando userId se provee) |
| `updateRelationship` | `validateId(relationshipId)` |
| `transferPrimaryResponsibility` | `validateId(relationshipId)` |
| `sendNotificationToParent` | `validateId(relationshipId)` |
| `getRelationshipHistory` | `validateId(relationshipId)` |

**Nota:** Funciones sin IDs dinámicos en URLs (`getChildren`, `getParents`, `createRelationship`, `getPendingRelationships`, `validateChildEmail`, `getRelationshipStats`) no necesitan validación.

#### invitationService.js - 8 funciones protegidas

| Función | Validaciones |
|---------|-------------|
| `createTrainerInvitation` | `validateClubId` |
| `createPlayerInvitation` | `validateClubId` |
| `getClubInvitations` | `validateClubId` |
| `resendInvitation` | `validateClubId` + `validateId(invitationId)` |
| `createAccountantInvitation` | `validateClubId` |
| `createOwnerInvitation` | `validateClubId` |
| `createAdminInvitation` | `validateClubId` |
| `cancelInvitation` | `validateClubId` + `validateId(invitationId)` |

**Nota:** Funciones basadas en token (`validateToken`, `acceptInvitation`, `rejectInvitation`, `acceptWithConsent`) usan tokens que son validados server-side, no IDs numéricos.

---

## Cobertura Final

| Archivo | Funciones con IDs en URLs | Con validación | Cobertura |
|---------|--------------------------|----------------|-----------|
| `apiService.js` | ~97 | ~97 | ~100% |
| `legalDocumentService.js` | 9 | 9 | 100% |
| `consentService.js` | 9 | 9 | 100% |
| `expenseService.js` | 13 | 13 | 100% |
| `parentChildService.js` | 9 | 9 | 100% |
| `invitationService.js` | 8 (con clubId/IDs) | 8 | 100% |
| **TOTAL** | **~145** | **~145** | **~100%** |

**Funciones excluidas de validación (por diseño):**
- Funciones de datos de referencia geográfica (`fetchCountryById`, `fetchStates`, `fetchCities`, etc.) - son datos públicos de referencia
- Funciones basadas en token de invitación (`validateToken`, `acceptInvitation`, etc.) - los tokens se validan en el servidor

---

## Impacto en Funcionamiento Existente

**Ninguno.** Los cambios son puramente defensivos:

- Si el ID es válido (caso normal): `validateId` retorna `true` y la llamada API continúa exactamente igual
- Si el ID es inválido: se lanza un Error con mensaje claro **antes** de hacer la llamada HTTP
  - Antes: el request llegaba al servidor y retornaba un error 500/404 críptico
  - Ahora: el error se captura en el frontend con un mensaje como "playerId inválido. Por favor recarga la página."

---

## Verificación

- Build de producción (`npx vite build`): **Compiló sin errores**
- Todos los imports de `@/helpers/validateId` resuelven correctamente
- No se modificó ninguna lógica de negocio, solo se agregaron validaciones antes de las llamadas HTTP

---

## Archivos Modificados

| Archivo | Tipo de cambio |
|---------|---------------|
| `frontend/src/helpers/validateId.js` | Creado (sesión anterior) |
| `frontend/src/services/apiService.js` | Editado - 4 funciones de torneos completadas |
| `frontend/src/services/legalDocumentService.js` | Reescrito - import + validaciones en 9 funciones |
| `frontend/src/services/consentService.js` | Reescrito - import + validaciones en 9 funciones |
| `frontend/src/services/expenseService.js` | Reescrito - import + validaciones en 13 funciones |
| `frontend/src/services/parentChildService.js` | Reescrito - import + validaciones en 9 funciones |
| `frontend/src/services/invitationService.js` | Reescrito - import + validaciones en 8 funciones |

---

## Bug corregido adicional (sesión anterior)

En `apiService.js`, la función `updateDiscountClubTeam` tenía un parámetro nombrado incorrectamente como `chargeId` cuando en realidad era un `discountId`. Se corrigió el nombre del parámetro al agregar la validación.
