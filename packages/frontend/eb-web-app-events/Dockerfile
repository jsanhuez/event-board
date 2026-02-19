FROM node:24-alpine AS builder

WORKDIR /app

# Copy monorepo root files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy service package.json
COPY packages/frontend/eb-web-app-events/package.json ./packages/frontend/eb-web-app-events/

# Install dependencies from root
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy service source
COPY packages/frontend/eb-web-app-events/ ./packages/frontend/eb-web-app-events/

WORKDIR /app/packages/frontend/eb-web-app-events

RUN pnpm build

FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/packages/frontend/eb-web-app-events/dist ./dist

EXPOSE 3001

CMD ["npx", "http-server", "dist", "-p", "3001", "--cors"]
