import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'node:events';
import type { Request, Response, NextFunction } from 'express';
import { requestTimeout, REQUEST_TIMEOUT_MS } from '../lib/timeout.js';

type MockResponse = Response & { body: unknown };

function makeRes(): MockResponse {
  const emitter = new EventEmitter();
  const state: { statusCode: number; body: unknown } = { statusCode: 200, body: undefined };
  const res = emitter as unknown as MockResponse;
  Object.defineProperty(res, 'headersSent', { value: false, writable: true });
  Object.defineProperty(res, 'statusCode', {
    get: () => state.statusCode
  });
  Object.defineProperty(res, 'body', {
    get: () => state.body
  });
  (res as unknown as { status(code: number): MockResponse }).status = function (code: number) {
    state.statusCode = code;
    return res;
  };
  (res as unknown as { json(payload: unknown): MockResponse }).json = function (payload: unknown) {
    state.body = payload;
    (res as unknown as { headersSent: boolean }).headersSent = true;
    emitter.emit('finish');
    return res;
  };
  return res;
}

describe('5s request timeout middleware', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exports a 5000 ms timeout', () => {
    expect(REQUEST_TIMEOUT_MS).toBe(5_000);
  });

  it('sends 504 with { error: "Request timeout" } when the handler is still pending at 5s', () => {
    const mw = requestTimeout();
    const res = makeRes();
    const next = vi.fn();
    mw({} as Request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.headersSent).toBe(false);

    vi.advanceTimersByTime(REQUEST_TIMEOUT_MS - 1);
    expect(res.headersSent).toBe(false);

    vi.advanceTimersByTime(1);
    expect(res.headersSent).toBe(true);
    expect(res.statusCode).toBe(504);
    expect(res.body).toEqual({ error: 'Request timeout' });
  });

  it('passes through unchanged when the response finishes before the timer fires', () => {
    const mw = requestTimeout();
    const res = makeRes();
    const next = vi.fn();
    mw({} as Request, res, next);

    // Fast handler finishes in 200 ms with status 200.
    vi.advanceTimersByTime(200);
    res.status(200).json({ ok: true });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });

    // Advancing past the timeout should NOT trigger another response.
    vi.advanceTimersByTime(10_000);
    expect(res.statusCode).toBe(200);
  });
});
