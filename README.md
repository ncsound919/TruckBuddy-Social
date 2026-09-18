# Truck Buddy Network (TruckBuddy-Social)

A professional social + compliance platform for CDL drivers: live road feed, US member radar map, mileage leaderboard, convoy drafting network, road safety reports, marketplace, and FMCSA compliance calculators (axle weights, HOS split-sleeper, IFTA, securement WLL, wind risk).

## Stack

- **Frontend:** React 19, Vite 6, TypeScript, Tailwind CSS 4, vite-plugin-pwa
- **Backend:** Supabase (Auth: email/password + Google, Postgres + Row Level Security, Realtime) — the **same project** as the Truck Buddy cab app and web portal, so a driver is one identity (`auth.users.id`) across all three
- **API server:** Express + Google Gemini (`src/server/`) — driver chat, route advisor, HOS audit, dispatcher
- **CI:** GitHub Actions (`.github/workflows/ci.yml`)

## Quick Start

```bash
npm install
npm run dev      # starts the Express + Vite dev server on port 3000
```

### Environment

Copy `.env.example` to `.env` for local development:

- `GEMINI_API_KEY` — server-side Gemini key for the AI endpoints. Without it, the server returns built-in fallback responses. **Never expose this key to the client.**
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — the shared Truck Buddy Supabase project (`bxjtmcumkffcbzuhusxn`) and its anon/publishable key. The anon key is a public client identifier by design — **RLS is the security boundary**, not key secrecy. Without these, live data is disabled and the app falls back to `src/data.ts` seeds.

Signing in here uses the **same account** as the cab app and web portal (shared
`auth.users.id`). Notes for a new deployment:
- Allow-list the origin in Supabase → Authentication → URL Configuration
  (`http://localhost:3000` and `127.0.0.1:3000` are already allowed).
- Email/password sign-up sends a confirmation link via the project's Resend
  SMTP; `emailRedirectTo` returns the user to this app.
- Google sign-in uses a dedicated Truck Buddy OAuth client (GCP project
  `truck-buddy-auth`, consent screen published to production), so the consent
  screen shows "Truck Buddy" rather than another app's branding. The client
  id/secret live in KeyWire (project `Truck Buddy`).

### Data layer

All backend access goes through one seam:

- `src/lib/supabase.ts` — client init
- `src/lib/social-api.ts` — `subscribeLive*` / `createLive*` / `toggleLive*` calls (same exported names as the previous data module)
- `src/lib/social-mappers.ts` — row <-> domain mapping (client-only detail rides in each row's `metadata` JSONB)
- `src/contexts/SupabaseContext.tsx` — session + profile provider (`useSupabaseSession`, `useCurrentProfile`)

## Supabase tables

| Table | Written by | RLS posture |
|---|---|---|
| `profiles` | SupabaseContext, AuthOverlay | signed-in read; self insert/update |
| `posts`, `post_media`, `likes`, `comments` | FeedSection / FeedPost / FeedComposer | author-verified writes, trigger-maintained counters |
| `road_statuses`, `road_status_reactions` | DriverStoriesBar | author creates, self reactions |
| `safety_reports`, `safety_report_votes` | RoadReportsSection | author creates, self votes |
| `convoys`, `convoy_members`, `convoy_messages` | ConvoyNetworkSection | leader/member gated |
| `member_locations` | MemberMapSection | self upsert, sharing-gated read |
| `mileage_entries`, `mileage_proofs` | MileageLeaderboardSection | self writes, moderator review |
| `listings`, `listing_media` | MarketplaceSection | seller writes |

Schema, RLS, counters, storage buckets and the Realtime publication are managed by
versioned migrations in the cab app repo at `supabase/migrations/`.

## Scripts

- `npm run dev` — dev server (tsx src/server/index.ts)
- `npm run build` — Vite build + esbuild server bundle to `dist/server.cjs`
- `npm start` — run the production server bundle
- `npm run lint` — `tsc --noEmit` + bundle-size guard (`scripts/check-size.js`, 10KB cap on App.tsx, features/feed, components/shell, server)

## Known Limitations

- Mileage verification (OCR / ELD sync) is simulated UI, not real verification
- Moderation queue and admin role are client-side / localStorage only
- No test framework yet — CI runs typecheck, lint, and build only
- Seed data in `src/data.ts` (~78KB) ships in the client bundle as a fallback when the tables are empty

## Deployment

Vercel/Netlify can host the static SPA, but the Gemini API routes need a Node host (the Express server). Keep `GEMINI_API_KEY` in server environment variables only.
