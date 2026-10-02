import { randomUUID } from "node:crypto";
import { deleteLocalRecording, readLocalRecording, saveLocalRecording, validateLocalRecording } from "./local-media-service";
import { deleteStorageObject, getStorageObject, isS3StorageConfigured, putStorageObject } from "./s3-media-service";

/**
 * Learner recordings. With S3/R2 configured they go to the bucket under `recordings/`, which
 * works on serverless hosts and across instances; otherwise they stay on the local disk
 * (`local-recordings/`), which only suits a single long-running server. The storage key says
 * where each file lives, so recordings saved before a switch stay readable.
 */
const S3_PREFIX = "recordings/";
const extensions: Record<string, string> = { "audio/ogg": "ogg", "audio/mp4": "m4a", "audio/wav": "wav" };

export async function saveRecording(input: { bytes: Uint8Array; contentType: string }): Promise<{ storageKey: string; byteSize: number }> {
  if (!isS3StorageConfigured()) return saveLocalRecording(input);
  validateLocalRecording(input.contentType, input.bytes.byteLength);
  const type = input.contentType.split(";", 1)[0]!.trim().toLowerCase();
  const storageKey = `${S3_PREFIX}${randomUUID()}.${extensions[type] ?? "webm"}`;
  await putStorageObject(storageKey, input.bytes, type);
  return { storageKey, byteSize: input.bytes.byteLength };
}

export async function readRecording(storageKey: string): Promise<Uint8Array<ArrayBuffer>> {
  if (storageKey.startsWith(S3_PREFIX)) return new Uint8Array(await getStorageObject(storageKey));
  return new Uint8Array(await readLocalRecording(storageKey));
}

/** Deletes a recording wherever it lives; returns false for keys that are not recordings. */
export async function deleteRecording(storageKey: string): Promise<boolean> {
  if (storageKey.startsWith(S3_PREFIX)) { await deleteStorageObject(storageKey); return true; }
  return deleteLocalRecording(storageKey);
}

export function isRecordingKey(storageKey: string): boolean {
  return storageKey.startsWith(S3_PREFIX) || storageKey.startsWith("local-recordings/");
}
