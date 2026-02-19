# 🚀 Event Board - Quick Reference Card

## Essential Commands

```bash
# First time setup
pnpm install                # Install all dependencies
pnpm dev:build              # Build and run all services with Docker

# Running services
pnpm dev                    # Run all services
pnpm logs                   # View real-time logs
pnpm down                   # Stop all services

# Code quality
pnpm lint                   # Lint all packages
pnpm type-check             # Type check all packages

# Individual service (example)
cd packages/backend/eb-api-gateway
pnpm dev                    # Start in dev mode
pnpm build                  # Build
```

## Service Ports

```
Frontend
├── Host (eb-web-app)               → http://localhost:3000
├── Events Remote (eb-web-app-events) → http://localhost:3001
└── Users Remote (eb-web-app-users)  → http://localhost:3002

Backend
├── API Gateway (eb-api-gateway)    → http://localhost:4000
├── Events Subgraph (eb-api-events)   → http://localhost:4001
└── Users Subgraph (eb-api-users)     → http://localhost:4002

Database
└── MongoDB                         → mongodb://localhost:27017
```

## Quick Access URLs

| Service | GraphQL Playground |
|---------|-------------------|
| Gateway | http://localhost:4000/graphql |
| Events | http://localhost:4001/graphql |
| Users | http://localhost:4002/graphql |
| Web App | http://localhost:3000 |

## GraphQL Quick Queries

### Test Events Endpoint
```graphql
query {
  events {
    _id
    title
    category
    status
  }
}
```

### Test Login
```graphql
mutation {
  login(input: {
    email: "john@example.com"
    password: "password"
  }) {
    accessToken
    user { id, email, name }
  }
}
```

## Directory Structure Reminder

```
event-board/
├── packages/
│   ├── backend/
│   │   ├── eb-api-gateway/
│   │   ├── eb-api-events/
│   │   └── eb-api-users/
│   └── frontend/
│       ├── eb-web-app/
│       ├── eb-web-app-events/
│       └── eb-web-app-users/
├── scripts/
│   └── init-mongodb.js
├── docker-compose.yml
└── [documentation files]
```

## Environment Variables Quick Reference

### Backend Services
```
NODE_ENV=development
PORT=[4000|4001|4002]
MONGODB_URI=mongodb://root:password@mongodb:27017[/database]
JWT_SECRET=your-secret-key
```

### Frontend Services
```
REACT_APP_API_GATEWAY_URL=http://localhost:4000/graphql
```

## Troubleshooting Quick Fixes

```bash
# Clear Docker and rebuild
docker-compose down -v
pnpm dev:build

# Check service status
docker ps

# View service logs
docker-compose logs -f eb-api-gateway

# Restart specific service
docker-compose restart eb-api-gateway

# Connect to MongoDB
mongosh mongodb://root:password@localhost:27017
```

## Technology Stack

- **Backend**: NestJS + GraphQL Apollo Federation
- **Frontend**: React + Material-UI + Module Federation
- **Database**: MongoDB
- **Auth**: JWT (Access + Refresh tokens)
- **Container**: Docker + Docker Compose
- **Package Manager**: pnpm

## Development Tips

1. **GraphQL Playground** is your friend - test queries before coding
2. **Auto-reload enabled** - changes reload automatically in dev mode
3. **Hot Module Reload** - NestJS services reload without restart
4. **Check logs often** - `pnpm logs` reveals most issues
5. **Environment files matter** - Copy `.env.example` to `.env`

## Key Files to Know

- `docker-compose.yml` - Service orchestration
- `packages/*/package.json` - Dependencies for each service
- `packages/*/src/main.ts` - Service entry points
- `packages/backend/*/src/*/[feature].service.ts` - Business logic
- `packages/frontend/*/webpack.config.js` - Frontend build config
- `.env` files - Environment variables

## Common Changes

### Add Event Field
1. Update schema: `eb-api-events/src/events/events.entity.ts`
2. Update inputs: `eb-api-events/src/events/events.input.ts`
3. Update UI: `eb-web-app-events/src/EventsApp.tsx`

### Add Authentication to Operation
1. Add `@UseGuards(GqlAuthGuard)` to resolver method
2. Add parameter: `@Context('user') user: any`

### Change Service Port
1. Update `docker-compose.yml` port mapping
2. Update `.env` PORT variable
3. Update remote URLs in other services

## Documentation Menu

- 📖 **README.md** - Start here
- 🏗️ **ARCHITECTURE.md** - System design
- 🚀 **GETTING_STARTED.md** - Startupguide
- 🔧 **SETUP.md** - Detailed setup
- 📁 **FILE_STRUCTURE.md** - Project layout
- ⚡ **QUICK_REFERENCE.md** - This file

## First Steps After Clone

1. `pnpm install` - Install dependencies
2. Copy `.env.example` to `.env` in each service
3. `pnpm dev:build` - Start services
4. Wait 2-3 minutes for build
5. Open http://localhost:3000
6. Login with demo credentials (set up will auto-seed)

## Getting Help

```bash
# Check logs
pnpm logs

# Check specific service
docker-compose logs eb-api-gateway

# Review architecture
cat ARCHITECTURE.md

# Review individual service docs
cat packages/backend/eb-api-gateway/README.md
```
