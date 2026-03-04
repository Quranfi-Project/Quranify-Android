// src/utils/api.ts
import axios from 'axios';

const ALQURAN_BASE = 'https://api.alquran.cloud/v1';
// api.qurancdn.com has access-control-allow-origin: *, safe to call directly from browser
const QURANCDN_BASE = 'https://api.qurancdn.com/api/qdc';
// api.quran.com/v4 for segments (qurancdn recitations endpoint doesn't return segments)
const QURAN_V4_BASE = 'https://api.quran.com/api/v4';
const PER_PAGE = 50;

function stripHtml(html: string): string {
  return html
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

// Strip Uthmani pause/stop markers (U+06D6–U+06DC, U+06DD–U+06ED) that render
// as inline dots or circles in non-Quranic-typography fonts.
// U+0670 (superscript alef) is preserved — it is part of actual word spelling.
function stripUthmaniMarks(text: string): string {
  return text.replace(/[\u06D6-\u06ED]/g, '').trim();
}

// Matches the Bismillah prefix regardless of alef variant (ا/ٱ/أ/إ/آ) or diacritics.
// Used to strip the prepended Bismillah from ayah 1 of surahs 2–113 (except 9).
const D = '[\\u0610-\\u065F\\u0670]*'; // optional Arabic diacritics
const ALEF = '[\\u0622\\u0623\\u0625\\u0627\\u0671]'; // alef variants
const BISMILLAH_RE = new RegExp(
  `^\\u0628${D}\\u0633${D}\\u0645${D}\\s+` +                                    // بسم
  `${ALEF}${D}\\u0644${D}\\u0644${D}\\u0647${D}\\s+` +                          // الله
  `${ALEF}${D}\\u0644${D}\\u0631${D}\\u062D${D}\\u0645${D}\\u0646${D}\\s+` +   // الرحمن
  `${ALEF}${D}\\u0644${D}\\u0631${D}\\u062D${D}\\u064A${D}\\u0645${D}\\s*`     // الرحيم
);

// Fetch all Surahs — alquran.cloud (CORS-friendly, no auth)
export const fetchSurahs = async () => {
  const response = await axios.get(`${ALQURAN_BASE}/surah`);
  return response.data.data.map((s: any) => ({
    number: s.number,
    surahName: s.englishName,
    surahNameArabic: s.name,
    surahNameTranslation: s.englishNameTranslation,
    numberOfAyahs: s.numberOfAyahs,
    revelationType: s.revelationType,
  }));
};

// Fetch a specific Surah — alquran.cloud (CORS-friendly, no auth)
export const fetchSurah = async (surahNumber: number) => {
  const response = await axios.get(
    `${ALQURAN_BASE}/surah/${surahNumber}/editions/quran-uthmani,en.sahih`
  );
  const [arabic, english] = response.data.data;
  return {
    surahNo: surahNumber,
    surahName: arabic.englishName,
    surahNameArabic: arabic.name,
    surahNameTranslation: arabic.englishNameTranslation,
    numberOfAyahs: arabic.numberOfAyahs,
    revelationType: arabic.revelationType,
    arabic1: arabic.ayahs.map((a: any, i: number) => {
      let text = stripUthmaniMarks(a.text);
      // alquran.cloud quran-uthmani prepends Bismillah into ayah 1 for surahs 2–113 (except 9).
      // Strip it since SurahDetail already shows Bismillah in the header.
      if (surahNumber !== 1 && surahNumber !== 9 && i === 0) {
        text = text.replace(BISMILLAH_RE, '').trim();
      }
      return text;
    }),
    english: english.ayahs.map((a: any) => stripHtml(a.text)),
    globalAyahNumbers: arabic.ayahs.map((a: any) => a.number),
  };
};

// Fetch reciters — mp3quran.net (public CORS)
export const fetchReciters = async (): Promise<Record<string, { name: string; folderUrl: string }>> => {
  const response = await axios.get('https://mp3quran.net/api/v3/reciters?language=eng');
  const data: {
    reciters: Array<{
      id: number;
      name: string;
      moshaf: Array<{
        id: number;
        name: string;
        server: string;
        surah_total: number;
      }>;
    }>;
  } = response.data;

  const result: Record<string, { name: string; folderUrl: string }> = {};
  for (const reciter of data.reciters) {
    for (const moshaf of reciter.moshaf) {
      result[String(moshaf.id)] = {
        name: `${reciter.name} — ${moshaf.name}`,
        folderUrl: moshaf.server,
      };
    }
  }
  return result;
};

// Fetch verse timings — mp3quran.net (public CORS)
export const fetchVerseTimings = async (
  surahId: number,
  readId: string
): Promise<Record<string, { startTime: number; endTime: number }>> => {
  const response = await axios.get(
    `https://mp3quran.net/api/v3/ayat_timing?surah=${surahId}&read=${readId}`
  );
  const timings: Array<{ ayah: number; start_time: number; end_time: number }> = response.data;
  const result: Record<string, { startTime: number; endTime: number }> = {};
  for (const t of timings) {
    if (t.ayah > 0) {
      result[`${surahId}:${t.ayah}`] = { startTime: t.start_time, endTime: t.end_time };
    }
  }
  return result;
};

// Fetch word-by-word data — api.qurancdn.com (Quran Foundation public API, CORS-friendly)
export type WordData = {
  words: Record<string, string[]>;
  translations: Record<string, string[]>;
  segments: Record<string, [number, number, number, number][]>;
};

export const fetchWordData = async (surahId: number): Promise<WordData> => {
  // Get chapter info for verse count
  const chapterResp = await axios.get(`${QURANCDN_BASE}/chapters/${surahId}?language=en`);
  const totalVerses: number = chapterResp.data.chapter.verses_count;
  const totalPages = Math.ceil(totalVerses / PER_PAGE);
  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1);

  const [versePages, audioPages] = await Promise.all([
    Promise.all(
      pageNums.map((page) =>
        axios.get(
          `${QURANCDN_BASE}/verses/by_chapter/${surahId}?language=en&words=true&per_page=${PER_PAGE}&page=${page}`
        )
      )
    ),
    // Use api.quran.com/v4 for segments — qurancdn endpoint returns empty audio_files without segments
    Promise.all(
      pageNums.map((page) =>
        axios.get(
          `${QURAN_V4_BASE}/recitations/7/by_chapter/${surahId}?fields=segments&per_page=${PER_PAGE}&page=${page}`
        )
      )
    ),
  ]);

  const allVerses: any[] = versePages.flatMap((r) => r.data.verses ?? []);
  const allAudioFiles: any[] = audioPages.flatMap((r) => r.data.audio_files ?? []);

  const segments: Record<string, [number, number, number, number][]> = {};
  for (const af of allAudioFiles) {
    if (af?.verse_key && Array.isArray(af.segments) && af.segments.length > 0) {
      segments[af.verse_key] = af.segments;
    }
  }

  const words: Record<string, string[]> = {};
  const translations: Record<string, string[]> = {};
  for (const verse of allVerses) {
    if (!verse) continue;
    const verseKey: string = verse.verse_key;
    const wordItems: any[] = (verse.words ?? []).filter(
      (w: any) => w.char_type_name === 'word'
    );
    if (wordItems.length > 0) {
      words[verseKey] = wordItems.map((w: any) => w.text_uthmani ?? w.text ?? '');
      translations[verseKey] = wordItems.map((w: any) =>
        stripHtml(w.translation?.text ?? '')
      );
    }
  }

  return { words, translations, segments };
};

// Construct chapter audio URL
export const getChapterAudioUrl = (folderUrl: string, surahNumber: number): string => {
  return `${folderUrl}${surahNumber.toString().padStart(3, '0')}.mp3`;
};

// Page-based Quran reading (Madina Mushaf, 604 pages)
export type QuranPageAyah = {
  number: number;
  text: string;
  numberInSurah: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
  };
};

export type QuranPageData = {
  pageNumber: number;
  ayahs: QuranPageAyah[];
};

export const fetchQuranPage = async (pageNumber: number): Promise<QuranPageData> => {
  const response = await axios.get(`${ALQURAN_BASE}/page/${pageNumber}/quran-uthmani`);
  const data = response.data.data;
  return {
    pageNumber: data.number,
    ayahs: data.ayahs.map((a: any) => {
      let text = stripUthmaniMarks(a.text);
      // alquran.cloud prepends Bismillah into the first ayah of each surah (2–113, except 9).
      // ReadingMode shows the Bismillah in the surah header, so strip it from the text.
      if (a.numberInSurah === 1 && a.surah.number !== 1 && a.surah.number !== 9) {
        text = text.replace(BISMILLAH_RE, '').trim();
      }
      return {
        number: a.number,
        text,
        numberInSurah: a.numberInSurah,
        surah: {
          number: a.surah.number,
          name: a.surah.name,
          englishName: a.surah.englishName,
          englishNameTranslation: a.surah.englishNameTranslation,
          numberOfAyahs: a.surah.numberOfAyahs,
        },
      };
    }),
  };
};
