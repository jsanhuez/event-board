# Subgrafo de Eventos Event Board - Aplicación NestJS

Aplicación NestJS que sirve como subgrafo Apollo Federation especializado en el dominio de Eventos.

## Características

- **Subgrafo Apollo Federation** con soporte de federación
- **Integración MongoDB** con Mongoose para persistencia
- **Operaciones CRUD** completas para eventos
- **Validación de input** con class-validator
- **Filtros y ordenamiento** de eventos
- **Autenticación JWT** en operaciones protegidas
- **Generación automática** de esquema GraphQL federado

## Arquitectura en Capas

El subgrafo está estructurado en capas bien definidas:

```
┌─────────────────────────────────────┐
│     events.resolver.ts              │  ← Capa de Presentación GraphQL
│  (Queries, Mutations, Resolvers)    │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│     events.service.ts               │  ← Capa de Lógica de Negocio
│  (CRUD, Filtrados, Ordenamiento)    │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│     EventModel (Mongoose)           │  ← Capa de Persistencia
│  (MongoDB, Validación de Schema)    │
└─────────────────────────────────────┘
```

### Resolver (events.resolver.ts)

Define los endpoints GraphQL expuestos por este subgrafo:

```typescript
@Resolver(() => Event)
export class EventsResolver {
  // Queries (lectura)
  @Query(() => [Event])
  async events(filter?: EventFilterInput): Promise<Event[]>
  
  @Query(() => Event, { nullable: true })
  async event(id: string): Promise<Event>

  // Mutations (escritura, requieren autenticación)
  @Mutation(() => Event)
  @UseGuards(GqlAuthGuard)
  async createEvent(input: CreateEventInput, user: any): Promise<Event>

  @Mutation(() => Event)
  @UseGuards(GqlAuthGuard)
  async updateEvent(id: string, input: UpdateEventInput): Promise<Event>

  @Mutation(() => Event)
  @UseGuards(GqlAuthGuard)
  async deleteEvent(id: string): Promise<Event>
}
```

### Service (events.service.ts)

Implementa la lógica de negocio para operaciones de eventos:

```typescript
@Injectable()
export class EventsService {
  // Crear evento
  async create(createEventInput: CreateEventInput, creatorId: string): Promise<Event>

  // Listar eventos con filtros opcionales
  async findAll(filter?: EventFilterInput): Promise<Event[]>

  // Obtener evento por ID
  async findOne(id: string): Promise<Event>

  // Actualizar evento
  async update(id: string, updateEventInput: UpdateEventInput): Promise<Event>

  // Eliminar evento
  async remove(id: string): Promise<Event>
}
```

## Modelo de Datos

### Entity (events.entity.ts)

```typescript
@ObjectType()
@Schema()
export class Event extends Document {
  _id: ObjectId              // ID único (MongoDB)
  title: string              // Título del evento (requerido)
  description: string        // Descripción (requerido)
  date: Date                 // Fecha/hora del evento (requerido)
  location: string           // Ubicación (requerido)
  category: EventCategory    // Categoría (requerido): workshop, meetup, talk, social
  organizer: string          // Organizador (requerido)
  status: EventStatus        // Estado: draft, confirmed, cancelled (default: draft)
  creatorId: string          // ID del usuario que creó el evento
  createdAt: Date            // Fecha de creación
  updatedAt: Date            // Fecha de última actualización
}
```

### Enumeraciones

**EventCategory** - Tipos de eventos disponibles:
- `WORKSHOP` - Taller educativo
- `MEETUP` - Reunión/encuentro
- `TALK` - Charla o presentación
- `SOCIAL` - Evento social

**EventStatus** - Estados de un evento:
- `DRAFT` - Borrador (no publicado)
- `CONFIRMED` - Confirmado y publicado
- `CANCELLED` - Cancelado

## Validaciones de Dominio

### Validaciones en Create (CreateEventInput)

| Campo | Validaciones | Ejemplos |
|-------|-------------|----------|
| **title** | String, requerido | "TypeScript Workshop" |
| **description** | String, requerido | "Learn advanced TypeScript patterns" |
| **date** | Date válida, requerido | "2026-04-15T10:00:00Z" |
| **location** | String, requerido | "Room 5" |
| **category** | Enum (WORKSHOP, MEETUP, TALK, SOCIAL), requerido | "WORKSHOP" |
| **organizer** | String, requerido | "John Doe" |
| **status** | Enum (DRAFT, CONFIRMED, CANCELLED), opcional (default: DRAFT) | "CONFIRMED" |

### Validaciones en Update (UpdateEventInput)

Todos los campos son **opcionales** (nullable). Solo se actualizan los campos proporcionados.

### Ejemplos de Errores de Validación

**Error: Title vacío o inválido**
```json
{
  "errors": [{
    "message": "Bad Request Exception",
    "statusCode": 400,
    "details": ["title is not a string"]
  }]
}
```

**Error: Category inválida**
```json
{
  "errors": [{
    "message": "Bad Request Exception",
    "statusCode": 400,
    "details": ["category must be one of: WORKSHOP, MEETUP, TALK, SOCIAL"]
  }]
}
```

**Error: Date inválida**
```json
{
  "errors": [{
    "message": "Bad Request Exception",
    "statusCode": 400,
    "details": ["date must be a Date instance"]
  }]
}
```

## Filtros y Opciones de Query

### Query: events (Listar eventos)

```graphql
query {
  events(filter: EventFilterInput) {
    _id
    title
    category
    status
    date
    organizer
  }
}
```

### Filtros Disponibles (EventFilterInput)

Todos los filtros son **opcionales**. Se pueden combinar múltiples filtros (AND lógico).

| Filtro | Tipo | Descripción | Ejemplo |
|--------|------|-------------|---------|
| **category** | String | Filtrar por categoría de evento | "WORKSHOP" |
| **status** | String | Filtrar por estado | "CONFIRMED" |
| **organizer** | String | Filtrar por organizador | "John Doe" |

### Ordenamiento

- **Predeterminado**: Por fecha ascendente (`date: 1`)
- Los eventos se retornan ordenados por fecha, los próximos primero

### Ejemplos de Consultas con Filtros

**1. Obtener todos los eventos**
```graphql
query {
  events {
    _id
    title
    date
  }
}
```

**2. Filtrar por categoría**
```graphql
query {
  events(filter: { category: "WORKSHOP" }) {
    _id
    title
    category
  }
}
```

**3. Filtrar por estado**
```graphql
query {
  events(filter: { status: "CONFIRMED" }) {
    _id
    title
    status
  }
}
```

**4. Filtrar por organizador**
```graphql
query {
  events(filter: { organizer: "John Doe" }) {
    _id
    title
    organizer
    date
  }
}
```

**5. Filtros combinados** (Category Y Status)
```graphql
query {
  events(filter: { category: "WORKSHOP", status: "CONFIRMED" }) {
    _id
    title
    category
    status
    date
  }
}
```

### Query: event (Obtener evento único)

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
    createdAt
    updatedAt
  }
}
```

**Respuesta si evento no existe**: `null` en el campo event

## Autenticación y Autorización

### Requisito de Autenticación

Las siguientes operaciones **requieren** token JWT válido:
- `mutation createEvent`
- `mutation updateEvent`
- `mutation deleteEvent`

Las siguientes operaciones **NO requieren** autenticación:
- `query events`
- `query event(id)`

### Cómo Incluir Token JWT

Header requerido en solicitudes autenticadas:
```
Authorization: Bearer <accessToken>
```

**Ejemplo con curl**:
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -X POST http://localhost:4001/graphql
```

### Errores de Autenticación

**Sin token**:
```json
{
  "errors": [{
    "message": "Unauthorized"
  }]
}
```

**Token inválido o expirado**:
```json
{
  "errors": [{
    "message": "Unauthorized"
  }]
}
```

## 🗄️ MongoDB y Persistencia

### Configuración de Conexión

```typescript
MongooseModule.forRoot(
  process.env.MONGODB_URI ||
  "mongodb://root:password@mongodb:27017/eb_events?authSource=admin"
)
```

**Base de datos**: `eb_events`  
**Colección**: `events`

### Esquema MongoDB (Schema Factory)

Mongoose genera automáticamente el esquema desde la entity GraphQL:

```typescript
@Schema()
export class Event {
  @Prop({ required: true })
  title: string;
  
  @Prop({ required: true })
  description: string;
  
  @Prop({ required: true })
  date: Date;
  
  @Prop({ enum: EventCategory, required: true })
  category: EventCategory;
  
  @Prop({ enum: EventStatus, default: EventStatus.DRAFT })
  status: EventStatus;
  
  @Prop({ default: () => new Date() })
  createdAt: Date;
  
  @Prop({ default: () => new Date() })
  updatedAt: Date;
}
```

### Validación de Esquema MongoDB

- **Campos requeridos**: title, description, date, location, category, organizer
- **Valores por defecto**: 
  - `status`: DRAFT
  - `createdAt` y `updatedAt`: fecha actual
- **Enums**: category y status solo aceptan valores definidos
- **Tipos**: Validación automática de tipos MongoDB

### Índices Recomendados

Para mejorar performance en consultas frecuentes:

```javascript
db.events.createIndex({ "category": 1 })          // Filtros por categoría
db.events.createIndex({ "status": 1 })            // Filtros por estado
db.events.createIndex({ "organizer": 1 })         // Filtros por organizador
db.events.createIndex({ "date": 1 })              // Ordenamiento por fecha
db.events.createIndex({ "creatorId": 1 })         // Eventos del usuario
db.events.createIndex({ 
  "category": 1, 
  "status": 1, 
  "date": 1 
})                                                 // Índice compuesto para filtros combinados
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
# Ejecutar todas las pruebas (unitarias, integración, e2e)
pnpm test

# Modo watch (re-ejecutar al cambiar archivos)
pnpm test:watch
```

La cobertura se genera en `coverage/`

## GraphQL Playground

Accede a **http://localhost:4001/graphql** para:
- Explorar el esquema completo
- Testear queries y mutations
- Ver documentación de tipos
- Configurar headers (Authorization)

## Variables de Entorno

```bash
# Puerto del subgrafo
PORT=4001

# MongoDB
MONGODB_URI=mongodb://root:password@mongodb:27017/eb_events?authSource=admin

# JWT (heredado del gateway)
JWT_SECRET=your-super-secret-key-change-in-production
```
