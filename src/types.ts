/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string; // 'hot_coffee' | 'cold_coffee' | 'desserts' | 'traditional' | 'savory'
  image: string;
  fallbackImage?: string;
  active: boolean;
  ingredients: string[];
  isSpecial: boolean;
  preparationTime: number; // in minutes
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  description: string;
}

export type TableArea = 'waterfall_deck' | 'fireplace_cozy' | 'indoor_premium' | 'terrace_panoramic';

export interface ReservationTable {
  id: string;
  name: string;
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
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'unpaid' | 'simulated_paid';
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
}
