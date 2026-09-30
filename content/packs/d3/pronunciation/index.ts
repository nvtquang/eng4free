import type { PronunciationDef } from "../types";

/**
 * Pronunciation practice content (batch "pronunciation"): a practical English phonemic chart,
 * minimal pairs and shadowing sentences. Original English 4 Free material, not copied from a
 * proprietary teaching resource.
 */
const sounds: Array<{ symbol: string; keyword: string; examples: string[]; kind: "vowel" | "consonant" }> = [
  { symbol: "/iː/", keyword: "see", examples: ["green", "teacher"], kind: "vowel" }, { symbol: "/ɪ/", keyword: "sit", examples: ["live", "ticket"], kind: "vowel" },
  { symbol: "/e/", keyword: "bed", examples: ["lesson", "ten"], kind: "vowel" }, { symbol: "/æ/", keyword: "cat", examples: ["map", "travel"], kind: "vowel" },
  { symbol: "/ʌ/", keyword: "cup", examples: ["love", "study"], kind: "vowel" }, { symbol: "/ɑː/", keyword: "father", examples: ["start", "calm"], kind: "vowel" },
  { symbol: "/ɒ/", keyword: "hot", examples: ["watch", "coffee"], kind: "vowel" }, { symbol: "/ɔː/", keyword: "law", examples: ["talk", "course"], kind: "vowel" },
  { symbol: "/ʊ/", keyword: "put", examples: ["good", "should"], kind: "vowel" }, { symbol: "/uː/", keyword: "blue", examples: ["room", "school"], kind: "vowel" },
  { symbol: "/ɜː/", keyword: "bird", examples: ["learn", "word"], kind: "vowel" }, { symbol: "/ə/", keyword: "about", examples: ["teacher", "support"], kind: "vowel" },
  { symbol: "/eɪ/", keyword: "day", examples: ["make", "train"], kind: "vowel" }, { symbol: "/aɪ/", keyword: "my", examples: ["time", "write"], kind: "vowel" },
  { symbol: "/ɔɪ/", keyword: "boy", examples: ["choice", "enjoy"], kind: "vowel" }, { symbol: "/əʊ/", keyword: "go", examples: ["home", "open"], kind: "vowel" },
  { symbol: "/aʊ/", keyword: "now", examples: ["sound", "about"], kind: "vowel" }, { symbol: "/ɪə/", keyword: "near", examples: ["hear", "career"], kind: "vowel" },
  { symbol: "/eə/", keyword: "hair", examples: ["care", "share"], kind: "vowel" }, { symbol: "/ʊə/", keyword: "cure", examples: ["tourist", "pure"], kind: "vowel" },
  { symbol: "/p/", keyword: "pen", examples: ["happy", "stop"], kind: "consonant" }, { symbol: "/b/", keyword: "book", examples: ["job", "about"], kind: "consonant" },
  { symbol: "/t/", keyword: "tea", examples: ["water", "cat"], kind: "consonant" }, { symbol: "/d/", keyword: "day", examples: ["reading", "bad"], kind: "consonant" },
  { symbol: "/k/", keyword: "cat", examples: ["school", "back"], kind: "consonant" }, { symbol: "/g/", keyword: "go", examples: ["begin", "big"], kind: "consonant" },
  { symbol: "/f/", keyword: "fine", examples: ["coffee", "life"], kind: "consonant" }, { symbol: "/v/", keyword: "very", examples: ["travel", "leave"], kind: "consonant" },
  { symbol: "/θ/", keyword: "think", examples: ["three", "healthy"], kind: "consonant" }, { symbol: "/ð/", keyword: "this", examples: ["they", "weather"], kind: "consonant" },
  { symbol: "/s/", keyword: "see", examples: ["lesson", "bus"], kind: "consonant" }, { symbol: "/z/", keyword: "zoo", examples: ["easy", "is"], kind: "consonant" },
  { symbol: "/ʃ/", keyword: "she", examples: ["station", "wash"], kind: "consonant" }, { symbol: "/ʒ/", keyword: "vision", examples: ["usual", "measure"], kind: "consonant" },
  { symbol: "/h/", keyword: "hat", examples: ["ahead", "home"], kind: "consonant" }, { symbol: "/tʃ/", keyword: "chair", examples: ["choose", "watch"], kind: "consonant" },
  { symbol: "/dʒ/", keyword: "job", examples: ["education", "bridge"], kind: "consonant" }, { symbol: "/m/", keyword: "man", examples: ["summer", "team"], kind: "consonant" },
  { symbol: "/n/", keyword: "now", examples: ["lesson", "train"], kind: "consonant" }, { symbol: "/ŋ/", keyword: "sing", examples: ["English", "long"], kind: "consonant" },
  { symbol: "/l/", keyword: "light", examples: ["lesson", "feel"], kind: "consonant" }, { symbol: "/r/", keyword: "red", examples: ["practice", "career"], kind: "consonant" },
  { symbol: "/j/", keyword: "yes", examples: ["music", "use"], kind: "consonant" }, { symbol: "/w/", keyword: "we", examples: ["welcome", "away"], kind: "consonant" }
];

const pairs: Array<{ id: string; first: string; second: string; contrast: string[]; tip: { vi: string; en: string } }> = [
  { id: "ship-sheep", first: "ship", second: "sheep", contrast: ["/ɪ/", "/iː/"], tip: { vi: "Âm /iː/ dài hơn; giữ khóe môi căng thêm một nhịp.", en: "Make /iː/ longer; keep the corners of your mouth tense for one extra beat." } },
  { id: "bat-but", first: "bat", second: "but", contrast: ["/æ/", "/ʌ/"], tip: { vi: "Với /æ/, mở miệng rộng hơn và kéo lưỡi ra trước.", en: "For /æ/, open your mouth wider and bring your tongue forward." } },
  { id: "thin-tin", first: "thin", second: "tin", contrast: ["/θ/", "/t/"], tip: { vi: "Đặt đầu lưỡi nhẹ giữa hai răng để tạo /θ/.", en: "Place the tip of your tongue gently between your teeth for /θ/." } }
];

const shadows: Array<{ id: string; transcript: { vi: string; en: string }; targetText: string; durationSeconds: number; focusSounds: string[] }> = [
  { id: "daily-introduction", transcript: { vi: "Nghe câu mẫu, lặp lại cùng nhịp và sau đó nghe lại bản ghi của bạn.", en: "Listen to the target, repeat with its rhythm, then listen to your own recording." }, targetText: "I enjoy learning English a little every day.", durationSeconds: 4, focusSounds: ["/ɪ/", "/dʒ/", "/iː/"] }
];

const slugOf = (symbol: string) => "sound-" + [...symbol.replace(/\//gu, "")].map((char) => char.codePointAt(0)!.toString(16)).join("-");

export const pronunciationItems: PronunciationDef[] = [
  ...sounds.map((sound): PronunciationDef => ({ key: `pronunciation:sound:${sound.symbol}`, kind: "SOUND", slug: slugOf(sound.symbol), content: sound })),
  ...pairs.map(({ id, ...content }): PronunciationDef => ({ key: `pronunciation:pair:${id}`, kind: "PAIR", slug: `pair-${id}`, content })),
  ...shadows.map(({ id, ...content }): PronunciationDef => ({ key: `pronunciation:shadow:${id}`, kind: "SHADOW", slug: `shadow-${id}`, content }))
];
