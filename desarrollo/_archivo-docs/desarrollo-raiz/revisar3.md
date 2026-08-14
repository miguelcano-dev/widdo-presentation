# Sesion de Revision 3 - 10 Feb 2026

## Problema Reportado

En `/home/categories`, al hacer click en el boton "Añadir Jugador" de una categoria, se abre un modal que dice **"No tiene Jugadores creados vinculados al Club/Equipo"**, a pesar de que hay muchos jugadores en el club (las tarjetas de categorias muestran 15, 20, 8, 11, 6 jugadores).

## Investigacion

### Archivos Involucrados

| Archivo | Proposito |
|---------|-----------|
| `frontend/src/components/datatable/TrainerPlayerAddDialog.jsx` | Modal que muestra jugadores para añadir a categoria |
| `frontend/src/hooks/players/usePlayerData.js` | Hook que llama a la API para obtener jugadores |
| `frontend/src/services/apiService.js` (linea 257-268) | Funcion `fetchPlayersClubTeams` que hace GET a la API |
| `saas_sport/app/Http/Controllers/PlaClubTeamPlayerController.php` (linea 41-130) | Endpoint `index` del backend |
| `saas_sport/app/Models/User.php` (linea 632-651) | Scope `eligibleForCategory` |

### Flujo del Bug

```
1. Usuario hace click en icono "Añadir Jugador" en tarjeta de categoria
   ↓
2. Se abre TrainerPlayerAddDialog.jsx
   ↓
3. Linea 29: usePlayerData(selectedClub.id, categoryData?.id)
   - Pasa el ID de la categoria al hook
   ↓
4. usePlayerData llama a fetchPlayersClubTeams(clubId, categoryId)
   ↓
5. fetchPlayersClubTeams envia: GET /api/pla_club_teams/{clubId}/players?categorySection={categoryId}
   ↓
6. Backend (PlaClubTeamPlayerController.php linea 106-113):
   if ($categoryId) {
       $category = PlaClubTeamCategory::find($categoryId);
       if ($category) {
           $playersQuery->whereHas('user', function ($query) use ($category) {
               $query->eligibleForCategory($category);
           });
       }
   }
   ↓
7. Scope eligibleForCategory (User.php linea 632-651):
   - Filtra jugadores por AÑO DE NACIMIENTO que coincida con el rango de la categoria
   - Ej: Si categoria es Sub 14 (2012-2013), solo devuelve jugadores nacidos en 2012-2013
   ↓
8. Si ningun jugador tiene fecha de nacimiento en ese rango (o no tiene fecha registrada)
   → API devuelve 0 jugadores
   ↓
9. TrainerPlayerAddDialog.jsx linea 100: availableItems.length === 0
   → Muestra: "No tiene Jugadores creados vinculados al Club/Equipo"
```

### Scope eligibleForCategory (User.php)

```php
public function scopeEligibleForCategory(Builder $query, $category)
{
    return $query->where(function ($query) use ($category) {
        $birthYearColumn = 'date_of_birth';

        if (!is_null($category->end_year)) {
            $query->whereYear($birthYearColumn, '>=', $category->start_year)
                ->whereYear($birthYearColumn, '<=', $category->end_year);
        } else {
            $query->whereYear($birthYearColumn, '>=', $category->start_year);
        }

        if ($category->allow_younger_than_year && !is_null($category->start_year)) {
            $query->orWhere(function ($query) use ($category, $birthYearColumn) {
                $query->whereYear($birthYearColumn, '>=', $category->start_year);
            });
        }
    });
}
```

## Solucion Aplicada

**Archivo:** `frontend/src/components/datatable/TrainerPlayerAddDialog.jsx` (linea 29)

**Antes:**
```javascript
const playerData = usePlayerData(selectedClub.id, categoryData?.id);
```

**Despues:**
```javascript
const playerData = usePlayerData(selectedClub.id);
```

### Que hace el cambio

- Al no pasar `categoryData?.id`, la API no incluye el parametro `categorySection`
- El backend devuelve **TODOS los jugadores del club** sin filtrar por año de nacimiento
- El modal muestra todos los jugadores disponibles
- Los jugadores ya asignados a la categoria aparecen pre-seleccionados (`isAssociated`)
- El usuario puede elegir libremente cuales jugadores añadir a la categoria

### Por que es correcto

1. El proposito del modal es **seleccionar jugadores para añadir** a una categoria
2. El filtro `eligibleForCategory` es util para la **pagina de listado de jugadores** (filtrar por categoria)
3. Pero para **añadir jugadores a una categoria**, el usuario debe ver todos los jugadores disponibles
4. La logica de `isAssociated` ya maneja marcar cuales estan asignados

## Estado

- [x] Bug identificado
- [x] Fix aplicado (1 linea)
- [ ] Commit
- [ ] Push
