import type { Request, Response, NextFunction } from 'express';

export const REQUEST_TIMEOUT_MS = 5_000;

/**
 * Aborts a request with HTTP 504 if the handler has not finished within
 * REQUEST_TIMEOUT_MS. The timer is cleared as soon as the response
 * finishes or the underlying connection closes.
 */
export function requestTimeout() {
  return function requestTimeoutMiddleware(
    _req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({ error: 'Request timeout' });
      }
    }, REQUEST_TIMEOUT_MS);
    const clear = () => clearTimeout(timer);
    res.on('finish', clear);
    res.on('close', clear);
    next();
  };
}
