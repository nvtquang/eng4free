import { describe, expect, it } from "vitest";
import { createWritingDiagnostics } from "./writing-service";
describe("writing diagnostics", () => { it("reports word count and minimum-length status without assigning a band", () => { const diagnostics = createWritingDiagnostics({ promptId: "task", taskType: "IELTS_TASK_2", text: "One two three.", language: "en", expectedMinimumWords: 250 }); expect(diagnostics.wordCount).toBe(3); expect(diagnostics.meetsExpectedWordCount).toBe(false); }); });
