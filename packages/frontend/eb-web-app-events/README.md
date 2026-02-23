# Módulo de Eventos Event Board (Remoto)

Módulo remoto React para gestión de eventos utilizando Module Federation. Se carga dinámicamente en la aplicación host y proporciona funcionalidad completa para listar, filtrar, crear, actualizar y eliminar eventos.

## Características

- **Module Federation Remote** para carga dinámica
- **Listado de eventos** con filtrado por categoría y estado
- **Operaciones CRUD** completas en eventos
- **Queries y mutations GraphQL** a través del API Gateway
- **Componentes Material-UI** (tablas, formularios, diálogos)
- **Manejo de tokens JWT** para solicitudes autenticadas
- **Tabla responsiva** con acciones inline
- **Integración de contexto** para compartir tokens

## Arquitectura de Componentes

```
┌─────────────────────────────────────────────────┐
│            EventsApp.tsx (Remoto)               │
│  (Componente principal del módulo)              │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│    - Tabla de Eventos                           │
│    - Filtros (Categoría, Estado)                │
│    - CreateEventDialog                          │
│    - UpdateEventDialog                          │
│    - Acciones Inline (Edit, Delete)             │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│      API Gateway (localhost:4000)               │
│      - Query events                             │
│      - Query event(id)                          │
│      - Mutation createEvent                     │
│      - Mutation updateEvent                     │
│      - Mutation deleteEvent                     │
└─────────────────────────────────────────────────┘
```

### Componentes Principales

#### **EventsApp.tsx** - Componente Principal

```typescript
export default function EventsApp() {
  // Estado
  const [events, setEvents] = useState<Event[]>([])
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Formulario
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "WORKSHOP",
    organizer: "",
    status: "DRAFT",
  })

  // Filtros
  const [filters, setFilters] = useState({
    category: "",
    status: "",
  })

  // Funciones para CRUD
  const fetchEvents = async () => { ... }
  const handleCreate = async () => { ... }
  const handleUpdate = async () => { ... }
  const handleDelete = async (id: string) => { ... }
}
```

Estructura principal:
1. **Tabla de Eventos** - Listado con ordenamiento
2. **Filtros** - Dropdowns para filtrar
3. **Diálogos** - Crear/Editar eventos
4. **Mensajes** - Success y error alerts

## Fetching de Datos

### Método de Comunicación

Todos los requests usan **axios** contra el API Gateway:

```typescript
const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL 
  || "http://localhost:4000/graphql"

// Request GraphQL
const response = await axios.post(API_GATEWAY_URL, {
  query: `query { events { _id title category } }`,
  variables: { ... },
}, {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
```

### GraphQL Operations

#### Query: events (listar eventos)

```graphql
query {
  events(filter: EventFilterInput) {
    _id
    title
    description
    date
    location
    category
    organizer
    status
  }
}
```

#### Query: event(id) (obtener evento específico)

```graphql
query {
  event(id: "507f1f77bcf86cd799439011") {
    _id
    title
    description
    date
    location
    category
    organizer
    status
  }
}
```

#### Mutation: createEvent (requiere autenticación)

```graphql
mutation {
  createEvent(input: {
    title: "Event Title"
    description: "Description"
    date: "2026-04-15T10:00:00Z"
    location: "Location"
    category: WORKSHOP
    organizer: "Name"
    status: CONFIRMED
  }) {
    _id
    title
  }
}
```

#### Mutation: updateEvent (requiere autenticación)

```graphql
mutation {
  updateEvent(
    id: "507f1f77bcf86cd799439011"
    input: { status: CONFIRMED }
  ) {
    _id
    title
  }
}
```

#### Mutation: deleteEvent (requiere autenticación)

```graphql
mutation {
  deleteEvent(id: "507f1f77bcf86cd799439011") {
    _id
    title
  }
}
```

## Autenticación

### Requisito de Token

Las operaciones de **crear, actualizar, eliminar** requieren token JWT válido.

### Cómo Incluir el Token

El módulo lee el token de `AuthContext` (compartido por la aplicación host):

```typescript
import { AuthContext } from "./AuthContext"

export default function EventsApp() {
  const { token } = useContext(AuthContext)

  // Usar token en requests
  headers: {
    "Authorization": `Bearer ${token}`,
  }
}
```

### Manejo de Errores de Autenticación

```typescript
if (response.errors?.[0]?.message === "Unauthorized") {
  setError("No autorizado. Inicia sesión primero.")
  // Opcionalmente: redirigir a login
}
```

## 🎯 Filtros Disponibles

### Filter UI (Dropdowns)

```typescript
// Categorías
const categories = ["", "WORKSHOP", "MEETUP", "TALK", "SOCIAL"]

// Estados
const statuses = ["", "DRAFT", "CONFIRMED", "CANCELLED"]
```

### Aplicar Filtros

```typescript
const filteredEvents = events.filter(event => {
  if (filters.category && event.category !== filters.category) return false
  if (filters.status && event.status !== filters.status) return false
  return true
})
```

## Modelo de Datos

### Interface Event

```typescript
interface Event {
  _id: string              // MongoDB ID
  title: string            // Título
  description: string      // Descripción
  date: string             // ISO Date string
  location: string         // Ubicación
  category: string         // Categoría
  organizer: string        // Organizador
  status: string           // Estado (DRAFT, CONFIRMED, CANCELLED)
}
```

## Variables de Entorno

```bash
# Puerto del módulo
PORT=3001

# API Gateway URL
REACT_APP_API_GATEWAY_URL=http://localhost:4000/graphql
```

## Pruebas

```bash
# Ejecutar pruebas (placeholder)
pnpm test
```

Actualmente hay un test placeholder. Agrega pruebas unitarias reales para componentes según sea necesario.

## Exportación de Módulo

El módulo exporta el componente `EventsApp` como exportación por defecto para Module Federation.

```typescript
// webpack.config.js
new ModuleFederationPlugin({
  name: "eb_web_app_events",
  filename: "remoteEntry.js",
  exposes: {
    "./EventsApp": "./src/EventsApp",
  },
  shared: {
    react: { singleton: true },
    "react-dom": { singleton: true },
    "@mui/material": { singleton: true },
    axios: { singleton: true },
  },
})
```

## Ejecución

```bash
# Modo desarrollo con hot reload
pnpm dev

# Compilar para producción
pnpm build

# Ejecutar compilación de producción
pnpm start
```

## Puerto

- **Desarrollo**: 3001 (cargado como remoto por host)
- **Standalone**: 3001 (si se ejecuta independientemente)

