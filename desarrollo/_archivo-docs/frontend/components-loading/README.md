<!-- ARCHIVADO 13-ago-2026 — 959 lineas entre README.md e INTEGRATION.md para 6 componentes, con solapamiento fuerte entre ambos y referencias a un LoadingDemo.jsx que NO EXISTE (solo se nombra en INTEGRATION.md). Fusionados en un README corto en frontend/src/components/loading/README.md. Ademas frontend/CLAUDE.md solo admite README.md como .md del repo: INTEGRATION.md no deberia existir. Se conserva por si hace falta un ejemplo concreto. -->

# Sistema de Loading States Unificado

Sistema completo y consistente para manejar estados de carga en el frontend de Widdo.

## Componentes Disponibles

### 1. LoadingSpinner

Spinner principal con múltiples variantes.

**Props:**

- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `variant`: 'inline' | 'centered' | 'fullscreen' | 'overlay' (default: 'centered')
- `message`: string (default: 'Cargando...')
- `subMessage`: string (opcional)
- `showMessage`: boolean (default: true)
- `className`: string (clases adicionales)

**Ejemplos de uso:**

```jsx
import { LoadingSpinner } from '@/components/loading';

// Loading inline (botones, componentes pequeños)
<button disabled={isLoading}>
  {isLoading ? (
    <LoadingSpinner variant="inline" size="sm" showMessage={false} />
  ) : (
    'Guardar'
  )}
</button>;

// Loading centrado (páginas completas)
if (isLoading) {
  return (
    <LoadingSpinner
      variant="centered"
      size="lg"
      message="Cargando jugadores..."
    />
  );
}

// Loading fullscreen (navegación)
<LoadingSpinner
  variant="fullscreen"
  size="xl"
  message="Cargando dashboard..."
  subMessage="Esto puede tomar unos segundos"
/>;

// Loading overlay (modales, operaciones)
{
  isSaving && (
    <LoadingSpinner
      variant="overlay"
      size="lg"
      message="Guardando cambios..."
    />
  );
}
```

### 2. DataTableSkeleton

Skeleton específico para tablas de datos.

**Props:**

- `rows`: number (default: 5)
- `columns`: number (default: 4)
- `showHeader`: boolean (default: true)
- `showActions`: boolean (default: true)

**Ejemplo:**

```jsx
import { DataTableSkeleton } from '@/components/loading';

function PlayersTable() {
  const { data, isLoading } = useQuery('players', fetchPlayers);

  if (isLoading) {
    return <DataTableSkeleton rows={10} columns={5} />;
  }

  return <DataTable data={data} />;
}
```

### 3. CardSkeleton

Skeleton para tarjetas/cards (stats, player cards, etc).

**Props:**

- `count`: number (default: 3)
- `layout`: 'horizontal' | 'vertical' | 'grid' (default: 'grid')

**Ejemplo:**

```jsx
import { CardSkeleton } from '@/components/loading';

function DashboardStats() {
  const { stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <CardSkeleton count={4} layout="grid" />;
  }

  return <StatsCards data={stats} />;
}
```

### 4. FormSkeleton

Skeleton para formularios.

**Props:**

- `fields`: number (default: 5)
- `showTitle`: boolean (default: true)
- `showButtons`: boolean (default: true)

**Ejemplo:**

```jsx
import { FormSkeleton } from '@/components/loading';

function PlayerForm({ playerId }) {
  const { player, isLoading } = usePlayer(playerId);

  if (isLoading) {
    return <FormSkeleton fields={8} />;
  }

  return <Form data={player} />;
}
```

### 5. SuspenseLoader

Loader avanzado para React.Suspense con variantes específicas.

**Props:**

- `variant`: 'default' | 'auth' | 'skeleton' | 'minimal'
- `message`: string
- `showMessage`: boolean
- `fullScreen`: boolean

**Ejemplo:**

```jsx
import { Suspense } from 'react';
import { SuspenseLoader } from '@/components/loading';

<Suspense fallback={<SuspenseLoader variant="auth" />}>
  <LoginPage />
</Suspense>;
```

## Context y Hook

### LoadingContext

Context global para manejar loading states en toda la aplicación.

**Setup en App.jsx:**

```jsx
import { LoadingProvider } from '@/context/LoadingProvider';

function App() {
  return (
    <LoadingProvider>
      <YourApp />
    </LoadingProvider>
  );
}
```

### useLoading Hook

Hook para acceder al sistema de loading states.

**API:**

- `isLoading`: boolean - Estado de loading actual
- `globalLoading`: boolean - Si hay algún loading activo
- `message`: string - Mensaje del loading actual
- `startLoading(message?)`: void - Iniciar loading
- `stopLoading()`: void - Detener loading
- `stopAllLoading()`: void - Detener todos los loadings

**Ejemplo básico:**

```jsx
import { useLoading } from '@/hooks/useLoading';

function PlayerForm() {
  const { isLoading, startLoading, stopLoading } = useLoading();

  const handleSubmit = async (data) => {
    startLoading('Guardando jugador...');
    try {
      await savePlayer(data);
      toast.success('Jugador guardado');
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      stopLoading();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={isLoading}>
        {isLoading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}
```

**Ejemplo con loading keys (múltiples loadings):**

```jsx
import { useLoading } from '@/hooks/useLoading';

function PlayersPage() {
  const { isLoadingWithKey, startLoadingWithKey, stopLoadingWithKey } =
    useLoading();

  const handleDelete = async (id) => {
    startLoadingWithKey('delete', 'Eliminando jugador...');
    try {
      await deletePlayer(id);
    } finally {
      stopLoadingWithKey('delete');
    }
  };

  const handleExport = async () => {
    startLoadingWithKey('export', 'Exportando datos...');
    try {
      await exportPlayers();
    } finally {
      stopLoadingWithKey('export');
    }
  };

  return (
    <div>
      <button onClick={handleExport} disabled={isLoadingWithKey('export')}>
        Exportar
      </button>
      {/* tabla con botones de delete */}
    </div>
  );
}
```

### useLoadingState Hook

Hook alternativo que funciona como useState.

**Ejemplo:**

```jsx
import { useLoadingState } from '@/hooks/useLoading';

function UploadDocument() {
  const [isUploading, setUploading] = useLoadingState('upload-doc');

  const handleUpload = async (file) => {
    setUploading(true, 'Subiendo documento...');
    try {
      await uploadFile(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      {isUploading && <LoadingSpinner variant="inline" />}
    </div>
  );
}
```

## Patrones Recomendados

### 1. Páginas con datos remotos

```jsx
import { LoadingSpinner } from '@/components/loading';
import { useLoading } from '@/hooks/useLoading';

function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const { isLoading, startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const fetchData = async () => {
      startLoading('Cargando jugadores...');
      try {
        const data = await fetchPlayers();
        setPlayers(data);
      } finally {
        stopLoading();
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner variant="centered" size="lg" />;
  }

  return <PlayersTable data={players} />;
}
```

### 2. Operaciones CRUD

```jsx
import { useLoading } from '@/hooks/useLoading';
import { LoadingSpinner } from '@/components/loading';

function PlayerForm() {
  const { isLoading, startLoading, stopLoading } = useLoading('player-form');

  const handleSubmit = async (data) => {
    startLoading('Guardando jugador...');
    try {
      await savePlayer(data);
      navigate('/players');
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      stopLoading();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* fields */}
        <button type="submit" disabled={isLoading}>
          {isLoading ? (
            <LoadingSpinner variant="inline" size="sm" showMessage={false} />
          ) : (
            'Guardar'
          )}
        </button>
      </form>

      {isLoading && (
        <LoadingSpinner variant="overlay" message="Guardando jugador..." />
      )}
    </>
  );
}
```

### 3. Tablas con skeleton

```jsx
import { DataTableSkeleton } from '@/components/loading';

function PlayersTable() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers().then((data) => {
      setPlayers(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <DataTableSkeleton rows={10} columns={6} />;
  }

  return <Table data={players} />;
}
```

## Best Practices

1. **Usar skeleton loaders para mejor UX**: Preferir skeletons sobre spinners para contenido que se carga por primera vez.

2. **Mensajes descriptivos**: Siempre proporcionar mensajes claros sobre qué se está cargando.

3. **Loading keys para operaciones paralelas**: Usar keys diferentes para operaciones que pueden ocurrir simultáneamente.

4. **Cleanup en unmount**: El context limpia automáticamente, pero considera llamar `stopLoading` en cleanup si es necesario.

5. **Overlay para operaciones bloqueantes**: Usar variant="overlay" cuando el usuario no debe interactuar durante la operación.

6. **Inline para operaciones pequeñas**: Usar variant="inline" para botones y componentes pequeños.

## Migrando código existente

### Antes:

```jsx
const [loading, setLoading] = useState(false);

// En función async
setLoading(true);
try {
  await fetchData();
} finally {
  setLoading(false);
}
```

### Después:

```jsx
const { isLoading, startLoading, stopLoading } = useLoading();

// En función async
startLoading('Cargando datos...');
try {
  await fetchData();
} finally {
  stopLoading();
}
```

## Troubleshooting

**Error: "useLoading debe usarse dentro de un LoadingProvider"**

- Solución: Asegurar que App.jsx esté envuelto en `<LoadingProvider>`

**El loading no desaparece**

- Verificar que se llama `stopLoading()` en el bloque finally
- Verificar que la key del loading es correcta

**Múltiples spinners superpuestos**

- Usar loading keys diferentes para cada operación
- Considerar usar `globalLoading` para un overlay único
