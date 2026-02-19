FROM node:24-alpine

WORKDIR /app

# Copy monorepo root files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy service package.json
COPY packages/backend/eb-api-gateway/package.json ./packages/backend/eb-api-gateway/

# Install dependencies from root
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy service source
COPY packages/backend/eb-api-gateway/ ./packages/backend/eb-api-gateway/

WORKDIR /app/packages/backend/eb-api-gateway

RUN pnpm build

EXPOSE 4000

CMD ["pnpm", "start"]
