import { eq } from 'drizzle-orm';
import type { Request, Response, NextFunction } from 'express';
import { db } from '../db/client.js';
import { adminSessions } from '../db/schema.js';

export const SESSION_COOKIE = 'chayka_session';

/** Middleware: requires a valid session cookie. 401 if missing or expired. */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  db.select()
    .from(adminSessions)
    .where(eq(adminSessions.token, token))
    .limit(1)
    .then((rows) => {
      if (rows.length === 0) {
        res.status(401).json({ error: 'Invalid session' });
        return;
      }
      const session = rows[0];
      if (new Date(session.expiresAt) < new Date()) {
        db.delete(adminSessions)
          .where(eq(adminSessions.token, token))
          .then(() => {})
          .catch(() => {});
        res.status(401).json({ error: 'Session expired' });
        return;
      }
      // Attach a lightweight admin flag for route handlers that need it
      (req as Request & { adminSession: typeof session }).adminSession = session;
      next();
    })
    .catch((err) => {
      console.error('[auth middleware]', err);
      res.status(500).json({ error: 'Internal server error' });
    });
}
