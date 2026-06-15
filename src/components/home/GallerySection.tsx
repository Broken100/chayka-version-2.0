/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useReservation } from '../../context/ReservationContext';

import heroCups from '../../assets/hero_cups.png';
import heroDrinks from '../../assets/hero_drinks.png';
import heroShop from '../../assets/hero_shop.jpg';

export default function GallerySection() {
  const { language } = useReservation();

  const items = [
    {
      title: language === 'es' ? 'Granos de Especialidad' : 'Specialty Beans',
      desc: language === 'es'
        ? 'Selección rigurosa de granos de altura, tostados a la perfección para resaltar notas únicas.'
        : 'Rigorous selection of high-altitude beans, roasted to perfection to highlight unique notes.',
      img: heroCups,
      fallback: "https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?auto=format&fit=crop&q=80&w=400"
    },
    {
      title: language === 'es' ? 'Bebidas de la Casa' : 'Signature Drinks',
      desc: language === 'es'
        ? 'Refrescantes cócteles y cafés helados preparados al instante con insumos locales.'
        : 'Refreshing house cocktails and iced coffees prepared instantly with local ingredients.',
      img: heroDrinks,
      fallback: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400"
    },
    {
      title: language === 'es' ? 'Refugio en la Cascada' : 'Waterfall Refuge',
      desc: language === 'es'
        ? 'Nuestra acogedora cafetería de diseño rústico-contemporáneo en el sendero mágico de Peguche.'
        : 'Our cozy cafe with rustic-contemporary design on the magical path of Peguche.',
      img: heroShop,
      fallback: "https://images.unsplash.com/photo-1594911774802-8822a707caff?auto=format&fit=crop&q=80&w=400"
    }
  ];

  return (
    <section className="min-h-[calc(100vh-5rem)] flex flex-col justify-center items-center py-16 animate-fadeIn w-full border-b border-espresso/10" id="chayka-gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="text-espresso/60 font-bold text-[10px] uppercase tracking-[0.25em] block">
            {language === 'es' ? 'Inspiración de Finca y Cascada' : 'Estate and Waterfall Inspiration'}
          </span>
          <h3 className="text-3xl sm:text-4xl font-serif font-bold italic text-espresso">
            {language === 'es' ? 'Galería de Coexistencia' : 'Coexistence Gallery'}
          </h3>
          <p className="text-espresso/80 text-xs max-w-xl mx-auto">
            {language === 'es'
              ? 'Explora las especialidades de la barra y momentos capturados en vivo por visitantes de todo el mundo en nuestro espectacular rincón andino.'
              : 'Explore the specialty bar offerings and live moments captured by visitors from all around the world in our spectacular Andean corner.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <div key={idx} className="group flex flex-col bg-espresso/5 border border-espresso/15 rounded-none overflow-hidden transition-all hover:border-espresso/50 text-left shadow-sm">
              <div className="relative h-60 overflow-hidden bg-espresso/10 border-b border-espresso/10">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 filter saturate-50"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = item.fallback;
                  }}
                />
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-serif font-black text-sm text-espresso uppercase tracking-tight">{item.title}</h4>
                <p className="text-[11px] text-espresso/80 leading-relaxed font-normal">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
