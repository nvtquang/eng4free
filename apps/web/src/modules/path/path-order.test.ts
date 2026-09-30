import { describe, expect, it } from "vitest";
import { buildLevelPath, lessonAfter, nextInPath, type PathLesson } from "./path-order";

const lesson = (id: string, level: string, unitTitle: string): PathLesson => ({ id, level, unitTitle, slug: id, title: id, skill: "GRAMMAR", estimatedMinutes: 10 });
const lessons = [lesson("a1-1", "A1", "Hello"), lesson("a1-2", "A1", "Hello"), lesson("a1-3", "A1", "Family"), lesson("a2-1", "A2", "Travel"), lesson("b1-1", "B1", "Work")];

describe("learning path", () => {
  it("suggests the first unfinished lesson at or above the learner's level", () => {
    expect(nextInPath(lessons, new Set(), "A2")?.id).toBe("a2-1");
    expect(nextInPath(lessons, new Set(["a2-1"]), "A2")?.id).toBe("b1-1");
    expect(nextInPath(lessons, new Set(["a2-1", "b1-1"]), "A2")?.id).toBe("a1-1");
    expect(nextInPath(lessons, new Set(lessons.map((item) => item.id)), "A1")).toBeNull();
  });

  it("offers the next unfinished lesson after the one just finished", () => {
    expect(lessonAfter(lessons, new Set(["a1-1"]), "a1-1")?.id).toBe("a1-2");
    expect(lessonAfter(lessons, new Set(["a1-1", "a1-2", "a1-3"]), "a1-1")?.id).toBe("a2-1");
    expect(lessonAfter(lessons, new Set(lessons.map((item) => item.id)), "a1-2")?.id).toBe("a1-3");
    expect(lessonAfter(lessons, new Set(), "b1-1")).toBeNull();
  });

  it("groups a level by unit and marks done, current and to-do lessons", () => {
    const path = buildLevelPath(lessons, new Set(["a1-1"]), "A1");
    expect(path).toMatchObject({ completed: 1, total: 3, next: { id: "a1-2" } });
    expect(path.units.map((unit) => [unit.title, unit.lessons.map((item) => item.status)])).toEqual([["Hello", ["done", "current"]], ["Family", ["todo"]]]);
  });
});
