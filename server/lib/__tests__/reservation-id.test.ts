import { describe, it, expect, vi } from 'vitest';
import { generateReservationId } from '../reservation-id.js';

describe('generateReservationId', () => {
  it('returns a RES-XXXXXX id when no collision', async () => {
    const exists = vi.fn().mockResolvedValue(false);
    const id = await generateReservationId(exists);
    expect(id).toMatch(/^RES-\d{6}$/);
    expect(exists).toHaveBeenCalledTimes(1);
  });

  it('retries on collision and returns the first non-colliding id', async () => {
    const exists = vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const id = await generateReservationId(exists);
    expect(id).toMatch(/^RES-\d{6}$/);
    expect(exists).toHaveBeenCalledTimes(2);
  });

  it('throws after 5 consecutive collisions', async () => {
    const exists = vi.fn().mockResolvedValue(true);
    await expect(generateReservationId(exists)).rejects.toThrow(/unique reservation id/);
    expect(exists).toHaveBeenCalledTimes(5);
  });
});
