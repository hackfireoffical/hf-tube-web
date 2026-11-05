# HF Tube Web

A mobile-first independent video frontend built with Next.js and public Invidious instances. A VPS is not required.

## Milestones

- **Milestone 1:** responsive HF Tube discovery UI and trending feed.
- **Milestone 2:** search results, dedicated watch page, HTML5 playback, playback speed, comments where available, local watch history, and provider-reported or estimated download sizes.
- **Milestone 3:** channel profiles, channel metadata, and channel video grids with links from discovery and watch pages.
- **Milestone 4:** paginated channel video browsing, related-video recommendations, and a local watch-history page.
- **Milestone 5:** a vertical, snap-scrolling short-video feed with lazy-loaded playback and muted autoplay where supported.
- **Milestone 6:** browser-local channel subscriptions, channel subscribe/unsubscribe controls, and a combined subscriptions feed.
- **Milestone 7:** browser-local playlists, save-to-playlist controls, per-video selection, resolution/size choices, and playlist batch-download actions.
- **Milestone 10:** live search suggestions plus provider-backed sorting, upload-date, duration, and video/channel type filters.
- **Milestone 11:** clearer download format labels and size provenance (provider-reported, estimated, or unavailable) on watch and playlist pages.
- **Milestone 12:** searchable local watch history, video thumbnails, individual history removal, and clear-all confirmation.
- **Milestone 13:** functional home navigation, expandable desktop sidebar, provider-backed category search, and same-tab video navigation.
- **Milestone 14:** browser-local playback preferences (autoplay, muted start, default speed), local data clearing, and JSON export/import for local app data.
- **Milestone 15:** searchable subscription lists, refreshable subscription feeds with per-channel failure feedback, and playlist search/rename/delete controls.
- **Milestone 16:** watch-player theater mode, caption language selection, and keyboard shortcuts for play/pause, seeking, mute, and fullscreen.

Not implemented yet: Google sign-in, official personalized YouTube recommendations, cross-device sync, and theme switching. Subscriptions are stored only in the current browser and are not connected to a Google account. The short-video feed searches public Invidious results and filters videos to 60 seconds or less; it is not an official YouTube Shorts feed, and availability depends on public instances. Related videos and channel pagination depend on the selected Invidious instance exposing the relevant endpoints/data.

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
The watch page uses direct format URLs returned by the selected Invidious instance; Vercel does not proxy media. Only formats actually returned by the backend are shown. File sizes use provider metadata when available and otherwise a bitrate-based estimate; the interface labels which kind is shown. Some browsers open the media URL instead of saving it automatically. Playlist batch downloads trigger separate browser downloads and may require allowing multiple downloads. The app cannot observe or verify when an external browser download completes. Only download content you have permission to save and follow the source provider's terms.

## Player controls
The watch player supports theater mode, caption selection when caption tracks are provided by the source, and keyboard shortcuts: Space (play/pause), Left/Right arrows (seek 5 seconds), M (mute), and F (fullscreen). Browser-native controls remain available.

## Subscription and playlist management
Subscriptions can be searched and the feed can be refreshed. Playlist names can be searched, renamed, and deleted. These features use browser-local storage.

## Settings and local data
Playback preferences, watch/search history, subscriptions, and playlists are stored in the current browser. Settings can export/import a JSON backup and clear individual local data categories. Imported data replaces matching categories in the current browser.

## Account features
Google OAuth is not implemented. Never ask for or store a Google password. YouTube Data API access does not provide the same personalized Home recommendations as the official YouTube app. Watch and search history currently stay in the current browser's local storage. Watch history has its own page. Playlists are also stored only in the current browser.

## Deploy
Import this repository into Vercel as a Next.js app. Add `INVIDIOUS_INSTANCES` in Project Settings → Environment Variables if desired. Connect a custom domain in Vercel's Domains settings.

## Privacy
No analytics, ad network, or app-owned database. No Google token storage. Media is loaded directly from the provider.

## License
MIT
