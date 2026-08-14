# Skill: Mobile UX Patterns

Patrones de UX específicos para la app móvil de Widdo.

## Triggers

Usar cuando el usuario diga:
- "diseñar pantalla móvil"
- "componente móvil"
- "navegación móvil"
- "gestos táctiles"
- "swipe"
- "pull to refresh"
- "bottom sheet"
- "touch target"

---

## Principios Core

### 1. Touch Targets (44px mínimo)

```jsx
// ✅ CORRECTO - Mínimo 44px
<Button className="h-11 min-w-[44px]">
  <Icon className="h-5 w-5" />
</Button>

// ❌ INCORRECTO - Muy pequeño
<Button className="h-8 w-8">
  <Icon className="h-4 w-4" />
</Button>
```

### 2. Font Size (16px en inputs)

```jsx
// ✅ CORRECTO - Evita zoom en iOS
<Input className="text-base" /> // 16px

// ❌ INCORRECTO - Causa zoom
<Input className="text-sm" /> // 14px
```

### 3. Safe Areas

```jsx
// ✅ CORRECTO - Respeta notch y home indicator
<div className="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
  {children}
</div>

// Bottom nav
<nav className="fixed bottom-0 pb-[env(safe-area-inset-bottom)]">
```

---

## Componentes Móviles

### Bottom Navigation

```jsx
// Máximo 5 items
const BottomNav = () => {
  const { navItems } = useMobileNavigation();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 gap-1',
                'text-muted transition-colors',
                isActive && 'text-primary'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
```

### Swipeable Card (Asistencia)

```jsx
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useHaptics } from '@/hooks/useHaptics';

const SwipeableCard = ({ player, onSwipeLeft, onSwipeRight, onTap }) => {
  const { impactMedium } = useHaptics();
  const x = useMotionValue(0);

  // Colores según dirección
  const backgroundColor = useTransform(
    x,
    [-150, 0, 150],
    ['#fee2e2', '#ffffff', '#dcfce7'] // rojo, blanco, verde
  );

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) {
      impactMedium();
      onSwipeRight?.(); // Presente
    } else if (info.offset.x < -100) {
      impactMedium();
      onSwipeLeft?.(); // Ausente
    }
  };

  return (
    <motion.div
      style={{ x, backgroundColor }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onTap={() => {
        impactMedium();
        onTap?.(); // Tarde
      }}
      className="p-4 rounded-lg border mb-2 touch-pan-x"
    >
      <div className="flex items-center gap-3">
        <Avatar player={player} />
        <div>
          <p className="font-medium">{player.full_name}</p>
          <p className="text-sm text-muted">{player.category}</p>
        </div>
      </div>
    </motion.div>
  );
};
```

### Pull to Refresh

```jsx
import { useRef, useState } from 'react';

const PullToRefresh = ({ onRefresh, children }) => {
  const containerRef = useRef(null);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);

  const handleTouchStart = (e) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      setIsPulling(diff > 80);
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setIsPulling(false);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="overflow-y-auto h-full"
    >
      {/* Indicador de refresh */}
      <div className={cn(
        'flex justify-center py-4 transition-opacity',
        isPulling || isRefreshing ? 'opacity-100' : 'opacity-0'
      )}>
        <LoadingSpinner size="sm" />
      </div>

      {children}
    </div>
  );
};
```

### Bottom Sheet

```jsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const BottomSheet = ({ open, onClose, title, children }) => {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[85vh] rounded-t-xl pb-[env(safe-area-inset-bottom)]"
      >
        {/* Handle para arrastrar */}
        <div className="flex justify-center pt-2 pb-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto max-h-[60vh] py-4">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};
```

### Floating Action Button (FAB)

```jsx
const FloatingActionButton = ({ icon: Icon, onClick, label }) => {
  const { impactLight } = useHaptics();

  return (
    <button
      onClick={() => {
        impactLight();
        onClick?.();
      }}
      className={cn(
        'fixed bottom-20 right-4 z-40', // Sobre bottom nav
        'h-14 w-14 rounded-full',
        'bg-primary text-white shadow-lg',
        'flex items-center justify-center',
        'active:scale-95 transition-transform',
        'pb-[env(safe-area-inset-bottom)]'
      )}
      aria-label={label}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
};
```

### Card con Acciones

```jsx
const ActionCard = ({ title, subtitle, actions, onPress }) => {
  return (
    <button
      onClick={onPress}
      className={cn(
        'w-full p-4 bg-white rounded-lg border',
        'text-left active:bg-gray-50',
        'transition-colors'
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted" />
      </div>

      {actions && (
        <div className="flex gap-2 mt-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              size="sm"
              variant={action.variant || 'outline'}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </button>
  );
};
```

---

## Patrones de Navegación

### Header Móvil

```jsx
const MobileHeader = ({ title, showBack, onBack, actions }) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b pt-[env(safe-area-inset-top)]">
      <div className="flex items-center h-14 px-4">
        {/* Back button */}
        {showBack && (
          <button
            onClick={onBack}
            className="h-11 w-11 -ml-2 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        {/* Title */}
        <h1 className="flex-1 text-lg font-semibold truncate">
          {title}
        </h1>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {actions?.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="h-11 w-11 flex items-center justify-center"
              aria-label={action.label}
            >
              <action.icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
```

### Tabs Horizontales

```jsx
const HorizontalTabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex overflow-x-auto hide-scrollbar border-b">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-4 py-3 whitespace-nowrap text-sm font-medium',
            'border-b-2 transition-colors',
            activeTab === tab.value
              ? 'border-primary text-primary'
              : 'border-transparent text-muted'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
```

### Selector de Hijo (Parent)

```jsx
const ChildSwitcher = ({ children, activeChild, onSwitch }) => {
  if (children.length === 1) {
    return (
      <div className="flex items-center gap-2 p-2">
        <Avatar player={children[0]} size="sm" />
        <span className="font-medium">{children[0].full_name}</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar p-2">
      {children.map((child) => (
        <button
          key={child.id}
          onClick={() => onSwitch(child)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-full',
            'border transition-colors whitespace-nowrap',
            activeChild?.id === child.id
              ? 'bg-primary text-white border-primary'
              : 'bg-white border-gray-200'
          )}
        >
          <Avatar player={child} size="xs" />
          <span className="text-sm">{child.first_name}</span>
        </button>
      ))}
    </div>
  );
};
```

---

## Estados y Feedback

### Loading State (Móvil)

```jsx
const MobileLoading = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingSpinner size="lg" />
      {message && (
        <p className="text-sm text-muted mt-4">{message}</p>
      )}
    </div>
  );
};
```

### Empty State (Móvil)

```jsx
const MobileEmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted" />
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
```

### Error State (Móvil)

```jsx
const MobileErrorState = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="font-semibold mb-2">Error al cargar</h3>
      <p className="text-sm text-muted mb-6">
        {error?.message || 'Algo salió mal'}
      </p>
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Reintentar
      </Button>
    </div>
  );
};
```

### Haptic Feedback

```jsx
// Usar para acciones importantes
const { impactLight, impactMedium, notificationSuccess, notificationError } = useHaptics();

// Tap normal
onClick={() => {
  impactLight();
  handleAction();
}}

// Acción importante
onClick={() => {
  impactMedium();
  handleImportantAction();
}}

// Éxito
onSuccess={() => {
  notificationSuccess();
  toast.success('Guardado');
}}

// Error
onError={() => {
  notificationError();
  toast.error('Error');
}}
```

---

## Formularios Móviles

### Formulario Adaptado

```jsx
const MobileForm = ({ children, onSubmit }) => {
  const { isKeyboardOpen, keyboardHeight } = useKeyboard();

  return (
    <form
      onSubmit={onSubmit}
      className="p-4 space-y-4"
      style={{
        paddingBottom: isKeyboardOpen ? keyboardHeight + 80 : 80 // Espacio para bottom nav
      }}
    >
      {children}

      {/* Botón fijo en el fondo */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-white border-t pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <Button type="submit" className="w-full h-12">
          Guardar
        </Button>
      </div>
    </form>
  );
};
```

### Input con Icono

```jsx
const MobileInput = ({ icon: Icon, label, ...props }) => {
  return (
    <div className="space-y-2">
      {label && <Label className="text-sm">{label}</Label>}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
        )}
        <Input
          {...props}
          className={cn(
            'h-12 text-base', // 48px height, 16px font
            Icon && 'pl-11'
          )}
        />
      </div>
    </div>
  );
};
```

---

## Checklist UX Móvil

### Antes de crear un componente móvil:

- [ ] Touch targets >= 44px
- [ ] Font size >= 16px en inputs
- [ ] Safe areas respetadas
- [ ] Haptic feedback en acciones
- [ ] Loading state claro
- [ ] Empty state informativo
- [ ] Error state con retry
- [ ] Funciona con teclado abierto
- [ ] Probado en iOS y Android
- [ ] Dark mode soportado

### Gestos a considerar:

- [ ] Swipe left/right (acciones rápidas)
- [ ] Pull down (refresh)
- [ ] Long press (menú contextual)
- [ ] Pinch (zoom en imágenes)
- [ ] Pan (arrastrar elementos)
