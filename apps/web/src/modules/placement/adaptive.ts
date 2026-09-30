/**
 * Adaptive placement: each auto-scored skill gets a short staircase of questions. It starts
 * at the learner's self-assessed level (B1 when unknown), moves up one level after a correct
 * answer and down one after a wrong one. A skill's level is the highest level where the
 * learner answered at least two thirds of that level's questions correctly.
 *
 * Everything here is pure: the server keeps the state and the answer key, and the browser
 * only ever sees the current question.
 */
export const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_ORDER)[number];
export const PLACEMENT_SKILLS = ["GRAMMAR", "VOCABULARY", "READING", "LISTENING"] as const;
export type PlacementSkill = (typeof PLACEMENT_SKILLS)[number];
export const QUESTIONS_PER_SKILL = 5;
export const PLACEMENT_TOTAL = PLACEMENT_SKILLS.length * QUESTIONS_PER_SKILL;
export const DEFAULT_START_LEVEL: CefrLevel = "B1";

export type BankItem = { id: string; skill: PlacementSkill; level: CefrLevel };
/** One asked question; `correct` is null while it waits for an answer. */
export type AskedItem = { itemId: string; skill: PlacementSkill; level: CefrLevel; correct: boolean | null };
export type PlacementState = { startLevel: CefrLevel; asked: AskedItem[] };
export type PlacementResult = { skills: Record<PlacementSkill, CefrLevel>; overall: CefrLevel; correct: number; total: number };

const indexOf = (level: CefrLevel) => CEFR_ORDER.indexOf(level);
const clampLevel = (index: number): CefrLevel => CEFR_ORDER[Math.min(CEFR_ORDER.length - 1, Math.max(0, index))]!;

export function isCefrLevel(value: unknown): value is CefrLevel {
  return typeof value === "string" && (CEFR_ORDER as readonly string[]).includes(value);
}

/** The question waiting for an answer, if any. */
export function pendingItem(state: PlacementState): AskedItem | null {
  const last = state.asked.at(-1);
  return last && last.correct === null ? last : null;
}

/** The skill being tested now: the first one with fewer than QUESTIONS_PER_SKILL answers. */
export function currentSkill(state: PlacementState): PlacementSkill | null {
  return PLACEMENT_SKILLS.find((skill) => state.asked.filter((item) => item.skill === skill && item.correct !== null).length < QUESTIONS_PER_SKILL) ?? null;
}

/** Level of the next question for a skill: walk the staircase from the start level. */
export function nextLevel(state: PlacementState, skill: PlacementSkill): CefrLevel {
  let index = indexOf(state.startLevel);
  for (const item of state.asked) if (item.skill === skill && item.correct !== null) index = indexOf(clampLevel(indexOf(item.level) + (item.correct ? 1 : -1)));
  return clampLevel(index);
}

/**
 * An unused item of the skill at the wanted level. When that level is used up, the nearest
 * level with items left is taken (lower first on a tie, so the test errs on the easy side).
 */
export function pickItem(bank: BankItem[], state: PlacementState, skill: PlacementSkill, level: CefrLevel, random: () => number = Math.random): BankItem | null {
  const used = new Set(state.asked.map((item) => item.itemId));
  const target = indexOf(level);
  for (let distance = 0; distance < CEFR_ORDER.length; distance++) {
    for (const index of [target - distance, target + distance]) {
      if (index < 0 || index >= CEFR_ORDER.length) continue;
      const options = bank.filter((item) => item.skill === skill && item.level === CEFR_ORDER[index] && !used.has(item.id));
      if (options.length) return options[Math.floor(random() * options.length)]!;
    }
  }
  return null;
}

/** Queues the next question, or leaves the state unchanged when every skill is finished (or the bank is empty). */
export function advance(bank: BankItem[], state: PlacementState, random?: () => number): PlacementState {
  if (pendingItem(state)) return state;
  const skill = currentSkill(state);
  if (!skill) return state;
  const item = pickItem(bank, state, skill, nextLevel(state, skill), random);
  if (!item) return state;
  return { ...state, asked: [...state.asked, { itemId: item.id, skill: item.skill, level: item.level, correct: null }] };
}

/** Records the answer to the pending question. */
export function recordAnswer(state: PlacementState, itemId: string, correct: boolean): PlacementState {
  const pending = pendingItem(state);
  if (!pending || pending.itemId !== itemId) throw new Error("That question is not the one being asked");
  return { ...state, asked: [...state.asked.slice(0, -1), { ...pending, correct }] };
}

export function isFinished(state: PlacementState): boolean {
  return currentSkill(state) === null;
}

/** Highest level with at least two thirds of its questions correct; A1 when none qualifies. */
export function skillLevel(asked: AskedItem[]): CefrLevel {
  let best = 0;
  for (const [index, level] of CEFR_ORDER.entries()) {
    const atLevel = asked.filter((item) => item.level === level && item.correct !== null);
    const correct = atLevel.filter((item) => item.correct).length;
    if (correct > 0 && correct * 3 >= atLevel.length * 2) best = index;
  }
  return CEFR_ORDER[best]!;
}

/** The overall level is the lower median of the skill levels, so one strong skill does not inflate it. */
export function overallLevel(levels: CefrLevel[]): CefrLevel {
  if (!levels.length) return "A1";
  const sorted = levels.map(indexOf).sort((a, b) => a - b);
  return CEFR_ORDER[sorted[Math.floor((sorted.length - 1) / 2)]!]!;
}

export function placementResult(state: PlacementState): PlacementResult {
  const skills = Object.fromEntries(PLACEMENT_SKILLS.map((skill) => [skill, skillLevel(state.asked.filter((item) => item.skill === skill))])) as Record<PlacementSkill, CefrLevel>;
  const answered = state.asked.filter((item) => item.correct !== null);
  return { skills, overall: overallLevel(Object.values(skills)), correct: answered.filter((item) => item.correct).length, total: answered.length };
}
