# Stage 1: Build
FROM node:22-slim AS builder
WORKDIR /app

# Install pnpm using standalone script with SHELL set
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=9.15.0 SHELL=/bin/bash sh - && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY . .
RUN pnpm install --frozen-lockfile
# Generate Prisma client
RUN npx prisma generate
# Build NestJS app
RUN pnpm build

# Stage 2: Runtime
FROM node:22-slim
WORKDIR /app

# Install OpenSSL AND curl for Prisma and pnpm installation
RUN apt-get update -y && apt-get install -y openssl curl jq && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json pnpm-lock.yaml ./
# Copy Prisma schema (needed for runtime)
COPY prisma ./prisma

# Remove Husky scripts safely (jq is already installed above)
RUN jq 'del(.scripts.prepare, .scripts.postinstall)' package.json > temp.json && mv temp.json package.json

# Install pnpm using standalone script with SHELL set
RUN curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=9.15.0 SHELL=/bin/bash sh -

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install dependencies
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