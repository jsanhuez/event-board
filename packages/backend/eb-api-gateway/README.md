# Event Board API Gateway NestJS Application

NestJS application serving as Apollo Federation Gateway/Router.

## Features
- GraphQL Apollo Gateway with Federation support
- JWT authentication using Passport.js
- Input validation with class-validator
- Cross-cutting concerns handling (auth, monitoring, rate limiting)
- Automatic schema composition from subgraphs
- Health checks and service availability monitoring

## Environment Variables
See `.env.example` for complete list.

## Running
```bash
pnpm dev    # Development mode with hot reload
pnpm build  # Build TypeScript
pnpm start  # Start production build
```

## GraphQL Playground
Navigate to http://localhost:4000/graphql to test queries and mutations.
