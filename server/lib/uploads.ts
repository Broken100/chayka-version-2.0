/**
 * Multer configuration for the local-disk image upload pipeline (D1).
 *
 * Stores files in `server/uploads/` with a UUID v4 filename + the original
 * extension. Limits: 5 MB, mime allowlist of `image/jpeg`, `image/png`,
 * `image/webp`. The configured `multer` instance is exported (not the raw
 * factory) so callers can mount `upload.single('file')` directly.
 */
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const UPLOADS_DIR = 'server/uploads';
export const UPLOAD_FIELD = 'file';

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
] as const;

export type AllowedMime = (typeof ALLOWED_MIME_TYPES)[number];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    const safeExt = ext || mimeToExt(file.mimetype);
    cb(null, `${randomUUID()}${safeExt}`);
  }
});

function mimeToExt(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    default:
      return '';
  }
}

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype as AllowedMime)) {
    cb(null, true);
    return;
  }
  // Reject: pass an Error so the centralized error handler can render it.
  // We tag it with a `status` field via a custom property.
  const err = new Error('Unsupported file type') as Error & { status?: number };
  err.status = 415;
  cb(err);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_UPLOAD_BYTES }
});

/**
 * Multer error subclass for hand-rolled 413/415 responses.
 *
 * The global error handler in `server/app.ts` reads `err.status` and surfaces
 * it. For multer's `LIMIT_FILE_SIZE` we translate to HTTP 413.
 */
export class UploadError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'UploadError';
  }
}

/**
 * Wraps a multer middleware in a tiny adapter that converts multer's
 * `MulterError` into an `UploadError` with the proper status code:
 *   - `LIMIT_FILE_SIZE` → 413
 *   - any other → rethrow as-is
 *
 * Callers use the wrapped middleware the same way as raw `upload.single(...)`.
 */
export function uploadSingle(field: string = UPLOAD_FIELD) {
  const handler = upload.single(field);
  return (req: Request, res: import('express').Response, next: import('express').NextFunction) => {
    handler(req, res, (err: unknown) => {
      if (!err) {
        next();
        return;
      }
      const e = err as { name?: string; code?: string; message?: string };
      if (e.name === 'MulterError' && e.code === 'LIMIT_FILE_SIZE') {
        next(new UploadError(413, 'File too large (max 5 MB)'));
        return;
      }
      // fileFilter rejections already include a `status` property.
      if (e && typeof e === 'object' && 'status' in e) {
        const status = (e as { status?: number }).status ?? 400;
        const message = e.message ?? 'Upload failed';
        next(new UploadError(status, message));
        return;
      }
      next(err);
    });
  };
}
