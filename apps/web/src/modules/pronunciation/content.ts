import { IpaSoundSchema, MinimalPairSchema, ShadowingItemSchema, type IpaSound, type MinimalPair, type ShadowingItem } from "@english4free/content-schemas";

export type { IpaSound, MinimalPair, ShadowingItem };

// Local educational fixture: a complete practical English phonemic chart.
// It is application content, not a copy of a proprietary teaching resource.
export const ipaSounds = IpaSoundSchema.array().parse([
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
]) satisfies IpaSound[];

export const minimalPairs = MinimalPairSchema.array().parse([
  { id: "ship-sheep", first: "ship", second: "sheep", contrast: ["/ɪ/", "/iː/"], tip: { vi: "Âm /iː/ dài hơn; giữ khóe môi căng thêm một nhịp.", en: "Make /iː/ longer; keep the corners of your mouth tense for one extra beat." } },
  { id: "bat-but", first: "bat", second: "but", contrast: ["/æ/", "/ʌ/"], tip: { vi: "Với /æ/, mở miệng rộng hơn và kéo lưỡi ra trước.", en: "For /æ/, open your mouth wider and bring your tongue forward." } },
  { id: "thin-tin", first: "thin", second: "tin", contrast: ["/θ/", "/t/"], tip: { vi: "Đặt đầu lưỡi nhẹ giữa hai răng để tạo /θ/.", en: "Place the tip of your tongue gently between your teeth for /θ/." } }
]) satisfies MinimalPair[];

export const shadowingItems = ShadowingItemSchema.array().parse([
  { id: "daily-introduction", transcript: { vi: "Nghe câu mẫu, lặp lại cùng nhịp và sau đó nghe lại bản ghi của bạn.", en: "Listen to the target, repeat with its rhythm, then listen to your own recording." }, targetText: "I enjoy learning English a little every day.", durationSeconds: 4, focusSounds: ["/ɪ/", "/dʒ/", "/iː/"] }
]) satisfies ShadowingItem[];
