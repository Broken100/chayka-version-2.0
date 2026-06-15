/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useReservation } from '../../context/ReservationContext';
import { t } from '../../utils/translations';
import { Calendar, Coffee, Sparkles } from 'lucide-react';

import heroCups from '../../assets/hero_cups.png';
import heroDrinks from '../../assets/hero_drinks.png';
import heroShop from '../../assets/hero_shop.jpg';

interface HeroBannerProps {
  setActiveView: (view: 'home' | 'menu' | 'booking' | 'admin') => void;
}

export default function HeroBanner({ setActiveView }: HeroBannerProps) {
  const { language } = useReservation();
  const heroImages = [heroCups, heroDrinks, heroShop];
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden border-b border-espresso/10" id="peguche-hero">
      {/* Background image covering cloud forests & coffee seeds */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Chayka Coffee Background ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[5000ms] ease-out ${
              index === currentBgIndex ? 'opacity-50 scale-105' : 'opacity-0 scale-100'
            } filter saturate-75`}
            referrerPolicy="no-referrer"
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-coffee-bg via-coffee-bg/75 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center space-y-8">
        <div className="inline-flex items-center gap-1.5 bg-espresso text-coffee-bg px-4 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-[0.2em] shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-coffee-bg/80 fill-coffee-bg/80" />
          <span>{language === 'es' ? 'Experiencia Nacional Turística Única' : 'Unique National Tourist Experience'}</span>
        </div>

        <h1 className="font-serif text-5xl sm:text-7xl font-bold tracking-tight text-espresso">
          Chayka Coffee
        </h1>

        <p className="text-espresso/80 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed font-sans">
          {language === 'es' ? (
            <>
              Ubicada en el sendero mágico a la magnífica <strong className="text-espresso font-black">Cascada de Peguche</strong> en Otavalo. Disfruta comida tradicional y café de especialidad arrullado por el canto eterno del agua.
            </>
          ) : (
            <>
              Located on the magical path to the magnificent <strong className="text-espresso font-black">Peguche Waterfall</strong> in Otavalo. Enjoy traditional food and specialty coffee lulled by the eternal song of the water.
            </>
          )}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setActiveView('booking')}
            className="w-full sm:w-auto bg-espresso text-coffee-bg font-bold px-8 py-4 rounded-none uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-espresso/90 transition-all cursor-pointer shadow-md"
            id="hero-book-btn"
          >
            <Calendar className="w-4 h-4" />
            <span>{t('home.ctaBooking', language)}</span>
          </button>

          <button
            onClick={() => setActiveView('menu')}
            className="w-full sm:w-auto bg-transparent border border-espresso/25 text-espresso font-bold px-8 py-4 rounded-none uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-espresso/5 transition-all cursor-pointer"
            id="hero-menu-btn"
          >
            <Coffee className="w-4 h-4 text-espresso" />
            <span>{t('home.ctaMenu', language)}</span>
          </button>
        </div>

        {/* Highlights badge bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 text-espresso text-xs">
          <div className="flex flex-col items-center gap-1 bg-espresso/5 p-3 rounded-none border border-espresso/10">
            <span className="font-serif text-espresso font-black italic text-base">1,800m</span>
            <span className="text-[9px] uppercase tracking-wider opacity-60">
              {language === 'es' ? 'Granos de Altura' : 'High-Altitude Beans'}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-espresso/5 p-3 rounded-none border border-espresso/10">
            <span className="font-serif text-espresso font-black italic text-base">Peguche</span>
            <span className="text-[9px] uppercase tracking-wider opacity-60">
              {language === 'es' ? 'Frente a la Cascada' : 'In Front of Waterfall'}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-espresso/5 p-3 rounded-none border border-espresso/10">
            <span className="font-serif text-espresso font-black italic text-base">100% Secure</span>
            <span className="text-[9px] uppercase tracking-wider opacity-60">
              {language === 'es' ? 'Pagos Integrados' : 'Integrated Payments'}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-espresso/5 p-3 rounded-none border border-espresso/10">
            <span className="font-serif text-espresso font-black italic text-base">WhatsApp</span>
            <span className="text-[9px] uppercase tracking-wider opacity-60">
              {language === 'es' ? 'Atención en Real-Time' : 'Real-Time Support'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
