import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { eq } from "drizzle-orm";
import { createDatabase } from "@/db/client";
import { media } from "@/db/schema";
import { MediaStorageNotConfiguredError, MediaUploadValidationError, type MediaService, type PendingUpload } from "./media-service";

const DEFAULT_SIGNED_URL_TTL_SECONDS = 15 * 60;
const DEFAULT_MAX_UPLOAD_BYTES = 250_000_000;

type StorageConfig = {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
  signedUrlTtlSeconds: number;
  maxUploadBytes: number;
};

function positiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getStorageConfig(): StorageConfig {
  const endpoint = process.env.S3_ENDPOINT?.trim();
  const bucket = process.env.S3_BUCKET?.trim();
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) throw new MediaStorageNotConfiguredError();
  return {
    endpoint,
    bucket,
    accessKeyId,
    secretAccessKey,
    region: process.env.S3_REGION?.trim() || "auto",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    signedUrlTtlSeconds: positiveInteger(process.env.MEDIA_SIGNED_URL_TTL_SECONDS, DEFAULT_SIGNED_URL_TTL_SECONDS),
    maxUploadBytes: positiveInteger(process.env.MEDIA_MAX_UPLOAD_BYTES, DEFAULT_MAX_UPLOAD_BYTES)
  };
}

export function isS3StorageConfigured(): boolean {
  try {
    getStorageConfig();
    return true;
  } catch {
    return false;
  }
}

function databaseOrThrow() {
  const database = createDatabase();
  if (!database) throw new Error("DATABASE_URL is required for media uploads");
  return database;
}

export class S3MediaService implements MediaService {
  private readonly client: S3Client;

  constructor(private readonly database = databaseOrThrow(), private readonly config = getStorageConfig()) {
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: config.forcePathStyle,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey }
    });
  }

  async createUpload({ mediaId }: { mediaId: string }): Promise<PendingUpload> {
    const [item] = await this.database.select().from(media).where(eq(media.id, mediaId)).limit(1);
    if (!item) throw new MediaUploadValidationError("Media item not found");
    if (item.status !== "PENDING") throw new MediaUploadValidationError("Media item is not awaiting an upload");
    if (item.byteSize > this.config.maxUploadBytes) throw new MediaUploadValidationError("Media item exceeds the configured upload limit");

    const uploadUrl = await getSignedUrl(this.client, new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: item.storageKey,
      ContentType: item.contentType
    }), { expiresIn: this.config.signedUrlTtlSeconds });

    return {
      mediaId,
      uploadUrl,
      expiresAt: new Date(Date.now() + this.config.signedUrlTtlSeconds * 1_000).toISOString(),
      requiredContentType: item.contentType
    };
  }

  async finalizeUpload({ mediaId }: { mediaId: string }): Promise<{ mediaId: string; playbackUrl: string }> {
    const [item] = await this.database.select().from(media).where(eq(media.id, mediaId)).limit(1);
    if (!item) throw new MediaUploadValidationError("Media item not found");

    let object;
    try {
      object = await this.client.send(new HeadObjectCommand({ Bucket: this.config.bucket, Key: item.storageKey }));
    } catch {
      throw new MediaUploadValidationError("Uploaded object was not found in storage");
    }
    if (object.ContentLength !== item.byteSize) throw new MediaUploadValidationError("Uploaded object size does not match media metadata");
    if (object.ContentType && object.ContentType !== item.contentType) throw new MediaUploadValidationError("Uploaded object content type does not match media metadata");

    await this.database.update(media).set({ status: "READY" }).where(eq(media.id, mediaId));
    const playbackUrl = await getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.config.bucket, Key: item.storageKey }), { expiresIn: this.config.signedUrlTtlSeconds });
    return { mediaId, playbackUrl };
  }
}

export function getConfiguredMediaService(): MediaService {
  return new S3MediaService();
}
