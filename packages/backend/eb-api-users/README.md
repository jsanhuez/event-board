# Subgrafo de Usuarios Event Board - Aplicación NestJS

Aplicación NestJS que sirve como subgrafo Apollo Federation especializado en el dominio de Usuarios, manejando autenticación, registro y gestión de usuarios.

## Características

- **Subgrafo Apollo Federation** con soporte de federación
- **Autenticación JWT** con tokens de acceso y refresco
- **Registro e inicio de sesión** seguros
- **Hashing de contraseñas** con bcryptjs (10 salt rounds)
- **Integración MongoDB** con Mongoose para persistencia
- **Validación de input** con class-validator
- **Gestión de usuarios** (crear, actualizar, leer)
- **Generación automática** de esquema GraphQL federado

## Arquitectura en Capas

El subgrafo está estructurado en capas bien definidas:

```
┌─────────────────────────────────────┐
│     users.resolver.ts               │  ← Capa de Presentación GraphQL
│  (Queries, Mutations, Resolvers)    │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│     users.service.ts                │  ← Capa de Lógica de Negocio
│  (Auth, CRUD, Hashing, Tokens)      │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│     UserModel (Mongoose)            │  ← Capa de Persistencia
│  (MongoDB, Validación de Schema)    │
└─────────────────────────────────────┘
```

### Resolver (users.resolver.ts)

Define los endpoints GraphQL expuestos por este subgrafo:

```typescript
@Resolver()
export class UsersResolver {
  // Mutations (no requieren autenticación para registro/login)
  @Mutation(() => AuthResponse)
  async register(input: RegisterInput): Promise<AuthResponse>

  @Mutation(() => AuthResponse)
  async login(input: LoginInput): Promise<AuthResponse>

  // Queries (lectura)
  @Query(() => User, { nullable: true })
  async user(id: string): Promise<User>

  // Mutations (requieren autenticación)
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateUser(input: UpdateUserInput): Promise<User>
}
```

### Service (users.service.ts)

Implementa la lógica de negocio para autenticación y gestión de usuarios:

```typescript
@Injectable()
export class UsersService {
  // Registro de nuevo usuario
  async register(registerInput: RegisterInput): Promise<AuthResponse>

  // Login de usuario
  async login(loginInput: LoginInput): Promise<AuthResponse>

  // Obtener usuario por ID
  async findOne(id: string): Promise<User>

  // Actualizar usuario
  async update(id: string, updateUserInput: UpdateUserInput): Promise<User>

  // Buscar por email (uso interno)
  async findByEmail(email: string): Promise<User>

  // Generar tokens JWT (privado)
  private generateTokens(user: User): AuthResponse
}
```

## Modelo de Datos

### Entity (users.entity.ts)

```typescript
@ObjectType()
@Schema()
export class User extends Document {
  _id: ObjectId              // ID único (MongoDB)
  email: string              // Email único (requerido)
  name: string               // Nombre del usuario (requerido)
  password: string           // Contraseña hasheada (requerido, NO se retorna)
  createdAt: Date            // Fecha de creación
  updatedAt: Date            // Fecha de última actualización
}
```

### Response Types

**AuthResponse** - Retornado en registro y login:
```typescript
{
  accessToken: string        // Token JWT de corta duración (1 hora)
  refreshToken: string       // Token JWT de larga duración (7 días)
  user: {
    id: string              // ID del usuario
    email: string           // Email del usuario
    name: string            // Nombre del usuario
  }
}
```

## Validaciones de Dominio

### Validaciones en Register (RegisterInput)

| Campo | Validaciones | Ejemplos |
|-------|-------------|----------|
| **email** | Formato email válido, único en BD, requerido | "john@example.com" |
| **name** | String, requerido | "John Doe" |
| **password** | Mínimo 6 caracteres, requerido | "securePassword123" |

### Validaciones en Login (LoginInput)

| Campo | Validaciones | 
|-------|-------------|
| **email** | Formato email válido, requerido | 
| **password** | String, requerido | 

### Validaciones en Update (UpdateUserInput)

Todos los campos son **opcionales** (nullable). Solo se actualizan los campos proporcionados.

| Campo | Validaciones |
|-------|-------------|
| **id** | String, requerido (identifica al usuario) |
| **email** | Formato email válido, único, opcional |
| **name** | String, opcional |

### Validaciones de Negocio

- **Email duplicado**: Si intenta registrarse con email ya existente → `BadRequestException: "Email already registered"`
- **Credenciales inválidas**: Login con email inexistente o contraseña incorrecta → `UnauthorizedException: "Invalid credentials"`
- **Password mínimo**: Si password < 6 caracteres → Error de validación

### Ejemplos de Errores de Validación

**Error: Email inválido o duplicado**
```json
{
  "errors": [{
    "message": "Bad Request Exception",
    "statusCode": 400,
    "details": [
      "email should be an email",
      "Email already registered"
    ]
  }]
}
```

**Error: Password muy corto**
```json
{
  "errors": [{
    "message": "Bad Request Exception",
    "statusCode": 400,
    "details": ["password must be longer than or equal to 6 characters"]
  }]
}
```

**Error: Credenciales inválidas en login**
```json
{
  "errors": [{
    "message": "Unauthorized",
    "statusCode": 401
  }]
}
```

## Autenticación JWT

### Flujo de Autenticación

1. **Usuario se registra** → contraseña se hashea con bcryptjs (10 salt rounds)
2. **Se generan tokens JWT**:
   - **Access Token**: Válido por 1 hora, incluye sub (ID), email, name
   - **Refresh Token**: Válido por 7 días, mismo payload
3. **Tokens se retornan** al cliente
4. **Cliente almacena**:
   - Access token en `sessionStorage`
   - Refresh token en cookie HTTP-only
5. **En solicitudes posteriores**, client envía access token en header

### Estructura JWT Payload

```typescript
{
  sub: string,        // User ID (MongoDB ObjectId)
  email: string,      // User email
  name: string,       // User name (para mostrar sin query adicional)
  iat: number,        // Issued at (timestamp)
  exp: number         // Expiration time (timestamp)
}
```

### Tiempos de Expiración

| Token | Duración | Uso |
|-------|----------|-----|
| **Access Token** | 1 hora | Autenticación en requests |
| **Refresh Token** | 7 días | Renovación de access token (futuro) |

### Hashing de Contraseñas

```typescript
// Registro
const hashedPassword = await bcrypt.hash(password, 10);  // 10 salt rounds

// Login
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

- **Salt rounds**: 10 (balance entre seguridad y velocidad)
- **Algoritmo**: bcryptjs (bcrypt.js, compatible cross-platform)
- **Hash**: One-way (no se puede recuperar contraseña original)

## MongoDB y Persistencia

### Configuración de Conexión

```typescript
MongooseModule.forRoot(
  process.env.MONGODB_URI ||
  "mongodb://root:password@mongodb:27017/eb_users?authSource=admin"
)
```

**Base de datos**: `eb_users`  
**Colección**: `users`

### MongoDB Schema (Schema Factory)

Mongoose genera automáticamente el esquema desde la entity GraphQL:

```typescript
@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;           // Índice único
  
  @Prop({ required: true })
  name: string;
  
  @Prop({ required: true })
  password: string;        // Almacenado hasheado
  
  @Prop({ default: () => new Date() })
  createdAt: Date;
  
  @Prop({ default: () => new Date() })
  updatedAt: Date;
}
```

### Validación de Esquema MongoDB

- **Campos requeridos**: email, name, password
- **Índice único**: email (no pueden existir dos usuarios con mismo email)
- **Valores por defecto**: 
  - `createdAt` y `updatedAt`: fecha actual
- **Tipos**: Validación automática de tipos MongoDB

### Índices Recomendados

Para mejorar performance:

```javascript
db.users.createIndex({ "email": 1 }, { unique: true })   // Búsqueda por email y unicidad
db.users.createIndex({ "createdAt": 1 })                 // Ordenamiento por fecha de registro
```

## Ejecución

```bash
# Modo desarrollo con hot reload
pnpm dev

# Construir TypeScript
pnpm build

# Ejecutar compilación de producción
pnpm start
```

## Pruebas

```bash
# Ejecutar pruebas (actualmente placeholder)
pnpm test
```

## GraphQL Playground

Accede a **http://localhost:4002/graphql** para:
- Explorar el esquema completo
- Testear queries y mutations
- Ver documentación de tipos

## Variables de Entorno

```bash
# Puerto del subgrafo
PORT=4002

# MongoDB
MONGODB_URI=mongodb://root:password@mongodb:27017/eb_users?authSource=admin

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
```

Ver `.env.example` para la lista completa.
