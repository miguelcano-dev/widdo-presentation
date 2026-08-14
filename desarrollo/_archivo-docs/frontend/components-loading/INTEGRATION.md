<!-- ARCHIVADO 13-ago-2026 — 959 lineas entre README.md e INTEGRATION.md para 6 componentes, con solapamiento fuerte entre ambos y referencias a un LoadingDemo.jsx que NO EXISTE (solo se nombra en INTEGRATION.md). Fusionados en un README corto en frontend/src/components/loading/README.md. Ademas frontend/CLAUDE.md solo admite README.md como .md del repo: INTEGRATION.md no deberia existir. Se conserva por si hace falta un ejemplo concreto. -->

# Guía de Integración - Sistema de Loading Unificado

Esta guía explica cómo integrar el sistema de loading unificado en la aplicación Widdo.

## Paso 1: Configurar LoadingProvider en App.jsx

Envolver la aplicación con el `LoadingProvider` para habilitar el sistema global.

```jsx
// src/App.jsx
import { LoadingProvider } from '@/context/LoadingProvider';
import { GlobalLoadingOverlay } from '@/components/loading';

function App() {
  return (
    <LoadingProvider>
      {/* Overlay global automático (opcional) */}
      <GlobalLoadingOverlay />

      {/* Resto de providers */}
      <AuthProvider>
        <ClubProvider>
          <Router>{/* Rutas */}</Router>
        </ClubProvider>
      </AuthProvider>
    </LoadingProvider>
  );
}

export default App;
```

## Paso 2: Migrar código existente

### Antes (useState local):

```jsx
import { useState } from 'react';

function PlayersPage() {
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState([]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const data = await playerService.getAll();
      setPlayers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return <PlayersTable data={players} />;
}
```

### Después (useLoading hook):

```jsx
import { useLoading } from '@/hooks/useLoading';
import { LoadingSpinner, DataTableSkeleton } from '@/components/loading';

function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const { isLoading, startLoading, stopLoading } = useLoading('players-page');

  const fetchPlayers = async () => {
    startLoading('Cargando jugadores...');
    try {
      const data = await playerService.getAll();
      setPlayers(data);
    } catch (error) {
      toast.error('Error al cargar jugadores');
    } finally {
      stopLoading();
    }
  };

  if (isLoading) {
    return <DataTableSkeleton rows={10} columns={6} />;
  }

  return <PlayersTable data={players} />;
}
```

## Paso 3: Reemplazar LoadingDefaultPage

### Antes:

```jsx
import LoadingDefaultPage from '@/pages/LoadingDefaultPage';

function SomePage() {
  if (loading) {
    return <LoadingDefaultPage message="Cargando..." />;
  }
  return <Content />;
}
```

### Después (Opción 1 - LoadingSpinner):

```jsx
import { LoadingSpinner } from '@/components/loading';

function SomePage() {
  if (loading) {
    return (
      <LoadingSpinner
        variant="fullscreen"
        size="xl"
        message="Cargando página..."
      />
    );
  }
  return <Content />;
}
```

### Después (Opción 2 - useLoading con GlobalLoadingOverlay):

```jsx
import { useLoading } from '@/hooks/useLoading';

function SomePage() {
  const { isLoading, startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const loadData = async () => {
      startLoading('Cargando página...');
      try {
        await fetchData();
      } finally {
        stopLoading();
      }
    };
    loadData();
  }, []);

  // No need for loading check - GlobalLoadingOverlay handles it
  return <Content />;
}
```

## Paso 4: Actualizar formularios

### Antes:

```jsx
function PlayerForm() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      await savePlayer(data);
      navigate('/players');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button disabled={submitting}>
        {submitting ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}
```

### Después:

```jsx
import { useLoading } from '@/hooks/useLoading';
import { LoadingSpinner } from '@/components/loading';

function PlayerForm() {
  const { isLoading, startLoading, stopLoading } = useLoading('player-form');

  const handleSubmit = async (data) => {
    startLoading('Guardando jugador...');
    try {
      await savePlayer(data);
      toast.success('Jugador guardado exitosamente');
      navigate('/players');
    } catch (error) {
      toast.error('Error al guardar jugador');
    } finally {
      stopLoading();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <button disabled={isLoading} type="submit">
          {isLoading ? (
            <LoadingSpinner variant="inline" size="sm" showMessage={false} />
          ) : (
            'Guardar'
          )}
        </button>
      </form>

      {/* Overlay opcional para bloquear UI durante submit */}
      {isLoading && (
        <LoadingSpinner variant="overlay" message="Guardando jugador..." />
      )}
    </>
  );
}
```

## Paso 5: Actualizar tablas con skeleton loaders

### Antes:

```jsx
function PlayersTable() {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetchPlayers().then((data) => {
      setPlayers(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <Table data={players} />;
}
```

### Después:

```jsx
import { DataTableSkeleton } from '@/components/loading';

function PlayersTable() {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetchPlayers().then((data) => {
      setPlayers(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <DataTableSkeleton rows={10} columns={6} showActions />;
  }

  return <Table data={players} />;
}
```

## Paso 6: Actualizar dashboards con card skeletons

### Antes:

```jsx
function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);

  if (loading) {
    return <div>Loading stats...</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <StatsCard key={stat.id} {...stat} />
      ))}
    </div>
  );
}
```

### Después:

```jsx
import { CardSkeleton } from '@/components/loading';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);

  if (loading) {
    return <CardSkeleton count={6} layout="grid" />;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <StatsCard key={stat.id} {...stat} />
      ))}
    </div>
  );
}
```

## Paso 7: Configurar React.Suspense con SuspenseLoader

```jsx
import { Suspense } from 'react';
import { SuspenseLoader } from '@/components/loading';

// Lazy load de componentes
const Dashboard = lazy(() => import('@/pages/dashboard/DashboardPage'));
const Players = lazy(() => import('@/pages/dashboard/Players/PlayersPage'));

function App() {
  return (
    <Suspense fallback={<SuspenseLoader variant="skeleton" fullScreen />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/players" element={<Players />} />
      </Routes>
    </Suspense>
  );
}
```

## Casos de Uso Comunes

### 1. Operación con feedback visual

```jsx
import { useLoading } from '@/hooks/useLoading';
import { LoadingSpinner } from '@/components/loading';

function DeletePlayerButton({ playerId }) {
  const { isLoading, startLoading, stopLoading } = useLoading(
    `delete-${playerId}`
  );

  const handleDelete = async () => {
    if (!confirm('¿Eliminar jugador?')) return;

    startLoading('Eliminando jugador...');
    try {
      await playerService.delete(playerId);
      toast.success('Jugador eliminado');
      refreshPlayers();
    } catch (error) {
      toast.error('Error al eliminar');
    } finally {
      stopLoading();
    }
  };

  return (
    <button onClick={handleDelete} disabled={isLoading}>
      {isLoading ? (
        <LoadingSpinner variant="inline" size="sm" showMessage={false} />
      ) : (
        <TrashIcon />
      )}
    </button>
  );
}
```

### 2. Múltiples operaciones paralelas

```jsx
import { useLoading } from '@/hooks/useLoading';

function PlayersPage() {
  const { isLoadingWithKey, startLoadingWithKey, stopLoadingWithKey } =
    useLoading();

  const handleExport = async () => {
    startLoadingWithKey('export', 'Exportando datos...');
    try {
      await exportPlayers();
    } finally {
      stopLoadingWithKey('export');
    }
  };

  const handleImport = async (file) => {
    startLoadingWithKey('import', 'Importando jugadores...');
    try {
      await importPlayers(file);
    } finally {
      stopLoadingWithKey('import');
    }
  };

  return (
    <div>
      <button onClick={handleExport} disabled={isLoadingWithKey('export')}>
        Exportar
      </button>
      <button onClick={handleImport} disabled={isLoadingWithKey('import')}>
        Importar
      </button>
    </div>
  );
}
```

### 3. Loading en navegación entre páginas

```jsx
// En layout o router
import { useLoading } from '@/hooks/useLoading';
import { useLocation } from 'react-router-dom';

function AppLayout() {
  const { startLoading, stopLoading } = useLoading('navigation');
  const location = useLocation();

  useEffect(() => {
    startLoading('Cargando página...');
    // Simular carga de datos de página
    setTimeout(() => stopLoading(), 500);
  }, [location.pathname]);

  return <Outlet />;
}
```

## Verificación de Integración

Checklist para asegurar que todo está configurado correctamente:

- [ ] LoadingProvider configurado en App.jsx
- [ ] GlobalLoadingOverlay agregado (si se desea overlay automático)
- [ ] useState locales migrados a useLoading
- [ ] LoadingDefaultPage reemplazado con LoadingSpinner
- [ ] Tablas usando DataTableSkeleton
- [ ] Cards/Stats usando CardSkeleton
- [ ] Formularios usando FormSkeleton o LoadingSpinner
- [ ] React.Suspense configurado con SuspenseLoader
- [ ] Mensajes descriptivos en todos los loading states
- [ ] Loading keys únicos para operaciones paralelas

## Testing

Para verificar que el sistema funciona:

1. Importar y usar LoadingDemo en una ruta de desarrollo:

```jsx
import { LoadingDemo } from '@/components/loading';

// Agregar ruta temporal
<Route path="/loading-demo" element={<LoadingDemo />} />;
```

2. Visitar `/loading-demo` para ver todas las variantes en acción

3. Probar en componentes reales:
   - Cargar una página con datos
   - Enviar un formulario
   - Realizar una operación de delete
   - Exportar/importar datos

## Troubleshooting

**Error: "useLoading debe usarse dentro de un LoadingProvider"**

- Verificar que LoadingProvider está en App.jsx
- Verificar orden de providers (LoadingProvider debe envolver componentes que usan useLoading)

**El loading no se muestra**

- Verificar que startLoading() se llama antes de la operación async
- Verificar que stopLoading() está en el bloque finally

**Múltiples overlays superpuestos**

- Usar loading keys diferentes: `useLoading('unique-key')`
- Considerar si realmente necesitas múltiples overlays o usar uno global

**El skeleton no coincide con el contenido real**

- Ajustar props del skeleton (rows, columns, etc.)
- Considerar crear un skeleton personalizado para tu caso específico

## Soporte

Para preguntas o issues:

1. Consultar README.md en /components/loading/
2. Ver ejemplos en LoadingDemo.jsx
3. Revisar código existente que ya usa el sistema
