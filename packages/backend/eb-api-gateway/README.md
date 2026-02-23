# API Gateway Event Board - Aplicación NestJS

Aplicación NestJS que actúa como Apollo Federation Gateway/Router, sirviendo como punto de entrada único para todas las solicitudes GraphQL del cliente.

## Características

- **Apollo Federation Gateway** con soporte de federación
- **Autenticación JWT** usando Passport.js
- **Validación de input** con class-validator
- **Composición automática de esquemas** desde subgrafos
- **Enrutamiento de solicitudes** hacia microservicios especializados
- **Forwarding de tokens** entre cliente y subgrafos
- **CORS configurado** para hosts frontend
- **Validación de entrada** transversal (whitelist, forbid non-whitelisted, transform)

## Subgrafos y Rutas

El API Gateway compone automáticamente el esquema de dos subgrafos específializados:

### Subgrafos Disponibles

| Nombre | URL | Puerto | Descripción |
|--------|-----|--------|-------------|
| **events** | `http://eb-api-events:4001/graphql` | 4001 | Subgrafo de Eventos - CRUD de eventos |
| **users** | `http://eb-api-users:4002/graphql` | 4002 | Subgrafo de Usuarios - Registro, login y gestión de usuarios |

### Composición de Esquemas

El gateway utiliza `IntrospectAndCompose` para:
- Introspeccionar automáticamente cada subgrafo cada 10 segundos (`pollIntervalInMs: 10_000`)
- Combinar esquemas federados en un supergraph unificado
- Detectar cambios de esquema sin requrir reinicio manual
- Manejar referencias entre tipos mediante `@requires` y `@provides`

### Enrutamiento de Solicitudes

```
Cliente GraphQL
    ↓
API Gateway (http://localhost:4000/graphql)
    ├─→ Subgrafo Events (http://eb-api-events:4001/graphql)
    └─→ Subgrafo Users (http://eb-api-users:4002/graphql)
```

Ejemplo: Una query que obtiene eventos y datos de usuario se enruta automáticamente a ambos subgrafos.

##  Autenticación JWT

### Flujo de Autenticación

1. **Usuario se registra o inicia sesión** en eb-web-app-users
2. **Subgrafo de Usuarios** genera tokens JWT y los retorna
3. **Cliente almacena** el token de acceso en `sessionStorage`
4. **Cliente envía** token en header `Authorization: Bearer <accessToken>` en solicitudes posteriores
5. **API Gateway valida** el token usando JWT strategy
6. **Gateway forwarda** el token a subgrafos según sea necesario

### Headers Requeridos

Para operaciones autenticadas, incluye el siguiente header:

```
Authorization: Bearer <accessToken>
```

Ejemplo con curl:
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ events { _id title } }"}'
```

### Validación de Tokens

**Implementación**: `src/auth/jwt.strategy.ts`

- **Estrategia**: Extraer token del header `Authorization` como Bearer token
- **Validación**:
  - Verifica firma usando `JWT_SECRET`
  - Valida que el token no haya expirado (`ignoreExpiration: false`)
  - Extrae payload (sub, email, name)
- **Payload JWT**:
  ```typescript
  {
    sub: string,        // User ID
    email: string,      // User email
    name: string,       // User name
    iat: number,        // Issued at
    exp: number         // Expiration time
  }
  ```

- **Token inválido**: Retorna `401 Unauthorized`
- **Token expirado**: Retorna `401 Unauthorized` (cliente debe usar refresh token)
- **Token válido**: Adjunta usuario al contexto GraphQL para operaciones protegidas

### Forwarding de Tokens a Subgrafos

El gateway automáticamente forwarda el token JWT a los subgrafos en cada solicitud:

```typescript
// app.module.ts - buildService config
willSendRequest({ request, context }) {
  const auth = context?.req?.headers?.authorization;
  if (auth && request.http?.headers) {
    request.http.headers.set("authorization", auth);
  }
}
```

Esto permite que los subgrafos validen autenticación en sus propios resolvers.

## Validación de Input

### Configuración Global

El gateway aplica validación global mediante `ValidationPipe`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Remover propiedades no declaradas
    forbidNonWhitelisted: true,   // Rechazar si hay propiedades extras
    transform: true,              // Transformar tipos automáticamente
  }),
);
```

### Validaciones en el Gateway

| Nivel | Descripción | Herramientas |
|-------|-------------|-------------|
| **Estructura** | Valida que los inputs cumplan estructura esperada | class-validator decorators |
| **Tipos** | Transforma y valida tipos (string → number, etc.) | NestJS ValidationPipe |
| **Whitelist** | Solo permite propiedades definidas en DTOs | forbidNonWhitelisted: true |
| **Subgrafo** | Cada subgrafo realiza validaciones específicas de su dominio | class-validator en eb-api-events y eb-api-users |

### Validaciones Específicas

**Ejemplo de errores de validación**:

```json
{
  "errors": [
    {
      "message": "Bad Request Exception",
      "statusCode": 400,
      "message": "Invalid input",
      "details": [
        "email should be an email",
        "password must be longer than or equal to 6 characters"
      ]
    }
  ]
}
```

## Integración con Subgrafos

### Composición de Referencias

Apollo Federation permite que los subgrafos definan tipos con referencias:

- **Subgrafo de Eventos** puede referenciar tipo `User` del subgrafo de Usuarios
- **Gateway compone** automáticamente estas referencias
- **Resolvers** en cada subgrafo resuelven sus campos específicos

Ejemplo de composición:
```graphql
# Definido en subgrafo events
type Event @key(fields: "id") {
  id: ID!
  title: String!
  organizer: User!  # Referencia al tipo User del subgrafo users
}

# El gateway automáticamente puede consultar:
query {
  events {
    title
    organizer {
      name    # Resuelto por subgrafo users
      email   # Resuelto por subgrafo users
    }
  }
}
```

### Manejo de Errores de Subgrafos

El gateway maneja diferentes escenarios de error:

| Escenario | Respuesta |
|-----------|-----------|
| Subgrafo no disponible | Error: "Service unavailable" |
| Timeout en subgrafo | Error: timeout después de 30 segundos por defecto |
| Error en subgrafo | Propaga error del subgrafo al cliente |
| Validación fallida en subgrafo | Error 400 con detalles específicos |

### Polling y Detección de Cambios

- **Intervalo**: Cada 10 segundos (`pollIntervalInMs: 10_000`)
- **Detección**: Si el esquema de un subgrafo cambia, el gateway lo detecta automáticamente
- **Sin downtime**: Los cambios de esquema se aplican sin reiniciar el gateway
- **Resiliencia**: Si un subgrafo es temporal no disponible, el gateway continúa con el schema anterior

## Ejecución

```bash
# Modo desarrollo con hot reload
pnpm dev

# Construir TypeScript
pnpm build

# Ejecutar compilación de producción
pnpm start
```

## GraphQL Playground

Accede a **http://localhost:4000/graphql** para:
- Explorar el esquema completo (botón "Schema")
- Testear queries y mutations
- Ver documentación de tipos
- Configurar headers (Authorization, etc.)

## Variables de Entorno

```bash
# Puertos y URLs
PORT=4000
CORS_ORIGIN=*

# Autenticación
JWT_SECRET=your-super-secret-key-change-in-production

# Subgrafos
EVENTS_SUBGRAPH_URL=http://eb-api-events:4001/graphql
USERS_SUBGRAPH_URL=http://eb-api-users:4002/graphql
```

Ver `.env.example` para la lista completa.

## Pruebas

```bash
# Ejecutar pruebas (actualmente placeholder)
pnpm test
```
