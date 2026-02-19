# Event Board Events Module (Remote)

React remote module for events management using Module Federation.

## Features
- Module Federation remote for dynamic loading
- Event listing with filtering
- Event creation, update, delete operations
- GraphQL queries and mutations via Apollo Gateway
- Material-UI table and form components
- JWT token handling for authenticated requests
- Responsive data table with inline actions

## Components
- **EventsApp**: Main container component
- Event table with sorting by date
- Filter controls (category, status)
- Dialog forms for create/update operations
- Inline delete action buttons

## Data Fetching
All requests go through API Gateway at `http://localhost:4000/graphql`:
- `query events` - List events with optional filters
- `query event(id)` - Get single event details
- `mutation createEvent` - Create new event
- `mutation updateEvent` - Update event
- `mutation deleteEvent` - Delete event

## Authentication
Reads JWT token from sessionStorage and includes in request headers:
```
Authorization: Bearer <accessToken>
```

## Running
```bash
pnpm dev    # Development mode with hot reload
pnpm build  # Build for production
```

## Port
- Development: 3000 (loaded as remote by host)
- Standalone: 3001

## Module Export
Exports `EventsApp` component as default export via Module Federation.
