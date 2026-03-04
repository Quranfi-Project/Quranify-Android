# Quranify Android — Project Summary

A Quran reading and listening app built with **Vite + React 19 + TypeScript**, packaged for Android via **Capacitor 8**. All data is fetched client-side from public, CORS-enabled APIs — no backend or server required.

---

## Architecture

| Concern | Solution |
| --- | --- |
| Build tool | Vite 6 |
| UI framework | React 19 + TypeScript |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 (PostCSS) |
| Mobile packaging | Capacitor 8 (Android) |
| Local storage | IndexedDB via `idb` |
| Cross-tab sync | BroadcastChannel API |

---

## Key Features

- **Surah browser** — all 114 surahs with Arabic, transliteration, meaning, verse count, revelation type
- **Verse mode** — verse-by-verse with Arabic text, Saheeh International translation, play button per verse
- **Reading mode** — continuous Arabic text like a Mushaf, word spans with hover translations
- **Word-by-word** — each Arabic word is a hoverable span showing its English meaning; gold highlighting follows audio
- **Audio player** — chapter audio from mp3quran.net (300+ reciters), verse-seek, repeat, chapter playback
- **Live word highlighting** — timing segments from Quran Foundation API mapped proportionally to any reciter
- **Mushaf page reading** — 604 pages (Madina layout) via AlQuran Cloud
- **Bookmarks** — verse bookmarks and page bookmarks stored in IndexedDB, synced across tabs
- **Dua list** — supplications browser
- **Roadmap** — public roadmap (read from `src/data/roadmap.json`)
- **Dark mode** — class-based via Tailwind v4 `@custom-variant dark`

---

## External APIs

All called directly from the browser — no proxy, no credentials required.

| API | Used for |
| --- | --- |
| `api.alquran.cloud/v1` | Chapter list, surah verses (Arabic + English), Mushaf pages |
| `api.qurancdn.com/api/qdc` | Word-by-word Arabic text and English word translations |
| `api.quran.com/api/v4` | Word-level audio timing segments (recitation 7 = Mishari) |
| `mp3quran.net/api/v3` | Reciter list, verse timestamps, chapter audio URLs |

See [docs/api.md](docs/api.md) for full endpoint documentation.

---

## Project Structure

```text
Quranify-Android/
├── index.html                  # Entry HTML (dark mode inline script, Google Fonts)
├── vite.config.ts              # Vite config (React plugin, @ alias, dev proxy)
├── capacitor.config.ts         # Capacitor config (appId, webDir: dist)
├── postcss.config.mjs          # Tailwind CSS v4 PostCSS plugin
├── src/
│   ├── main.tsx                # ReactDOM.createRoot + BrowserRouter
│   ├── App.tsx                 # All route declarations
│   ├── app/globals.css         # Tailwind @import, @theme (gold palette), @layer base
│   ├── css/surah.css           # Arabic font-face declarations
│   ├── components/
│   │   ├── ClientLayout.tsx    # Header + Sidebar + Footer wrapper
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── SurahList.tsx       # Home page — 114 surah cards
│   │   ├── SurahDetail.tsx     # Surah reader + audio player + word highlighting
│   │   ├── ReadingMode.tsx     # Mushaf page reader (604 pages)
│   │   ├── AudioPlayer.tsx     # Custom audio player with segment playback
│   │   ├── Bookmarks.tsx       # Verse + page bookmarks
│   │   ├── DuaList.tsx
│   │   ├── Roadmap.tsx
│   │   ├── AdminRoadmap.tsx    # Read-only roadmap view (edit JSON directly)
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── Privacy.tsx
│   │   └── Terms.tsx
│   ├── utils/
│   │   ├── api.ts              # All external API fetch functions
│   │   ├── bookmarksDB.ts      # IndexedDB CRUD for verse + page bookmarks
│   │   └── sync.ts             # BroadcastChannel for cross-tab bookmark sync
│   └── data/
│       └── roadmap.json        # Roadmap items (edit to update roadmap page)
├── android/                    # Capacitor Android project
└── docs/
    ├── api.md                  # External API documentation
    └── android-setup.md        # Capacitor build guide
```

---

## Android Build

```bash
npm run build:capacitor   # Vite build → dist/
npx cap sync android      # Copy dist/ into android/ + sync plugins
npx cap open android      # Open in Android Studio
```

See [docs/android-setup.md](docs/android-setup.md) for full setup including JDK, Android SDK, keystore, and APK/AAB generation.
