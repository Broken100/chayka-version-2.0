import { describe, it, expect } from 'vitest';
import { render, screen } from './test-utils';
import App from './App';

describe('App', () => {
  it('renders the Chayka Coffee brand and main navigation', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /Chayka Coffee/i })).toBeInTheDocument();
    expect(screen.getAllByText('Inicio').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Menú').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Reservas').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Administración').length).toBeGreaterThan(0);
  });

  it('renders the hero call-to-action buttons', () => {
    render(<App />);

    expect(screen.getByText('Reservar Mesa')).toBeInTheDocument();
    expect(screen.getByText('Ver Menú')).toBeInTheDocument();
  });
});
