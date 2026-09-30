import { describe, expect, it } from "vitest";
import { CEFR_ORDER, PLACEMENT_SKILLS, PLACEMENT_TOTAL, advance, isFinished, overallLevel, pendingItem, placementResult, recordAnswer, skillLevel, type AskedItem, type BankItem, type CefrLevel, type PlacementState } from "./adaptive";

const bank: BankItem[] = PLACEMENT_SKILLS.flatMap((skill) => CEFR_ORDER.flatMap((level) => [1, 2, 3, 4].map((n) => ({ id: `${skill}-${level}-${n}`, skill, level }))));
const first = () => 0;

/** Runs a whole test; `answers` decides correctness from the asked item. */
function run(startLevel: CefrLevel, answers: (item: AskedItem, index: number) => boolean, items = bank) {
  let state: PlacementState = advance(items, { startLevel, asked: [] }, first);
  let index = 0;
  while (pendingItem(state)) {
    const pending = pendingItem(state)!;
    state = advance(items, recordAnswer(state, pending.itemId, answers(pending, index++)), first);
  }
  return state;
}

describe("adaptive placement", () => {
  it("reaches C2 in every skill when every answer is correct", () => {
    const state = run("B1", () => true);
    expect(isFinished(state)).toBe(true);
    expect(state.asked).toHaveLength(PLACEMENT_TOTAL);
    expect(placementResult(state)).toMatchObject({ skills: { GRAMMAR: "C2", VOCABULARY: "C2", READING: "C2", LISTENING: "C2" }, overall: "C2", correct: PLACEMENT_TOTAL });
  });

  it("falls to A1 when every answer is wrong", () => {
    const result = placementResult(run("B1", () => false));
    expect(result).toMatchObject({ overall: "A1", correct: 0, total: PLACEMENT_TOTAL });
    expect(Object.values(result.skills).every((level) => level === "A1")).toBe(true);
  });

  it("settles on the start level when answers alternate right and wrong", () => {
    const result = placementResult(run("B1", (_, index) => index % 5 % 2 === 0));
    expect(result.skills.GRAMMAR).toBe("B1");
    expect(result.overall).toBe("B1");
  });

  it("finds a learner whose real level is B2 from either end", () => {
    const b2 = (item: AskedItem) => CEFR_ORDER.indexOf(item.level) <= CEFR_ORDER.indexOf("B2");
    expect(placementResult(run("A1", b2)).skills.READING).toBe("B2");
    expect(placementResult(run("C2", b2)).skills.READING).toBe("B2");
  });

  it("uses the nearest level when the wanted level has no items left", () => {
    const thin = bank.filter((item) => !(item.skill === "GRAMMAR" && item.level === "A1" && item.id.endsWith("-4")));
    const state = run("A1", () => false, thin);
    const grammar = state.asked.filter((item) => item.skill === "GRAMMAR");
    expect(grammar).toHaveLength(5);
    expect(new Set(grammar.map((item) => item.itemId)).size).toBe(5);
    expect(grammar.map((item) => item.level)).toEqual(["A1", "A1", "A1", "A2", "A2"]);
  });

  it("rejects an answer to a question that is not pending", () => {
    const state = advance(bank, { startLevel: "B1", asked: [] }, first);
    expect(() => recordAnswer(state, "GRAMMAR-C2-1", true)).toThrow();
  });

  it("needs two thirds correct at a level, and takes the lower median overall", () => {
    const asked = (level: CefrLevel, correct: boolean) => ({ itemId: `${level}-${Math.random()}`, skill: "GRAMMAR" as const, level, correct });
    expect(skillLevel([asked("B1", true), asked("B2", true), asked("C1", false), asked("B2", false), asked("B1", true)])).toBe("B1");
    expect(skillLevel([asked("B1", true), asked("B2", true), asked("C1", true), asked("C2", false), asked("C1", true)])).toBe("C1");
    expect(overallLevel(["A2", "B1", "B2", "C1"])).toBe("B1");
    expect(overallLevel(["B2", "B2", "A1", "C2"])).toBe("B2");
  });
});
