# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with Next.js 14 App Router
- TypeScript configuration with path aliases
- TailwindCSS and shadcn/ui component library
- Prisma ORM with PostgreSQL database schema
- NextAuth.js authentication with Google OAuth and email/password
- User registration and login functionality
- Company browsing and search functionality
- Review submission with moderation workflow
- Admin dashboard for review and report management
- Helpful voting system for reviews
- Review reporting system
- Company request functionality
- Rate limiting using Upstash Redis
- Redis caching layer for performance optimization
- Sentry error tracking and monitoring
- GitHub Actions CI/CD pipeline
- Health check endpoint
- Audit logging for admin actions
- Notification system
- Error boundaries for better error handling

### Changed
- Updated TypeScript configuration to use `moduleResolution: "bundler"` for Next.js 14
- Improved middleware to handle authentication and authorization
- Enhanced API routes with dynamic rendering configuration
- Updated Sentry configuration to support client, server, and edge runtimes

### Fixed
- Fixed ESLint `react/no-unescaped-entities` errors in review components
- Fixed Next.js dynamic server usage warnings in API routes
- Fixed NextAuth redirect loop by updating middleware configuration
- Fixed Redis connection initialization to handle missing environment variables gracefully
- Fixed Sentry webpack configuration to prevent build hangs
- Fixed SessionProvider initialization issues
- Fixed missing API route handlers for companies and reviews

### Security
- Implemented rate limiting for review submissions, reports, and company requests
- Added server-side validation for all user inputs using Zod
- Protected admin routes with role-based access control (RBAC)
- Secured API endpoints with authentication middleware
- Added password hashing with bcryptjs

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

