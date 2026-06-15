/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type Dispatch, type SetStateAction } from 'react';
import { MenuItem, Category, ReservationTable, Reservation, BusinessConfig } from '../types';
import { useReservation } from '../context/ReservationContext';
import { useAdminAuth, useAdminLogout } from '../lib/queries';
import { useQueryClient } from '@tanstack/react-query';
import KanbanBoard from './admin/KanbanBoard';
import MenuManager from './admin/MenuManager';
import AdminLogin from './admin/AdminLogin';
import TablesManager from './admin/TablesManager';
import SettingsPanel from './admin/SettingsPanel';
import {
  Calendar,
  Coffee,
  TrendingUp,
  Power,
  Clock
} from 'lucide-react';

interface AdminPanelProps {
  businessConfig: BusinessConfig;
  setBusinessConfig: Dispatch<SetStateAction<BusinessConfig>>;
  tables: ReservationTable[];
  setTables: Dispatch<SetStateAction<ReservationTable[]>>;
  menuProducts: MenuItem[];
  setMenuProducts: Dispatch<SetStateAction<MenuItem[]>>;
  categories: Category[];
  reservations: Reservation[];
  setReservations: Dispatch<SetStateAction<Reservation[]>>;
}

export default function AdminPanel({
  businessConfig,
  setBusinessConfig,
  tables,
  setTables,
  menuProducts,
  setMenuProducts,
  categories,
  reservations,
  setReservations
}: AdminPanelProps) {
  const { language } = useReservation();
  const isEs = language === 'es';

  const qc = useQueryClient();
  const { data: authData, isLoading: authLoading } = useAdminAuth();
  const logoutMutation = useAdminLogout();

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
  const [activeTab, setActiveTab] = useState<'reservations' | 'menu' | 'tables' | 'settings'>('reservations');

  // Computations for dashboard overview cards
  const totalRevenueSimulated = reservations
    .filter((r) => ['simulated_paid', 'success'].includes(r.paymentStatus) && r.status !== 'cancelled')
    .reduce((sum, r) => {
      const tbl = tables.find((t) => t.id === r.tableId);
      const minFee = tbl?.minimumConsumption || 0;
      let preFee = 0;
      if (r.selectedOrderItems) {
        preFee = r.selectedOrderItems.reduce((acc, current) => acc + current.price * current.quantity, 0);
      }
      return sum + Math.max(minFee, preFee);
    }, 0);

  const pendingConfirmations = reservations.filter((r) => r.status === 'pending').length;

  const tabLabels = {
    reservations: isEs ? 'Tablero Kanban' : 'Kanban Board',
    menu: isEs ? 'Gestor de Menú' : 'Menu Manager',
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="admin-kpis-grid">
        <div className="bg-white border border-espresso/15 p-4 rounded-xl flex items-center gap-3 shadow-sm text-left">
          <div className="p-3 bg-ochre/10 text-ochre rounded-lg border border-ochre/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-espresso/60 uppercase font-bold tracking-wider">
              {isEs ? 'Reservas Totales' : 'Total Bookings'}
            </span>
            <p className="text-2xl font-black font-serif text-espresso mt-0.5">{reservations.length}</p>
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
            <p className="text-2xl font-black font-serif text-espresso mt-0.5">{menuProducts.length}</p>
          </div>
        </div>
      </div>

      {/* Nav Tabs for Admin view */}
      <div className="flex border-b border-espresso/15 gap-2 overflow-x-auto pb-1">
        {(Object.keys(tabLabels) as Array<keyof typeof tabLabels>).map((tabId) => {
          let count: number | undefined = undefined;
          if (tabId === 'reservations') count = reservations.length;
          if (tabId === 'menu') count = menuProducts.length;
          if (tabId === 'tables') count = tables.length;

          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`px-4 py-2 border-b-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === tabId
                  ? 'border-ochre text-ochre pb-1'
                  : 'border-transparent text-espresso/60 hover:text-espresso hover:border-espresso/20'
              }`}
              id={`admin-tab-${tabId}`}
            >
              {tabLabels[tabId]}
              {count !== undefined && (
                <span className="ml-1.5 text-[9px] bg-espresso/5 text-espresso/70 px-1.5 py-0.5 rounded-full font-bold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'reservations' && <KanbanBoard />}
      {activeTab === 'menu' && <MenuManager categories={categories} />}
      {activeTab === 'tables' && <TablesManager tables={tables} setTables={setTables} />}
      {activeTab === 'settings' && <SettingsPanel businessConfig={businessConfig} setBusinessConfig={setBusinessConfig} />}
    </div>
  );
}
