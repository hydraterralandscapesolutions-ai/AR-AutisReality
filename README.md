# AR-AutisReality

Informational support for parents of autistic children with a foundation for interactive learning, rewards, and emotional regulation tools.

## Authentication setup (Supabase)

1. Create a Supabase project.
2. Enable Email auth in Supabase Authentication settings.
3. Copy `.env.example` to `.env`.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.
5. Run `npm install` and `npm run dev`.

Role notes:
- Parent/admin role is stored in `user_metadata.role` during sign-up.
- Admin route access requires role `admin`.

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
