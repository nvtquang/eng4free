/**
 * Function words: auxiliaries, modals, prepositions, pronouns, determiners and conjunctions. A
 * lesson uses them everywhere, and a match is usually a different word ("can" the modal is not
 * "can" the noun), so they are never offered as new words.
 */
const FUNCTION_WORDS = new Set(("a an the and or but so if because than then as of to in on at by for with without from into onto up down out off over under after before about around through during until since " +
  "be is are was were been being am do does did done have has had having can could will would shall should may might must " +
  "i you he she it we they me him her us them my your his its our their mine yours this that these those there here " +
  "not no all some any each every both either neither what when where who whom whose why how which").split(" "));

/** Lower-case word forms a token may be an inflection of: "visited" → visit, "studies" → study. */
function baseForms(token: string): string[] {
  const forms = [token];
  if (token.endsWith("ies") && token.length > 4) forms.push(`${token.slice(0, -3)}y`);
  if (token.endsWith("es") && token.length > 3) forms.push(token.slice(0, -2));
  if (token.endsWith("s") && !token.endsWith("ss") && token.length > 3) forms.push(token.slice(0, -1));
  if (token.endsWith("ied") && token.length > 4) forms.push(`${token.slice(0, -3)}y`);
  if (token.endsWith("ed") && token.length > 4) forms.push(token.slice(0, -2), token.slice(0, -1));
  if (token.endsWith("ing") && token.length > 5) forms.push(token.slice(0, -3), `${token.slice(0, -3)}e`);
  return forms;
}

/**
 * The candidate words that occur in a lesson's text, in order of first appearance, at most
 * `limit`. Single words also match common inflections; multi-word headwords match as phrases.
 */
export function findWordsInText<T extends { headword: string }>(text: string, candidates: readonly T[], limit: number): T[] {
  const tokens = text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/gu) ?? [];
  const firstIndex = new Map<string, number>();
  tokens.forEach((token, index) => { for (const form of baseForms(token)) if (!firstIndex.has(form)) firstIndex.set(form, index); });
  const joined = ` ${tokens.join(" ")} `;
  const found: Array<{ word: T; position: number }> = [];
  const seen = new Set<string>();
  for (const word of candidates) {
    const headword = word.headword.toLowerCase().trim();
    if (seen.has(headword) || FUNCTION_WORDS.has(headword)) continue;
    let position: number | undefined;
    if (headword.includes(" ")) {
      const at = joined.indexOf(` ${headword} `);
      if (at >= 0) position = joined.slice(0, at).split(" ").length - 1;
    } else position = firstIndex.get(headword);
    if (position === undefined) continue;
    seen.add(headword);
    found.push({ word, position });
  }
  return found.sort((a, b) => a.position - b.position).slice(0, limit).map((item) => item.word);
}
