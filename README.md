# UNIMA Toastmasters Gavel Club - Membership & Engagement Portal

A membership database, meeting check-in system, and content hub (updates,
stories, photo gallery) for the UNIMA Toastmasters Gavel Club. Built with
Next.js, TypeScript, Tailwind CSS and Supabase, deployed on Vercel.

You don't need to understand the whole codebase to keep using this. Most
future changes ("add a field to the registration form", "change the colors",
"add a new admin role") can be described in plain English to an AI coding
assistant (Claude Code, Cursor, etc.) working inside this repository.

---

## 1. How the pieces fit together

- **Next.js App Router** (`app/`): pages and server actions.
- **Supabase**: Postgres database, authentication, and file storage.
- **Row Level Security (RLS)**: the *real* security boundary. Every table
  has policies (in `supabase/policies.sql`) that decide who can read/write
  what, enforced by Postgres itself, not just by the app's UI. Even if
  someone bypassed the website entirely and queried Supabase directly with
  a member's login, RLS would still block them from seeing other members'
  private data or reaching admin-only tables.
- **Vercel**: hosts the Next.js app and redeploys automatically on every
  push to your main branch.

---

## 2. Creating the Supabase project

1. Go to https://supabase.com and create a new project (choose a region
   close to Malawi, e.g. an EU region, for the best latency).
2. Once it's ready, open **SQL Editor** in the Supabase dashboard.
3. Run the three SQL files in this exact order, pasting each one's full
   contents and clicking "Run":
  1. `supabase/schema.sql`: creates all tables, enums, and triggers.
  2. `supabase/policies.sql`: turns on Row Level Security and adds all
      access policies.
   3. Leave `supabase/seed_super_admin.sql` for step 5 below.
4. Create the storage buckets used for photos:
   - Go to **Storage** → **New bucket**.
  - Create a bucket named `gallery`: set it to **Public**.
  - Create a bucket named `covers`: set it to **Public**.
  - Create a bucket named `avatars`: set it to **Public**.
   (The storage policies in `policies.sql` already restrict who can
  *upload/delete* into these. "Public" here only means anyone with the
   exact file URL can view it, which is what you want for a photo gallery.)
5. **Bootstrap your first Super Admin:**
   - Deploy or run the app locally (see below) and register a normal
     account for yourself at `/join`.
   - In Supabase dashboard, go to **Authentication → Users** and copy your
     new user's UUID.
   - Open `supabase/seed_super_admin.sql`, paste your UUID in both places,
     and run it in the SQL Editor.
  - Log out and back in. You'll now see an **Admin Dashboard** link in
     the member navigation.

---

## 3. Environment variables

Copy `.env.example` to `.env.local`:

```
cp .env.example .env.local
```

Fill in the three values from **Supabase Dashboard → Project Settings →
API**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the "anon public" key)
- `SUPABASE_SERVICE_ROLE_KEY` (the "service_role" key. Keep this secret;
  it is only used in a couple of server-only helper functions and is never
  sent to the browser)

---

## 4. Running locally

Requires Node.js 18+.

```
npm install
npm run dev
```

Visit http://localhost:3000.

---

## 5. Deploying to Vercel

1. Push this project to a GitHub repository.
2. Go to https://vercel.com/new and import that repository.
3. In the import screen, add the same three environment variables from
   `.env.local` under **Environment Variables**.
4. Click **Deploy**. Vercel will build and host the site, and give you a
   `*.vercel.app` URL (you can attach a custom domain later under Project
   Settings → Domains).
5. From then on, every push to your main branch redeploys automatically.

---

## 6. Day-to-day administration

- **Approve new members**: Admin Dashboard → Members → change their status
  dropdown from "pending" to "active".
- **Run a meeting**: Admin Dashboard → Meetings → create it, then click
  "Open Check-in" right when the meeting starts, and "Close Check-in" when
  it ends. Members can only check themselves in while it's open.
- **Post an announcement**: Admin Dashboard → Updates → fill in the form.
- **Publish a story**: Admin Dashboard → Stories → fill in the form. Upload
  a cover photo via the Gallery page first, then paste its link into the
  "Cover Image URL" field.
- **Upload photos**: Admin Dashboard → Gallery → Upload Photo.
- **Add another administrator**: Admin Dashboard → Administrators (Super
  Admin only) → pick an active member and a role.

Roles:
- **Super Admin**: everything, including managing other administrators.
- **Administrator**: members, meetings, attendance, and all content.
- **Operations Administrator**: members, meetings, attendance, reports, and exports.
- **Treasurer**: payment management only.
- **Content Administrator**: updates, stories, and gallery only.

The Payments page supports paid, unpaid, and all-member CSV exports. Batch payment changes require selecting members and confirming the Treasurer's password.

For an existing Supabase project, run both migrations in filename order:
`supabase/migrations/20260912_add_operations_admin.sql`, then
`supabase/migrations/20260912_configure_operations_admin.sql`. The first migration
must commit the enum value before the second migration references it. Apply both
database migrations before assigning the Operations Administrator role.
Then apply `supabase/migrations/20260924_add_treasurer_payment_access.sql`, commit it, and apply `supabase/migrations/20260924_configure_treasurer_payment_access.sql`. Finally apply `supabase/migrations/20260924_restrict_payment_access_from_operations.sql` before assigning the Treasurer role.

---

## 7. Extending this later with AI coding help

This project is organized so that most changes are localized:

- Registration form fields → `app/join/page.tsx` and
  `lib/actions/auth.ts` (and add a matching column in
  `supabase/schema.sql`).
- Colors / fonts → `tailwind.config.ts`.
- New admin role or permission → `supabase/policies.sql` (the `is_admin()` /
  `has_content_access()` functions) and `types/database.ts`.
- New page → add a folder under `app/`.

When asking an AI assistant to make a change, it helps to mention which of
these files the change likely touches, but pointing it at this README and
the relevant page is usually enough.

---

## 8. Security notes

- Passwords are never handled or stored by this app directly. Supabase
  Auth manages hashing and storage.
- The middleware (`middleware.ts`) redirects logged-out users away from
  `/dashboard` and `/admin`, and non-admins away from `/admin`, but this is
  a UX convenience only. The actual enforcement is Postgres RLS
  (`supabase/policies.sql`), so a member can never read or modify another
  member's data or reach admin-only tables no matter what URL they try.
- The Supabase **service role key** bypasses RLS entirely and must stay
  server-side. It is set up in `lib/supabase/server.ts` but is not
  currently required by any user-facing flow in this build. Keep it in
  your environment variables for future server-only features, but never
  import `createAdminClient()` into a "use client" file.
