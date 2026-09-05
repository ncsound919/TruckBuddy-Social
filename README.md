# Truck Buddy Network (TruckBuddy-Social)

A professional social + compliance platform for CDL drivers: live road feed, US member radar map, mileage leaderboard, convoy drafting network, road safety reports, marketplace, and FMCSA compliance calculators (axle weights, HOS split-sleeper, IFTA, securement WLL, wind risk).

## Stack

- **Frontend:** React 19, Vite 6, TypeScript, Tailwind CSS 4, vite-plugin-pwa
- **Backend:** Firebase (Auth: email/password + Google, Firestore real-time listeners)
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

Firebase config lives in `firebase-applet-config.json` and is imported by `src/lib/firebase.ts`. Firebase web API keys are public client identifiers — data protection comes from `firestore.rules`, not from hiding this file. Recommended hardening:

- Enable **App Check** (reCAPTCHA v3) in the Firebase console
- Restrict the API key in Google Cloud Console to your deployed domains
- Keep `firestore.rules` deployed and default-deny

## Firestore Collections

| Collection | Written by | Rules posture |
|---|---|---|
| `users` | FirebaseContext, AuthOverlay | owner-only writes |
| `posts` | FeedSection / FeedComposer | author-verified create, counter-only updates |
| `posts/{id}/comments` | FeedPost | author-verified create |
| `roadStatuses` | DriverStoriesBar | author-verified create, reaction counters |
| `safetyReports` | RoadReportsSection | signed-in create (see TODO in rules) |
| `convoys` | ConvoyNetworkSection | signed-in create, members/leader updates |
| `convoys/{id}/messages` | ConvoyNetworkSection | signed-in create |
| `memberLocations` | MemberMapSection | signed-in create (see TODO in rules) |
| `mileageLeaderboard` | MileageLeaderboardSection | signed-in create (see TODO in rules) |
| `mileageProofs` | MileageLeaderboardSection | signed-in create (see TODO in rules) |

**Important:** the app uses a *named* Firestore database (`firestoreDatabaseId` in `firebase-applet-config.json`). When deploying rules, target that database, not `(default)`:

```bash
firebase deploy --only firestore:rules
# or paste firestore.rules into the Firebase console for the named database
```

## Scripts

- `npm run dev` — dev server (tsx src/server/index.ts)
- `npm run build` — Vite build + esbuild server bundle to `dist/server.cjs`
- `npm start` — run the production server bundle
- `npm run lint` — `tsc --noEmit` + bundle-size guard (`scripts/check-size.js`, 10KB cap on App.tsx, features/feed, components/shell, server)

## Known Limitations

- Marketplace listing creation is a stub pending Firebase migration (throws by design)
- Mileage verification (OCR / ELD sync) is simulated UI, not real verification
- Moderation queue and admin role are client-side / localStorage only
- No test framework yet — CI runs typecheck, lint, and build only
- Seed data in `src/data.ts` (~78KB) ships in the client bundle as a fallback when Firestore is empty

## Deployment

Vercel/Netlify can host the static SPA, but the Gemini API routes need a Node host (the Express server). Keep `GEMINI_API_KEY` in server environment variables only.
