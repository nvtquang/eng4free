import { allowAiRequest } from "@/modules/ai-foundation/rate-limit";

/** @deprecated Use allowAiRequest with an operation-scoped key. */
export function allowTutorRequest(key: string, limit = 10, windowMs = 60 * 60 * 1_000): boolean {
  return allowAiRequest(`TUTOR_EXPLANATION:${key}`, limit, windowMs);
}
