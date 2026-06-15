import React, { useState } from 'react';
import { MenuItem, Category } from '../../types';
import { useReservation } from '../../context/ReservationContext';
import { t } from '../../utils/translations';
import { INITIAL_CATEGORIES } from '../../data';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Coffee, 
  Clock, 
  DollarSign, 
  List, 
  ToggleLeft, 
  ToggleRight, 
  Sparkles,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface MenuManagerProps {
  categories?: Category[];
}

export default function MenuManager({ categories = INITIAL_CATEGORIES }: MenuManagerProps) {
  const { 
    menuProducts, 
    setMenuProducts, 
    language, 
    addNotification 
  } = useReservation();

  // Active view: 'list' | 'add' | 'edit'
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);

  // Form States (Bilingual)
  const [formNameEs, setFormNameEs] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formDescEs, setFormDescEs] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formIngredientsEs, setFormIngredientsEs] = useState('');
  const [formIngredientsEn, setFormIngredientsEn] = useState('');
  const [formPrice, setFormPrice] = useState(3.00);
  const [formCategory, setFormCategory] = useState('hot_drinks');
  const [formImage, setFormImage] = useState('');
  const [formPrepTime, setFormPrepTime] = useState(5);
  const [formIsSpecial, setFormIsSpecial] = useState(false);
  const [formActive, setFormActive] = useState(true);

  // Helpers to reset form
  const resetForm = () => {
    setFormNameEs('');
    setFormNameEn('');
    setFormDescEs('');
    setFormDescEn('');
    setFormIngredientsEs('');
    setFormIngredientsEn('');
    setFormPrice(3.00);
    setFormCategory('hot_drinks');
    setFormImage('');
    setFormPrepTime(5);
    setFormIsSpecial(false);
    setFormActive(true);
    setEditingProduct(null);
    setIsAddingProduct(false);
  };

  const startAddProduct = () => {
    resetForm();
    setIsAddingProduct(true);
  };

  const startEditProduct = (p: MenuItem) => {
    setEditingProduct(p);
    setIsAddingProduct(false);

    setFormNameEs(p.name.es);
    setFormNameEn(p.name.en);
    setFormDescEs(p.description.es);
    setFormDescEn(p.description.en);
    setFormIngredientsEs(p.ingredients.es.join(', '));
    setFormIngredientsEn(p.ingredients.en.join(', '));
    setFormPrice(p.price);
    setFormCategory(p.category);
    setFormImage(p.image);
    setFormPrepTime(p.preparationTime);
    setFormIsSpecial(p.isSpecial);
    setFormActive(p.active);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const ingredientsEsArr = formIngredientsEs
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    const ingredientsEnArr = formIngredientsEn
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    if (editingProduct) {
      // Edit mode
      const updatedProduct: MenuItem = {
        ...editingProduct,
        name: { es: formNameEs || editingProduct.name.es, en: formNameEn || editingProduct.name.en },
        description: { es: formDescEs || editingProduct.description.es, en: formDescEn || editingProduct.description.en },
        ingredients: { es: ingredientsEsArr, en: ingredientsEnArr },
        price: Number(formPrice),
        category: formCategory,
        image: formImage || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600',
        preparationTime: Number(formPrepTime),
        isSpecial: formIsSpecial,
        active: formActive
      };

      setMenuProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
      
      addNotification(
        language === 'es' ? 'Producto Actualizado' : 'Product Updated',
        t('toasts.menuUpdated', language).replace('{name}', updatedProduct.name[language]),
        'success'
      );
    } else {
      // Add mode
      const newId = 'prodID_' + Date.now();
      const newProduct: MenuItem = {
        id: newId,
        name: { es: formNameEs || 'Nuevo Plato', en: formNameEn || 'New Dish' },
        description: { es: formDescEs || '', en: formDescEn || '' },
        ingredients: { es: ingredientsEsArr, en: ingredientsEnArr },
        price: Number(formPrice),
        category: formCategory,
        image: formImage || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600',
        preparationTime: Number(formPrepTime),
        isSpecial: formIsSpecial,
        active: formActive
      };

      setMenuProducts(prev => [newProduct, ...prev]);

      addNotification(
        language === 'es' ? 'Producto Creado' : 'Product Created',
        language === 'es' ? `Se agregó "${newProduct.name.es}" al menú.` : `"${newProduct.name.en}" was added to the menu.`,
        'success'
      );
    }

    resetForm();
  };

  const handleDeleteProduct = (id: string, nameDict: MenuItem['name']) => {
    const productName = nameDict[language];
    const confirmMessage = language === 'es' 
      ? `¿Deseas de verdad dar de baja este producto del menú: "${productName}"?`
      : `Are you sure you want to remove this product from the menu: "${productName}"?`;

    if (window.confirm(confirmMessage)) {
      setMenuProducts(prev => prev.filter(p => p.id !== id));
      addNotification(
        language === 'es' ? 'Producto Eliminado' : 'Product Deleted',
        language === 'es' ? `Se eliminó "${productName}" del menú.` : `"${productName}" was removed from the menu.`,
        'alert'
      );
    }
  };

  const handleToggleActive = (product: MenuItem) => {
    const updated = { ...product, active: !product.active };
    setMenuProducts(prev => prev.map(p => p.id === product.id ? updated : p));
    
    addNotification(
      language === 'es' ? 'Estado del Producto' : 'Product Status',
      language === 'es' 
        ? `"${product.name.es}" ahora está ${updated.active ? 'Disponible' : 'No disponible'}.` 
        : `"${product.name.en}" is now ${updated.active ? 'Available' : 'Unavailable'}.`,
      'info'
    );
  };

  return (
    <div className="space-y-6" id="menu-manager-container">
      {/* Tab Header */}
      <div className="flex justify-between items-center border-b border-espresso/15 pb-4">
        <div>
          <h3 className="text-lg font-serif font-black text-espresso">
            {t('admin.menuManager.title', language)}
          </h3>
          <p className="text-xs text-espresso/60 mt-0.5">
            {t('admin.menuManager.subtitle', language)}
          </p>
        </div>

        {!isAddingProduct && !editingProduct && (
          <button
            onClick={startAddProduct}
            className="bg-ochre hover:bg-ochre/90 text-coffee-bg text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            id="admin-add-product-btn"
          >
            <Plus className="w-4 h-4 text-coffee-bg" />
            <span>{t('admin.menuManager.addProduct', language)}</span>
          </button>
        )}
      </div>

      {/* Product CRUD Form */}
      {(isAddingProduct || editingProduct) && (
        <form onSubmit={handleSaveProduct} className="bg-editorial-bg border border-espresso/20 p-6 rounded-2xl space-y-5 shadow-sm">
          <div className="flex justify-between items-center border-b border-espresso/10 pb-3">
            <h4 className="text-xs font-bold text-ochre uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-ochre" />
              <span>
                {editingProduct 
                  ? `${language === 'es' ? 'Editar' : 'Edit'}: ${editingProduct.name[language]}` 
                  : (language === 'es' ? 'Agregar Nuevo Plato' : 'Add New Dish')}
              </span>
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="text-espresso/40 hover:text-espresso/80 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SPANISH FIELDS */}
            <div className="space-y-4 bg-espresso/5 p-4 rounded-xl border border-espresso/10">
              <h5 className="text-[10px] font-bold text-espresso/60 uppercase tracking-wider border-b border-espresso/10 pb-1 mb-2">
                Detalles en Español (ES)
              </h5>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Humita Tradicional Chayka"
                  value={formNameEs}
                  onChange={(e) => setFormNameEs(e.target.value)}
                  className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre"
                  id="edit-prod-name-es"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">Descripción</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Descripción poética del sabor..."
                  value={formDescEs}
                  onChange={(e) => setFormDescEs(e.target.value)}
                  className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre resize-none"
                  id="edit-prod-desc-es"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">Ingredientes (Separados por comas)</label>
                <input
                  type="text"
                  placeholder="Ej. Maíz tierno, queso fresco, albahaca"
                  value={formIngredientsEs}
                  onChange={(e) => setFormIngredientsEs(e.target.value)}
                  className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre"
                  id="edit-prod-ing-es"
                />
              </div>
            </div>

            {/* ENGLISH FIELDS */}
            <div className="space-y-4 bg-espresso/5 p-4 rounded-xl border border-espresso/10">
              <h5 className="text-[10px] font-bold text-espresso/60 uppercase tracking-wider border-b border-espresso/10 pb-1 mb-2">
                English Details (EN)
              </h5>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traditional Chayka Humita"
                  value={formNameEn}
                  onChange={(e) => setFormNameEn(e.target.value)}
                  className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre"
                  id="edit-prod-name-en"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Poetic flavor description..."
                  value={formDescEn}
                  onChange={(e) => setFormDescEn(e.target.value)}
                  className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre resize-none"
                  id="edit-prod-desc-en"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">Ingredients (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Sweet corn, fresh cheese, basil"
                  value={formIngredientsEn}
                  onChange={(e) => setFormIngredientsEn(e.target.value)}
                  className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre"
                  id="edit-prod-ing-en"
                />
              </div>
            </div>
          </div>

          {/* COMMON SHARED METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                {t('admin.menuManager.price', language)} (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-espresso/50 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.10"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(parseFloat(e.target.value))}
                  className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 pl-7 pr-3 text-espresso focus:outline-none focus:border-ochre"
                  id="edit-prod-price"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                {t('admin.menuManager.prepTime', language)} (Minutos)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={formPrepTime}
                  onChange={(e) => setFormPrepTime(parseInt(e.target.value))}
                  className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre"
                  id="edit-prod-time"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                {t('admin.menuManager.category', language)}
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre cursor-pointer"
                id="edit-prod-cat"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name[language]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-espresso/70 mb-1">
                Imagen URL / Path
              </label>
              <input
                type="text"
                placeholder="e.g. /images/humita.png"
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
                className="w-full bg-white border border-espresso/20 rounded-lg text-xs py-2 px-3 text-espresso focus:outline-none focus:border-ochre"
                id="edit-prod-image"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 items-center pt-2">
            <label className="flex items-center gap-2 text-xs text-espresso font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formIsSpecial}
                onChange={(e) => setFormIsSpecial(e.target.checked)}
                className="w-4 h-4 accent-ochre rounded border-espresso/20"
              />
              <span>{language === 'es' ? 'Plato Estrella Chayka (Especial Dorado)' : 'Chayka Signature Dish (Golden Special)'}</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-espresso font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
                className="w-4 h-4 accent-ochre rounded border-espresso/20"
              />
              <span>{language === 'es' ? 'Disponible para Venta Inmediata' : 'Available for Immediate Sale'}</span>
            </label>
          </div>

          <div className="pt-4 border-t border-espresso/10 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-espresso/5 hover:bg-espresso/10 text-espresso border border-espresso/20 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              {t('admin.menuManager.cancel', language)}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-ochre hover:bg-ochre/90 text-coffee-bg font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
              id="save-prod-btn"
            >
              <Save className="w-3.5 h-3.5 text-coffee-bg" />
              <span>{t('admin.menuManager.save', language)}</span>
            </button>
          </div>
        </form>
      )}

      {/* Products List (Admin Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="admin-product-management-list">
        {menuProducts.map((p) => {
          const productCategory = categories.find(c => c.id === p.category);
          
          return (
            <div
              key={p.id}
              className={`bg-white border p-4 rounded-xl flex gap-3 justify-between items-start shadow-sm transition-all hover:border-espresso/30 ${
                p.active ? 'border-espresso/15' : 'border-espresso/10 opacity-70'
              }`}
              id={`admin-prod-card-${p.id}`}
            >
              <div className="flex gap-3 min-w-0">
                <div className="relative w-16 h-16 bg-espresso/5 border border-espresso/10 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={p.image}
                    alt={p.name[language]}
                    className="w-full h-full object-cover filter saturate-50"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      if (p.fallbackImage) {
                        (e.target as HTMLImageElement).src = p.fallbackImage;
                      } else {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600';
                      }
                    }}
                  />
                  {!p.active && (
                    <div className="absolute inset-0 bg-espresso/50 flex items-center justify-center">
                      <span className="text-[8px] text-white font-extrabold uppercase bg-rose-600 px-1 py-0.5 tracking-wider">
                        {t('admin.menuManager.inactive', language)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="min-w-0 text-left space-y-0.5">
                  <h4 className="text-xs font-bold text-espresso truncate flex items-center gap-1">
                    <span className="truncate">{p.name[language]}</span>
                    {p.isSpecial && (
                      <span className="text-[8px] bg-amber-500/10 text-amber-800 border border-amber-500/30 px-1 rounded flex-shrink-0">
                        {language === 'es' ? 'Firma' : 'Signature'}
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-ochre font-bold font-mono">
                    ${p.price.toFixed(2)} USD
                  </p>
                  <p className="text-[10px] text-espresso/80 line-clamp-1 italic">
                    {p.description[language]}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[9px] text-espresso/50 font-bold uppercase tracking-wider">
                    <span className="bg-espresso/5 px-1.5 py-0.5 rounded">
                      {productCategory ? productCategory.name[language] : p.category}
                    </span>
                    <span className="bg-espresso/5 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-espresso/40" />
                      {p.preparationTime} {t('menu.mins', language)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-1">
                {/* Toggle Active Button */}
                <button
                  onClick={() => handleToggleActive(p)}
                  className={`p-1.5 rounded border transition-colors cursor-pointer ${
                    p.active 
                      ? 'border-emerald-500/10 hover:border-emerald-500/30 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10' 
                      : 'border-espresso/10 hover:border-espresso/20 text-espresso/40 bg-espresso/5 hover:bg-espresso/10'
                  }`}
                  title={p.active ? (language === 'es' ? 'Desactivar' : 'Deactivate') : (language === 'es' ? 'Activar' : 'Activate')}
                >
                  {p.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => startEditProduct(p)}
                  className="p-1.5 bg-espresso/5 hover:bg-espresso/10 text-espresso/60 hover:text-espresso rounded border border-espresso/10 hover:border-espresso/20 cursor-pointer transition-colors"
                  title={t('admin.menuManager.edit', language)}
                  id={`edit-prod-btn-${p.id}`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteProduct(p.id, p.name)}
                  className="p-1.5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 rounded border border-rose-500/10 hover:border-rose-500/20 cursor-pointer transition-colors"
                  title={language === 'es' ? 'Eliminar' : 'Delete'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
