import { describe, expect, it } from "vitest";
import { projectProgress, type ProgressEvent } from "./progress";
const at = (day: string, type: ProgressEvent["type"]): ProgressEvent => ({ id: day, userId: null, guestId: "g", type, skill: "READING", metadata: {}, occurredAt: new Date(`${day}T12:00:00.000Z`) });
describe("progress projection", () => {
  it("derives XP and consecutive-day streak in an explicit timezone", () => { const snapshot = projectProgress([at("2026-09-20", "EXAM_COMPLETED"), at("2026-09-21", "VOCAB_REVIEWED")], new Date("2026-09-21T20:00:00Z"), "UTC"); expect(snapshot.xp).toBe(31); expect(snapshot.streakDays).toBe(2); expect(snapshot.skillEvents.READING).toBe(2); });
  it("does not multiply XP when the event collection is deduplicated", () => { const event = at("2026-09-21", "WRITING_SUBMITTED"); expect(projectProgress([event], new Date("2026-09-21T13:00:00Z"), "UTC").xp).toBe(20); });
});
