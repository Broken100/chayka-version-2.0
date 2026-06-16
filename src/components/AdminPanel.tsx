/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Category } from '../types';
import { useReservation } from '../context/ReservationContext';
import { useAdminAuth, useAdminLogout, useReservationsQuery, useTablesQuery, useMenuQuery, useBusinessConfigQuery, useNotificationsQuery, countInService } from '../lib/queries';
import { useQueryClient } from '@tanstack/react-query';
import KanbanBoard from './admin/KanbanBoard';
import MenuManager from './admin/MenuManager';
import AdminLogin from './admin/AdminLogin';
import TablesManager from './admin/TablesManager';
import SettingsPanel from './admin/SettingsPanel';
import CategoryManager from './admin/CategoryManager';
import NotificationHistory from './admin/NotificationHistory';
import {
  Calendar,
  Coffee,
  TrendingUp,
  Power,
  Clock,
  Bell,
  Utensils
} from 'lucide-react';

interface AdminPanelProps {
  categories?: Category[];
}

export default function AdminPanel({ categories }: AdminPanelProps) {
  const { language } = useReservation();
  const isEs = language === 'es';

  const qc = useQueryClient();
  const { data: authData, isLoading: authLoading } = useAdminAuth();
  const logoutMutation = useAdminLogout();
  const reservationsQuery = useReservationsQuery();
  const tablesQuery = useTablesQuery();
  const menuQuery = useMenuQuery();
  const notificationsQuery = useNotificationsQuery({ limit: 50 });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const authenticated = authData?.authenticated ?? isAuthenticated;

  const handleSignOut = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        void qc.removeQueries({ queryKey: ['admin', 'me'] });
        setIsAuthenticated(false);
      }
    });
  };

  // Active sub-sections inside Admin dashboard
  const [activeTab, setActiveTab] = useState<'reservations' | 'notifications' | 'menu' | 'categories' | 'tables' | 'settings'>('reservations');

  // Computations for dashboard overview cards
  const reservationsData = reservationsQuery.data ?? [];
  const tablesData = tablesQuery.data ?? [];
  const menuProductsData = menuQuery.data ?? [];
  const notificationsData = notificationsQuery.data ?? [];
  const totalRevenueSimulated = reservationsData
    .filter((r) => ['simulated_paid', 'success'].includes(r.paymentStatus) && r.status !== 'cancelled')
    .reduce((sum, r) => {
      const tbl = tablesData.find((t) => t.id === r.tableId);
      const minFee = tbl?.minimumConsumption || 0;
      let preFee = 0;
      if (r.selectedOrderItems) {
        preFee = r.selectedOrderItems.reduce((acc, current) => acc + current.price * current.quantity, 0);
      }
      return sum + Math.max(minFee, preFee);
    }, 0);

  const pendingConfirmations = reservationsData.filter((r) => r.status === 'pending').length;
  const inServiceCount = countInService(reservationsData);
  const unreadNotifications = notificationsData.filter((n) => n.dismissedAt === null).length;

  const tabLabels = {
    reservations: isEs ? 'Tablero Kanban' : 'Kanban Board',
    notifications: isEs ? 'Notificaciones' : 'Notifications',
    menu: isEs ? 'Gestor de Menú' : 'Menu Manager',
    categories: isEs ? 'Categorías' : 'Categories',
    tables: isEs ? 'Mesas y Zonas' : 'Tables & Areas',
    settings: isEs ? 'Configuración' : 'Settings'
  };

  if (authLoading) {
    return (
      <div className="animate-pulse text-espresso/60 py-12 text-center" data-testid="admin-auth-loading">
        <span className="text-sm font-medium">
          {isEs ? 'Cargando…' : 'Loading…'}
        </span>
      </div>
    );
  }

  if (!authenticated) {
    return <AdminLogin onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="space-y-8 text-left text-espresso" id="admin-panel-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-espresso/10 pb-5">
        <div>
          <span className="text-ochre font-bold text-[10px] uppercase tracking-widest block">
            {isEs ? 'Consola Profesional' : 'Professional Console'}
          </span>
          <h2 className="text-3xl font-black font-serif flex items-center gap-2">
            <span>{isEs ? 'Panel de Administración' : 'Administration Board'}</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-sans font-extrabold tracking-wider text-left">
              {isEs ? 'Activo' : 'Live'}
            </span>
          </h2>
          <p className="text-espresso/60 text-xs mt-1">
            {isEs
              ? 'Modifica y visualiza toda la estructura interactiva de Chayka Coffee.'
              : 'Modify and visualize all interactive structure of Chayka Coffee.'}
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="bg-espresso/5 text-espresso/70 hover:text-espresso border border-espresso/10 hover:border-espresso/30 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
          id="admin-logout-btn"
          disabled={logoutMutation.isPending}
        >
          <Power className="w-4 h-4 text-rose-600" />
          <span>{isEs ? 'Cerrar Sesión' : 'Sign Out'}</span>
        </button>
      </div>

      {/* KPI Stats widgets block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="admin-kpis-grid">
        <div className="bg-white border border-espresso/15 p-4 rounded-xl flex items-center gap-3 shadow-sm text-left">
          <div className="p-3 bg-ochre/10 text-ochre rounded-lg border border-ochre/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-espresso/60 uppercase font-bold tracking-wider">
              {isEs ? 'Reservas Totales' : 'Total Bookings'}
            </span>
            <p className="text-2xl font-black font-serif text-espresso mt-0.5">{reservationsData.length}</p>
          </div>
        </div>

        <div className="bg-white border border-espresso/15 p-4 rounded-xl flex items-center gap-3 shadow-sm text-left">
          <div className="p-3 bg-amber-500/10 text-amber-800 rounded-lg border border-amber-500/20">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-espresso/60 uppercase font-bold tracking-wider">
              {isEs ? 'Pendientes de Pago' : 'Pending Confirmation'}
            </span>
            <p className="text-2xl font-black font-serif text-amber-800 mt-0.5">{pendingConfirmations}</p>
          </div>
        </div>

        <div
          className="bg-white border border-espresso/15 p-4 rounded-xl flex items-center gap-3 shadow-sm text-left"
          id="kpi-in-service"
        >
          <div className="p-3 bg-blue-500/10 text-blue-800 rounded-lg border border-blue-500/20">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-espresso/60 uppercase font-bold tracking-wider">
              {isEs ? 'En Servicio' : 'Currently In Service'}
            </span>
            <p className="text-2xl font-black font-serif text-blue-800 mt-0.5">{inServiceCount}</p>
          </div>
        </div>

        <div className="bg-white border border-espresso/15 p-4 rounded-xl flex items-center gap-3 shadow-sm text-left">
          <div className="p-3 bg-emerald-500/10 text-emerald-800 rounded-lg border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-espresso/60 uppercase font-bold tracking-wider">
              {isEs ? 'Ingreso Estimado' : 'Estimated Revenue'}
            </span>
            <p className="text-2xl font-black font-serif text-emerald-800 mt-0.5">${totalRevenueSimulated.toFixed(2)} USD</p>
          </div>
        </div>

        <div className="bg-white border border-espresso/15 p-4 rounded-xl flex items-center gap-3 shadow-sm text-left">
          <div className="p-3 bg-espresso/5 text-espresso rounded-lg border border-espresso/10">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-espresso/60 uppercase font-bold tracking-wider">
              {isEs ? 'Platos Digitales' : 'Digital Menu Items'}
            </span>
            <p className="text-2xl font-black font-serif text-espresso mt-0.5">{menuProductsData.length}</p>
          </div>
        </div>
      </div>

      {/* Nav Tabs for Admin view */}
      <div className="flex border-b border-espresso/15 gap-2 overflow-x-auto pb-1">
        {(Object.keys(tabLabels) as Array<keyof typeof tabLabels>).map((tabId) => {
          let count: number | undefined = undefined;
          if (tabId === 'reservations') count = reservationsData.length;
          if (tabId === 'menu') count = menuProductsData.length;
          if (tabId === 'tables') count = tablesData.length;
          if (tabId === 'notifications') count = unreadNotifications;

          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`px-4 py-2 border-b-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tabId
                  ? 'border-ochre text-ochre pb-1'
                  : 'border-transparent text-espresso/60 hover:text-espresso hover:border-espresso/20'
              }`}
              id={`admin-tab-${tabId}`}
            >
              {tabId === 'notifications' && <Bell className="w-3.5 h-3.5" />}
              {tabLabels[tabId]}
              {count !== undefined && (
                <span className="text-[9px] bg-espresso/5 text-espresso/70 px-1.5 py-0.5 rounded-full font-bold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'reservations' && <KanbanBoard />}
      {activeTab === 'notifications' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-espresso/60">
            <Bell className="w-4 h-4 text-ochre" />
            <span>
              {isEs
                ? 'Registro de eventos del sistema. Haz clic en "Descartar" para marcarlos como leídos.'
                : 'System event log. Click "Dismiss" to mark them as read.'}
            </span>
          </div>
          <NotificationHistory />
        </div>
      )}
      {activeTab === 'menu' && <MenuManager categories={categories} />}
      {activeTab === 'categories' && <CategoryManager />}
      {activeTab === 'tables' && <TablesManager />}
      {activeTab === 'settings' && <SettingsPanel />}
    </div>
  );
}
