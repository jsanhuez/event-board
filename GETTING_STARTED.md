# Event Board - Startup Checklist & Next Steps

## ✅ Pre-Development Checklist

### 1. Environment Setup
- [ ] Docker & Docker Compose installed (`docker --version`, `docker-compose --version`)
- [ ] Node.js 24+ installed (`node --version`)
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Code editor (VS Code recommended)
- [ ] Git configured (`git --version`)

### 2. Repository Setup
- [ ] Clone/navigate to event-board directory
- [ ] Review `.github/copilot-instructions.md` for project guidelines
- [ ] Install root dependencies: `pnpm install`

### 3. Environment Files
- [ ] Copy `.env.example` to `.env` in each service:
  - `packages/backend/eb-api-gateway/.env`
  - `packages/backend/eb-api-events/.env`
  - `packages/backend/eb-api-users/.env`
  - `packages/frontend/eb-web-app/.env`
  - `packages/frontend/eb-web-app-events/.env`
  - `packages/frontend/eb-web-app-users/.env`
- [ ] Review and update `.env` files for your setup
- [ ] Change `JWT_SECRET` to a strong random value

### 4. First Run
- [ ] From root directory: `pnpm dev:build`
- [ ] Wait for all services to start (3-5 minutes for first build)
- [ ] Verify no errors in console output
- [ ] All containers should show "healthy" in `docker ps`

### 5. Verify Services
- [ ] Access http://localhost:3000 - should load web app
- [ ] Try to navigate to /login tab
- [ ] Check API Gateway at http://localhost:4000/graphql

## 📋 Development Workflow

### Starting Development
```bash
# From root directory
pnpm dev          # Run all services
pnpm logs         # View logs in separate terminal
```

### Code Changes
```bash
# Services auto-reload in development mode
# For frontend Webpack: changes trigger rebuild
# For backend NestJS: changes trigger Hot Module Reload
```

### Testing Changes
1. Make your code changes
2. Services auto-reload
3. Check browser console and server logs for errors
4. Test GraphQL operations at http://localhost:4000/graphql

### Committing Code
```bash
git add .
git commit -m "meaningful commit message"
git push
```

## 🎯 First Feature Development Example

### Create a New Event Category

1. **Update MongoDB Schema** (if needed)
   - File: `packages/backend/eb-api-events/src/events/events.entity.ts`
   - Update `EventCategory` enum
   - Perform data migration in MongoDB

2. **Update GraphQL Schema**
   - File: `packages/backend/eb-api-events/src/events/events.entity.ts`
   - Update `@Enum()` decorator
   - Changes auto-propagate to gateway

3. **Update Input Validation**
   - File: `packages/backend/eb-api-events/src/events/events.input.ts`
   - Update `EventCategory` enum in `CreateEventInput` and `UpdateEventInput`

4. **Update Frontend Form**
   - File: `packages/frontend/eb-web-app-events/src/EventsApp.tsx`
   - Add new option to FormControl MenuItem
   - Update category filter options

5. **Test**
   - Create event with new category via GraphQL Playground
   - Verify it appears correctly in UI
   - Filter by new category

## 🔄 Common Development Tasks

### Adding a New Event Field
1. Update entity: `eb-api-events/src/events/events.entity.ts`
2. Update input DTOs: `eb-api-events/src/events/events.input.ts`
3. Update resolver: `eb-api-events/src/events/events.resolver.ts` (if new logic)
4. Update UI component: `eb-web-app-events/src/EventsApp.tsx`
5. Add MongoDB migration if necessary
6. Test in GraphQL Playground

### Adding a New User Field
Same process as above but in `eb-api-users` service.

### Adding Authentication to a Query
1. Import guard: `import { UseGuards } from '@nestjs/common'`
2. Add to resolver method: `@UseGuards(GqlAuthGuard)`
3. Access user: `@Context('user') user: any` in mutation/query parameter
4. Test with Authorization header in GraphQL Playground

### Adding New Validation Rules
1. Add to input DTO: `packages/backend/*/src/*/[feature].input.ts`
2. Use validators from `class-validator`:
   ```typescript
   import { IsString, MinLength, MaxLength, IsEnum } from 'class-validator';
   
   @InputType()
   export class MyInput {
     @Field()
     @IsString()
     @MinLength(3)
     @MaxLength(100)
     name: string;
   }
   ```
3. Validation happens automatically in NestJS global pipe

## 🐛 Common Issues & Quick Fixes

| Issue | Solution |
|-------|----------|
| Port already in use | Change port in docker-compose.yml or .env files |
| Module not found | Run `pnpm install` from root |
| MongoDB connection error | Verify MongoDB container is running and healthy |
| GraphQL schema not found | Restart service container, clear dist folder |
| CORS errors | Check SERVICE_URL environment variables |
| Token expired | Clear sessionStorage and login again |
| Hot reload not working | Rebuild: `pnpm build` then restart service |

## 📚 Documentation to Review

1. **README.md** - Project overview and quick start
2. **ARCHITECTURE.md** - System design and data flow
3. **SETUP.md** - Detailed setup and debugging guide
4. **FILE_STRUCTURE.md** - This file and complete file reference
5. **Individual README.md** in each package - Service-specific details

## 🚀 Recommended Next Steps

### Immediate (First Day)
- [ ] Get all services running successfully
- [ ] Create a test event through the UI
- [ ] Create a test user and login
- [ ] Explore GraphQL schema in Playground
- [ ] Review code structure in `src` folders

### Short Term (First Week)
- [ ] Add email validation to events
- [ ] Implement event search functionality
- [ ] Add event pagination
- [ ] Add user profile view
- [ ] Implement password reset flow

### Medium Term (Next Weeks)
- [ ] Add event attendance tracking
- [ ] Add event notifications/reminders
- [ ] Add role-based access control (admin/organizer/attendee)
- [ ] Add event image uploads
- [ ] Add calendar view for events

### Long Term
- [ ] API rate limiting in gateway
- [ ] Database query optimization
- [ ] Caching layer (Redis)
- [ ] Full test coverage
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] Analytics dashboard

## 🔐 Production Deployment Checklist

Before deploying to production:

### Security
- [ ] Change all default passwords
- [ ] Update JWT_SECRET to secure value
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS with specific origins
- [ ] Enable rate limiting
- [ ] Enable input sanitization
- [ ] Review authentication/authorization
- [ ] Enable database authentication
- [ ] Use managed database service

### Performance
- [ ] Enable caching headers
- [ ] Optimize database indexes
- [ ] Enable query caching
- [ ] Configure CDN for static assets
- [ ] Enable gzip compression
- [ ] Optimize images and assets

### Operations
- [ ] Set up logging/monitoring
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Set up health checks
- [ ] Configure auto-scaling
- [ ] Set up backup strategy
- [ ] Document deployment process
- [ ] Create runbooks for incidents

### Code
- [ ] Run full test suite
- [ ] Run linting across all packages
- [ ] Remove console.log statements
- [ ] Update version numbers
- [ ] Create changelog
- [ ] Tag git release

## 📞 Support & Resources

### Local Development Help
- Check logs: `pnpm logs`
- Check specific service: `docker-compose logs <service-name>`
- Review SETUP.md troubleshooting section

### Architecture Questions
- Review ARCHITECTURE.md diagrams
- Check individual service README.md files
- Review code comments in source files

### Technology Specific
- [NestJS Docs](https://docs.nestjs.com/)
- [GraphQL Apollo Docs](https://www.apollographql.com/docs/)
- [React Docs](https://react.dev/)
- [Material-UI Docs](https://mui.com/)
- [MongoDB Docs](https://docs.mongodb.com/)

### Module Federation
- [Module Federation Docs](https://webpack.js.org/concepts/module-federation/)
- [Enhanced Module Federation](https://module-federation.io/)

## 💡 Pro Tips

1. **Use GraphQL Playground** to test queries before coding
2. **Check browser DevTools** for network requests and errors
3. **Enable Docker logging** for debugging container issues
4. **Use breakpoints** in VS Code debugger for backend code
5. **Review git logs** to understand commit history
6. **Read test files** to understand expected behavior (when available)
7. **Use TypeScript strict mode** to catch errors early
8. **Keep .env files out of git** (add to .gitignore)
9. **Document assumptions** in code comments
10. **Follow project guidelines** in .github/copilot-instructions.md
