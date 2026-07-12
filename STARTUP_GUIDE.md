# SAAS GRC Platform - Startup Guide

## Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL (via Docker)
- Redis (via Docker)

### Step 1: Start Docker Services (Database + Redis)

```bash
# From project root
docker-compose up -d

# Verify services are running
docker-compose ps

# Expected services:
# - postgres (port 5432) - Main database
# - redis (port 6379) - Cache
# - pgadmin (port 5050) - Database UI
# - redis-commander (port 8081) - Redis UI
```

**Access Management UIs:**
- PgAdmin: http://localhost:5050 (admin@grc-platform.local / admin)
- Redis Commander: http://localhost:8081

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Initialize Database

```bash
# Run migrations and seed data
npm run db:setup

# Or separately:
# npm run db:migrate        # Run migrations
# npm run db:seed          # Seed data
```

### Step 4: Start Backend Server

```bash
# From backend directory
npm run dev

# Expected output:
# ✓ Master database connection established
# ✓ Model associations defined
# ✓ Database synchronized
# ✓ Server is running on port 3001
# ✓ API URL: http://localhost:3001/api/v1
```

**Health Check:**
```bash
curl http://localhost:3001/health
```

### Step 5: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 6: Start Frontend Server

```bash
# From frontend directory
npm run dev

# Expected output:
# ▲ Next.js 14.0.0
# - Local: http://localhost:3000
```

### Step 7: Access the Application

Open browser to: **http://localhost:3000**

**Demo Credentials:**
- Email: `demo@grc-platform.local`
- Password: `demo`

---

## Configuration Files

### Backend Configuration
- **Port:** 3001 (configured in `.env.development`)
- **Database:** PostgreSQL at localhost:5432
- **Database Name:** grc_master_dev
- **User:** postgres / postgres

### Frontend Configuration  
- **Port:** 3000
- **API URL:** http://localhost:3001/api
- **Demo Mode:** Enabled (uses mock auth)

### Environment Variables

**Backend (.env.development already set up):**
```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=grc_master_dev
DB_USER=postgres
DB_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Frontend (.env.local already set up):**
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_DEMO_MODE=true
```

---

## Troubleshooting

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### "Port 3001 already in use"
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in backend/.env.development
PORT=3002
```

### "Cannot connect to Redis"
```bash
# Check Redis container
docker-compose logs redis

# Restart Redis
docker-compose restart redis
```

### "Next.js build fails"
```bash
cd frontend
npm install
npm run build
```

### "Dependencies not installing"
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## Development Workflow

### Running Tests

**Backend:**
```bash
cd backend
npm test              # Run unit tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

**Frontend:**
```bash
cd frontend
npm test              # Run unit tests
npm run test:e2e     # End-to-end tests
```

### Code Quality

**Linting:**
```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint
```

**Type Checking:**
```bash
# Backend
cd backend && npm run type-check

# Frontend
cd frontend && npm run type-check
```

**Formatting:**
```bash
# Backend
cd backend && npm run format

# Frontend
cd frontend && npm run format
```

---

## Database Management

### PgAdmin Web Interface
http://localhost:5050

1. Login with: admin@grc-platform.local / admin
2. Register PostgreSQL server:
   - Host: postgres
   - Port: 5432
   - Username: postgres
   - Password: postgres

### Command Line

```bash
# Connect to PostgreSQL
psql -h localhost -U postgres -d grc_master_dev

# Run SQL migrations
psql -h localhost -U postgres -d grc_master_dev < infrastructure/db/init-db.sql

# Backup database
pg_dump -h localhost -U postgres grc_master_dev > backup.sql

# Restore database
psql -h localhost -U postgres grc_master_dev < backup.sql
```

---

## API Documentation

### Health Check
```bash
curl http://localhost:3001/health
```

### Authentication
```bash
# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@grc-platform.local","password":"demo"}'

# Get current user
curl http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Sample API Endpoints
- GET `/api/v1/health` - Health check
- POST `/api/v1/auth/login` - User login
- POST `/api/v1/auth/refresh` - Refresh token
- GET `/api/v1/auth/me` - Current user
- GET `/api/v1/users` - List users
- POST `/api/v1/users` - Create user
- GET `/api/v1/tenants` - List tenants
- POST `/api/v1/tenants` - Create tenant
- GET `/api/v1/roles` - List roles

---

## Stopping Services

### Stop All Services
```bash
# Stop Docker containers (keeps data)
docker-compose down

# Stop and remove volumes (clears data)
docker-compose down -v

# Stop backend server
# Ctrl+C in terminal running `npm run dev`

# Stop frontend server
# Ctrl+C in terminal running `npm run dev`
```

---

## Project Structure

```
d:\SAAS GRC\
├── backend/                  # Node.js/Express API
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── controllers/      # Route handlers
│   │   ├── services/         # Business logic
│   │   ├── models/           # Database models
│   │   ├── middleware/       # Express middleware
│   │   ├── utils/            # Utilities
│   │   └── types/            # TypeScript types
│   ├── package.json
│   └── .env.development
├── frontend/                 # React/Next.js UI
│   ├── src/
│   │   ├── app/              # Next.js app router
│   │   ├── components/       # React components
│   │   ├── store/            # Redux store
│   │   ├── api/              # API client
│   │   ├── lib/              # Utilities
│   │   └── styles/           # CSS
│   ├── package.json
│   └── .env.local
├── docker-compose.yml        # Docker services
├── infrastructure/           # IaC and deployment
└── docs/                    # Documentation
```

---

## Next Steps

1. **Explore the UI:** Navigate the dashboard at http://localhost:3000
2. **Review API:** Check health endpoint and API docs
3. **Database:** View tables in PgAdmin
4. **Code:** Examine backend routes and frontend components
5. **Develop:** Start building features on this solid foundation

---

## Support

For issues or questions, check:
- `/docs` - Comprehensive documentation
- `.env.example` - Configuration reference
- Backend logs: See console output from `npm run dev`
- Frontend logs: Check browser console (F12)

---

**Status:** ✅ Ready for Development

Created: March 2026
Last Updated: March 29, 2026
