import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import MenuSection from './MenuSection';
import { INITIAL_PRODUCTS } from '../data';
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

describe('MenuSection', () => {
  it('renders category filters and product cards', () => {
    render(
      <MenuSection
        categories={TEST_CATEGORIES}
        products={INITIAL_PRODUCTS}
        interactiveMode={false}
      />
    );

    expect(screen.getByText('Explorar Todo')).toBeInTheDocument();
    expect(screen.getByText('Bebidas Calientes')).toBeInTheDocument();
    expect(screen.getByText('Frappés')).toBeInTheDocument();
    expect(screen.getByText('Bebidas Soft')).toBeInTheDocument();

    expect(screen.getAllByText('Espresso').length).toBeGreaterThan(0);
    expect(screen.getByText('Chayka Frap')).toBeInTheDocument();
  });

  it('filters products by search query', async () => {
    render(
      <MenuSection
        categories={TEST_CATEGORIES}
        products={INITIAL_PRODUCTS}
        interactiveMode={false}
      />
    );

    const searchInput = screen.getByPlaceholderText('Buscar bebida, ingrediente...');
    fireEvent.input(searchInput, { target: { value: 'chocolate' } });

    expect(screen.getByText('Mocaccino')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Limonada Imperial')).not.toBeInTheDocument();
    });
  });

  it('opens product detail modal when clicking details', () => {
    render(
      <MenuSection
        categories={TEST_CATEGORIES}
        products={INITIAL_PRODUCTS}
        interactiveMode={false}
      />
    );

    const detailsButton = screen.getAllByText('Ver Detalles')[0];
    fireEvent.click(detailsButton);

    expect(screen.getByRole('button', { name: /Cerrar|Close/i })).toBeInTheDocument();
  });
});
