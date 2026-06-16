/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Reservation, ReservationTable, MenuItem } from '../../types';
import { TableArea } from '../../types';
import { useReservation } from '../../context/ReservationContext';
import { t } from '../../utils/translations';
import {
  buildWhatsAppMessage,
  buildWhatsappUrl,
  useSendWhatsappLink,
  type WhatsappPaymentMethod
} from '../../lib/whatsapp';
import { Send, Receipt, CheckCircle } from 'lucide-react';

interface StepSummaryProps {
  completedBooking: Reservation;
  selectedTable: ReservationTable | undefined;
  getAreaLabel: (area: TableArea) => string;
  totalToPay: number;
  preorderedItemsList: { product?: MenuItem; quantity: number; subtotal: number }[];
  preordersTotal: number;
  copyReceiptToClipboard: () => void;
  onReset: () => void;
}

/**
 * Map a reservation's `paymentReference` to the per-method WhatsApp template
 * key. Mirrors the existing `renderPaymentMethod` logic in this component so
 * the CTA's template matches the visible badge.
 */
function paymentMethodFromReference(ref: string | undefined): WhatsappPaymentMethod {
  if (ref && ref.startsWith('TRF-')) return 'transfer';
  if (ref === 'EFECTIVO-LOCAL') return 'cash';
  if (ref && ref.startsWith('PAY-')) return 'card';
  return 'cash';
}

export default function StepSummary({
  completedBooking,
  selectedTable,
  getAreaLabel,
  totalToPay,
  preorderedItemsList,
  preordersTotal,
  copyReceiptToClipboard,
  onReset
}: StepSummaryProps) {
  const { language, businessConfig } = useReservation();
  const sendWhatsappLink = useSendWhatsappLink();

  const paymentMethod = paymentMethodFromReference(completedBooking.paymentReference);
  const whatsappNumber = businessConfig.whatsappNumber;
  const message = buildWhatsAppMessage({
    paymentMethod,
    language,
    reservation: { id: completedBooking.id }
  });
  const whatsappHref = buildWhatsappUrl(message, whatsappNumber);

  const tableName = selectedTable
    ? (selectedTable.name[language] || selectedTable.name.es)
    : completedBooking.tableId;
  const areaName = getAreaLabel(completedBooking.area) || completedBooking.area;

  const renderPaymentMethod = () => {
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
  };

  return (
    <div className="max-w-xl mx-auto text-center space-y-6" id="booking-step-4">
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
              {areaName} - {tableName}
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
          {language === 'es' ? 'Método de Pago' : 'Payment Method'}: {renderPaymentMethod()}
        </div>
      </div>

      {/* WhatsApp actions buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2" id="whatsapp-integration-buttons">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            sendWhatsappLink({
              paymentMethod,
              reservationId: completedBooking.id,
              whatsappNumber
            })
          }
          className="bg-emerald-800 hover:bg-emerald-700 text-editorial-bg font-bold py-3.5 px-4 rounded-none flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-widest"
          id="whatsapp-confirm-anchor"
        >
          <Send className="w-4 h-4 fill-editorial-bg text-editorial-bg" />
          <span>{t('whatsapp.send', language)}</span>
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
          onClick={onReset}
          className="text-editorial-charcoal/70 hover:text-editorial-charcoal text-xs font-bold uppercase tracking-widest cursor-pointer hover:underline"
          id="make-another-booking-btn"
        >
          {language === 'es' ? 'Hacer Otra Reservación' : 'Make Another Reservation'}
        </button>
      </div>
    </div>
  );
}
