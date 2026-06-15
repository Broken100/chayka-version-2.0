/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MenuItem, Category, ReservationTable, Reservation, BusinessConfig } from './types';
import {
  INITIAL_CATEGORIES,
} from './data';
import MenuSection from './components/MenuSection';
import BookingSection from './components/BookingSection';
import AdminPanel from './components/AdminPanel';
import NotificationToast, { NotificationMsg } from './components/NotificationToast';
import { ReservationProvider, useReservation } from './context/ReservationContext';
import { t } from './utils/translations';
import {
  Coffee,
  Calendar,
  Grid,
  MapPin,
  Flame,
  Clock,
  Sparkles,
  Info,
  Phone,
  Heart,
  ChevronRight,
  ShieldCheck,
  Bell,
  Sliders,
  Compass,
  Instagram,
  X,
  Globe
} from 'lucide-react';

import heroCups from './assets/hero_cups.png';
import heroDrinks from './assets/hero_drinks.png';
import heroShop from './assets/hero_shop.jpg';
import experience1 from './assets/cake_01.jpg';
import experience2 from './assets/hero_03.jpg';
import input0 from './assets/input_file_0.png';
import input1 from './assets/input_file_1.png';
import input2 from './assets/input_file_2.png';
import input3 from './assets/input_file_3.png';


function AppContent() {
  const {
    reservations,
    menuProducts,
    tables,
    businessConfig,
    language,
    setLanguage,
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

  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  const heroImages = [heroCups, heroDrinks, heroShop];
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Run dynamic simulated visitor traffic and events to show REAL-TIME functionality!
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
  }, [language]); // trigger again or update if language changes

  const handleReservationComplete = (newReservation: Reservation) => {
    addNotification(
      language === 'es' ? '¡Nueva Cita Registrada! 🎉' : 'New Booking Registered! 🎉',
      language === 'es'
        ? `Felicidades ${newReservation.customerName}. Reservaste en la mesa ID: ${newReservation.tableId}. Completa enviándolo a WhatsApp.`
        : `Congratulations ${newReservation.customerName}. You booked table ID: ${newReservation.tableId}. Complete by sending to WhatsApp.`,
      'success'
    );
  };

  return (
    <div className="min-h-screen bg-coffee-bg text-espresso font-sans selection:bg-espresso selection:text-coffee-bg" id="main-app-container">
      {/* Background Decorative - Clean editorial lines instead of neon glow bubbles */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-espresso/5 pointer-events-none" />

      {/* HEADER SECTION WITH NAVIGATION & LIVE ALERTS */}
      <header className="sticky top-0 z-40 bg-coffee-bg/95 backdrop-blur-md border-b border-espresso/10 transition" id="chayka-main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-3 text-left cursor-pointer group"
            id="brand-logo-btn"
          >
            
            <div className="flex flex-col">
              <div className="w-28 h-28  flex items-center justify-center p-1.5 transition-transform group-hover:scale-105 relative">
              <img
                src="/logo.svg"
                alt="Logo Chayka"
                className="absolute inset-0 w-full h-full object-cover z-10"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0';
                }}
              />
          
            </div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" id="header-desktop-nav">
            {[
              { id: 'home', label: t('nav.home', language), icon: Compass },
              { id: 'menu', label: t('nav.menu', language), icon: Coffee },
              { id: 'booking', label: t('nav.booking', language), icon: Calendar },
              { id: 'admin', label: t('nav.admin', language), icon: Sliders }
            ].map((item) => {
              const IsActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`flex items-center gap-1 py-1.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border-b-2 ${
                    IsActive
                      ? 'border-espresso text-espresso pb-1'
                      : 'border-transparent text-espresso/60 hover:text-espresso hover:border-espresso/20'
                  }`}
                  id={`nav-item-${item.id}`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Real-time notification Bell and Actions center */}
          <div className="flex items-center gap-3">
            
            {/* Language Toggle Button */}
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="w-10 h-10 rounded-none bg-transparent border border-espresso/10 hover:border-espresso hover:bg-espresso/5 text-espresso flex items-center justify-center transition cursor-pointer relative"
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              id="language-toggle-btn"
            >
              <Globe className="w-4 h-4" />
              <span className="absolute bottom-0 right-0 bg-espresso text-coffee-bg text-[8px] px-1 font-bold uppercase">
                {language}
              </span>
            </button>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                className="w-10 h-10 rounded-none bg-transparent border border-espresso/10 hover:border-espresso hover:bg-espresso/5 text-espresso flex items-center justify-center transition cursor-pointer relative"
                id="bell-notification-btn"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-red text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification dropdown sidebar block */}
              {showNotificationCenter && (
                <div className="absolute right-0 mt-3 w-80 bg-coffee-bg border border-espresso/20 rounded-none p-4 shadow-2xl z-50 text-left space-y-3" id="notif-dropdown">
                  <div className="flex justify-between items-center border-b border-espresso/10 pb-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-espresso">
                      {language === 'es' ? 'Notificaciones Live' : 'Live Notifications'}
                    </h4>
                    <button
                      onClick={() => setShowNotificationCenter(false)}
                      className="text-espresso/60 hover:text-espresso text-[10px] font-bold uppercase tracking-wider"
                    >
                      {language === 'es' ? 'Cerrar' : 'Close'}
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 bg-espresso/5 rounded-none border border-espresso/10 flex gap-2 items-start text-xs">
                        <div className="mt-1">
                          {n.type === 'success' ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600 block" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 block" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-espresso uppercase tracking-wider text-[10px]">{n.title}</div>
                          <p className="text-espresso/80 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                          <span className="text-[9px] text-espresso/50 block mt-1.5 font-semibold tracking-wider font-mono">{n.time} HS</span>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="col-span-full py-4 text-center text-xs text-espresso/40 font-serif italic">
                        {language === 'es' ? 'No hay notificaciones.' : 'No notifications.'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Booking direct trigger */}
            <button
              onClick={() => setActiveView('booking')}
              className="bg-espresso hover:bg-espresso/90 text-coffee-bg font-bold px-4 py-2.5 rounded-none text-xs uppercase tracking-widest flex md:hidden items-center gap-1 cursor-pointer transition-all shadow-md"
              id="mobile-quick-book-btn"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t('nav.booking', language)}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden border-t border-espresso/10 bg-coffee-bg" id="header-mobile-tabs">
          {[
            { id: 'home', label: t('nav.home', language), icon: Compass },
            { id: 'menu', label: t('nav.menu', language), icon: Coffee },
            { id: 'booking', label: t('nav.booking', language), icon: Calendar },
            { id: 'admin', label: t('nav.admin', language), icon: Sliders }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`flex-1 py-3.5 text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                activeView === item.id ? 'text-espresso bg-espresso/10 font-black' : 'text-espresso/60'
              }`}
              id={`mobile-tab-${item.id}`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-[9px] uppercase tracking-widest font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* CORE HOME VIEW MODULE */}
      {activeView === 'home' && (
        <main className="space-y-0" id="home-view-module">
          
          {/* HERO BANNER BLOCK WITH IMMERSIVE DESIGN */}
          <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden border-b border-espresso/10" id="peguche-hero">
            {/* Background image covering cloud forests & coffee seeds */}
            <div className="absolute inset-0 z-0">
              {heroImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Chayka Coffee Background ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-[5000ms] ease-out ${
                    index === currentBgIndex ? 'opacity-50 scale-105' : 'opacity-0 scale-100'
                  } filter saturate-75`}
                  referrerPolicy="no-referrer"
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-coffee-bg via-coffee-bg/75 to-transparent" />
            </div>

            <div className="max-w-4xl mx-auto px-4 relative z-10 text-center space-y-8">
              <div className="inline-flex items-center gap-1.5 bg-espresso text-coffee-bg px-4 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-[0.2em] shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-coffee-bg/80 fill-coffee-bg/80" />
                <span>{language === 'es' ? 'Experiencia Nacional Turística Única' : 'Unique National Tourist Experience'}</span>
              </div>

              <h1 className="font-serif text-5xl sm:text-7xl font-bold tracking-tight text-espresso">
                Chayka Coffee
              </h1>

              <p className="text-espresso/80 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed font-sans">
                {language === 'es' ? (
                  <>
                    Ubicada en el sendero mágico a la magnífica <strong className="text-espresso font-black">Cascada de Peguche</strong> en Otavalo. Disfruta comida tradicional y café de especialidad arrullado por el canto eterno del agua.
                  </>
                ) : (
                  <>
                    Located on the magical path to the magnificent <strong className="text-espresso font-black">Peguche Waterfall</strong> in Otavalo. Enjoy traditional food and specialty coffee lulled by the eternal song of the water.
                  </>
                )}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => setActiveView('booking')}
                  className="w-full sm:w-auto bg-espresso text-coffee-bg font-bold px-8 py-4 rounded-none uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-espresso/90 transition-all cursor-pointer shadow-md"
                  id="hero-book-btn"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t('home.ctaBooking', language)}</span>
                </button>

                <button
                  onClick={() => setActiveView('menu')}
                  className="w-full sm:w-auto bg-transparent border border-espresso/25 text-espresso font-bold px-8 py-4 rounded-none uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-espresso/5 transition-all cursor-pointer"
                  id="hero-menu-btn"
                >
                  <Coffee className="w-4 h-4 text-espresso" />
                  <span>{t('home.ctaMenu', language)}</span>
                </button>
              </div>

              {/* Highlights badge bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 text-espresso text-xs">
                <div className="flex flex-col items-center gap-1 bg-espresso/5 p-3 rounded-none border border-espresso/10">
                  <span className="font-serif text-espresso font-black italic text-base">1,800m</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60">
                    {language === 'es' ? 'Granos de Altura' : 'High-Altitude Beans'}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 bg-espresso/5 p-3 rounded-none border border-espresso/10">
                  <span className="font-serif text-espresso font-black italic text-base">Peguche</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60">
                    {language === 'es' ? 'Frente a la Cascada' : 'In Front of Waterfall'}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 bg-espresso/5 p-3 rounded-none border border-espresso/10">
                  <span className="font-serif text-espresso font-black italic text-base">100% Secure</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60">
                    {language === 'es' ? 'Pagos Integrados' : 'Integrated Payments'}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 bg-espresso/5 p-3 rounded-none border border-espresso/10">
                  <span className="font-serif text-espresso font-black italic text-base">WhatsApp</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60">
                    {language === 'es' ? 'Atención en Real-Time' : 'Real-Time Support'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SPLENDID ATTRACTIONS OVERVIEW */}
          <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center border-b border-espresso/10 py-16" id="turismo-highlight">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left text column */}
              <div className="space-y-6 text-left">
                <span className="text-espresso/60 font-bold text-[10px] uppercase tracking-[0.25em] block">
                  {language === 'es' ? 'Ubicación Ancestral' : 'Ancestral Location'}
                </span>
                <h3 className="text-3xl sm:text-5xl font-serif font-bold italic text-espresso leading-tight">
                  {language === 'es' 
                    ? 'Un Santuario Turístico que Debes Visitar en Imbabura' 
                    : 'A Tourist Sanctuary You Must Visit in Imbabura'}
                </h3>
                <p className="text-espresso/80 text-sm leading-relaxed font-sans font-normal">
                  {language === 'es' ? (
                    <>
                      Cascada de Peguche es un sitio ceremonial indígena sagrado donde los locales recargan sus energías espirituales durante el Inti Raymi. <strong className="text-espresso font-black">Chayka Coffee</strong> se integra de forma respetuosa con esta mística geografía, ofreciendo un refugio de diseño rústico-contemporáneo donde podrás sentarte y degustar repostería fina.
                    </>
                  ) : (
                    <>
                      Peguche Waterfall is a sacred indigenous ceremonial site where locals recharge their spiritual energies during Inti Raymi. <strong className="text-espresso font-black">Chayka Coffee</strong> integrates respectfully with this mystical geography, offering a rustic-contemporary design refuge where you can sit and taste fine pastries.
                    </>
                  )}
                </p>

                <div className="space-y-3 text-xs text-espresso/80">
                  <div className="flex gap-2.5 items-start">
                    <MapPin className="w-5 h-5 text-espresso flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-espresso">
                        {language === 'es' ? 'Ubicación Geográfica:' : 'Geographic Location:'}
                      </strong>{' '}
                      {businessConfig.location}
                    </span>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <Clock className="w-5 h-5 text-espresso flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      {businessConfig.schedules.map((sch, i) => (
                        <div key={i}>
                          <strong className="text-espresso">{sch.day}:</strong> {sch.hours}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <Phone className="w-5 h-5 text-espresso flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-espresso font-black">
                        {language === 'es' ? 'Atención Directa WhatsApp:' : 'Direct WhatsApp Support:'}
                      </strong>{' '}
                      {businessConfig.whatsappNumber}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex gap-3.5">
                  <a
                    href={businessConfig.locationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-espresso/5 hover:bg-espresso/10 text-espresso border border-espresso/15 text-[10px] font-bold uppercase tracking-widest px-5 py-3 rounded-none flex items-center gap-1.5 cursor-pointer"
                    id="maps-direction-btn"
                  >
                    <Compass className="w-4 h-4" />
                    <span>{language === 'es' ? 'Lanzar Direcciones GPS' : 'Launch GPS Directions'}</span>
                  </a>

                  <button
                    onClick={() => setActiveView('booking')}
                    className="bg-espresso hover:bg-espresso/90 text-coffee-bg text-[10px] font-bold uppercase tracking-widest px-5 py-3 rounded-none flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>{language === 'es' ? 'Apartar una Mesa' : 'Book a Table'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right visuals column with elegant mock waterfall and coffee setups */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-64 rounded-none overflow-hidden border border-espresso/15">
                    <img
                      src={experience1}
                      alt="Coffee Cup on Wood"
                      className="w-full h-full object-cover filter saturate-50"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="bg-espresso/5 p-5 rounded-none border border-espresso/10 text-left space-y-1.5">
                    <span className="text-espresso font-bold block text-[10px] uppercase tracking-widest opacity-70">
                      {language === 'es' ? 'Firma Chayka' : 'Chayka Signature'}
                    </span>
                    <p className="text-espresso/80 text-xs leading-relaxed font-normal">
                      {language === 'es'
                        ? 'Sabores andinos como humitas de choclo fresco maridando espressos aterciopelados.'
                        : 'Andean flavors like fresh corn humitas pairing with velvety espressos.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <div className="bg-espresso/10 border border-espresso/10 p-5 rounded-none text-left space-y-1.5">
                    <span className="text-espresso font-black block text-[10px] uppercase tracking-widest">9.8 • Rating</span>
                    <p className="text-espresso/80 text-xs leading-relaxed">
                      {language === 'es'
                        ? 'Evaluación estelar por visitantes internacionales en el sendero de Peguche.'
                        : 'Stellar ratings by international visitors on the Peguche trail.'}
                    </p>
                  </div>
                  <div className="h-64 rounded-none overflow-hidden border border-espresso/15">
                    <img
                      src={experience2}
                      alt="Waterfall vegetation"
                      className="w-full h-full object-cover opacity-80 filter saturate-50"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

          {/* MAIN TRADITIONS CALLOUT BANNER - Charcoal / Editorial split look */}
          <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-espresso text-coffee-bg py-16 w-full border-b border-espresso/10" id="traditions-callout">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <span className="text-coffee-bg/60 font-bold tracking-[0.25em] text-[10px] uppercase flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-coffee-bg/80" />{' '}
                    {language === 'es' ? 'Tradición Ecuatoriana Re-Imaginada' : 'Ecuadorian Tradition Re-Imagined'}
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-serif italic tracking-tight text-coffee-bg">
                    {language === 'es' ? '¿Vienes a Otavalo por Turismo?' : 'Coming to Otavalo for Tourism?'}
                  </h3>
                  <p className="text-coffee-bg/80 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
                    {language === 'es' ? (
                      <>
                        Nuestra carta une lo mejor de los granos de especialidad (Chemex, V60 de Intag) con la repostería artesanal andina. Te aseguramos una experiencia inolvidable. Al reservar con antelación, tu mesa estará lista con tus elecciones favoritas para que recorras los senderos de agua silvestre sin demoras.
                      </>
                    ) : (
                      <>
                        Our menu brings together the best of specialty beans (Chemex, Intag V60) with artisan Andean pastries. We assure you an unforgettable experience. By booking in advance, your table will be ready with your favorite selections so you can walk the wild water paths without delays.
                      </>
                    )}
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setActiveView('menu');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-coffee-bg text-espresso hover:bg-coffee-bg/90 hover:text-espresso border border-transparent px-6 py-3.5 rounded-none text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md"
                    >
                      {language === 'es' ? 'Explorar la Carta Digital' : 'Explore the Digital Menu'}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center md:items-end text-center md:text-right space-y-1">
                  <span className="font-serif text-6xl sm:text-8xl md:text-9xl font-bold italic tracking-tight text-coffee-bg select-none">
                    Chayka
                  </span>
                  <span className="font-sans text-xs sm:text-sm md:text-base tracking-[0.4em] uppercase font-bold text-coffee-bg/60 select-none">
                    Coffee
                  </span>
                </div>
              </div>
            </div>
        </section>

          {/* GALERÍA DE LA EXPERIENCIA CHAYKA */}
          <section className="min-h-[calc(100vh-5rem)] flex flex-col justify-center items-center py-16 animate-fadeIn w-full border-b border-espresso/10" id="chayka-gallery">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
              <div className="text-center space-y-2">
              <span className="text-espresso/60 font-bold text-[10px] uppercase tracking-[0.25em] block">
                {language === 'es' ? 'Inspiración de Finca y Cascada' : 'Estate and Waterfall Inspiration'}
              </span>
              <h3 className="text-3xl sm:text-4xl font-serif font-bold italic text-espresso">
                {language === 'es' ? 'Galería de Coexistencia' : 'Coexistence Gallery'}
              </h3>
              <p className="text-espresso/80 text-xs max-w-xl mx-auto">
                {language === 'es' 
                  ? 'Explora las especialidades de la barra y momentos capturados en vivo por visitantes de todo el mundo en nuestro espectacular rincón andino.'
                  : 'Explore the specialty bar offerings and live moments captured by visitors from all around the world in our spectacular Andean corner.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: language === 'es' ? 'Granos de Especialidad' : 'Specialty Beans',
                  desc: language === 'es' 
                    ? 'Selección rigurosa de granos de altura, tostados a la perfección para resaltar notas únicas.'
                    : 'Rigorous selection of high-altitude beans, roasted to perfection to highlight unique notes.',
                  img: heroCups,
                  fallback: "https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?auto=format&fit=crop&q=80&w=400"
                },
                {
                  title: language === 'es' ? 'Bebidas de la Casa' : 'Signature Drinks',
                  desc: language === 'es'
                    ? 'Refrescantes cócteles y cafés helados preparados al instante con insumos locales.'
                    : 'Refreshing house cocktails and iced coffees prepared instantly with local ingredients.',
                  img: heroDrinks,
                  fallback: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400"
                },
                {
                  title: language === 'es' ? 'Refugio en la Cascada' : 'Waterfall Refuge',
                  desc: language === 'es' 
                    ? 'Nuestra acogedora cafetería de diseño rústico-contemporáneo en el sendero mágico de Peguche.'
                    : 'Our cozy cafe with rustic-contemporary design on the magical path of Peguche.',
                  img: heroShop,
                  fallback: "https://images.unsplash.com/photo-1594911774802-8822a707caff?auto=format&fit=crop&q=80&w=400"
                }
              ].map((item, idx) => (
                <div key={idx} className="group flex flex-col bg-espresso/5 border border-espresso/15 rounded-none overflow-hidden transition-all hover:border-espresso/50 text-left shadow-sm">
                  <div className="relative h-60 overflow-hidden bg-espresso/10 border-b border-espresso/10">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 filter saturate-50"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = item.fallback;
                      }}
                    />
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="font-serif font-black text-sm text-espresso uppercase tracking-tight">{item.title}</h4>
                    <p className="text-[11px] text-espresso/80 leading-relaxed font-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        </main>
      )}

      {/* CORE MENU VIEW MODULE */}
      {activeView === 'menu' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="menu-view-module">
          <MenuSection
            categories={INITIAL_CATEGORIES}
            products={menuProducts}
            interactiveMode={false} // Independent viewing mode
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

      {/* FOOTER */}
      <footer className="border-t border-espresso/15 bg-espresso/5 py-12 text-espresso text-xs text-left" id="chayka-main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-3">
            <h4 className="text-espresso font-serif font-black uppercase tracking-wider text-xs">Chayka Coffee Peguche</h4>
            <p className="text-espresso/80 leading-relaxed font-normal">
              {language === 'es'
                ? 'Fusión andina de naturaleza, café de finca y recetas ceremoniales del norte ecuatoriano. Otavalo, Imbabura.'
                : 'Andean fusion of nature, estate coffee, and ceremonial recipes from northern Ecuador. Otavalo, Imbabura.'}
            </p>
            <div className="flex gap-2">
              <a href="#" className="p-2 bg-espresso/5 hover:bg-espresso hover:text-coffee-bg border border-espresso/10 text-espresso transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-espresso font-serif font-black uppercase tracking-wider text-xs">
              {language === 'es' ? 'Enlaces Rápidos' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-espresso/80 font-medium">
              <li>
                <button onClick={() => setActiveView('home')} className="hover:underline cursor-pointer">
                  {t('nav.home', language)}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('menu')} className="hover:underline cursor-pointer">
                  {language === 'es' ? 'Menú Interactivo' : 'Interactive Menu'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('booking')} className="hover:underline cursor-pointer">
                  {language === 'es' ? 'Apartar Cita' : 'Book Table'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('admin')} className="hover:underline cursor-pointer">
                  {t('nav.admin', language)}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-espresso font-serif font-black uppercase tracking-wider text-xs">
              {language === 'es' ? 'Contáctanos' : 'Contact Us'}
            </h4>
            <p className="text-espresso/80">
              {language === 'es'
                ? 'Sintonía directa para eventos especiales, catas rituales de café andino o visitas de grandes grupos turísticos.'
                : 'Direct line for special events, ritual tastings of Andean coffee, or large tour group visits.'}
            </p>
            <div className="font-bold text-espresso text-xs tracking-wider uppercase">
              WhatsApp: {businessConfig.whatsappNumber}
            </div>
          </div>

        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-espresso/10 mt-8 pt-8 flex flex-col sm:flex-row justify-between text-[10px] font-semibold tracking-wider uppercase opacity-60">
          <span>
            {language === 'es' 
              ? `© ${new Date().getFullYear()} Chayka Coffee. Reservas simuladas para demostración turística.`
              : `© ${new Date().getFullYear()} Chayka Coffee. Mock bookings for tourism demonstration.`}
          </span>
          <span>
            {language === 'es'
              ? 'Hecho con diseño andino en Otavalo, Ecuador'
              : 'Made with Andean design in Otavalo, Ecuador'}
          </span>
        </div>
      </footer>

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
