# Frontend - GRC SaaS Platform

A production-ready React/Next.js 14 frontend for the Enterprise GRC SaaS platform with TypeScript, Redux state management, Tailwind CSS styling, and comprehensive UI components.

## 📋 Overview

This frontend application provides a complete dashboard for managing:
- **Users**: User creation, editing, deletion with role assignment
- **Roles**: Role management with permission tracking
- **Tenants**: Multi-tenant account management with subscription plans
- **Authentication**: Secure login with JWT token management and auto-refresh
- **Dashboard**: Real-time analytics and overview widgets

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or npm 9+
- Backend API running on `http://localhost:5000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

The application will be available at `http://localhost:3000`

### Demo Credentials
- **Email**: `admin@demo.com`
- **Password**: `Demo@1234`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js app router
│   │   ├── layout.tsx               # Root layout with providers
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── page.tsx         # Login page
│   │   └── dashboard/
│   │       ├── layout.tsx           # Dashboard wrapper with auth check
│   │       ├── page.tsx             # Dashboard overview
│   │       ├── users/
│   │       │   └── page.tsx         # Users management
│   │       ├── roles/
│   │       │   └── page.tsx         # Roles management
│   │       └── tenants/
│   │           └── page.tsx         # Tenants management
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── Button.tsx              # Button with variants and sizes
│   │   ├── Card.tsx                # Card layout component
│   │   ├── Input.tsx               # Form input with validation
│   │   ├── Badge.tsx               # Status badges
│   │   ├── Modal.tsx               # Modal dialogs
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── Header.tsx              # Top navigation header
│   │   ├── Providers.tsx           # Global context providers
│   │   └── index.ts                # Component exports
│   │
│   ├── store/                       # Redux state management
│   │   ├── index.ts                # Store configuration
│   │   ├── authSlice.ts            # Authentication state
│   │   └── uiSlice.ts              # UI state (sidebar, theme)
│   │
│   ├── api/                         # API client and endpoints
│   │   ├── client.ts               # Axios HTTP client with interceptors
│   │   └── auth.ts                 # Authentication API endpoints
│   │
│   ├── lib/                         # Utility functions
│   │   └── auth.ts                 # Token management functions
│   │
│   └── styles/
│       └── globals.css             # Global Tailwind styles
│
├── public/                          # Static assets
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── next.config.js                   # Next.js configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
└── .env.local                       # Environment variables
```

## 🎨 Components Library

### Button
Customizable button with variants and sizes.

```tsx
import { Button } from '@/components';

<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>
```

**Variants**: `primary`, `secondary`, `danger`, `ghost`
**Sizes**: `sm`, `md`, `lg`
**Props**: `loading`, `fullWidth`, `disabled`

### Card
Container component for content organization.

```tsx
import { Card } from '@/components';

<Card variant="elevated">
  <Card.Header>
    <h2>Title</h2>
  </Card.Header>
  <Card.Body>
    Content goes here
  </Card.Body>
  <Card.Footer>
    Footer content
  </Card.Footer>
</Card>
```

**Variants**: `default`, `elevated`, `outlined`

### Input
Form input with labels, validation, and error states.

```tsx
import { Input } from '@/components';

<Input
  label="Email"
  type="email"
  error={errors.email}
  helperText="We'll never share your email"
  fullWidth
/>
```

### Badge
Status indicators with multiple variants.

```tsx
import { Badge } from '@/components';

<Badge variant="success">Active</Badge>
<Badge variant="danger">Failed</Badge>
```

**Variants**: `primary`, `secondary`, `success`, `warning`, `danger`, `info`

### Modal
Reusable dialog component with backdrop click handling.

```tsx
import { Modal } from '@/components';

<Modal isOpen={isOpen} onClose={handleClose} title="Confirm">
  Content here
</Modal>
```

### Sidebar
Collapsible navigation sidebar.

```tsx
import { Sidebar } from '@/components';

<Sidebar /> // Auto-handles collapsed state from Redux
```

### Header
Top navigation with search, notifications, theme toggle, and user profile.

```tsx
import { Header } from '@/components';

<Header /> // Fetches user from Redux auth state
```

## 🔐 Authentication Flow

1. **Login Page** - User enters credentials
2. **API Call** - Credentials sent to backend `/auth/login`
3. **Token Storage** - Access and refresh tokens stored in localStorage
4. **Redux Update** - Auth state updated with user data
5. **Redirect** - User redirected to dashboard
6. **Auto Refresh** - Axios interceptor handles token refresh on 401
7. **Protected Routes** - Dashboard layout checks authentication before rendering

### Environment Variables

Create `.env.local` from `.env.example`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# App Configuration
NEXT_PUBLIC_APP_NAME=GRC Platform
NEXT_PUBLIC_APP_VERSION=1.0.0

# Auth Configuration
NEXT_PUBLIC_AUTH_TIMEOUT=3600000      # 1 hour in ms
NEXT_PUBLIC_REFRESH_TIMEOUT=604800000 # 7 days in ms

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_FEEDBACK=false

# Theme
NEXT_PUBLIC_DEFAULT_THEME=system      # light, dark, system
```

## 🎭 Dark Mode Support

The application uses `next-themes` for dark mode support:

```tsx
// Toggle theme
const { theme, setTheme } = useTheme();
setTheme(theme === 'dark' ? 'light' : 'dark');
```

## 📊 State Management (Redux)

### Authentication State
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenExpiresAt: number | null;
}
```

### UI State
```typescript
interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}
```

## 🔄 API Client

The Axios-based API client includes:
- Request interceptor for adding JWT tokens
- Response interceptor for handling 401 errors
- Automatic token refresh logic
- Request queuing during token refresh

```typescript
// Usage
import { authAPI } from '@/api/auth';

const user = await authAPI.login({ email, password });
const currentUser = await authAPI.getCurrentUser();
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📄 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

## 🎯 Design System

### Colors
The application uses a custom Tailwind color palette with:
- **Primary**: Blue gradient (50-900 shades)
- **Dark**: Dark theme colors (800-900 for dark mode)

### Typography
- **Headings**: Bold, with responsive sizing
- **Body**: Regular weight, consistent line height
- **Captions**: Small, secondary text

### Spacing
Uses Tailwind's default 4px spacing scale (1 = 4px)

### Responsive Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 🚀 Deployment

### Docker

```dockerfile
# Build
docker build -t grc-frontend .

# Run
docker run -p 3000:3000 grc-frontend
```

### Vercel

```bash
vercel deploy
```

### AWS S3 + CloudFront

```bash
npm run build
aws s3 sync out s3://bucket-name
```

## 📚 Next Steps

1. **Module Pages** - Create UI pages for all 12 GRC modules
2. **Integration Tests** - Add integration tests with Jest
3. **E2E Tests** - Add Cypress E2E tests
4. **Performance** - Implement code splitting and lazy loading
5. **Analytics** - Add event tracking and analytics
6. **Documentation** - Storybook component documentation

## 🤝 Contributing

1. Follow TypeScript strict mode guidelines
2. Use Tailwind CSS for styling (no CSS files)
3. Create reusable components
4. Write tests for all features
5. Keep components under 300 lines

## 📝 License

Proprietary - Enterprise GRC SaaS Platform

## 🆘 Support

For issues or questions:
- Check documentation in `/docs`
- Review API specification in `/docs/api/API_SPEC.md`
- Check backend setup in `/backend/README.md`

---

**Last Updated**: March 2026
**Next Phase**: Integration Testing & E2E Tests
