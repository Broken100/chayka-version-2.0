/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MenuItem, Category } from '../types';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useReservation } from '../context/ReservationContext';
import { t } from '../utils/translations';

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
  const { language } = useReservation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Customization options for the selected product detail modal
  const [milkOption, setMilkOption] = useState<string>('entera');
  const [sweetnessOption, setSweetnessOption] = useState<string>('panela_imbabura');

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const nameStr = p.name[language] || '';
    const descStr = p.description[language] || '';
    const ingredientsList = p.ingredients[language] || [];

    const matchesSearch = nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          descStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ingredientsList.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch && p.active;
  });

  return (
    <div className="space-y-8" id="menu-section-container">
      {/* Main Page Header */}
      <div className="text-left">
        <span className="text-espresso/60 font-bold text-[10px] uppercase tracking-[0.25em] block">
          {language === 'es' ? 'Nuestra Experiencia Sensorial' : 'Our Sensory Experience'}
        </span>
        <h2 className="text-3xl font-bold font-serif italic text-espresso mt-1">
          {t('menu.title', language)}
        </h2>
        <p className="text-espresso/80 text-sm max-w-xl mt-1 leading-relaxed">
          {t('menu.subtitle', language)}
        </p>
      </div>

      {/* Highlighted Featured Drinks Section */}
      <div className="bg-[#FAF5EE] border-2 border-ochre/35 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm" id="featured-drinks-section">
        <div className="flex items-center gap-2 border-b border-espresso/15 pb-4">
          <LucideIcons.Sparkles className="w-5 h-5 text-ochre fill-ochre animate-pulse" />
          <h3 className="text-xl font-bold font-serif italic text-espresso">
            {language === 'es' ? 'Bebidas Destacadas (Imágenes Superiores)' : 'Featured Drinks (Top Images)'}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.filter(p => p.isSpecial && p.active).map(product => {
            const count = reservationItems[product.id] || 0;
            return (
              <div
                key={`featured-${product.id}`}
                className="group relative flex flex-col bg-coffee-bg border border-espresso/20 rounded-2xl overflow-hidden transition-all text-left hover:border-ochre/60 hover:shadow-lg"
                id={`featured-card-${product.id}`}
              >
                {/* Large Image Area */}
                <div className="relative h-60 overflow-hidden bg-espresso/10 border-b border-espresso/10">
                  <img
                    src={product.image}
                    alt={product.name[language]}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter saturate-75"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = product.fallbackImage || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/35 to-transparent" />
                  <span className="absolute bottom-3 right-3 bg-coffee-bg text-espresso font-serif font-black italic text-sm px-3 py-1 rounded-full border border-espresso/15 shadow-sm">
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-serif text-base font-bold text-espresso group-hover:text-ochre transition-all">
                      {product.name[language]}
                    </h4>
                    
                    {/* Star Rating */}
                    <div className="flex items-center gap-1 text-amber-600">
                      {[...Array(5)].map((_, i) => (
                        <LucideIcons.Star
                          key={i}
                          className="w-3 h-3 text-amber-600 fill-amber-600"
                        />
                      ))}
                      <span className="text-[10px] font-bold text-espresso/70 ml-1">5.0</span>
                    </div>

                    <p className="text-espresso/80 text-xs leading-relaxed line-clamp-2">
                      {product.description[language]}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-1">
                    {(product.ingredients[language] || []).slice(0, 3).map((ing, i) => (
                      <span key={i} className="bg-coffee-bg text-espresso/80 text-[9px] px-2.5 py-0.5 rounded-full border border-espresso/10 font-bold uppercase tracking-wider">
                        {ing}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-3 items-center justify-between border-t border-espresso/10">
                    <button
                      onClick={() => setSelectedItem(product)}
                      className="text-espresso text-[10px] font-bold hover:text-ochre hover:underline transition-colors uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                      id={`featured-detail-btn-${product.id}`}
                    >
                      <LucideIcons.Eye className="w-4 h-4" />
                      <span>{language === 'es' ? 'Ver Detalles' : 'Details'}</span>
                    </button>

                    {/* Pre-order interactive buttons */}
                    {interactiveMode && onAddToReservation && (
                      <div className="flex items-center gap-2">
                        {count > 0 ? (
                          <div className="flex items-center gap-1.5 bg-coffee-bg border border-espresso/15 rounded-full p-0.5 shadow-sm">
                            <button
                              onClick={() => onRemoveFromReservation && onRemoveFromReservation(product.id)}
                              className="w-7 h-7 bg-espresso/5 hover:bg-espresso/10 text-espresso font-black flex items-center justify-center rounded-full cursor-pointer text-xs transition animate-scaleIn"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-espresso px-1">{count}</span>
                            <button
                              onClick={() => onAddToReservation(product)}
                              className="w-7 h-7 bg-espresso/5 hover:bg-espresso/10 text-espresso font-black flex items-center justify-center rounded-full cursor-pointer text-xs transition animate-scaleIn"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onAddToReservation(product)}
                            className="bg-espresso hover:bg-espresso/90 hover:scale-[1.02] active:scale-[0.98] text-coffee-bg text-[10px] font-bold px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1 uppercase tracking-widest shadow-md"
                          >
                            <LucideIcons.Plus className="w-3.5 h-3.5" />
                            <span>{t('menu.addToOrder', language)}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Tabs & Search Bar below Featured Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-espresso/10 pt-8">
        <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === 'all'
                ? 'bg-espresso text-coffee-bg border-espresso'
                : 'bg-espresso/5 text-espresso/70 hover:text-espresso hover:bg-espresso/10 border-espresso/10'
            }`}
            id="menu-cat-all"
          >
            <LucideIcons.Compass className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Explorar Todo' : 'Explore All'}</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-espresso text-coffee-bg border-espresso'
                  : 'bg-espresso/5 text-espresso/70 hover:text-espresso hover:bg-espresso/10 border-espresso/10'
              }`}
              id={`menu-cat-${cat.id}`}
            >
              {renderCategoryIcon(cat.icon, "w-3.5 h-3.5")}
              <span>{cat.name[language]}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:max-w-xs">
          <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso/40" />
          <input
            type="text"
            placeholder={language === 'es' ? "Buscar bebida, ingrediente..." : "Search drinks, ingredients..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-espresso/5 border border-espresso/15 text-espresso placeholder-espresso/40 pl-9 pr-4 py-2.5 rounded-full text-xs focus:outline-none focus:border-espresso focus:bg-coffee-bg transition-colors"
            id="menu-search-input"
          />
        </div>
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
                className="group relative flex flex-col bg-[#FAF5EE] border border-espresso/15 rounded-2xl overflow-hidden transition-all text-left hover:border-espresso/45 hover:shadow-lg"
                id={`product-card-${product.id}`}
              >
                {/* Product Image Area */}
                <div className="relative h-48 overflow-hidden bg-espresso/10 border-b border-espresso/10">
                  <img
                    src={product.image}
                    alt={product.name[language]}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter saturate-75"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = product.fallbackImage || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/25 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {product.isSpecial && (
                      <span className="bg-espresso text-coffee-bg text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-espresso flex items-center gap-1.5 shadow-md">
                        <LucideIcons.Sparkles className="w-3 h-3 text-coffee-bg/85 fill-coffee-bg/85" />
                        <span>{t('menu.special', language)}</span>
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-3 right-3 bg-coffee-bg text-espresso font-serif font-black italic text-sm px-3 py-1 rounded-full border border-espresso/15 shadow-sm">
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg font-bold text-espresso group-hover:text-ochre transition-all">
                      {product.name[language]}
                    </h3>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-1 text-amber-600">
                      {[...Array(5)].map((_, i) => {
                        const starRating = product.isSpecial ? 5.0 : 4.8;
                        const isHalfStar = i === 4 && starRating === 4.8;
                        return (
                          <LucideIcons.Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              isHalfStar
                                ? 'text-amber-600 fill-amber-600 opacity-60'
                                : 'text-amber-600 fill-amber-600'
                            }`}
                          />
                        );
                      })}
                      <span className="text-[10px] font-bold text-espresso/70 ml-1">
                        {product.isSpecial ? '5.0' : '4.8'}
                      </span>
                    </div>

                    <p className="text-espresso/80 text-xs leading-relaxed line-clamp-2">
                      {product.description[language]}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-1">
                    {(product.ingredients[language] || []).slice(0, 3).map((ing, i) => (
                      <span key={i} className="bg-coffee-bg text-espresso/80 text-[9px] px-2.5 py-0.5 rounded-full border border-espresso/10 font-bold uppercase tracking-wider">
                        {ing}
                      </span>
                    ))}
                    {(product.ingredients[language] || []).length > 3 && (
                      <span className="bg-coffee-bg text-espresso/80 text-[9px] px-2 py-0.5 rounded-full border border-espresso/10 font-bold uppercase tracking-wider">
                        +{(product.ingredients[language] || []).length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 items-center justify-between border-t border-espresso/10">
                    <button
                      onClick={() => setSelectedItem(product)}
                      className="text-espresso text-[10px] font-bold hover:text-ochre hover:underline transition-colors uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                      id={`product-detail-btn-${product.id}`}
                    >
                      <LucideIcons.Eye className="w-4 h-4" />
                      <span>{language === 'es' ? 'Ver Detalles' : 'Details'}</span>
                    </button>

                    {/* Pre-order interactive buttons */}
                    {interactiveMode && onAddToReservation && (
                      <div className="flex items-center gap-2">
                        {count > 0 ? (
                          <div className="flex items-center gap-1.5 bg-coffee-bg border border-espresso/15 rounded-full p-0.5 shadow-sm">
                            <button
                              onClick={() => onRemoveFromReservation && onRemoveFromReservation(product.id)}
                              className="w-7 h-7 bg-espresso/5 hover:bg-espresso/10 text-espresso font-black flex items-center justify-center rounded-full cursor-pointer text-xs transition animate-scaleIn"
                              id={`product-minus-${product.id}`}
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-espresso px-1">{count}</span>
                            <button
                              onClick={() => onAddToReservation(product)}
                              className="w-7 h-7 bg-espresso/5 hover:bg-espresso/10 text-espresso font-black flex items-center justify-center rounded-full cursor-pointer text-xs transition animate-scaleIn"
                              id={`product-plus-${product.id}`}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onAddToReservation(product)}
                            className="bg-espresso hover:bg-espresso/90 hover:scale-[1.02] active:scale-[0.98] text-coffee-bg text-[10px] font-bold px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1 uppercase tracking-widest shadow-md"
                            id={`product-add-${product.id}`}
                          >
                            <LucideIcons.Plus className="w-3.5 h-3.5" />
                            <span>{t('menu.addToOrder', language)}</span>
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
          <div className="col-span-full py-12 text-center bg-espresso/5 rounded-2xl border border-dashed border-espresso/15">
            <LucideIcons.Info className="w-8 h-8 text-espresso/40 mx-auto mb-2" />
            <p className="text-espresso font-bold font-serif italic text-sm">
              {language === 'es' ? 'No se encontraron productos.' : 'No products found.'}
            </p>
            <p className="text-espresso/60 text-xs mt-1">
              {language === 'es'
                ? 'Prueba seleccionando otra categoría o cambiando tu término de búsqueda.'
                : 'Try selecting another category or changing your search term.'}
            </p>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/70 backdrop-blur-sm" id="detail-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 15 }}
              className="relative w-full max-w-lg bg-[#FAF5EE] border border-espresso/20 rounded-2xl shadow-2xl p-6"
              id="detail-modal-card"
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 bg-espresso text-coffee-bg hover:bg-espresso/90 p-2.5 rounded-full cursor-pointer transition shadow-md"
                id="detail-modal-close"
              >
                <LucideIcons.X className="w-4 h-4" />
              </button>

              <div className="relative h-56 rounded-xl overflow-hidden mb-6 bg-espresso/10 border border-espresso/10">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name[language]}
                  className="w-full h-full object-cover filter saturate-75"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = selectedItem.fallbackImage || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/20 to-transparent" />
                <span className="absolute bottom-4 left-4 bg-coffee-bg text-espresso text-[10px] uppercase font-bold tracking-wider px-3 py-1 border border-espresso/15 rounded-full">
                  {categories.find(c => c.id === selectedItem.category)?.name[language] || (language === 'es' ? 'Especialidad' : 'Specialty')}
                </span>
                <span className="absolute bottom-4 right-4 bg-coffee-bg text-espresso font-black font-serif italic text-lg px-3 py-1.5 rounded-full border border-espresso/20 shadow-sm">
                  ${selectedItem.price.toFixed(2)}
                </span>
              </div>

              <div className="space-y-4 text-left">
                <div>
                  <h3 className="font-serif text-2xl font-bold italic text-espresso">{selectedItem.name[language]}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-espresso/60 mt-2 font-mono uppercase tracking-widest font-semibold">
                    <span className="flex items-center gap-1 sm:text-[10px]">
                      <LucideIcons.Clock className="w-3.5 h-3.5 text-espresso" />
                      {t('menu.prepTime', language)}: {selectedItem.preparationTime} {t('menu.mins', language)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-espresso/30" />
                    <span className="text-emerald-700 sm:text-[10px]">
                      {language === 'es' ? 'Disponible hoy' : 'Available today'}
                    </span>
                  </div>
                </div>

                <p className="text-espresso/85 text-sm leading-relaxed font-sans">{selectedItem.description[language]}</p>

                {/* Ingredients section */}
                <div className="bg-espresso/5 p-4 rounded-xl border border-espresso/10 space-y-2">
                  <h4 className="text-[10px] font-bold text-espresso/60 uppercase tracking-[0.15em]">
                    {t('menu.ingredients', language)}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedItem.ingredients[language] || []).map((ing, idx) => (
                      <span key={idx} className="bg-coffee-bg text-espresso text-[10px] px-3 py-1 border border-espresso/10 rounded-full font-bold uppercase tracking-wider">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Customizations simulator */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-bold text-espresso/80 uppercase tracking-widest flex items-center gap-1">
                    <LucideIcons.Sliders className="w-3.5 h-3.5 text-espresso" />
                    <span>{language === 'es' ? 'Personalizar Tu Experiencia' : 'Customize Your Experience'}</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-espresso/60 mb-1 font-bold uppercase tracking-wider">
                        {language === 'es' ? 'Tipo de Leche / Base' : 'Milk Type / Base'}
                      </label>
                      <select
                        value={milkOption}
                        onChange={(e) => setMilkOption(e.target.value)}
                        className="w-full bg-coffee-bg border border-espresso/20 rounded-full text-xs py-2 px-3.5 text-espresso focus:outline-none focus:border-espresso font-medium font-mono"
                        id="milk-option-select"
                      >
                        <option value="entera">
                          {language === 'es' ? 'Semidescremada Clásica' : 'Classic Semi-skimmed'}
                        </option>
                        <option value="entera_pura">
                          {language === 'es' ? 'Leche de Campo Orgánica' : 'Organic Farm Milk'}
                        </option>
                        <option value="almendra">
                          {language === 'es' ? 'Leche de Almendras (+ $0.50)' : 'Almond Milk (+ $0.50)'}
                        </option>
                        <option value="avena">
                          {language === 'es' ? 'Leche de Avena Cultivada (+ $0.50)' : 'Oat Milk (+ $0.50)'}
                        </option>
                        <option value="agua">
                          {language === 'es' ? 'En base a Agua de Vertiente' : 'Spring Water Base'}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-espresso/60 mb-1 font-bold uppercase tracking-wider">
                        {language === 'es' ? 'Dulzura / Toque' : 'Sweetness / Touch'}
                      </label>
                      <select
                        value={sweetnessOption}
                        onChange={(e) => setSweetnessOption(e.target.value)}
                        className="w-full bg-coffee-bg border border-espresso/20 rounded-full text-xs py-2 px-3.5 text-espresso focus:outline-none focus:border-espresso font-medium font-mono"
                        id="sweetness-option-select"
                      >
                        <option value="panela_imbabura">
                          {language === 'es' ? 'Panela Orgánica Imbabureña' : 'Organic Imbabura Panela'}
                        </option>
                        <option value="sin_azucar">
                          {language === 'es' ? 'Sin azúcar (Café puro de altura)' : 'Unsweetened (Pure high-altitude coffee)'}
                        </option>
                        <option value="miel">
                          {language === 'es' ? 'Cachito de Miel de Abeja (+ $0.25)' : 'Touch of Honey (+ $0.25)'}
                        </option>
                        <option value="estevia">
                          {language === 'es' ? 'Estevia Ecológica en gotas' : 'Organic Stevia drops'}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Preorder action inside details modal */}
                {interactiveMode && onAddToReservation && (
                  <div className="pt-4 flex items-center justify-between border-t border-espresso/15 mt-4 font-sans">
                    <span className="text-xs text-espresso/60 font-serif italic">
                      {language === 'es' ? '¿Quieres añadirlo pre-ordenado?' : 'Want to pre-order this?'}
                    </span>
                    <button
                      onClick={() => {
                        onAddToReservation(selectedItem);
                        setSelectedItem(null);
                      }}
                      className="bg-espresso hover:bg-espresso/90 text-coffee-bg font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-full cursor-pointer transition flex items-center gap-1.5 shadow-md"
                      id="modal-add-preorder-btn"
                    >
                      <LucideIcons.Plus className="w-4 h-4" />
                      <span>{t('menu.addToOrder', language)}</span>
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
