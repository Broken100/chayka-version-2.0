/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BusinessConfig } from '../../types';
import { useReservation } from '../../context/ReservationContext';
import { MapPin, Clock, Phone, Compass, ChevronRight } from 'lucide-react';

import experience1 from '../../assets/cake_01.jpg';
import experience2 from '../../assets/hero_03.jpg';

interface AttractionsSectionProps {
  businessConfig: BusinessConfig;
  setActiveView: (view: 'home' | 'menu' | 'booking' | 'admin') => void;
}

export default function AttractionsSection({ businessConfig, setActiveView }: AttractionsSectionProps) {
  const { language } = useReservation();

  return (
    <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center border-b border-espresso/10 py-16" id="turismo-highlight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left text column */}
          <div className="space-y-6 text-left">
            <span className="text-espresso/60 font-bold text-[10px] uppercase tracking-[0.25em] block">
              {language === 'es' ? 'Ubicación Ancestral' : 'Ancestral Location'}
            </span>
            <h3 className="text-3xl sm:text-5xl font-serif font-bold italic text-espresso leading-tight">
              {language === 'es'
                ? 'Un Santuario Turístico que Debes Visitar en Imbabura'
                : 'A Tourist Sanctuary You Must Visit in Imbabura'}
            </h3>
            <p className="text-espresso/80 text-sm leading-relaxed font-sans font-normal">
              {language === 'es' ? (
                <>
                  Cascada de Peguche es un sitio ceremonial indígena sagrado donde los locales recargan sus energías espirituales durante el Inti Raymi. <strong className="text-espresso font-black">Chayka Coffee</strong> se integra de forma respetuosa con esta mística geografía, ofreciendo un refugio de diseño rústico-contemporáneo donde podrás sentarte y degustar repostería fina.
                </>
              ) : (
                <>
                  Peguche Waterfall is a sacred indigenous ceremonial site where locals recharge their spiritual energies during Inti Raymi. <strong className="text-espresso font-black">Chayka Coffee</strong> integrates respectfully with this mystical geography, offering a rustic-contemporary design refuge where you can sit and taste fine pastries.
                </>
              )}
            </p>

            <div className="space-y-3 text-xs text-espresso/80">
              <div className="flex gap-2.5 items-start">
                <MapPin className="w-5 h-5 text-espresso flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-espresso">
                    {language === 'es' ? 'Ubicación Geográfica:' : 'Geographic Location:'}
                  </strong>{' '}
                  {businessConfig.location}
                </span>
              </div>

              <div className="flex gap-2.5 items-start">
                <Clock className="w-5 h-5 text-espresso flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  {businessConfig.schedules.map((sch, i) => (
                    <div key={i}>
                      <strong className="text-espresso">{sch.day}:</strong> {sch.hours}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <Phone className="w-5 h-5 text-espresso flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-espresso font-black">
                    {language === 'es' ? 'Atención Directa WhatsApp:' : 'Direct WhatsApp Support:'}
                  </strong>{' '}
                  {businessConfig.whatsappNumber}
                </span>
              </div>
            </div>

            <div className="pt-4 flex gap-3.5">
              <a
                href={businessConfig.locationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-espresso/5 hover:bg-espresso/10 text-espresso border border-espresso/15 text-[10px] font-bold uppercase tracking-widest px-5 py-3 rounded-none flex items-center gap-1.5 cursor-pointer"
                id="maps-direction-btn"
              >
                <Compass className="w-4 h-4" />
                <span>{language === 'es' ? 'Lanzar Direcciones GPS' : 'Launch GPS Directions'}</span>
              </a>

              <button
                onClick={() => setActiveView('booking')}
                className="bg-espresso hover:bg-espresso/90 text-coffee-bg text-[10px] font-bold uppercase tracking-widest px-5 py-3 rounded-none flex items-center gap-1 cursor-pointer transition-all"
              >
                <span>{language === 'es' ? 'Apartar una Mesa' : 'Book a Table'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right visuals column with elegant mock waterfall and coffee setups */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="h-64 rounded-none overflow-hidden border border-espresso/15">
                <img
                  src={experience1}
                  alt="Coffee Cup on Wood"
                  className="w-full h-full object-cover filter saturate-50"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="bg-espresso/5 p-5 rounded-none border border-espresso/10 text-left space-y-1.5">
                <span className="text-espresso font-bold block text-[10px] uppercase tracking-widest opacity-70">
                  {language === 'es' ? 'Firma Chayka' : 'Chayka Signature'}
                </span>
                <p className="text-espresso/80 text-xs leading-relaxed font-normal">
                  {language === 'es'
                    ? 'Sabores andinos como humitas de choclo fresco maridando espressos aterciopelados.'
                    : 'Andean flavors like fresh corn humitas pairing with velvety espressos.'}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="bg-espresso/10 border border-espresso/10 p-5 rounded-none text-left space-y-1.5">
                <span className="text-espresso font-black block text-[10px] uppercase tracking-widest">9.8 • Rating</span>
                <p className="text-espresso/80 text-xs leading-relaxed">
                  {language === 'es'
                    ? 'Evaluación estelar por visitantes internacionales en el sendero de Peguche.'
                    : 'Stellar ratings by international visitors on the Peguche trail.'}
                </p>
              </div>
              <div className="h-64 rounded-none overflow-hidden border border-espresso/15">
                <img
                  src={experience2}
                  alt="Waterfall vegetation"
                  className="w-full h-full object-cover opacity-80 filter saturate-50"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
