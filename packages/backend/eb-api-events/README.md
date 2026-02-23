# Event Board Events Subgraph NestJS Application

NestJS application serving as Apollo Federation subgraph for Events domain.

## Features
- GraphQL Apollo Federation subgraph
- MongoDB integration with Mongoose
- CRUD operations for events
- Input validation with class-validator
- Event filtering and sorting
- Full schema federation support

## Data Model
```typescript
Event {
  _id: ObjectId
  title: String
  description: String
  date: Date
  location: String
  category: Enum (workshop | meetup | talk | social)
  organizer: String
  status: Enum (draft | confirmed | cancelled)
  createdAt: Date
  updatedAt: Date
}
```

## Environment Variables
See `.env.example` for complete list.

## Running
```bash
pnpm dev    # Development mode with hot reload
pnpm build  # Build TypeScript
pnpm start  # Start production build
```

## GraphQL Playground
Navigate to http://localhost:4001/graphql to test queries and mutations.

### Running tests

```bash
cd packages/backend/eb-api-events
pnpm test          # all suites (unit/integration/e2e)
pnpm test:watch    # watch mode
```

The `test/` directory contains examples and you can place new specs there.

Coverage files appear in `packages/backend/eb-api-events/coverage`.

## Key Operations
- `query events` - List all events with optional filters
- `query event(id)` - Get single event by ID
- `mutation createEvent` - Create new event (requires authentication)
- `mutation updateEvent` - Update existing event (requires authentication)
- `mutation deleteEvent` - Delete event (requires authentication)

## Authentication
All mutations require a valid JWT token passed via the Authorization header:
```
Authorization: Bearer <jwt_token>
```

The JWT token can be obtained by logging in through the Users API:
```graphql
mutation {
  login(input: {
    email: "user@example.com"
    password: "password"
  }) {
    accessToken
    refreshToken
  }
}
```

## Mutation Examples

### Create Event (Requires Auth)
```graphql
mutation {
  createEvent(input: {
    title: "Node.js Workshop"
    description: "Learn Node.js basics"
    date: "2024-03-15T10:00:00Z"
    location: "Tech Hub"
    category: workshop
    organizer: "techcommunity"
    status: CONFIRMED
  }) {
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

### Update Event (Requires Auth)
```graphql
mutation {
  updateEvent(
    id: "699a4377f8fc201670baa7dd"
    input: {
      title: "Updated Workshop Title"
      status: CONFIRMED
    }
  ) {
    _id
    title
    status
    updatedAt
  }
}
```

### Delete Event (Requires Auth)
```graphql
mutation {
  deleteEvent(id: "699a4377f8fc201670baa7dd") {
    _id
    title
  }
}
```

**Note:** HTTP Header required:
```
Authorization: Bearer <jwt_token>
```
