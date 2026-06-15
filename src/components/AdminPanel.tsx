/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MenuItem, Category, ReservationTable, Reservation, BusinessConfig, TableArea } from '../types';
import { useReservation } from '../context/ReservationContext';
import KanbanBoard from './admin/KanbanBoard';
import MenuManager from './admin/MenuManager';
import { t } from '../utils/translations';
import {
  Calendar,
  Coffee,
  DollarSign,
  Grid,
  Lock,
  Plus,
  Save,
  Trash2,
  Users,
  Edit2,
  Power,
  TrendingUp,
  Sliders,
  Check,
  X,
  Smartphone,
  MapPin,
  Clock
} from 'lucide-react';

interface AdminPanelProps {
  businessConfig: BusinessConfig;
  setBusinessConfig: React.Dispatch<React.SetStateAction<BusinessConfig>>;
  tables: ReservationTable[];
  setTables: React.Dispatch<React.SetStateAction<ReservationTable[]>>;
  menuProducts: MenuItem[];
  setMenuProducts: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  categories: Category[];
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
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

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Active sub-sections inside Admin dashboard: 'reservations' | 'menu' | 'tables' | 'settings'
  const [activeTab, setActiveTab] = useState<'reservations' | 'menu' | 'tables' | 'settings'>('reservations');

  // Table addition / editing states
  const [isAddingTable, setIsAddingTable] = useState<boolean>(false);
  const [tableForm, setTableForm] = useState<Partial<ReservationTable>>({
    id: '',
    name: { es: '', en: '' },
    capacity: 4,
    area: 'waterfall_deck',
    minimumConsumption: 10.00
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123' || password === 'chayka' || password === '1234') {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg(isEs ? 'Contraseña incorrecta. Prueba con "chayka" o "admin123"' : 'Incorrect password. Try "chayka" or "admin123"');
    }
  };

  const handleBypassDemo = () => {
    setIsAuthenticated(true);
  };

  // Tables settings CRUD
  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableForm.id || !tableForm.name?.es || !tableForm.name?.en) return;

    const newTable: ReservationTable = {
      id: tableForm.id,
      name: { es: tableForm.name.es, en: tableForm.name.en },
      capacity: Number(tableForm.capacity) || 4,
      area: (tableForm.area as TableArea) || 'waterfall_deck',
      minimumConsumption: Number(tableForm.minimumConsumption) || 0
    };

    setTables((prev) => [...prev, newTable]);
    setIsAddingTable(false);
    setTableForm({
      id: '',
      name: { es: '', en: '' },
      capacity: 4,
      area: 'waterfall_deck',
      minimumConsumption: 10.00
    });
  };

  const handleDeleteTable = (tableId: string) => {
    const confirmMsg = isEs
      ? '¿Seguro quieres eliminar esta mesa?'
      : 'Are you sure you want to delete this table?';
    if (window.confirm(confirmMsg)) {
      setTables((prev) => prev.filter((t) => t.id !== tableId));
    }
  };

  // Business config updates
  const handleUpdateSchedule = (index: number, key: 'day' | 'hours', value: string) => {
    const updatedSchedules = [...businessConfig.schedules];
    updatedSchedules[index] = { ...updatedSchedules[index], [key]: value };
    setBusinessConfig((prev) => ({ ...prev, schedules: updatedSchedules }));
  };

  const handleAddTimeSlot = (newSlot: string) => {
    if (!newSlot || businessConfig.timeSlots.includes(newSlot)) return;
    const updatedSlots = [...businessConfig.timeSlots, newSlot].sort();
    setBusinessConfig((prev) => ({ ...prev, timeSlots: updatedSlots }));
  };

  const handleRemoveTimeSlot = (slot: string) => {
    setBusinessConfig((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((s) => s !== slot)
    }));
  };

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

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 px-6" id="admin-login-wrapper">
        <div className="bg-editorial-bg border border-espresso/15 p-6 md:p-8 rounded-2xl shadow-md text-center space-y-6 text-espresso text-left">
          <div className="w-12 h-12 bg-ochre/10 border border-ochre/20 text-ochre rounded-xl flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1 text-center">
            <h3 className="text-xl font-black font-serif">
              {isEs ? 'Administración Chayka' : 'Chayka Admin Panel'}
            </h3>
            <p className="text-espresso/70 text-xs leading-relaxed">
              {isEs 
                ? 'Ingresa tus credenciales profesionales para modificar horarios, productos y mesas.' 
                : 'Enter your professional credentials to modify schedules, products, and tables.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label htmlFor="admin-passwd-input" className="block text-[10px] font-bold text-espresso/70 uppercase tracking-wider mb-1.5">
                {isEs ? 'Contraseña' : 'Password'}
              </label>
              <input
                type="password"
                required
                placeholder={isEs ? 'Contraseña de administrador' : 'Admin password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-espresso/20 text-espresso placeholder-espresso/45 py-2.5 px-3 rounded-lg text-xs focus:outline-none focus:border-ochre"
                id="admin-passwd-input"
              />
              {errorMsg && <p className="text-rose-600 text-[10px] mt-1 font-semibold">{errorMsg}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-ochre hover:bg-ochre/95 text-coffee-bg font-bold py-2.5 rounded-xl cursor-pointer text-xs uppercase tracking-wider transition-colors shadow-sm"
              id="admin-login-submit"
            >
              {isEs ? 'Iniciar Sesión' : 'Sign In'}
            </button>
          </form>

          <div className="border-t border-espresso/10 pt-5 space-y-3 text-center">
            <p className="text-espresso/50 text-[10px] leading-relaxed">
              {isEs 
                ? '¿Probando la aplicación en el editor? Presiona debajo para ingresar de forma libre sin contraseña (Acceso Demo de Prueba).' 
                : 'Testing the app in the editor? Press below to enter freely without a password (Demo Trial Access).'}
            </p>
            <button
              onClick={handleBypassDemo}
              className="px-4 py-2 bg-transparent border border-espresso/25 hover:border-espresso hover:bg-espresso/5 text-espresso rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer w-full"
              id="admin-bypass-btn"
            >
              {isEs ? 'Acceso Directo (Demo)' : 'Direct Access (Demo)'}
            </button>
          </div>
        </div>
      </div>
    );
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
          onClick={() => setIsAuthenticated(false)}
          className="bg-espresso/5 text-espresso/70 hover:text-espresso border border-espresso/10 hover:border-espresso/30 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          id="admin-logout-btn"
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
      {/* 1. RESERVATIONS MANAGER (KANBAN) */}
      {activeTab === 'reservations' && <KanbanBoard />}

      {/* 2. MENU MANAGER TAB */}
      {activeTab === 'menu' && <MenuManager categories={categories} />}

      {/* 3. TABLES / SEATING MANAGER TAB */}
      {activeTab === 'tables' && (
        <div className="space-y-6" id="admin-tables-view">
          <div className="flex justify-between items-center border-b border-espresso/15 pb-4">
            <div className="text-left">
              <h3 className="text-lg font-serif font-black text-espresso">
                {isEs ? 'Distribución de Secciones, Mesas e Ingreso' : 'Distribution of Sections, Tables, & Consumption'}
              </h3>
              <p className="text-xs text-espresso/60 mt-0.5">
                {isEs ? 'Agrega o elimina mesas de atención en tu local.' : 'Add or remove customer tables in your shop.'}
              </p>
            </div>
            {!isAddingTable && (
              <button
                onClick={() => setIsAddingTable(true)}
                className="bg-ochre hover:bg-ochre/90 text-coffee-bg text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                id="admin-new-table-btn"
              >
                <Plus className="w-4 h-4 text-coffee-bg" />
                <span>{isEs ? 'Agregar Mesa' : 'Add Table'}</span>
              </button>
            )}
          </div>

          {/* Form adding table */}
          {isAddingTable && (
            <form onSubmit={handleAddTable} className="bg-editorial-bg border border-espresso/20 p-5 rounded-2xl space-y-4 text-left shadow-sm">
              <h4 className="text-xs font-bold text-ochre uppercase tracking-widest border-b border-espresso/10 pb-2">
                {isEs ? 'Nueva Mesa de Citas' : 'New Reservation Table'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                    {isEs ? 'Identificador ID Único (Ej. t_deck_3)' : 'Unique Identifier ID (e.g. t_deck_3)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="t_deck_3"
                    value={tableForm.id}
                    onChange={(e) => setTableForm({ ...tableForm, id: e.target.value })}
                    className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2.5 px-3 text-espresso focus:outline-none focus:border-ochre"
                    id="add-table-id"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                    {isEs ? 'Nombre en Español' : 'Name in Spanish'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Mesa Mirador Cascada 3"
                    value={tableForm.name?.es || ''}
                    onChange={(e) => setTableForm({ 
                      ...tableForm, 
                      name: { es: e.target.value, en: tableForm.name?.en || '' } 
                    })}
                    className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2.5 px-3 text-espresso focus:outline-none focus:border-ochre"
                    id="add-table-name-es"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                    {isEs ? 'Nombre en Inglés' : 'Name in English'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Waterfall View Table 3"
                    value={tableForm.name?.en || ''}
                    onChange={(e) => setTableForm({ 
                      ...tableForm, 
                      name: { es: tableForm.name?.es || '', en: e.target.value } 
                    })}
                    className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2.5 px-3 text-espresso focus:outline-none focus:border-ochre"
                    id="add-table-name-en"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                    {isEs ? 'Zona / Área Geográfica' : 'Area / Location'}
                  </label>
                  <select
                    value={tableForm.area}
                    onChange={(e) => setTableForm({ ...tableForm, area: e.target.value as TableArea })}
                    className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2.5 px-3 text-espresso focus:outline-none focus:border-ochre cursor-pointer"
                    id="add-table-area"
                  >
                    <option value="waterfall_deck">{isEs ? 'Terraza Cascada (Premium)' : 'Waterfall Deck (Premium)'}</option>
                    <option value="fireplace_cozy">{isEs ? 'Rincón Chimenea' : 'Cozy Fireplace'}</option>
                    <option value="indoor_premium">{isEs ? 'Salón Chayka Ancestral' : 'Premium Chayka Hall'}</option>
                    <option value="terrace_panoramic">{isEs ? 'Mirador del Cóndor / Terraza' : 'Condor View Terrace'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                    {isEs ? 'Capacidad de Comensales (Pax)' : 'Seating Capacity (Guests)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) })}
                    className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2.5 px-3 text-espresso focus:outline-none focus:border-ochre"
                    id="add-table-cap"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                    {isEs ? 'Consumo Mínimo de Alimentos (USD)' : 'Minimum Required Consumption (USD)'}
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    required
                    value={tableForm.minimumConsumption}
                    onChange={(e) => setTableForm({ ...tableForm, minimumConsumption: parseFloat(e.target.value) })}
                    className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2.5 px-3 text-espresso focus:outline-none focus:border-ochre"
                    id="add-table-minfee"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-espresso/10">
                <button
                  type="button"
                  onClick={() => setIsAddingTable(false)}
                  className="px-4 py-2 bg-espresso/5 hover:bg-espresso/10 text-espresso border border-espresso/20 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {isEs ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-ochre hover:bg-ochre/90 text-coffee-bg font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                  id="add-table-submit"
                >
                  <Save className="w-3.5 h-3.5 text-coffee-bg" />
                  <span>{isEs ? 'Guardar Mesa' : 'Save Table'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Table List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="admin-table-management-list">
            {tables.map((table) => {
              const areaLabel = t(`booking.tableSelector.areas.${table.area}`, language);
              return (
                <div
                  key={table.id}
                  className="bg-white border border-espresso/15 p-4 rounded-xl flex justify-between items-center shadow-sm hover:border-espresso/35 transition-all text-left"
                  id={`admin-table-row-${table.id}`}
                >
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase font-mono font-black text-ochre">{table.id}</div>
                    <h4 className="text-xs font-bold text-espresso">{table.name[language]}</h4>
                    <div className="flex flex-wrap gap-1.5 text-[9px] text-espresso/50 font-bold uppercase tracking-wider mt-1">
                      <span>Pax: {table.capacity}</span>
                      <span>•</span>
                      <span>Min: ${table.minimumConsumption.toFixed(2)}</span>
                      <span>•</span>
                      <span className="text-ochre truncate max-w-[100px]">{areaLabel}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTable(table.id)}
                    className="p-1.5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 rounded-lg border border-rose-500/10 hover:border-rose-500/20 transition cursor-pointer"
                    title={isEs ? 'Eliminar Mesa' : 'Delete Table'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SETTINGS & CALENDAR TAB */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="admin-settings-view">
          {/* General Business Information Settings */}
          <div className="bg-white border border-espresso/15 p-5 rounded-2xl space-y-4 text-left shadow-sm">
            <h3 className="text-sm font-bold text-ochre uppercase tracking-widest border-b border-espresso/10 pb-2 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-ochre" />
              <span>{isEs ? 'General e Integración WhatsApp' : 'General & WhatsApp Integration'}</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                  {isEs ? 'Número de Atención WhatsApp (Link Destino directo)' : 'WhatsApp Business Number (Direct link format)'}
                </label>
                <input
                  type="text"
                  required
                  value={businessConfig.whatsappNumber}
                  onChange={(e) => setBusinessConfig({ ...businessConfig, whatsappNumber: e.target.value })}
                  className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2.5 px-3 text-espresso focus:outline-none focus:border-ochre"
                  id="admin-conf-wa"
                />
                <p className="text-[10px] text-espresso/50 mt-1 leading-normal italic">
                  {isEs 
                    ? 'Inserta el número en formato internacional con código de país (Ej. +593987654321 para Ecuador).' 
                    : 'Insert the number in international format with country code (e.g., +593987654321 for Ecuador).'}
                </p>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                  {isEs ? 'Lugar Geográfico' : 'Geographic Location'}
                </label>
                <input
                  type="text"
                  required
                  value={businessConfig.location}
                  onChange={(e) => setBusinessConfig({ ...businessConfig, location: e.target.value })}
                  className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2.5 px-3 text-espresso focus:outline-none focus:border-ochre"
                  id="admin-conf-loc"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                  {isEs ? 'Enlace a Google Maps pin' : 'Google Maps Pin Link'}
                </label>
                <input
                  type="text"
                  required
                  value={businessConfig.locationLink}
                  onChange={(e) => setBusinessConfig({ ...businessConfig, locationLink: e.target.value })}
                  className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2.5 px-3 text-espresso focus:outline-none focus:border-ochre"
                  id="admin-conf-loclink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                    {isEs ? 'Min Pax por Cita' : 'Min Guests per Booking'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={businessConfig.minPeopleReservation}
                    onChange={(e) => setBusinessConfig({ ...businessConfig, minPeopleReservation: parseInt(e.target.value) })}
                    className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre"
                    id="admin-conf-min"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                    {isEs ? 'Max Pax por Cita' : 'Max Guests per Booking'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={businessConfig.maxPeopleReservation}
                    onChange={(e) => setBusinessConfig({ ...businessConfig, maxPeopleReservation: parseInt(e.target.value) })}
                    className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre"
                    id="admin-conf-max"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Time Slots & Business hours Settings */}
          <div className="space-y-6">
            <div className="bg-white border border-espresso/15 p-5 rounded-2xl space-y-4 text-left shadow-sm">
              <h3 className="text-sm font-bold text-ochre uppercase tracking-widest border-b border-espresso/10 pb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-ochre" />
                <span>{isEs ? 'Horarios Semanales Abiertos' : 'Weekly Business Hours'}</span>
              </h3>

              <div className="space-y-3">
                {businessConfig.schedules.map((sched, idx) => (
                  <div key={idx} className="flex gap-2.5 items-center" id={`admin-sched-row-${idx}`}>
                    <input
                      type="text"
                      value={sched.day}
                      onChange={(e) => handleUpdateSchedule(idx, 'day', e.target.value)}
                      className="bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre w-1/3"
                    />
                    <input
                      type="text"
                      value={sched.hours}
                      onChange={(e) => handleUpdateSchedule(idx, 'hours', e.target.value)}
                      className="bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre flex-grow"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Available time slots */}
            <div className="bg-white border border-espresso/15 p-5 rounded-2xl space-y-4 text-left shadow-sm">
              <h3 className="text-sm font-bold text-ochre uppercase tracking-widest border-b border-espresso/10 pb-2 flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-ochre" />
                <span>{isEs ? 'Bloques Horarios Disponibles' : 'Available Booking Slots'}</span>
              </h3>

              <div className="flex flex-wrap gap-1.5">
                {businessConfig.timeSlots.map((slot) => (
                  <span
                    key={slot}
                    className="bg-espresso/5 text-espresso text-xs px-2.5 py-1 rounded-xl border border-espresso/10 flex items-center gap-1.5 font-mono"
                    id={`admin-slot-tag-${slot.replace(':', '-')}`}
                  >
                    <span>{slot} HS</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTimeSlot(slot)}
                      className="text-espresso/40 hover:text-rose-600 font-extrabold cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add slot simple input */}
              <div className="flex gap-2.5 pt-2 border-t border-espresso/10 text-left">
                <input
                  type="text"
                  placeholder={isEs ? 'Ej. 13:30 (formato 24h)' : 'e.g. 13:30 (24h format)'}
                  maxLength={5}
                  id="admin-new-timeslot-input"
                  className="bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre flex-grow font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        handleAddTimeSlot(val);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('admin-new-timeslot-input') as HTMLInputElement | null;
                    if (el && el.value.trim()) {
                      handleAddTimeSlot(el.value.trim());
                      el.value = '';
                    }
                  }}
                  className="bg-espresso text-coffee-bg hover:bg-espresso/90 border border-transparent text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  {isEs ? 'Agregar Bloque' : 'Add Slot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
