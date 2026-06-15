/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useReservation } from '../../context/ReservationContext';
import { Flame } from 'lucide-react';

interface TraditionsBannerProps {
  setActiveView: (view: 'home' | 'menu' | 'booking' | 'admin') => void;
}

export default function TraditionsBanner({ setActiveView }: TraditionsBannerProps) {
  const { language } = useReservation();

  return (
    <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-espresso text-coffee-bg py-16 w-full border-b border-espresso/10" id="traditions-callout">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-coffee-bg/60 font-bold tracking-[0.25em] text-[10px] uppercase flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-coffee-bg/80" />{' '}
              {language === 'es' ? 'Tradición Ecuatoriana Re-Imaginada' : 'Ecuadorian Tradition Re-Imagined'}
            </span>
            <h3 className="text-3xl sm:text-4xl font-serif italic tracking-tight text-coffee-bg">
              {language === 'es' ? '¿Vienes a Otavalo por Turismo?' : 'Coming to Otavalo for Tourism?'}
            </h3>
            <p className="text-coffee-bg/80 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
              {language === 'es' ? (
                <>
                  Nuestra carta une lo mejor de los granos de especialidad (Chemex, V60 de Intag) con la repostería artesanal andina. Te aseguramos una experiencia inolvidable. Al reservar con antelación, tu mesa estará lista con tus elecciones favoritas para que recorras los senderos de agua silvestre sin demoras.
                </>
              ) : (
                <>
                  Our menu brings together the best of specialty beans (Chemex, Intag V60) with artisan Andean pastries. We assure you an unforgettable experience. By booking in advance, your table will be ready with your favorite selections so you can walk the wild water paths without delays.
                </>
              )}
            </p>
            <div className="pt-4">
              <button
                onClick={() => {
                  setActiveView('menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-coffee-bg text-espresso hover:bg-coffee-bg/90 hover:text-espresso border border-transparent px-6 py-3.5 rounded-none text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md"
              >
                {language === 'es' ? 'Explorar la Carta Digital' : 'Explore the Digital Menu'}
              </button>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center md:items-end text-center md:text-right space-y-1">
            <span className="font-serif text-6xl sm:text-8xl md:text-9xl font-bold italic tracking-tight text-coffee-bg select-none">
              Chayka
            </span>
            <span className="font-sans text-xs sm:text-sm md:text-base tracking-[0.4em] uppercase font-bold text-coffee-bg/60 select-none">
              Coffee
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
