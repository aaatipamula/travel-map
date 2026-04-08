import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3_ENDPOINT overrides the default R2 endpoint — set this when using MinIO.
// For Cloudflare R2 leave it unset and provide R2_ACCOUNT_ID instead.
const endpoint =
  process.env.S3_ENDPOINT ??
  `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const r2 = new S3Client({
  region: "auto",
  endpoint,
  // MinIO requires path-style URLs (http://host/bucket/key).
  // R2 uses virtual-hosted style (http://bucket.host/key).
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

export function r2PublicUrl(key: string): string {
  return `/photos/${key}`;
}

export async function createPresignedPutUrl(
  key: string,
  mimeType: string,
  expiresIn = 900 // 15 minutes
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
  });
  return getSignedUrl(r2, command, { expiresIn });
}

export async function putObject(
  key: string,
  body: Buffer | Uint8Array | ReadableStream,
  mimeType: string
): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: mimeType,
    })
  );
}

export async function deleteObject(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
