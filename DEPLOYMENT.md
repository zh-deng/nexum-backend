# Deploying to Fly.io

## Key Differences from Development

### Development (docker-compose.yml)

- Uses `docker-compose.yml` to run Postgres, Redis, and backend together
- Installs dev dependencies
- Runs as root user
- Hot reload enabled
- Includes test files and development tools

### Production (Fly.io)

- Services are separate (Postgres and Redis are managed Fly.io services)
- Only production dependencies installed
- Runs as non-root user (security)
- Optimized Docker layers for faster builds
- No dev dependencies (smaller image)
- Health checks enabled
- Auto-scaling and monitoring

## What Changed in Dockerfile

1. **Multi-stage build optimization**: Separated dependency installation for better layer caching
2. **Security**: Added non-root user (`nestjs`)
3. **Production dependencies only**: No tsx, typescript, or other dev tools in final image
4. **Removed jq dependency**: Not needed in production
5. **NODE_ENV=production**: Explicitly set
6. **Cleaner layer caching**: Dependencies installed before copying source code

## Deployment Steps

### 1. Install Fly.io CLI

```bash
# Windows (PowerShell)
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### 2. Login to Fly.io

```bash
fly auth login
```

### 3. Create Postgres Database

```bash
fly postgres create --name nexum-postgres --region sin
# Note the connection string
```

### 4. Create Redis

```bash
fly redis create --name nexum-redis --region sin
```

### 5. Configure App Secrets

```bash
fly secrets set DATABASE_URL="postgresql://..." \
  JWT_SECRET="your-secret" \
  REDIS_HOST="nexum-redis.fly.dev" \
  REDIS_PORT="6379" \
  WEB_URL="https://your-frontend.com" \
  MAIL_HOST="smtp.gmail.com" \
  MAIL_PORT="587" \
  MAIL_USER="your-email@gmail.com" \
  MAIL_PASS="your-password" \
  SIGNUP_ACCESS_CODE="your-code"
```

### 6. Deploy

```bash
fly deploy
```

### 7. Check Status

```bash
fly status
fly logs
```

## Important Notes

- **Database URL**: Get from `fly postgres attach` or Fly.io dashboard
- **Redis URL**: Use the internal hostname (ends with `.internal`)
- **Health endpoint**: Make sure you have `/health` endpoint in your NestJS app
- **Migrations**: Run automatically via `release_command` in fly.toml
- **Scaling**: Adjust `min_machines_running` in fly.toml

## Monitoring

```bash
# View logs
fly logs

# SSH into machine
fly ssh console

# Check database
fly postgres connect -a nexum-postgres

# Scale up/down
fly scale count 2
fly scale memory 2048
```

## Rolling Back

```bash
# List releases
fly releases

# Rollback to previous
fly releases rollback
```

## Cost Optimization

- Use `auto_stop_machines = "suspend"` to stop when idle (may increase cold starts)
- Start with 1 machine, scale as needed
- Use shared CPU instances for lower cost
- Monitor usage on Fly.io dashboard
