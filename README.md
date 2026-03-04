# Quranify Android

Quranify is a Quran reading and listening app built with Vite + React and packaged for Android via Capacitor. Browse all 114 surahs, read with word-by-word translations, and listen to 300+ reciters with live word highlighting.

**Live:** [quranfi.xyz](https://quranfi.xyz)

## Features

- Browse all 114 surahs with Arabic names, English transliterations, and meanings
- Filter surahs by revelation type (Meccan / Medinan)
- Read individual surahs verse-by-verse or in continuous reading mode
- Listen to full-chapter audio with 300+ reciters and rewayat
- Word-by-word Arabic display — hover any word to see its English meaning
- Live word highlighting synced to audio playback
- Verse-level seek — tap any verse to jump directly to it in the audio
- Adjustable Arabic font size
- Bookmark verses and Mushaf pages (stored locally via IndexedDB)
- Dark mode
- Mushaf page reading mode (604 pages, Madina layout)
- Supplications (Dua) list
- Native Android app via Capacitor 8

## Stack

| Layer | Tech |
|---|---|
| Framework | Vite 6 + React 19 |
| Language | TypeScript |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| Mobile | Capacitor 8 (Android) |
| Storage | IndexedDB (idb) |

## Getting Started

```sh
git clone https://github.com/EasyCanadianGamer/Quranify-Android.git
cd Quranify-Android
npm install
```

No environment variables are required to run the app — all APIs are public and CORS-enabled.

Start the dev server:

```sh
npm run dev
```

App runs at `http://localhost:5173`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (localhost:5173) |
| `npm run build` | TypeScript check + production build to `dist/` |
| `npm run build:capacitor` | Production build for Capacitor (same as build) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Lint |

## Project Structure

```
src/
  App.tsx           # Route declarations (React Router v7)
  main.tsx          # Entry point
  components/       # React components (pages + layout)
  utils/
    api.ts          # All external API calls (alquran.cloud, qurancdn, mp3quran)
    bookmarksDB.ts  # IndexedDB bookmark storage
    sync.ts         # Cross-tab BroadcastChannel sync
  css/              # Arabic font styles
  data/
    roadmap.json    # Roadmap items (edit directly)
index.html          # Entry HTML (dark mode script, Google Fonts)
vite.config.ts      # Vite config
capacitor.config.ts # Capacitor config
```

## APIs

See [docs/api.md](docs/api.md) for documentation on every external API used.

## Android Build

See [docs/android-setup.md](docs/android-setup.md) for the full Capacitor build workflow.

## License

MIT
