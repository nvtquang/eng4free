import { describe, expect, it } from "vitest";
import { decideReminder, localDay, localHour } from "./schedule";

/** A moment in Vietnam time (UTC+7). */
const vn = (day: string, time = "19:05") => new Date(`${day}T${time}:00+07:00`);
const base = { hour: 19, lastSentAt: null, enabledAt: vn("2026-09-01", "08:00") };

describe("study reminder schedule", () => {
  it("uses the day and hour in Vietnam", () => {
    expect(localDay(new Date("2026-10-02T18:30:00Z"))).toBe("2026-10-03");
    expect(localHour(new Date("2026-10-02T12:05:00Z"))).toBe(19);
  });

  it("sends only at the chosen hour, once a day, and not after studying today", () => {
    const lastActivity = vn("2026-10-01", "21:00");
    expect(decideReminder({ ...base, now: vn("2026-10-02"), lastActivity })).toBe("keep-streak");
    expect(decideReminder({ ...base, now: vn("2026-10-02", "18:59"), lastActivity })).toBeNull();
    expect(decideReminder({ ...base, now: vn("2026-10-02"), lastActivity, lastSentAt: vn("2026-10-02", "19:00") })).toBeNull();
    expect(decideReminder({ ...base, now: vn("2026-10-02"), lastActivity: vn("2026-10-02", "07:00") })).toBeNull();
  });

  it("sends daily for a week after the last study day, then weekly until day 30, then stops", () => {
    const lastActivity = vn("2026-09-01", "20:00");
    const kind = (day: string) => decideReminder({ ...base, now: vn(day), lastActivity });
    expect(kind("2026-09-03")).toBe("daily");
    expect(kind("2026-09-08")).toBe("daily");
    expect(kind("2026-09-09")).toBe("come-back");
    expect(kind("2026-09-10")).toBeNull();
    expect(kind("2026-09-16")).toBe("come-back");
    expect(kind("2026-09-30")).toBe("come-back");
    expect(kind("2026-10-07")).toBeNull();
  });

  it("counts from the day reminders were turned on for someone who has not studied since", () => {
    const enabledAt = vn("2026-10-01", "08:00");
    expect(decideReminder({ ...base, enabledAt, now: vn("2026-10-01"), lastActivity: null })).toBe("daily");
    expect(decideReminder({ ...base, enabledAt, now: vn("2026-10-09"), lastActivity: vn("2026-08-01") })).toBe("come-back");
    expect(decideReminder({ ...base, enabledAt, now: vn("2026-12-01"), lastActivity: null })).toBeNull();
  });
});
