# Review Platform

A full-stack web platform for students to browse companies and read/write internship reviews with moderation, voting, and reporting features.

## Features

- **Public Browsing**: Browse companies and reviews without authentication
- **User Authentication**: Sign in with Google OAuth or email/password
- **Review Submission**: Submit reviews that go through moderation
- **Admin Dashboard**: Approve/reject reviews, manage company requests, handle reports
- **Voting System**: Helpful votes on reviews
- **Reporting System**: Report inappropriate content
- **Company Requests**: Request new companies to be added

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: PostgreSQL (via Prisma ORM)
- **Auth**: NextAuth.js (Google OAuth + Email/Password)
- **Hosting**: Vercel (web) + Neon/Supabase (database)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Fill in the required variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_URL`: Your app URL (e.g., http://localhost:3000)
   - `NEXTAUTH_SECRET`: A random secret for NextAuth
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: For Google OAuth (optional)

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   # or
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public routes
│   ├── (auth)/            # Auth routes
│   ├── admin/             # Admin routes
│   ├── api/               # API routes
│   └── layout.tsx
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── reviews/
│   ├── companies/
│   └── admin/
├── lib/                   # Utilities
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth config
│   └── utils.ts
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration files
└── public/               # Static assets
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Prisma Studio

## Database Schema

The application uses Prisma with PostgreSQL. Key models include:

- **User**: User accounts with authentication
- **Company**: Company information
- **Review**: Internship reviews with moderation status
- **ReviewVote**: Helpful votes on reviews
- **ReviewReport**: Reports on reviews
- **CompanyRequest**: Requests for new companies
- **Tag**: Tags for companies and reviews

## Deployment

The application is designed to be deployed on Vercel with a managed PostgreSQL database (Neon or Supabase).

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel
4. Deploy

## License

MIT

