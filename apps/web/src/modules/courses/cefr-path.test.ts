import { describe, expect, it } from "vitest";
import { cefrPath, getLesson } from "./cefr-path";

describe("CEFR learning path", () => {
  it("keeps every CEFR level in ascending order", () => {
    expect(cefrPath.map((item) => item.level)).toEqual(["A1", "A2", "B1", "B2", "C1", "C2"]);
  });
  it("finds a lesson regardless of level casing", () => {
    expect(getLesson("a1", "introduce-yourself")?.skill).toBe("Speaking");
  });
});
