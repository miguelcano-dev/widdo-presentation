# Test de Login - Debug del Problema

## 🧪 Pruebas para Identificar el Problema

### Test 1: Limpiar Cache del Navegador

**Pasos**:
1. Abrir el navegador en el sitio de Widdo
2. Abrir DevTools (F12)
3. Tab "Application" → "Storage" → "Clear site data"
4. O hacer: Ctrl+Shift+Delete → Borrar todo
5. Intentar login de nuevo con `javi@mail.com`

**¿Por qué?**: Posible cache corrupto o localStorage antiguo

---

### Test 2: Modo Incógnito

**Pasos**:
1. Abrir ventana incógnita (Ctrl+Shift+N o Cmd+Shift+N)
2. Ir a tu sitio (http://localhost:5173 o tu URL)
3. Login con `javi@mail.com`

**¿Funciona en incógnito?**
- ✅ SÍ → El problema es cache/localStorage
- ❌ NO → El problema está en el código

---

### Test 3: Ver Consola y Network

**Pasos**:
1. Abrir DevTools (F12)
2. Tab "Console" - ¿Hay errores?
3. Tab "Network":
   - Hacer login
   - Buscar la petición `/api/login` o `/login`
   - Click derecho → Copy → Copy Response
   - Pegar aquí

**Respuesta del login (JSON)**:
```json
[PEGAR AQUÍ]
```

---

### Test 4: Ver localStorage después del login

**Pasos**:
1. Hacer login con `javi@mail.com`
2. En DevTools → Tab "Application" → "Local Storage"
3. Ver qué hay almacenado

**Valores a revisar**:
- `user` - ¿Qué dice?
- `showPreClubOnboarding` - ¿Existe? ¿Valor?
- Cualquier otro con "onboarding"

---

### Test 5: Verificar Redirección

**Pasos**:
1. Abrir DevTools (F12) → Tab "Network"
2. Login con `javi@mail.com`
3. **OBSERVAR A DÓNDE REDIRIGE**:
   - ¿Va directo a `/onboarding`?
   - ¿Pasa por `/home/context-selector`?
   - ¿Muestra algo y luego redirige?

**Ruta de redirección observada**:
```
/login → ??? → /onboarding
```

---

### Test 6: Test con usuario diferente

**Usuarios de prueba**:
- `juan.multiple@test.co` (password: password123) - 4 contextos
- `padre.ejemplo@test.co` (password: password123) - 2 contextos
- `pep@em.com` (su password) - 2 contextos

**¿El problema afecta a todos o solo a javi@mail.com?**

---

## 📋 Información para Debug

### Backend Status
- ✅ Base de datos: Onboarding completado para javi@mail.com
- ✅ API `/api/user`: Retorna datos correctos
- ✅ Contextos: 2 contextos con onboarding_completed = true
- ✅ Docker: Corriendo sin errores

### Frontend Status  
- ⚠️  Archivos modificados recientemente (última noche):
  - `AuthContext.jsx` (00:46)
  - `LoginPage.jsx` (00:33)
  - `axiosInstance.js` (00:31)

### Posibles Causas
1. **Cache corrupto del navegador**
2. **localStorage con datos antiguos**
3. **Cambio en AuthContext.jsx de anoche**
4. **Cambio en LoginPage.jsx de anoche**
5. **Frontend no rebuildeado después de cambios**

---

## 🎯 Solución Rápida para Probar

### Opción A: Limpiar Todo
```bash
# 1. Limpiar cache del navegador (manual)
# 2. Limpiar localStorage del navegador (manual)
# 3. Rebuild del frontend
cd /Users/miguelcano/Desktop/todo/Widdo/desarrollo/frontend
rm -rf node_modules/.vite
npm run build
```

### Opción B: Deshabilitar temporalmente el OnboardingGuard
En `OnboardingGuard.jsx` línea 49-60, comentar temporalmente:
```javascript
// COMENTAR TEMPORALMENTE PARA DEBUG
/*
if (requireCompleted) {
  if (activeContextRequiresOnboarding && !isOnboardingPage) {
    navigate('/onboarding', { replace: true });
    return;
  }
  if (!activeContext && anyContextRequiresOnboarding && !isOnboardingPage) {
    navigate('/onboarding', { replace: true });
    return;
  }
}
*/
```

---

## ❓ Preguntas para el Usuario

1. **¿Cuándo hiciste el último `npm run build` o `npm run dev` en `/frontend`?**

2. **¿Funcionaba bien ANTES de reiniciar Docker?**

3. **¿Has probado en modo incógnito?**

4. **¿El problema afecta solo a javi@mail.com o a todos los usuarios?**

5. **¿Qué ves exactamente? ¿Mensaje de error? ¿Pantalla en blanco?**

6. **¿Los archivos `AuthContext.jsx`, `LoginPage.jsx` y `axiosInstance.js` fueron modificados por ti anoche?**
