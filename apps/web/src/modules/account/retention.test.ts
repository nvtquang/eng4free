import { describe, expect, it } from "vitest";
import { retentionPolicyFromEnv } from "./retention";

describe("retention policy", () => {
  it("uses the documented defaults", () => {
    expect(retentionPolicyFromEnv({})).toEqual({ recordingDays: 180, guestDays: 365, emptyGuestDays: 30, telemetryDays: 90 });
  });

  it("reads positive whole numbers of days and ignores anything else", () => {
    expect(retentionPolicyFromEnv({ RECORDING_RETENTION_DAYS: "90", GUEST_RETENTION_DAYS: "-1", EMPTY_GUEST_RETENTION_DAYS: "7.5" })).toEqual({ recordingDays: 90, guestDays: 365, emptyGuestDays: 30, telemetryDays: 90 });
  });
});
