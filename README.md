# HF Tube Web

A mobile-first independent video frontend built with Next.js and public Invidious instances. A VPS is not required.

## Milestones

- **Milestone 1:** responsive HF Tube discovery UI and trending feed.
- **Milestone 2:** search results, dedicated watch page, HTML5 playback, playback speed, comments where available, local watch history, and provider-reported or estimated download sizes.
- **Milestone 3:** channel profiles, channel metadata, and channel video grids with links from discovery and watch pages.
- **Milestone 4:** paginated channel video browsing and related-video recommendations on supported watch pages.

Not implemented yet: Google sign-in, official personalized YouTube recommendations, a full Shorts feed, subscriptions, playlist management, and cross-device sync. Related videos and channel pagination depend on the selected Invidious instance exposing the relevant endpoints/data.

## Stack
Next.js App Router, TypeScript, Tailwind CSS, Vercel, public Invidious API instances.

## Run
1. Install Node.js 20.9+.
2. Run `npm install`.
3. Optionally copy `.env.example` to `.env.local` and set `INVIDIOUS_INSTANCES`.
4. Run `npm run dev`.

## Public instances
A small fallback list is included. Public instances are community-operated and may be offline, rate-limit requests, disable endpoints, or return media formats that do not play in every browser. Set `INVIDIOUS_INSTANCES` to comma-separated HTTPS instance URLs to choose preferred sources.

## Playback and downloads
The watch page uses direct format URLs returned by the selected Invidious instance; Vercel does not proxy media. Only formats actually returned by the backend are shown. File sizes use provider metadata when available and otherwise a bitrate-based estimate. Some browsers open the media URL instead of saving it automatically. Only download content you have permission to save and follow the source provider's terms.

## Account features
Google OAuth is not implemented. Never ask for or store a Google password. YouTube Data API access does not provide the same personalized Home recommendations as the official YouTube app. Watch and search history currently stay in the current browser's local storage.

## Deploy
Import this repository into Vercel as a Next.js app. Add `INVIDIOUS_INSTANCES` in Project Settings → Environment Variables if desired. Connect a custom domain in Vercel's Domains settings.

## Privacy
No analytics, ad network, or app-owned database. No Google token storage. Media is loaded directly from the provider.

## License
MIT
