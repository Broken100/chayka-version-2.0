/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MenuItem, Category, ReservationTable, Reservation, TableArea, BusinessConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Grid,
  MapPin,
  Flame,
  Coffee,
  Heart,
  ChevronRight,
  ArrowLeft,
  DollarSign,
  Send,
  Sparkles,
  Info,
  CheckCircle,
  AlertTriangle,
  Receipt
} from 'lucide-react';
import PaymentModal from './PaymentModal';

interface BookingSectionProps {
  businessConfig: BusinessConfig;
  tables: ReservationTable[];
  menuProducts: MenuItem[];
  onReservationComplete: (reservation: Reservation) => void;
  existingReservations: Reservation[];
}

const AREA_LABELS: Record<TableArea, { label: string; desc: string; icon: string; bg: string }> = {
  waterfall_deck: {
    label: 'Terraza Cascada (Premium)',
    desc: 'Brisa refrescante, senderos florales con vista directa a la Cascada de Peguche.',
    icon: 'Droplets',
    bg: 'text-editorial-charcoal bg-editorial-stone/30 border border-editorial-charcoal/15'
  },
  fireplace_cozy: {
    label: 'Rincón Chimenea',
    desc: 'Calor de hogar con fogón a leña, sillones de cuero y música acústica andina.',
    icon: 'Flame',
    bg: 'text-editorial-charcoal bg-editorial-stone/30 border border-editorial-charcoal/15'
  },
  indoor_premium: {
    label: 'Salón Chayka Ancestral',
    desc: 'Arquitectura rústica de madera tallada y piedra volcánica del norte de Otavalo.',
    icon: 'Home',
    bg: 'text-editorial-charcoal bg-editorial-stone/30 border border-editorial-charcoal/15'
  },
  terrace_panoramic: {
    label: 'Mirador del Cóndor',
    desc: 'Vista 360° al Cerro Imbabura y los valles sagrados, ideal para atardeceres mágicos.',
    icon: 'Compass',
    bg: 'text-editorial-charcoal bg-editorial-stone/30 border border-editorial-charcoal/15'
  }
};

export default function BookingSection({
  businessConfig,
  tables,
  menuProducts,
  onReservationComplete,
  existingReservations
}: BookingSectionProps) {
  const [step, setStep] = useState<number>(1); // Step 1: Date/Time/Pax, 2: Area & Table Selection, 3: Optional Pre-orders, 4: Receipt/Finalize
  const [date, setDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [selectedArea, setSelectedArea] = useState<TableArea>('waterfall_deck');
  const [selectedTableId, setSelectedTableId] = useState<string>('');

  // Pre-order state: { [productId]: quantity }
  const [preorders, setPreorders] = useState<{ [id: string]: number }>({});

  // Client info state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Payment states
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentFinished, setPaymentFinished] = useState(false);
  const [paymentRef, setPaymentRef] = useState<string>('');

  // Success state - holds completed booking
  const [completedBooking, setCompletedBooking] = useState<Reservation | null>(null);

  // Set default tomorrow date
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
    if (businessConfig.timeSlots.length > 0) {
      setTimeSlot(businessConfig.timeSlots[2]); // Default standard slot e.g. 11h00
    }
  }, [businessConfig]);

  // Determine if a table is reserved on the selected date & time Slot
  const isTableOccupied = (tableId: string) => {
    return existingReservations.some(
      (res) => res.date === date && res.timeSlot === timeSlot && res.tableId === tableId && res.status !== 'cancelled'
    );
  };

  // Filter tables in chosen Area
  const areaTables = tables.filter((t) => t.area === selectedArea);
  const selectedTable = tables.find((t) => t.id === selectedTableId);

  // Calculate pre-order summary
  const preorderedItemsList = Object.entries(preorders)
    .filter(([_, qty]) => (qty as number) > 0)
    .map(([id, qty]) => {
      const prod = menuProducts.find((p) => p.id === id);
      const qtyNum = qty as number;
      return {
        product: prod,
        quantity: qtyNum,
        subtotal: (prod?.price || 0) * qtyNum
      };
    });

  const preordersTotal = preorderedItemsList.reduce((sum, item) => sum + item.subtotal, 0);

  // Choose payment amount: either minimum consumption of table + preorders, or just preorders
  const tableMinConsumption = selectedTable?.minimumConsumption || 0;
  const totalToPay = Math.max(tableMinConsumption, preordersTotal);

  const handleAddToPreorder = (item: MenuItem) => {
    setPreorders((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
  };

  const handleRemoveFromPreorder = (itemId: string) => {
    setPreorders((prev) => {
      const next = { ...prev };
      if (next[itemId] > 1) {
        next[itemId] -= 1;
      } else {
        delete next[itemId];
      }
      return next;
    });
  };

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !timeSlot) return;
    setStep(2);
  };

  const handleSelectTable = (table: ReservationTable) => {
    if (isTableOccupied(table.id)) return;
    if (guestsCount > table.capacity) {
      // Allow minor flex, but warn or stop if excessive
    }
    setSelectedTableId(table.id);
  };

  const handleNextStep2 = () => {
    if (!selectedTableId) return;
    setStep(3); // Go to pre-order choice
  };

  // Step 3 leads to user personal fields or payment triggers
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone) return;

    // Trigger payment modal directly if we need to pay, or bypass
    if (totalToPay > 0) {
      setIsPaymentOpen(true);
    } else {
      // Double safe path if total is 0
      finalizeReservation('');
    }
  };

  const handlePaymentSuccess = (reference: string) => {
    setPaymentRef(reference);
    setPaymentFinished(true);
    setIsPaymentOpen(false);

    // Concurrently finalize the booking data structure and store
    finalizeReservation(reference);
  };

  const finalizeReservation = (reference: string) => {
    const newReservation: Reservation = {
      id: 'RES-' + Math.floor(100000 + Math.random() * 900000),
      customerName,
      customerEmail,
      customerPhone,
      date,
      timeSlot,
      tableId: selectedTableId,
      area: selectedArea,
      guestsCount,
      status: 'pending', // Initially pending until WhatsApp confirmation or instant approve
      paymentStatus: reference ? 'simulated_paid' : 'unpaid',
      paymentReference: reference,
      notes,
      timestamp: new Date().toISOString(),
      selectedOrderItems: Object.entries(preorders)
        .filter(([_, qty]) => (qty as number) > 0)
        .map(([id, qty]) => ({
          menuItemId: id,
          quantity: qty as number,
          price: menuProducts.find((p) => p.id === id)?.price || 0
        }))
    };

    onReservationComplete(newReservation);
    setCompletedBooking(newReservation);
    setStep(4); // Move to success invoice view
  };

  // Generate WhatsApp details text
  const getWhatsAppLink = () => {
    if (!completedBooking) return '#';
    const tableName = selectedTable?.name || completedBooking.tableId;
    const areaName = AREA_LABELS[completedBooking.area]?.label || completedBooking.area;

    let msg = `*📍 NUEVA RESERVA - CHAYKA COFFEE*\n`;
    msg += `------------------------------------\n`;
    msg += `*Cliente:* ${completedBooking.customerName}\n`;
    msg += `*Fecha:* ${completedBooking.date}\n`;
    msg += `*Hora:* ${completedBooking.timeSlot}\n`;
    msg += `*Lugar:* ${areaName}\n`;
    msg += `*Mesa:* ${tableName}\n`;
    msg += `*Personas:* ${completedBooking.guestsCount} pers.\n`;
    msg += `*Estado de Pago:* ${completedBooking.paymentStatus === 'simulated_paid' ? '✅ PAGADO ONLINE' : '☕ PAGO EN COCAL'}\n`;
    if (completedBooking.paymentReference) {
      msg += `*Ref Transacción (Simulada):* ${completedBooking.paymentReference}\n`;
    }

    if (preorderedItemsList.length > 0) {
      msg += `\n*🛒 PRE-ORDEN DIGITAL:*\n`;
      preorderedItemsList.forEach((item) => {
        msg += `- ${item.quantity}x ${item.product?.name} ($${(item.product?.price || 0).toFixed(2)} c/u)\n`;
      });
      msg += `*Total Pre-Orden:* $${preordersTotal.toFixed(2)} USD\n`;
    }

    if (completedBooking.notes) {
      msg += `\n*Notas Especiales:* _${completedBooking.notes}_\n`;
    }

    msg += `------------------------------------\n`;
    msg += `¡Hola Chayka Coffee! He completado mi reserva y me gustaría confirmar mi llegada. Nos vemos pronto en Otavalo.`;

    const encodedText = encodeURIComponent(msg);
    // Replace and format clean international number
    const formattedPhone = businessConfig.whatsappNumber.replace(/[^0-9+]/g, '');
    return `https://wa.me/${formattedPhone}?text=${encodedText}`;
  };

  const copyReceiptToClipboard = () => {
    if (!completedBooking) return;
    const tableName = selectedTable?.name || completedBooking.tableId;
    const areaName = AREA_LABELS[completedBooking.area]?.label || completedBooking.area;

    let text = `CÓDIGO DE RESERVACIÓN: ${completedBooking.id}\n`;
    text += `Establecimiento: Chayka Coffee\n`;
    text += `Cliente: ${completedBooking.customerName}\n`;
    text += `Fecha: ${completedBooking.date} a las ${completedBooking.timeSlot}\n`;
    text += `Ubicación: ${areaName} - ${tableName}\n`;
    text += `Personas: ${completedBooking.guestsCount}\n`;
    text += `Pago: ${completedBooking.paymentStatus === 'simulated_paid' ? 'Confirmado Online' : 'Por cancelar en cafetería'}\n`;
    if (completedBooking.paymentReference) {
      text += `ID Transacción: ${completedBooking.paymentReference}\n`;
    }
    if (preorderedItemsList.length > 0) {
      text += `\nPre-orden: \n`;
      preorderedItemsList.forEach((item) => {
        text += `- ${item.quantity}x ${item.product?.name}\n`;
      });
      text += `Total Pre-Orden: $${preordersTotal.toFixed(2)} USD\n`;
    }

    navigator.clipboard.writeText(text);
    alert('¡Recibo copiado al portapapeles! Listo para enviar.');
  };

  return (
    <div className="bg-editorial-stone/20 p-4 md:p-8 rounded-none border border-editorial-charcoal/15 max-w-4xl mx-auto" id="booking-section-wrapper">
      {/* Step Indicators */}
      {step < 4 && (
        <div className="flex justify-between items-center max-w-lg mx-auto mb-8 relative px-2" id="booking-steps-nav">
          <div className="absolute left-2.5 right-2.5 top-1/2 h-[1px] bg-editorial-charcoal/10 -translate-y-1/2 -z-10" />
          <div
            className="absolute left-2.5 top-1/2 h-[1px] bg-editorial-charcoal/50 -translate-y-1/2 -z-10 transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 98}%` }}
          />

          {[
            { num: 1, label: 'Fecha y Hora' },
            { num: 2, label: 'Elegir Espacio' },
            { num: 3, label: 'Pre-órdenes & Pago' }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-none flex items-center justify-center text-xs font-bold transition-all border ${
                  step >= s.num
                    ? 'bg-editorial-charcoal text-editorial-bg border-editorial-charcoal scale-102 font-mono'
                    : 'bg-editorial-bg text-editorial-charcoal/40 border-editorial-charcoal/20 font-mono'
                }`}
              >
                {step > s.num ? <CheckCircle className="w-4 h-4 text-emerald-300" /> : s.num}
              </div>
              <span
                className={`text-[9px] uppercase tracking-widest font-black mt-2 hidden sm:block ${
                  step >= s.num ? 'text-editorial-charcoal' : 'text-editorial-charcoal/40'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* STEP 1: Date, Time & Guests */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 text-left"
            id="booking-step-1"
          >
            <div className="text-center max-w-md mx-auto">
              <span className="text-editorial-charcoal/60 font-bold text-[10px] uppercase tracking-[0.25em]">Planifica Tu Visita</span>
              <h3 className="text-2xl font-serif font-bold italic text-editorial-charcoal mt-1">Elige Fecha y Cantidad</h3>
              <p className="text-editorial-charcoal/80 text-xs mt-1">
                La Cascada de Peguche es maravillosa de día y pacífica de noche. Elige el tiempo perfecto para tu mesa.
              </p>
            </div>

            <form onSubmit={handleNextStep1} className="max-w-xl mx-auto bg-editorial-bg border border-editorial-charcoal/15 p-6 rounded-none space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-editorial-charcoal/60 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-editorial-charcoal" />
                    <span>Seleccionar Fecha</span>
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
                  <label className="block text-[10px] font-bold text-editorial-charcoal/60 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-editorial-charcoal" />
                    <span>Bloque Horario</span>
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
                        {ts} hs - Acceso de Mesa
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-editorial-charcoal/60 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-editorial-charcoal" />
                  <span>Número de Visitantes (Adultos y Niños)</span>
                </label>
                <div className="flex items-center gap-4 bg-editorial-stone/25 border border-editorial-charcoal/10 p-3 rounded-none justify-between">
                  <span className="text-xs font-bold text-editorial-charcoal/80">¿Para cuántas personas?</span>
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
                  <span className="font-bold block text-editorial-charcoal uppercase text-[10px]">Horarios de Reserva</span>
                  Aceptamos reservas online todos los días. Las mesas de la Terraza Mirador cuentan con un consumo mínimo integrado reembolsable en consumo.
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-editorial-charcoal text-editorial-bg font-bold py-3.5 rounded-none flex items-center justify-center gap-2 hover:bg-editorial-charcoal/90 cursor-pointer shadow-none transition-all uppercase tracking-widest text-xs"
                id="step-1-submit-btn"
              >
                <span>Buscar Espacios Disponibles</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 2: Selection of Area and Table */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 text-left"
            id="booking-step-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setStep(1)}
                className="text-editorial-charcoal/60 hover:text-editorial-charcoal text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                id="back-to-step1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>
            </div>

            <div className="text-center max-w-md mx-auto">
              <span className="text-editorial-charcoal/60 font-bold text-[10px] uppercase tracking-[0.25em]">Aventura Visual</span>
              <h3 className="text-2xl font-serif font-bold italic text-editorial-charcoal mt-1">Nuestros Rincones Mágicos</h3>
              <p className="text-editorial-charcoal/80 text-xs mt-1">
                Selecciona la zona que prefieras y escoge tu mesa de la suerte.
              </p>
            </div>

            {/* Area Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" id="area-selection-grid">
              {(Object.keys(AREA_LABELS) as TableArea[]).map((areaKey) => {
                const info = AREA_LABELS[areaKey];
                const isSelected = selectedArea === areaKey;
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
                      <span className="text-[9px] uppercase font-bold tracking-widest text-editorial-charcoal/60">Zona</span>
                      {areaKey === 'waterfall_deck' && <Coffee className="w-3.5 h-3.5 text-editorial-charcoal" />}
                      {areaKey === 'fireplace_cozy' && <Flame className="w-3.5 h-3.5 text-editorial-charcoal" />}
                    </div>
                    <span className="text-sm font-serif font-bold italic text-editorial-charcoal mt-2 relative z-10">{info.label}</span>
                    <p className="text-[10px] text-editorial-charcoal/70 mt-1 leading-normal relative z-10 font-normal font-sans">{info.desc}</p>
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
                  Mapeo en: <span className="font-serif italic text-base font-normal">{AREA_LABELS[selectedArea].label}</span>
                </h4>
                <p className="text-editorial-charcoal/70 text-xs mt-0.5">
                  Disponibilidad para el <span className="font-bold text-editorial-charcoal font-mono text-[11px]">{date}</span> en bloque <span className="font-bold text-editorial-charcoal font-mono text-[11px]">{timeSlot} hs</span>
                </p>
              </div>

              {/* Legend */}
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider font-mono">
                <span className="flex items-center gap-1.5 text-editorial-charcoal/70">
                  <span className="w-3 h-3 rounded-none bg-editorial-bg border border-editorial-charcoal/20 block" /> Libre
                </span>
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-3 h-3 rounded-none bg-rose-100 border border-rose-300 block" /> Reservado
                </span>
                <span className="flex items-center gap-1.5 text-editorial-charcoal">
                  <span className="w-3 h-3 rounded-none bg-editorial-charcoal border border-editorial-charcoal block" /> Tu Mesa
                </span>
              </div>
            </div>

            {/* Grid of Tables resembling actual visual spot maps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="table-selection-grid">
              {areaTables.map((table) => {
                const occupies = isTableOccupied(table.id);
                const isSelected = selectedTableId === table.id;
                const capacityWarning = guestsCount > table.capacity;

                return (
                  <div
                    key={table.id}
                    onClick={() => !occupies && handleSelectTable(table)}
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
                            Reservado
                          </span>
                        ) : isSelected ? (
                          <span className="bg-editorial-charcoal text-editorial-bg text-[9px] px-2 py-0.5 border border-editorial-charcoal font-bold uppercase tracking-wider rounded-none animate-pulse">
                            Seleccionada
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-800 text-[9px] px-2 py-0.5 border border-emerald-200 font-bold uppercase tracking-wider rounded-none">
                            Libre
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif font-bold text-editorial-charcoal text-base mt-2">
                        {table.name}
                      </h4>
                    </div>

                    <div className="space-y-2 border-t border-editorial-charcoal/10 pt-2.5 mt-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-editorial-charcoal/60 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-editorial-charcoal" /> Capacidad Máxima:
                        </span>
                        <span className={`font-mono font-bold ${capacityWarning && !occupies ? 'text-rose-700' : 'text-editorial-charcoal'}`}>
                          {table.capacity} personas
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-editorial-charcoal/60 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-editorial-charcoal" /> Consumo Mínimo:
                        </span>
                        <span className="font-bold text-editorial-charcoal font-mono">
                          ${table.minimumConsumption.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Capacity mismatch alarm */}
                    {capacityWarning && !occupies && (
                      <div className="absolute inset-x-0 bottom-0 bg-rose-50 border-t border-rose-200 px-3 py-1.5 flex items-center gap-1.5 justify-center">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-700 flex-shrink-0" />
                        <span className="text-[10px] text-rose-800 font-bold leading-none uppercase tracking-wide">
                          Excede capacidad ({table.capacity}).
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {areaTables.length === 0 && (
                <p className="col-span-full py-6 text-editorial-charcoal/60 text-sm italic">
                  Espacio en preparación. Intenta con otra zona.
                </p>
              )}
            </div>

            {/* Error or guide text if no table is selected */}
            <div className="flex items-center justify-between border-t border-editorial-charcoal/15 pt-5">
              <span className="text-xs text-editorial-charcoal/60">
                {!selectedTableId ? (
                  <span className="text-rose-700 font-semibold select-none">⚠️ Selecciona una mesa de la lista para continuar.</span>
                ) : (
                  <span className="font-serif italic font-medium">Gran elección, mesa lista. ¡Continuamos!</span>
                )}
              </span>

              <button
                disabled={!selectedTableId}
                onClick={handleNextStep2}
                className="bg-editorial-charcoal text-editorial-bg hover:bg-editorial-charcoal/90 disabled:bg-editorial-stone/40 disabled:text-editorial-charcoal/30 px-6 py-2.5 rounded-none font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer border border-editorial-charcoal"
                id="step-2-next-btn"
              >
                <span>Avanzar a Pre-Ordenes</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Pre-orders Choice, Payment & User credentials form */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 text-left"
            id="booking-step-3"
          >
            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="text-editorial-charcoal/60 hover:text-editorial-charcoal text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                id="back-to-step2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>
            </div>

            <div className="text-center max-w-md mx-auto">
              <span className="text-editorial-charcoal/60 font-bold text-[10px] uppercase tracking-[0.25em] block">Consumo Mínimo Reembolsable</span>
              <h3 className="text-2xl font-serif font-bold italic text-editorial-charcoal mt-1">Pre-Ordenes de Comida y Formulario</h3>
              <p className="text-editorial-charcoal/80 text-xs mt-1">
                La mesa seleccionada cuenta con un consumo mínimo de ${tableMinConsumption.toFixed(2)}. ¡Elige delicias para tu llegada!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="preorder-container">
              {/* Left Column: Quick Menu Items Picker */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-editorial-bg border border-editorial-charcoal/15 rounded-none p-4">
                  <h4 className="text-[10px] font-bold text-editorial-charcoal/70 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-editorial-charcoal/10 pb-2">
                    <Coffee className="w-4 h-4 text-editorial-charcoal" />
                    <span>Añadir Delicias a tu Reserva (Pre-Orden)</span>
                  </h4>

                  {/* Little list of items */}
                  <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 scrollbar-none">
                    {menuProducts.map((p) => {
                      const count = preorders[p.id] || 0;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2.5 bg-editorial-stone/20 rounded-none border border-editorial-charcoal/10 hover:border-editorial-charcoal/30 transition-colors gap-3"
                          id={`preorder-picker-item-${p.id}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-none object-cover flex-shrink-0 border border-editorial-charcoal/10 filter saturate-50"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-editorial-charcoal truncate">{p.name}</h5>
                              <span className="text-[11px] text-editorial-charcoal font-semibold font-serif italic">${p.price.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {count > 0 ? (
                              <div className="flex items-center bg-editorial-bg border border-editorial-charcoal/15 rounded-none p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFromPreorder(p.id)}
                                  className="w-6 h-6 bg-editorial-stone hover:bg-editorial-stone-dark text-editorial-charcoal font-black flex items-center justify-center rounded-none cursor-pointer text-xs"
                                  id={`pre-minus-${p.id}`}
                                >
                                  -
                                </button>
                                <span className="text-xs text-editorial-charcoal font-bold px-2 font-mono">{count}</span>
                                <button
                                  type="button"
                                  onClick={() => handleAddToPreorder(p)}
                                  className="w-6 h-6 bg-editorial-stone hover:bg-editorial-stone-dark text-editorial-charcoal font-black flex items-center justify-center rounded-none cursor-pointer text-xs"
                                  id={`pre-plus-${p.id}`}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddToPreorder(p)}
                                className="bg-editorial-bg border border-editorial-charcoal/25 hover:border-editorial-charcoal hover:bg-editorial-stone text-editorial-charcoal text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-none cursor-pointer transition-colors"
                                id={`pre-add-${p.id}`}
                              >
                                Añadir
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Info and Customer credentials form */}
                <form onSubmit={handleProceedToPayment} className="bg-editorial-bg border border-editorial-charcoal/15 p-5 rounded-none space-y-4">
                  <h4 className="text-[10px] font-bold text-editorial-charcoal/70 uppercase tracking-widest flex items-center gap-1.5 border-b border-editorial-charcoal/10 pb-2">
                    <Users className="w-4 h-4 text-editorial-charcoal" />
                    <span>Datos de Contacto para Reservación</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-editorial-charcoal/60 mb-1 font-bold uppercase tracking-wider">Tu Nombre Completo</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Tupac Amaru Chango"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-editorial-stone/20 border border-editorial-charcoal/20 rounded-none text-xs py-2.5 px-3 text-editorial-charcoal focus:outline-none focus:border-editorial-charcoal font-sans"
                        id="booking-cust-name"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-editorial-charcoal/60 mb-1 font-bold uppercase tracking-wider">WhatsApp (Ej. +593)</label>
                      <input
                        type="tel"
                        required
                        placeholder="+593 98 765 4321"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-editorial-stone/20 border border-editorial-charcoal/20 rounded-none text-xs py-2.5 px-3 text-editorial-charcoal focus:outline-none focus:border-editorial-charcoal font-sans font-mono"
                        id="booking-cust-phone"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-editorial-charcoal/60 mb-1 font-bold uppercase tracking-wider">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      placeholder="maria@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-editorial-stone/20 border border-editorial-charcoal/20 rounded-none text-xs py-2.5 px-3 text-editorial-charcoal focus:outline-none focus:border-editorial-charcoal font-sans"
                      id="booking-cust-email"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-editorial-charcoal/60 mb-1 font-bold uppercase tracking-wider">Peticiones o Alergias Especiales (Opcional)</label>
                    <textarea
                      placeholder="Ej. Cumpleaños, mesa libre de maní, rilla de ruedas, etc."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-editorial-stone/20 border border-editorial-charcoal/20 rounded-none text-xs py-2 px-3 text-editorial-charcoal focus:outline-none focus:border-editorial-charcoal resize-none font-sans"
                      id="booking-cust-notes"
                    />
                  </div>

                  <button type="submit" className="hidden" id="booking-form-submit-hidden" />
                </form>
              </div>

              {/* Right Column: Checkout Summary Sidebar */}
              <div className="space-y-4">
                <div className="bg-editorial-stone/30 border border-editorial-charcoal/15 p-4 rounded-none space-y-4">
                  <h4 className="text-[10px] font-bold text-editorial-charcoal uppercase tracking-widest flex items-center gap-1.5 border-b border-editorial-charcoal/15 pb-2">
                    <Receipt className="w-4 h-4" />
                    <span>Resumen de la Cita</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-editorial-charcoal/60">Establecimiento:</span>
                      <span className="text-editorial-charcoal font-bold">{businessConfig.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-editorial-charcoal/60">Fecha/Hora:</span>
                      <span className="text-editorial-charcoal font-bold font-mono">{date} • {timeSlot} hs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-editorial-charcoal/60">Invitados:</span>
                      <span className="text-editorial-charcoal font-bold">{guestsCount} personas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-editorial-charcoal/60">Espacio:</span>
                      <span className="text-editorial-charcoal font-bold font-serif italic truncate max-w-[150px] block text-right">
                        {AREA_LABELS[selectedArea].label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-editorial-charcoal/60">Mesa:</span>
                      <span className="text-editorial-charcoal font-bold truncate max-w-[150px] block text-right">
                        {selectedTable?.name || selectedTableId}
                      </span>
                    </div>
                  </div>

                  {preorderedItemsList.length > 0 && (
                    <div className="border-t border-editorial-charcoal/10 pt-3 space-y-2">
                      <h5 className="text-[9px] font-bold text-editorial-charcoal/60 uppercase tracking-widest">Tus Pre-Ordenes ({preorderedItemsList.length})</h5>
                      <div className="max-h-[120px] overflow-y-auto space-y-1.5 text-xs pr-1 scrollbar-none">
                        {preorderedItemsList.map((item) => (
                          <div key={item.product?.id} className="flex justify-between items-center text-[11px]">
                            <span className="text-editorial-charcoal truncate max-w-[120px]">
                              {item.quantity}x {item.product?.name}
                            </span>
                            <span className="text-editorial-charcoal/70 font-mono font-semibold">${item.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Financial computations */}
                  <div className="border-t border-editorial-charcoal/10 pt-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-editorial-charcoal/60">Consumo Mínimo de Mesa:</span>
                      <span className="text-editorial-charcoal font-bold font-mono">${tableMinConsumption.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-editorial-charcoal/60">Pre-ordenes Realizadas:</span>
                      <span className="text-editorial-charcoal font-bold font-mono">${preordersTotal.toFixed(2)}</span>
                    </div>

                    {/* Pre-order compensates minimum table consumption logic! */}
                    {preordersTotal > 0 && preordersTotal < tableMinConsumption && (
                      <div className="p-2.5 bg-editorial-bg border border-editorial-charcoal/10 text-[10px] text-editorial-charcoal/80 font-sans leading-normal">
                        Nota: Tu pre-orden de <span className="font-bold text-editorial-charcoal font-mono">${preordersTotal.toFixed(2)}</span> cubre parte del consumo mínimo de la mesa.
                      </div>
                    )}

                    <div className="flex justify-between items-baseline pt-2 border-t border-editorial-charcoal/15 text-editorial-charcoal">
                      <span className="font-bold text-editorial-charcoal/60 uppercase text-[10px] tracking-wider">Total a Cancelar:</span>
                      <span className="text-xl font-bold font-serif italic text-editorial-charcoal">${totalToPay.toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>

                {/* Submit button wrapper trigger */}
                <button
                  type="button"
                  onClick={() => {
                    const form = document.getElementById('booking-form-submit-hidden') as HTMLButtonElement | null;
                    if (form) form.click();
                  }}
                  className="w-full bg-editorial-charcoal text-editorial-bg font-bold py-3.5 rounded-none flex items-center justify-center gap-2 hover:bg-editorial-charcoal/90 transition-all cursor-pointer shadow-none uppercase tracking-widest text-xs border border-editorial-charcoal"
                  id="pay-and-confirm-trigger"
                >
                  <Sparkles className="w-4 h-4 text-editorial-stone" />
                  <span>Proceder con Reserva</span>
                </button>
              </div>
            </div>

            {/* Payment Modal integrated */}
            <PaymentModal
              isOpen={isPaymentOpen}
              onClose={() => setIsPaymentOpen(false)}
              onSuccess={handlePaymentSuccess}
              amount={totalToPay}
              description={`Reserva de Mesa en ${AREA_LABELS[selectedArea].label} (${selectedTable?.name || selectedTableId}) - ${date}`}
            />
          </motion.div>
        )}

        {/* STEP 4: Success, Copy Invoice, real-time WhatsApp generation */}
        {step === 4 && completedBooking && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center space-y-6"
            id="booking-step-4"
          >
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-none flex items-center justify-center mx-auto text-emerald-800">
              <CheckCircle className="w-9 h-9 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-emerald-800 font-bold text-[10px] uppercase tracking-[0.2em] block">¡Reserva Completada!</span>
              <h3 className="text-3xl font-serif font-bold italic text-editorial-charcoal">Tu Mesa en la Cascada te Espera</h3>
              <p className="text-editorial-charcoal/80 text-sm max-w-md mx-auto">
                Hemos recibido tu solicitud y se ha realizado tu acreditación online. Presiona el botón de abajo para enviar los detalles a nuestro WhatsApp de Chayka Coffee.
              </p>
            </div>

            {/* Simulated Receipt Invoice */}
            <div className="bg-editorial-bg border border-editorial-charcoal/15 p-6 rounded-none text-left space-y-4 shadow-sm" id="success-invoice-receipt">
              <div className="flex justify-between items-center border-b border-dashed border-editorial-charcoal/20 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-editorial-charcoal uppercase tracking-widest">CHAYKA COFFEE</h4>
                  <span className="text-[10px] text-editorial-charcoal/60">Otavalo, Cascada de Peguche</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-editorial-charcoal/50 block uppercase font-mono tracking-wider">Ticket</span>
                  <span className="text-xs font-bold font-mono text-editorial-charcoal uppercase">{completedBooking.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-editorial-charcoal/50 block uppercase text-[8px] font-bold tracking-wider">Cliente</span>
                  <span className="text-editorial-charcoal font-bold">{completedBooking.customerName}</span>
                </div>
                <div>
                  <span className="text-editorial-charcoal/50 block uppercase text-[8px] font-bold tracking-wider">WhatsApp</span>
                  <span className="text-editorial-charcoal font-mono font-semibold">{completedBooking.customerPhone}</span>
                </div>
                <div>
                  <span className="text-editorial-charcoal/50 block uppercase text-[8px] font-bold tracking-wider">Fecha de Cita</span>
                  <span className="text-editorial-charcoal font-bold font-mono">{completedBooking.date}</span>
                </div>
                <div>
                  <span className="text-editorial-charcoal/50 block uppercase text-[8px] font-bold tracking-wider">Horario / Bloque</span>
                  <span className="text-editorial-charcoal font-bold font-mono">{completedBooking.timeSlot} hs</span>
                </div>
                <div className="col-span-2">
                  <span className="text-editorial-charcoal/50 block uppercase text-[8px] font-bold tracking-wider">Ubicación y Mesa</span>
                  <span className="text-editorial-charcoal font-bold italic font-serif">
                    {AREA_LABELS[completedBooking.area].label} - {selectedTable?.name || completedBooking.tableId}
                  </span>
                </div>
              </div>

              {preorderedItemsList.length > 0 && (
                <div className="border-t border-dashed border-editorial-charcoal/20 pt-3 space-y-1.5 text-xs">
                  <span className="text-editorial-charcoal/50 block uppercase text-[8px] font-bold tracking-wider">Pre-órdenes Incluidas</span>
                  {preorderedItemsList.map((item) => (
                    <div key={item.product?.id} className="flex justify-between text-editorial-charcoal/80 font-mono text-[11px]">
                      <span>{item.quantity}x {item.product?.name}</span>
                      <span>${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-dashed border-editorial-charcoal/20 pt-3 flex justify-between items-baseline text-editorial-charcoal">
                <span className="text-[9px] uppercase font-bold tracking-wider text-editorial-charcoal/50 font-mono">Total Garantizado:</span>
                <span className="text-lg font-black font-serif italic">${totalToPay.toFixed(2)} USD</span>
              </div>

              <div className="bg-editorial-stone/40 border border-editorial-charcoal/10 p-2.5 rounded-none text-[10px] text-center text-editorial-charcoal font-bold font-mono uppercase tracking-wider">
                Estado: {completedBooking.paymentStatus === 'simulated_paid' ? (
                  <span className="text-emerald-800 font-bold uppercase flex items-center gap-1 justify-center">
                    <CheckCircle className="w-3.5 h-3.5" /> Pago Simulado ({completedBooking.paymentReference})
                  </span>
                ) : (
                  <span className="text-editorial-charcoal font-bold uppercase">Por pagar en local en efectivo/tarjeta</span>
                )}
              </div>
            </div>

            {/* WhatsApp actions buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2" id="whatsapp-integration-buttons">
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-800 hover:bg-emerald-700 text-editorial-bg font-bold py-3.5 px-4 rounded-none flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-widest"
                id="whatsapp-confirm-anchor"
              >
                <Send className="w-4 h-4 fill-editorial-bg text-editorial-bg" />
                <span>Enviar a Whatsapp</span>
              </a>

              <button
                onClick={copyReceiptToClipboard}
                type="button"
                className="bg-editorial-bg hover:bg-editorial-stone text-editorial-charcoal border border-editorial-charcoal/30 font-bold py-3.5 px-4 rounded-none flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-widest"
                id="copy-invoice-btn"
              >
                <Receipt className="w-4 h-4" />
                <span>Copiar Recibo</span>
              </button>
            </div>

            <p className="text-[10px] text-editorial-charcoal/60 text-center max-w-sm mx-auto font-sans leading-normal">
              Chayka Coffee se ubica en el sendero principal del Parque Cascada de Peguche. ¡Prepara tu cámara para un entorno único!
            </p>

            <div className="pt-4">
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedTableId('');
                  setPreorders({});
                  setCustomerName('');
                  setCustomerEmail('');
                  setCustomerPhone('');
                  setNotes('');
                  setCompletedBooking(null);
                }}
                className="text-editorial-charcoal/70 hover:text-editorial-charcoal text-xs font-bold uppercase tracking-widest cursor-pointer hover:underline"
                id="make-another-booking-btn"
              >
                Hacer Otra Reservación
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
