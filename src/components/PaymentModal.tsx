/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Check, ShieldCheck, X, Sparkles, AlertOctagon, RefreshCw } from 'lucide-react';
import { useReservation } from '../context/ReservationContext';
import { t } from '../utils/translations';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reference: string) => void;
  amount: number;
  description: string;
}

export default function PaymentModal({ isOpen, onClose, onSuccess, amount, description }: PaymentModalProps) {
  const { language } = useReservation();
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [errors, setErrors] = useState<{ cardName?: string; cardNumber?: string; expiry?: string; cvv?: string }>({});
  const [method, setMethod] = useState<'card' | 'transfer' | 'cash'>('card');
  const [transferRef, setTransferRef] = useState('');
  const [transferError, setTransferError] = useState('');

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = value.match(/\d{4,16}/g);
    let match = (matches && matches[0]) || '';
    let parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
    if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: undefined }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length >= 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
    } else {
      setExpiry(value);
    }
    if (errors.expiry) setErrors((prev) => ({ ...prev, expiry: undefined }));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/[^0-9]/gi, ''));
    if (errors.cvv) setErrors((prev) => ({ ...prev, cvv: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    
    // Cardholder name validation
    if (!cardName.trim()) {
      newErrors.cardName = language === 'es' ? 'El nombre del titular es obligatorio' : 'Cardholder name is required';
    }

    // Card number validation (expecting 16 digits)
    const cleanNum = cardNumber.replace(/\s+/g, '');
    if (!cleanNum) {
      newErrors.cardNumber = language === 'es' ? 'El número de tarjeta es obligatorio' : 'Card number is required';
    } else if (!/^\d{16}$/.test(cleanNum)) {
      newErrors.cardNumber = language === 'es' ? 'Debe ingresar exactamente 16 dígitos' : 'Must enter exactly 16 digits';
    }

    // Expiry date validation (expecting MM/YY format)
    if (!expiry) {
      newErrors.expiry = language === 'es' ? 'El vencimiento es obligatorio' : 'Expiration date is required';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      newErrors.expiry = language === 'es' ? 'Formato inválido (MM/AA)' : 'Invalid format (MM/YY)';
    }

    // CVV validation (expecting 3 or 4 digits)
    if (!cvv) {
      newErrors.cvv = language === 'es' ? 'El CVV es obligatorio' : 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = language === 'es' ? 'Debe ser de 3 o 4 dígitos' : 'Must be 3 or 4 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSimulatePayment = (outcome: 'success' | 'failed') => {
    if (!validate()) return;

    setIsPaying(true);
    // Simulate high class payment loading
    setTimeout(() => {
      setIsPaying(false);
      if (outcome === 'success') {
        setStatus('success');
        setTimeout(() => {
          const mockRef = 'PAY-' + Math.random().toString(36).substring(2, 11).toUpperCase();
          onSuccess(mockRef);
          // Reset state
          setStatus('idle');
          setCardNumber('');
          setCardName('');
          setExpiry('');
          setCvv('');
        }, 1500);
      } else {
        setStatus('failed');
      }
  };

  const handleSimulateTransferPayment = () => {
    if (!transferRef.trim()) {
      setTransferError(language === 'es' ? 'El número de referencia es obligatorio' : 'Reference number is required');
      return;
    }
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setStatus('success');
      setTimeout(() => {
        onSuccess(`TRF-${transferRef.toUpperCase()}`);
        setStatus('idle');
        setTransferRef('');
      }, 1500);
    }, 1500);
  };

  const handleSimulateCashPayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setStatus('success');
      setTimeout(() => {
        onSuccess('EFECTIVO-LOCAL');
        setStatus('idle');
      }, 1500);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-editorial-charcoal/45 backdrop-blur-sm" id="payment-modal-overlay">
      <AnimatePresence mode="wait">
        {status === 'idle' ? (
          <motion.div
            key="payment-idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md overflow-hidden bg-editorial-bg border border-editorial-charcoal rounded-none shadow-xl p-6"
            id="payment-form-card"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-editorial-charcoal/60 hover:text-editorial-charcoal transition-colors cursor-pointer"
              id="payment-close-btn"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-editorial-stone text-editorial-charcoal border border-editorial-charcoal/10">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-editorial-charcoal leading-none">
                  {t('payment.title', language)}
                </h3>
                <p className="text-[10px] text-editorial-charcoal/60 font-medium uppercase tracking-[0.1em] mt-1.5">
                  {t('payment.subtitle', language)}
                </p>
              </div>
            </div>

            <div className="bg-editorial-stone/30 p-4 rounded-none border border-editorial-charcoal/15 mb-6">
              <span className="text-[9px] text-editorial-charcoal/50 uppercase font-bold tracking-wider block">
                {t('payment.reservationSummary', language)}
              </span>
              <p className="text-xs font-semibold text-editorial-charcoal truncate mt-0.5 font-serif italic">{description}</p>
              <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-editorial-charcoal/10">
                <span className="text-[10px] uppercase tracking-wider font-bold text-editorial-charcoal/60">
                  {language === 'es' ? 'Total a Validar:' : 'Amount to Validate:'}
                </span>
                <span className="text-xl font-bold font-serif italic text-editorial-charcoal">${amount.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="flex border border-editorial-charcoal/10 mb-6 bg-editorial-stone/10">
              {[
                { id: 'card', label: language === 'es' ? 'Tarjeta' : 'Card', icon: CreditCard },
                { id: 'transfer', label: language === 'es' ? 'Transferencia' : 'Transfer', icon: RefreshCw },
                { id: 'cash', label: language === 'es' ? 'Efectivo' : 'Cash', icon: Check }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id as any)}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 border-r border-editorial-charcoal/10 last:border-r-0 cursor-pointer ${
                    method === m.id
                      ? 'bg-editorial-charcoal text-editorial-bg'
                      : 'text-editorial-charcoal/60 hover:text-editorial-charcoal hover:bg-editorial-stone/30'
                  }`}
                >
                  <m.icon className="w-4 h-4" />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {method === 'card' && (
              <>
                {/* Simulated Card Preview */}
                <div className="relative h-40 w-full rounded-none bg-editorial-stone p-4 text-editorial-charcoal flex flex-col justify-between shadow-sm mb-6 border border-editorial-charcoal">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-[10px] tracking-widest text-editorial-charcoal/70">CHAYKA GOLD</span>
                    <ShieldCheck className="w-4 h-4 text-editorial-charcoal" />
                  </div>
                  <div>
                    <div className="text-base font-mono tracking-widest text-editorial-charcoal font-semibold min-h-[1.5rem]">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between items-end mt-3">
                      <div>
                        <span className="text-[8px] text-editorial-charcoal/60 block uppercase font-bold">
                          {language === 'es' ? 'Titular' : 'Holder'}
                        </span>
                        <span className="text-xs font-bold tracking-wide uppercase truncate max-w-[150px] block min-h-[1rem] font-serif italic">
                          {cardName || (language === 'es' ? 'Nombre completo' : 'Full Name')}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <span className="text-[8px] text-editorial-charcoal/60 block uppercase font-bold">
                            {language === 'es' ? 'Vence' : 'Exp'}
                          </span>
                          <span className="text-xs font-mono font-bold min-h-[1rem] block">{expiry || 'MM/AA'}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-editorial-charcoal/60 block uppercase font-bold">CVV</span>
                          <span className="text-xs font-mono font-bold min-h-[1rem] block">{cvv ? '•••' : '000'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-editorial-charcoal/60 mb-1 uppercase tracking-wider">
                      {language === 'es' ? 'Nombre en la Tarjeta' : 'Name on Card'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'es' ? 'Ej. María Chango' : 'e.g. Mary Doe'}
                      value={cardName}
                      onChange={(e) => {
                        setCardName(e.target.value);
                        if (errors.cardName) setErrors((prev) => ({ ...prev, cardName: undefined }));
                      }}
                      className={`w-full bg-editorial-stone/25 border ${
                        errors.cardName ? 'border-rose-500' : 'border-editorial-charcoal/20'
                      } rounded-none py-2 px-3 text-xs text-editorial-charcoal placeholder-editorial-charcoal/40 focus:outline-none focus:border-editorial-charcoal transition-colors font-sans`}
                      id="pay-card-name"
                    />
                    {errors.cardName && (
                      <p className="text-rose-650 text-[10px] mt-1 font-semibold">{errors.cardName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-editorial-charcoal/60 mb-1 uppercase tracking-wider">
                      {t('payment.cardNumber', language)}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className={`w-full bg-editorial-stone/25 border ${
                        errors.cardNumber ? 'border-rose-500' : 'border-editorial-charcoal/20'
                      } rounded-none py-2 px-3 text-xs text-editorial-charcoal placeholder-editorial-charcoal/40 focus:outline-none focus:border-editorial-charcoal font-mono transition-colors`}
                      id="pay-card-number"
                    />
                    {errors.cardNumber && (
                      <p className="text-rose-650 text-[10px] mt-1 font-semibold">{errors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-editorial-charcoal/60 mb-1 uppercase tracking-wider">
                        {t('payment.expiry', language)}
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="MM/AA"
                        value={expiry}
                        onChange={handleExpiryChange}
                        className={`w-full bg-editorial-stone/25 border ${
                          errors.expiry ? 'border-rose-500' : 'border-editorial-charcoal/20'
                        } rounded-none py-2 px-3 text-xs text-editorial-charcoal placeholder-editorial-charcoal/40 focus:outline-none focus:border-editorial-charcoal font-mono transition-colors`}
                        id="pay-card-expiry"
                      />
                      {errors.expiry && (
                        <p className="text-rose-650 text-[10px] mt-1 font-semibold">{errors.expiry}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-editorial-charcoal/60 mb-1 uppercase tracking-wider">
                        {t('payment.cvv', language)}
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="123"
                        value={cvv}
                        onChange={handleCvvChange}
                        className={`w-full bg-editorial-stone/25 border ${
                          errors.cvv ? 'border-rose-500' : 'border-editorial-charcoal/20'
                        } rounded-none py-2 px-3 text-xs text-editorial-charcoal placeholder-editorial-charcoal/40 focus:outline-none focus:border-editorial-charcoal font-mono transition-colors`}
                        id="pay-card-cvv"
                      />
                      {errors.cvv && (
                        <p className="text-rose-650 text-[10px] mt-1 font-semibold">{errors.cvv}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-[9px] text-editorial-charcoal/70 bg-editorial-stone/30 p-2.5 border border-editorial-charcoal/10 uppercase font-bold tracking-wider font-mono">
                    <ShieldCheck className="w-4 h-4 text-emerald-800 flex-shrink-0" />
                    <span>
                      {language === 'es' ? 'Simulado. No se debitarán fondos reales.' : 'Simulated. No real funds will be debited.'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      type="button"
                      disabled={isPaying}
                      onClick={() => handleSimulatePayment('success')}
                      className="bg-emerald-800 text-editorial-bg hover:bg-emerald-700 disabled:opacity-50 font-bold py-3 px-2 rounded-none flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase tracking-widest text-[10px] border border-emerald-800"
                      id="payment-success-btn"
                    >
                      {isPaying ? (
                        <span className="animate-pulse">{language === 'es' ? 'Procesando...' : 'Processing...'}</span>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('payment.payButton', language)}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isPaying}
                      onClick={() => handleSimulatePayment('failed')}
                      className="bg-rose-800 text-editorial-bg hover:bg-rose-700 disabled:opacity-50 font-bold py-3 px-2 rounded-none flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase tracking-widest text-[10px] border border-rose-800"
                      id="payment-fail-btn"
                    >
                      {isPaying ? (
                        <span className="animate-pulse">{language === 'es' ? 'Procesando...' : 'Processing...'}</span>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5" />
                          <span>{t('payment.failButton', language)}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full mt-2 bg-transparent text-editorial-charcoal/70 hover:text-editorial-charcoal hover:bg-editorial-stone/30 font-bold py-2 rounded-none flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-widest text-[10px]"
                    id="payment-cancel-btn"
                  >
                    <span>{t('payment.cancel', language)}</span>
                  </button>
                </div>
              </>
            )}

            {method === 'transfer' && (
              <div className="space-y-4">
                <div className="bg-editorial-stone/25 p-4 border border-editorial-charcoal/10 text-xs text-editorial-charcoal/80 space-y-2">
                  <span className="font-bold text-editorial-charcoal uppercase text-[10px] tracking-wider block border-b border-editorial-charcoal/10 pb-1.5">
                    {language === 'es' ? 'Detalles de Cuenta Bancaria' : 'Bank Account Details'}
                  </span>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span>{language === 'es' ? 'Banco:' : 'Bank:'}</span>
                      <strong className="text-editorial-charcoal">Banco Pichincha</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'es' ? 'Tipo de Cuenta:' : 'Account Type:'}</span>
                      <strong className="text-editorial-charcoal">{language === 'es' ? 'Ahorros' : 'Savings'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'es' ? 'Número de Cuenta:' : 'Account Number:'}</span>
                      <strong className="text-editorial-charcoal">2201928471</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'es' ? 'Titular:' : 'Beneficiary:'}</span>
                      <strong className="text-editorial-charcoal">Chayka Coffee S.A.S.</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>RUC / C.I.:</span>
                      <strong className="text-editorial-charcoal">1003948576001</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-editorial-charcoal/60 mb-1 uppercase tracking-wider">
                    {language === 'es' ? 'Número de Comprobante / Referencia' : 'Transaction / Reference Number'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'es' ? 'Ej. 192847' : 'e.g. 192847'}
                    value={transferRef}
                    onChange={(e) => {
                      setTransferRef(e.target.value);
                      if (transferError) setTransferError('');
                    }}
                    className={`w-full bg-editorial-stone/25 border ${
                      transferError ? 'border-rose-500' : 'border-editorial-charcoal/20'
                    } rounded-none py-2.5 px-3 text-xs text-editorial-charcoal placeholder-editorial-charcoal/40 focus:outline-none focus:border-editorial-charcoal font-sans`}
                    id="pay-transfer-ref"
                  />
                  {transferError && (
                    <p className="text-rose-650 text-[10px] mt-1 font-semibold">{transferError}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 text-[9px] text-editorial-charcoal/70 bg-editorial-stone/30 p-2.5 border border-editorial-charcoal/10 uppercase font-bold tracking-wider font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-800 flex-shrink-0" />
                  <span>
                    {language === 'es' ? 'Por favor realiza la transferencia antes de confirmar.' : 'Please make the transfer before confirming.'}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isPaying}
                  onClick={handleSimulateTransferPayment}
                  className="w-full bg-emerald-800 text-editorial-bg hover:bg-emerald-700 disabled:opacity-50 font-bold py-3.5 px-2 rounded-none flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase tracking-widest text-[10px] border border-emerald-800"
                  id="payment-confirm-transfer-btn"
                >
                  {isPaying ? (
                    <span className="animate-pulse">{language === 'es' ? 'Procesando...' : 'Processing...'}</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'es' ? 'Confirmar Transferencia' : 'Confirm Transfer'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-transparent text-editorial-charcoal/70 hover:text-editorial-charcoal hover:bg-editorial-stone/30 font-bold py-2 rounded-none flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-widest text-[10px]"
                >
                  <span>{t('payment.cancel', language)}</span>
                </button>
              </div>
            )}

            {method === 'cash' && (
              <div className="space-y-4">
                <div className="bg-editorial-stone/25 p-4 border border-editorial-charcoal/10 text-xs text-editorial-charcoal/80 space-y-2 leading-relaxed">
                  <span className="font-bold text-editorial-charcoal uppercase text-[10px] tracking-wider block border-b border-editorial-charcoal/10 pb-1.5">
                    {language === 'es' ? 'Pago en Efectivo en Local' : 'Cash Payment at Store'}
                  </span>
                  <p>
                    {language === 'es'
                      ? 'Confirmá tu reservación y aboná tu consumo directamente en efectivo cuando llegues a Chayka Coffee.'
                      : 'Confirm your booking and pay your consumption directly in cash when you arrive at Chayka Coffee.'}
                  </p>
                  <p className="text-[11px] text-editorial-charcoal/60">
                    {language === 'es'
                      ? 'Te enviaremos los detalles de tu mesa por WhatsApp para asegurar tu ingreso.'
                      : 'We will send you your table details via WhatsApp to secure your entry.'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isPaying}
                  onClick={handleSimulateCashPayment}
                  className="w-full bg-emerald-800 text-editorial-bg hover:bg-emerald-700 disabled:opacity-50 font-bold py-3.5 px-2 rounded-none flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase tracking-widest text-[10px] border border-emerald-800"
                  id="payment-confirm-cash-btn"
                >
                  {isPaying ? (
                    <span className="animate-pulse">{language === 'es' ? 'Confirmando...' : 'Confirming...'}</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'es' ? 'Confirmar Reserva en Efectivo' : 'Confirm Reservation in Cash'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-transparent text-editorial-charcoal/70 hover:text-editorial-charcoal hover:bg-editorial-stone/30 font-bold py-2 rounded-none flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-widest text-[10px]"
                >
                  <span>{t('payment.cancel', language)}</span>
                </button>
              </div>
            )}
          </motion.div>
        ) : status === 'success' ? (
          <motion.div
            key="payment-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm text-center bg-editorial-bg border border-editorial-charcoal rounded-none shadow-xl p-8 flex flex-col items-center justify-center"
            id="payment-success-card"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.4 }}
              className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-none flex items-center justify-center mb-4 text-emerald-800"
            >
              <Check className="w-8 h-8" />
            </motion.div>

            <h3 className="text-lg font-serif font-bold text-editorial-charcoal flex items-center gap-1.5 justify-center">
              <span>{t('payment.successTitle', language)}</span>
              <Sparkles className="w-4 h-4 text-editorial-charcoal" />
            </h3>
            <p className="text-editorial-charcoal/80 text-xs mt-2 leading-relaxed">
              {t('payment.successDesc', language)}
            </p>

            <div className="bg-editorial-stone/40 w-full py-2.5 px-4 rounded-none border border-editorial-charcoal/10 mt-5 text-left text-xs font-mono text-editorial-charcoal/80 space-y-1">
              <div className="flex justify-between">
                <span>{language === 'es' ? 'Estado:' : 'Status:'}</span>
                <span className="text-emerald-800 font-bold uppercase">{language === 'es' ? 'APROBADO' : 'APPROVED'}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'es' ? 'Comercio:' : 'Merchant:'}</span>
                <span className="text-editorial-charcoal font-semibold">Chayka Coffee</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'es' ? 'Fecha:' : 'Date:'}</span>
                <span className="text-editorial-charcoal font-semibold">{new Date().toLocaleDateString(language === 'es' ? 'es-EC' : 'en-US')}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'es' ? 'Monto:' : 'Amount:'}</span>
                <span className="text-editorial-charcoal font-bold font-serif font-semibold">${amount.toFixed(2)} USD</span>
              </div>
            </div>

            <p className="text-[10px] text-editorial-charcoal/50 mt-4 uppercase tracking-wider font-mono font-bold">
              {language === 'es' ? 'Imprimiendo comprobante digital...' : 'Printing digital receipt...'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="payment-failed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm text-center bg-editorial-bg border border-rose-800 rounded-none shadow-xl p-8 flex flex-col items-center justify-center"
            id="payment-failed-card"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.4 }}
              className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-none flex items-center justify-center mb-4 text-rose-800"
            >
              <X className="w-8 h-8" />
            </motion.div>

            <h3 className="text-lg font-serif font-bold text-rose-800 flex items-center gap-1.5 justify-center">
              <span>{t('payment.failedTitle', language)}</span>
              <AlertOctagon className="w-4 h-4 text-rose-800" />
            </h3>
            <p className="text-editorial-charcoal/80 text-xs mt-2 leading-relaxed">
              {t('payment.failedDesc', language)}
            </p>

            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="w-full mt-6 bg-editorial-charcoal text-editorial-bg hover:bg-editorial-charcoal/90 font-bold py-3 rounded-none flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-widest text-xs border border-editorial-charcoal"
              id="payment-retry-btn"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{language === 'es' ? 'Intentar Nuevamente' : 'Try Again'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
