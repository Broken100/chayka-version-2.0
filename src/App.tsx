/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { MenuItem, Category, ReservationTable, Reservation, BusinessConfig } from './types';
import { INITIAL_CATEGORIES } from './data';
import MenuSection from './components/MenuSection';
import BookingSection from './components/BookingSection';
import AdminPanel from './components/AdminPanel';
import NotificationToast, { NotificationMsg } from './components/NotificationToast';
import { ReservationProvider, useReservation } from './context/ReservationContext';
import { t } from './utils/translations';

import AppHeader from './components/layout/AppHeader';
import AppFooter from './components/layout/AppFooter';
import HeroBanner from './components/home/HeroBanner';
import AttractionsSection from './components/home/AttractionsSection';
import TraditionsBanner from './components/home/TraditionsBanner';
import GallerySection from './components/home/GallerySection';

function AppContent() {
  const {
    reservations,
    menuProducts,
    tables,
    businessConfig,
    language,
    activeView,
    setActiveView,
    addReservation,
    updateReservationStatus,
    updateMenuProduct,
    notifications,
    addNotification,
    dismissNotification,
    setReservations,
    setMenuProducts,
    setTables,
    setBusinessConfig
  } = useReservation();

  useEffect(() => {
    // Initial greeting notification
    const welcomeTimer = setTimeout(() => {
      addNotification(
        language === 'es' ? 'Mensaje de Bienvenida ☕' : 'Welcome Message ☕',
        t('toasts.welcome', language),
        'info'
      );
    }, 1500);

    // Random simulated reservation activity notification after 15 seconds
    const activityTimer = setTimeout(() => {
      const table = language === 'es' ? 'Sofá Chimenea Acogedor 1' : 'Cozy Fireplace Sofa 1';
      const time = '15:30';
      const msg = t('toasts.trafficSim', language)
        .replace('{table}', table)
        .replace('{time}', time);
      addNotification(
        language === 'es' ? 'Reserva en Tiempo Real 🪵' : 'Real-time Booking 🪵',
        msg,
        'success'
      );
    }, 18000);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(activityTimer);
    };
  }, [language, addNotification]);

  const handleReservationComplete = (newReservation: Reservation) => {
    addNotification(
      language === 'es' ? '¡Nueva Cita Registrada! 🎉' : 'New Booking Registered! 🎉',
      language === 'es'
        ? `Felicidades ${newReservation.customerName}. Reservaste en la mesa ID: ${newReservation.tableId}. Completa enviándolo a WhatsApp.`
        : `Congratulations ${newReservation.customerName}. You booked table ID: ${newReservation.tableId}. Complete by sending it to WhatsApp.`,
      'success'
    );
  };

  return (
    <div className="min-h-screen bg-coffee-bg text-espresso font-sans selection:bg-espresso selection:text-coffee-bg" id="main-app-container">
      {/* Background Decorative - Clean editorial lines instead of neon glow bubbles */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-espresso/5 pointer-events-none" />

      <AppHeader activeView={activeView} setActiveView={setActiveView} />

      {/* CORE HOME VIEW MODULE */}
      {activeView === 'home' && (
        <main className="space-y-0" id="home-view-module">
          <HeroBanner setActiveView={setActiveView} />
          <AttractionsSection businessConfig={businessConfig} setActiveView={setActiveView} />
          <TraditionsBanner setActiveView={setActiveView} />
          <GallerySection />
        </main>
      )}

      {/* CORE MENU VIEW MODULE */}
      {activeView === 'menu' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="menu-view-module">
          <MenuSection
            categories={INITIAL_CATEGORIES}
            products={menuProducts}
            interactiveMode={false}
          />
        </main>
      )}

      {/* CORE BOOKING VIEW MODULE */}
      {activeView === 'booking' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn" id="booking-view-module">
          <div>
            <span className="text-espresso/60 font-semibold text-xs uppercase tracking-[0.25em] block text-center">
              {language === 'es' ? 'Garantía de Atención Rápida' : 'Guarantee of Quick Support'}
            </span>
            <h2 className="text-3xl font-bold font-serif italic text-espresso text-center mt-1">
              {language === 'es' ? 'Reserva de Mesa Integrada' : 'Integrated Table Reservation'}
            </h2>
            <p className="text-espresso/80 text-xs text-center max-w-md mx-auto mt-1">
              {language === 'es'
                ? 'Selecciona tu mesa para visitas turísticas, reuniones familiares o veladas románticas.'
                : 'Select your table for sightseeing, family meetings, or romantic evenings.'}
            </p>
          </div>

          <BookingSection
            businessConfig={businessConfig}
            tables={tables}
            menuProducts={menuProducts}
            onReservationComplete={handleReservationComplete}
            existingReservations={reservations}
          />
        </main>
      )}

      {/* CORE ADMINISTRATIVE PORTAL VIEW MODULE */}
      {activeView === 'admin' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="admin-view-module">
          <AdminPanel
            businessConfig={businessConfig}
            setBusinessConfig={setBusinessConfig}
            tables={tables}
            setTables={setTables}
            menuProducts={menuProducts}
            setMenuProducts={setMenuProducts}
            categories={INITIAL_CATEGORIES}
            reservations={reservations}
            setReservations={setReservations}
          />
        </main>
      )}

      <AppFooter businessConfig={businessConfig} setActiveView={setActiveView} />

      {/* Notification Toast Component */}
      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}

export default function App() {
  return (
    <ReservationProvider>
      <AppContent />
    </ReservationProvider>
  );
}
