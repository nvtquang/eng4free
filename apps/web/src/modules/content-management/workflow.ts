import { z } from "zod";
export const ContentStatusSchema = z.enum(["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"]);
export type ContentStatus = z.infer<typeof ContentStatusSchema>;
export const ContentTransitionSchema = z.object({ batchId: z.string().uuid(), nextStatus: ContentStatusSchema });
const transitions: Record<ContentStatus, readonly ContentStatus[]> = { DRAFT: ["REVIEW", "ARCHIVED"], REVIEW: ["DRAFT", "APPROVED", "ARCHIVED"], APPROVED: ["REVIEW", "PUBLISHED", "ARCHIVED"], PUBLISHED: ["ARCHIVED"], ARCHIVED: ["DRAFT"] };
export function canTransitionContent(from: ContentStatus, to: ContentStatus) { return transitions[from].includes(to); }
export function assertContentTransition(from: ContentStatus, to: ContentStatus) { if (!canTransitionContent(from, to)) throw new Error(`Invalid content transition: ${from} → ${to}`); }
