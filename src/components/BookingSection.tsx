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
import TableSelector from './booking/TableSelector';
import CheckoutForm from './booking/CheckoutForm';
import { useReservation } from '../context/ReservationContext';
import { t } from '../utils/translations';

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
  const { language } = useReservation();
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
  const handleProceedToPayment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

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

  // Helper to get translated Area label
  const getAreaLabel = (area: TableArea) => {
    return t(`booking.tableSelector.areas.${area}`, language);
  };

  // Generate WhatsApp details text
  const getWhatsAppLink = () => {
    if (!completedBooking) return '#';
    const tableName = selectedTable
      ? (selectedTable.name[language] || selectedTable.name.es)
      : completedBooking.tableId;
    const areaName = getAreaLabel(completedBooking.area) || completedBooking.area;

    const ref = completedBooking.paymentReference || '';
    let payMethod = '';
    if (language === 'es') {
      if (ref.startsWith('TRF-')) payMethod = `💸 Transferencia (Ref: ${ref.replace('TRF-', '')})`;
      else if (ref === 'EFECTIVO-LOCAL') payMethod = `💵 Efectivo (A abonar en local)`;
      else if (ref.startsWith('PAY-')) payMethod = `💳 Tarjeta de Crédito/Débito`;
      else payMethod = `☕ Pago en local`;
    } else {
      if (ref.startsWith('TRF-')) payMethod = `💸 Bank Transfer (Ref: ${ref.replace('TRF-', '')})`;
      else if (ref === 'EFECTIVO-LOCAL') payMethod = `💵 Cash (Pay at store)`;
      else if (ref.startsWith('PAY-')) payMethod = `💳 Credit/Debit Card`;
      else payMethod = `☕ Pay at shop`;
    }
    
    let msg = '';
    if (language === 'es') {
      msg = `*📍 NUEVA RESERVA - CHAYKA COFFEE*\n`;
      msg += `------------------------------------\n`;
      msg += `*Cliente:* ${completedBooking.customerName}\n`;
      msg += `*Fecha:* ${completedBooking.date}\n`;
      msg += `*Hora:* ${completedBooking.timeSlot}\n`;
      msg += `*Lugar:* ${areaName}\n`;
      msg += `*Mesa:* ${tableName}\n`;
      msg += `*Personas:* ${completedBooking.guestsCount} pers.\n`;
      msg += `*Estado / Método:* ${payMethod}\n`;
  
      if (preorderedItemsList.length > 0) {
        msg += `\n*🛒 PRE-ORDEN DIGITAL:*\n`;
        preorderedItemsList.forEach((item) => {
          const nameResolved = item.product?.name[language] || item.product?.name.es;
          msg += `- ${item.quantity}x ${nameResolved} ($${(item.product?.price || 0).toFixed(2)} c/u)\n`;
        });
        msg += `*Total Pre-Orden:* $${preordersTotal.toFixed(2)} USD\n`;
      }
  
      if (completedBooking.notes) {
        msg += `\n*Notas Especiales:* _${completedBooking.notes}_\n`;
      }
  
      msg += `------------------------------------\n`;
      msg += `¡Hola Chayka Coffee! He completado mi reserva y me gustaría confirmar mi llegada. Nos vemos pronto en Otavalo.`;
    } else {
      msg = `*📍 NEW RESERVATION - CHAYKA COFFEE*\n`;
      msg += `------------------------------------\n`;
      msg += `*Customer:* ${completedBooking.customerName}\n`;
      msg += `*Date:* ${completedBooking.date}\n`;
      msg += `*Time:* ${completedBooking.timeSlot}\n`;
      msg += `*Area:* ${areaName}\n`;
      msg += `*Table:* ${tableName}\n`;
      msg += `*Guests:* ${completedBooking.guestsCount} people\n`;
      msg += `*Status / Method:* ${payMethod}\n`;
  
      if (preorderedItemsList.length > 0) {
        msg += `\n*🛒 DIGITAL PRE-ORDER:*\n`;
        preorderedItemsList.forEach((item) => {
          const nameResolved = item.product?.name[language] || item.product?.name.en;
          msg += `- ${item.quantity}x ${nameResolved} ($${(item.product?.price || 0).toFixed(2)} each)\n`;
        });
        msg += `*Pre-Order Total:* $${preordersTotal.toFixed(2)} USD\n`;
      }
  
      if (completedBooking.notes) {
        msg += `\n*Special Notes:* _${completedBooking.notes}_\n`;
      }
  
      msg += `------------------------------------\n`;
      msg += `Hello Chayka Coffee! I have completed my booking and would like to confirm my arrival. See you soon in Otavalo.`;
    }

    const encodedText = encodeURIComponent(msg);
    // Replace and format clean international number
    const formattedPhone = businessConfig.whatsappNumber.replace(/[^0-9+]/g, '');
    return `https://wa.me/${formattedPhone}?text=${encodedText}`;
  };

  const copyReceiptToClipboard = () => {
    if (!completedBooking) return;
    const tableName = selectedTable
      ? (selectedTable.name[language] || selectedTable.name.es)
      : completedBooking.tableId;
    const areaName = getAreaLabel(completedBooking.area) || completedBooking.area;

    const ref = completedBooking.paymentReference || '';
    let payMethod = '';
    if (language === 'es') {
      if (ref.startsWith('TRF-')) payMethod = `Transferencia (Ref: ${ref.replace('TRF-', '')})`;
      else if (ref === 'EFECTIVO-LOCAL') payMethod = `Efectivo (A abonar en local)`;
      else if (ref.startsWith('PAY-')) payMethod = `Tarjeta de Crédito/Débito`;
      else payMethod = `Pago en local`;
    } else {
      if (ref.startsWith('TRF-')) payMethod = `Bank Transfer (Ref: ${ref.replace('TRF-', '')})`;
      else if (ref === 'EFECTIVO-LOCAL') payMethod = `Cash (Pay at store)`;
      else if (ref.startsWith('PAY-')) payMethod = `Credit/Debit Card`;
      else payMethod = `Pay at shop`;
    }
    
    let text = '';

    if (language === 'es') {
      text = `CÓDIGO DE RESERVACIÓN: ${completedBooking.id}\n`;
      text += `Establecimiento: Chayka Coffee\n`;
      text += `Cliente: ${completedBooking.customerName}\n`;
      text += `Fecha: ${completedBooking.date} a las ${completedBooking.timeSlot}\n`;
      text += `Ubicación: ${areaName} - ${tableName}\n`;
      text += `Personas: ${completedBooking.guestsCount}\n`;
      text += `Pago / Método: ${payMethod}\n`;
      if (preorderedItemsList.length > 0) {
        text += `\nPre-orden: \n`;
        preorderedItemsList.forEach((item) => {
          const nameResolved = item.product?.name[language] || item.product?.name.es;
          text += `- ${item.quantity}x ${nameResolved}\n`;
        });
        text += `Total Pre-Orden: $${preordersTotal.toFixed(2)} USD\n`;
      }
    } else {
      text = `RESERVATION CODE: ${completedBooking.id}\n`;
      text += `Establishment: Chayka Coffee\n`;
      text += `Customer: ${completedBooking.customerName}\n`;
      text += `Date: ${completedBooking.date} at ${completedBooking.timeSlot}\n`;
      text += `Location: ${areaName} - ${tableName}\n`;
      text += `Guests: ${completedBooking.guestsCount}\n`;
      text += `Payment / Method: ${payMethod}\n`;
      if (preorderedItemsList.length > 0) {
        text += `\nPre-order: \n`;
        preorderedItemsList.forEach((item) => {
          const nameResolved = item.product?.name[language] || item.product?.name.en;
          text += `- ${item.quantity}x ${nameResolved}\n`;
        });
        text += `Pre-order Total: $${preordersTotal.toFixed(2)} USD\n`;
      }
    }

    navigator.clipboard.writeText(text);
    alert(language === 'es' ? '¡Recibo copiado al portapapeles! Listo para enviar.' : 'Receipt copied to clipboard! Ready to send.');
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
            { num: 1, label: language === 'es' ? 'Fecha y Hora' : 'Date & Time' },
            { num: 2, label: language === 'es' ? 'Elegir Espacio' : 'Choose Space' },
            { num: 3, label: language === 'es' ? 'Pre-órdenes & Pago' : 'Pre-orders & Payment' }
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

            <form onSubmit={handleNextStep1} className="max-w-xl mx-auto bg-editorial-bg border border-editorial-charcoal/15 p-6 rounded-none space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-editorial-charcoal/60 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
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
                  <label className="block text-[10px] font-bold text-editorial-charcoal/60 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
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
          </motion.div>
        )}

        {/* STEP 2: Selection of Area and Table */}
        {step === 2 && (
          <TableSelector
            tables={tables}
            existingReservations={existingReservations}
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
            selectedTableId={selectedTableId}
            setSelectedTableId={setSelectedTableId}
            guestsCount={guestsCount}
            date={date}
            timeSlot={timeSlot}
            onBack={() => setStep(1)}
            onNext={handleNextStep2}
          />
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
                <span>{language === 'es' ? 'Volver' : 'Back'}</span>
              </button>
            </div>

            <div className="text-center max-w-md mx-auto">
              <span className="text-editorial-charcoal/60 font-bold text-[10px] uppercase tracking-[0.25em] block">
                {language === 'es' ? 'Consumo Mínimo Reembolsable' : 'Refundable Minimum Consumption'}
              </span>
              <h3 className="text-2xl font-serif font-bold italic text-editorial-charcoal mt-1">
                {language === 'es' ? 'Pre-Ordenes de Comida y Formulario' : 'Food Pre-Orders & Form'}
              </h3>
              <p className="text-editorial-charcoal/80 text-xs mt-1">
                {language === 'es'
                  ? `La mesa seleccionada cuenta con un consumo mínimo de $${tableMinConsumption.toFixed(2)}. ¡Elige delicias para tu llegada!`
                  : `The selected table has a minimum consumption of $${tableMinConsumption.toFixed(2)}. Choose delicacies for your arrival!`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="preorder-container">
              {/* Left Column: Quick Menu Items Picker */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-editorial-bg border border-editorial-charcoal/15 rounded-none p-4">
                  <h4 className="text-[10px] font-bold text-editorial-charcoal/70 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-editorial-charcoal/10 pb-2">
                    <Coffee className="w-4 h-4 text-editorial-charcoal" />
                    <span>
                      {language === 'es'
                        ? 'Añadir Delicias a tu Reserva (Pre-Orden)'
                        : 'Add Delicacies to your Booking (Pre-Order)'}
                    </span>
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
                            <h5 className="text-xs font-bold text-editorial-charcoal truncate">
                              {p.name[language] || p.name.es}
                            </h5>
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
                              {language === 'es' ? 'Añadir' : 'Add'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info and Customer credentials form */}
              <CheckoutForm
                customerName={customerName}
                setCustomerName={setCustomerName}
                customerPhone={customerPhone}
                setCustomerPhone={setCustomerPhone}
                customerEmail={customerEmail}
                setCustomerEmail={setCustomerEmail}
                notes={notes}
                setNotes={setNotes}
                onSubmit={handleProceedToPayment}
              />
              </div>

              {/* Right Column: Checkout Summary Sidebar */}
              <div className="space-y-4">
            <div className="bg-editorial-stone/30 border border-editorial-charcoal/15 p-4 rounded-none space-y-4">
              <h4 className="text-[10px] font-bold text-editorial-charcoal uppercase tracking-widest flex items-center gap-1.5 border-b border-editorial-charcoal/15 pb-2">
                <Receipt className="w-4 h-4" />
                <span>{language === 'es' ? 'Resumen de la Cita' : 'Appointment Summary'}</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-editorial-charcoal/60">{language === 'es' ? 'Establecimiento:' : 'Establishment:'}</span>
                  <span className="text-editorial-charcoal font-bold">{businessConfig.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-editorial-charcoal/60">{language === 'es' ? 'Fecha/Hora:' : 'Date/Time:'}</span>
                  <span className="text-editorial-charcoal font-bold font-mono">{date} • {timeSlot} {language === 'es' ? 'hs' : 'hrs'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-editorial-charcoal/60">{language === 'es' ? 'Invitados:' : 'Guests:'}</span>
                  <span className="text-editorial-charcoal font-bold">{guestsCount} {language === 'es' ? 'personas' : 'people'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-editorial-charcoal/60">{language === 'es' ? 'Espacio:' : 'Space:'}</span>
                  <span className="text-editorial-charcoal font-bold font-serif italic truncate max-w-[150px] block text-right">
                    {getAreaLabel(selectedArea)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-editorial-charcoal/60">{language === 'es' ? 'Mesa:' : 'Table:'}</span>
                  <span className="text-editorial-charcoal font-bold truncate max-w-[150px] block text-right">
                    {selectedTable ? (selectedTable.name[language] || selectedTable.name.es) : selectedTableId}
                  </span>
                </div>
              </div>

              {preorderedItemsList.length > 0 && (
                <div className="border-t border-editorial-charcoal/10 pt-3 space-y-2">
                  <h5 className="text-[9px] font-bold text-editorial-charcoal/60 uppercase tracking-widest">
                    {language === 'es' ? `Tus Pre-Ordenes (${preorderedItemsList.length})` : `Your Pre-orders (${preorderedItemsList.length})`}
                  </h5>
                  <div className="max-h-[120px] overflow-y-auto space-y-1.5 text-xs pr-1 scrollbar-none">
                    {preorderedItemsList.map((item) => {
                      const nameResolved = item.product?.name[language] || item.product?.name.es;
                      return (
                        <div key={item.product?.id} className="flex justify-between items-center text-[11px]">
                          <span className="text-editorial-charcoal truncate max-w-[120px]">
                            {item.quantity}x {nameResolved}
                          </span>
                          <span className="text-editorial-charcoal/70 font-mono font-semibold">${item.subtotal.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Financial computations */}
              <div className="border-t border-editorial-charcoal/10 pt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-editorial-charcoal/60">{language === 'es' ? 'Consumo Mínimo de Mesa:' : 'Minimum Table Consumption:'}</span>
                  <span className="text-editorial-charcoal font-bold font-mono">${tableMinConsumption.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-editorial-charcoal/60">{language === 'es' ? 'Pre-ordenes Realizadas:' : 'Pre-orders Placed:'}</span>
                  <span className="text-editorial-charcoal font-bold font-mono">${preordersTotal.toFixed(2)}</span>
                </div>

                {/* Pre-order compensates minimum table consumption logic! */}
                {preordersTotal > 0 && preordersTotal < tableMinConsumption && (
                  <div className="p-2.5 bg-editorial-bg border border-editorial-charcoal/10 text-[10px] text-editorial-charcoal/80 font-sans leading-normal">
                    {language === 'es'
                      ? `Nota: Tu pre-orden de $${preordersTotal.toFixed(2)} cubre parte del consumo mínimo de la mesa.`
                      : `Note: Your pre-order of $${preordersTotal.toFixed(2)} covers part of the table's minimum consumption.`}
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-2 border-t border-editorial-charcoal/15 text-editorial-charcoal">
                  <span className="font-bold text-editorial-charcoal/60 uppercase text-[10px] tracking-wider">
                    {language === 'es' ? 'Total a Cancelar:' : 'Total to Pay:'}
                  </span>
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
              <span>{language === 'es' ? 'Proceder con Reserva' : 'Proceed with Booking'}</span>
            </button>
              </div>
            </div>

            {/* Payment Modal integrated */}
            <PaymentModal
              isOpen={isPaymentOpen}
              onClose={() => setIsPaymentOpen(false)}
              onSuccess={handlePaymentSuccess}
              amount={totalToPay}
              description={
                language === 'es'
                  ? `Reserva de Mesa en ${getAreaLabel(selectedArea)} (${selectedTable ? (selectedTable.name[language] || selectedTable.name.es) : selectedTableId}) - ${date}`
                  : `Table Reservation in ${getAreaLabel(selectedArea)} (${selectedTable ? (selectedTable.name[language] || selectedTable.name.en) : selectedTableId}) - ${date}`
              }
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
              <span className="text-emerald-800 font-bold text-[10px] uppercase tracking-[0.2em] block">
                {language === 'es' ? '¡Reserva Completada!' : 'Reservation Completed!'}
              </span>
              <h3 className="text-3xl font-serif font-bold italic text-editorial-charcoal">
                {language === 'es' ? 'Tu Mesa en la Cascada te Espera' : 'Your Table by the Waterfall Awaits'}
              </h3>
              <p className="text-editorial-charcoal/80 text-sm max-w-md mx-auto">
                {language === 'es'
                  ? 'Hemos recibido tu solicitud y se ha realizado tu acreditación online. Presiona el botón de abajo para enviar los detalles a nuestro WhatsApp de Chayka Coffee.'
                  : 'We have received your request and your online validation has been completed. Press the button below to send the details to our Chayka Coffee WhatsApp.'}
              </p>
            </div>

            {/* Simulated Receipt Invoice */}
            <div className="bg-editorial-bg border border-editorial-charcoal/15 p-6 rounded-none text-left space-y-4 shadow-sm" id="success-invoice-receipt">
              <div className="flex justify-between items-center border-b border-dashed border-editorial-charcoal/20 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-editorial-charcoal uppercase tracking-widest">CHAYKA COFFEE</h4>
                  <span className="text-[10px] text-editorial-charcoal/60">
                    {language === 'es' ? 'Otavalo, Cascada de Peguche' : 'Otavalo, Peguche Waterfall'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-editorial-charcoal/50 block uppercase font-mono tracking-wider">Ticket</span>
                  <span className="text-xs font-bold font-mono text-editorial-charcoal uppercase">{completedBooking.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-editorial-charcoal/50 block uppercase text-[8px] font-bold tracking-wider">
                    {language === 'es' ? 'Cliente' : 'Customer'}
                  </span>
                  <span className="text-editorial-charcoal font-bold">{completedBooking.customerName}</span>
                </div>
                <div>
                  <span className="text-editorial-charcoal/50 block uppercase text-[8px] font-bold tracking-wider">WhatsApp</span>
                  <span className="text-editorial-charcoal font-mono font-semibold">{completedBooking.customerPhone}</span>
                </div>
                <div>
                  <span className="text-editorial-charcoal/50 block uppercase text-[8px] font-bold tracking-wider">
                    {language === 'es' ? 'Fecha de Cita' : 'Appointment Date'}
                  </span>
                  <span className="text-editorial-charcoal font-bold font-mono">{completedBooking.date}</span>
                </div>
                <div>
                  <span className="text-editorial-charcoal/50 block uppercase text-[8px] font-bold tracking-wider">
                    {language === 'es' ? 'Horario / Bloque' : 'Schedule / Slot'}
                  </span>
                  <span className="text-editorial-charcoal font-bold font-mono">{completedBooking.timeSlot} {language === 'es' ? 'hs' : 'hrs'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-editorial-charcoal/50 block uppercase text-[8px] font-bold tracking-wider">
                    {language === 'es' ? 'Ubicación y Mesa' : 'Location and Table'}
                  </span>
                  <span className="text-editorial-charcoal font-bold italic font-serif">
                    {getAreaLabel(completedBooking.area)} - {selectedTable ? (selectedTable.name[language] || selectedTable.name.es) : completedBooking.tableId}
                  </span>
                </div>
              </div>

              {preorderedItemsList.length > 0 && (
                <div className="border-t border-dashed border-editorial-charcoal/20 pt-3 space-y-1.5 text-xs">
                  <span className="text-editorial-charcoal/50 block uppercase text-[8px] font-bold tracking-wider">
                    {language === 'es' ? 'Pre-órdenes Incluidas' : 'Pre-orders Included'}
                  </span>
                  {preorderedItemsList.map((item) => {
                    const nameResolved = item.product?.name[language] || item.product?.name.es;
                    return (
                      <div key={item.product?.id} className="flex justify-between text-editorial-charcoal/80 font-mono text-[11px]">
                        <span>{item.quantity}x {nameResolved}</span>
                        <span>${item.subtotal.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="border-t border-dashed border-editorial-charcoal/20 pt-3 flex justify-between items-baseline text-editorial-charcoal">
                <span className="text-[9px] uppercase font-bold tracking-wider text-editorial-charcoal/50 font-mono">
                  {language === 'es' ? 'Total Garantizado:' : 'Guaranteed Total:'}
                </span>
                <span className="text-lg font-black font-serif italic">${totalToPay.toFixed(2)} USD</span>
              </div>

              <div className="bg-editorial-stone/40 border border-editorial-charcoal/10 p-2.5 rounded-none text-[10px] text-center text-editorial-charcoal font-bold font-mono uppercase tracking-wider">
                {language === 'es' ? 'Método de Pago' : 'Payment Method'}: {(() => {
                  const ref = completedBooking.paymentReference || '';
                  if (ref.startsWith('TRF-')) {
                    return (
                      <span className="text-emerald-800 font-bold uppercase flex items-center gap-1 justify-center mt-1">
                        <CheckCircle className="w-3.5 h-3.5" /> {language === 'es' ? 'Transferencia Bancaria' : 'Bank Transfer'} ({ref.replace('TRF-', '')})
                      </span>
                    );
                  }
                  if (ref === 'EFECTIVO-LOCAL') {
                    return (
                      <span className="text-amber-850 font-bold uppercase flex items-center gap-1 justify-center mt-1">
                        <CheckCircle className="w-3.5 h-3.5" /> {language === 'es' ? 'Efectivo en local' : 'Cash at store'}
                      </span>
                    );
                  }
                  if (ref.startsWith('PAY-')) {
                    return (
                      <span className="text-emerald-800 font-bold uppercase flex items-center gap-1 justify-center mt-1">
                        <CheckCircle className="w-3.5 h-3.5" /> {language === 'es' ? 'Tarjeta (Crédito/Débito)' : 'Card (Credit/Debit)'} ({ref})
                      </span>
                    );
                  }
                  return (
                    <span className="text-editorial-charcoal font-bold uppercase mt-1 block">
                      {language === 'es' ? 'Pendiente / Pago en local' : 'Pending / Pay at shop'}
                    </span>
                  );
                })()}
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
                <span>{language === 'es' ? 'Enviar a Whatsapp' : 'Send to WhatsApp'}</span>
              </a>

              <button
                onClick={copyReceiptToClipboard}
                type="button"
                className="bg-editorial-bg hover:bg-editorial-stone text-editorial-charcoal border border-editorial-charcoal/30 font-bold py-3.5 px-4 rounded-none flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-widest"
                id="copy-invoice-btn"
              >
                <Receipt className="w-4 h-4" />
                <span>{language === 'es' ? 'Copiar Recibo' : 'Copy Receipt'}</span>
              </button>
            </div>

            <p className="text-[10px] text-editorial-charcoal/60 text-center max-w-sm mx-auto font-sans leading-normal">
              {language === 'es'
                ? 'Chayka Coffee se ubica en el sendero principal del Parque Cascada de Peguche. ¡Prepara tu cámara para un entorno único!'
                : 'Chayka Coffee is located on the main trail of Peguche Waterfall Park. Prepare your camera for a unique setting!'}
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
                {language === 'es' ? 'Hacer Otra Reservación' : 'Make Another Reservation'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
