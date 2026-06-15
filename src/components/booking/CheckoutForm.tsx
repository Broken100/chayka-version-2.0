/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useReservation } from '../../context/ReservationContext';
import { t } from '../../utils/translations';
import { Users } from 'lucide-react';

interface CheckoutFormProps {
  customerName: string;
  setCustomerName: (val: string) => void;
  customerPhone: string;
  setCustomerPhone: (val: string) => void;
  customerEmail: string;
  setCustomerEmail: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  onSubmit: () => void;
}

export default function CheckoutForm({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  notes,
  setNotes,
  onSubmit
}: CheckoutFormProps) {
  const { language } = useReservation();
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    
    // Name validation
    if (!customerName.trim()) {
      newErrors.name = t('booking.form.validation.nameRequired', language);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail.trim()) {
      newErrors.email = t('booking.form.validation.emailRequired', language);
    } else if (!emailRegex.test(customerEmail.trim())) {
      newErrors.email = t('booking.form.validation.emailInvalid', language);
    }

    // Phone validation
    const cleanPhone = customerPhone.replace(/[\s\-()]/g, '');
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (!customerPhone.trim()) {
      newErrors.phone = t('booking.form.validation.phoneRequired', language);
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = t('booking.form.validation.phoneInvalid', language);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit();
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="bg-editorial-bg border border-editorial-charcoal/15 p-5 rounded-none space-y-4"
      id="booking-checkout-form"
    >
      <h4 className="text-[10px] font-bold text-editorial-charcoal/70 uppercase tracking-widest flex items-center gap-1.5 border-b border-editorial-charcoal/10 pb-2">
        <Users className="w-4 h-4 text-editorial-charcoal" />
        <span>
          {language === 'es' ? 'Datos de Contacto para Reservación' : 'Booking Contact Information'}
        </span>
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] text-editorial-charcoal/60 mb-1 font-bold uppercase tracking-wider">
            {t('booking.form.name', language)}
          </label>
          <input
            type="text"
            required
            placeholder={t('booking.form.namePlaceholder', language)}
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            className={`w-full bg-editorial-stone/20 border ${
              errors.name ? 'border-rose-500' : 'border-editorial-charcoal/20'
            } rounded-none text-xs py-2.5 px-3 text-editorial-charcoal focus:outline-none focus:border-editorial-charcoal font-sans`}
            id="booking-cust-name"
          />
          {errors.name && (
            <p className="text-rose-600 text-[10px] mt-1 font-semibold">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-[10px] text-editorial-charcoal/60 mb-1 font-bold uppercase tracking-wider">
            {t('booking.form.phone', language)}
          </label>
          <input
            type="tel"
            required
            placeholder={t('booking.form.phonePlaceholder', language)}
            value={customerPhone}
            onChange={(e) => {
              setCustomerPhone(e.target.value);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            className={`w-full bg-editorial-stone/20 border ${
              errors.phone ? 'border-rose-500' : 'border-editorial-charcoal/20'
            } rounded-none text-xs py-2.5 px-3 text-editorial-charcoal focus:outline-none focus:border-editorial-charcoal font-sans font-mono`}
            id="booking-cust-phone"
          />
          {errors.phone && (
            <p className="text-rose-600 text-[10px] mt-1 font-semibold">{errors.phone}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-[10px] text-editorial-charcoal/60 mb-1 font-bold uppercase tracking-wider">
          {t('booking.form.email', language)}
        </label>
        <input
          type="email"
          required
          placeholder={t('booking.form.emailPlaceholder', language)}
          value={customerEmail}
          onChange={(e) => {
            setCustomerEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          className={`w-full bg-editorial-stone/20 border ${
            errors.email ? 'border-rose-500' : 'border-editorial-charcoal/20'
          } rounded-none text-xs py-2.5 px-3 text-editorial-charcoal focus:outline-none focus:border-editorial-charcoal font-sans`}
          id="booking-cust-email"
        />
        {errors.email && (
          <p className="text-rose-600 text-[10px] mt-1 font-semibold">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-[10px] text-editorial-charcoal/60 mb-1 font-bold uppercase tracking-wider">
          {t('booking.form.notes', language)}
        </label>
        <textarea
          placeholder={t('booking.form.notesPlaceholder', language)}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full bg-editorial-stone/20 border border-editorial-charcoal/20 rounded-none text-xs py-2 px-3 text-editorial-charcoal focus:outline-none focus:border-editorial-charcoal resize-none font-sans"
          id="booking-cust-notes"
        />
      </div>

      {/* Hidden submit button triggered by sidebar parent component */}
      <button type="submit" className="hidden" id="booking-form-submit-hidden" />
    </form>
  );
}
