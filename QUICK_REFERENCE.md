# SAAS GRC Platform - Quick Reference Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Browser (React/Next.js Frontend)                            │   │
│  │  http://localhost:3000                                       │   │
│  │  - Dashboard                                                  │   │
│  │  - Auth Pages (Login/Signup)                                 │   │
│  │  - Module UIs                                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ HTTPS/HTTP
                                 │ /api/*
┌────────────────────────────────▼────────────────────────────────────┐
│                        API LAYER                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Express.js Backend API                                      │   │
│  │  http://localhost:3001/api/v1                                │   │
│  │                                                               │   │
│  │  Routes:                                                     │   │
│  │  ├── /auth (login, refresh, logout, me)                     │   │
│  │  ├── /users (CRUD + search + stats)                         │   │
│  │  ├── /roles (CRUD + permissions)                            │   │
│  │  ├── /tenants (CRUD + modules + subscription)               │   │
│  │  ├── /modules (module management)                           │   │
│  │  └── /health (health checks)                                │   │
│  │                                                               │   │
│  │  Middleware:                                                │   │
│  │  ├── Authentication (JWT)                                   │   │
│  │  ├── RBAC (Permission checking)                             │   │
│  │  ├── Error Handling                                         │   │
│  │  ├── Request Logging                                        │   │
│  │  ├── Rate Limiting                                          │   │
│  │  └── Audit Logging                                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────┘
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌────────▼──────┐   ┌────────────▼────────┐   ┌─────────▼─────────┐
│  DATABASE     │   │  CACHE              │   │  MESSAGE QUEUE    │
│               │   │                     │   │                   │
│  PostgreSQL   │   │  Redis              │   │  (Optional)       │
│  :5432        │   │  :6379              │   │  - Kafka          │
│               │   │                     │   │  - RabbitMQ       │
│  - Tenants    │   │  - Sessions         │   │                   │
│  - Users      │   │  - Tokens           │   │  - Events         │
│  - Roles      │   │  - Cache            │   │  - Notifications  │
│  - Audit Log  │   │  - Locks            │   │  - Async Jobs     │
│  - Modules    │   │                     │   │                   │
└───────────────┘   └─────────────────────┘   └───────────────────┘
```

---

## Data Flow

### Authentication Flow
```
1. USER LOGIN
   └─> Frontend: POST /api/v1/auth/login
       └─> Backend: Validates credentials
           └─> Generate JWT tokens
               └─> Return tokens + user info
                   └─> Frontend: Store in localStorage + Redux
                       └─> Redirect to /dashboard
```

### API Request Flow
```
1. FRONTEND REQUEST
   └─> Include token: Authorization: Bearer <token>
       └─> BACKEND MIDDLEWARE
           ├─> Authentication: Verify JWT
           ├─> RBAC: Check permissions
           ├─> Audit Logging: Log action
           └─> Route Handler
               └─> Controller: Parse request
                   └─> Service: Business logic
                       └─> Database: CRUD operations
                           └─> Response: Return data
                               └─> Frontend: Process response
```

---

## File Organization

### Backend Structure
```
backend/
├── src/
│   ├── index.ts                    # Server entry point
│   ├── app.ts                      # Express app factory
│   ├── config/
│   │   └── index.ts               # Config management
│   ├── routes/                     # API endpoints
│   │   ├── health.ts
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── roles.ts
│   │   ├── tenants.ts
│   │   └── modules.ts
│   ├── controllers/                # Route handlers
│   │   ├── AuthController.ts
│   │   ├── UserController.ts
│   │   ├── RoleController.ts
│   │   └── TenantController.ts
│   ├── services/                   # Business logic
│   │   ├── AuthService.ts
│   │   ├── UserService.ts
│   │   ├── RoleService.ts
│   │   └── TenantService.ts
│   ├── models/                     # Database models
│   │   ├── index.ts               # Sequelize instance
│   │   ├── User.ts
│   │   ├── Role.ts
│   │   ├── Permission.ts
│   │   └── Tenant.ts
│   ├── middleware/                 # Express middleware
│   │   ├── authentication.ts      # JWT verification
│   │   ├── rbac.ts                # Permission checking
│   │   ├── errorHandler.ts        # Error handling
│   │   ├── auditLogging.ts        # Audit trail
│   │   └── requestLogger.ts       # Request logging
│   ├── utils/                      # Utilities
│   │   ├── jwt.ts                 # JWT utilities
│   │   ├── logger.ts              # Logging
│   │   ├── validation.ts          # Input validation
│   │   ├── password.ts            # Password hashing
│   │   └── database.ts            # DB utilities
│   ├── types/                      # TypeScript interfaces
│   │   └── index.ts
│   ├── migrations/                 # DB migrations
│   │   └── 001-initial-schema.ts
│   └── cli/                        # CLI commands
│       ├── migrate.ts
│       └── seed.ts
├── package.json
├── tsconfig.json
└── .env.development               # Development config
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app/                        # Next.js app router
│   │   ├── layout.tsx             # Root layout
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Dashboard page
│   │   └── auth/
│   │       ├── login/
│   │       │   └── page.tsx
│   │       ├── signup/
│   │       │   └── page.tsx
│   │       └── forgot-password/
│   │           └── page.tsx
│   ├── components/                 # Reusable components
│   │   ├── Providers.tsx           # Redux + Theme
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Badge.tsx
│   ├── store/                      # Redux store
│   │   ├── index.ts               # Store config
│   │   ├── authSlice.ts           # Auth state
│   │   └── uiSlice.ts             # UI state
│   ├── api/                        # API client
│   │   ├── client.ts              # Axios instance
│   │   └── auth.ts                # Auth endpoints
│   ├── lib/                        # Utilities
│   │   └── auth.ts                # Token management
│   ├── styles/                     # Stylesheets
│   │   └── globals.css
│   └── types/                      # TypeScript types
├── public/                         # Static assets
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── .env.local                     # Frontend config
```

---

## Quick Command Reference

### Docker Management
```bash
# Start all services
docker-compose up -d

# View running services
docker-compose ps

# View logs
docker-compose logs -f postgres

# Stop services (keep data)
docker-compose down

# Stop services (remove data)
docker-compose down -v

# Restart specific service
docker-compose restart postgres
```

### Backend Commands
```bash
# Install dependencies
npm install

# Development (watch mode)
npm run dev

# Build TypeScript
npm run build

# Run compiled server
npm start

# Database setup
npm run db:migrate       # Run migrations
npm run db:seed        # Seed test data
npm run db:setup       # Migrate + seed

# Testing
npm test               # Unit tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report

# Code quality
npm run lint           # Lint code
npm run lint:fix       # Auto-fix issues
npm run format         # Format code
npm run type-check     # TypeScript check
```

### Frontend Commands
```bash
# Install dependencies
npm install

# Development (hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Testing
npm test               # Unit tests
npm run test:e2e      # E2E tests
npm run test:e2e:open # E2E with UI

# Code quality
npm run lint           # Lint code
npm run lint:fix       # Auto-fix issues
npm run format         # Format code
npm run type-check     # TypeScript check
```

---

## Environment Variables Reference

### Backend (.env.development)
```env
# Server
NODE_ENV=development
PORT=3001
ENVIRONMENT=development

# API
API_URL=http://localhost:3001
API_PREFIX=/api
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=grc_master_dev
DB_POOL_MAX=5
DB_POOL_MIN=1
DB_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TTL=3600

# JWT
JWT_SECRET=dev-secret-key-not-for-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=dev-refresh-secret-not-for-production
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000000
ENCRYPTION_ALGORITHM=aes-256-gcm

# Logging
LOG_LEVEL=debug
LOG_FORMAT=text
LOG_MAX_FILE_SIZE=20m
LOG_MAX_FILES=3

# Feature Flags
FEATURE_MULTI_TENANT=true
FEATURE_AUDIT_LOGGING=true
FEATURE_ENCRYPTION=true
FEATURE_WEBHOOKS=true
ENABLED_MODULES=ITAM,ITSM,THREAT_INTEL,USER_MANAGEMENT,TICKETING,RISK_REGISTRY,POLICY_ARCHIVE,INCIDENT_RESPONSE,SECURITY_OPS,VULNERABILITY,THIRD_PARTY_RISK,COMPLIANCE
```

### Frontend (.env.local)
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# App
NEXT_PUBLIC_APP_NAME=GRC Platform
NEXT_PUBLIC_APP_VERSION=1.0.0

# Authentication
NEXT_PUBLIC_AUTH_TIMEOUT=1800000
NEXT_PUBLIC_TOKEN_REFRESH_INTERVAL=600000
NEXT_PUBLIC_SSO_ENABLED=true
NEXT_PUBLIC_SAML_ENABLED=false

# UI
NEXT_PUBLIC_THEME_MODE=system

# Demo
NEXT_PUBLIC_DEMO_MODE=true
```

---

## API Endpoints

### Health Check
```
GET /health
GET /health/live
GET /health/ready
```

### Authentication
```
POST   /api/v1/auth/login              - Login
POST   /api/v1/auth/refresh            - Refresh token
POST   /api/v1/auth/logout             - Logout
GET    /api/v1/auth/me                 - Current user
POST   /api/v1/auth/verify-email       - Verify email
POST   /api/v1/auth/forgot-password    - Request password reset
POST   /api/v1/auth/reset-password     - Reset password
```

### Users
```
GET    /api/v1/users                   - List users
POST   /api/v1/users                   - Create user
GET    /api/v1/users/search            - Search users
GET    /api/v1/users/:userId           - Get user
PUT    /api/v1/users/:userId           - Update user
PATCH  /api/v1/users/:userId/status    - Change status
DELETE /api/v1/users/:userId           - Delete user
```

### Roles
```
GET    /api/v1/roles                   - List roles
POST   /api/v1/roles                   - Create role
GET    /api/v1/roles/:roleId           - Get role
PUT    /api/v1/roles/:roleId           - Update role
DELETE /api/v1/roles/:roleId           - Delete role
GET    /api/v1/roles/available-permissions
POST   /api/v1/roles/:roleId/permissions
DELETE /api/v1/roles/:roleId/permissions/:permissionKey
POST   /api/v1/roles/:roleId/clone     - Clone role
```

### Tenants
```
GET    /api/v1/tenants                 - List tenants
POST   /api/v1/tenants                 - Create tenant
GET    /api/v1/tenants/search          - Search tenants
GET    /api/v1/tenants/:tenantId       - Get tenant
GET    /api/v1/tenants/slug/:slug      - Get by slug
PUT    /api/v1/tenants/:tenantId       - Update tenant
DELETE /api/v1/tenants/:tenantId       - Delete tenant
GET    /api/v1/tenants/:tenantId/stats - Tenant stats
POST   /api/v1/tenants/:tenantId/modules/:name/enable
POST   /api/v1/tenants/:tenantId/modules/:name/disable
POST   /api/v1/tenants/:tenantId/subscription/upgrade
```

---

## Database Credentials

### PostgreSQL
- **Host:** localhost
- **Port:** 5432
- **Username:** postgres
- **Password:** postgres
- **Database:** grc_master_dev
- **Access:** Direct or via PgAdmin at http://localhost:5050

### Redis
- **Host:** localhost
- **Port:** 6379
- **Password:** (none)
- **Access:** CLI or via Redis Commander at http://localhost:8081

---

## Troubleshooting Quick Tips

### Server won't start
```bash
# Check if port is in use
lsof -i :3001

# Check environment file
cat backend/.env.development

# Check database connection
psql -h localhost -U postgres -c "SELECT 1"
```

### Database connection fails
```bash
# Verify Docker containers
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Frontend can't connect to API
```bash
# Verify backend is running
curl http://localhost:3001/health

# Check frontend env file
cat frontend/.env.local

# Verify CORS is configured
curl -i http://localhost:3001/health
```

### Port conflicts
```bash
# Find what's using port 3001
netstat -tulpn | grep 3001

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3002
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 300ms |
| Database Query Time (p95) | < 100ms |
| Frontend Load Time | < 3s |
| Lighthouse Score | > 90 |
| Redis Hit Rate | > 85% |
| Cache TTL | 1 hour |
| Connection Pool | 2-10 |
| Rate Limit | 10,000 req/min (dev) |

---

## Security Checklist

- [x] JWT authentication implemented
- [x] RBAC with permission checking
- [x] Password hashing with bcrypt
- [x] CORS configured
- [x] Rate limiting enabled
- [x] Helmet security headers
- [x] Input validation
- [x] Error handling (no stack traces in production)
- [x] Audit logging
- [x] HTTPS ready (use nginx/reverse proxy in production)

---

**Last Updated:** March 29, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
