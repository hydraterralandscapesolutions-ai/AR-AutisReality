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
- Parent checklist data is stored per user in `public.user_app_state.parent_tasks` (with optional `childId` for per-child scoping).
- Child profiles are stored per user in `public.user_app_state.children`.
- Shared rewards and regulation state are stored in `public.user_app_state.reward_points`, `public.user_app_state.reward_message`, and `public.user_app_state.regulation_index`.
- Per-child rewards and regulation state are stored in `public.user_app_state.reward_points_by_child`, `public.user_app_state.reward_message_by_child`, and `public.user_app_state.regulation_index_by_child`.
- Parent completion history analytics are stored per user in `public.user_app_state.completion_history`.
- Claimed achievements are stored per user in `public.user_app_state.claimed_badges`.
- Reminder schedules are stored per user in `public.user_app_state.reminders` (shared reminders and per-child reminders via optional `childId`).
- Reminder alert preferences are stored per user in `public.user_app_state.reminder_preferences` (shared) and `public.user_app_state.reminder_preferences_by_child` (per-child overrides).
- Enabled reminders trigger an in-app alert banner at the scheduled local time (once per reminder per minute).
- The alert banner has Snooze (10 minutes) and Dismiss actions.
- Optional browser-level notifications can be enabled from the Reminders page using the browser permission prompt.
- Optional in-app sound and device vibration can be configured in the Reminders page.
- A Do Not Disturb time window can be set per user; reminders within the window are silenced (supports overnight ranges such as 22:00–07:00).
- Admin dashboard can load multi-user aggregates via `public.admin_dashboard_summary()`, including family-size, child reminder, per-child game-session, and child-feature adoption rollups.
- Shared game progress is stored per user in `public.user_game_progress`.
- Per-child game progress is stored per user in `public.user_app_state.game_progress_by_child`.

Password and verification notes:
- Verification is required before accessing protected routes.
- Login includes resend-verification and forgot-password actions.
- Password reset completes on the `/reset-password` route from the email link.

Schema update note:
- Re-run `supabase/schema.sql` whenever new functions or columns are added (including admin aggregate RPC updates).

## Deployment (GitHub Pages)

This repo includes `.github/workflows/deploy-pages.yml` to deploy on pushes to `main`.

Required repository secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

GitHub setup:
1. In repository settings, set Pages source to GitHub Actions.
2. Add the two secrets above in repository secrets.
3. Push to `main` and wait for the `Deploy to GitHub Pages` workflow.

Supabase redirect URLs should include:
- `https://hydraterralandscapesolutions-ai.github.io/AR-AutisReality/`
- `https://hydraterralandscapesolutions-ai.github.io/AR-AutisReality/#/reset-password`

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
