# Módulo de Usuarios Event Board (Remoto)

Módulo remoto React para autenticación de usuarios (registro e inicio de sesión) utilizando Module Federation. Se carga dinámicamente en la aplicación host y proporciona toda la funcionalidad de gestión de usuarios.

## Características

- **Module Federation Remote** para carga dinámica
- **Registro e inicio de sesión** con validación de formulario
- **JWT token generation y manejo** (access + refresh)
- **Integración con Material-UI** (formularios, tabs, alerts)
- **TabPanel** para cambiar entre registro e inicio de sesión
- **Almacenamiento de tokens** (sessionStorage + HTTP-only cookies)
- **Integración con aplicación host** mediante props

## Arquitectura de Componentes

```
┌─────────────────────────────────────────────────┐
│            UsersApp.tsx (Remoto)                │
│  (Componente principal del módulo)              │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│    - TabPanel (Register / Login)                │
│    - RegisterForm                               │
│    - LoginForm                                  │
│    - Validaciones de formulario                 │
│    - Alert messages                             │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│      API Gateway (localhost:4000)               │
│      - Mutation createUser (registro)           │
│      - Mutation login                           │
│      - Mutation refreshToken                    │
└─────────────────────────────────────────────────┘
```

### Componentes Principales

#### **UsersApp.tsx** - Componente Principal

```typescript
export default function UsersApp({
  setIsLoggedIn,
  setToken,
  setUserName,
}) {
  // Estado principal
  const [currentTab, setCurrentTab] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Registro - formulario
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Login - formulario
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })

  // Funciones de autenticación
  const handleRegister = async () => { ... }
  const handleLogin = async () => { ... }
  const handleLogout = () => { ... }
}
```

Estructura principal:
1. **TabPanel** - Cambiar entre formularios
2. **RegisterForm** - Email, nombre, contraseña
3. **LoginForm** - Email, contraseña
4. **Token Management** - Guardar y usar tokens

## Fetching de Datos

### Método de Comunicación

Todos los requests usan **axios** contra el API Gateway:

```typescript
const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL 
  || "http://localhost:4000/graphql"

// Request GraphQL
const response = await axios.post(API_GATEWAY_URL, {
  query: `mutation { createUser(input: {...}) { token } }`,
  variables: { ... },
})
```

### GraphQL Operations

#### Mutation: createUser (registro)

```graphql
mutation {
  createUser(input: {
    name: "John Doe"
    email: "john@example.com"
    password: "securePassword123"
  }) {
    _id
    email
    name
    accessToken
    refreshToken
  }
}
```

**Respuesta exitosa**:
```json
{
  "data": {
    "createUser": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "name": "John Doe",
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

#### Mutation: login

```graphql
mutation {
  login(email: "john@example.com", password: "securePassword123") {
    _id
    email
    name
    accessToken
    refreshToken
  }
}
```

**Respuesta exitosa**:
```json
{
  "data": {
    "login": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "name": "John Doe",
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

#### Mutation: refreshToken

```graphql
mutation {
  refreshToken(refreshToken: "eyJhbGc...") {
    accessToken
    refreshToken
  }
}
```

## Gestión de Tokens

### Token Storage Strategy

**Access Token** (corta duración):
```typescript
// Almacenado en sessionStorage (no persiste entre pestañas)
sessionStorage.setItem("accessToken", accessToken)
```

**Refresh Token** (larga duración):
```typescript
// Almacenado en HTTP-only cookie (más seguro)
Cookies.set("refreshToken", refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: "Strict",
})
```

### Payload JWT

```json
{
  "sub": "507f1f77bcf86cd799439011",
  "email": "john@example.com",
  "name": "John Doe",
  "iat": 1707123456,
  "exp": 1707127056
}
```

- **sub** - User ID (MongoDB)
- **email** - Email del usuario
- **name** - Nombre del usuario
- **iat** - Issued At (timestamp Unix)
- **exp** - Expiration (1 hora para access token)

### Integración con Host App

El módulo comunica el token a la aplicación host mediante props:

```typescript
// Callbacks del host
{
  setIsLoggedIn(true),      // indica que usuario está logueado
  setToken(accessToken),    // pasa el token
  setUserName(userName),    // pasa el nombre para mostrar
}
```

La aplicación host usa estos valores en `AuthContext`:

```typescript
const [token, setToken] = useState(null)
const [userName, setUserName] = useState(null)
const [isLoggedIn, setIsLoggedIn] = useState(false)

// Pasar como props al módulo UsersApp
<UsersApp 
  setToken={setToken}
  setUserName={setUserName}
  setIsLoggedIn={setIsLoggedIn}
/>
```

## Validaciones

### Registro (createUser)

| Campo | Validación | Error |
|-------|-----------|-------|
| **name** | Requerido | "El nombre es requerido" |
| **email** | Formato válido | "Email inválido" |
| **email** | Único en BD | "Email ya registrado" |
| **password** | Min 6 caracteres | "Mínimo 6 caracteres" |
| **password** | Coincide confirmación | "Las contraseñas no coinciden" |

### Login (login)

| Campo | Validación | Error |
|-------|-----------|-------|
| **email** | Formato válido | "Email inválido" |
| **password** | No vacío | "Contraseña requerida" |
| **combinación** | Existe usuario | "Credenciales incorrectas" |

### Password Hashing

```
Input: "myPassword123"
       ↓
Bcrypt (salt rounds: 10)
       ↓
Hash: "$2b$10$nxL1L3...abcdef..."
```

La contraseña se hashea con **bcryptjs** antes de almacenarse:
- **Salt rounds**: 10
- **Algoritmo**: bcrypt
- **Tiempo típico**: 100ms por hash

## 📝 Flujo de Autenticación

### 1. Registro

```
User Input (name, email, password)
         ↓
Form Validation (local)
         ↓
POST /graphql (mutation createUser)
         ↓
Backend: Hash password + insert usuario
         ↓
Response: tokens (access + refresh)
         ↓
Store: sessionStorage (access), cookie (refresh)
         ↓
Update Host: setToken, setUserName, setIsLoggedIn
         ↓
Redirect a /events
```

### 2. Login

```
User Input (email, password)
         ↓
Form Validation (local)
         ↓
POST /graphql (mutation login)
         ↓
Backend: Find user + compare password
         ↓
Response: tokens (access + refresh)
         ↓
Store: sessionStorage (access), cookie (refresh)
         ↓
Update Host: setToken, setUserName, setIsLoggedIn
         ↓
Redirect a /events
```

## Exportación de Módulo

El módulo exporta el componente `UsersApp` como exportación por defecto para Module Federation.

```typescript
// webpack.config.js
new ModuleFederationPlugin({
  name: "eb_web_app_users",
  filename: "remoteEntry.js",
  exposes: {
    "./UsersApp": "./src/UsersApp",
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

- **Desarrollo**: 3002 (cargado como remoto por host)
- **Standalone**: 3002 (si se ejecuta independientemente)
