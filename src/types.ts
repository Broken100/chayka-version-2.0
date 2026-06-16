/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type Language = 'es' | 'en';

export type KanbanStage = 'pending' | 'confirmed' | 'cancelled';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'simulated_paid' | 'unpaid';

export type BilingualText = {
  es: string;
  en: string;
};

export type BilingualList = {
  es: string[];
  en: string[];
};

export interface TranslationDictionary {
  [key: string]: any;
}

export interface MenuItem {
  id: string;
  name: BilingualText;
  description: BilingualText;
  price: number;
  category: string; // 'specialty_coffee' | 'traditional' | 'bakery' | 'cold_drinks'
  image: string;
  fallbackImage?: string;
  active: boolean;
  ingredients: BilingualList;
  isSpecial: boolean;
  preparationTime: number; // in minutes
}

export interface Category {
  id: string;
  name: BilingualText;
  icon: string; // Lucide icon name
  description: BilingualText;
}

export interface MenuCategory {
  id: string;
  name: BilingualText;
  displayOrder: number;
  active: boolean;
  icon?: string; // Local icon-name → Lucide map, kept client-side
}

export interface TableAreaRow {
  id: string;
  name: BilingualText;
  description?: BilingualText;
  displayOrder: number;
  active: boolean;
}

export type TableArea = 'waterfall_deck' | 'fireplace_cozy' | 'indoor_premium' | 'terrace_panoramic';

export interface ReservationTable {
  id: string;
  name: BilingualText;
  capacity: number;
  area: TableArea;
  minimumConsumption: number;
}

export interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "10:30"
  tableId: string;
  area: TableArea;
  guestsCount: number;
  status: KanbanStage;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  notes?: string;
  timestamp: string;
  selectedOrderItems?: { menuItemId: string; quantity: number; price: number }[];
}

export interface BusinessConfig {
  name: string;
  location: string;
  locationLink: string;
  whatsappNumber: string; // e.g. "+593987654321" (Ecuador)
  minPeopleReservation: number;
  maxPeopleReservation: number;
  schedules: {
    day: string; // "Lunes-Viernes" / "Sábados-Domingos"
    hours: string;
  }[];
  timeSlots: string[]; // ["08:30", "10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00"]
  transferQrUrl: string | null; // "/uploads/<uuid>.<ext>" or null
}

export interface ReservationContextType {
  reservations: Reservation[];
  menuProducts: MenuItem[];
  tables: ReservationTable[];
  businessConfig: BusinessConfig;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeView: 'home' | 'menu' | 'booking' | 'admin';
  setActiveView: (view: 'home' | 'menu' | 'booking' | 'admin') => void;
  addReservation: (res: Omit<Reservation, 'id' | 'timestamp'>) => void;
  updateReservationStatus: (id: string, status: KanbanStage) => void;
  updateMenuProduct: (product: MenuItem) => void;
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  setMenuProducts: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  setTables: React.Dispatch<React.SetStateAction<ReservationTable[]>>;
  setBusinessConfig: React.Dispatch<React.SetStateAction<BusinessConfig>>;
}

