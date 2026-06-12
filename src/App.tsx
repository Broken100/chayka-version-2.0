/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MenuItem, Category, ReservationTable, Reservation, BusinessConfig } from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_TABLES,
  DEFAULT_BUSINESS_CONFIG
} from './data';
import MenuSection from './components/MenuSection';
import BookingSection from './components/BookingSection';
import AdminPanel from './components/AdminPanel';
import NotificationToast, { NotificationMsg } from './components/NotificationToast';
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
  X
} from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<'home' | 'menu' | 'booking' | 'admin'>('home');

  // Core business states (synchronized to localStorage)
  const [menuProducts, setMenuProducts] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<ReservationTable[]>([]);
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(DEFAULT_BUSINESS_CONFIG);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Simulated notifications feed
  const [notifications, setNotifications] = useState<NotificationMsg[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Load and synchronize state from localStorage
  useEffect(() => {
    try {
      const menuVersion = 'v3_chayka_photos';
      const storedVersion = localStorage.getItem('chayka_menu_version');
      const storedProducts = localStorage.getItem('chayka_menu_products');
      if (storedProducts && storedVersion === menuVersion) {
        setMenuProducts(JSON.parse(storedProducts));
      } else {
        setMenuProducts(INITIAL_PRODUCTS);
        localStorage.setItem('chayka_menu_products', JSON.stringify(INITIAL_PRODUCTS));
        localStorage.setItem('chayka_menu_version', menuVersion);
      }

      const storedTables = localStorage.getItem('chayka_tables');
      if (storedTables) {
        setTables(JSON.parse(storedTables));
      } else {
        setTables(INITIAL_TABLES);
        localStorage.setItem('chayka_tables', JSON.stringify(INITIAL_TABLES));
      }

      const storedConfig = localStorage.getItem('chayka_business_config');
      if (storedConfig) {
        setBusinessConfig(JSON.parse(storedConfig));
      } else {
        setBusinessConfig(DEFAULT_BUSINESS_CONFIG);
        localStorage.setItem('chayka_business_config', JSON.stringify(DEFAULT_BUSINESS_CONFIG));
      }

      const storedReservations = localStorage.getItem('chayka_reservations');
      if (storedReservations) {
        setReservations(JSON.parse(storedReservations));
      } else {
        // Pre-populate some creative mock bookings to make UI beautiful on start
        const todayStr = new Date().toISOString().split('T')[0];
        const initialReservations: Reservation[] = [
          {
            id: 'RES-882794',
            customerName: 'Ariel Pilataxi (Turista)',
            customerEmail: 'ariel.p@gmail.com',
            customerPhone: '+593985123456',
            date: todayStr,
            timeSlot: '11:00',
            tableId: 't_deck_1',
            area: 'waterfall_deck',
            guestsCount: 2,
            status: 'confirmed',
            paymentStatus: 'simulated_paid',
            paymentReference: 'PAY-W7X892',
            timestamp: new Date().toISOString()
          },
          {
            id: 'RES-441295',
            customerName: 'Gabriela Coba',
            customerEmail: 'gabriela_c@hotmail.com',
            customerPhone: '+593994234567',
            date: todayStr,
            timeSlot: '15:30',
            tableId: 't_fire_1',
            area: 'fireplace_cozy',
            guestsCount: 2,
            status: 'confirmed',
            paymentStatus: 'simulated_paid',
            paymentReference: 'PAY-K9L211',
            timestamp: new Date().toISOString()
          }
        ];
        setReservations(initialReservations);
        localStorage.setItem('chayka_reservations', JSON.stringify(initialReservations));
      }
    } catch (e) {
      console.error('Error loading localStorage', e);
      // Fallback
      setMenuProducts(INITIAL_PRODUCTS);
      setTables(INITIAL_TABLES);
      setBusinessConfig(DEFAULT_BUSINESS_CONFIG);
    }
  }, []);

  // Save changes to localStorage whenever state modifies
  useEffect(() => {
    if (menuProducts.length > 0) {
      localStorage.setItem('chayka_menu_products', JSON.stringify(menuProducts));
    }
  }, [menuProducts]);

  useEffect(() => {
    if (tables.length > 0) {
      localStorage.setItem('chayka_tables', JSON.stringify(tables));
    }
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('chayka_business_config', JSON.stringify(businessConfig));
  }, [businessConfig]);

  useEffect(() => {
    localStorage.setItem('chayka_reservations', JSON.stringify(reservations));
  }, [reservations]);

  // Push notifications generator helper
  const addNotification = (title: string, message: string, type: 'success' | 'info' | 'alert') => {
    const newNotif: NotificationMsg = {
      id: 'notif_' + Date.now(),
      title,
      message,
      type,
      time: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Run dynamic simulated visitor traffic and events to show REAL-TIME functionality!
  useEffect(() => {
    // Initial greeting notification
    const welcomeTimer = setTimeout(() => {
      addNotification(
        'Mensaje de Bienvenida ☕',
        '¡Hola! Te damos la bienvenida a la experiencia Chayka Coffee. Explora el menú andino y asegura tu mesa junto a la cascada hoy.',
        'info'
      );
    }, 1500);

    // Random simulated reservation activity notification after 15 seconds
    const activityTimer = setTimeout(() => {
      addNotification(
        'Reserva en Tiempo Real 🪵',
        'Un cliente acaba de reservar el "Sofá Chimenea Acogedor 1" para mañana a las 15:30. ¡Pocos espacios libres hoy!',
        'success'
      );
    }, 18000);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(activityTimer);
    };
  }, []);

  const handleReservationComplete = (newReservation: Reservation) => {
    setReservations((prev) => [newReservation, ...prev]);

    // Send instant real-time feedback toast
    addNotification(
      '¡Nueva Cita Registrada! 🎉',
      `Felicidades ${newReservation.customerName}. Reservaste en la mesa ID: ${newReservation.tableId}. Completa enviándolo a WhatsApp.`,
      'success'
    );
  };

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-charcoal font-sans selection:bg-editorial-charcoal selection:text-editorial-bg" id="main-app-container">
      {/* Background Decorative - Clean editorial lines instead of neon glow bubbles */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-editorial-charcoal/5 pointer-events-none" />

      {/* HEADER SECTION WITH NAVIGATION & LIVE ALERTS */}
      <header className="sticky top-0 z-40 bg-editorial-bg/95 backdrop-blur-md border-b border-editorial-charcoal/10 transition" id="chayka-main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <button
            onClick={() => setActiveSection('home')}
            className="flex items-center gap-3 text-left cursor-pointer group"
            id="brand-logo-btn"
          >
            <div className="w-10 h-10 rounded-none bg-editorial-charcoal flex items-center justify-center p-1.5 transition-transform group-hover:scale-105 relative">
              <img
                src="/input_file_17.png"
                alt="Logo Chayka"
                className="absolute inset-0 w-full h-full object-cover z-10"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0';
                }}
              />
              <Coffee className="w-5 h-5 text-editorial-bg relative z-0" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-3xl font-black tracking-tighter uppercase leading-none text-editorial-charcoal">Chayka</span>
              <span className="text-[9px] tracking-[0.25em] uppercase opacity-60 font-semibold block mt-0.5">Coffee • Otavalo</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" id="header-desktop-nav">
            {[
              { id: 'home', label: 'Inicio', icon: Compass },
              { id: 'menu', label: 'Menú Digital', icon: Coffee },
              { id: 'booking', label: 'Reservaciones', icon: Calendar },
              { id: 'admin', label: 'Administrar', icon: Sliders }
            ].map((item) => {
              const IsActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={`flex items-center gap-1 py-1.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border-b-2 ${
                    IsActive
                      ? 'border-editorial-charcoal text-editorial-charcoal pb-1'
                      : 'border-transparent text-editorial-charcoal/60 hover:text-editorial-charcoal hover:border-editorial-charcoal/20'
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
            
            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                className="w-10 h-10 rounded-none bg-transparent border border-editorial-charcoal/10 hover:border-editorial-charcoal hover:bg-editorial-charcoal/5 text-editorial-charcoal flex items-center justify-center transition cursor-pointer relative"
                id="bell-notification-btn"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification dropdown sidebar block */}
              {showNotificationCenter && (
                <div className="absolute right-0 mt-3 w-80 bg-editorial-bg border border-editorial-charcoal/20 rounded-none p-4 shadow-2xl z-50 text-left space-y-3" id="notif-dropdown">
                  <div className="flex justify-between items-center border-b border-editorial-charcoal/10 pb-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-editorial-charcoal">Notificaciones Live</h4>
                    <button
                      onClick={() => setShowNotificationCenter(false)}
                      className="text-editorial-charcoal/60 hover:text-editorial-charcoal text-[10px] font-bold uppercase tracking-wider"
                    >
                      Cerrar
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 bg-editorial-stone/40 rounded-none border border-editorial-charcoal/10 flex gap-2 items-start text-xs">
                        <div className="mt-1">
                          {n.type === 'success' ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600 block" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 block" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-editorial-charcoal uppercase tracking-wider text-[10px]">{n.title}</div>
                          <p className="text-editorial-charcoal/80 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                          <span className="text-[9px] text-editorial-charcoal/50 block mt-1.5 font-semibold tracking-wider font-mono">{n.time} HS</span>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="col-span-full py-4 text-center text-xs text-editorial-charcoal/40 font-serif italic">
                        No hay notificaciones.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Booking direct trigger */}
            <button
              onClick={() => setActiveSection('booking')}
              className="bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-bg font-bold px-4 py-2.5 rounded-none text-xs uppercase tracking-widest flex md:hidden items-center gap-1 cursor-pointer transition-all shadow-md"
              id="mobile-quick-book-btn"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reservar</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden border-t border-editorial-charcoal/10 bg-editorial-bg" id="header-mobile-tabs">
          {[
            { id: 'home', label: 'Inicio', icon: Compass },
            { id: 'menu', label: 'Menú', icon: Coffee },
            { id: 'booking', label: 'Citas', icon: Calendar },
            { id: 'admin', label: 'Admin', icon: Sliders }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`flex-1 py-3.5 text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                activeSection === item.id ? 'text-editorial-charcoal bg-editorial-stone/40 font-black' : 'text-editorial-charcoal/60'
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
      {activeSection === 'home' && (
        <main className="space-y-16 pb-20" id="home-view-module">
          
          {/* HERO BANNER BLOCK WITH IMMERSIVE DESIGN */}
          <section className="relative h-[85vh] sm:h-[75vh] flex items-center justify-center overflow-hidden border-b border-editorial-charcoal/10" id="peguche-hero">
            {/* Background image covering cloud forests & coffee seeds */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=1200"
                alt="Chayka Coffee Background"
                className="w-full h-full object-cover opacity-25 filter saturate-75 scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-editorial-bg via-editorial-bg/75 to-transparent" />
            </div>

            <div className="max-w-4xl mx-auto px-4 relative z-10 text-center space-y-8">
              <div className="inline-flex items-center gap-1.5 bg-editorial-charcoal text-editorial-bg px-4 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-[0.2em] shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-editorial-stone fill-editorial-stone" />
                <span>Experiencia Nacional Turística Única</span>
              </div>

              <h1 className="font-serif text-5xl sm:text-7xl font-bold tracking-tight text-editorial-charcoal">
                Chayka Coffee
              </h1>

              <p className="text-editorial-charcoal/80 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed font-sans">
                Ubicada en el sendero mágico a la magnífica <strong className="text-editorial-charcoal font-black">Cascada de Peguche</strong> en Otavalo. Disfruta comida tradicional y café de especialidad arrullado por el canto eterno del agua.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => setActiveSection('booking')}
                  className="w-full sm:w-auto bg-editorial-charcoal text-editorial-bg font-bold px-8 py-4 rounded-none uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-editorial-charcoal/90 transition-all cursor-pointer shadow-md"
                  id="hero-book-btn"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reservar Tu Mesa</span>
                </button>

                <button
                  onClick={() => setActiveSection('menu')}
                  className="w-full sm:w-auto bg-transparent border border-editorial-charcoal/25 text-editorial-charcoal font-bold px-8 py-4 rounded-none uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-editorial-charcoal/5 transition-all cursor-pointer"
                  id="hero-menu-btn"
                >
                  <Coffee className="w-4 h-4 text-editorial-charcoal" />
                  <span>Ver Menú Digital</span>
                </button>
              </div>

              {/* Highlights badge bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 text-editorial-charcoal text-xs">
                <div className="flex flex-col items-center gap-1 bg-editorial-stone/40 p-3 rounded-none border border-editorial-charcoal/10">
                  <span className="font-serif text-editorial-charcoal font-black italic text-base">1,800m</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60">Granos de Altura</span>
                </div>
                <div className="flex flex-col items-center gap-1 bg-editorial-stone/40 p-3 rounded-none border border-editorial-charcoal/10">
                  <span className="font-serif text-editorial-charcoal font-black italic text-base">Peguche</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60">Frente a la Cascada</span>
                </div>
                <div className="flex flex-col items-center gap-1 bg-editorial-stone/40 p-3 rounded-none border border-editorial-charcoal/10">
                  <span className="font-serif text-editorial-charcoal font-black italic text-base">100% Secure</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60">Pagos Integrados</span>
                </div>
                <div className="flex flex-col items-center gap-1 bg-editorial-stone/40 p-3 rounded-none border border-editorial-charcoal/10">
                  <span className="font-serif text-editorial-charcoal font-black italic text-base">WhatsApp</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60">Atención en Real-Time</span>
                </div>
              </div>
            </div>
          </section>

          {/* SPLENDID ATTRACTIONS OVERVIEW */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-editorial-charcoal/10 pb-16" id="turismo-highlight">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left text column */}
              <div className="space-y-6 text-left">
                <span className="text-editorial-charcoal/60 font-bold text-[10px] uppercase tracking-[0.25em] block">Ubicación Ancestral</span>
                <h3 className="text-3xl sm:text-5xl font-serif font-bold italic text-editorial-charcoal leading-tight">
                  Un Santuario Turístico que Debes Visitar en Imbabura
                </h3>
                <p className="text-editorial-charcoal/80 text-sm leading-relaxed font-sans font-normal">
                  Cascada de Peguche es un sitio ceremonial indígena sagrado donde los locales recargan sus energías espirituales durante el Inti Raymi. <strong className="text-editorial-charcoal font-black">Chayka Coffee</strong> se integra de forma respetuosa con esta mística geografía, ofreciendo un refugio de diseño rústico-contemporáneo donde podrás sentarte y degustar repostería fina.
                </p>

                <div className="space-y-3 text-xs text-editorial-charcoal/80">
                  <div className="flex gap-2.5 items-start">
                    <MapPin className="w-5 h-5 text-editorial-charcoal flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-editorial-charcoal">Ubicación Geográfica:</strong> {businessConfig.location}
                    </span>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <Clock className="w-5 h-5 text-editorial-charcoal flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      {businessConfig.schedules.map((sch, i) => (
                        <div key={i}>
                          <strong className="text-editorial-charcoal">{sch.day}:</strong> {sch.hours}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <Phone className="w-5 h-5 text-editorial-charcoal flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-editorial-charcoal font-black">Atención Directa WhatsApp:</strong> {businessConfig.whatsappNumber}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex gap-3.5">
                  <a
                    href={businessConfig.locationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-editorial-stone/60 hover:bg-editorial-stone/80 text-editorial-charcoal border border-editorial-charcoal/15 text-[10px] font-bold uppercase tracking-widest px-5 py-3 rounded-none flex items-center gap-1.5 cursor-pointer"
                    id="maps-direction-btn"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Lanzar Direcciones GPS</span>
                  </a>

                  <button
                    onClick={() => setActiveSection('booking')}
                    className="bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-bg text-[10px] font-bold uppercase tracking-widest px-5 py-3 rounded-none flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>Apartar una Mesa</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right visuals column with elegant mock waterfall and coffee setups */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-64 rounded-none overflow-hidden border border-editorial-charcoal/15">
                    <img
                      src="https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=400"
                      alt="Coffee Cup on Wood"
                      className="w-full h-full object-cover filter saturate-50"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="bg-editorial-stone/40 p-5 rounded-none border border-editorial-charcoal/10 text-left space-y-1.5">
                    <span className="text-editorial-charcoal font-bold block text-[10px] uppercase tracking-widest opacity-70">Firma Chayka</span>
                    <p className="text-editorial-charcoal/80 text-xs leading-relaxed font-normal">
                      Sabores andinos como humitas de choclo fresco maridando espressos aterciopelados.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <div className="bg-editorial-stone/80 border border-editorial-charcoal/10 p-5 rounded-none text-left space-y-1.5">
                    <span className="text-editorial-charcoal font-black block text-[10px] uppercase tracking-widest">9.8 • Rating</span>
                    <p className="text-editorial-charcoal/80 text-xs leading-relaxed">
                      Evaluación estelar por visitantes internacionales en el sendero de Peguche.
                    </p>
                  </div>
                  <div className="h-64 rounded-none overflow-hidden border border-editorial-charcoal/15">
                    <img
                      src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=400"
                      alt="Waterfall vegetation"
                      className="w-full h-full object-cover opacity-80 filter saturate-50"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* MAIN TRADITIONS CALLOUT BANNER - Charcoal / Editorial split look */}
          <section className="bg-editorial-charcoal text-editorial-bg p-8 md:p-12 text-left rounded-none max-w-7xl mx-auto border border-editorial-charcoal/10">
            <div className="max-w-3xl space-y-4">
              <span className="text-editorial-bg/60 font-bold tracking-[0.25em] text-[10px] uppercase flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-editorial-stone" /> Tradición Ecuatoriana Re-Imaginada
              </span>
              <h3 className="text-3xl sm:text-4xl font-serif italic tracking-tight text-editorial-bg">
                ¿Vienes a Otavalo por Turismo?
              </h3>
              <p className="text-editorial-bg/80 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
                Nuestra carta une lo mejor de los granos de especialidad (Chemex, V60 de Intag) con la repostería artesanal andina. Te aseguramos una experiencia inolvidable. Al reservar con antelación, tu mesa estará lista con tus elecciones favoritas para que recorras los senderos de agua silvestre sin demoras.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setActiveSection('menu');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-editorial-bg text-editorial-charcoal hover:bg-editorial-bg/90 hover:text-editorial-charcoal border border-transparent px-6 py-3.5 rounded-none text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md"
                >
                  Explorar la Carta Digital
                </button>
              </div>
            </div>
          </section>

          {/* GALERÍA DE LA EXPERIENCIA CHAYKA */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8 animate-fadeIn" id="chayka-gallery">
            <div className="text-center space-y-2">
              <span className="text-editorial-charcoal/60 font-bold text-[10px] uppercase tracking-[0.25em] block">Inspiración de Finca y Cascada</span>
              <h3 className="text-3xl sm:text-4xl font-serif font-bold italic text-editorial-charcoal">Galería de Coexistencia</h3>
              <p className="text-editorial-charcoal/80 text-xs max-w-xl mx-auto">
                Explora las especialidades de la barra y momentos capturados en vivo por visitantes de todo el mundo en nuestro espectacular rincón andino.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Mini Carrot Cakes",
                  desc: "Bizcochos horneados artesanalmente con frosting terso de queso crema y adornos de zanahorias.",
                  img: "/input_file_0.png",
                  fallback: "https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?auto=format&fit=crop&q=80&w=400"
                },
                {
                  title: "Sunset Pitahaya",
                  desc: "Zumo natural refrescante de pitahaya fucsia andina servido con hierbabuena de finca.",
                  img: "/input_file_6.png",
                  fallback: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400"
                },
                {
                  title: "Encuentro Matcha",
                  desc: "Matcha japonés orgánico batido, croissant crujiente de mantequilla de campo y un rato de lectura.",
                  img: "/input_file_11.png",
                  fallback: "https://images.unsplash.com/photo-1530610476181-d834309647fc?auto=format&fit=crop&q=80&w=400"
                },
                {
                  title: "Affogato de Especialidad",
                  desc: "Helado fino de vainilla sumergido en nuestra cremosa extracción de café de especialidad.",
                  img: "/input_file_2.png",
                  fallback: "https://images.unsplash.com/photo-1594911774802-8822a707caff?auto=format&fit=crop&q=80&w=400"
                }
              ].map((item, idx) => (
                <div key={idx} className="group flex flex-col bg-editorial-stone/30 border border-editorial-charcoal/15 rounded-none overflow-hidden transition-all hover:border-editorial-charcoal/50 text-left shadow-sm">
                  <div className="relative h-60 overflow-hidden bg-editorial-stone border-b border-editorial-charcoal/10">
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
                    <h4 className="font-serif font-black text-sm text-editorial-charcoal uppercase tracking-tight">{item.title}</h4>
                    <p className="text-[11px] text-editorial-charcoal/80 leading-relaxed font-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </main>
      )}

      {/* CORE MENU VIEW MODULE */}
      {activeSection === 'menu' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="menu-view-module">
          <MenuSection
            categories={INITIAL_CATEGORIES}
            products={menuProducts}
            interactiveMode={false} // Independent viewing mode
          />
        </main>
      )}

      {/* CORE BOOKING VIEW MODULE */}
      {activeSection === 'booking' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn" id="booking-view-module">
          <div>
            <span className="text-editorial-charcoal/60 font-semibold text-xs uppercase tracking-[0.25em] block text-center">Garantía de Atención Rápida</span>
            <h2 className="text-3xl font-bold font-serif italic text-editorial-charcoal text-center mt-1">Reserva de Mesa Integrada</h2>
            <p className="text-editorial-charcoal/80 text-xs text-center max-w-md mx-auto mt-1">
              Selecciona tu mesa para visitas turísticas, reuniones familiares o veladas románticas.
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
      {activeSection === 'admin' && (
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
      <footer className="border-t border-editorial-charcoal/15 bg-editorial-stone/30 py-12 text-editorial-charcoal text-xs text-left" id="chayka-main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-3">
            <h4 className="text-editorial-charcoal font-serif font-black uppercase tracking-wider text-xs">Chayka Coffee Peguche</h4>
            <p className="text-editorial-charcoal/80 leading-relaxed font-normal">
              Fusión andina de naturaleza, café de finca y recetas ceremoniales del norte ecuatoriano. Otavalo, Imbabura.
            </p>
            <div className="flex gap-2">
              <a href="#" className="p-2 bg-editorial-stone hover:bg-editorial-charcoal hover:text-editorial-bg border border-editorial-charcoal/10 text-editorial-charcoal transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-editorial-charcoal font-serif font-black uppercase tracking-wider text-xs">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-editorial-charcoal/80 font-medium">
              <li>
                <button onClick={() => setActiveSection('home')} className="hover:underline cursor-pointer">Inicio Chayka</button>
              </li>
              <li>
                <button onClick={() => setActiveSection('menu')} className="hover:underline cursor-pointer">Menú Interactivo</button>
              </li>
              <li>
                <button onClick={() => setActiveSection('booking')} className="hover:underline cursor-pointer">Apartar Cita</button>
              </li>
              <li>
                <button onClick={() => setActiveSection('admin')} className="hover:underline cursor-pointer">Administrar</button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-editorial-charcoal font-serif font-black uppercase tracking-wider text-xs">Contáctanos</h4>
            <p className="text-editorial-charcoal/80">
              Sintonía directa para eventos especiales, catas rituales de café andino o visitas de grandes grupos turísticos.
            </p>
            <div className="font-bold text-editorial-charcoal text-xs tracking-wider uppercase">
              WhatsApp: {businessConfig.whatsappNumber}
            </div>
          </div>

        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-editorial-charcoal/10 mt-8 pt-8 flex flex-col sm:flex-row justify-between text-[10px] font-semibold tracking-wider uppercase opacity-60">
          <span>&copy; {new Date().getFullYear()} Chayka Coffee. Reservas simuladas para demostración turística.</span>
          <span>Hecho con diseño andino en Otavalo, Ecuador</span>
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
