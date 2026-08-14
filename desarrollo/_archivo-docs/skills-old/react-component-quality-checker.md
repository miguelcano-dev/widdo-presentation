# React Component Quality Checker

## Descripcion
Verifica la calidad y consistencia de los componentes React: manejo de estados loading/error, uso correcto de hooks, accesibilidad, y buenas practicas.

## Cuando Usar
- Code reviews de componentes nuevos
- Refactoring de componentes existentes
- Auditorias de calidad de codigo
- Antes de releases

---

## Stack Frontend de Widdo

```
React 18.2.0
Vite 5.4.21
Tailwind CSS 3.4.1
Radix UI (componentes base)
React Hook Form 7.51.2
Zod 3.22.4
TanStack React Query 5.35.5
React Router 6.22.3
Axios 1.6.8
```

---

## Checklist por Componente

### 1. Manejo de Estados

```jsx
// MALO - sin estados de loading/error
const PlayersList = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    playerService.getAll().then(setPlayers);
  }, []);

  return <List data={players} />;
};

// BUENO - con loading, error, empty
const PlayersList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['players'],
    queryFn: playerService.getAll
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.length) return <EmptyState message="No hay jugadores" />;

  return <List data={data} />;
};
```

**Verificar:**
```
[ ] Componente muestra loading mientras carga
[ ] Componente muestra error si falla
[ ] Componente muestra estado vacio si no hay datos
[ ] Loading no bloquea toda la UI (skeleton preferido)
```

### 2. React Query Best Practices

```jsx
// BUENO - configuracion correcta
const { data } = useQuery({
  queryKey: ['players', clubId, filters],  // Key incluye dependencias
  queryFn: () => playerService.getByClub(clubId, filters),
  staleTime: 5 * 60 * 1000,  // 5 minutos
  enabled: !!clubId,  // No ejecutar sin clubId
});

// Mutaciones con invalidacion
const mutation = useMutation({
  mutationFn: playerService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['players'] });
    toast.success('Jugador creado');
  },
  onError: (error) => {
    toast.error(error.message);
  }
});
```

**Verificar:**
```
[ ] queryKey incluye todas las dependencias
[ ] staleTime configurado apropiadamente
[ ] enabled evita queries innecesarias
[ ] Mutaciones invalidan queries relacionadas
[ ] onError muestra feedback al usuario
```

### 3. React Hook Form + Zod

```jsx
// Schema de validacion
const playerSchema = z.object({
  firstName: z.string().min(2, 'Minimo 2 caracteres'),
  lastName: z.string().min(2, 'Minimo 2 caracteres'),
  email: z.string().email('Email invalido'),
  birthDate: z.date().max(new Date(), 'Fecha no puede ser futura'),
});

// Formulario
const PlayerForm = () => {
  const form = useForm({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      birthDate: null,
    }
  });

  const onSubmit = async (data) => {
    try {
      await playerService.create(data);
      toast.success('Creado');
    } catch (error) {
      // Manejar errores del servidor
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          form.setError(field, { message: messages[0] });
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* ... mas campos */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </Form>
  );
};
```

**Verificar:**
```
[ ] Todos los campos tienen validacion Zod
[ ] Mensajes de error son claros y en espanol
[ ] defaultValues estan definidos
[ ] isSubmitting desactiva boton
[ ] Errores del servidor se muestran por campo
```

### 4. Accesibilidad (A11y)

```jsx
// MALO
<div onClick={handleClick}>Clickeame</div>

// BUENO
<button
  onClick={handleClick}
  aria-label="Agregar jugador"
>
  Agregar
</button>

// MALO - imagen sin alt
<img src={player.photo} />

// BUENO
<img src={player.photo} alt={`Foto de ${player.name}`} />

// Navegacion por teclado
<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir</Button>
  </DialogTrigger>
  <DialogContent>
    {/* Radix maneja focus trap automaticamente */}
  </DialogContent>
</Dialog>
```

**Verificar:**
```
[ ] Botones tienen texto descriptivo o aria-label
[ ] Imagenes tienen alt text
[ ] Formularios tienen labels asociados
[ ] Modales tienen focus trap
[ ] Colores tienen contraste suficiente
[ ] Componentes son navegables con teclado
```

### 5. Performance

```jsx
// MALO - re-renders innecesarios
const ParentComponent = () => {
  const [count, setCount] = useState(0);

  // Se crea nueva funcion en cada render
  const handleClick = () => console.log('click');

  return <ExpensiveChild onClick={handleClick} />;
};

// BUENO - memoizacion
const ParentComponent = () => {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log('click');
  }, []);

  return <ExpensiveChild onClick={handleClick} />;
};

// Componente memoizado
const ExpensiveChild = memo(({ onClick }) => {
  // ...
});

// Lazy loading de paginas
const PlayersPage = lazy(() => import('./pages/PlayersPage'));

<Suspense fallback={<LoadingPage />}>
  <PlayersPage />
</Suspense>
```

**Verificar:**
```
[ ] Componentes pesados usan React.memo
[ ] Callbacks estables con useCallback
[ ] Valores computados con useMemo
[ ] Paginas usan lazy loading
[ ] Listas grandes usan virtualizacion
```

### 6. Estructura de Componentes

```
src/components/
├── ui/                    # Componentes base (Radix wrapeados)
│   ├── button.jsx
│   ├── input.jsx
│   └── dialog.jsx
├── form/                  # Componentes de formulario
│   ├── FormField.jsx
│   ├── DatePicker.jsx
│   └── Select.jsx
├── players/               # Componentes de dominio
│   ├── PlayerCard.jsx
│   ├── PlayerForm.jsx
│   └── PlayersList.jsx
└── layout/                # Layout components
    ├── Sidebar.jsx
    └── Navbar.jsx
```

**Verificar:**
```
[ ] Componentes en carpeta correcta
[ ] Un componente por archivo
[ ] Nombre de archivo = nombre de componente
[ ] Componentes reutilizables en ui/ o form/
[ ] Componentes de dominio en su carpeta
```

---

## Patrones Recomendados

### Compound Components
```jsx
// Para componentes complejos
<DataTable>
  <DataTable.Header>
    <DataTable.Column>Nombre</DataTable.Column>
  </DataTable.Header>
  <DataTable.Body>
    {players.map(p => (
      <DataTable.Row key={p.id}>
        <DataTable.Cell>{p.name}</DataTable.Cell>
      </DataTable.Row>
    ))}
  </DataTable.Body>
</DataTable>
```

### Render Props / Children as Function
```jsx
<PermissionGuard permission="players.edit">
  {({ hasPermission }) => (
    hasPermission ? <EditButton /> : <ViewOnlyBadge />
  )}
</PermissionGuard>
```

### Custom Hooks
```jsx
// hooks/usePlayer.js
export const usePlayer = (playerId) => {
  const query = useQuery({
    queryKey: ['player', playerId],
    queryFn: () => playerService.getById(playerId),
    enabled: !!playerId,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => playerService.update(playerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player', playerId] });
    }
  });

  return {
    player: query.data,
    isLoading: query.isLoading,
    error: query.error,
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};
```

---

## Comandos de Validacion

```bash
# ESLint
npx eslint src/ --ext .jsx,.js

# Buscar console.log
grep -rn "console.log" src/ --include="*.jsx"

# Buscar useEffect sin dependencias
grep -rn "useEffect.*\[\]" src/

# Buscar componentes sin memo en listas
grep -rn "\.map.*=>" src/ | grep -v "memo\|key="

# Verificar imports no usados
npx eslint src/ --rule "no-unused-vars: error"
```

---

## Anti-Patrones a Evitar

### 1. Props Drilling Excesivo
```jsx
// MALO
<GrandParent>
  <Parent user={user}>
    <Child user={user}>
      <GrandChild user={user} />
    </Child>
  </Parent>
</GrandParent>

// BUENO - usar Context
<AuthProvider>
  <GrandParent>
    <Parent>
      <Child>
        <GrandChild />  {/* usa useAuth() */}
      </Child>
    </Parent>
  </GrandParent>
</AuthProvider>
```

### 2. Estado Derivado
```jsx
// MALO - estado duplicado
const [items, setItems] = useState([]);
const [filteredItems, setFilteredItems] = useState([]);

useEffect(() => {
  setFilteredItems(items.filter(i => i.active));
}, [items]);

// BUENO - calcular en render
const [items, setItems] = useState([]);
const filteredItems = useMemo(
  () => items.filter(i => i.active),
  [items]
);
```

### 3. useEffect para sincronizar estado
```jsx
// MALO
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState('');

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// BUENO
const fullName = `${firstName} ${lastName}`;
// o
const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);
```

---

## Reporte de Calidad

| Componente | Loading | Error | A11y | Performance | Score |
|------------|---------|-------|------|-------------|-------|
| PlayersList | OK | OK | Warn | OK | 8/10 |
| PlayerForm | OK | Missing | OK | OK | 7/10 |
| Dashboard | OK | OK | OK | Slow | 6/10 |
