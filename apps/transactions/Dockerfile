# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY nest-cli.json tsconfig.json tsconfig.build.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:22-alpine AS build
WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm && corepack prepare pnpm@latest --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the transactions application
RUN pnpm exec nest build transactions

# Stage 3: Runtime
FROM node:22-alpine AS runtime
WORKDIR /app

# Copy built application and dependencies
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "dist/apps/transactions/main.js"]

