import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import { useReservation } from './ReservationContext';
import { t } from '../utils/translations';

function LanguageDisplay() {
  const { language, setLanguage } = useReservation();
  return (
    <div>
      <span data-testid="home-label">{t('nav.home', language)}</span>
      <button onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}>
        Toggle Language
      </button>
    </div>
  );
}

describe('ReservationContext', () => {
  it('defaults to Spanish and toggles to English', () => {
    render(<LanguageDisplay />);

    expect(screen.getByTestId('home-label')).toHaveTextContent('Inicio');

    fireEvent.click(screen.getByText('Toggle Language'));

    expect(screen.getByTestId('home-label')).toHaveTextContent('Home');
  });
});
