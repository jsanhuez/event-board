# Event Board - Development Setup Guide

## 🎯 Quick Reference

### Service Ports
- **Frontend Host (eb-web-app)**: 3000
- **Events Remote (eb-web-app-events)**: 3001
- **Users Remote (eb-web-app-users)**: 3002
- **API Gateway**: 4000
- **Events Subgraph**: 4001
- **Users Subgraph**: 4002
- **MongoDB**: 27017

### Database Names
- **Events**: `eb_events`
- **Users**: `eb_users`

## 🚀 Getting Started with Docker Compose

### First Time Setup

```bash
# Navigate to project root
cd event-board

# Build and run all services
pnpm dev:build

# Wait for services to start (2-3 minutes)
# MongoDB will initialize with sample data
```

### Subsequent Runs

```bash
# Just run without rebuild (faster)
pnpm dev

# View logs in real-time
pnpm logs

# Stop all services
pnpm down
```

## 🏃 Local Development (Without Docker)

### Install Dependencies
```bash
# Root dependencies
pnpm install
```

### Start Services in Order

**Terminal 1: MongoDB**
```bash
# Start MongoDB locally or use a MongoDB Atlas connection
# Update MONGODB_URI in .env files if using Atlas
```

**Terminal 2: API Gateway**
```bash
cd packages/backend/eb-api-gateway
pnpm dev
# Should start on http://localhost:4000
```

**Terminal 3: Events Subgraph**
```bash
cd packages/backend/eb-api-events
pnpm dev
# Should start on http://localhost:4001
```

**Terminal 4: Users Subgraph**
```bash
cd packages/backend/eb-api-users
pnpm dev
# Should start on http://localhost:4002
```

**Terminal 5: Host App**
```bash
cd packages/frontend/eb-web-app
pnpm dev
# Should start on http://localhost:3000
```

**Terminal 6: Events Remote**
```bash
cd packages/frontend/eb-web-app-events
pnpm dev
# Should start on http://localhost:3001
```

**Terminal 7: Users Remote**
```bash
cd packages/frontend/eb-web-app-users
pnpm dev
# Should start on http://localhost:3002
```

## 🧪 Testing the Application

### 1. Access the Application
- Open browser: http://localhost:3000

### 2. Register a User
- Navigate to Login tab
- Click Register
- Fill in email, name, and password
- Click Register button

### 3. Login
- Use the same email and password
- You should receive JWT token and be redirected
- Token stored in sessionStorage and refresh token in HTTP-only cookie

### 4. Create an Event
- After login, navigate to Events
- Click "Create Event"
- Fill in event details
- Click Create button

### 5. View Events
- Events displayed in a table with filters
- Can filter by category and status
- View all events created

### 6. Update Event
- Click "Edit" on any event
- Modify details
- Click "Update"

### 7. Delete Event
- Click "Delete" on any event
- Event removed from list

## 📊 GraphQL Queries

### View Available Schemas
```
http://localhost:4000/graphql  # Gateway (Supergraph)
http://localhost:4001/graphql  # Events Subgraph
http://localhost:4002/graphql  # Users Subgraph
```

### Example Queries

**List Events:**
```graphql
query {
  events {
    _id
    title
    description
    date
    location
    category
    organizer
    status
  }
}
```

**Filter Events by Category:**
```graphql
query {
  events(filter: { category: "workshop" }) {
    _id
    title
    category
  }
}
```

**Get Single Event:**
```graphql
query {
  event(id: "YOUR_EVENT_ID") {
    _id
    title
    description
  }
}
```

**Create Event:**
```graphql
mutation {
  createEvent(input: {
    title: "TypeScript Workshop"
    description: "Learn advanced TypeScript"
    date: "2026-03-15T10:00:00Z"
    location: "Room 3"
    category: WORKSHOP
    organizer: "John Doe"
    status: CONFIRMED
  }) {
    _id
    title
  }
}
```

**Register User:**
```graphql
mutation {
  register(input: {
    email: "test@example.com"
    name: "Test User"
    password: "password123"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      name
    }
  }
}
```

**Login:**
```graphql
mutation {
  login(input: {
    email: "test@example.com"
    password: "password123"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      name
    }
  }
}
```

## 🔍 Debugging

### Check Service Health
```bash
# Docker Compose
docker-compose ps

# Check specific service logs
docker-compose logs eb-api-gateway
docker-compose logs mongodb
```

### Database Access
```bash
# Connect to MongoDB
mongosh mongodb://root:password@localhost:27017

# View databases
show databases

# Use events database
use eb_events
show collections
db.events.find()

# Use users database
use eb_users
db.users.find()
```

### Network Debugging
```bash
# Check if services are reachable
curl http://localhost:4000/graphql
curl http://localhost:3000

# Check Docker network
docker network ls
docker network inspect event-board-network
```

## ⚙️ Environment Configuration

### Production Preparation

1. **Change JWT_SECRET**
   - Update in all .env files
   - Use a strong random string

2. **Update MONGODB_URI**
   - Use production MongoDB Atlas or managed instance
   - Never use default credentials

3. **CORS Configuration**
   - Update allowed origins in API Gateway
   - Remove localhost references

4. **API Gateway URL**
   - Update REACT_APP_API_GATEWAY_URL in frontend .env files

## 📦 Building for Production

```bash
# Build all packages
pnpm build

# Build Docker images
docker-compose -f docker-compose.yml build

# Push to registry (update image names first)
docker push your-registry/eb-api-gateway:latest
```

## 🆘 Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution**: Run `pnpm install` from root directory

### Issue: Port already in use
**Solution**: Change port in docker-compose.yml or .env files

### Issue: MongoDB connection refused
**Solution**: 
- Ensure MongoDB container is running: `docker-compose ps`
- Check MongoDB credentials match docker-compose.yml
- Wait 10-15 seconds for MongoDB to fully initialize

### Issue: GraphQL schema not found
**Solution**:
- Restart API Gateway service
- Clear dist folders: `rm -rf packages/*/dist`
- Run `pnpm build` again

### Issue: Module Federation errors
**Solution**:
- Ensure all remote modules are running
- Check webpack configuration ports match docker-compose.yml
- Clear browsers cache (Ctrl+Shift+Delete)

### Issue: CORS errors
**Solution**:
- Verify SERVICE_URL environments match docker-compose ports
- Check docker-compose.yml service dependencies are correct

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Apollo GraphQL Federation](https://www.apollographql.com/docs/apollo-server/federation/introduction/)
- [Module Federation](https://module-federation.io/)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
