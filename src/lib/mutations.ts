import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import {
  queryKeys,
  type MenuItemRow,
  type TableRow,
  type BusinessConfigRow,
  type MenuCategoryRow,
  type TableAreaApiRow
} from './queries';
import type { MenuItem, MenuCategory, TableAreaRow, ReservationTable, BusinessConfig, KanbanStage } from '../types';

export interface AddReservationInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  tableId: string;
  area: string;
  guestsCount: number;
  notes?: string;
  selectedOrderItems?: Array<{ menuItemId: string; quantity: number; price: number }>;
  paymentStatus?: string;
  paymentReference?: string;
  status?: KanbanStage;
}

export interface AddReservationResponse {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  tableId: string | null;
  area: string;
  guestsCount: number;
  status: KanbanStage;
  paymentStatus: string;
  paymentReference: string | null;
  notes: string | null;
  createdAt: string;
}

export function useAddReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddReservationInput) =>
      api.post<AddReservationResponse>('/reservations', input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reservations'] });
    }
  });
}

export function useUpdateReservationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: KanbanStage }) =>
      api.patch<AddReservationResponse>(`/admin/reservations/${id}/status`, { status }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reservations'] });
    }
  });
}

export function useUpdateMenuProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (product: MenuItem) => {
      const row: Partial<MenuItemRow> & { id: string } = {
        id: product.id,
        nameEs: product.name.es,
        nameEn: product.name.en,
        descriptionEs: product.description.es,
        descriptionEn: product.description.en,
        price: String(product.price),
        category: product.category,
        image: product.image,
        fallbackImage: product.fallbackImage ?? null,
        active: product.active,
        ingredientsEs: product.ingredients.es,
        ingredientsEn: product.ingredients.en,
        isSpecial: product.isSpecial,
        preparationTime: product.preparationTime
      };
      return api.put<MenuItemRow>(`/admin/menu/${product.id}`, row);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.menu });
    }
  });
}

export interface CreateTableInput {
  id: string;
  name: { es: string; en: string };
  capacity: number;
  area: string;
  minimumConsumption: number;
}

export function useCreateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTableInput) => api.post<TableRow>('/admin/tables', input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tables });
    }
  });
}

export function useDeleteTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<null>(`/admin/tables/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tables });
    }
  });
}

export function useUpdateBusinessConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: Partial<BusinessConfig>) => {
      const row: Partial<BusinessConfigRow> = {
        name: config.name,
        location: config.location,
        locationLink: config.locationLink,
        whatsappNumber: config.whatsappNumber,
        minPeopleReservation: config.minPeopleReservation,
        maxPeopleReservation: config.maxPeopleReservation,
        schedules: config.schedules,
        timeSlots: config.timeSlots
      };
      return api.put<BusinessConfigRow>('/admin/business-config', row);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.businessConfig });
    }
  });
}

export function useCreateMenuProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (product: MenuItem) => {
      const row: Partial<MenuItemRow> & { id: string } = {
        id: product.id,
        nameEs: product.name.es,
        nameEn: product.name.en,
        descriptionEs: product.description.es,
        descriptionEn: product.description.en,
        price: String(product.price),
        category: product.category,
        image: product.image,
        fallbackImage: product.fallbackImage ?? null,
        active: product.active,
        ingredientsEs: product.ingredients.es,
        ingredientsEn: product.ingredients.en,
        isSpecial: product.isSpecial,
        preparationTime: product.preparationTime
      };
      return api.post<MenuItemRow>('/admin/menu', row);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.menu });
    }
  });
}

export function useDeleteMenuProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<null>(`/admin/menu/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.menu });
    }
  });
}

export interface SimulatePaymentInput {
  method: 'card' | 'transfer' | 'cash';
  amount: number;
  reference?: string;
}

export interface SimulatePaymentResult {
  status: 'success' | 'failed';
  reference?: string;
  reason?: string;
}

export function useSimulatePayment() {
  return useMutation({
    mutationFn: (input: SimulatePaymentInput) =>
      api.post<SimulatePaymentResult>('/payments/simulate', input)
  });
}

// ─── Menu categories CRUD ─────────────────────────────────────────────────────

export interface CreateMenuCategoryInput {
  id: string;
  name: { es: string; en: string };
  displayOrder: number;
}

export interface UpdateMenuCategoryInput {
  name?: { es?: string; en?: string };
  displayOrder?: number;
  active?: boolean;
}

export function useCreateMenuCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMenuCategoryInput) =>
      api.post<MenuCategoryRow>('/admin/menu-categories', input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.menuCategories });
    }
  });
}

export function useUpdateMenuCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMenuCategoryInput }) =>
      api.put<MenuCategoryRow>(`/admin/menu-categories/${id}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.menuCategories });
    }
  });
}

export function useDeleteMenuCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<null>(`/admin/menu-categories/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.menuCategories });
    }
  });
}

// ─── Table areas CRUD ─────────────────────────────────────────────────────────

export interface CreateTableAreaInput {
  id: string;
  name: { es: string; en: string };
  description?: { es?: string; en?: string };
  displayOrder: number;
}

export interface UpdateTableAreaInput {
  name?: { es?: string; en?: string };
  description?: { es?: string; en?: string };
  displayOrder?: number;
  active?: boolean;
}

export function useCreateTableArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTableAreaInput) =>
      api.post<TableAreaApiRow>('/admin/table-areas', input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tableAreas });
    }
  });
}

export function useUpdateTableArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTableAreaInput }) =>
      api.put<TableAreaApiRow>(`/admin/table-areas/${id}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tableAreas });
    }
  });
}

export function useDeleteTableArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<null>(`/admin/table-areas/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tableAreas });
    }
  });
}
