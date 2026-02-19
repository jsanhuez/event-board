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

## Key Operations
- `query events` - List all events with optional filters
- `query event(id)` - Get single event by ID
- `mutation createEvent` - Create new event (requires auth)
- `mutation updateEvent` - Update existing event (requires auth)
- `mutation deleteEvent` - Delete event (requires auth)
