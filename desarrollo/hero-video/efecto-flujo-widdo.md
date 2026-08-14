# Efecto: Flujo de Elementos hacia Widdo

## Concepto
Animación donde múltiples elementos (partículas, íconos, tarjetas) viajan desde diferentes puntos de la pantalla hacia el logo central de Widdo, creando un efecto de "todo converge en Widdo".

## Especificaciones Técnicas

### Dimensiones (Instagram Vertical 1080x1920)
- **Centro destino:** x=540, y=960 (centro de la pantalla)
- **Puntos de origen:** Las 4 esquinas u otras posiciones distribuidas

### Posiciones de Origen (en píxeles)
```javascript
const particleStarts = [
  { x: 238, y: 422 },   // Esquina superior izquierda
  { x: 842, y: 480 },   // Esquina superior derecha
  { x: 216, y: 1382 },  // Esquina inferior izquierda
  { x: 864, y: 1440 },  // Esquina inferior derecha
];
```

### Posiciones de Tarjetas (en porcentaje)
```javascript
const nodePositions = [
  { x: 22, y: 22 },  // Superior izquierda
  { x: 78, y: 25 },  // Superior derecha
  { x: 20, y: 72 },  // Inferior izquierda
  { x: 80, y: 75 },  // Inferior derecha
];
```

---

## Componente: FlowingParticle

```tsx
const FlowingParticle: React.FC<{
  startX: number;      // Posición X inicial (píxeles)
  startY: number;      // Posición Y inicial (píxeles)
  delay: number;       // Delay en segundos antes de aparecer
  color: string;       // Color de la partícula
}> = ({ startX, startY, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Duración de un ciclo completo (ida al centro)
  const cycleDuration = fps * 2; // 2 segundos por ciclo

  // Frame actual dentro del ciclo (loop infinito)
  const cycleFrame = (frame - delay * fps) % cycleDuration;

  // Progreso de 0 a 1 durante el ciclo
  const progress = interpolate(
    cycleFrame,
    [0, cycleDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Fade in al inicio, fade out al final
  const opacity = interpolate(
    progress,
    [0, 0.1, 0.9, 1],
    [0, 1, 1, 0]
  );

  // Interpolación lineal desde origen hacia centro (540, 960)
  const x = startX + (540 - startX) * progress;
  const y = startY + (960 - startY) * progress;

  // No renderizar antes del delay
  if (frame < delay * fps) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 20px ${color}, 0 0 40px ${color}80`,
        opacity,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
};
```

---

## Uso: Múltiples Partículas por Origen

```tsx
const BENEFICIARIES = [
  { emoji: "👔", title: "Dueños", color: "#f97316" },
  { emoji: "🏃", title: "Entrenadores", color: "#3b82f6" },
  { emoji: "👨‍👩‍👧", title: "Padres", color: "#8b5cf6" },
  { emoji: "⚽", title: "Jugadores", color: "#10b981" },
];

// Generar 5 partículas por cada origen con delays escalonados
{BENEFICIARIES.map((b, i) => (
  [...Array(5)].map((_, j) => (
    <FlowingParticle
      key={`${i}-${j}`}
      startX={particleStarts[i].x}
      startY={particleStarts[i].y}
      delay={0.3 + i * 0.15 + j * 0.4}  // Delays escalonados
      color={b.color}
    />
  ))
))}
```

---

## Variaciones del Efecto

### 1. Partículas con Curva (Bezier)
```tsx
// En lugar de interpolación lineal, usar curva
const curveOffset = Math.sin(progress * Math.PI) * 100;
const x = startX + (540 - startX) * progress + curveOffset * (i % 2 ? 1 : -1);
```

### 2. Partículas con Tamaño Variable
```tsx
const size = interpolate(progress, [0, 0.5, 1], [6, 14, 8]);
```

### 3. Efecto de Estela (Trail)
```tsx
// Renderizar múltiples círculos con opacidad decreciente
{[0, 0.05, 0.1, 0.15].map((offset, idx) => {
  const trailProgress = Math.max(0, progress - offset);
  const trailX = startX + (540 - startX) * trailProgress;
  const trailY = startY + (960 - startY) * trailProgress;
  return (
    <div
      key={idx}
      style={{
        position: "absolute",
        left: trailX,
        top: trailY,
        width: 12 - idx * 2,
        height: 12 - idx * 2,
        borderRadius: "50%",
        background: color,
        opacity: opacity * (1 - idx * 0.25),
      }}
    />
  );
})}
```

### 4. Íconos en lugar de Partículas
```tsx
// Usar íconos de Lucide que viajan hacia el centro
<Users
  size={24}
  color={color}
  style={{
    position: "absolute",
    left: x,
    top: y,
    opacity,
    transform: `translate(-50%, -50%) rotate(${progress * 360}deg)`,
  }}
/>
```

### 5. Líneas de Conexión
```tsx
// SVG con líneas desde cada esquina al centro
<svg style={{ position: "absolute", inset: 0 }}>
  {nodePositions.map((pos, i) => {
    const startX = (pos.x / 100) * 1080;
    const startY = (pos.y / 100) * 1920;
    return (
      <line
        key={i}
        x1={startX}
        y1={startY}
        x2={540}
        y2={960}
        stroke={BENEFICIARIES[i].color}
        strokeWidth={2}
        strokeDasharray="10,10"
        strokeDashoffset={-frame * 2}
        opacity={0.3}
      />
    );
  })}
</svg>
```

---

## Elemento Central: Logo Widdo

```tsx
<div
  style={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%) scale(${logoEntry})`,
    opacity: logoEntry,
    zIndex: 10,
  }}
>
  <div
    style={{
      width: 180,
      height: 180,
      borderRadius: "50%",
      background: `linear-gradient(145deg, ${COLORS.primary} 0%, #0f9d4a 50%, #0d7a3a 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `
        0 30px 80px ${COLORS.primary}60,
        0 0 120px ${COLORS.primary}40,
        inset 0 -4px 15px rgba(0,0,0,0.3),
        inset 0 4px 15px rgba(255,255,255,0.2)
      `,
    }}
  >
    <Img
      src={staticFile("widdo-logo.svg")}
      style={{ width: 100, height: 100 }}
    />
  </div>
</div>
```

---

## Anillos Rotativos (Complemento Visual)

```tsx
// Anillo exterior
<div
  style={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    width: 400,
    height: 400,
    borderRadius: "50%",
    border: `2px solid ${COLORS.primary}30`,
  }}
/>

// Anillo interior (rotación inversa)
<div
  style={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%) rotate(${-rotation * 0.6}deg)`,
    width: 320,
    height: 320,
    borderRadius: "50%",
    border: `1px solid ${COLORS.primary}20`,
  }}
/>
```

---

## Casos de Uso

1. **Ecosistema:** Mostrar cómo diferentes actores (dueños, entrenadores, padres, jugadores) convergen en la plataforma
2. **Integraciones:** Mostrar diferentes herramientas/apps que se conectan a Widdo
3. **Datos:** Visualizar flujo de información hacia un dashboard central
4. **Comunidad:** Mostrar usuarios/clubes conectándose a la red Widdo
