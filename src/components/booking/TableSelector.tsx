/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ReservationTable, Reservation, TableArea, Language } from '../../types';
import { useReservation } from '../../context/ReservationContext';
import { t } from '../../utils/translations';
import {
  Coffee,
  Flame,
  Compass,
  Home,
  Grid,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface TableSelectorProps {
  tables: ReservationTable[];
  existingReservations: Reservation[];
  selectedArea: TableArea;
  setSelectedArea: (area: TableArea) => void;
  selectedTableId: string;
  setSelectedTableId: (id: string) => void;
  guestsCount: number;
  date: string;
  timeSlot: string;
  onBack: () => void;
  onNext: () => void;
}

const AREA_ICONS: Record<TableArea, React.ComponentType<any>> = {
  waterfall_deck: Coffee,
  fireplace_cozy: Flame,
  indoor_premium: Home,
  terrace_panoramic: Compass
};

export default function TableSelector({
  tables,
  existingReservations,
  selectedArea,
  setSelectedArea,
  selectedTableId,
  setSelectedTableId,
  guestsCount,
  date,
  timeSlot,
  onBack,
  onNext
}: TableSelectorProps) {
  const { language } = useReservation();

  // Determine if a table is reserved on the selected date & time Slot
  const isTableOccupied = (tableId: string) => {
    return existingReservations.some(
      (res) =>
        res.date === date &&
        res.timeSlot === timeSlot &&
        res.tableId === tableId &&
        res.status !== 'cancelled'
    );
  };

  const getAreaDesc = (area: TableArea, lang: Language): string => {
    const descs = {
      waterfall_deck: {
        es: 'Brisa refrescante, senderos florales con vista directa a la Cascada de Peguche.',
        en: 'Refreshing breeze, floral paths with direct view of the Peguche Waterfall.'
      },
      fireplace_cozy: {
        es: 'Calor de hogar con fogón a leña, sillones de cuero y música acústica andina.',
        en: 'Home warmth with wood stove, leather armchairs, and acoustic Andean music.'
      },
      indoor_premium: {
        es: 'Arquitectura rústica de madera tallada y piedra volcánica del norte de Otavalo.',
        en: 'Rustic architecture of carved wood and volcanic stone from northern Otavalo.'
      },
      terrace_panoramic: {
        es: 'Vista 360° al Cerro Imbabura y los valles sagrados, ideal para atardeceres mágicos.',
        en: '360° view of Cerro Imbabura and sacred valleys, ideal for magical sunsets.'
      }
    };
    return descs[area][lang] || descs[area]['es'];
  };

  const areaTables = tables.filter((t) => t.area === selectedArea);
  const selectedTable = tables.find((t) => t.id === selectedTableId);

  const getAreaLabel = (areaKey: TableArea) => {
    return t(`booking.tableSelector.areas.${areaKey}`, language);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 text-left"
      id="booking-step-2"
    >
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={onBack}
          className="text-editorial-charcoal/60 hover:text-editorial-charcoal text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          id="back-to-step1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'es' ? 'Volver' : 'Back'}</span>
        </button>
      </div>

      <div className="text-center max-w-md mx-auto">
        <span className="text-editorial-charcoal/60 font-bold text-[10px] uppercase tracking-[0.25em]">
          {language === 'es' ? 'Aventura Visual' : 'Visual Adventure'}
        </span>
        <h3 className="text-2xl font-serif font-bold italic text-editorial-charcoal mt-1">
          {t('booking.tableSelector.title', language)}
        </h3>
        <p className="text-editorial-charcoal/80 text-xs mt-1">
          {language === 'es'
            ? 'Selecciona la zona que prefieras y escoge tu mesa de la suerte.'
            : 'Select the zone you prefer and choose your lucky table.'}
        </p>
      </div>

      {/* Area Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" id="area-selection-grid">
        {(['waterfall_deck', 'fireplace_cozy', 'indoor_premium', 'terrace_panoramic'] as TableArea[]).map((areaKey) => {
          const isSelected = selectedArea === areaKey;
          const AreaIcon = AREA_ICONS[areaKey];
          return (
            <button
              key={areaKey}
              onClick={() => {
                setSelectedArea(areaKey);
                setSelectedTableId(''); // Reset table when changing area
              }}
              className={`flex flex-col text-left p-4 rounded-none border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-editorial-stone text-editorial-charcoal border-editorial-charcoal ring-[1px] ring-editorial-charcoal'
                  : 'bg-editorial-bg border-editorial-charcoal/15 hover:bg-editorial-stone/40 hover:border-editorial-charcoal/30'
              }`}
              id={`area-btn-${areaKey}`}
            >
              <div className="flex items-center justify-between gap-1 w-full relative z-10">
                <span className="text-[9px] uppercase font-bold tracking-widest text-editorial-charcoal/60">
                  {language === 'es' ? 'Zona' : 'Zone'}
                </span>
                <AreaIcon className="w-3.5 h-3.5 text-editorial-charcoal" />
              </div>
              <span className="text-sm font-serif font-bold italic text-editorial-charcoal mt-2 relative z-10">
                {getAreaLabel(areaKey)}
              </span>
              <p className="text-[10px] text-editorial-charcoal/70 mt-1 leading-normal relative z-10 font-normal font-sans">
                {getAreaDesc(areaKey, language)}
              </p>
              <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5">
                <Grid className="w-20 h-20 text-editorial-charcoal" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Table Selection Title with Selected Date Information */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-editorial-charcoal/15 pt-5 gap-3">
        <div>
          <h4 className="text-lg font-serif font-bold text-editorial-charcoal">
            {language === 'es' ? 'Mapeo en' : 'Mapping in'}:{' '}
            <span className="font-serif italic text-base font-normal">{getAreaLabel(selectedArea)}</span>
          </h4>
          <p className="text-editorial-charcoal/70 text-xs mt-0.5">
            {language === 'es' ? 'Disponibilidad para el' : 'Availability for'}{' '}
            <span className="font-bold text-editorial-charcoal font-mono text-[11px]">{date}</span>{' '}
            {language === 'es' ? 'en bloque' : 'at slot'}{' '}
            <span className="font-bold text-editorial-charcoal font-mono text-[11px]">{timeSlot} hs</span>
          </p>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider font-mono">
          <span className="flex items-center gap-1.5 text-editorial-charcoal/70">
            <span className="w-3 h-3 rounded-none bg-editorial-bg border border-editorial-charcoal/20 block" />{' '}
            {language === 'es' ? 'Libre' : 'Available'}
          </span>
          <span className="flex items-center gap-1.5 text-rose-700">
            <span className="w-3 h-3 rounded-none bg-rose-100 border border-rose-300 block" />{' '}
            {language === 'es' ? 'Reservado' : 'Reserved'}
          </span>
          <span className="flex items-center gap-1.5 text-editorial-charcoal">
            <span className="w-3 h-3 rounded-none bg-editorial-charcoal border border-editorial-charcoal block" />{' '}
            {language === 'es' ? 'Tu Mesa' : 'Your Table'}
          </span>
        </div>
      </div>

      {/* Grid of Tables resembling actual visual spot maps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="table-selection-grid">
        {areaTables.map((table) => {
          const occupies = isTableOccupied(table.id);
          const isSelected = selectedTableId === table.id;
          const capacityWarning = guestsCount > table.capacity;
          const tableNameResolved = table.name[language] || table.name.es || table.name.en;

          return (
            <div
              key={table.id}
              onClick={() => {
                if (!occupies) {
                  setSelectedTableId(table.id);
                }
              }}
              className={`relative p-5 rounded-none border transition-all flex flex-col justify-between h-44 ${
                occupies
                  ? 'bg-rose-50 border-rose-200 opacity-60 cursor-not-allowed text-rose-800'
                  : isSelected
                  ? 'bg-editorial-stone border-editorial-charcoal shadow-sm cursor-pointer'
                  : 'bg-editorial-bg border-editorial-charcoal/15 hover:border-editorial-charcoal/40 cursor-pointer'
              }`}
              id={`table-card-${table.id}`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-editorial-charcoal/60 font-mono">
                    {table.id}
                  </span>
                  {occupies ? (
                    <span className="bg-rose-100 text-rose-800 text-[9px] px-2 py-0.5 border border-rose-200 font-bold uppercase tracking-wider rounded-none">
                      {language === 'es' ? 'Reservado' : 'Reserved'}
                    </span>
                  ) : isSelected ? (
                    <span className="bg-editorial-charcoal text-editorial-bg text-[9px] px-2 py-0.5 border border-editorial-charcoal font-bold uppercase tracking-wider rounded-none animate-pulse">
                      {language === 'es' ? 'Seleccionada' : 'Selected'}
                    </span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-800 text-[9px] px-2 py-0.5 border border-emerald-200 font-bold uppercase tracking-wider rounded-none">
                      {language === 'es' ? 'Libre' : 'Available'}
                    </span>
                  )}
                </div>

                <h4 className="font-serif font-bold text-editorial-charcoal text-base mt-2">
                  {tableNameResolved}
                </h4>
              </div>

              <div className="space-y-2 border-t border-editorial-charcoal/10 pt-2.5 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-editorial-charcoal/60 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-editorial-charcoal" />{' '}
                    {t('booking.tableSelector.capacity', language)}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      capacityWarning && !occupies ? 'text-rose-700' : 'text-editorial-charcoal'
                    }`}
                  >
                    {table.capacity} {t('booking.tableSelector.seats', language)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-editorial-charcoal/60 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-editorial-charcoal" />{' '}
                    {language === 'es' ? 'Consumo Mínimo' : 'Min Consumption'}:
                  </span>
                  <span className="font-bold text-editorial-charcoal font-mono">
                    ${table.minimumConsumption.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Capacity mismatch alarm */}
              {capacityWarning && !occupies && (
                <div className="absolute inset-x-0 bottom-0 bg-rose-50 border-t border-rose-200 px-3 py-1.5 flex items-center gap-1.5 justify-center animate-fade-in">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-700 flex-shrink-0" />
                  <span className="text-[10px] text-rose-800 font-bold leading-none uppercase tracking-wide">
                    {language === 'es'
                      ? `Excede capacidad (${table.capacity}).`
                      : `Exceeds capacity (${table.capacity}).`}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {areaTables.length === 0 && (
          <p className="col-span-full py-6 text-editorial-charcoal/60 text-sm italic">
            {language === 'es'
              ? 'Espacio en preparación. Intenta con otra zona.'
              : 'Space in preparation. Try another area.'}
          </p>
        )}
      </div>

      {/* Error or guide text if no table is selected */}
      <div className="flex items-center justify-between border-t border-editorial-charcoal/15 pt-5">
        <span className="text-xs text-editorial-charcoal/60">
          {!selectedTableId ? (
            <span className="text-rose-700 font-semibold select-none">
              ⚠️ {language === 'es'
                ? 'Selecciona una mesa de la lista para continuar.'
                : 'Select a table from the list to continue.'}
            </span>
          ) : (
            <span className="font-serif italic font-medium">
              {language === 'es'
                ? 'Gran elección, mesa lista. ¡Continuamos!'
                : 'Great choice, table is ready. Let\'s continue!'}
            </span>
          )}
        </span>

        <button
          disabled={!selectedTableId}
          onClick={onNext}
          className="bg-editorial-charcoal text-editorial-bg hover:bg-editorial-charcoal/90 disabled:bg-editorial-stone/40 disabled:text-editorial-charcoal/30 px-6 py-2.5 rounded-none font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer border border-editorial-charcoal"
          id="step-2-next-btn"
        >
          <span>{language === 'es' ? 'Avanzar a Pre-Ordenes' : 'Proceed to Pre-orders'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
