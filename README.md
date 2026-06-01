This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# StudentAttendence

This is a Next.js + TypeScript student attendance management application scaffolded in this repository. It includes authentication, API routes for attendance operations, an admin dashboard, a student dashboard, Prisma for database access, and utilities for uploading and processing attendance data.

**Current status (what's implemented so far)**

- Project scaffold: Next.js (App Router) with TypeScript and Tailwind/CSS setup.
- Authentication: NextAuth route wired under `app/api/auth/[...nextauth]/route.ts` (provider config expected in environment).
- API endpoints:
	- `app/api/attendance/route.ts` — attendance create/read endpoints
	- `app/api/attendance/logout/route.ts` — attendance logout endpoint
	- `app/api/admin/route.ts` — admin-only API surface
	- `app/api/activity/route.ts` — activity logging or audit endpoint
	- `app/api/upload/route.ts` — file/upload handling endpoint
- Pages/UI:
	- `/` — landing page at `app/page.tsx`
	- `/login` — login page at `app/login/page.tsx`
	- `/admin/dashboard` — admin dashboard at `app/admin/dashboard/page.tsx`
	- `/student/dashboard` — student dashboard at `app/student/dashboard/page.tsx`
	- Shared components under `components/` such as `nav-bar.tsx`, `webcam-capture.tsx`, `premium-charts.tsx`, and theme/providers helpers.
- Database: Prisma client setup in `lib/prisma.ts` with schema in `prisma/schema.prisma` and a `prisma/seed.ts` script for seeding test data.

**Project layout (key files & folders)**

- `app/` — Next.js App Router pages and API routes
- `components/` — React UI components and providers
- `lib/prisma.ts` — Prisma client initialization
- `prisma/schema.prisma` & `prisma/seed.ts` — DB schema and seed script
- `public/` — static assets
- `types/` — custom type declarations
- `package.json`, `tsconfig.json`, `next.config.ts` — project config and scripts

**Prerequisites**

- Node.js (v18+ recommended)
- npm or pnpm
- A PostgreSQL (or other supported) database and its connection URL
- Git (already initialized for this repo)

**Environment variables (example)**

Create a `.env` file in the project root with at least these variables (adjust names as needed):

```
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="a-long-random-string"
# Provider credentials (example for GitHub):
GITHUB_ID="..."
GITHUB_SECRET="..."
```

Check `app/api/auth/[...nextauth]/route.ts` for the exact providers and env keys required by your setup.

**Setup & local development**

1. Install dependencies

```bash
npm install
```

2. Prepare the database

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

3. Run the development server

```bash
npm run dev
```

4. Open `http://localhost:3000`

**Notes & developer tips**

- Prisma: Use `npx prisma studio` to inspect DB data during development.
- Auth: If using OAuth providers, ensure callback URLs are configured in the provider dashboard to match `NEXTAUTH_URL`.
- Webcam capture: `components/webcam-capture.tsx` is available for building attendance via camera capture — test permissions in the browser.
- File uploads: `app/api/upload/route.ts` handles file uploads; review payload limits and storage location.

**What to do next / Suggested improvements**

- Add a `.gitignore` entry for environment and local secrets (if not present already).
- Add a `README` section documenting required environment variables in detail.
- Add unit/integration tests and CI workflows.
- Harden API routes with RBAC/authorization checks for admin-only endpoints.
- Add Docker/Dev container configuration for reproducible local dev.

**Contact / author**

Repository maintained by the project owner. Open issues or PRs on the repository for questions or contributions.

---

If you'd like, I can: add a `.gitignore`, commit & push this README update, or expand any section (setup, env keys, or developer notes).

