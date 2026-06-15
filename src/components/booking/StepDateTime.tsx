/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { type FormEvent } from 'react';
import { BusinessConfig } from '../../types';
import { useReservation } from '../../context/ReservationContext';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Info,
  ChevronRight
} from 'lucide-react';

interface StepDateTimeProps {
  businessConfig: BusinessConfig;
  date: string;
  setDate: (date: string) => void;
  timeSlot: string;
  setTimeSlot: (slot: string) => void;
  guestsCount: number;
  setGuestsCount: (count: number | ((prev: number) => number)) => void;
  onNext: () => void;
}

export default function StepDateTime({
  businessConfig,
  date,
  setDate,
  timeSlot,
  setTimeSlot,
  guestsCount,
  setGuestsCount,
  onNext
}: StepDateTimeProps) {
  const { language } = useReservation();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!date || !timeSlot) return;
    onNext();
  };

  return (
    <div className="space-y-6 text-left" id="booking-step-1">
      <div className="text-center max-w-md mx-auto">
        <span className="text-editorial-charcoal/60 font-bold text-[10px] uppercase tracking-[0.25em]">
          {language === 'es' ? 'Planifica Tu Visita' : 'Plan Your Visit'}
        </span>
        <h3 className="text-2xl font-serif font-bold italic text-editorial-charcoal mt-1">
          {language === 'es' ? 'Elige Fecha y Cantidad' : 'Choose Date & Quantity'}
        </h3>
        <p className="text-editorial-charcoal/80 text-xs mt-1">
          {language === 'es'
            ? 'La Cascada de Peguche es maravillosa de día y pacífica de noche. Elige el tiempo perfecto para tu mesa.'
            : 'The Peguche Waterfall is wonderful by day and peaceful by night. Choose the perfect time for your table.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-editorial-bg border border-editorial-charcoal/15 p-6 rounded-none space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="booking-date-input" className="block text-[10px] font-bold text-editorial-charcoal/60 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-editorial-charcoal" />
              <span>{language === 'es' ? 'Seleccionar Fecha' : 'Select Date'}</span>
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-editorial-stone/20 border border-editorial-charcoal/15 rounded-none py-2.5 px-3.5 text-xs text-editorial-charcoal focus:outline-none focus:border-editorial-charcoal font-medium font-mono cursor-pointer"
              id="booking-date-input"
            />
          </div>

          <div>
            <label htmlFor="booking-timeslot-select" className="block text-[10px] font-bold text-editorial-charcoal/60 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-editorial-charcoal" />
              <span>{language === 'es' ? 'Bloque Horario' : 'Time Slot'}</span>
            </label>
            <select
              value={timeSlot}
              required
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full bg-editorial-stone/20 border border-editorial-charcoal/15 rounded-none py-2.5 px-3.5 text-xs text-editorial-charcoal focus:outline-none focus:border-editorial-charcoal font-medium font-mono cursor-pointer"
              id="booking-timeslot-select"
            >
              {businessConfig.timeSlots.map((ts) => (
                <option key={ts} value={ts}>
                  {ts} {language === 'es' ? 'hs - Acceso de Mesa' : 'hrs - Table Access'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-editorial-charcoal/60 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-editorial-charcoal" />
            <span>{language === 'es' ? 'Número de Visitantes (Adultos y Niños)' : 'Number of Visitors (Adults & Children)'}</span>
          </label>
          <div className="flex items-center gap-4 bg-editorial-stone/25 border border-editorial-charcoal/10 p-3 rounded-none justify-between">
            <span className="text-xs font-bold text-editorial-charcoal/80">
              {language === 'es' ? '¿Para cuántas personas?' : 'For how many people?'}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={guestsCount <= businessConfig.minPeopleReservation}
                onClick={() => setGuestsCount((g) => Math.max(businessConfig.minPeopleReservation, g - 1))}
                className="w-9 h-9 bg-editorial-bg border border-editorial-charcoal/20 text-editorial-charcoal hover:bg-editorial-stone disabled:opacity-30 rounded-none font-bold cursor-pointer flex items-center justify-center transition-colors font-mono"
                id="pax-minus"
              >
                -
              </button>
              <span className="text-sm font-black font-serif text-editorial-charcoal w-6 text-center">{guestsCount}</span>
              <button
                type="button"
                disabled={guestsCount >= businessConfig.maxPeopleReservation}
                onClick={() => setGuestsCount((g) => Math.min(businessConfig.maxPeopleReservation, g + 1))}
                className="w-9 h-9 bg-editorial-bg border border-editorial-charcoal/20 text-editorial-charcoal hover:bg-editorial-stone disabled:opacity-30 rounded-none font-bold cursor-pointer flex items-center justify-center transition-colors font-mono"
                id="pax-plus"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="bg-editorial-stone/40 p-3.5 rounded-none border border-editorial-charcoal/10 flex gap-2.5 items-start">
          <Info className="w-4 h-4 text-editorial-charcoal flex-shrink-0 mt-0.5" />
          <div className="text-editorial-charcoal/80 text-xs leading-normal font-sans">
            <span className="font-bold block text-editorial-charcoal uppercase text-[10px]">
              {language === 'es' ? 'Horarios de Reserva' : 'Reservation Schedules'}
            </span>
            {language === 'es'
              ? 'Aceptamos reservas online todos los días. Las mesas de la Terraza Mirador cuentan con un consumo mínimo integrado reembolsable en consumo.'
              : 'We accept online reservations every day. Lookout Terrace tables have an integrated minimum consumption refundable in consumption.'}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-editorial-charcoal text-editorial-bg font-bold py-3.5 rounded-none flex items-center justify-center gap-2 hover:bg-editorial-charcoal/90 cursor-pointer shadow-none transition-all uppercase tracking-widest text-xs"
          id="step-1-submit-btn"
        >
          <span>{language === 'es' ? 'Buscar Espacios Disponibles' : 'Search Available Spaces'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
