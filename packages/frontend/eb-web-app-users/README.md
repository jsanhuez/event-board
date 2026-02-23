# Event Board Users Module (Remote)

React remote module for user authentication and registration using Module Federation.

## Features
- Module Federation remote for dynamic loading
- User registration form
- User login form
- Tab-based UI switching between register and login
- GraphQL mutations via Apollo Gateway
- JWT token generation and storage
- Material-UI card and input components
- Secure token management (sessionStorage + HTTP-only cookies)

## Components
- **UsersApp**: Main container with auth forms
- **RegisterForm**: User registration with email, name, password
- **LoginForm**: User login with email and password
- **TabPanel**: Tab navigation between forms
- Error and success message displays

## Authentication Flow
1. User fills registration or login form
2. Submit to Apollo Gateway via GraphQL mutation
3. Gateway routes to eb-api-users subgraph
4. Returns JWT tokens (access + refresh)
5. Store tokens:
   - Access token: sessionStorage (sessionStorage.setItem('accessToken', token))
   - Refresh token: HTTP-only cookie (Cookies.set('refreshToken', ...))
6. Pass token to host app via setIsLoggedIn callback

## Data Mutations
- `mutation register` - Register with email, name, password
- `mutation login` - Login with email and password

## Running
```bash
pnpm dev    # Development mode with hot reload
pnpm build  # Build for production
```

## Port
- Development: 3000 (loaded as remote by host)
- Standalone: 3002

## Module Export
Exports `UsersApp` component as default export via Module Federation.

## Testing

There is currently a placeholder test in `test/` so that `pnpm test` passes.  Add
real unit tests for components and hooks as needed.

## Integration
Accepts `setIsLoggedIn` prop to notify parent app of authentication status.
