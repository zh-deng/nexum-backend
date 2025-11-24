# Stage 1: Build
# This stage installs dependencies and builds the application
FROM node:22-slim AS builder
WORKDIR /app

# Install pnpm package manager
# We use curl to download and install pnpm version 9.15.0
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=9.15.0 SHELL=/bin/bash sh - && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set pnpm home directory (where pnpm is installed)
ENV PNPM_HOME="/root/.local/share/pnpm"
# Add pnpm to PATH so we can run pnpm commands
ENV PATH="$PNPM_HOME:$PATH"

# Copy dependency files first (package.json, lock file, Prisma schema)
# This allows Docker to cache this layer if dependencies haven't changed
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# Prisma needs DATABASE_URL during generation, even at build time
# We provide a dummy URL since we're just generating types, not connecting to a real DB
ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DATABASE_URL=$DATABASE_URL

# Install ALL dependencies (including dev dependencies needed for build)
# --frozen-lockfile ensures exact versions from pnpm-lock.yaml
# --ignore-scripts skips postinstall scripts (avoids husky errors in containers)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Generate Prisma Client (TypeScript types for database access)
# We do this manually since we skipped install scripts above
RUN npx prisma generate

# Rebuild native dependencies that need to be compiled for the container OS
# bcrypt and msgpackr-extract are native Node.js addons
RUN pnpm rebuild bcrypt msgpackr-extract

# Copy all source code into the container
# Done after installing deps so changes to code don't invalidate dependency cache
COPY . .

# Compile TypeScript to JavaScript and bundle the app
RUN pnpm build

# Stage 2: Runtime
# This stage creates the final production image (smaller, more secure)
FROM node:22-slim
WORKDIR /app

# Install OpenSSL which is required by Prisma to connect to databases
# We keep production dependencies minimal for security and size
RUN apt-get update -y && apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

# Create a non-root user to run the application
# Running as non-root is a security best practice
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy package files
COPY package.json pnpm-lock.yaml ./
# Copy Prisma schema and config (needed for runtime and Prisma v7)
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install pnpm in the runtime stage (needed to install production dependencies)
# We install curl, use it to get pnpm, then remove curl to keep image small
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=9.15.0 SHELL=/bin/bash sh - && \
    apt-get remove -y curl && apt-get autoremove -y && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set pnpm home directory
ENV PNPM_HOME="/root/.local/share/pnpm"
# Add pnpm to PATH so we can run pnpm commands
ENV PATH="$PNPM_HOME:$PATH"

# Provide dummy DATABASE_URL for generate step
ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DATABASE_URL=$DATABASE_URL

# Install ONLY production dependencies (no dev dependencies like TypeScript, testing tools)
# --prod flag excludes devDependencies, making the final image smaller
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Install dotenv which is needed for prisma.config.ts to load environment variables
RUN pnpm add dotenv

# Rebuild native dependencies for the production container
RUN pnpm rebuild bcrypt msgpackr-extract

# Generate Prisma Client again in the runtime image
# (needed because node_modules was reinstalled with --prod only)
RUN npx prisma generate

# Copy the compiled JavaScript from the builder stage
# --chown sets ownership to nestjs user (avoids permission issues)
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copy the entrypoint script that runs migrations before starting the app
# --chown ensures the nestjs user can execute it
COPY --chown=nestjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Switch to non-root user for security
# All subsequent commands and the app will run as this user
USER nestjs

# Document that the app listens on port 3000
EXPOSE 3000

# Set environment to production (enables optimizations, disables debug features)
ENV NODE_ENV=production

# Entrypoint runs migrations, then executes the CMD
ENTRYPOINT ["./docker-entrypoint.sh"]
# Start the NestJS application
CMD ["node", "dist/src/main"]