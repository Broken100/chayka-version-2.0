import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, ReservationTable, Reservation, BusinessConfig, Language, KanbanStage } from '../types';
import { INITIAL_PRODUCTS, INITIAL_TABLES, DEFAULT_BUSINESS_CONFIG } from '../data';
import { NotificationMsg } from '../components/NotificationToast';
import { useMenuQuery, useTablesQuery, useBusinessConfigQuery } from '../lib/queries';

export interface ReservationContextType {
  reservations: Reservation[];
  menuProducts: MenuItem[];
  tables: ReservationTable[];
  businessConfig: BusinessConfig;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeView: 'home' | 'menu' | 'booking' | 'admin';
  setActiveView: (view: 'home' | 'menu' | 'booking' | 'admin') => void;
  addReservation: (res: Omit<Reservation, 'id' | 'timestamp'>) => Reservation;
  updateReservationStatus: (id: string, status: KanbanStage) => void;
  updateMenuProduct: (product: MenuItem) => void;
  notifications: NotificationMsg[];
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'alert') => void;
  dismissNotification: (id: string) => void;
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  setMenuProducts: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  setTables: React.Dispatch<React.SetStateAction<ReservationTable[]>>;
  setBusinessConfig: React.Dispatch<React.SetStateAction<BusinessConfig>>;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export function ReservationProvider({ children }: { children: React.ReactNode }) {
  // Language State
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('chayka_language');
      if (stored === 'es' || stored === 'en') return stored;
    } catch (e) {
      console.error('Error reading language from localStorage', e);
    }
    return 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('chayka_language', lang);
    } catch (e) {
      console.error('Error writing language to localStorage', e);
    }
  };

  // Active View State
  const [activeView, setActiveViewState] = useState<'home' | 'menu' | 'booking' | 'admin'>(() => {
    try {
      const stored = localStorage.getItem('chayka_active_view');
      if (stored === 'home' || stored === 'menu' || stored === 'booking' || stored === 'admin') return stored;
    } catch (e) {
      console.error('Error reading active view from localStorage', e);
    }
    return 'home';
  });

  const setActiveView = (view: 'home' | 'menu' | 'booking' | 'admin') => {
    setActiveViewState(view);
    try {
      localStorage.setItem('chayka_active_view', view);
    } catch (e) {
      console.error('Error writing active view to localStorage', e);
    }
  };

  // Backend-driven reads (PR#2). Fall back to local seed constants while loading
  // so the UI never renders empty for the initial paint.
  const menuQuery = useMenuQuery();
  const tablesQuery = useTablesQuery();
  const configQuery = useBusinessConfigQuery();

  const menuProducts: MenuItem[] = menuQuery.data ?? INITIAL_PRODUCTS;
  const tables: ReservationTable[] = tablesQuery.data ?? INITIAL_TABLES;
  const businessConfig: BusinessConfig = configQuery.data ?? DEFAULT_BUSINESS_CONFIG;

  // Reservations still live client-side for now (PR#3 will swap them to a query).
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const storedReservations = localStorage.getItem('chayka_reservations');
      if (storedReservations) return JSON.parse(storedReservations);
    } catch (e) {
      console.error('Error parsing reservations from localStorage', e);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    return [
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
        paymentStatus: 'success',
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
        paymentStatus: 'success',
        paymentReference: 'PAY-K9L211',
        timestamp: new Date().toISOString()
      }
    ];
  });

  // Simulated Notifications Feed State
  const [notifications, setNotifications] = useState<NotificationMsg[]>([]);

  // LocalStorage sync for reservations (kept until PR#3).
  useEffect(() => {
    try {
      localStorage.setItem('chayka_reservations', JSON.stringify(reservations));
    } catch (e) {
      console.error('Error saving reservations to localStorage', e);
    }
  }, [reservations]);

  // Operations
  const addReservation = (res: Omit<Reservation, 'id' | 'timestamp'>): Reservation => {
    const id = `RES-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = new Date().toISOString();
    const newRes: Reservation = {
      ...res,
      id,
      timestamp
    };
    setReservations((prev) => [newRes, ...prev]);
    return newRes;
  };

  const updateReservationStatus = (id: string, status: KanbanStage) => {
    setReservations((prev) =>
      prev.map((res) => (res.id === id ? { ...res, status } : res))
    );
  };

  const updateMenuProduct = (product: MenuItem) => {
    // PR#3 will turn this into a useMutation that invalidates the menu query.
    setMenuProducts((prev) =>
      prev.map((p) => (p.id === product.id ? product : p))
    );
  };

  // Notification actions
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

  // Backwards-compatible setters that consumers still use. These will go away in PR#3.
  const setMenuProducts: React.Dispatch<React.SetStateAction<MenuItem[]>> = () => {
    console.warn('setMenuProducts is a no-op in PR#2; will be removed in PR#3');
  };
  const setTables: React.Dispatch<React.SetStateAction<ReservationTable[]>> = () => {
    console.warn('setTables is a no-op in PR#2; will be removed in PR#3');
  };
  const setBusinessConfig: React.Dispatch<React.SetStateAction<BusinessConfig>> = () => {
    console.warn('setBusinessConfig is a no-op in PR#2; will be removed in PR#3');
  };

  return (
    <ReservationContext.Provider
      value={{
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
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
}
