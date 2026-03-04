# API Documentation

All external API calls live in `src/utils/api.ts`. No server-side proxy is used — all APIs are public and CORS-enabled, so calls are made directly from the browser (and from the native layer in Capacitor).

---

## 1. AlQuran Cloud API

**Base URL:** `https://api.alquran.cloud/v1`
**Auth:** None (public API)
**CORS:** Yes
**Used for:** Chapter list, surah verses, Mushaf page reading

### List all chapters

```
GET https://api.alquran.cloud/v1/surah
```

Returns metadata for all 114 surahs.

| Field | Description |
| --- | --- |
| `number` | Surah number (1–114) |
| `englishName` | Transliterated name (e.g. `Al-Faatiha`) |
| `name` | Arabic name (e.g. `سُورَةُ ٱلْفَاتِحَةِ`) |
| `englishNameTranslation` | English meaning (e.g. `The Opening`) |
| `numberOfAyahs` | Verse count |
| `revelationType` | `"Meccan"` or `"Medinan"` |

### Get surah with Arabic + English

```
GET https://api.alquran.cloud/v1/surah/{number}/editions/quran-uthmani,en.sahih
```

Returns two editions in a single request:

- `quran-uthmani` — Uthmani Arabic script
- `en.sahih` — Saheeh International English translation

Response is an array of two edition objects. Each has an `ayahs` array.

| Field | Description |
| --- | --- |
| `ayah.number` | Global ayah number (1–6236) |
| `ayah.text` | Verse text for this edition |
| `ayah.numberInSurah` | Ayah number within the surah |

English translation text may contain HTML — `stripHtml()` is applied before use.

### Get Mushaf page

```
GET https://api.alquran.cloud/v1/page/{pageNumber}/quran-uthmani
```

Returns all ayahs on a given Madina Mushaf page (1–604) with Uthmani Arabic and surah metadata.

---

## 2. Quran Foundation API (qurancdn.com)

**Base URL:** `https://api.qurancdn.com/api/qdc`
**Auth:** None (public API)
**CORS:** Yes (`access-control-allow-origin: *`)
**Used for:** Word-by-word data (Arabic words + English word translations)

### Get chapter info

```
GET https://api.qurancdn.com/api/qdc/chapters/{id}?language=en
```

Used to get `verses_count` for pagination.

### Get verses with word data

```
GET https://api.qurancdn.com/api/qdc/verses/by_chapter/{id}?language=en&words=true&per_page=50&page={n}
```

Fetched page-by-page and merged. Fields used per word:

| Field | Description |
| --- | --- |
| `char_type_name` | `"word"` (kept) or `"end"` (verse marker, excluded) |
| `text` | Arabic word text |
| `translation.text` | English word translation |

---

## 3. Quran Foundation API (quran.com/v4)

**Base URL:** `https://api.quran.com/api/v4`
**Auth:** None (public API)
**CORS:** Yes
**Used for:** Word-level audio timing segments for live highlighting

### Get recitation word segments

```
GET https://api.quran.com/api/v4/recitations/7/by_chapter/{id}?fields=segments&per_page=50&page={n}
```

Recitation ID `7` = Mishari Rashid al-Afasy (used as the timing reference for all reciters).

Response `audio_files` array, each entry:

| Field | Description |
| --- | --- |
| `verse_key` | e.g. `"1:1"` |
| `segments` | Array of `[wordFrom, wordTo, timeFrom, timeTo]` |

Segment format:

- `wordFrom` — 0-based word index (inclusive)
- `wordTo` — 0-based word index (exclusive)
- `timeFrom` / `timeTo` — milliseconds within the recitation

These segments are mapped proportionally onto whatever reciter the user selected (from mp3quran.net), since exact per-reciter word timing is not available.

---

## 4. mp3quran.net API v3

**Base URL:** `https://mp3quran.net/api/v3`
**Auth:** None (public API)
**CORS:** Yes
**Used for:** Reciter list, verse-level timestamps, chapter audio URLs

### List reciters

```
GET https://mp3quran.net/api/v3/reciters?language=eng
```

Returns reciters with one or more moshaf (rewayat). Flattened into a map keyed by moshaf ID:

```json
{
  "5": {
    "name": "Abdul Basit Abdul Samad — Rewayat Hafs A'n Assem",
    "folderUrl": "https://server7.mp3quran.net/basit/"
  }
}
```

The moshaf ID is also the `readId` used for verse timing lookups.

### Verse timings

```
GET https://mp3quran.net/api/v3/ayat_timing?surah={surahId}&read={readId}
```

Per-verse start/end timestamps (milliseconds) for a surah + reciter combination. Normalized to:

```json
{
  "1:1": { "startTime": 0, "endTime": 3520 },
  "1:2": { "startTime": 3520, "endTime": 9100 }
}
```

### Audio file URL

Audio URLs are constructed directly — not fetched:

```
{folderUrl}{surahNumber padded to 3 digits}.mp3
```

Example: `https://server7.mp3quran.net/basit/001.mp3`

Utility: `getChapterAudioUrl(folderUrl, surahNumber)` in `src/utils/api.ts`

---

## Word Highlighting Notes

Word segments come from Mishari (recitation 7) and are mapped proportionally to whatever reciter the user selected. If the mp3quran verse window is >1.6× the QF segment duration, a ta'awwudh/basmala prefix is assumed and segments are aligned to the **end** of the verse window rather than the start.
