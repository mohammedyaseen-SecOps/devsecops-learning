# GRC Platform - Backend API

Enterprise-grade Node.js/Express API for the multi-tenant SaaS GRC (Governance, Risk, and Compliance) platform.

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18
- **Language:** TypeScript 5.1
- **Database:** PostgreSQL with Sequelize ORM
- **Cache:** Redis
- **Authentication:** JWT + Passport.js (OAuth2/SAML ready)
- **Validation:** Joi
- **Logging:** Winston
- **Task Queue:** Kafka/Bull (to be implemented)
- **Search:** Elasticsearch (to be implemented)

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration management
│   ├── middleware/       # Express middleware
│   │   ├── errorHandler.ts
│   │   ├── requestLogger.ts
│   │   └── (auth, rbac, audit logging)
│   ├── routes/          # API route handlers
│   ├── controllers/     # Business logic
│   ├── services/        # Service layer
│   ├── models/          # Database models (Sequelize)
│   ├── migrations/      # Database migrations
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Utility functions
│   │   └── logger.ts
│   ├── app.ts           # Express app factory
│   └── index.ts         # Server entry point
├── logs/                # Application logs
├── tests/               # Unit & integration tests
├── .env.example         # Environment variables template
├── .env.development     # Development configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Redis 6+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Copy template
   cp .env.example .env.development
   
   # Edit for your environment
   nano .env.development
   ```

4. **Database setup**
   ```bash
   # Create PostgreSQL database
   createdb grc_master_dev
   
   # Run migrations (when available)
   npm run db:migrate
   
   # Seed sample data (when available)
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Server will start on `http://localhost:3000`

## Available Scripts

### Development
```bash
# Start with hot reload
npm run dev

# Start with debug logging
npm run dev:debug

# Type check
npm run type-check
```

### Testing
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### Database
```bash
# Run migrations
npm run db:migrate

# Rollback migrations
npm run db:migrate:undo

# Seed database
npm run db:seed

# Reset database (dev only)
npm run db:reset
```

### Production
```bash
# Build TypeScript
npm run build

# Start production server
npm start

# Run with PM2
npm run start:pm2
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Security audit
npm audit

# Dependency check
npm outdated
```

## API Documentation

### Base URL
- Development: `http://localhost:3000`
- Production: `https://api.grc-platform.com`

### API Version
- Current: `v1`
- Endpoint prefix: `/api/v1`

### Endpoints Overview

```
Health & Status
  GET  /health                    # Health check
  GET  /health/live              # Liveness probe
  GET  /health/ready             # Readiness probe

Authentication
  POST /api/v1/auth/login        # Login user
  POST /api/v1/auth/logout       # Logout user
  POST /api/v1/auth/refresh      # Refresh token

Users
  GET  /api/v1/users             # List users
  POST /api/v1/users             # Create user
  GET  /api/v1/users/:id         # Get user
  PUT  /api/v1/users/:id         # Update user
  DELETE /api/v1/users/:id       # Delete user

Roles & Permissions
  GET  /api/v1/roles             # List roles
  POST /api/v1/roles             # Create role
  GET  /api/v1/roles/:id         # Get role
  PUT  /api/v1/roles/:id         # Update role
  DELETE /api/v1/roles/:id       # Delete role

Tenants
  GET  /api/v1/tenants           # List tenants (admin)
  POST /api/v1/tenants           # Create tenant
  GET  /api/v1/tenants/:id       # Get tenant
  PUT  /api/v1/tenants/:id       # Update tenant
  DELETE /api/v1/tenants/:id     # Delete tenant

Modules
  GET  /api/v1/modules           # List enabled modules
  GET  /api/v1/modules/:id       # Get module config
  PUT  /api/v1/modules/:id       # Update module config
```

## Authentication

### JWT Tokens
- Access token: Short-lived (default: 24 hours)
- Refresh token: Long-lived (default: 7 days)

### Passing Tokens
```javascript
// In Authorization header (Bearer token)
Authorization: Bearer <access_token>

// Correlation ID for tracing
X-Correlation-ID: corr-1234567890-xyz
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "timestamp": "2024-03-26T10:30:00Z",
    "path": "/api/v1/users",
    "requestId": "12345-abcde"
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` (400): Invalid request data
- `AUTHENTICATION_ERROR` (401): Missing or invalid credentials
- `AUTHORIZATION_ERROR` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `INTERNAL_ERROR` (500): Server error

## Security

### Headers
- `Helmet.js` for security headers
- CORS enabled for whitelisted origins
- Content Security Policy (CSP)

### Rate Limiting
- Production: 1,000 requests per 15 minutes
- Development: 10,000 requests per 15 minutes
- Speed limiting: 500ms delay after 100 requests

### Encryption
- Sensitive data encrypted with AES-256-GCM
- Passwords hashed with bcryptjs (salt rounds: 10)
- JWT signing with HS256

### Database
- Row-Level Security (RLS) enabled
- Multi-tenant data isolation (schema-per-tenant)
- Audit logging for all data changes

## Logging

Logs are written to:
- **Console:** Real-time development feedback
- **Logs/combined.log:** All logs
- **Logs/error.log:** Errors only
- **Logs/critical.log:** Production critical errors

### Log Levels
- `debug`: Development/troubleshooting
- `info`: General information
- `warn`: Warning messages
- `error`: Errors
- `fatal`: Critical failures

## Configuration

### Environment Variables

See `.env.example` for all available configuration options.

Key configurations:
- `NODE_ENV`: Environment (development/staging/production)
- `DB_*`: Database connection
- `REDIS_*`: Cache connection
- `JWT_SECRET`: JWT signing key
- `ENCRYPTION_KEY`: Data encryption key
- `CORS_ORIGINS`: Allowed origin domains

## Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and test**
   ```bash
   npm run type-check
   npm test
   npm run lint
   ```

3. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature
   ```

## Deployment

### Docker

Build and run container:
```bash
docker build -t grc-platform-api .
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=postgres \
  grc-platform-api
```

### Kubernetes

Deploy to K8s cluster:
```bash
kubectl apply -f infrastructure/k8s/app-deployment.yaml
```

### CI/CD

GitHub Actions pipeline available in `.github/workflows/`

## Monitoring & Observability

### Metrics
- Prometheus metrics at `/metrics` (production)

### Logging
- Structured JSON logs in production
- Correlation IDs for request tracing

### Health Checks
- Liveness probe: `/health/live`
- Readiness probe: `/health/ready`

## Testing

### Unit Tests
```bash
npm test -- --testPathPattern=services
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql -h localhost -U postgres -d grc_master_dev

# Check migrations
npm run db:migrate:status
```

### Redis Connection Issues
```bash
# Test connection
redis-cli ping
```

### Port Already in Use
```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

## Contributing

1. Follow TypeScript strict mode
2. Maintain 80%+ test coverage
3. Use ESLint + Prettier formatting
4. Write meaningful commit messages
5. Update documentation

## Support

- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Email:** support@grc-platform.com

## License

© 2024 GRC Platform. All rights reserved.

---

**Last Updated:** March 26, 2024  
**API Version:** v1  
**Status:** Active Development (Backend Foundation Phase)
