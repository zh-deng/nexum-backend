# Stage 1: Build
FROM node:22-slim AS builder
WORKDIR /app

COPY . .

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN npx prisma generate

# Build NestJS app
RUN pnpm build

# Stage 2: Runtime
FROM node:22-slim
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy Prisma schema (needed for runtime)
COPY prisma ./prisma

# Remove Husky scripts safely
RUN apt-get update && apt-get install -y jq && \
    jq 'del(.scripts.prepare, .scripts.postinstall)' package.json > temp.json && mv temp.json package.json && \
    apt-get remove -y jq && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile --prod

# Install ts-node and typescript for seeding
RUN pnpm add -D ts-node typescript @types/node

# Generate Prisma client in runtime stage
RUN npx prisma generate

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Copy and make entrypoint script executable
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/src/main"]