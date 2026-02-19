# Event Board - Project Structure Reference

## 📁 Complete File Structure

```
event-board/
├── packages/
│   ├── backend/
│   │   ├── eb-api-gateway/                 # Apollo Federation Gateway
│   │   │   ├── src/
│   │   │   │   ├── main.ts                 # Application entry point
│   │   │   │   ├── app.module.ts           # Main NestJS module
│   │   │   │   └── auth/
│   │   │   │       ├── jwt.strategy.ts     # JWT strategy
│   │   │   │       ├── gql-auth.guard.ts   # GraphQL auth guard
│   │   │   │       └── auth.module.ts      # Auth module
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   ├── .env                        # Environment variables (Docker)
│   │   │   ├── .env.example                # Environment template
│   │   │   ├── Dockerfile
│   │   │   └── README.md
│   │   │
│   │   ├── eb-api-events/                  # Events Subgraph
│   │   │   ├── src/
│   │   │   │   ├── main.ts                 # Application entry point
│   │   │   │   ├── app.module.ts           # Main NestJS module
│   │   │   │   └── events/
│   │   │   │       ├── events.entity.ts    # Event data model
│   │   │   │       ├── events.input.ts     # Input DTOs
│   │   │   │       ├── events.service.ts   # Business logic
│   │   │   │       ├── events.resolver.ts  # GraphQL resolvers
│   │   │   │       └── events.module.ts    # Feature module
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   ├── .env
│   │   │   ├── .env.example
│   │   │   ├── Dockerfile
│   │   │   └── README.md
│   │   │
│   │   └── eb-api-users/                   # Users Subgraph
│   │       ├── src/
│   │       │   ├── main.ts
│   │       │   ├── app.module.ts
│   │       │   └── users/
│   │       │       ├── users.entity.ts     # User data model
│   │       │       ├── users.input.ts      # Input DTOs
│   │       │       ├── users.response.ts   # Response types
│   │       │       ├── users.service.ts    # Business logic + auth
│   │       │       ├── users.resolver.ts   # GraphQL resolvers
│   │       │       └── users.module.ts     # Feature module
│   │       ├── package.json
│   │       ├── tsconfig.json
│   │       ├── .env
│   │       ├── .env.example
│   │       ├── Dockerfile
│   │       └── README.md
│   │
│   └── frontend/
│       ├── eb-web-app/                     # Host Application
│       │   ├── src/
│       │   │   ├── index.tsx               # Application bootstrap
│       │   │   └── App.tsx                 # Main App component
│       │   ├── public/
│       │   │   └── index.html              # HTML template
│       │   ├── package.json
│       │   ├── tsconfig.json
│       │   ├── webpack.config.js           # Webpack + Module Federation
│       │   ├── .babelrc
│       │   ├── .env
│       │   ├── .env.example
│       │   ├── Dockerfile
│       │   └── README.md
│       │
│       ├── eb-web-app-events/              # Events Remote Module
│       │   ├── src/
│       │   │   ├── index.tsx               # Remote bootstrap
│       │   │   └── EventsApp.tsx           # Main Events component
│       │   ├── public/
│       │   │   └── index.html
│       │   ├── package.json
│       │   ├── tsconfig.json
│       │   ├── webpack.config.js
│       │   ├── .babelrc
│       │   ├── .env
│       │   ├── .env.example
│       │   ├── Dockerfile
│       │   └── README.md
│       │
│       └── eb-web-app-users/               # Users Remote Module
│           ├── src/
│           │   ├── index.tsx
│           │   └── UsersApp.tsx            # Main Users component
│           ├── public/
│           │   └── index.html
│           ├── package.json
│           ├── tsconfig.json
│           ├── webpack.config.js
│           ├── .babelrc
│           ├── .env
│           ├── .env.example
│           ├── Dockerfile
│           └── README.md
│
├── scripts/
│   └── init-mongodb.js                    # MongoDB initialization + seeds
│
├── docker-compose.yml                      # Docker Compose orchestration
├── pnpm-workspace.yaml                    # pnpm monorepo configuration
├── package.json                           # Root package.json
├── .gitignore
├── .dockerignore
├── README.md                              # Main documentation
├── SETUP.md                               # Setup and debugging guide
└── ARCHITECTURE.md                        # Architecture diagrams

```

## 🔑 Key Files Overview

### Configuration Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Orchestrates all services in containers |
| `pnpm-workspace.yaml` | Defines pnpm monorepo structure |
| `package.json` (root) | Root scripts and devDependencies |
| `tsconfig.json` (each service) | TypeScript configuration |
| `webpack.config.js` (frontend) | Webpack build + Module Federation |
| `.env` (backend & frontend) | Development environment variables |
| `.env.example` | Template for environment variables |

### Source Files

#### Backend (NestJS)
- `src/main.ts` - Application bootstrap
- `src/app.module.ts` - Root module configuration
- `src/*/[feature].entity.ts` - Data models (Mongoose schemas)
- `src/*/[feature].input.ts` - Input DTOs for validation
- `src/*/[feature].service.ts` - Business logic
- `src/*/[feature].resolver.ts` - GraphQL resolvers
- `src/*/[feature].module.ts` - Feature modules

#### Frontend (React)
- `src/index.tsx` - Application entry point
- `src/App.tsx` - Main component
- `webpack.config.js` - Build configuration with Module Federation
- `.babelrc` - Babel configuration for JSX/TypeScript

### Database
- `scripts/init-mongodb.js` - MongoDB initialization script with sample data

## 📊 Service Dependencies

```
Host (3000)
├── Events Remote (3001)
├── Users Remote (3002)
└── API Gateway (4000)
    ├── Events Subgraph (4001)
    ├── Users Subgraph (4002)
    └── MongoDB (27017)
         ├── Database: eb_events
         └── Database: eb_users
```

## 🚀 Quick Commands

### From Root Directory
```bash
# Install all dependencies
pnpm install

# Run all services with Docker
pnpm dev:build          # Build and run
pnpm dev                # Run without rebuild
pnpm down               # Stop services
pnpm logs               # View logs

# Code quality
pnpm lint               # Lint all packages
pnpm type-check         # Type check all packages
```

### Individual Service Commands
```bash
# Backend Service (example: eb-api-gateway)
cd packages/backend/eb-api-gateway
pnpm dev                # Start in dev mode
pnpm build              # Build TypeScript
pnpm start              # Run production build

# Frontend Service (example: eb-web-app)
cd packages/frontend/eb-web-app
pnpm dev                # Start webpack dev server
pnpm build              # Build for production
```

## 🔐 Environment Variables

### eb-api-gateway (.env)
```
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://root:password@mongodb:27017
EVENTS_SUBGRAPH_URL=http://eb-api-events:4001/graphql
USERS_SUBGRAPH_URL=http://eb-api-users:4002/graphql
JWT_SECRET=your-super-secret-key-change-in-production
```

### eb-api-events (.env)
```
NODE_ENV=development
PORT=4001
MONGODB_URI=mongodb://root:password@mongodb:27017/eb_events
APOLLO_GATEWAY_URL=http://eb-api-gateway:4000
```

### eb-api-users (.env)
```
NODE_ENV=development
PORT=4002
MONGODB_URI=mongodb://root:password@mongodb:27017/eb_users
JWT_SECRET=your-super-secret-key-change-in-production
APOLLO_GATEWAY_URL=http://eb-api-gateway:4000
```

### Frontend Services (.env)
```
REACT_APP_API_GATEWAY_URL=http://localhost:4000/graphql
REACT_APP_EVENTS_REMOTE_URL=http://localhost:3001  (eb-web-app only)
REACT_APP_USERS_REMOTE_URL=http://localhost:3002   (eb-web-app only)
```

## 🔗 Service URLs

| Service | URL | Port |
|---------|-----|------|
| Web App (Host) | http://localhost:3000 | 3000 |
| Events Remote | http://localhost:3001 | 3001 |
| Users Remote | http://localhost:3002 | 3002 |
| API Gateway | http://localhost:4000 | 4000 |
| Events Subgraph | http://localhost:4001 | 4001 |
| Users Subgraph | http://localhost:4002 | 4002 |
| MongoDB | mongodb://localhost:27017 | 27017 |

## 📖 Documentation Files

- **README.md** - Main project overview and quick start
- **SETUP.md** - Detailed setup and development guide with debugging
- **ARCHITECTURE.md** - System architecture diagrams and data flow
- **backend/*/README.md** - Individual service documentation
- **frontend/*/README.md** - Individual module documentation

---

This structure follows best practices for:
- ✅ Monorepo organization with pnpm
- ✅ Microservices architecture (GraphQL Federation)
- ✅ Microfrontends (Module Federation)
- ✅ Type safety (TypeScript everywhere)
- ✅ Scalability (independent service deployment)
- ✅ Code sharing (monorepo dependencies)
- ✅ Environment management (.env files)
- ✅ Docker containerization (Dockerfiles)
