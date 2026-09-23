import { describe, expect, it } from "vitest";
import { countWords } from "./repository";
describe("writing persistence helpers", () => { it("counts normalized words deterministically", () => { expect(countWords("  One   clear\nanswer. ")).toBe(3); expect(countWords("   ")).toBe(0); }); });
