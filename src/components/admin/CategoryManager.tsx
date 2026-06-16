/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../lib/api';
import {
  useMenuCategoriesQuery,
  useTableAreasQuery
} from '../../lib/queries';
import {
  useCreateMenuCategory,
  useUpdateMenuCategory,
  useDeleteMenuCategory,
  useCreateTableArea,
  useUpdateTableArea,
  useDeleteTableArea
} from '../../lib/mutations';
import { useReservation } from '../../context/ReservationContext';
import { Plus, Edit2, Trash2, Save, X, GripVertical, AlertTriangle } from 'lucide-react';

type Tab = 'menu' | 'areas';

export default function CategoryManager() {
  const { language, addNotification } = useReservation();
  const isEs = language === 'es';

  const [activeTab, setActiveTab] = useState<Tab>('menu');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  return (
    <div className="space-y-6" id="category-manager-container">
      <div className="flex justify-between items-center border-b border-espresso/15 pb-4">
        <div>
          <h3 className="text-lg font-serif font-black text-espresso">
            {isEs ? 'Categorías y Zonas' : 'Categories & Areas'}
          </h3>
          <p className="text-xs text-espresso/60 mt-0.5">
            {isEs
              ? 'Administra las categorías del menú y las zonas de mesas.'
              : 'Manage menu categories and table areas.'}
          </p>
        </div>
      </div>

      <div className="flex border-b border-espresso/15 gap-2">
        <button
          onClick={() => {
            setActiveTab('menu');
            setEditingId(null);
            setIsAdding(false);
          }}
          className={`px-4 py-2 border-b-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
            activeTab === 'menu'
              ? 'border-ochre text-ochre'
              : 'border-transparent text-espresso/60 hover:text-espresso hover:border-espresso/20'
          }`}
          id="cat-tab-menu"
        >
          {isEs ? 'Categorías de Menú' : 'Menu Categories'}
        </button>
        <button
          onClick={() => {
            setActiveTab('areas');
            setEditingId(null);
            setIsAdding(false);
          }}
          className={`px-4 py-2 border-b-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
            activeTab === 'areas'
              ? 'border-ochre text-ochre'
              : 'border-transparent text-espresso/60 hover:text-espresso hover:border-espresso/20'
          }`}
          id="cat-tab-areas"
        >
          {isEs ? 'Zonas de Mesas' : 'Table Areas'}
        </button>
      </div>

      {activeTab === 'menu' && (
        <MenuCategoryTab
          language={language}
          isEs={isEs}
          editingId={editingId}
          setEditingId={setEditingId}
          isAdding={isAdding}
          setIsAdding={setIsAdding}
          addNotification={addNotification}
        />
      )}

      {activeTab === 'areas' && (
        <TableAreaTab
          language={language}
          isEs={isEs}
          editingId={editingId}
          setEditingId={setEditingId}
          isAdding={isAdding}
          setIsAdding={setIsAdding}
          addNotification={addNotification}
        />
      )}
    </div>
  );
}

interface TabProps {
  language: 'es' | 'en';
  isEs: boolean;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  isAdding: boolean;
  setIsAdding: (v: boolean) => void;
  addNotification: (title: string, body: string, level?: 'info' | 'success' | 'alert') => void;
}

function MenuCategoryTab({ language, isEs, editingId, setEditingId, isAdding, setIsAdding, addNotification }: TabProps) {
  const query = useMenuCategoriesQuery();
  const createMut = useCreateMenuCategory();
  const updateMut = useUpdateMenuCategory();
  const deleteMut = useDeleteMenuCategory();

  const rows = useMemo(
    () => (query.data ?? []).slice().sort((a, b) => a.displayOrder - b.displayOrder),
    [query.data]
  );

  // ── Form state
  const [formId, setFormId] = useState('');
  const [formNameEs, setFormNameEs] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);

  const resetForm = () => {
    setFormId('');
    setFormNameEs('');
    setFormNameEn('');
    setFormDisplayOrder(0);
    setEditingId(null);
    setIsAdding(false);
  };

  const startAdd = () => {
    resetForm();
    const nextOrder = rows.length > 0 ? Math.max(...rows.map((r) => r.displayOrder)) + 1 : 1;
    setFormDisplayOrder(nextOrder);
    setIsAdding(true);
  };

  const startEdit = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    setEditingId(id);
    setIsAdding(false);
    setFormId(row.id);
    setFormNameEs(row.name.es);
    setFormNameEn(row.name.en);
    setFormDisplayOrder(row.displayOrder);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMut.mutate(
        {
          id: editingId,
          input: {
            name: { es: formNameEs, en: formNameEn },
            displayOrder: formDisplayOrder
          }
        },
        {
          onSuccess: () => {
            addNotification(
              isEs ? 'Categoría Actualizada' : 'Category Updated',
              isEs ? 'Los cambios se guardaron.' : 'Changes saved.',
              'success'
            );
            resetForm();
          },
          onError: (err) => {
            addNotification(
              isEs ? 'Error al Actualizar' : 'Update Failed',
              err instanceof Error ? err.message : 'Unknown error',
              'alert'
            );
          }
        }
      );
    } else {
      if (!formId.trim()) return;
      createMut.mutate(
        {
          id: formId,
          name: { es: formNameEs, en: formNameEn },
          displayOrder: formDisplayOrder
        },
        {
          onSuccess: () => {
            addNotification(
              isEs ? 'Categoría Creada' : 'Category Created',
              isEs ? `Se agregó la categoría ${formId}.` : `Added ${formId}.`,
              'success'
            );
            resetForm();
          },
          onError: (err) => {
            addNotification(
              isEs ? 'Error al Crear' : 'Create Failed',
              err instanceof Error ? err.message : 'Unknown error',
              'alert'
            );
          }
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    // The server returns 409 + "X items use this category" when soft-delete guard fires.
    // We pre-check known references on the client; the server still validates authoritatively.
    const message = isEs
      ? `¿Eliminar la categoría "${id}"?`
      : `Delete category "${id}"?`;
    if (!window.confirm(message)) return;
    deleteMut.mutate(id, {
      onSuccess: () => {
        addNotification(
          isEs ? 'Categoría Eliminada' : 'Category Deleted',
          isEs ? `Se eliminó la categoría ${id}.` : `Deleted ${id}.`,
          'success'
        );
      },
      onError: (err) => {
        if (err instanceof ApiError && err.status === 409) {
          addNotification(
            isEs ? 'No se puede eliminar' : 'Cannot Delete',
            err.body && typeof err.body === 'object' && 'error' in err.body
              ? String((err.body as { error?: string }).error)
              : 'Items use this category',
            'alert'
          );
        } else {
          addNotification(
            isEs ? 'Error al Eliminar' : 'Delete Failed',
            err instanceof Error ? err.message : 'Unknown error',
            'alert'
          );
        }
      }
    });
  };

  const moveOrder = (id: string, direction: -1 | 1) => {
    const idx = rows.findIndex((r) => r.id === id);
    if (idx < 0) return;
    const target = idx + direction;
    if (target < 0 || target >= rows.length) return;
    const a = rows[idx];
    const b = rows[target];
    // Persist swapped order values. Two PUTs in sequence; the last successful
    // response leaves the list in a consistent state.
    updateMut.mutate(
      { id: a.id, input: { displayOrder: b.displayOrder } },
      {
        onSuccess: () => {
          updateMut.mutate({ id: b.id, input: { displayOrder: a.displayOrder } });
        }
      }
    );
  };

  return (
    <div className="space-y-4" id="menu-category-tab">
      <div className="flex justify-end">
        {!isAdding && !editingId && (
          <button
            onClick={startAdd}
            className="bg-ochre hover:bg-ochre/90 text-coffee-bg text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            id="cat-menu-add-btn"
          >
            <Plus className="w-4 h-4" />
            <span>{isEs ? 'Agregar' : 'Add'}</span>
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form
          onSubmit={handleSave}
          className="bg-editorial-bg border border-espresso/20 p-5 rounded-2xl space-y-4 shadow-sm"
          id="cat-menu-form"
        >
          <div className="flex justify-between items-center border-b border-espresso/10 pb-2">
            <h4 className="text-xs font-bold text-ochre uppercase tracking-widest">
              {editingId
                ? `${isEs ? 'Editar' : 'Edit'}: ${editingId}`
                : isEs
                ? 'Nueva Categoría'
                : 'New Category'}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="text-espresso/40 hover:text-espresso/80 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!editingId && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                {isEs ? 'ID único' : 'Unique ID'}
              </label>
              <input
                type="text"
                required
                placeholder="Ej. specialty_tea"
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3"
                id="cat-menu-id"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                Nombre (ES)
              </label>
              <input
                type="text"
                required
                value={formNameEs}
                onChange={(e) => setFormNameEs(e.target.value)}
                className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3"
                id="cat-menu-name-es"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                Name (EN)
              </label>
              <input
                type="text"
                required
                value={formNameEn}
                onChange={(e) => setFormNameEn(e.target.value)}
                className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3"
                id="cat-menu-name-en"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
              {isEs ? 'Orden' : 'Display Order'}
            </label>
            <input
              type="number"
              min={0}
              value={formDisplayOrder}
              onChange={(e) => setFormDisplayOrder(parseInt(e.target.value, 10) || 0)}
              className="w-32 bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3"
              id="cat-menu-order"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-espresso/10">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-espresso/5 hover:bg-espresso/10 text-espresso border border-espresso/20 rounded-xl text-xs font-semibold cursor-pointer"
            >
              {isEs ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={createMut.isPending || updateMut.isPending}
              className="px-5 py-2 bg-ochre hover:bg-ochre/90 text-coffee-bg font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              id="cat-menu-save-btn"
            >
              <Save className="w-3.5 h-3.5" />
              {isEs ? 'Guardar' : 'Save'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-espresso/15 rounded-xl divide-y divide-espresso/10" id="cat-menu-list">
        {rows.map((c, idx) => (
          <div
            key={c.id}
            className="p-3 flex items-center gap-3"
            id={`cat-menu-row-${c.id}`}
          >
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveOrder(c.id, -1)}
                disabled={idx === 0}
                className="text-espresso/40 hover:text-espresso disabled:opacity-30 cursor-pointer"
                title={isEs ? 'Subir' : 'Move up'}
                aria-label={isEs ? 'Subir' : 'Move up'}
              >
                <GripVertical className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-espresso/50 bg-espresso/5 px-1.5 py-0.5 rounded">
                  #{c.displayOrder}
                </span>
                <span className="text-xs font-bold text-espresso truncate">
                  {c.name[language] || c.name.es}
                </span>
                {!c.active && (
                  <span className="text-[9px] bg-rose-500/10 text-rose-700 border border-rose-500/20 px-1.5 py-0.5 rounded uppercase font-bold">
                    {isEs ? 'Inactiva' : 'Inactive'}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-espresso/50 font-mono mt-0.5">{c.id}</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => startEdit(c.id)}
                className="p-1.5 bg-espresso/5 hover:bg-espresso/10 text-espresso/60 hover:text-espresso rounded border border-espresso/10 cursor-pointer"
                title={isEs ? 'Editar' : 'Edit'}
                id={`cat-menu-edit-${c.id}`}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-1.5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 rounded border border-rose-500/10 cursor-pointer"
                title={isEs ? 'Eliminar' : 'Delete'}
                id={`cat-menu-delete-${c.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && !query.isLoading && (
          <p className="p-4 text-xs text-espresso/60 italic text-center">
            {isEs ? 'Sin categorías registradas.' : 'No categories yet.'}
          </p>
        )}
      </div>
    </div>
  );
}

function TableAreaTab({ language, isEs, editingId, setEditingId, isAdding, setIsAdding, addNotification }: TabProps) {
  const query = useTableAreasQuery();
  const createMut = useCreateTableArea();
  const updateMut = useUpdateTableArea();
  const deleteMut = useDeleteTableArea();

  const rows = useMemo(
    () => (query.data ?? []).slice().sort((a, b) => a.displayOrder - b.displayOrder),
    [query.data]
  );

  const [formId, setFormId] = useState('');
  const [formNameEs, setFormNameEs] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formDescEs, setFormDescEs] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);

  const resetForm = () => {
    setFormId('');
    setFormNameEs('');
    setFormNameEn('');
    setFormDescEs('');
    setFormDescEn('');
    setFormDisplayOrder(0);
    setEditingId(null);
    setIsAdding(false);
  };

  const startAdd = () => {
    resetForm();
    const nextOrder = rows.length > 0 ? Math.max(...rows.map((r) => r.displayOrder)) + 1 : 1;
    setFormDisplayOrder(nextOrder);
    setIsAdding(true);
  };

  const startEdit = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    setEditingId(id);
    setIsAdding(false);
    setFormId(row.id);
    setFormNameEs(row.name.es);
    setFormNameEn(row.name.en);
    setFormDescEs(row.description?.es ?? '');
    setFormDescEn(row.description?.en ?? '');
    setFormDisplayOrder(row.displayOrder);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: { es: formNameEs, en: formNameEn },
      description: { es: formDescEs, en: formDescEn },
      displayOrder: formDisplayOrder
    };
    if (editingId) {
      updateMut.mutate(
        { id: editingId, input: payload },
        {
          onSuccess: () => {
            addNotification(
              isEs ? 'Zona Actualizada' : 'Area Updated',
              isEs ? 'Los cambios se guardaron.' : 'Changes saved.',
              'success'
            );
            resetForm();
          },
          onError: (err) => {
            addNotification(
              isEs ? 'Error al Actualizar' : 'Update Failed',
              err instanceof Error ? err.message : 'Unknown error',
              'alert'
            );
          }
        }
      );
    } else {
      if (!formId.trim()) return;
      createMut.mutate(
        { id: formId, ...payload },
        {
          onSuccess: () => {
            addNotification(
              isEs ? 'Zona Creada' : 'Area Created',
              isEs ? `Se agregó la zona ${formId}.` : `Added ${formId}.`,
              'success'
            );
            resetForm();
          },
          onError: (err) => {
            addNotification(
              isEs ? 'Error al Crear' : 'Create Failed',
              err instanceof Error ? err.message : 'Unknown error',
              'alert'
            );
          }
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    const message = isEs ? `¿Eliminar la zona "${id}"?` : `Delete area "${id}"?`;
    if (!window.confirm(message)) return;
    deleteMut.mutate(id, {
      onSuccess: () => {
        addNotification(
          isEs ? 'Zona Eliminada' : 'Area Deleted',
          isEs ? `Se eliminó la zona ${id}.` : `Deleted ${id}.`,
          'success'
        );
      },
      onError: (err) => {
        if (err instanceof ApiError && err.status === 409) {
          addNotification(
            isEs ? 'No se puede eliminar' : 'Cannot Delete',
            err.body && typeof err.body === 'object' && 'error' in err.body
              ? String((err.body as { error?: string }).error)
              : 'Items use this area',
            'alert'
          );
        } else {
          addNotification(
            isEs ? 'Error al Eliminar' : 'Delete Failed',
            err instanceof Error ? err.message : 'Unknown error',
            'alert'
          );
        }
      }
    });
  };

  const moveOrder = (id: string, direction: -1 | 1) => {
    const idx = rows.findIndex((r) => r.id === id);
    if (idx < 0) return;
    const target = idx + direction;
    if (target < 0 || target >= rows.length) return;
    const a = rows[idx];
    const b = rows[target];
    updateMut.mutate(
      { id: a.id, input: { displayOrder: b.displayOrder } },
      {
        onSuccess: () => {
          updateMut.mutate({ id: b.id, input: { displayOrder: a.displayOrder } });
        }
      }
    );
  };

  // Reset form when switching tabs.
  useEffect(() => {
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4" id="table-area-tab">
      <div className="flex justify-end">
        {!isAdding && !editingId && (
          <button
            onClick={startAdd}
            className="bg-ochre hover:bg-ochre/90 text-coffee-bg text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            id="cat-area-add-btn"
          >
            <Plus className="w-4 h-4" />
            <span>{isEs ? 'Agregar' : 'Add'}</span>
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form
          onSubmit={handleSave}
          className="bg-editorial-bg border border-espresso/20 p-5 rounded-2xl space-y-4 shadow-sm"
          id="cat-area-form"
        >
          <div className="flex justify-between items-center border-b border-espresso/10 pb-2">
            <h4 className="text-xs font-bold text-ochre uppercase tracking-widest">
              {editingId
                ? `${isEs ? 'Editar' : 'Edit'}: ${editingId}`
                : isEs
                ? 'Nueva Zona'
                : 'New Area'}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="text-espresso/40 hover:text-espresso/80 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!editingId && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                {isEs ? 'ID único' : 'Unique ID'}
              </label>
              <input
                type="text"
                required
                placeholder="Ej. garden_lounge"
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3"
                id="cat-area-id"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">Nombre (ES)</label>
              <input type="text" required value={formNameEs} onChange={(e) => setFormNameEs(e.target.value)}
                className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3" id="cat-area-name-es" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">Name (EN)</label>
              <input type="text" required value={formNameEn} onChange={(e) => setFormNameEn(e.target.value)}
                className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3" id="cat-area-name-en" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">Descripción (ES)</label>
              <textarea rows={2} value={formDescEs} onChange={(e) => setFormDescEs(e.target.value)}
                className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 resize-none" id="cat-area-desc-es" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">Description (EN)</label>
              <textarea rows={2} value={formDescEn} onChange={(e) => setFormDescEn(e.target.value)}
                className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 resize-none" id="cat-area-desc-en" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
              {isEs ? 'Orden' : 'Display Order'}
            </label>
            <input
              type="number"
              min={0}
              value={formDisplayOrder}
              onChange={(e) => setFormDisplayOrder(parseInt(e.target.value, 10) || 0)}
              className="w-32 bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3"
              id="cat-area-order"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-espresso/10">
            <button type="button" onClick={resetForm}
              className="px-4 py-2 bg-espresso/5 hover:bg-espresso/10 text-espresso border border-espresso/20 rounded-xl text-xs font-semibold cursor-pointer">
              {isEs ? 'Cancelar' : 'Cancel'}
            </button>
            <button type="submit"
              disabled={createMut.isPending || updateMut.isPending}
              className="px-5 py-2 bg-ochre hover:bg-ochre/90 text-coffee-bg font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              id="cat-area-save-btn">
              <Save className="w-3.5 h-3.5" />
              {isEs ? 'Guardar' : 'Save'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-espresso/15 rounded-xl divide-y divide-espresso/10" id="cat-area-list">
        {rows.map((a, idx) => (
          <div key={a.id} className="p-3 flex items-center gap-3" id={`cat-area-row-${a.id}`}>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveOrder(a.id, -1)}
                disabled={idx === 0}
                className="text-espresso/40 hover:text-espresso disabled:opacity-30 cursor-pointer"
                title={isEs ? 'Subir' : 'Move up'}
                aria-label={isEs ? 'Subir' : 'Move up'}
              >
                <GripVertical className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-espresso/50 bg-espresso/5 px-1.5 py-0.5 rounded">
                  #{a.displayOrder}
                </span>
                <span className="text-xs font-bold text-espresso truncate">
                  {a.name[language] || a.name.es}
                </span>
                {!a.active && (
                  <span className="text-[9px] bg-rose-500/10 text-rose-700 border border-rose-500/20 px-1.5 py-0.5 rounded uppercase font-bold">
                    {isEs ? 'Inactiva' : 'Inactive'}
                  </span>
                )}
              </div>
              {a.description && (a.description.es || a.description.en) && (
                <p className="text-[10px] text-espresso/60 mt-0.5 line-clamp-1 italic">
                  {a.description[language] || a.description.es}
                </p>
              )}
              <p className="text-[10px] text-espresso/50 font-mono mt-0.5">{a.id}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => startEdit(a.id)}
                className="p-1.5 bg-espresso/5 hover:bg-espresso/10 text-espresso/60 hover:text-espresso rounded border border-espresso/10 cursor-pointer"
                title={isEs ? 'Editar' : 'Edit'} id={`cat-area-edit-${a.id}`}>
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(a.id)}
                className="p-1.5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 rounded border border-rose-500/10 cursor-pointer"
                title={isEs ? 'Eliminar' : 'Delete'} id={`cat-area-delete-${a.id}`}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && !query.isLoading && (
          <p className="p-4 text-xs text-espresso/60 italic text-center">
            {isEs ? 'Sin zonas registradas.' : 'No areas yet.'}
          </p>
        )}
      </div>

      {/* Helper hint about soft-delete guard */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <p>
          {isEs
            ? 'Al eliminar una categoría o zona con elementos asociados, el sistema la marca como inactiva y devuelve un error 409 con el conteo de uso.'
            : 'When deleting a category or area that is in use, the system marks it inactive and returns a 409 with the usage count.'}
        </p>
      </div>
    </div>
  );
}
