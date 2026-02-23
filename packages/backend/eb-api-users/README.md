# Event Board Users Subgraph NestJS Application

NestJS application serving as Apollo Federation subgraph for Users domain.

## Features
- GraphQL Apollo Federation subgraph
- MongoDB integration with Mongoose
- User registration and authentication
- JWT token generation (access and refresh tokens)
- Password hashing with bcryptjs
- User management (create, update, read)
- Full schema federation support

## Data Model
```typescript
User {
  _id: ObjectId
  email: String (unique)
  name: String
  password: String (hashed)
  createdAt: Date
  updatedAt: Date
}
```

## Authentication
- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Passwords hashed with bcryptjs (10 salt rounds)

## Environment Variables
See `.env.example` for complete list.

##Running
```bash
pnpm dev    # Development mode with hot reload
pnpm build  # Build TypeScript
pnpm start  # Start production build
```

## GraphQL Playground
Navigate to http://localhost:4002/graphql to test queries and mutations.

### Running tests

```bash
cd packages/backend/eb-api-users
pnpm test          # only placeholder for now
```

## Key Operations
- `mutation register` - Register new user, returns JWT tokens
- `mutation login` - Login user, returns JWT tokens
- `query user(id)` - Get user by ID
- `mutation updateUser` - Update user profile (requires authentication)

## Mutation Examples

### Register User (Public)
```graphql
mutation {
  register(input: {
    email: "user@example.com"
    name: "John Doe"
    password: "securepassword123"
  }) {
    accessToken
    refreshToken
    user {
      _id
      email
      name
      createdAt
    }
  }
}
```

### Login User (Public)
```graphql
mutation {
  login(input: {
    email: "user@example.com"
    password: "securepassword123"
  }) {
    accessToken
    refreshToken
    user {
      _id
      email
      name
    }
  }
}
```

### Update User Profile (Requires Auth)
```graphql
mutation {
  updateUser(input: {
    id: "699a4377f8fc201670baa7dd"
    name: "Jane Doe"
    email: "newemail@example.com"
  }) {
    _id
    email
    name
    updatedAt
  }
}
```

**Note:** For updateUser, include HTTP Header:
```
Authorization: Bearer <jwt_token>
```
