# Architecture Documentation

## Overview

The Review Platform is a full-stack web application built with Next.js 14, TypeScript, and PostgreSQL. It allows students to browse companies, read and write internship reviews, with features for moderation, voting, and reporting.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Browser    │  │   Mobile     │  │   API        │     │
│  │   (React)    │  │   (Future)   │  │   Clients    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   App Router │  │   API Routes │  │  Middleware  │     │
│  │   (Pages)    │  │   (REST)     │  │  (Auth/RBAC) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Prisma     │  │     Redis    │  │    Sentry    │
│   (Postgres) │  │   (Upstash)  │  │  (Monitoring)│
└──────────────┘  └──────────────┘  └──────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: React Context (via NextAuth SessionProvider)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon/Supabase)
- **Authentication**: NextAuth.js
- **Session Strategy**: JWT

### Infrastructure
- **Hosting**: Vercel (web application)
- **Database**: Neon.tech (PostgreSQL)
- **Caching & Rate Limiting**: Upstash Redis
- **Error Tracking**: Sentry
- **CI/CD**: GitHub Actions

## Project Structure

```
/
├── app/                          # Next.js App Router
│   ├── (public)/                # Public route group
│   │   ├── page.tsx            # Homepage
│   │   ├── companies/          # Company listing and detail pages
│   │   ├── reviews/            # Review listing page
│   │   └── request-company/    # Company request form
│   ├── (auth)/                 # Auth route group
│   │   └── login/              # Login and registration page
│   ├── admin/                  # Admin dashboard routes
│   │   ├── reviews/           # Review moderation
│   │   ├── reports/           # Report management
│   │   └── requests/          # Company request management
│   ├── api/                    # API routes
│   │   ├── auth/              # NextAuth endpoints
│   │   ├── companies/         # Company CRUD operations
│   │   ├── reviews/           # Review CRUD operations
│   │   ├── company-requests/  # Company request endpoints
│   │   ├── admin/             # Admin-only endpoints
│   │   ├── notifications/     # Notification endpoints
│   │   └── health/            # Health check endpoint
│   ├── me/                     # User profile routes
│   │   └── reviews/           # User's review history
│   ├── test-sentry/           # Sentry testing page
│   ├── layout.tsx             # Root layout
│   ├── error.tsx              # Error boundary
│   └── global-error.tsx       # Global error boundary
│
├── components/                 # React components
│   ├── ui/                    # shadcn/ui components
│   ├── reviews/               # Review-related components
│   ├── companies/             # Company-related components
│   ├── admin/                 # Admin dashboard components
│   ├── navigation/            # Navigation components
│   └── providers.tsx         # Context providers
│
├── lib/                        # Utility libraries
│   ├── prisma.ts              # Prisma client singleton
│   ├── auth.ts                # NextAuth configuration
│   ├── session.ts             # Session helpers
│   ├── redis.ts               # Redis client
│   ├── ratelimit.ts           # Rate limiters
│   ├── rate-limit-middleware.ts # Rate limiting middleware
│   ├── cache.ts               # Caching utilities
│   ├── company-stats.ts       # Company statistics helpers
│   ├── audit.ts                # Audit logging
│   ├── notifications.ts        # Notification helpers
│   ├── middleware-helpers.ts   # Middleware utilities
│   ├── validation.ts           # Zod schemas
│   └── utils.ts               # General utilities
│
├── prisma/                     # Database
│   ├── schema.prisma          # Prisma schema
│   └── migrations/             # Database migrations
│
├── scripts/                    # Utility scripts
│   ├── check-users.ts         # User listing script
│   ├── test-redis.ts          # Redis connection test
│   └── test-sentry-api.ts     # Sentry API test
│
├── instrumentation.ts          # Next.js instrumentation (server/edge)
├── instrumentation-client.ts   # Client-side instrumentation
├── middleware.ts               # Next.js middleware
├── next.config.js              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── tailwind.config.ts         # TailwindCSS configuration
```

## Database Schema

### Core Models

#### User
- Stores user account information
- Supports both OAuth (Google) and credentials (email/password) authentication
- Roles: USER, ADMIN
- Includes profile fields: school, gradYear, major

#### Company
- Company information with cached statistics
- Denormalized fields: reviewCount, avgDifficulty, lastReviewAt
- Indexed by: slug, industry, hqLocation

#### Review
- Internship review with moderation workflow
- Status: PENDING, APPROVED, REJECTED, REMOVED, NEEDS_EDIT
- Includes interview details, compensation, and narrative sections
- Cached helpfulScore for sorting

#### ReviewVote
- Helpful votes on reviews
- One vote per user per review (enforced by unique constraint)

#### ReviewReport
- User reports on reviews
- Status: OPEN, DISMISSED, RESOLVED
- Admin can take action or dismiss

#### CompanyRequest
- User requests for new companies
- Status: PENDING, APPROVED, REJECTED
- Creates Company record when approved

### NextAuth Models
- **Account**: OAuth provider accounts
- **Session**: User sessions
- **VerificationToken**: Email verification tokens

### Supporting Models
- **Tag**: Tags for companies and reviews
- **CompanyTag**: Many-to-many relationship
- **ReviewTag**: Many-to-many relationship
- **AuditLog**: Admin action audit trail
- **Notification**: User notifications

## Authentication & Authorization

### Authentication Flow

1. **Google OAuth**:
   - User clicks "Sign in with Google"
   - Redirected to Google OAuth consent screen
   - Google redirects back with authorization code
   - NextAuth exchanges code for user info
   - User created/updated in database via PrismaAdapter

2. **Email/Password**:
   - User registers with email and password
   - Password hashed with bcryptjs (10 rounds)
   - User created in database
   - User signs in with credentials
   - NextAuth validates credentials and creates session

### Session Management
- **Strategy**: JWT (JSON Web Tokens)
- **Storage**: HTTP-only cookies
- **Expiration**: Configured via NextAuth
- **Token Contents**: userId, email, role

### Authorization
- **Middleware**: Protects routes based on authentication and role
- **Public Routes**: `/`, `/companies`, `/reviews`, `/login`, `/api/auth`
- **User Routes**: `/me/*`, `/reviews/new`, `/reviews/[id]/edit`
- **Admin Routes**: `/admin/*`, `/api/admin/*`
- **RBAC**: Role-based access control enforced in middleware and API routes

## API Architecture

### RESTful API Design

All API routes follow REST conventions:
- `GET /api/resource` - List resources
- `GET /api/resource/[id]` - Get single resource
- `POST /api/resource` - Create resource
- `PUT/PATCH /api/resource/[id]` - Update resource
- `DELETE /api/resource/[id]` - Delete resource

### API Route Structure

```
/api
├── auth/
│   ├── [...nextauth]          # NextAuth endpoints
│   └── register               # User registration
├── companies/
│   └── route.ts               # List companies (with search/filter)
├── reviews/
│   ├── route.ts               # List/create reviews
│   └── [id]/
│       ├── route.ts           # Get/update/delete review
│       ├── vote/              # Vote on review
│       └── report/            # Report review
├── company-requests/
│   ├── route.ts               # List/create requests
│   └── [id]/route.ts          # Get/update request
├── admin/
│   ├── reviews/
│   │   ├── route.ts           # List reviews (admin)
│   │   └── [id]/
│   │       ├── approve/       # Approve review
│   │       └── reject/        # Reject review
│   └── reports/
│       ├── route.ts           # List reports
│       └── [id]/
│           ├── dismiss/       # Dismiss report
│           └── action/        # Take action on report
└── health/
    └── route.ts               # Health check
```

### Request/Response Flow

1. **Request** → Middleware (authentication/authorization)
2. **Middleware** → API Route Handler
3. **Handler** → Rate Limiting Check
4. **Handler** → Input Validation (Zod)
5. **Handler** → Business Logic
6. **Handler** → Database Operations (Prisma)
7. **Handler** → Cache Update (Redis, if applicable)
8. **Handler** → Response

## Rate Limiting

Rate limiting is implemented using Upstash Redis with sliding window algorithm:

- **General API**: 10 requests per 10 seconds
- **Review Submission**: 3 reviews per minute
- **Report Submission**: 5 reports per hour
- **Company Request**: 2 requests per hour

Rate limiters use user ID (if authenticated) or IP address as identifier.

## Caching Strategy

### Redis Caching
- **Purpose**: Reduce database load and improve response times
- **Cache Keys**: Structured with prefixes (e.g., `company:${id}`, `reviews:${companyId}`)
- **TTL**: Default 1 hour, configurable per cache entry
- **Cache Invalidation**: Manual invalidation on updates

### Next.js Caching
- **Static Generation**: Homepage revalidates every hour
- **Dynamic Routes**: Force dynamic rendering for API routes using searchParams/headers

## Error Handling

### Client-Side
- **Error Boundaries**: `error.tsx` and `global-error.tsx`
- **Sentry Integration**: Automatic error capture with context

### Server-Side
- **API Routes**: Try-catch blocks with appropriate HTTP status codes
- **Sentry Integration**: Server-side error tracking
- **Validation Errors**: Zod validation with detailed error messages

### Error Tracking
- **Sentry**: Integrated for both client and server
- **Error Types**: Exceptions, messages, breadcrumbs
- **Session Replay**: Enabled for error sessions
- **Source Maps**: Uploaded for production debugging

## Security Measures

### Authentication Security
- Password hashing with bcryptjs (10 rounds)
- JWT tokens stored in HTTP-only cookies
- CSRF protection via NextAuth
- Secure session management

### API Security
- Rate limiting to prevent abuse
- Input validation with Zod schemas
- SQL injection prevention via Prisma (parameterized queries)
- XSS prevention via React's automatic escaping
- Role-based access control (RBAC)

### Infrastructure Security
- Environment variables for sensitive data
- HTTPS enforced in production
- Database connection strings secured
- OAuth secrets stored securely

## Performance Optimizations

### Database
- Indexes on frequently queried fields
- Denormalized statistics (company reviewCount, avgDifficulty)
- Pagination for list endpoints
- Efficient queries with Prisma select/include

### Frontend
- Next.js App Router for optimal code splitting
- Static generation where possible
- Image optimization (if implemented)
- Lazy loading for components

### Caching
- Redis for frequently accessed data
- Next.js static generation with revalidation
- Browser caching headers

## Monitoring & Observability

### Error Tracking
- **Sentry**: Real-time error tracking
- **Error Boundaries**: Graceful error handling
- **Logging**: Structured logging in development

### Performance Monitoring
- **Sentry Performance**: Transaction tracking
- **Next.js Analytics**: Built-in performance metrics

### Health Checks
- `/api/health` endpoint for uptime monitoring
- Database connection checks
- Redis connection checks (if configured)

## CI/CD Pipeline

### GitHub Actions Workflow

1. **Test Job**:
   - Checkout code
   - Setup Node.js 20
   - Install dependencies
   - Generate Prisma Client
   - Validate Prisma schema
   - Check Prisma migrations
   - Run TypeScript type checking
   - Run ESLint
   - Run tests (if present)

2. **Build Job**:
   - Checkout code
   - Setup Node.js 20
   - Install dependencies
   - Generate Prisma Client
   - Build Next.js application
   - Upload build artifacts (if needed)

### Deployment
- **Platform**: Vercel
- **Trigger**: Push to main/master branch
- **Preview Deploys**: Automatic for pull requests
- **Environment Variables**: Configured in Vercel dashboard

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables: `.env`
4. Generate Prisma Client: `npm run db:generate`
5. Push database schema: `npm run db:push`
6. Run development server: `npm run dev`

### Database Migrations
- **Development**: `npm run db:migrate` (creates migration)
- **Production**: `npx prisma migrate deploy` (applies migrations)
- **Schema Changes**: Update `schema.prisma`, then create migration

### Code Quality
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier with TailwindCSS plugin
- **Type Checking**: TypeScript strict mode
- **Pre-commit**: (Optional) Husky hooks

## Future Enhancements

### Planned Features
- Full-text search (PostgreSQL tsvector or Algolia)
- Trending ranking algorithm
- Anonymous reviews with email verification
- File attachments for reviews
- Interview timeline with structured stages
- Company and role recommendations
- Real-time notifications (WebSockets)
- Email notifications

### Scalability Considerations
- Database read replicas for read-heavy operations
- CDN for static assets
- Horizontal scaling with multiple Vercel instances
- Database connection pooling
- Caching layer expansion

## Dependencies

### Production Dependencies
- **next**: ^14.2.0 - React framework
- **react**: ^18.3.0 - UI library
- **@prisma/client**: ^5.19.0 - Database ORM
- **next-auth**: ^4.24.7 - Authentication
- **@sentry/nextjs**: ^10.32.1 - Error tracking
- **@upstash/redis**: ^1.35.8 - Redis client
- **@upstash/ratelimit**: ^2.0.7 - Rate limiting
- **zod**: ^3.23.8 - Schema validation
- **bcryptjs**: ^2.4.3 - Password hashing

### Development Dependencies
- **typescript**: ^5.5.4 - Type checking
- **prisma**: ^5.19.0 - Database toolkit
- **eslint**: ^8.57.0 - Linting
- **prettier**: ^3.3.3 - Code formatting
- **tailwindcss**: ^3.4.7 - CSS framework

## Environment Variables

See `.env.example` for required environment variables. Key variables:
- Database connection
- Authentication secrets
- OAuth provider credentials
- Redis connection (optional)
- Sentry configuration (optional)

## License

MIT

