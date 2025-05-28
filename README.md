# Tewahedo Forum - Next.js 14

A modern forum application for the Ethiopian Orthodox Tewahedo Church community, built with Next.js 14, NextAuth.js, and Neon PostgreSQL.

## Features

- 🔐 **Authentication**: Google OAuth with NextAuth.js
- 📝 **Q&A System**: Ask questions and provide answers
- 👥 **User Management**: Admin dashboard for user moderation
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🗄️ **Database**: PostgreSQL with Drizzle ORM
- ⚡ **Performance**: Server-side rendering with Next.js 14

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see below)
4. Run the development server: `npm run dev`

## Environment Variables

\`\`\`env
DATABASE_URL=your_neon_database_url
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
\`\`\`

## Deployment

This application is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add the environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## License

MIT License - see LICENSE file for details.
\`\`\`

```gitignore file=".gitignore"
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# drizzle
/drizzle
