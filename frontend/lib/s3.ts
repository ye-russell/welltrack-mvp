// ============================================
// WellTrack MVP — S3 Client for File Uploads
// ============================================

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// ---------------
// Client Configuration
// ---------------

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      }
    : undefined,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'welltrack-dev-files';

// ---------------
// File Upload Functions
// ---------------

export interface PresignedUploadUrl {
  uploadUrl: string;
  fileKey: string;
  expiresIn: number;
}

/**
 * Generate a presigned URL for direct file upload from the browser
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  fileType: string,
  orgId: string,
  wellId: string,
  expiresIn: number = 300 // 5 minutes
): Promise<PresignedUploadUrl> {
  const fileExtension = fileName.split('.').pop();
  const fileKey = `orgs/${orgId}/wells/${wellId}/${uuidv4()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

  return {
    uploadUrl,
    fileKey,
    expiresIn,
  };
}

/**
 * Generate a presigned URL for downloading/viewing a file
 */
export async function generatePresignedDownloadUrl(
  fileKey: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a file from S3
 */
export async function deleteFile(fileKey: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  await s3Client.send(command);
}

/**
 * Upload a file directly (server-side, not presigned)
 * Use this for server-side file processing
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string,
  orgId: string,
  wellId: string
): Promise<string> {
  const fileExtension = fileName.split('.').pop();
  const fileKey = `orgs/${orgId}/wells/${wellId}/${uuidv4()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: fileType,
  });

  await s3Client.send(command);
  
  return fileKey;
}

// ---------------
// Helper Functions
// ---------------

/**
 * Get S3 file URL (not presigned, for reference only)
 */
export function getFileUrl(fileKey: string): string {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`;
}

/**
 * Validate file size
 */
export function validateFileSize(fileSize: number, maxSizeMB: number = 100): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
}

/**
 * Validate file type
 */
export function validateFileType(fileType: string, allowedTypes: string[]): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      // Match category (e.g., "image/*")
      const category = type.split('/')[0];
      return fileType.startsWith(`${category}/`);
    }
    return fileType === type;
  });
}

/**
 * Common allowed file types for well operations
 */
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
  'image/*', // All image types
];
