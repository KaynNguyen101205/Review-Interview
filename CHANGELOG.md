# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Project Setup & Configuration
- **Next.js 14 App Router** setup with TypeScript
- **TypeScript configuration** (`tsconfig.json`):
  - Path aliases: `@/*` mapped to `./*`
  - `moduleResolution: "bundler"` for Next.js 14 compatibility
  - `target: "ES2020"` for modern JavaScript features
  - `typeRoots: ["./node_modules/@types"]` for type definitions
- **TailwindCSS** configuration with `tailwind.config.ts`
- **shadcn/ui** component library integration
- **Prettier** configuration (`.prettierrc`) with TailwindCSS plugin
- **ESLint** configuration with Next.js preset

#### Database & ORM
- **Prisma schema** (`prisma/schema.prisma`) with 15 models:
  - `User` - User accounts with role-based access (USER, ADMIN)
  - `Company` - Company information with cached stats (reviewCount, avgDifficulty, lastReviewAt)
  - `Review` - Internship reviews with moderation status (PENDING, APPROVED, REJECTED, REMOVED, NEEDS_EDIT)
  - `ReviewVote` - Helpful votes on reviews (unique per user per review)
  - `ReviewReport` - User reports on reviews (OPEN, DISMISSED, RESOLVED)
  - `CompanyRequest` - Requests for new companies (PENDING, APPROVED, REJECTED)
  - `Tag`, `CompanyTag`, `ReviewTag` - Tagging system
  - `Account`, `Session`, `VerificationToken` - NextAuth.js models
  - `AuditLog` - Admin action audit trail
  - `Notification` - User notification system
- **Database indexes** on frequently queried fields:
  - Company: slug, industry, hqLocation
  - Review: companyId, userId, status, season, year, roleTitle, publishedAt
  - User: email
- **Prisma Client** singleton pattern in `lib/prisma.ts`

#### Authentication & Authorization
- **NextAuth.js** configuration (`lib/auth.ts`):
  - Google OAuth provider with PrismaAdapter
  - Credentials provider (email/password) with bcryptjs hashing
  - JWT session strategy
  - Custom callbacks for role injection (USER, ADMIN)
  - Custom sign-in page at `/login`
- **User registration** API route (`app/api/auth/register/route.ts`):
  - Email/password registration with validation
  - Optional fields: name, school, gradYear, major
  - Password hashing with bcryptjs (10 rounds)
  - Duplicate email prevention
- **Middleware** (`middleware.ts`):
  - Route protection based on authentication status
  - Role-based access control (RBAC) for admin routes
  - Public routes: `/`, `/companies`, `/reviews`, `/login`, `/api/auth`
  - Protected user routes: `/me/*`, `/reviews/new`, `/reviews/[id]/edit`
  - Admin-only routes: `/admin/*`, `/api/admin/*`
- **Session helpers** (`lib/session.ts`):
  - `getCurrentUser()` function for server-side user retrieval
  - `requireAuth()` and `requireAdmin()` middleware helpers

#### API Routes

**Public Routes:**
- `GET /api/companies` - List companies with search, filters (industry, location), and pagination
- `GET /api/reviews` - List reviews with filters (company, role, season, year) and sorting
- `GET /api/health` - Health check endpoint

**Authentication Routes:**
- `POST /api/auth/register` - User registration with email/password
- `[...nextauth]` - NextAuth.js endpoints (signin, signout, callback, session)

**User Routes:**
- `POST /api/reviews` - Submit new review (requires auth, rate limited)
- `GET /api/reviews/[id]` - Get single review
- `PATCH /api/reviews/[id]` - Update own review (if pending/needs_edit)
- `POST /api/reviews/[id]/vote` - Vote on review (UP/DOWN)
- `POST /api/reviews/[id]/report` - Report a review
- `POST /api/company-requests` - Request new company (rate limited)
- `GET /api/company-requests` - List own company requests
- `GET /api/notifications` - Get user notifications

**Admin Routes:**
- `GET /api/admin/reviews` - List reviews with status filter (requires admin)
- `POST /api/admin/reviews/[id]/approve` - Approve review and update company stats
- `POST /api/admin/reviews/[id]/reject` - Reject review with reason
- `GET /api/admin/reports` - List reports with status filter
- `POST /api/admin/reports/[id]/dismiss` - Dismiss report
- `POST /api/admin/reports/[id]/action` - Take action on report (REMOVE_REVIEW, FLAG_REVIEW)
- `GET /api/admin/company-requests` - List all company requests
- `PATCH /api/admin/company-requests/[id]` - Approve/reject company request

#### Frontend Pages

**Public Pages:**
- `/` - Homepage with navigation cards
- `/companies` - Company listing page with search and filters
- `/companies/[slug]` - Company detail page with reviews
- `/reviews` - Review listing page with filters and sorting
- `/request-company` - Company request form

**Authentication Pages:**
- `/login` - Login and registration page with tabs:
  - Sign In: Google OAuth and email/password
  - Sign Up: Registration form with email, password, name, school, gradYear, major
  - Auto-redirect to `/me` if already authenticated

**User Pages:**
- `/me` - User profile page
- `/me/reviews` - User's review history with status indicators

**Admin Pages:**
- `/admin` - Admin dashboard overview
- `/admin/reviews` - Review moderation queue
- `/admin/reports` - Report management
- `/admin/requests` - Company request management

**Testing Pages:**
- `/test-sentry` - Sentry integration testing page with buttons to trigger errors, messages, and breadcrumbs

#### Rate Limiting
- **Simple in-memory rate limiting** (`lib/validation.ts`):
  - `checkRateLimit(identifier, maxRequests, windowMs)` helper
  - Used by `/api/reviews` (review submissions) and `/api/company-requests`
  - Per-identifier counters stored in process memory, reset on window expiry or process restart
- **Planned upgrade (not yet implemented)**:
  - Move to Upstash Redis–backed rate limiting for multi-region / multi-instance deployments

#### Caching
- **Next.js ISR / caching**:
  - Uses `revalidate` on selected routes (e.g. reviews listing) to periodically refresh cached responses
  - Dynamic API routes are marked appropriately to avoid incorrect static generation
- **Redis caching utilities (planned, not yet implemented)**:
  - Future `Cache.get<T>(key) / Cache.set<T>(key, value, ttlSeconds) / Cache.del(key)` helpers
  - Intended to sit on top of a shared Redis instance (e.g. Upstash) for hot paths

#### Error Tracking & Monitoring
- **Sentry integration**:
  - Client-side config (`instrumentation-client.ts`):
    - Error capture with context
    - Session replay (100% on error, 10% in production)
    - Performance monitoring (100% in dev, 10% in prod)
    - Router transition tracking
    - Debug mode in development
  - Server-side config (`sentry.server.config.ts`):
    - Server error tracking
    - Performance monitoring
  - Edge runtime config (`sentry.edge.config.ts`):
    - Edge function error tracking
  - Next.js instrumentation (`instrumentation.ts`):
    - Conditional initialization based on runtime (nodejs/edge)
  - Next.js config (`next.config.js`):
    - Conditional `withSentryConfig` wrapper (only if SENTRY_ORG and SENTRY_PROJECT are set)
    - Source map upload configuration
    - Webpack plugin configuration
- **Error boundaries**:
  - `app/error.tsx` - Route-level error boundary
  - `app/global-error.tsx` - Global error boundary for entire app

#### Validation & Utilities
- **Zod schemas** (`lib/validation.ts`):
  - Review submission validation
  - Company request validation
  - Report submission validation
- **Company statistics** (`lib/company-stats.ts`):
  - `updateCompanyStats()` - Recalculate reviewCount, avgDifficulty, lastReviewAt
  - Called automatically when reviews are approved
- **Audit logging** (`lib/audit.ts`):
  - `logAdminAction()` - Log admin actions to AuditLog table
  - Actions: REVIEW_APPROVED, REVIEW_REJECTED, REPORT_DISMISSED, REPORT_ACTIONED, COMPANY_CREATED
- **Notifications** (`lib/notifications.ts`):
  - `createNotification()` - Create user notifications
  - Types: REVIEW_APPROVED, REVIEW_REJECTED, REPORT_ACTIONED, COMPANY_REQUEST_APPROVED

#### CI/CD
- **GitHub Actions workflow** (`.github/workflows/ci.yml`):
  - **Test job**:
    - Node.js 20 setup
    - Dependency installation with npm ci
    - Prisma Client generation
    - Prisma schema validation
    - Prisma migration status check
    - TypeScript type checking (`npm run type-check`)
    - ESLint (`npm run lint`)
    - Test execution (optional, continues on error)
  - **Build job**:
    - Node.js 20 setup
    - Dependency installation
    - Prisma Client generation
    - Next.js build with environment variables
    - Runs after test job succeeds
  - Environment variables configured for CI:
    - `DATABASE_URL` from secrets (with fallback for build)
    - `NEXTAUTH_URL` and `NEXTAUTH_SECRET` for build
    - Optional OAuth and Sentry variables

#### Scripts
- `scripts/test-sentry-api.ts` - Test Sentry API integration

### Changed

#### TypeScript Configuration
- **`tsconfig.json`**:
  - Changed `moduleResolution` from `"node"` to `"bundler"` for Next.js 14 compatibility
  - Added `typeRoots: ["./node_modules/@types"]` to fix type definition resolution
  - Added `paths: { "@/*": ["./*"] }` for path aliases
  - Set `target: "ES2020"` for modern JavaScript features

#### API Routes
- **Dynamic rendering configuration**:
  - Added `export const dynamic = "force-dynamic"` to routes using:
    - `request.nextUrl.searchParams` (e.g., `/api/companies`, `/api/admin/reviews`)
    - `getCurrentUser()` which reads headers (e.g., `/api/reviews`, `/api/admin/*`)
  - Prevents Next.js static generation warnings
  - Routes affected:
    - `/api/admin/reviews/route.ts`
    - `/api/admin/reports/route.ts`
    - `/api/companies/route.ts`
    - `/api/reviews/route.ts`
    - `/api/reviews/[id]/route.ts`
    - `/api/reviews/[id]/vote/route.ts`
    - `/api/reviews/[id]/report/route.ts`
    - `/api/company-requests/route.ts`
    - `/api/company-requests/[id]/route.ts`
    - `/api/admin/reviews/[id]/approve/route.ts`
    - `/api/admin/reviews/[id]/reject/route.ts`
    - `/api/admin/reports/[id]/action/route.ts`
    - `/api/admin/reports/[id]/dismiss/route.ts`
    - `/api/auth/register/route.ts`

#### Middleware
- **`middleware.ts`**:
  - Removed `/login` from matcher config
  - Updated `authorized` callback to explicitly allow `/login` and `/api/auth` as public routes
  - Prevents redirect loops when accessing login page

#### Sentry Configuration
- **`next.config.js`**:
  - Wrapped `withSentryConfig` conditionally (only if `SENTRY_ORG` and `SENTRY_PROJECT` are set)
  - Prevents webpack from hanging when Sentry env vars are missing
  - Moved deprecated Sentry options to correct webpack configuration
- **`instrumentation-client.ts`**:
  - Added detailed logging for Sentry events
  - Added `beforeSendTransaction` callback for transaction tracking
  - Enhanced error context with event details

#### Session Provider
- **`components/providers.tsx`**:
  - Removed `mounted` state check that was causing `useSession` errors
  - Always renders `SessionProvider` (handles client-side rendering correctly)
  - Added `refetchInterval={0}` and `refetchOnWindowFocus={false}` for better performance

### Fixed

#### ESLint Errors
- **`app/me/reviews/page.tsx`**:
  - Fixed `react/no-unescaped-entities` error by changing `haven't` to `haven&apos;t`
- **`components/reviews/ReviewForm.tsx`**:
  - Fixed `react/no-unescaped-entities` error by changing `you're` to `you&apos;re`

#### Next.js Dynamic Server Usage
- **Issue**: Next.js was trying to statically generate API routes that use dynamic features
- **Fix**: Added `export const dynamic = "force-dynamic"` to all affected API routes
- **Routes fixed**:
  - All admin routes using `getCurrentUser()` or `searchParams`
  - All review routes using authentication
  - Company listing route using `searchParams`

#### NextAuth Redirect Loop
- **Issue**: `ERR_TOO_MANY_REDIRECTS` when accessing `/login`
- **Root cause**: Middleware was redirecting `/login` to `/login` in a loop
- **Fix**: 
  - Removed `/login` from middleware matcher
  - Explicitly allowed `/login` and `/api/auth` in `authorized` callback
  - Added session check in `app/login/page.tsx` to redirect authenticated users to `/me`

#### Redis Connection
- **Issue**: `[Upstash Redis] The 'url' property is missing or undefined`
- **Root cause**: Redis client was initializing before environment variables were loaded
- **Fix**:
  - Implemented lazy initialization in `lib/redis.ts`
  - Added `require('dotenv').config()` to `scripts/test-redis.ts`
  - Added `isRedisConfigured()` helper to check configuration before use

#### Sentry Webpack Configuration
- **Issue**: Next.js compilation hanging when Sentry env vars were missing
- **Root cause**: `withSentryConfig` was always wrapping `nextConfig`, causing webpack to hang
- **Fix**: Conditionally apply `withSentryConfig` only if `SENTRY_ORG` and `SENTRY_PROJECT` are set

#### SessionProvider Initialization
- **Issue**: `useSession` hook errors on initial render
- **Root cause**: `SessionProvider` was conditionally rendered based on `mounted` state
- **Fix**: Always render `SessionProvider` (it handles client-side rendering internally)

#### Missing API Route Handlers
- **Issue**: 404 errors for `/api/companies` and `/api/reviews`
- **Root cause**: Route files were missing
- **Fix**: Recreated missing route files:
  - `app/api/companies/route.ts` - GET handler with search, filters, and pagination
  - `app/api/reviews/route.ts` - GET and POST handlers with rate limiting

#### CI Workflow
- **Issue**: Prisma validation failing in CI due to missing `DATABASE_URL`
- **Fix**: Added `DATABASE_URL` to environment variables for Prisma validation step
- **Issue**: Build step failing due to missing NextAuth environment variables
- **Fix**: Added `NEXTAUTH_URL` and `NEXTAUTH_SECRET` to build step environment

### Security

#### Rate Limiting
- **Review submissions**: 3 reviews per minute per user/IP
- **Report submissions**: 5 reports per hour per user/IP
- **Company requests**: 2 requests per hour per user/IP
- **General API**: 10 requests per 10 seconds per user/IP
- **Implementation**: Upstash Redis with sliding window algorithm
- **Headers**: Rate limit information exposed via `X-RateLimit-*` headers

#### Input Validation
- **Server-side validation** using Zod schemas for all user inputs:
  - Review submission data
  - Company request data
  - Report submission data
  - User registration data
- **Type safety**: TypeScript types generated from Zod schemas
- **Error messages**: Detailed validation error messages returned to client

#### Authentication & Authorization
- **Password hashing**: bcryptjs with 10 salt rounds
- **Session management**: JWT tokens in HTTP-only cookies
- **Role-based access control (RBAC)**:
  - Middleware enforces authentication and role checks
  - API routes verify user role before processing admin actions
  - Admin routes protected at both middleware and route handler levels
- **CSRF protection**: Built-in NextAuth.js CSRF protection

#### API Security
- **Authentication middleware**: All protected routes verify user session
- **Admin-only routes**: Double-checked in both middleware and route handlers
- **SQL injection prevention**: Prisma ORM uses parameterized queries
- **XSS prevention**: React automatically escapes user input
- **Input sanitization**: All user-generated content validated before database storage

#### Audit Trail
- **Admin actions logged**: All admin actions recorded in `AuditLog` table
- **Action types**: REVIEW_APPROVED, REVIEW_REJECTED, REPORT_DISMISSED, REPORT_ACTIONED, COMPANY_CREATED
- **Details**: Entity type, entity ID, and optional details stored
- **User tracking**: All actions linked to admin user ID

## [0.1.0] - 2024-12-24

### Added
- Initial release of Review Platform
- Core features for browsing companies and reviews
- User authentication system
- Review moderation workflow
- Admin dashboard
- Voting and reporting systems

---

## Development Notes

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Secret for NextAuth session encryption
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (optional)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (optional)
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL (optional)
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST token (optional)
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN for client-side error tracking (optional)
- `SENTRY_DSN` - Sentry DSN for server-side error tracking (optional)
- `SENTRY_ORG` - Sentry organization slug (optional)
- `SENTRY_PROJECT` - Sentry project slug (optional)
- `SENTRY_AUTH_TOKEN` - Sentry auth token for source maps (optional)

### Known Issues
- None currently documented

### Future Enhancements
- Full-text search implementation
- Trending ranking algorithm
- Anonymous reviews with email verification
- File attachments for reviews
- Interview timeline with structured stages
- Company and role recommendations
- Real-time notifications
- Email notifications for review status changes

