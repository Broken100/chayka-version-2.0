import { vi } from 'vitest';
import { INITIAL_PRODUCTS, INITIAL_TABLES, DEFAULT_BUSINESS_CONFIG } from '../data';
import type { MenuItemRow, TableRow, BusinessConfigRow } from '../lib/queries';

class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const menuRows: MenuItemRow[] = INITIAL_PRODUCTS.map((p) => ({
  id: p.id,
  nameEs: p.name.es,
  nameEn: p.name.en,
  descriptionEs: p.description.es,
  descriptionEn: p.description.en,
  price: String(p.price),
  category: p.category,
  image: p.image,
  fallbackImage: p.fallbackImage ?? null,
  active: p.active,
  ingredientsEs: p.ingredients.es,
  ingredientsEn: p.ingredients.en,
  isSpecial: p.isSpecial,
  preparationTime: p.preparationTime,
  updatedAt: null
}));

const tableRows: TableRow[] = INITIAL_TABLES.map((t) => ({
  id: t.id,
  nameEs: t.name.es,
  nameEn: t.name.en,
  capacity: t.capacity,
  area: t.area,
  minimumConsumption: String(t.minimumConsumption),
  updatedAt: null
}));

const configRow: BusinessConfigRow = {
  id: 1,
  name: DEFAULT_BUSINESS_CONFIG.name,
  location: DEFAULT_BUSINESS_CONFIG.location,
  locationLink: DEFAULT_BUSINESS_CONFIG.locationLink,
  whatsappNumber: DEFAULT_BUSINESS_CONFIG.whatsappNumber,
  minPeopleReservation: DEFAULT_BUSINESS_CONFIG.minPeopleReservation,
  maxPeopleReservation: DEFAULT_BUSINESS_CONFIG.maxPeopleReservation,
  schedules: DEFAULT_BUSINESS_CONFIG.schedules,
  timeSlots: DEFAULT_BUSINESS_CONFIG.timeSlots,
  transferQrUrl: DEFAULT_BUSINESS_CONFIG.transferQrUrl,
  updatedAt: null
};

export const mockApi = {
  get: vi.fn(async (path: string) => {
    if (path === '/menu') return menuRows;
    if (path === '/tables') return tableRows;
    if (path === '/business-config') return configRow;
    if (path === '/admin/me') return { authenticated: true, expiresAt: new Date(Date.now() + 86400000).toISOString() };
    if (path === '/admin/reservations') return [];
    if (path === '/reservations') return [];
    throw new Error(`Unhandled mock path: ${path}`);
  }),
  post: vi.fn(async (path: string, body?: unknown) => {
    if (path === '/admin/login') {
      const { password } = body as { password: string };
      if (password === 'wrong') throw new ApiError(401, { error: 'Invalid credentials' }, 'Invalid credentials');
      return { ok: true, expiresAt: new Date(Date.now() + 86400000).toISOString() };
    }
    if (path === '/admin/logout') return { ok: true };
    if (path === '/payments/simulate') {
      const { method, reference } = body as { method: string; reference?: string };
      if (method === 'card' && reference?.startsWith('0000')) {
        return { status: 'failed', reason: 'Card declined' };
      }
      if (method === 'transfer' && !reference) {
        throw new ApiError(400, { error: 'reference is required' }, 'reference is required');
      }
      return { status: 'success', reference: 'PAY-MOCK123' };
    }
    return {};
  }),
  put: vi.fn(),
  del: vi.fn()
};

vi.mock('../lib/api', () => ({
  api: mockApi,
  ApiError: class ApiError extends Error {
    status: number;
    body: unknown;
    constructor(status: number, body: unknown, message: string) {
      super(message);
      this.status = status;
      this.body = body;
    }
  }
}));
