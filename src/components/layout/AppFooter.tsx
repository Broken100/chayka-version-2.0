/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BusinessConfig } from '../../types';
import { useReservation } from '../../context/ReservationContext';
import { t } from '../../utils/translations';
import { Instagram } from 'lucide-react';

interface AppFooterProps {
  businessConfig: BusinessConfig;
  setActiveView: (view: 'home' | 'menu' | 'booking' | 'admin') => void;
}

export default function AppFooter({ businessConfig, setActiveView }: AppFooterProps) {
  const { language } = useReservation();

  return (
    <footer className="border-t border-espresso/15 bg-espresso/5 py-12 text-espresso text-xs text-left" id="chayka-main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <h4 className="text-espresso font-serif font-black uppercase tracking-wider text-xs">Chayka Coffee Peguche</h4>
          <p className="text-espresso/80 leading-relaxed font-normal">
            {language === 'es'
              ? 'Fusión andina de naturaleza, café de finca y recetas ceremoniales del norte ecuatoriano. Otavalo, Imbabura.'
              : 'Andean fusion of nature, estate coffee, and ceremonial recipes from northern Ecuador. Otavalo, Imbabura.'}
          </p>
          <div className="flex gap-2">
            <a href="#" className="p-2 bg-espresso/5 hover:bg-espresso hover:text-coffee-bg border border-espresso/10 text-espresso transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-espresso font-serif font-black uppercase tracking-wider text-xs">
            {language === 'es' ? 'Enlaces Rápidos' : 'Quick Links'}
          </h4>
          <ul className="space-y-2 text-espresso/80 font-medium">
            <li>
              <button onClick={() => setActiveView('home')} className="hover:underline cursor-pointer">
                {t('nav.home', language)}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveView('menu')} className="hover:underline cursor-pointer">
                {language === 'es' ? 'Menú Interactivo' : 'Interactive Menu'}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveView('booking')} className="hover:underline cursor-pointer">
                {language === 'es' ? 'Apartar Cita' : 'Book Table'}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveView('admin')} className="hover:underline cursor-pointer">
                {t('nav.admin', language)}
              </button>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-espresso font-serif font-black uppercase tracking-wider text-xs">
            {language === 'es' ? 'Contáctanos' : 'Contact Us'}
          </h4>
          <p className="text-espresso/80">
            {language === 'es'
              ? 'Sintonía directa para eventos especiales, catas rituales de café andino o visitas de grandes grupos turísticos.'
              : 'Direct line for special events, ritual tastings of Andean coffee, or large tour group visits.'}
          </p>
          <div className="font-bold text-espresso text-xs tracking-wider uppercase">
            WhatsApp: {businessConfig.whatsappNumber}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-espresso/10 mt-8 pt-8 flex flex-col sm:flex-row justify-between text-[10px] font-semibold tracking-wider uppercase opacity-60">
        <span>
          {language === 'es'
            ? `© ${new Date().getFullYear()} Chayka Coffee. Reservas simuladas para demostración turística.`
            : `© ${new Date().getFullYear()} Chayka Coffee. Mock bookings for tourism demonstration.`}
        </span>
        <span>
          {language === 'es'
            ? 'Hecho con diseño andino en Otavalo, Ecuador'
            : 'Made with Andean design in Otavalo, Ecuador'}
        </span>
      </div>
    </footer>
  );
}
