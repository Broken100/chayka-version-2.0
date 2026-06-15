/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { type Dispatch, type SetStateAction } from 'react';
import { BusinessConfig } from '../../types';
import { useReservation } from '../../context/ReservationContext';
import { Smartphone, Clock, Grid } from 'lucide-react';

interface SettingsPanelProps {
  businessConfig: BusinessConfig;
  setBusinessConfig: Dispatch<SetStateAction<BusinessConfig>>;
}

export default function SettingsPanel({ businessConfig, setBusinessConfig }: SettingsPanelProps) {
  const { language } = useReservation();
  const isEs = language === 'es';

  const handleUpdateSchedule = (index: number, key: 'day' | 'hours', value: string) => {
    const updatedSchedules = [...businessConfig.schedules];
    updatedSchedules[index] = { ...updatedSchedules[index], [key]: value };
    setBusinessConfig((prev) => ({ ...prev, schedules: updatedSchedules }));
  };

  const handleAddTimeSlot = (newSlot: string) => {
    if (!newSlot || businessConfig.timeSlots.includes(newSlot)) return;
    const updatedSlots = [...businessConfig.timeSlots, newSlot].sort();
    setBusinessConfig((prev) => ({ ...prev, timeSlots: updatedSlots }));
  };

  const handleRemoveTimeSlot = (slot: string) => {
    setBusinessConfig((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((s) => s !== slot)
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="admin-settings-view">
      {/* General Business Information Settings */}
      <div className="bg-white border border-espresso/15 p-5 rounded-2xl space-y-4 text-left shadow-sm">
        <h3 className="text-sm font-bold text-ochre uppercase tracking-widest border-b border-espresso/10 pb-2 flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-ochre" />
          <span>{isEs ? 'General e Integración WhatsApp' : 'General & WhatsApp Integration'}</span>
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
              {isEs ? 'Número de Atención WhatsApp (Link Destino directo)' : 'WhatsApp Business Number (Direct link format)'}
            </label>
            <input
              type="text"
              required
              value={businessConfig.whatsappNumber}
              onChange={(e) => setBusinessConfig({ ...businessConfig, whatsappNumber: e.target.value })}
              className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2.5 px-3 text-espresso focus:outline-none focus:border-ochre"
              id="admin-conf-wa"
            />
            <p className="text-[10px] text-espresso/50 mt-1 leading-normal italic">
              {isEs
                ? 'Inserta el número en formato internacional con código de país (Ej. +593987654321 para Ecuador).'
                : 'Insert the number in international format with country code (e.g., +593987654321 for Ecuador).'}
            </p>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
              {isEs ? 'Lugar Geográfico' : 'Geographic Location'}
            </label>
            <input
              type="text"
              required
              value={businessConfig.location}
              onChange={(e) => setBusinessConfig({ ...businessConfig, location: e.target.value })}
              className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2.5 px-3 text-espresso focus:outline-none focus:border-ochre"
              id="admin-conf-loc"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
              {isEs ? 'Enlace a Google Maps pin' : 'Google Maps Pin Link'}
            </label>
            <input
              type="text"
              required
              value={businessConfig.locationLink}
              onChange={(e) => setBusinessConfig({ ...businessConfig, locationLink: e.target.value })}
              className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2.5 px-3 text-espresso focus:outline-none focus:border-ochre"
              id="admin-conf-loclink"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                {isEs ? 'Min Pax por Cita' : 'Min Guests per Booking'}
              </label>
              <input
                type="number"
                min={1}
                value={businessConfig.minPeopleReservation}
                onChange={(e) => setBusinessConfig({ ...businessConfig, minPeopleReservation: parseInt(e.target.value) })}
                className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre"
                id="admin-conf-min"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                {isEs ? 'Max Pax por Cita' : 'Max Guests per Booking'}
              </label>
              <input
                type="number"
                min={1}
                value={businessConfig.maxPeopleReservation}
                onChange={(e) => setBusinessConfig({ ...businessConfig, maxPeopleReservation: parseInt(e.target.value) })}
                className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre"
                id="admin-conf-max"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Time Slots & Business hours Settings */}
      <div className="space-y-6">
        <div className="bg-white border border-espresso/15 p-5 rounded-2xl space-y-4 text-left shadow-sm">
          <h3 className="text-sm font-bold text-ochre uppercase tracking-widest border-b border-espresso/10 pb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-ochre" />
            <span>{isEs ? 'Horarios Semanales Abiertos' : 'Weekly Business Hours'}</span>
          </h3>

          <div className="space-y-3">
            {businessConfig.schedules.map((sched, idx) => (
              <div key={idx} className="flex gap-2.5 items-center" id={`admin-sched-row-${idx}`}>
                <input
                  type="text"
                  value={sched.day}
                  onChange={(e) => handleUpdateSchedule(idx, 'day', e.target.value)}
                  className="bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre w-1/3"
                />
                <input
                  type="text"
                  value={sched.hours}
                  onChange={(e) => handleUpdateSchedule(idx, 'hours', e.target.value)}
                  className="bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre flex-grow"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-espresso/15 p-5 rounded-2xl space-y-4 text-left shadow-sm">
          <h3 className="text-sm font-bold text-ochre uppercase tracking-widest border-b border-espresso/10 pb-2 flex items-center gap-1.5">
            <Grid className="w-4 h-4 text-ochre" />
            <span>{isEs ? 'Bloques Horarios Disponibles' : 'Available Booking Slots'}</span>
          </h3>

          <div className="flex flex-wrap gap-1.5">
            {businessConfig.timeSlots.map((slot) => (
              <span
                key={slot}
                className="bg-espresso/5 text-espresso text-xs px-2.5 py-1 rounded-xl border border-espresso/10 flex items-center gap-1.5 font-mono"
                id={`admin-slot-tag-${slot.replace(':', '-')}`}
              >
                <span>{slot} HS</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTimeSlot(slot)}
                  className="text-espresso/40 hover:text-rose-600 font-extrabold cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2.5 pt-2 border-t border-espresso/10 text-left">
            <input
              type="text"
              placeholder={isEs ? 'Ej. 13:30 (formato 24h)' : 'e.g. 13:30 (24h format)'}
              maxLength={5}
              id="admin-new-timeslot-input"
              className="bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre flex-grow font-mono"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) {
                    handleAddTimeSlot(val);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('admin-new-timeslot-input') as HTMLInputElement | null;
                if (el && el.value.trim()) {
                  handleAddTimeSlot(el.value.trim());
                  el.value = '';
                }
              }}
              className="bg-espresso text-coffee-bg hover:bg-espresso/90 border border-transparent text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
            >
              {isEs ? 'Agregar Bloque' : 'Add Slot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
