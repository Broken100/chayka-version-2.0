/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import { ReservationTable, TableArea } from '../../types';
import { useReservation } from '../../context/ReservationContext';
import { useTablesQuery } from '../../lib/queries';
import { useCreateTable, useDeleteTable } from '../../lib/mutations';
import { t } from '../../utils/translations';
import { Plus, Save, Trash2 } from 'lucide-react';

export default function TablesManager() {
  const { language } = useReservation();
  const isEs = language === 'es';
  const tablesQuery = useTablesQuery();
  const createTableMutation = useCreateTable();
  const deleteTableMutation = useDeleteTable();
  const tables: ReservationTable[] = (tablesQuery.data ?? []) as unknown as ReservationTable[];

  const [isAddingTable, setIsAddingTable] = useState<boolean>(false);
  const [tableForm, setTableForm] = useState<Partial<ReservationTable>>({
    id: '',
    name: { es: '', en: '' },
    capacity: 4,
    area: 'waterfall_deck',
    minimumConsumption: 10.00
  });

  const handleAddTable = async (e: FormEvent) => {
    e.preventDefault();
    if (!tableForm.id || !tableForm.name?.es || !tableForm.name?.en) return;

    try {
      await createTableMutation.mutateAsync({
        id: tableForm.id,
        name: { es: tableForm.name.es, en: tableForm.name.en },
        capacity: Number(tableForm.capacity) || 4,
        area: (tableForm.area as string) || 'waterfall_deck',
        minimumConsumption: Number(tableForm.minimumConsumption) || 0
      });
      setIsAddingTable(false);
      setTableForm({
        id: '',
        name: { es: '', en: '' },
        capacity: 4,
        area: 'waterfall_deck',
        minimumConsumption: 10.00
      });
    } catch {
      // Error handled by mutation; table won't appear because query refetches
    }
  };

  const handleDeleteTable = (tableId: string) => {
    const confirmMsg = isEs
      ? '¿Seguro quieres eliminar esta mesa?'
      : 'Are you sure you want to delete this table?';
    if (window.confirm(confirmMsg)) {
      deleteTableMutation.mutate(tableId);
    }
  };

  return (
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
  );
}
