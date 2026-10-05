/**
 * Rules for the vocabulary catalogue, shared by the CMS editor and the vocab:* scripts.
 * A word may be published only when it passes checkCatalogEntry: a level and part of speech
 * from the lists, IPA in /slashes/, a Vietnamese meaning, a source and licence for the level,
 * meaning and IPA, and an original example of 4+ words that uses the headword.
 */
export type Source = { name: string; url: string; license: string };
export type SenseGroup = { sense: string; words: string[] };
/** A reviewer's pick: a whole group (2) or one word within a group ("2.1"). */
export type SensePick = number | string;
export type CatalogAttribution = { ipaUs?: string | null; sense?: string; sources?: Partial<Record<"level" | "meaning" | "ipa" | "example", Source>> };
export type CatalogEntry = { headword: string; partOfSpeech: string | null; cefrLevel: string | null; ipa: string | null; meaning: string | null; example: string | null; attribution: CatalogAttribution };
export type CatalogIssue = { item: string; problem: string };

export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export const PARTS_OF_SPEECH = ["noun", "verb", "adjective", "adverb"] as const;
export const WIKTIONARY_LICENSE = "CC BY-SA 4.0";
/** Source recorded when an editor writes a field by hand instead of taking Wiktionary's. */
export const EDITOR_SOURCE: Source = { name: "English 4 Free editors", url: "https://github.com/nvtquang/eng4free", license: "English 4 Free original content" };
export const EXAMPLE_SOURCE: Source = { name: "English 4 Free", url: "https://github.com/nvtquang/eng4free", license: "English 4 Free original content" };

export function wiktionarySource(headword: string, field: "meaning" | "ipa"): Source {
  const page = `https://en.wiktionary.org/wiki/${encodeURIComponent(headword)}`;
  return field === "meaning"
    ? { name: "English Wiktionary (via kaikki.org)", url: `${page}#Translations`, license: WIKTIONARY_LICENSE }
    : { name: "English Wiktionary", url: `${page}#Pronunciation`, license: WIKTIONARY_LICENSE };
}

const PLACEHOLDER = /(placeholder|original[- ]answer|example \d+ using|original example|lorem ipsum|\btodo\b|\btbd\b|xxx|sample text|\[insert|to be written)/iu;

export function isSensePick(value: unknown): value is SensePick {
  return (typeof value === "number" && Number.isInteger(value) && value >= 0) || (typeof value === "string" && /^\d+(?:\.\d+)?$/u.test(value));
}

/** The meaning (first four words, in pick order) and the English sense of a reviewer's pick. */
export function meaningFromChoice(groups: SenseGroup[], choice: SensePick[]): { meaning: string; sense: string } {
  if (!choice.length) throw new Error("Pick at least one sense group");
  const words: string[] = [];
  const picked: number[] = [];
  for (const pick of choice) {
    const [groupPart, wordPart] = String(pick).split(".");
    const group = groups[Number(groupPart)];
    if (!group) throw new Error(`No sense group ${pick}`);
    const chosen = wordPart === undefined ? group.words : [group.words[Number(wordPart)]];
    if (chosen.some((word) => word === undefined)) throw new Error(`No word ${pick}`);
    for (const word of chosen as string[]) if (!words.includes(word)) words.push(word);
    if (!picked.includes(Number(groupPart))) picked.push(Number(groupPart));
  }
  return { meaning: words.slice(0, 4).join("; "), sense: picked.map((index) => groups[index]!.sense).filter(Boolean).join("; ") };
}

/** True when the sentence uses the headword or a regular form of it (stem plus up to 4 letters). */
export function mentionsHeadword(sentence: string, headword: string): boolean {
  const lower = sentence.toLowerCase();
  const stem = headword.replace(/(e|y)$/u, "");
  return new RegExp(`\\b(${headword}|${stem}[a-z]{0,4})\\b`, "u").test(lower) || lower.includes(headword);
}

export function checkCatalogEntry(entry: CatalogEntry): CatalogIssue[] {
  const issues: CatalogIssue[] = [];
  const item = `vocab ${entry.headword} (${entry.partOfSpeech}, ${entry.cefrLevel})`;
  const problem = (text: string) => issues.push({ item, problem: text });
  if (!LEVELS.includes(entry.cefrLevel as (typeof LEVELS)[number])) problem(`unexpected level "${entry.cefrLevel}"`);
  if (!PARTS_OF_SPEECH.includes(entry.partOfSpeech as (typeof PARTS_OF_SPEECH)[number])) problem(`unexpected part of speech "${entry.partOfSpeech}"`);
  if (!entry.ipa || !/^\/[^/]+\/$/u.test(entry.ipa)) problem(`IPA "${entry.ipa ?? ""}" is not in /slashes/`);
  if (entry.attribution.ipaUs && !/^\/[^/]+\/$/u.test(entry.attribution.ipaUs)) problem(`US IPA "${entry.attribution.ipaUs}" is not in /slashes/`);
  if (!entry.meaning?.trim() || PLACEHOLDER.test(entry.meaning)) problem("Vietnamese meaning missing");
  for (const field of ["level", "meaning", "ipa"] as const) {
    const source = entry.attribution.sources?.[field];
    if (!source?.url?.startsWith("https://") || !source.license) problem(`${field} source or licence missing`);
  }
  const example = entry.example?.trim();
  if (!example) problem("example sentence missing");
  else {
    if (PLACEHOLDER.test(example)) problem(`example contains placeholder text: "${example.match(PLACEHOLDER)?.[0]}"`);
    const words = example.split(/\s+/u).length;
    if (words < 4) problem(`example is too short (${words} words, expected ≥ 4)`);
    if (example.length > 220) problem(`example is too long (${example.length} chars)`);
    if (!mentionsHeadword(example, entry.headword)) problem(`example does not use "${entry.headword}": ${example}`);
  }
  return issues;
}
