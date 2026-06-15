import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from './api';
import type { MenuItem, ReservationTable, BusinessConfig } from '../types';

export const queryKeys = {
  menu: ['menu'] as const,
  tables: ['tables'] as const,
  businessConfig: ['business-config'] as const
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
    select: rowToBusinessConfig
  });
}

export { ApiError };

export interface AdminSession {
  authenticated: boolean;
  expiresAt?: string;
  expired?: boolean;
}

export function useAdminAuth() {
  return useQuery<AdminSession>({
    queryKey: ['admin', 'me'],
    queryFn: () => api.get<AdminSession>('/admin/me'),
    retry: false,
    staleTime: Infinity // sessions are invalidated explicitly
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
