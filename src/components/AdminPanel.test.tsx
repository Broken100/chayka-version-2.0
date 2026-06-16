import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import AdminPanel from './AdminPanel';
import {
  INITIAL_TABLES,
  INITIAL_PRODUCTS,
  DEFAULT_BUSINESS_CONFIG,
} from '../data';
import type { Category } from '../types';

const TEST_CATEGORIES: Category[] = [
  {
    id: 'hot_drinks',
    name: { es: 'Bebidas Calientes', en: 'Hot Drinks' },
    icon: 'Coffee',
    description: { es: '', en: '' }
  },
  {
    id: 'frappes',
    name: { es: 'Frappés', en: 'Frappes' },
    icon: 'Sparkles',
    description: { es: '', en: '' }
  },
  {
    id: 'soft_drinks',
    name: { es: 'Bebidas Soft', en: 'Soft Drinks' },
    icon: 'Flame',
    description: { es: '', en: '' }
  }
];

const defaultProps = {
  businessConfig: DEFAULT_BUSINESS_CONFIG,
  setBusinessConfig: vi.fn(),
  tables: INITIAL_TABLES,
  setTables: vi.fn(),
  menuProducts: INITIAL_PRODUCTS,
  setMenuProducts: vi.fn(),
  categories: TEST_CATEGORIES,
};

describe('AdminPanel', () => {
  it('renders the login form when the auth query returns 401', async () => {
    const { mockApi } = await import('../__mocks__/api');
    const origImpl = mockApi.get.mockImplementation;

    mockApi.get.mockImplementation(async (path: string): Promise<any> => {
      if (path === '/admin/me') throw new Error('Unauthorized');
      if (path === '/menu') return [];
      if (path === '/tables') return [];
      if (path === '/business-config') return {};
      if (path === '/reservations') return [];
      if (path === '/admin/reservations') return [];
      throw new Error(`Unhandled mock path: ${path}`);
    });

    try {
      render(<AdminPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Administración Chayka')).toBeInTheDocument();
      });
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    } finally {
      vi.restoreAllMocks();
    }
  });
});
