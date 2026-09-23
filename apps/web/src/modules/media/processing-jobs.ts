export const mediaJobTypes = ["AUDIO_NORMALIZE", "AUDIO_WAVEFORM", "SPEECH_ANALYSIS", "CONTENT_IMPORT"] as const;
export type MediaJobType = (typeof mediaJobTypes)[number];
export type MediaJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type MediaProcessingJob = { id: string; type: MediaJobType; status: MediaJobStatus; payload: Record<string, unknown>; attempts: number; error: string | null; createdAt: Date };
export function canClaimMediaJob(job: MediaProcessingJob) { return job.status === "PENDING" && job.attempts < 3; }
