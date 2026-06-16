import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from './api';
import type {
  MenuItem,
  MenuCategory,
  TableAreaRow,
  ReservationTable,
  Reservation,
  BusinessConfig,
  Notification,
  ServiceStatus
} from '../types';

export const queryKeys = {
  menu: ['menu'] as const,
  tables: ['tables'] as const,
  businessConfig: ['business-config'] as const,
  reservations: ['reservations'] as const,
  menuCategories: ['menu-categories'] as const,
  tableAreas: ['table-areas'] as const,
  notifications: ['notifications'] as const
};

/**
 * Server rows use split `name_es`/`name_en` columns. This helper re-packs them
 * into the BilingualText shape the rest of the app expects.
 */
function unpackBilingual<T extends { es: string; en: string }>(text: T): T {
  return text;
}

export interface MenuItemRow {
  id: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string | null;
  descriptionEn: string | null;
  price: string;
  category: string;
  image: string | null;
  fallbackImage: string | null;
  active: boolean | null;
  ingredientsEs: string[] | null;
  ingredientsEn: string[] | null;
  isSpecial: boolean | null;
  preparationTime: number | null;
  updatedAt: string | null;
}

export interface TableRow {
  id: string;
  nameEs: string;
  nameEn: string;
  capacity: number;
  area: 'waterfall_deck' | 'fireplace_cozy' | 'indoor_premium' | 'terrace_panoramic';
  minimumConsumption: string;
  updatedAt: string | null;
}

export interface BusinessConfigRow {
  id: number;
  name: string | null;
  location: string | null;
  locationLink: string | null;
  whatsappNumber: string | null;
  minPeopleReservation: number | null;
  maxPeopleReservation: number | null;
  schedules: Array<{ day: string; hours: string }> | null;
  timeSlots: string[] | null;
  updatedAt: string | null;
}

export function rowToMenuItem(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    name: unpackBilingual({ es: row.nameEs, en: row.nameEn }),
    description: {
      es: row.descriptionEs ?? '',
      en: row.descriptionEn ?? ''
    },
    price: Number(row.price),
    category: row.category,
    image: row.image ?? '',
    fallbackImage: row.fallbackImage ?? undefined,
    active: row.active ?? true,
    ingredients: {
      es: row.ingredientsEs ?? [],
      en: row.ingredientsEn ?? []
    },
    isSpecial: row.isSpecial ?? false,
    preparationTime: row.preparationTime ?? 0
  };
}

export function rowToTable(row: TableRow): ReservationTable {
  return {
    id: row.id,
    name: unpackBilingual({ es: row.nameEs, en: row.nameEn }),
    capacity: row.capacity,
    area: row.area,
    minimumConsumption: Number(row.minimumConsumption)
  };
}

export function rowToBusinessConfig(row: BusinessConfigRow): BusinessConfig {
  return {
    name: row.name ?? '',
    location: row.location ?? '',
    locationLink: row.locationLink ?? '',
    whatsappNumber: row.whatsappNumber ?? '',
    minPeopleReservation: row.minPeopleReservation ?? 1,
    maxPeopleReservation: row.maxPeopleReservation ?? 10,
    schedules: row.schedules ?? [],
    timeSlots: row.timeSlots ?? []
  };
}

export interface MenuCategoryRow {
  id: string;
  nameEs: string;
  nameEn: string;
  displayOrder: number;
  active: boolean;
  updatedAt: string | null;
}

export interface TableAreaApiRow {
  id: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string | null;
  descriptionEn: string | null;
  displayOrder: number;
  active: boolean;
  updatedAt: string | null;
}

export function rowToMenuCategory(row: MenuCategoryRow): MenuCategory {
  return {
    id: row.id,
    name: { es: row.nameEs, en: row.nameEn },
    displayOrder: row.displayOrder,
    active: row.active
  };
}

export function rowToTableArea(row: TableAreaApiRow): TableAreaRow {
  return {
    id: row.id,
    name: { es: row.nameEs, en: row.nameEn },
    description: {
      es: row.descriptionEs ?? '',
      en: row.descriptionEn ?? ''
    },
    displayOrder: row.displayOrder,
    active: row.active
  };
}

export function useMenuQuery() {
  return useQuery({
    queryKey: queryKeys.menu,
    queryFn: () => api.get<MenuItemRow[]>('/menu'),
    select: (rows) => rows.map(rowToMenuItem)
  });
}

export function useTablesQuery() {
  return useQuery({
    queryKey: queryKeys.tables,
    queryFn: () => api.get<TableRow[]>('/tables'),
    select: (rows) => rows.map(rowToTable)
  });
}

export function useBusinessConfigQuery() {
  return useQuery({
    queryKey: queryKeys.businessConfig,
    queryFn: () => api.get<BusinessConfigRow>('/business-config'),
    select: rowToBusinessConfig,
    staleTime: 0 // D5: config is small, reflect admin edits immediately
  });
}

export function useMenuCategoriesQuery(options?: { activeOnly?: boolean }) {
  const activeOnly = options?.activeOnly ?? false;
  return useQuery({
    queryKey: queryKeys.menuCategories,
    queryFn: () => api.get<MenuCategoryRow[]>('/menu-categories'),
    select: (rows) => {
      const mapped = rows.map(rowToMenuCategory);
      return activeOnly ? mapped.filter((c) => c.active) : mapped;
    }
  });
}

export function useTableAreasQuery(options?: { activeOnly?: boolean }) {
  const activeOnly = options?.activeOnly ?? false;
  return useQuery({
    queryKey: queryKeys.tableAreas,
    queryFn: () => api.get<TableAreaApiRow[]>('/table-areas'),
    select: (rows) => {
      const mapped = rows.map(rowToTableArea);
      return activeOnly ? mapped.filter((a) => a.active) : mapped;
    }
  });
}

export { ApiError };

export interface ReservationRow {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  tableId: string;
  area: string;
  guestsCount: number;
  status: string;
  paymentStatus: string;
  paymentReference: string | null;
  notes: string | null;
  selectedOrderItems: Array<{ productId: string; name: string; price: number; quantity: number }> | null;
  timestamp: string;
  // PR#4: service lifecycle fields
  serviceStatus: string;
  checkedInAt: string | null;
  serviceStartedAt: string | null;
  serviceCompletedAt: string | null;
}

export function useReservationsQuery() {
  return useQuery<ReservationRow[]>({
    queryKey: queryKeys.reservations,
    queryFn: () => api.get<ReservationRow[]>('/admin/reservations'),
  });
}

/**
 * Pure mapper from a server `ReservationRow` to the app's `Reservation` shape.
 * Coerces the raw `serviceStatus` string into the `ServiceStatus` union and
 * defaults to `not_checked_in` when the column is missing on legacy rows.
 */
export function rowToReservation(row: ReservationRow): Reservation {
  const serviceStatus: ServiceStatus =
    row.serviceStatus === 'checked_in' ||
    row.serviceStatus === 'in_service' ||
    row.serviceStatus === 'completed'
      ? row.serviceStatus
      : 'not_checked_in';
  return {
    id: row.id,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerPhone: row.customerPhone,
    date: row.date,
    timeSlot: row.timeSlot,
    tableId: row.tableId,
    area: row.area as Reservation['area'],
    guestsCount: row.guestsCount,
    status: row.status as Reservation['status'],
    paymentStatus: row.paymentStatus as Reservation['paymentStatus'],
    paymentReference: row.paymentReference ?? undefined,
    notes: row.notes ?? undefined,
    timestamp: row.timestamp,
    selectedOrderItems: row.selectedOrderItems ?? undefined,
    serviceStatus,
    checkedInAt: row.checkedInAt,
    serviceStartedAt: row.serviceStartedAt,
    serviceCompletedAt: row.serviceCompletedAt
  };
}

/**
 * Counts the reservations currently in the `in_service` state. Used by the
 * "Currently In Service" KPI tile in the AdminPanel.
 */
export function countInService(reservations: ReadonlyArray<{ serviceStatus?: string }>): number {
  return reservations.filter((r) => r.serviceStatus === 'in_service').length;
}

export interface AdminSession {
  authenticated: boolean;
  expiresAt?: string;
  expired?: boolean;
}

// PR#4: notifications feed for the AdminPanel "Notificaciones" tab.
export function useNotificationsQuery(options?: { limit?: number }) {
  const limit = options?.limit ?? 50;
  return useQuery<Notification[]>({
    queryKey: [...queryKeys.notifications, limit],
    queryFn: () => api.get<Notification[]>(`/admin/notifications?limit=${limit}`)
  });
}

export function useAdminAuth() {
  return useQuery<AdminSession>({
    queryKey: ['admin', 'me'],
    queryFn: () => api.get<AdminSession>('/admin/me'),
    retry: false,
    staleTime: 5 * 60_000, // 5 minutes, per design
    refetchOnWindowFocus: true
  });
}

export function useAdminLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (password: string) =>
      api.post<{ ok: boolean; expiresAt: string }>('/admin/login', { password }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'me'] });
    }
  });
}

export function useAdminLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ ok: boolean }>('/admin/logout'),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'me'] });
    }
  });
}
