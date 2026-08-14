# Prompt: Video Hero para Widdo (Instagram Vertical)

## Especificaciones Técnicas
- **Formato:** 1080x1920px (Instagram vertical/Reels/Stories)
- **Duración:** 32.5 segundos
- **FPS:** 30
- **Codec:** H264
- **Framework:** Remotion (React)

## Identidad Visual
- **Color primario:** `#16a34a` (Verde Widdo)
- **Tipografía:** Montserrat (Google Fonts)
- **Fondo:** Gradiente verde oscuro a verde Widdo
  ```css
  background: linear-gradient(165deg, #021a0a 0%, #032d12 30%, #064e23 70%, #0a6b30 100%);
  ```

## Estilo Visual Moderno
- **Glassmorphism:** Tarjetas con `backdrop-filter: blur(20px)`, bordes semi-transparentes `rgba(255,255,255,0.15)`, fondos con gradiente de blanco al 12% a 4%
- **Efectos de glow:** Sombras difusas con el color primario (`box-shadow: 0 0 80px ${COLORS.primary}50`)
- **Anillos decorativos:** Círculos rotativos con bordes sutiles alrededor de elementos centrales
- **Grid de fondo:** Patrón de líneas blancas al 4% de opacidad, 60x60px
- **Partículas flotantes:** Puntos de luz que orbitan o fluyen hacia elementos centrales
- **Gradiente inferior:** Fade sutil hacia el fondo en la parte inferior de cada escena

## Animaciones
- **Spring animations:** `damping: 12-15`, `stiffness: 60-80` para entradas suaves
- **Interpolate:** Para rotaciones continuas y efectos de pulso
- **Floating effect:** `Math.sin(frame * 0.03) * 5` para elementos que flotan
- **Transiciones:** Fade de 15 frames entre escenas

---

## Estructura de Escenas

### Escena 1: El Caos (5 segundos)
**Mensaje:** "¿Gestionas tu Club con esto?"

6 tarjetas flotantes representando el caos actual:
- Excel (verde) - icono Table
- WhatsApp (verde WhatsApp) - icono MessageCircle
- Papel (naranja) - icono FileText
- Llamadas (azul) - icono Phone
- Cobros (rojo) - icono AlertCircle
- Agenda (púrpura) - icono Calendar

Las tarjetas flotan con rotación y wobble aleatorio. Un signo de interrogación gigante con glow pulsa en el centro. Badge inferior: "Hay una mejor forma"

---

### Escena 2: La Transformación (5 segundos)
**Mensaje:** "WIDDO - Tu Club sin Excel ni WhatsApp"

- Logo Widdo grande (220px) en círculo con gradiente verde
- Anillos rotativos concéntricos alrededor del logo
- 8 partículas de luz orbitando
- Texto "WIDDO" en 110px, peso 900
- Tagline con líneas decorativas y ícono Sparkles
- Efecto de pulso en el logo

---

### Escena 3: Dashboard (5.5 segundos)
**Mensaje:** "Una plataforma - Control Total"

6 tarjetas de estadísticas con glassmorphism:
- **Grandes (2):** Jugadores activos: 127, Cobros del mes: $4.2M
- **Pequeñas (4):** Eventos: 12, Asistencia: 94%, Notificaciones: 1.2K, Entrenos: 48

Cada tarjeta tiene ícono con fondo de su color, efecto de flotación individual. Badge inferior: "Todo en tiempo real"

---

### Escena 4: Módulos (5 segundos)
**Mensaje:** "Todo lo que necesitas - Módulos"

Grid 2x4 con 8 módulos:
1. Jugadores (verde) - Users
2. Pagos (azul) - CreditCard
3. Calendario (naranja) - Calendar
4. Alertas (púrpura) - Bell
5. Asistencia (cyan) - ClipboardCheck
6. Reportes (rosa) - BarChart3
7. Chat (esmeralda) - MessageSquare
8. Roles (ámbar) - Shield

Ícono Zap en el título. Badge inferior: "Y mucho más en una sola app"

---

### Escena 5: Beneficiarios (5 segundos)
**Mensaje:** "Todos conectados - Un Ecosistema"

4 tarjetas en las esquinas con emojis:
- 👔 Dueños (naranja) - esquina superior izquierda
- 🏃 Entrenadores (azul) - esquina superior derecha
- 👨‍👩‍👧 Padres (púrpura) - esquina inferior izquierda
- ⚽ Jugadores (verde) - esquina inferior derecha

**Animación de flujo:** Partículas de colores viajan desde cada esquina hacia el logo Widdo central. 5 partículas por beneficiario con delays escalonados, ciclo de 2 segundos.

Logo central con anillos rotativos. Flechas apuntando hacia el centro. Badge inferior: "Para tu Club"

---

### Escena 6: Loop/CTA (7 segundos)
**Mensaje:** "Somos WIDDO - Transformamos el MUNDO por medio del DEPORTE"

- Logo grande con efecto de pulso
- Badge: "Plataforma #1 para Clubes" con ícono Sparkles
- 6 estrellas rotando alrededor del contenido
- Anillos decorativos rotativos

**Call to Action:**
- Instagram: @heywiddo (tarjeta rosa con gradiente Instagram)
- Web: www.widdo.co (tarjeta verde Widdo)

---

## Código de Colores por Módulo
```javascript
const COLORS = {
  primary: "#16a34a",      // Verde Widdo
  excel: "#16a34a",
  whatsapp: "#25D366",
  paper: "#f97316",
  calls: "#3b82f6",
  billing: "#ef4444",
  agenda: "#8b5cf6",
  payments: "#3b82f6",
  calendar: "#f97316",
  alerts: "#8b5cf6",
  attendance: "#06b6d4",
  reports: "#ec4899",
  chat: "#10b981",
  roles: "#f59e0b",
  instagram: "#E1306C"
};
```

---

## Comandos de Renderizado

```bash
# Instagram Vertical (1080x1920)
npx remotion render HeroVideoInstagram out/widdo-hero-instagram.mp4 --codec h264

# Horizontal (1920x1080)
npx remotion render HeroVideo out/widdo-hero.mp4 --codec h264

# Preview en navegador
npx remotion studio
```
