import { describe, expect, it } from "vitest";
import { assertContentTransition, canTransitionContent } from "./workflow";
describe("content workflow", () => { it("allows review and publishing through approved state", () => { expect(canTransitionContent("DRAFT", "REVIEW")).toBe(true); expect(canTransitionContent("APPROVED", "PUBLISHED")).toBe(true); }); it("rejects a direct draft-to-published transition", () => { expect(() => assertContentTransition("DRAFT", "PUBLISHED")).toThrow("Invalid content transition"); }); });
