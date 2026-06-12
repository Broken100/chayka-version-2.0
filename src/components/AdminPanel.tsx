/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MenuItem, Category, ReservationTable, Reservation, BusinessConfig, TableArea } from '../types';
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Active sub-sections inside Admin dashboard: 'reservations' | 'menu' | 'tables' | 'settings'
  const [activeTab, setActiveTab] = useState<'reservations' | 'menu' | 'tables' | 'settings'>('reservations');

  // Product addition / editing states
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  const [productForm, setProductForm] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 3.00,
    category: 'specialty_coffee',
    image: '',
    ingredients: [],
    isSpecial: false,
    active: true,
    preparationTime: 5
  });
  const [ingredientsText, setIngredientsText] = useState<string>('');

  // Table addition / editing states
  const [isAddingTable, setIsAddingTable] = useState<boolean>(false);
  const [tableForm, setTableForm] = useState<Partial<ReservationTable>>({
    id: '',
    name: '',
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
      setErrorMsg('Contraseña incorrecta. Prueba con "chayka" o "admin123"');
    }
  };

  // Demo bypass log-in function
  const handleBypassDemo = () => {
    setIsAuthenticated(true);
  };

  // Status changers
  const handleUpdateReservationStatus = (resId: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status } : r))
    );
  };

  const handleUpdateReservationPayment = (resId: string, paymentStatus: 'unpaid' | 'simulated_paid') => {
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, paymentStatus } : r))
    );
  };

  const handleDeleteReservation = (resId: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta reservación?')) {
      setReservations((prev) => prev.filter((r) => r.id !== resId));
    }
  };

  // Digital menu CRUD
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const ingredientsArr = ingredientsText
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    if (editingProduct) {
      // Edit
      setMenuProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? ({
                ...p,
                ...productForm,
                ingredients: ingredientsArr
              } as MenuItem)
            : p
        )
      );
      setEditingProduct(null);
    } else {
      // Add new
      const newId = 'prodID_' + Date.now();
      const newProd: MenuItem = {
        id: newId,
        name: productForm.name || 'Nuevo Producto',
        description: productForm.description || '',
        price: Number(productForm.price) || 0,
        category: productForm.category || 'specialty_coffee',
        image: productForm.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600',
        ingredients: ingredientsArr,
        isSpecial: !!productForm.isSpecial,
        active: productForm.active !== false,
        preparationTime: Number(productForm.preparationTime) || 5
      };
      setMenuProducts((prev) => [newProd, ...prev]);
      setIsAddingProduct(false);
    }

    // Reset formulation
    setProductForm({
      name: '',
      description: '',
      price: 3.00,
      category: 'specialty_coffee',
      image: '',
      ingredients: [],
      isSpecial: false,
      active: true,
      preparationTime: 5
    });
    setIngredientsText('');
  };

  const startEditProduct = (p: MenuItem) => {
    setEditingProduct(p);
    setProductForm(p);
    setIngredientsText(p.ingredients.join(', '));
    setIsAddingProduct(false);
    // Scroll block up slightly or focus
  };

  const handleDeleteProduct = (prodId: string) => {
    if (window.confirm('¿Deseas de verdad dar de baja este producto del menú?')) {
      setMenuProducts((prev) => prev.filter((p) => p.id !== prodId));
    }
  };

  // Tables settings CRUD
  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableForm.id || !tableForm.name) return;

    const newTable: ReservationTable = {
      id: tableForm.id,
      name: tableForm.name,
      capacity: Number(tableForm.capacity) || 4,
      area: (tableForm.area as TableArea) || 'waterfall_deck',
      minimumConsumption: Number(tableForm.minimumConsumption) || 0
    };

    setTables((prev) => [...prev, newTable]);
    setIsAddingTable(false);
    setTableForm({
      id: '',
      name: '',
      capacity: 4,
      area: 'waterfall_deck',
      minimumConsumption: 10.00
    });
  };

  const handleDeleteTable = (tableId: string) => {
    if (window.confirm('¿Seguro quieres eliminar esta mesa?')) {
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
    // Keep slots sorted
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
    .filter((r) => r.paymentStatus === 'simulated_paid' && r.status !== 'cancelled')
    .reduce((sum, r) => {
      // Find table rate
      const tbl = tables.find((t) => t.id === r.tableId);
      const minFee = tbl?.minimumConsumption || 0;
      // Pre-order rate
      let preFee = 0;
      if (r.selectedOrderItems) {
        preFee = r.selectedOrderItems.reduce((acc, current) => acc + current.price * current.quantity, 0);
      }
      return sum + Math.max(minFee, preFee);
    }, 0);

  const pendingConfirmations = reservations.filter((r) => r.status === 'pending').length;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 px-6" id="admin-login-wrapper">
        <div className="bg-stone-900 border border-stone-850 p-6 md:p-8 rounded-2xl shadow-xl text-center space-y-6">
          <div className="w-12 h-12 bg-amber-950/40 border border-amber-600/50 text-amber-500 rounded-xl flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif text-stone-100">Administración Chayka</h3>
            <p className="text-stone-400 text-xs mt-1">
              Ingresa tus credenciales profesionales para modificar horarios, productos y mesas.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Contraseña</label>
              <input
                type="password"
                required
                placeholder="Inserta contraseña de administrador"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 text-stone-200 placeholder-stone-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:border-amber-700"
                id="admin-passwd-input"
              />
              {errorMsg && <p className="text-rose-400 text-[10px] mt-1 font-semibold">{errorMsg}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-amber-800 hover:bg-amber-700 text-stone-50 font-bold py-2.5 rounded-xl cursor-pointer text-xs uppercase tracking-wider transition-colors"
              id="admin-login-submit"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="border-t border-stone-850 pt-5 space-y-3">
            <p className="text-stone-500 text-[11px]">
              ¿Probando la aplicación en el editor? Presiona debajo para ingresar de forma libre sin contraseña (Acceso Demo de Prueba).
            </p>
            <button
              onClick={handleBypassDemo}
              className="px-4 py-2 bg-stone-950 border border-stone-800 hover:border-amber-800 text-amber-500 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer w-full"
              id="admin-bypass-btn"
            >
              Acceso Directo (Demo)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left" id="admin-panel-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-850 pb-5">
        <div>
          <span className="text-amber-500 font-semibold text-xs uppercase tracking-widest block">Consola Profesional</span>
          <h2 className="text-3xl font-bold font-serif text-stone-100 flex items-center gap-2">
            <span>Panel de Administración</span>
            <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded uppercase font-sans">
              Activo
            </span>
          </h2>
          <p className="text-stone-400 text-xs mt-1">
            Modifica y visualiza toda la estructura interactiva de Chayka Coffee.
          </p>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="bg-black/40 text-stone-400 hover:text-stone-200 border border-stone-800/80 px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          id="admin-logout-btn"
        >
          <Power className="w-4 h-4 text-rose-500" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* KPI Stats widgets block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="admin-kpis-grid">
        <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-amber-950/40 text-amber-500 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 uppercase font-semibold">Total Citas</span>
            <p className="text-2xl font-bold text-stone-100 mt-0.5">{reservations.length}</p>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-yellow-950/40 text-yellow-500 rounded-lg">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 uppercase font-semibold">Pendientes Confirmación</span>
            <p className="text-2xl font-bold text-yellow-400 mt-0.5">{pendingConfirmations}</p>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-emerald-950/40 text-emerald-400 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 uppercase font-semibold">Ingreso Estimado</span>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">${totalRevenueSimulated.toFixed(2)} USD</p>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-stone-950 text-amber-600 rounded-lg">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 uppercase font-semibold">Platos Digitales</span>
            <p className="text-2xl font-bold text-stone-100 mt-0.5">{menuProducts.length}</p>
          </div>
        </div>
      </div>

      {/* Nav Tabs for Admin view */}
      <div className="flex border-b border-stone-850 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'reservations', label: 'Gestión Citas', count: reservations.length },
          { id: 'menu', label: 'Menú Digital', count: menuProducts.length },
          { id: 'tables', label: 'Mesas / Zonas', count: tables.length },
          { id: 'settings', label: 'Horarios / Config' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 border-b-2 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-amber-600 text-amber-500'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
            id={`admin-tab-${tab.id}`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-[9px] bg-stone-950 text-stone-400 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE TAB */}
      {/* 1. RESERVATIONS MANAGER */}
      {activeTab === 'reservations' && (
        <div className="space-y-4" id="admin-reservations-view">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-serif font-semibold text-stone-100">Bitácora de Clientes & Reservas</h3>
            <button
              onClick={() => {
                if (window.confirm('¿Deseas vaciar la simulación para crear un registro limpio?')) {
                  setReservations([]);
                }
              }}
              className="text-stone-500 hover:text-rose-400 text-xs flex items-center gap-1.5 cursor-pointer transition"
              id="admin-clear-bookings-btn"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpiar Simulados</span>
            </button>
          </div>

          <div className="bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-300">
                <thead className="bg-stone-950 text-stone-400 text-xs uppercase tracking-wider border-b border-stone-850">
                  <tr>
                    <th className="py-3 px-4">Código / Cliente</th>
                    <th className="py-3 px-4">Fecha & Hora</th>
                    <th className="py-3 px-4">Mesa / Personas</th>
                    <th className="py-3 px-4">Pago</th>
                    <th className="py-3 px-4">Estado Cita</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-850">
                  {reservations.map((res) => {
                    const tableInfo = tables.find((t) => t.id === res.tableId);
                    return (
                      <tr key={res.id} className="hover:bg-stone-850/30 transition-colors" id={`admin-res-row-${res.id}`}>
                        <td className="py-4 px-4 space-y-1">
                          <div className="font-mono text-[10px] text-amber-500 font-bold uppercase">{res.id}</div>
                          <div className="text-stone-200 font-medium">{res.customerName}</div>
                          <div className="text-[11px] text-stone-500 font-mono">{res.customerPhone}</div>
                        </td>

                        <td className="py-4 px-4 space-y-1">
                          <div className="font-semibold text-xs text-stone-200">{res.date}</div>
                          <div className="text-stone-400 text-xs">{res.timeSlot} hs</div>
                        </td>

                        <td className="py-4 px-4 space-y-1">
                          <div className="text-stone-300 font-medium text-xs">{tableInfo?.name || res.tableId}</div>
                          <div className="text-[10px] text-stone-500 uppercase tracking-widest">{res.guestsCount} Invitados</div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border text-center w-28 ${
                                res.paymentStatus === 'simulated_paid'
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                                  : 'bg-stone-950 text-stone-500 border-stone-800'
                              }`}
                            >
                              {res.paymentStatus === 'simulated_paid' ? '● Pagado Online' : 'Pagar en Local'}
                            </span>
                            {res.paymentStatus !== 'simulated_paid' && (
                              <button
                                onClick={() => handleUpdateReservationPayment(res.id, 'simulated_paid')}
                                className="text-[9px] text-stone-400 hover:text-amber-500 text-left font-semibold cursor-pointer underline"
                              >
                                Forzar a Pagado
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-[9.5px] uppercase font-bold px-2 py-0.5 rounded border ${
                                res.status === 'confirmed'
                                  ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40'
                                  : res.status === 'cancelled'
                                  ? 'bg-rose-950/30 text-rose-400 border-rose-900/30'
                                  : 'bg-amber-950/20 text-amber-500 border-amber-900/20'
                              }`}
                            >
                              {res.status === 'confirmed' && 'Confirmada'}
                              {res.status === 'pending' && 'Pendiente'}
                              {res.status === 'cancelled' && 'Anulada'}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {res.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateReservationStatus(res.id, 'confirmed')}
                                className="bg-emerald-800/20 hover:bg-emerald-700 text-emerald-400 p-1.5 rounded-lg border border-emerald-800/40 cursor-pointer"
                                title="Confirmar Reserva"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {res.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateReservationStatus(res.id, 'cancelled')}
                                className="bg-rose-950/35 hover:bg-rose-900 text-rose-400 p-1.5 rounded-lg border border-rose-900/20 cursor-pointer"
                                title="Cancelar Reserva"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteReservation(res.id)}
                              className="text-stone-500 hover:text-rose-400 p-1.5 cursor-pointer"
                              title="Borrar Registro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {reservations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-500">
                        No hay reservaciones ingresadas en este momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. MENU MANAGER TAB */}
      {activeTab === 'menu' && (
        <div className="space-y-6" id="admin-menu-view">
          <div className="flex justify-between items-center border-b border-stone-850 pb-4">
            <h3 className="text-lg font-serif font-semibold text-stone-100">Editor Digital de Productos</h3>
            {!isAddingProduct && !editingProduct && (
              <button
                onClick={() => {
                  setIsAddingProduct(true);
                  setEditingProduct(null);
                }}
                className="bg-amber-800 hover:bg-amber-700 text-stone-50 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-amber-950/25"
                id="admin-add-product-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Producto</span>
              </button>
            )}
          </div>

          {/* Form container for adding or editing product */}
          {(isAddingProduct || editingProduct) && (
            <form onSubmit={handleSaveProduct} className="bg-stone-900 border border-stone-850 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-stone-850 pb-3 mb-2">
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                  {editingProduct ? `Editar: ${editingProduct.name}` : 'Crear Nuevo Elemento de Menú'}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProduct(null);
                  }}
                  className="text-stone-500 hover:text-stone-300 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1 uppercase font-semibold">Nombre del Plato/Bebida</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Espumoso de Peguche"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg text-xs py-2.5 px-3 text-stone-250 focus:outline-none"
                    id="edit-prod-name"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1 uppercase font-semibold">Precio (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg text-xs py-2.5 px-3 text-stone-250 focus:outline-none"
                    id="edit-prod-price"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1 uppercase font-semibold">Categoría del Menú</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg text-xs py-2.5 px-3 text-stone-300 focus:outline-none"
                    id="edit-prod-cat"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1 uppercase font-semibold">Tiempo de Preparación (Minutos)</label>
                  <input
                    type="number"
                    required
                    value={productForm.preparationTime}
                    onChange={(e) => setProductForm({ ...productForm, preparationTime: parseInt(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg text-xs py-2.5 px-3 text-stone-250 focus:outline-none"
                    id="edit-prod-time"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1 uppercase font-semibold">Enlace de Imagen (URL)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg text-xs py-2.5 px-3 text-stone-250 focus:outline-none"
                  id="edit-prod-image"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1 uppercase font-semibold">Descripción del Producto</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Vívida narración de sabores autóctonos, guarnición y porciones..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg text-xs py-2 px-3 text-stone-250 focus:outline-none resize-none"
                  id="edit-prod-desc"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1 uppercase font-semibold">Ingredientes (Separados por comas)</label>
                <input
                  type="text"
                  placeholder="Maíz, Queso tierno, Huevo, Panela de Choclo, Canela"
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg text-xs py-2.5 px-3 text-stone-250 focus:outline-none"
                  id="edit-prod-ing"
                />
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs text-stone-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isSpecial}
                    onChange={(e) => setProductForm({ ...productForm, isSpecial: e.target.checked })}
                    className="w-4 h-4 accent-amber-700"
                  />
                  <span>¿Es Firma de Chayka Coffee (Destacado Dorado)?</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-stone-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.active}
                    onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })}
                    className="w-4 h-4 accent-amber-700"
                  />
                  <span>¿Ingrediente/Plato Disponible para Vender?</span>
                </label>
              </div>

              <div className="pt-3 border-t border-stone-850 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200 rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-800 hover:bg-amber-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  id="save-prod-btn"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardas Cambios</span>
                </button>
              </div>
            </form>
          )}

          {/* List layout of digital products for admin control */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="admin-product-management-list">
            {menuProducts.map((p) => (
              <div
                key={p.id}
                className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex gap-3 justify-between items-start"
                id={`admin-prod-card-${p.id}`}
              >
                <div className="flex gap-3 min-w-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-stone-200 truncate flex items-center gap-1">
                      <span>{p.name}</span>
                      {p.isSpecial && <span className="text-[9px] bg-amber-950 text-amber-500 border border-amber-800 px-1 rounded font-normal font-sans">Especial</span>}
                    </h4>
                    <p className="text-[11px] text-amber-500 font-semibold font-mono mt-0.5">${p.price.toFixed(2)} USD</p>
                    <span className="text-[9px] uppercase tracking-wider text-stone-500 font-semibold font-sans">
                      {categories.find((c) => c.id === p.category)?.name}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => startEditProduct(p)}
                    className="p-1.5 hover:bg-amber-950/20 text-stone-400 hover:text-amber-500 rounded border border-transparent hover:border-amber-900/10 cursor-pointer"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-1.5 hover:bg-rose-950/20 text-stone-400 hover:text-rose-500 rounded border border-transparent hover:border-rose-900/15 cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TABLES / SEATING MANAGER TAB */}
      {activeTab === 'tables' && (
        <div className="space-y-6" id="admin-tables-view">
          <div className="flex justify-between items-center border-b border-stone-850 pb-4">
            <h3 className="text-lg font-serif font-semibold text-stone-100">Distribución de Secciones, Mesas e Ingreso</h3>
            {!isAddingTable && (
              <button
                onClick={() => setIsAddingTable(true)}
                className="bg-amber-800 hover:bg-amber-700 text-stone-50 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-amber-950/25"
                id="admin-new-table-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Mesa</span>
              </button>
            )}
          </div>

          {/* Form adding table */}
          {isAddingTable && (
            <form onSubmit={handleAddTable} className="bg-stone-900 border border-stone-850 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-stone-850 pb-2">
                Nueva Mesa de Citas
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1 uppercase font-semibold">Identificador ID Único (Ej. t_deck_3)</label>
                  <input
                    type="text"
                    required
                    placeholder="t_deck_3"
                    value={tableForm.id}
                    onChange={(e) => setTableForm({ ...tableForm, id: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg text-xs py-2.5 px-3 text-stone-220 focus:outline-none"
                    id="add-table-id"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1 uppercase font-semibold">Nombre Visible</label>
                  <input
                    type="text"
                    required
                    placeholder="Mesa Mirador Cascada 3"
                    value={tableForm.name}
                    onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg text-xs py-2.5 px-3 text-stone-220 focus:outline-none"
                    id="add-table-name"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1 uppercase font-semibold">Zona / Área Geográfica</label>
                  <select
                    value={tableForm.area}
                    onChange={(e) => setTableForm({ ...tableForm, area: e.target.value as TableArea })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg text-xs py-2.5 px-3 text-stone-300 focus:outline-none"
                    id="add-table-area"
                  >
                    <option value="waterfall_deck">Terraza Cascada (Premium)</option>
                    <option value="fireplace_cozy">Rincón Chimenea</option>
                    <option value="indoor_premium">Salón Chayka Ancestral</option>
                    <option value="terrace_panoramic">Mirador del Cóndor / Terraza</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1 uppercase font-semibold">Capacidad de Comensales (Pers)</label>
                  <input
                    type="number"
                    required
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg text-xs py-2.5 px-3 text-stone-220 focus:outline-none"
                    id="add-table-cap"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1 uppercase font-semibold">Consumo Mínimo de Alimentos (USD)</label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={tableForm.minimumConsumption}
                    onChange={(e) => setTableForm({ ...tableForm, minimumConsumption: parseFloat(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg text-xs py-2.5 px-3 text-stone-220 focus:outline-none"
                    id="add-table-minfee"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-850">
                <button
                  type="button"
                  onClick={() => setIsAddingTable(false)}
                  className="px-4 py-2 bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-250 rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-800 hover:bg-amber-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  id="add-table-submit"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Mesa</span>
                </button>
              </div>
            </form>
          )}

          {/* Table List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="admin-table-management-list">
            {tables.map((table) => (
              <div
                key={table.id}
                className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex justify-between items-center"
                id={`admin-table-row-${table.id}`}
              >
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-mono font-bold text-amber-500">{table.id}</div>
                  <h4 className="text-xs font-bold text-stone-200">{table.name}</h4>
                  <div className="flex gap-2 text-[10px] text-stone-500 uppercase font-semibold font-sans mt-1">
                    <span>Pax: {table.capacity}</span>
                    <span>•</span>
                    <span>Min: ${table.minimumConsumption.toFixed(2)}</span>
                    <span>•</span>
                    <span className="text-stone-400 truncate max-w-[100px]">{table.area.replace('_', ' ')}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTable(table.id)}
                  className="p-1.5 hover:bg-rose-950/20 text-stone-500 hover:text-rose-400 rounded-lg border border-transparent hover:border-stone-800 transition cursor-pointer"
                  title="Eliminar Mesa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SETTINGS & CALENDAR TAB */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="admin-settings-view">
          {/* General Business Information Settings */}
          <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl space-y-4 text-left">
            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest border-b border-stone-850 pb-2 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>General e Integración WhatsApp</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1 uppercase font-semibold">Número de Atención WhatsApp (Link Destino directo)</label>
                <input
                  type="text"
                  required
                  value={businessConfig.whatsappNumber}
                  onChange={(e) => setBusinessConfig({ ...businessConfig, whatsappNumber: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg text-xs py-2.5 px-3 text-stone-200 focus:outline-none"
                  id="admin-conf-wa"
                />
                <p className="text-[10px] text-stone-500 mt-1 leading-normal">
                  Inserta el número en formato internacional con código de país (Ej. +593987163354 para Ecuador). Este número recibirá las confirmaciones automáticas de los clientes.
                </p>
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1 uppercase font-semibold">Lugar Geográfico</label>
                <input
                  type="text"
                  required
                  value={businessConfig.location}
                  onChange={(e) => setBusinessConfig({ ...businessConfig, location: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg text-xs py-2.5 px-3 text-stone-200 focus:outline-none"
                  id="admin-conf-loc"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1 uppercase font-semibold">Enlace a Google Maps pin</label>
                <input
                  type="text"
                  required
                  value={businessConfig.locationLink}
                  onChange={(e) => setBusinessConfig({ ...businessConfig, locationLink: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg text-xs py-2.5 px-3 text-stone-200 focus:outline-none"
                  id="admin-conf-loclink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1 uppercase font-semibold">Min Pax por Cita</label>
                  <input
                    type="number"
                    value={businessConfig.minPeopleReservation}
                    onChange={(e) => setBusinessConfig({ ...businessConfig, minPeopleReservation: parseInt(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg text-xs py-2 px-3 text-stone-200 focus:outline-none"
                    id="admin-conf-min"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1 uppercase font-semibold">Max Pax por Cita</label>
                  <input
                    type="number"
                    value={businessConfig.maxPeopleReservation}
                    onChange={(e) => setBusinessConfig({ ...businessConfig, maxPeopleReservation: parseInt(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg text-xs py-2 px-3 text-stone-200 focus:outline-none"
                    id="admin-conf-max"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Time Slots & Business hours Settings */}
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl space-y-4 text-left">
              <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest border-b border-stone-850 pb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Horarios Semanales Abiertos</span>
              </h3>

              <div className="space-y-3">
                {businessConfig.schedules.map((sched, idx) => (
                  <div key={idx} className="flex gap-2 items-center" id={`admin-sched-row-${idx}`}>
                    <input
                      type="text"
                      value={sched.day}
                      onChange={(e) => handleUpdateSchedule(idx, 'day', e.target.value)}
                      className="bg-stone-950 border border-stone-800 rounded-lg text-xs py-2 px-2.5 text-stone-200 focus:outline-none w-1/3"
                    />
                    <input
                      type="text"
                      value={sched.hours}
                      onChange={(e) => handleUpdateSchedule(idx, 'hours', e.target.value)}
                      className="bg-stone-950 border border-stone-800 rounded-lg text-xs py-2 px-2.5 text-stone-200 focus:outline-none flex-grow"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Added slots */}
            <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl space-y-4 text-left">
              <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest border-b border-stone-850 pb-2 flex items-center gap-1.5">
                <Grid className="w-4 h-4" />
                <span>Bloques Horas Disponibles</span>
              </h3>

              <div className="flex flex-wrap gap-1.5">
                {businessConfig.timeSlots.map((slot) => (
                  <span
                    key={slot}
                    className="bg-stone-950 text-stone-300 text-xs px-2.5 py-1 rounded-xl border border-stone-800 flex items-center gap-1.5 font-mono"
                    id={`admin-slot-tag-${slot.replace(':', '-')}`}
                  >
                    <span>{slot} HS</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTimeSlot(slot)}
                      className="text-stone-500 hover:text-rose-400 font-extrabold cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add slot simple input */}
              <div className="flex gap-2 pt-2 border-t border-stone-850">
                <input
                  type="text"
                  placeholder="Ej. 13:30 (formato 24h)"
                  maxLength={5}
                  id="admin-new-timeslot-input"
                  className="bg-stone-950 border border-stone-800 rounded-lg text-xs py-1.5 px-3 text-stone-200 focus:outline-none flex-grow font-mono"
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
                  className="bg-stone-950 border border-stone-800 text-amber-500 hover:text-amber-400 text-xs px-4 py-1 rounded-lg cursor-pointer"
                >
                  Agregar Bloque
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
