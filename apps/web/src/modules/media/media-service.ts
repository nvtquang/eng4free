export type MediaKind = "AUDIO" | "IMAGE" | "RECORDING";
export type PendingUpload = { mediaId: string; uploadUrl: string; expiresAt: string; requiredContentType: string };
export interface MediaService { createUpload(input: { mediaId: string }): Promise<PendingUpload>; finalizeUpload(input: { mediaId: string }): Promise<{ mediaId: string; playbackUrl: string }>; }
export class MediaStorageNotConfiguredError extends Error { constructor() { super("Media storage is not configured"); this.name = "MediaStorageNotConfiguredError"; } }
export class MediaUploadValidationError extends Error { constructor(message: string) { super(message); this.name = "MediaUploadValidationError"; } }
export class UnconfiguredMediaService implements MediaService { async createUpload(): Promise<PendingUpload> { throw new MediaStorageNotConfiguredError(); } async finalizeUpload(): Promise<{ mediaId: string; playbackUrl: string }> { throw new MediaStorageNotConfiguredError(); } }
