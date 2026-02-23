# Aplicación Host Event Board - React

Aplicación React host para Module Federation que sirve como punto de entrada principal de la aplicación. Integra dinámicamente los módulos remotos de Eventos y Usuarios, manejando autenticación, navegación y gestión de tokens.

## Características

- **Module Federation Host** para carga dinámica de módulos remotos
- **React Router** para navegación del lado del cliente
- **Material-UI (MUI)** como librería de componentes
- **Gestión de tokens JWT** (acceso y refresco)
- **AuthContext** para compartir estado de autenticación
- **Almacenamiento seguro de tokens** (sessionStorage + cookies HTTP-only)
- **Error Boundaries** para manejo de errores en módulos remotos
- **Tema personalizado** MUI compartido con módulos

## Arquitectura de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                              │
│         (Componente raíz, React Router)                     │
└─────────────────────────────────────────────────────────────┘
           ↓ Proporciona contexto
┌─────────────────────────────────────────────────────────────┐
│                   AuthContext                               │
│  (token, setToken, userName, setUserName)                   │
└─────────────────────────────────────────────────────────────┘
           ↓ Contexto disponible para                │
       ┌──────────┘                           └──────────┐
       ↓                                                  ↓
┌──────────────────────────────────────┐    ┌──────────────────────────────────────┐
│   UsersApp (Módulo Remoto)           │    │   EventsApp (Módulo Remoto)         │
│   @ebWebAppUsers (puerto 3002)       │    │   @ebWebAppEvents (puerto 3001)     │
│                                      │    │                                      │
│ - RegisterForm                       │    │ - EventsTable                        │
│ - LoginForm                          │    │ - EventFilters                       │
│ - TabPanel                           │    │ - CreateEventDialog                  │
└──────────────────────────────────────┘    └──────────────────────────────────────┘
```

### Componentes Principales

#### **App.tsx** - Componente Raíz

- Configura React Router con rutas
- Inicializa Material-UI Theme
- Carga módulos remotos dinámicamente con lazy loading
- Maneja estado de autenticación (token, userName)
- Decodifica JWT token para extraer información del usuario
- Proporciona AuthContext a componentes hijos
- Maneja logout

```typescript
export default function App() {
  const [token, setToken] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  // Decodificar JWT payload
  const parseJwt = (token: string) => { ... }
  
  // Cargar token de sessionStorage en mount
  useEffect(() => { ... }
  
  // Mantener sincronizado userName cuando token cambia
  useEffect(() => { ... }
  
  // Logout: limpiar tokens
  const handleLogout = () => { ... }
}
```

#### **AuthContext.tsx** - Contexto de Autenticación

Proporciona estado compartido para toda la aplicación:

```typescript
export const AuthContext = React.createContext<{
  token: string | null
  setToken: (token: string | null) => void
  userName: string | null
  setUserName: (name: string | null) => void
}>({ ... })
```

Disponible en (1) UsersApp remoto, (2) EventsApp remoto, (3) NavBar

#### **NavBar.tsx** - Barra de Navegación

- Muestra usuario logueado (name del JWT payload)
- Botón Logout si está autenticado
- Navegación entre rutas (Login, Events)

#### **Módulos Remotos Lazy-loaded**

```typescript
const UsersApp = lazy(() =>
  import("@ebWebAppUsers/UsersApp").catch(() => ({
    default: () => <div>Failed to load Users module</div>,
  })),
)

const EventsApp = lazy(() =>
  import("@ebWebAppEvents/EventsApp").catch(() => ({
    default: () => <div>Failed to load Events module</div>,
  })),
)
```

## Gestión de Tokens

### Flujo de Autenticación

1. **Usuario se registra o inicia sesión** en UsersApp
2. **Servidor retorna tokens**:
   - Access Token (1 hora)
   - Refresh Token (7 días)
3. **UsersApp almacena**:
   - Access Token → sessionStorage
   - Refresh Token → cookie HTTP-only
4. **UsersApp notifica a App** mediante props `setToken`, `setIsLoggedIn`, `setUserName`
5. **App actualiza estado** y decodifica JWT para extraer nombre
6. **EventsApp recibe token** vía AuthContext
7. **EventsApp envía token** en header Authorization en requests

### Almacenamiento de Tokens

**Access Token**:
- Ubicación: `sessionStorage`
- Clave: `"accessToken"`
- Duración: 1 hora
- Uso: Header Authorization en requests a API Gateway

**Refresh Token**:
- Ubicación: Cookie HTTP-only
- Clave: `"refreshToken"`
- Duración: 7 días
- Uso: Renovación de access token (no implementado aún)

### Decodificación JWT en Cliente

```typescript
const parseJwt = (token: string) => {
  try {
    const base64 = token.split(".")[1]
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

// Payload
const payload = parseJwt(accessToken)
// {
//   sub: "507f1f77bcf86cd799439011",    // User ID
//   email: "user@example.com",
//   name: "John Doe",
//   iat: 1677600000,
//   exp: 1677603600
// }
```

**NOTA**: JWT token NO se valida en cliente (confiar en servidor). Solo se extrae información para UX.

## Tema Material-UI

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",   // Azul
    },
    secondary: {
      main: "#dc004e",   // Rosa/Rojo
    },
  },
})
```

Compartido con módulos remotos mediante Provider en App.

## Module Federation Configuration

### webpack.config.js

```javascript
new ModuleFederationPlugin({
  name: "eb_web_app",
  filename: "remoteEntry.js",
  remotes: {
    "@ebWebAppUsers": "eb_web_app_users@http://localhost:3002/remoteEntry.js",
    "@ebWebAppEvents": "eb_web_app_events@http://localhost:3001/remoteEntry.js",
  },
  shared: {
    react: { singleton: true },
    "react-dom": { singleton: true },
    "@mui/material": { singleton: true },
  },
})
```

### Características

- **Host App**: Carga dinámicamente 2 remotos
- **Shared Dependencies**: React, ReactDOM, MUI son singleton (una sola instancia)
- **Error Handling**: Si remoto falla, muestra mensaje de error
- **Lazy Loading**: Módulos se cargan bajo demanda con Suspense

## React Router Structure

```
/                → App (NavBar + rutas)
   /login        → UsersApp (Register/Login)
   /events       → EventsApp (Event Management)
```

Protected Routes (futuro):
- `/events` requiere token válido

## Ejecución

```bash
# Modo desarrollo con hot reload
pnpm dev

# Compilar para producción
pnpm build

# Ejecutar compilación de producción
pnpm start
```

## Variables de Entorno

```bash
# Puerto del host
PORT=3000

# API Gateway
REACT_APP_API_GATEWAY_URL=http://localhost:4000/graphql
```

Ver `.env.example` para la lista completa.

## Pruebas

```bash
# Ejecutar pruebas unitarias
pnpm test

# Modo watch
pnpm test:watch
```

Coverage: `coverage/`

## Acceso a la Aplicación

Abre en navegador: **http://localhost:3000**

Flujo recomendado:
1. Ir a `/login`
2. Registrarse con email y contraseña
3. Sistema almacena tokens automáticamente
4. Volver a home, deberías ver nombre en NavBar
5. Ir a `/events` para ver/crear eventos
