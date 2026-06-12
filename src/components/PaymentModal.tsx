// PaymentModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Check, ShieldCheck, X, Sparkles } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reference: string) => void;
  amount: number;
  description: string;
}

export default function PaymentModal({ isOpen, onClose, onSuccess, amount, description }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

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
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length >= 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardName || !expiry || !cvv) return;

    setIsPaying(true);
    // Simulate high class payment loading
    setTimeout(() => {
      setIsPaying(false);
      setStatus('success');
      setTimeout(() => {
        const mockRef = 'PAY-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        onSuccess(mockRef);
        // Reset state
        setStatus('idle');
        setCardNumber('');
        setCardName('');
        setExpiry('');
        setCvv('');
      }, 1000);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-editorial-charcoal/45 backdrop-blur-sm" id="payment-modal-overlay">
      <AnimatePresence mode="wait">
        {status === 'idle' ? (
          <motion.div
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
                <h3 className="text-base font-serif font-bold text-editorial-charcoal leading-none">Pasarela de Pago Integrada</h3>
                <p className="text-[10px] text-editorial-charcoal/60 font-medium uppercase tracking-[0.1em] mt-1.5">Transacción para Chayka Coffee</p>
              </div>
            </div>

            <div className="bg-editorial-stone/30 p-4 rounded-none border border-editorial-charcoal/15 mb-6">
              <span className="text-[9px] text-editorial-charcoal/50 uppercase font-bold tracking-wider block">Concepto de Reserva</span>
              <p className="text-xs font-semibold text-editorial-charcoal truncate mt-0.5 font-serif italic">{description}</p>
              <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-editorial-charcoal/10">
                <span className="text-[10px] uppercase tracking-wider font-bold text-editorial-charcoal/60">Total a Pagar:</span>
                <span className="text-xl font-bold font-serif italic text-editorial-charcoal">${amount.toFixed(2)} USD</span>
              </div>
            </div>

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
                    <span className="text-[8px] text-editorial-charcoal/60 block uppercase font-bold">Titular</span>
                    <span className="text-xs font-bold tracking-wide uppercase truncate max-w-[150px] block min-h-[1rem] font-serif italic">
                      {cardName || 'Nombre completo'}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <span className="text-[8px] text-editorial-charcoal/60 block uppercase font-bold">Vence</span>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-editorial-charcoal/60 mb-1 uppercase tracking-wider">Nombre en la Tarjeta</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. María Chango"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-editorial-stone/25 border border-editorial-charcoal/20 rounded-none py-2 px-3 text-xs text-editorial-charcoal placeholder-editorial-charcoal/40 focus:outline-none focus:border-editorial-charcoal transition-colors font-sans"
                  id="pay-card-name"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-editorial-charcoal/60 mb-1 uppercase tracking-wider">Número de Tarjeta</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  placeholder="4000 1234 5678 9010"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="w-full bg-editorial-stone/25 border border-editorial-charcoal/20 rounded-none py-2 px-3 text-xs text-editorial-charcoal placeholder-editorial-charcoal/40 focus:outline-none focus:border-editorial-charcoal font-mono transition-colors"
                  id="pay-card-number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-editorial-charcoal/60 mb-1 uppercase tracking-wider">Vencimiento</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/AA"
                    value={expiry}
                    onChange={handleExpiryChange}
                    className="w-full bg-editorial-stone/25 border border-editorial-charcoal/20 rounded-none py-2 px-3 text-xs text-editorial-charcoal placeholder-editorial-charcoal/40 focus:outline-none focus:border-editorial-charcoal font-mono transition-colors"
                    id="pay-card-expiry"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-editorial-charcoal/60 mb-1 uppercase tracking-wider">CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/gi, ''))}
                    className="w-full bg-editorial-stone/25 border border-editorial-charcoal/20 rounded-none py-2 px-3 text-xs text-editorial-charcoal placeholder-editorial-charcoal/40 focus:outline-none focus:border-editorial-charcoal font-mono transition-colors"
                    id="pay-card-cvv"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 text-[9px] text-editorial-charcoal/70 bg-editorial-stone/30 p-2.5 border border-editorial-charcoal/10 uppercase font-bold tracking-wider font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-850 flex-shrink-0" />
                <span>Simulado. No se debitarán fondos reales.</span>
              </div>

              <button
                type="submit"
                disabled={isPaying}
                className="w-full mt-2 bg-editorial-charcoal text-editorial-bg hover:bg-editorial-charcoal/90 disabled:bg-editorial-stone/60 disabled:text-editorial-charcoal/30 font-bold py-3 rounded-none flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-widest text-xs border border-editorial-charcoal"
                id="payment-submit-btn"
              >
                {isPaying ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-editorial-bg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Procesando pago...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirmar y Pagar ${amount.toFixed(2)}</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
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
              <span>¡Pago Exitoso!</span>
              <Sparkles className="w-4 h-4 text-editorial-charcoal" />
            </h3>
            <p className="text-editorial-charcoal/80 text-xs mt-2 leading-relaxed">
              Se ha acreditado con éxito el consumo mínimo de tu mesa de manera segura.
            </p>

            <div className="bg-editorial-stone/40 w-full py-2.5 px-4 rounded-none border border-editorial-charcoal/10 mt-5 text-left text-xs font-mono text-editorial-charcoal/80 space-y-1">
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className="text-emerald-800 font-bold uppercase">PAGADO</span>
              </div>
              <div className="flex justify-between">
                <span>Comercio:</span>
                <span className="text-editorial-charcoal font-semibold">Chayka Coffee</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha:</span>
                <span className="text-editorial-charcoal font-semibold">{new Date().toLocaleDateString('es-EC')}</span>
              </div>
              <div className="flex justify-between">
                <span>Monto:</span>
                <span className="text-editorial-charcoal font-bold font-serif font-semibold">${amount.toFixed(2)} USD</span>
              </div>
            </div>

            <p className="text-[10px] text-editorial-charcoal/50 mt-4 uppercase tracking-wider font-mono font-bold">
              Imprimiendo comprobante digital...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
