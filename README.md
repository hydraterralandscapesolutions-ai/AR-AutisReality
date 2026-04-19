# AR-AutisReality

Informational support for parents of autistic children with a foundation for interactive learning, rewards, and emotional regulation tools.

## Authentication setup (Supabase)

1. Create a Supabase project.
2. Enable Email auth in Supabase Authentication settings.
3. Copy `.env.example` to `.env`.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.
5. In Supabase SQL Editor, run `supabase/schema.sql` from this repo.
6. In Supabase Auth settings, configure Site URL and redirect URLs to include your app URL and `/reset-password`.
7. Run `npm install` and `npm run dev`.

Role notes:
- Parent/admin role is stored in `user_metadata.role` during sign-up.
- Admin route access requires role `admin`.
- Parent checklist, rewards, and regulation data are stored per user in `public.user_app_state`.

Password and verification notes:
- Verification is required before accessing protected routes.
- Login includes resend-verification and forgot-password actions.
- Password reset completes on the `/reset-password` route from the email link.

## Local development

- `npm install`
- `npm run dev`

## Production build

- `npm run build`
- `npm run preview`

## VS Code tasks

- `dev` starts the local app server
- `build-web` creates the production bundle

## GitHub Actions

The workflow in `.github/workflows/web-build.yml` installs dependencies and builds the app on pushes and pull requests.
