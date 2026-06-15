import React, { createContext, useContext, useState, useCallback } from 'react';
import { MenuItem, ReservationTable, Reservation, BusinessConfig, Language, KanbanStage } from '../types';
import { INITIAL_PRODUCTS, INITIAL_TABLES, DEFAULT_BUSINESS_CONFIG } from '../data';
import { NotificationMsg } from '../components/NotificationToast';
import { useMenuQuery, useTablesQuery, useBusinessConfigQuery, useReservationsQuery } from '../lib/queries';
import { useAddReservation, useUpdateReservationStatus, useUpdateMenuProduct } from '../lib/mutations';

export interface ReservationContextType {
  reservations: Reservation[];
  menuProducts: MenuItem[];
  tables: ReservationTable[];
  businessConfig: BusinessConfig;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeView: 'home' | 'menu' | 'booking' | 'admin';
  setActiveView: (view: 'home' | 'menu' | 'booking' | 'admin') => void;
  addReservation: (res: Omit<Reservation, 'id' | 'timestamp'>) => Promise<Reservation>;
  updateReservationStatus: (id: string, status: KanbanStage) => Promise<void>;
  updateMenuProduct: (product: MenuItem) => Promise<void>;
  notifications: NotificationMsg[];
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'alert') => void;
  dismissNotification: (id: string) => void;
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

  // Backend-driven reads. Fall back to local seed constants while loading.
  const menuQuery = useMenuQuery();
  const tablesQuery = useTablesQuery();
  const configQuery = useBusinessConfigQuery();
  const reservationsQuery = useReservationsQuery();

  const menuProducts: MenuItem[] = menuQuery.data ?? INITIAL_PRODUCTS;
  const tables: ReservationTable[] = tablesQuery.data ?? INITIAL_TABLES;
  const businessConfig: BusinessConfig = configQuery.data ?? DEFAULT_BUSINESS_CONFIG;
  const reservations: Reservation[] = (reservationsQuery.data ?? []) as unknown as Reservation[];

  // Simulated Notifications Feed State
  const [notifications, setNotifications] = useState<NotificationMsg[]>([]);

  // Operations (backed by API mutations; refetch-only, no optimistic UI)
  const addReservationMutation = useAddReservation();
  const updateStatusMutation = useUpdateReservationStatus();
  const updateMenuMutation = useUpdateMenuProduct();

  const addReservation = async (res: Omit<Reservation, 'id' | 'timestamp'>): Promise<Reservation> => {
    const result = await addReservationMutation.mutateAsync({
      customerName: res.customerName,
      customerEmail: res.customerEmail,
      customerPhone: res.customerPhone,
      date: res.date,
      timeSlot: res.timeSlot,
      tableId: res.tableId,
      area: res.area,
      guestsCount: res.guestsCount,
      notes: res.notes,
      selectedOrderItems: res.selectedOrderItems,
      paymentStatus: res.paymentStatus,
      paymentReference: res.paymentReference,
      status: res.status
    });
    addNotification('Reservaci\u00f3n creada', 'ID ' + result.id + ' confirmada.', 'success');
    return { ...res, id: result.id, timestamp: new Date().toISOString() } as Reservation;
  };

  const updateReservationStatus = async (id: string, status: KanbanStage): Promise<void> => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
    } catch (e) {
      addNotification(
        'Error al actualizar estado',
        e instanceof Error ? e.message : 'Error desconocido',
        'alert'
      );
    }
  };

  const updateMenuProduct = async (product: MenuItem): Promise<void> => {
    try {
      await updateMenuMutation.mutateAsync(product);
    } catch (e) {
      addNotification(
        'Error al actualizar producto',
        e instanceof Error ? e.message : 'Error desconocido',
        'alert'
      );
    }
  };

  // Notification actions
  const addNotification = useCallback((title: string, message: string, type: 'success' | 'info' | 'alert') => {
    const newNotif: NotificationMsg = {
      id: 'notif_' + Date.now(),
      title,
      message,
      type,
      time: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Backwards-compatible no-op setters kept until PR#4.
  const setMenuProducts: React.Dispatch<React.SetStateAction<MenuItem[]>> = () => {
    console.warn('setMenuProducts is a no-op in PR#3; will be removed in PR#4');
  };
  const setTables: React.Dispatch<React.SetStateAction<ReservationTable[]>> = () => {
    console.warn('setTables is a no-op in PR#3; will be removed in PR#4');
  };
  const setBusinessConfig: React.Dispatch<React.SetStateAction<BusinessConfig>> = () => {
    console.warn('setBusinessConfig is a no-op in PR#3; will be removed in PR#4');
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
