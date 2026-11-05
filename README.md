# HF Tube Web

A mobile-first, YouTube-inspired video frontend with an independent HF Tube identity. The project is designed to use public Invidious instances instead of requiring you to operate a VPS.

## Current status

**Milestone 1 — foundation:** responsive dark UI, category chips, video cards, and a server-side trending-feed route with multiple public-instance fallbacks.

This is an early foundation, not a finished YouTube replacement yet. Search, Shorts playback, watch pages, Google sign-in, account sync, history, subscriptions, playlists, and downloads are planned next. The current video cards link out to YouTube until the dedicated player is implemented.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Vercel deployment
- Public Invidious API instances (JSON requests only; video media is not proxied through Vercel)

## Run locally

1. Install Node.js 20.9 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` if you want to configure instances.
4. Run `npm run dev` and open `http://localhost:3000`.

## Instance configuration

Set `INVIDIOUS_INSTANCES` to a comma-separated list of public HTTPS Invidious instances. The app also has a short built-in fallback list. Public instances are community-operated and can be unavailable, rate-limit requests, or disable endpoints. Check their terms and API availability before relying on them.

## Google account integration

Google sign-in is **not implemented yet**. Future account integration must use OAuth with the minimum required scopes and must never ask for a Google password. YouTube Data API access does not provide every feature of the official YouTube app, including its personalized home recommendation feed. Account features will be labeled according to what Google's APIs actually support.

## Downloads

Download controls are a planned feature. The app must only offer formats and direct media URLs actually returned by the selected backend, display estimated/known file size accurately, and respect applicable rights and service terms. Do not claim an unavailable format or fabricate file sizes.

## Deployment

Import this repository into Vercel, select the Next.js preset, and deploy. Add `INVIDIOUS_INSTANCES` in Project Settings → Environment Variables if you want to override the defaults. A custom domain can be connected later in Vercel's Domains settings.

## Privacy principles

- No ad network, analytics, or tracking by default.
- No app-owned account or database required for local-only preferences.
- Do not store Google access tokens in localStorage.
- Video media should load directly from the media provider, not through Vercel serverless functions.

## License

MIT
