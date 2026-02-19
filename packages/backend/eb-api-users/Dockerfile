FROM node:24-alpine

WORKDIR /app

# Copy monorepo root files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy service package.json
COPY packages/backend/eb-api-users/package.json ./packages/backend/eb-api-users/

# Install dependencies from root
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

WORKDIR /app/packages/backend/eb-api-users

RUN pnpm build

EXPOSE 4002

CMD ["pnpm", "start"]
