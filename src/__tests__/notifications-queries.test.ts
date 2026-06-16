import { describe, it, expect } from 'vitest';
import { rowToReservation, countInService } from '../lib/queries';
import type { ReservationRow } from '../lib/queries';

function baseRow(overrides: Partial<ReservationRow> = {}): ReservationRow {
  return {
    id: 'RES-123456',
    customerName: 'Alice',
    customerEmail: 'alice@example.com',
    customerPhone: '+593987163354',
    date: '2026-12-31',
    timeSlot: '19:00',
    tableId: 't_deck_1',
    area: 'waterfall_deck',
    guestsCount: 2,
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentReference: null,
    notes: null,
    selectedOrderItems: null,
    timestamp: '2026-12-01T00:00:00.000Z',
    serviceStatus: 'not_checked_in',
    checkedInAt: null,
    serviceStartedAt: null,
    serviceCompletedAt: null,
    ...overrides
  };
}

describe('rowToReservation', () => {
  it('maps a freshly-fetched row into the Reservation shape with default service status', () => {
    const r = rowToReservation(baseRow());
    expect(r.id).toBe('RES-123456');
    expect(r.serviceStatus).toBe('not_checked_in');
    expect(r.checkedInAt).toBeNull();
    expect(r.serviceStartedAt).toBeNull();
    expect(r.serviceCompletedAt).toBeNull();
  });

  it('preserves valid serviceStatus values verbatim', () => {
    expect(rowToReservation(baseRow({ serviceStatus: 'checked_in' })).serviceStatus).toBe(
      'checked_in'
    );
    expect(rowToReservation(baseRow({ serviceStatus: 'in_service' })).serviceStatus).toBe(
      'in_service'
    );
    expect(rowToReservation(baseRow({ serviceStatus: 'completed' })).serviceStatus).toBe(
      'completed'
    );
  });

  it('coerces unknown serviceStatus values to not_checked_in for legacy rows', () => {
    expect(rowToReservation(baseRow({ serviceStatus: '' as never })).serviceStatus).toBe(
      'not_checked_in'
    );
    expect(rowToReservation(baseRow({ serviceStatus: 'garbage' as never })).serviceStatus).toBe(
      'not_checked_in'
    );
  });

  it('forwards the three service timestamps', () => {
    const r = rowToReservation(
      baseRow({
        serviceStatus: 'in_service',
        checkedInAt: '2026-12-31T18:00:00.000Z',
        serviceStartedAt: '2026-12-31T18:30:00.000Z',
        serviceCompletedAt: null
      })
    );
    expect(r.checkedInAt).toBe('2026-12-31T18:00:00.000Z');
    expect(r.serviceStartedAt).toBe('2026-12-31T18:30:00.000Z');
    expect(r.serviceCompletedAt).toBeNull();
  });

  it('maps the legacy productId → menuItemId field on selectedOrderItems', () => {
    const r = rowToReservation(
      baseRow({
        selectedOrderItems: [
          { productId: 'esp', name: 'Espresso', price: 1.6, quantity: 2 }
        ]
      })
    );
    expect(r.selectedOrderItems).toEqual([{ menuItemId: 'esp', quantity: 2, price: 1.6 }]);
  });
});

describe('countInService', () => {
  it('counts rows whose serviceStatus is in_service', () => {
    const rows = [
      { serviceStatus: 'in_service' },
      { serviceStatus: 'in_service' },
      { serviceStatus: 'checked_in' },
      { serviceStatus: 'completed' },
      { serviceStatus: 'not_checked_in' },
      {}
    ];
    expect(countInService(rows)).toBe(2);
  });

  it('returns 0 for an empty list', () => {
    expect(countInService([])).toBe(0);
  });
});
