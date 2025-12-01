# Docker Development Environment

This guide explains how to run AgenticCMS in a fully Dockerized development environment with hot-reloading.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose V2
- Your OpenAI API key

## Quick Start

1. **Create environment file:**
   ```bash
   cp .env.dev .env
   ```

2. **Add your OpenAI API key:**
   Edit `.env` and replace `your_openai_api_key_here` with your actual key:
   ```bash
   OPENAI_API_KEY=sk-...
   ```

3. **Start all services:**
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - Database: postgresql://postgres:postgres@localhost:5432/agenticcms

## What's Included

The development stack includes:

- **PostgreSQL 16** - Database server
- **API Server** - Fastify + Remult backend (port 3001)
- **Web App** - Next.js 14 frontend (port 3000)

All services have **hot-reloading** enabled - changes to your code will automatically restart the servers.

## Common Commands

### Start Services (Foreground)
```bash
docker-compose -f docker-compose.dev.yml up
```

### Start Services (Background)
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f api
docker-compose -f docker-compose.dev.yml logs -f web
```

### Stop Services
```bash
docker-compose -f docker-compose.dev.yml down
```

### Stop Services and Remove Volumes (Clean Slate)
```bash
docker-compose -f docker-compose.dev.yml down -v
```

### Rebuild After Dependency Changes
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

### Run Commands in Containers
```bash
# API container
docker-compose -f docker-compose.dev.yml exec api sh

# Web container
docker-compose -f docker-compose.dev.yml exec web sh

# Database
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d agenticcms
```

## Development Workflow

### Making Code Changes

1. Edit files in your local filesystem
2. Changes are automatically synced to containers via volume mounts
3. Servers automatically restart (hot-reload)
4. Refresh your browser to see changes

### Installing New Dependencies

If you add dependencies to `package.json`:

```bash
# Stop containers
docker-compose -f docker-compose.dev.yml down

# Restart (will run pnpm install automatically)
docker-compose -f docker-compose.dev.yml up
```

Or run pnpm install in the container:
```bash
docker-compose -f docker-compose.dev.yml exec api pnpm install
docker-compose -f docker-compose.dev.yml exec web pnpm install
```

### Database Operations

**Connect to Database:**
```bash
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d agenticcms
```

**Reset Database:**
```bash
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up
```

**Backup Database:**
```bash
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U postgres agenticcms > backup.sql
```

**Restore Database:**
```bash
docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres agenticcms < backup.sql
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Check what's using the ports
lsof -i :3000  # Web app
lsof -i :3001  # API
lsof -i :5432  # PostgreSQL

# Kill the process or change ports in docker-compose.dev.yml
```

### Containers Won't Start

```bash
# View detailed logs
docker-compose -f docker-compose.dev.yml logs

# Rebuild everything from scratch
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up
```

### Hot Reload Not Working

If code changes aren't reflected:

1. Check container logs for errors:
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f api
   ```

2. Restart the specific service:
   ```bash
   docker-compose -f docker-compose.dev.yml restart api
   ```

3. Rebuild if needed:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

### Permission Issues

If you encounter permission errors with node_modules or files:

```bash
# Fix ownership (Linux/Mac)
sudo chown -R $USER:$USER .

# Or run containers with your user ID
# Add to docker-compose.dev.yml under each service:
user: "${UID}:${GID}"
```

### Slow Performance on Mac/Windows

Docker volume mounts can be slow on Mac/Windows. The setup uses named volumes for `node_modules` to improve performance, but if you still experience issues:

1. **Use Docker Desktop with VirtioFS** (Mac)
2. **Allocate more resources** to Docker Desktop (Settings → Resources)
3. **Consider using native development** (without Docker) if performance is critical

## Environment Variables

### Required Variables (.env)

```bash
OPENAI_API_KEY=sk-...              # Your OpenAI API key
JWT_SECRET=<min-32-chars>          # For JWT token signing
```

### Optional Variables

```bash
# Database (defaults shown)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/agenticcms

# Ports
# API_PORT=3001
# WEB_PORT=3000
# DB_PORT=5432
```

## Architecture

### Volume Mounts

- **Source Code:** `./` → `/app` (bi-directional sync)
- **node_modules:** Named volumes (performance optimization)
- **Database:** Named volume for persistence

### Networks

All services communicate via the `agenticcms-network` bridge network:
- Containers can access each other by service name (e.g., `postgres`, `api`)
- Host machine accesses via `localhost`

### Startup Sequence

1. **PostgreSQL** starts and runs health checks
2. **API** waits for healthy database, then:
   - Installs dependencies
   - Builds core package
   - Starts dev server
3. **Web** waits for API, then:
   - Installs dependencies
   - Builds core package
   - Starts dev server

## Production vs Development

| Feature | Development (`docker-compose.dev.yml`) | Production (`docker-compose.yml`) |
|---------|---------------------------------------|----------------------------------|
| Base Image | `node:20-alpine` | Custom Dockerfile |
| Source Code | Volume mount | Copied to image |
| Hot Reload | ✅ Yes | ❌ No |
| Build | On startup | During image build |
| Size | Larger | Optimized |
| Speed | Fast iteration | Fast startup |
| Use Case | Local development | Deployment |

## Tips

1. **Keep containers running** - Faster iteration than stopping/starting
2. **Use logs** - `docker-compose logs -f` to debug issues
3. **Named volumes** - Don't delete volumes unless you need a clean slate
4. **Resource limits** - Add if your machine struggles (see docker-compose docs)

## Next Steps

- [Project README](./README.md) - General project documentation
- [CLAUDE.md](./CLAUDE.md) - AI assistant guide
- [Iteration Docs](./iteration_5.md) - Latest development iteration

## Support

If you encounter issues:
1. Check the logs: `docker-compose -f docker-compose.dev.yml logs`
2. Try rebuilding: `docker-compose -f docker-compose.dev.yml up --build`
3. Clean slate: `docker-compose -f docker-compose.dev.yml down -v && docker-compose -f docker-compose.dev.yml up`
4. Open an issue on GitHub with the error logs
