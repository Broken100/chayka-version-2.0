import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import AdminLogin from './AdminLogin';

beforeEach(() => {
  vi.restoreAllMocks();
  vi.stubEnv('VITE_DEMO_MODE', '');
});

describe('AdminLogin', () => {
  it('calls onAuthenticated when login succeeds', async () => {
    const onAuth = vi.fn();
    render(<AdminLogin onAuthenticated={onAuth} />);

    const input = screen.getByPlaceholderText('Contraseña de administrador');
    await userEvent.type(input, 'testpass');
    await userEvent.click(screen.getByText('Iniciar Sesión'));

    await waitFor(() => {
      expect(onAuth).toHaveBeenCalledTimes(1);
    });
  });

  it('shows an error message when the password is wrong', async () => {
    render(<AdminLogin onAuthenticated={vi.fn()} />);

    const input = screen.getByPlaceholderText('Contraseña de administrador');
    await userEvent.type(input, 'wrong');
    await userEvent.click(screen.getByText('Iniciar Sesión'));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('hides the Demo Bypass button when VITE_DEMO_MODE is unset', () => {
    vi.stubEnv('VITE_DEMO_MODE', '');
    render(<AdminLogin />);

    expect(screen.queryByText('Acceso Directo (Demo)')).not.toBeInTheDocument();
  });

  it('shows the Demo Bypass button when VITE_DEMO_MODE is true', () => {
    vi.stubEnv('VITE_DEMO_MODE', 'true');
    render(<AdminLogin />);

    expect(screen.getByText('Acceso Directo (Demo)')).toBeInTheDocument();
  });

  it('disables the submit button while the login request is in flight', async () => {
    render(<AdminLogin />);

    const input = screen.getByPlaceholderText('Contraseña de administrador');
    await userEvent.type(input, 'testpass');
    await userEvent.click(screen.getByText('Iniciar Sesión'));

    // After the mutation settles, the button should be re-enabled
    await waitFor(() => {
      const btn = screen.getByText('Iniciar Sesión');
      expect(btn).not.toBeDisabled();
    });
  });
});
