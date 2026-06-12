/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MenuItem, Category } from '../types';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MenuSectionProps {
  categories: Category[];
  products: MenuItem[];
  onAddToReservation?: (item: MenuItem) => void;
  reservationItems?: { [id: string]: number };
  onRemoveFromReservation?: (itemId: string) => void;
  interactiveMode?: boolean; // If true, allows adding items as preorders
}

// Icon renderer utility to render dynamically without warnings
const renderCategoryIcon = (iconName: string, className: string = "w-5 h-5") => {
  switch (iconName) {
    case 'Coffee':
      return <LucideIcons.Coffee className={className} />;
    case 'Flame':
      return <LucideIcons.Flame className={className} />;
    case 'Cookie':
      return <LucideIcons.Cookie className={className} />;
    case 'Sparkles':
      return <LucideIcons.Sparkles className={className} />;
    default:
      return <LucideIcons.Coffee className={className} />;
  }
};

export default function MenuSection({
  categories,
  products,
  onAddToReservation,
  reservationItems = {},
  onRemoveFromReservation,
  interactiveMode = false
}: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Customization options for the selected product detail modal
  const [milkOption, setMilkOption] = useState<string>('entera');
  const [sweetnessOption, setSweetnessOption] = useState<string>('panela_imbabura');

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch && p.active;
  });

  return (
    <div className="space-y-8" id="menu-section-container">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-editorial-charcoal/60 font-bold text-[10px] uppercase tracking-[0.25em] block">Nuestra Experiencia Sensorial</span>
          <h2 className="text-3xl font-bold font-serif italic text-editorial-charcoal mt-1">El Menú con Alma de Montaña</h2>
          <p className="text-editorial-charcoal/80 text-sm max-w-xl mt-1">
            Platos tradicionales y cafetería de altura preparados junto a la brisa de la Cascada de Peguche.
          </p>
        </div>

        <div className="relative w-full md:max-w-xs">
          <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-editorial-charcoal/40" />
          <input
            type="text"
            placeholder="Buscar humita, café, postre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-editorial-stone/30 border border-editorial-charcoal/15 text-editorial-charcoal placeholder-editorial-charcoal/40 pl-9 pr-4 py-2.5 rounded-none text-xs focus:outline-none focus:border-editorial-charcoal focus:bg-editorial-bg transition-colors"
            id="menu-search-input"
          />
        </div>
      </div>

      {/* Category Selectors */}
      <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-none text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer border ${
            selectedCategory === 'all'
              ? 'bg-editorial-charcoal text-editorial-bg border-editorial-charcoal'
              : 'bg-editorial-stone/40 text-editorial-charcoal/70 hover:text-editorial-charcoal hover:bg-editorial-stone border-editorial-charcoal/10'
          }`}
          id="menu-cat-all"
        >
          <LucideIcons.Compass className="w-3.5 h-3.5" />
          <span>Explorar Todo</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-none text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === cat.id
                ? 'bg-editorial-charcoal text-editorial-bg border-editorial-charcoal'
                : 'bg-editorial-stone/40 text-editorial-charcoal/70 hover:text-editorial-charcoal hover:bg-editorial-stone border-editorial-charcoal/10'
            }`}
            id={`menu-cat-${cat.id}`}
          >
            {renderCategoryIcon(cat.icon, "w-3.5 h-3.5")}
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="menu-product-grid">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => {
            const count = reservationItems[product.id] || 0;
            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col bg-editorial-stone/30 border border-editorial-charcoal/15 rounded-none overflow-hidden transition-all text-left hover:border-editorial-charcoal/50"
                id={`product-card-${product.id}`}
              >
                {/* Product Image Area */}
                <div className="relative h-48 overflow-hidden bg-editorial-stone border-b border-editorial-charcoal/10">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 filter saturate-50"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = product.fallbackImage || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-editorial-charcoal/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {product.isSpecial && (
                      <span className="bg-editorial-charcoal text-editorial-bg text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-none border border-editorial-charcoal flex items-center gap-1.5">
                        <LucideIcons.Sparkles className="w-3 h-3 text-editorial-stone fill-editorial-stone" />
                        <span>Firma Chayka</span>
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-3 right-3 bg-editorial-bg text-editorial-charcoal font-serif font-black italic text-sm px-2.5 py-1 rounded-none border border-editorial-charcoal/15">
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-lg font-bold text-editorial-charcoal group-hover:underline transition-all">
                      {product.name}
                    </h3>
                    <p className="text-editorial-charcoal/80 text-xs leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-1">
                    {product.ingredients.slice(0, 3).map((ing, i) => (
                      <span key={i} className="bg-editorial-bg text-editorial-charcoal/70 text-[9px] px-2 py-0.5 rounded-none border border-editorial-charcoal/10 font-bold uppercase tracking-wider">
                        {ing}
                      </span>
                    ))}
                    {product.ingredients.length > 3 && (
                      <span className="bg-editorial-bg text-editorial-charcoal/70 text-[9px] px-1.5 py-0.5 rounded-none border border-editorial-charcoal/10 font-bold uppercase tracking-wider">
                        +{product.ingredients.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 items-center justify-between border-t border-editorial-charcoal/10">
                    <button
                      onClick={() => setSelectedItem(product)}
                      className="text-editorial-charcoal text-[10px] font-bold hover:underline transition-colors uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                      id={`product-detail-btn-${product.id}`}
                    >
                      <LucideIcons.Eye className="w-4 h-4" />
                      <span>Ver Detalles</span>
                    </button>

                    {/* Pre-order interactive buttons */}
                    {interactiveMode && onAddToReservation && (
                      <div className="flex items-center gap-2">
                        {count > 0 ? (
                          <div className="flex items-center gap-2 bg-editorial-bg border border-editorial-charcoal/15 rounded-none p-0.5">
                            <button
                              onClick={() => onRemoveFromReservation && onRemoveFromReservation(product.id)}
                              className="w-7 h-7 bg-editorial-stone hover:bg-editorial-stone-dark text-editorial-charcoal font-black flex items-center justify-center rounded-none cursor-pointer text-xs"
                              id={`product-minus-${product.id}`}
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-editorial-charcoal px-2">{count}</span>
                            <button
                              onClick={() => onAddToReservation(product)}
                              className="w-7 h-7 bg-editorial-stone hover:bg-editorial-stone-dark text-editorial-charcoal font-black flex items-center justify-center rounded-none cursor-pointer text-xs"
                              id={`product-plus-${product.id}`}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onAddToReservation(product)}
                            className="bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-bg text-[10px] font-bold px-3 py-1.5 rounded-none transition-all cursor-pointer flex items-center gap-1 uppercase tracking-widest"
                            id={`product-add-${product.id}`}
                          >
                            <LucideIcons.Plus className="w-3.5 h-3.5" />
                            <span>Pre-ordenar</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center bg-editorial-stone/20 rounded-none border border-dashed border-editorial-charcoal/15">
            <LucideIcons.Info className="w-8 h-8 text-editorial-charcoal/40 mx-auto mb-2" />
            <p className="text-editorial-charcoal font-bold font-serif italic text-sm">No se encontraron productos.</p>
            <p className="text-editorial-charcoal/60 text-xs mt-1">Prueba seleccionando otra categoría o cambiando tu término de búsqueda.</p>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-editorial-charcoal/70 backdrop-blur-sm" id="detail-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 15 }}
              className="relative w-full max-w-lg bg-editorial-bg border border-editorial-charcoal/20 rounded-none shadow-2xl p-6"
              id="detail-modal-card"
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 bg-editorial-charcoal text-editorial-bg hover:opacity-85 p-2 rounded-none cursor-pointer transition shadow-md"
                id="detail-modal-close"
              >
                <LucideIcons.X className="w-5 h-5" />
              </button>

              <div className="relative h-56 rounded-none overflow-hidden mb-6 bg-editorial-stone border border-editorial-charcoal/10">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover filter saturate-50"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = selectedItem.fallbackImage || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-editorial-bg/30 to-transparent" />
                <span className="absolute bottom-4 left-4 bg-editorial-stone text-editorial-charcoal text-[10px] uppercase font-bold tracking-wider px-3 py-1 border border-editorial-charcoal/15 rounded-none">
                  {categories.find(c => c.id === selectedItem.category)?.name || 'Especialidad'}
                </span>
                <span className="absolute bottom-4 right-4 bg-editorial-bg text-editorial-charcoal font-black font-serif italic text-lg px-3 py-1.5 rounded-none border border-editorial-charcoal/20">
                  ${selectedItem.price.toFixed(2)}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold italic text-editorial-charcoal">{selectedItem.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-editorial-charcoal/60 mt-2 font-mono uppercase tracking-widest font-semibold">
                    <span className="flex items-center gap-1 sm:text-[10px]">
                      <LucideIcons.Clock className="w-3.5 h-3.5 text-editorial-charcoal" />
                      Prep. {selectedItem.preparationTime} min
                    </span>
                    <span className="w-1 h-1 rounded-full bg-editorial-charcoal/30" />
                    <span className="text-emerald-700 sm:text-[10px]">Disponible hoy</span>
                  </div>
                </div>

                <p className="text-editorial-charcoal/85 text-sm leading-relaxed font-sans">{selectedItem.description}</p>

                {/* Ingredients section */}
                <div className="bg-editorial-stone/40 p-4 rounded-none border border-editorial-charcoal/10 space-y-2">
                  <h4 className="text-[10px] font-bold text-editorial-charcoal/60 uppercase tracking-[0.15em]">Ingredientes & Origen</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.ingredients.map((ing, idx) => (
                      <span key={idx} className="bg-editorial-bg text-editorial-charcoal text-[10px] px-2.5 py-1 border border-editorial-charcoal/10 rounded-none font-bold uppercase tracking-wider">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Customizations simulator */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-bold text-editorial-charcoal/80 uppercase tracking-widest flex items-center gap-1">
                    <LucideIcons.Sliders className="w-3.5 h-3.5 text-editorial-charcoal" />
                    <span>Personalizar Tu Experiencia</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-editorial-charcoal/60 mb-1 font-bold uppercase tracking-wider">Tipo de Leche / Base</label>
                      <select
                        value={milkOption}
                        onChange={(e) => setMilkOption(e.target.value)}
                        className="w-full bg-editorial-bg border border-editorial-charcoal/20 rounded-none text-xs py-2 px-2.5 text-editorial-charcoal focus:outline-none focus:border-editorial-charcoal font-medium font-mono"
                        id="milk-option-select"
                      >
                        <option value="entera">Semidescremada Clásica</option>
                        <option value="entera_pura">Leche de Campo Orgánica</option>
                        <option value="almendra">Leche de Almendras (+ $0.50)</option>
                        <option value="avena">Leche de Avena Cultivada (+ $0.50)</option>
                        <option value="agua">En base a Agua de Vertiente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-editorial-charcoal/60 mb-1 font-bold uppercase tracking-wider">Dulzura / Toque</label>
                      <select
                        value={sweetnessOption}
                        onChange={(e) => setSweetnessOption(e.target.value)}
                        className="w-full bg-editorial-bg border border-editorial-charcoal/20 rounded-none text-xs py-2 px-2.5 text-editorial-charcoal focus:outline-none focus:border-editorial-charcoal font-medium font-mono"
                        id="sweetness-option-select"
                      >
                        <option value="panela_imbabura">Panela Orgánica Imbabureña</option>
                        <option value="sin_azucar">Sin azúcar (Café puro de altura)</option>
                        <option value="miel">Cachito de Miel de Abeja (+ $0.25)</option>
                        <option value="estevia">Estevia Ecológica en gotas</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Preorder action inside details modal */}
                {interactiveMode && onAddToReservation && (
                  <div className="pt-4 flex items-center justify-between border-t border-editorial-charcoal/15 mt-4">
                    <span className="text-xs text-editorial-charcoal/60 font-serif italic">¿Quieres añadirlo pre-ordenado?</span>
                    <button
                      onClick={() => {
                        onAddToReservation(selectedItem);
                        setSelectedItem(null);
                      }}
                      className="bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-editorial-bg font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-none cursor-pointer transition flex items-center gap-1.5"
                      id="modal-add-preorder-btn"
                    >
                      <LucideIcons.Plus className="w-4 h-4" />
                      <span>Pre-ordenar Plato</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
