# Event Board - Monorepo

Event Board is a full-stack application for managing internal events within a team. It's built using a microservices architecture with GraphQL Federation and Module Federation for the frontend.

## 🏗️ Architecture

### Backend (NestJS with GraphQL Apollo Federation)

- **eb-api-gateway**: Apollo Gateway / Router that composes schemas from subgraphs
  - Handles authentication with JWT tokens
  - Validates inputs using class-validator
  - Acts as the single entry point for all client requests
  - Ports: 4000

- **eb-api-events**: Subgraph microservice for Events
  - CRUD operations for events
  - MongoDB integration for event collection
  - GraphQL federation support
  - Ports: 4001

- **eb-api-users**: Subgraph microservice for Users
  - User registration and login
  - JWT token generation
  - User management (create, update)
  - MongoDB integration for users collection
  - Ports: 4002

### Database

- **MongoDB**: Document database with two separate databases
  - `eb_events`: Contains events collection
  - `eb_users`: Contains users collection
  - Connection: `mongodb://root:password@mongodb:27017`
  - Ports: 27017

### Frontend (React with Module Federation)

- **eb-web-app**: Host application
  - Main entry point for users
  - Integrates remote modules (Events and Users)
  - Handles authentication flow and token management
  - Ports: 3000

- **eb-web-app-events**: Remote module for Events
  - Event listing, filtering, creation, update, deletion
  - Hooks for API requests to eb-api-gateway
  - Components: EventList, EventCard, CreateEvent, UpdateEvent
  - Ports: 3001

- **eb-web-app-users**: Remote module for Users
  - User registration and login
  - JWT token management
  - Secure HTTP-only cookies for refresh tokens
  - Ports: 3002

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 24+ (for local development without Docker)
- pnpm (npm install -g pnpm)

### Running with Docker Compose

```bash
# Clone the repository
cd event-board

# Run all services
pnpm dev:build

# Or just run without rebuild
pnpm dev

# View logs
pnpm logs

# Stop all services
pnpm down
```

### Running locally without Docker

```bash
# Install dependencies
pnpm install

# Start backend services (in separate terminals)
cd packages/backend/eb-api-gateway
pnpm dev

cd packages/backend/eb-api-events
pnpm dev

cd packages/backend/eb-api-users
pnpm dev

# Start frontend services (in separate terminals)
cd packages/frontend/eb-web-app
pnpm dev

cd packages/frontend/eb-web-app-events
pnpm dev

cd packages/frontend/eb-web-app-users
pnpm dev
```

## 📁 Project Structure

```
event-board/
├── packages/
│   ├── backend/
│   │   ├── eb-api-gateway/       # Apollo Gateway
│   │   ├── eb-api-events/        # Events Subgraph
│   │   └── eb-api-users/         # Users Subgraph
│   └── frontend/
│       ├── eb-web-app/           # Host Application
│       ├── eb-web-app-events/    # Events Remote Module
│       └── eb-web-app-users/     # Users Remote Module
├── scripts/
│   └── init-mongodb.js           # MongoDB initialization script
├── docker-compose.yml             # Docker Compose configuration
├── pnpm-workspace.yaml            # pnpm workspace configuration
└── package.json                   # Root package.json
```

## 🔐 Authentication Flow

1. User navigates to `/login` on eb-web-app
2. Selects Register or Login on eb-web-app-users module
3. Credentials sent to eb-api-gateway → eb-api-users subgraph
4. JWT access token generated and stored in sessionStorage
5. Refresh token stored in secure HTTP-only cookie
6. Access token sent with each API request to eb-api-gateway

## 🗄️ Database Schema

### Events Collection (eb_events database)
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  date: Date,
  location: String,
  category: Enum ['workshop', 'meetup', 'talk', 'social'],
  organizer: String,
  status: Enum ['draft', 'confirmed', 'cancelled'],
  createdAt: Date,
  updatedAt: Date
}
```

### Users Collection (eb_users database)
```javascript
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Data Validation

- **API Gateway Level**: Cross-cutting validation for authentication, authorization, and common input validation
- **Subgraph Level**: Each microservice validates its own schema fields using class-validator

## 📝 Environment Variables

Each service has an `.env.example` file. Copy to `.env` and customize:

### Backend Services
- `NODE_ENV`: development/production
- `PORT`: Service port
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: Secret key for JWT signing

### Frontend Services
- `REACT_APP_API_GATEWAY_URL`: GraphQL endpoint

## 🛠️ Development

### Available Scripts

Root level:
- `pnpm dev:build` - Build and run with Docker Compose
- `pnpm dev` - Run with Docker Compose
- `pnpm down` - Stop Docker Compose
- `pnpm logs` - View logs from all services
- `pnpm lint` - Run linting across all packages
- `pnpm type-check` - Type check all packages

Individual packages:
- `pnpm build` - Build the package
- `pnpm start` - Start the package
- `pnpm dev` - Start in development mode with hot reload

## 🧪 Testing

Each service can be tested independently:

```bash
cd packages/backend/eb-api-gateway
pnpm test
```

## 📊 GraphQL Playground

After starting the services, access the GraphQL playground at:
- Apollo Gateway: http://localhost:4000/graphql
- Events Subgraph: http://localhost:4001/graphql
- Users Subgraph: http://localhost:4002/graphql

## 🔗 API Endpoints

### Events (through Apollo Gateway)
- `query events(filter: EventFilterInput)` - List events with optional filters
- `query event(id: String!)` - Get event by ID
- `mutation createEvent(input: CreateEventInput!)` - Create event (requires auth)
- `mutation updateEvent(input: UpdateEventInput!)` - Update event (requires auth)
- `mutation deleteEvent(id: String!)` - Delete event (requires auth)

### Users (through Apollo Gateway)
- `mutation register(input: RegisterInput!)` - Register new user
- `mutation login(input: LoginInput!)` - Login user
- `mutation updateUser(input: UpdateUserInput!)` - Update user
- `query user(id: String!)` - Get user by ID

## 🔐 Security Considerations

1. JWT tokens expire after 1 hour
2. Refresh tokens last 7 days
3. Passwords are hashed using bcryptjs
4. Refresh tokens stored in HTTP-only cookies
5. Access tokens stored in sessionStorage
6. CORS configured for Docker services
7. Change JWT_SECRET in production

## 📚 Technologies

### Backend
- NestJS
- GraphQL with Apollo Server & Federation
- MongoDB with Mongoose
- Bcryptjs for password hashing
- JWT for authentication

### Frontend
- React 18
- Material-UI (MUI)
- Module Federation (@module-federation/enhanced)
- Axios for HTTP requests
- React Router for navigation

### DevOps
- Docker & Docker Compose
- Node.js 24
- MongoDB 7.0.5

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB container is healthy: `docker ps` and check status
- Check MongoDB credentials in docker-compose.yml
- Verify MONGODB_URI in .env files

### GraphQL Schema Issues
- Clear dist folders and rebuild: `pnpm build`
- Check schema auto-generation in GraphQL module configuration

### Module Federation Issues
- Ensure all remote modules are running on correct ports
- Check webpack configuration for correct remotes URLs
- Clear dist folders and rebuild

### Port Conflicts
- Modify docker-compose.yml or .env files to change service ports
- Ensure no other services are using ports 3000-3002, 4000-4002, 27017

## 📝 Contributing

Follow the project guidelines in `.github/copilot-instructions.md`

## Author
Juan Sanhueza R.
