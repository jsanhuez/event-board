# Event Board Host Application

React host application for Module Federation. Serves as the main entry point for the application.

## Features
- Module Federation host for dynamic remote loading
- React Router for client-side navigation
- Material-UI (MUI) theme provider
- JWT token management
- Authentication context
- Secure token storage (sessionStorage + HTTP-only cookies)
- Dynamic remote module loading with error boundaries

## Environment Variables
See `.env.example` for complete list.

## Remote Modules
- `@ebWebAppEvents` - Events management module (port 3001)
- `@ebWebAppUsers` - Users authentication module (port 3002)

## Token Management
- **Access Token**: Stored in sessionStorage (short-lived, 1 hour)
- **Refresh Token**: Stored in HTTP-only cookie (long-lived, 7 days)
- **Flow**: Get tokens from login → store → send with requests

## Running
```bash
pnpm dev    # Development mode with hot reload
pnpm build  # Build for production
```

## Access Application
Navigate to http://localhost:3000

## Running
```
pnpm dev    # Development mode with hot reload
pnpm build  # Build for production
```

## Testing

Unit tests are located under `test/` and use Jest + React Testing Library. Run:

```bash
pnpm test
pnpm test:watch
```

Coverage output goes to `coverage/`.

## Architecture
- Host communicates with API Gateway at `http://localhost:4000/graphql`
- Dynamically loads remote modules from ports 3001 and 3002
- Handles authentication flow and token storage
- Provides theme and auth context to child modules
