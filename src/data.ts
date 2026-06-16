/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MenuItem, Category, ReservationTable, BusinessConfig } from './types';
import drink01 from './assets/drink_01.jpg';
import drink02 from './assets/drink_02.jpg';
import drink03 from './assets/drink_03.jpg';
import drink04 from './assets/drink_04.jpg';
import drink05 from './assets/drink_05.jpg';
import drink06 from './assets/drink_06.jpg';
import drink07 from './assets/drink_07.jpg';
import drink08 from './assets/drink_08.jpg';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'hot_drinks',
    name: {
      es: 'Bebidas Calientes',
      en: 'Hot Drinks'
    },
    icon: 'Coffee',
    description: {
      es: 'Café de especialidad y bebidas calientes preparadas al instante.',
      en: 'Specialty coffee and hot drinks brewed fresh.'
    }
  },
  {
    id: 'frappes',
    name: {
      es: 'Frappés',
      en: 'Frappes'
    },
    icon: 'Sparkles',
    description: {
      es: 'Nuestras famosas bebidas heladas y cremosas con toppings especiales.',
      en: 'Our famous ice-blended, creamy drinks with special toppings.'
    }
  },
  {
    id: 'soft_drinks',
    name: {
      es: 'Bebidas Soft',
      en: 'Soft Drinks'
    },
    icon: 'Flame',
    description: {
      es: 'Bebidas refrescantes y frías para acompañar tus momentos.',
      en: 'Refreshing cold drinks to pair with your moments.'
    }
  }
];

export const INITIAL_PRODUCTS: MenuItem[] = [
  // Bebidas Calientes
  {
    id: 'espresso',
    name: { es: 'Espresso', en: 'Espresso' },
    description: {
      es: 'Un shot concentrado de nuestro espresso premium con notas a caramelo y chocolate.',
      en: 'A concentrated shot of our premium espresso with notes of caramel and chocolate.'
    },
    price: 1.60,
    category: 'hot_drinks',
    image: drink05,
    active: true,
    ingredients: {
      es: ['Espresso de especialidad', 'Crema chocolateada'],
      en: ['Specialty espresso', 'Chocolaty crema']
    },
    isSpecial: false,
    preparationTime: 2
  },
  {
    id: 'doble_espresso',
    name: { es: 'Doble Espresso', en: 'Double Espresso' },
    description: {
      es: 'Doble shot de espresso premium para una experiencia de sabor intensa.',
      en: 'Double shot of premium espresso for an intense flavor experience.'
    },
    price: 1.90,
    category: 'hot_drinks',
    image: drink05,
    active: true,
    ingredients: {
      es: ['Doble espresso de especialidad', 'Crema densa'],
      en: ['Double specialty espresso', 'Dense crema']
    },
    isSpecial: false,
    preparationTime: 2
  },
  {
    id: 'americano',
    name: { es: 'Americano', en: 'Americano' },
    description: {
      es: 'Espresso de especialidad alargado con agua caliente, suave pero con carácter.',
      en: 'Specialty espresso lengthened with hot water, smooth yet characterful.'
    },
    price: 2.00,
    category: 'hot_drinks',
    image: drink05,
    active: true,
    ingredients: {
      es: ['Espresso de especialidad', 'Agua caliente filtrada'],
      en: ['Specialty espresso', 'Filtered hot water']
    },
    isSpecial: false,
    preparationTime: 3
  },
  {
    id: 'capuccino',
    name: { es: 'Capuccino', en: 'Cappuccino' },
    description: {
      es: 'Espresso de especialidad balanceado con partes iguales de leche vaporizada y espuma de leche, coronado con un arte latte en forma de trébol.',
      en: 'Specialty espresso balanced with equal parts steamed milk and milk foam, topped with clover latte art.'
    },
    price: 2.60,
    category: 'hot_drinks',
    image: drink05,
    active: true,
    ingredients: {
      es: ['Espresso', 'Leche vaporizada', 'Espuma de leche', 'Arte de trébol'],
      en: ['Espresso', 'Steamed milk', 'Milk foam', 'Clover art']
    },
    isSpecial: false,
    preparationTime: 4
  },
  {
    id: 'mocaccino',
    name: { es: 'Mocaccino', en: 'Mocaccino' },
    description: {
      es: 'Combinación perfecta de espresso de especialidad, chocolate artesanal y leche vaporizada.',
      en: 'Perfect combination of specialty espresso, artisanal chocolate, and steamed milk.'
    },
    price: 3.00,
    category: 'hot_drinks',
    image: drink05,
    active: true,
    ingredients: {
      es: ['Espresso', 'Chocolate de la casa', 'Leche vaporizada'],
      en: ['Espresso', 'House chocolate', 'Steamed milk']
    },
    isSpecial: false,
    preparationTime: 4
  },
  {
    id: 'latte_regular',
    name: { es: 'Latte Regular', en: 'Regular Latte' },
    description: {
      es: 'Espresso de especialidad combinado con abundante leche vaporizada sedosa.',
      en: 'Specialty espresso combined with abundant silky steamed milk.'
    },
    price: 2.80,
    category: 'hot_drinks',
    image: drink05,
    active: true,
    ingredients: {
      es: ['Espresso', 'Leche vaporizada sedosa'],
      en: ['Espresso', 'Silky steamed milk']
    },
    isSpecial: false,
    preparationTime: 3
  },
  {
    id: 'latte_sabor',
    name: { es: 'Latte de Sabor', en: 'Flavored Latte' },
    description: {
      es: 'Nuestro latte clásico con una infusión de sirope a tu elección (vainilla, caramelo, avellana).',
      en: 'Our classic latte infused with a syrup of your choice (vanilla, caramel, hazelnut).'
    },
    price: 3.10,
    category: 'hot_drinks',
    image: drink05,
    active: true,
    ingredients: {
      es: ['Espresso', 'Leche vaporizada', 'Sirope de sabor'],
      en: ['Espresso', 'Steamed milk', 'Flavored syrup']
    },
    isSpecial: false,
    preparationTime: 3
  },
  {
    id: 'chocolate',
    name: { es: 'Chocolate Caliente', en: 'Hot Chocolate' },
    description: {
      es: 'Chocolate caliente artesanal elaborado con cacao ecuatoriano fino de aroma y leche cremosa.',
      en: 'Artisanal hot chocolate made with fine aroma Ecuadorian cocoa and creamy milk.'
    },
    price: 2.70,
    category: 'hot_drinks',
    image: drink05,
    active: true,
    ingredients: {
      es: ['Cacao ecuatoriano fino de aroma', 'Leche cremosa vaporizada'],
      en: ['Fine aroma Ecuadorian cocoa', 'Creamy steamed milk']
    },
    isSpecial: false,
    preparationTime: 3
  },
  {
    id: 'matcha',
    name: { es: 'Matcha Caliente', en: 'Hot Matcha' },
    description: {
      es: 'Té verde matcha de grado ceremonial vaporizado con leche de tu elección.',
      en: 'Ceremonial grade matcha green tea steamed with your choice of milk.'
    },
    price: 3.10,
    category: 'hot_drinks',
    image: drink05,
    active: true,
    ingredients: {
      es: ['Matcha ceremonial', 'Leche vaporizada'],
      en: ['Ceremonial matcha', 'Steamed milk']
    },
    isSpecial: false,
    preparationTime: 4
  },

  // Frappes
  {
    id: 'chayka_frap',
    name: { es: 'Chayka Frap', en: 'Chayka Frap' },
    description: {
      es: 'Nuestra bebida frapé insignia con espresso, chocolate y un toque especial de la casa.',
      en: 'Our signature frappe drink with espresso, chocolate, and a special house touch.'
    },
    price: 3.90,
    category: 'frappes',
    image: drink01,
    active: true,
    ingredients: {
      es: ['Espresso', 'Chocolate', 'Hielo licuado', 'Crema batida'],
      en: ['Espresso', 'Chocolate', 'Blended ice', 'Whipped cream']
    },
    isSpecial: false,
    preparationTime: 4
  },
  {
    id: 'frap_chocolate',
    name: { es: 'Frap Chocolate', en: 'Chocolate Frappe' },
    description: {
      es: 'Delicioso frapeado de chocolate premium decorado con salsa de chocolate y crema batida.',
      en: 'Delicious premium chocolate frappe decorated with chocolate sauce and whipped cream.'
    },
    price: 3.80,
    category: 'frappes',
    image: drink08,
    active: true,
    ingredients: {
      es: ['Chocolate premium', 'Leche entera', 'Crema batida', 'Salsa de chocolate'],
      en: ['Premium chocolate', 'Whole milk', 'Whipped cream', 'Chocolate sauce']
    },
    isSpecial: true,
    preparationTime: 4
  },
  {
    id: 'frap_caramelo',
    name: { es: 'Frap Caramelo', en: 'Caramel Frappe' },
    description: {
      es: 'Refrescante frapé con sirope de caramelo artesanal y un toque de crema batida.',
      en: 'Refreshing frappe with artisanal caramel syrup and a touch of whipped cream.'
    },
    price: 3.80,
    category: 'frappes',
    image: drink08,
    active: true,
    ingredients: {
      es: ['Sirope de caramelo', 'Leche entera', 'Hielo licuado', 'Crema batida'],
      en: ['Caramel syrup', 'Whole milk', 'Blended ice', 'Whipped cream']
    },
    isSpecial: false,
    preparationTime: 4
  },
  {
    id: 'frap_fresa',
    name: { es: 'Frap Fresa', en: 'Strawberry Frappe' },
    description: {
      es: 'Frapé a base de fresas frescas maduras de la zona y un toque dulce ideal para refrescarse.',
      en: 'Frappe made with fresh ripe local strawberries and a sweet touch, perfect for refreshing.'
    },
    price: 3.80,
    category: 'frappes',
    image: drink03,
    active: true,
    ingredients: {
      es: ['Fresas seleccionadas', 'Leche de campo', 'Crema batida', 'Sirope de fresa'],
      en: ['Selected strawberries', 'Farm milk', 'Whipped cream', 'Strawberry syrup']
    },
    isSpecial: true,
    preparationTime: 4
  },
  {
    id: 'frap_oreo',
    name: { es: 'Frap Oreo', en: 'Oreo Frappe' },
    description: {
      es: 'Frapé cremoso licuado con galletas Oreo originales, coronado con crema batida y trozos de galleta.',
      en: 'Creamy frappe blended with original Oreo cookies, topped with whipped cream and cookie pieces.'
    },
    price: 3.80,
    category: 'frappes',
    image: drink08,
    active: true,
    ingredients: {
      es: ['Galletas Oreo', 'Crema de leche', 'Hielo licuado', 'Crema batida'],
      en: ['Oreo cookies', 'Milk cream', 'Blended ice', 'Whipped cream']
    },
    isSpecial: false,
    preparationTime: 4
  },
  {
    id: 'frap_matcha',
    name: { es: 'Frap Matcha', en: 'Matcha Frappe' },
    description: {
      es: 'Matcha ceremonial licuado con leche y hielo, ideal para una dosis de energía refrescante.',
      en: 'Ceremonial matcha blended with milk and ice, perfect for a refreshing dose of energy.'
    },
    price: 3.90,
    category: 'frappes',
    image: drink06,
    active: true,
    ingredients: {
      es: ['Matcha ceremonial', 'Leche de coco o almendras', 'Hielo licuado', 'Crema batida'],
      en: ['Ceremonial matcha', 'Coconut or almond milk', 'Blended ice', 'Whipped cream']
    },
    isSpecial: true,
    preparationTime: 4
  },

  // Soft Drinks
  {
    id: 'limonada_imperial',
    name: { es: 'Limonada Imperial', en: 'Imperial Lemonade' },
    description: {
      es: 'Bebida cítrica refrescante elaborada con limón real, agua gasificada y menta fresca.',
      en: 'Refreshing citrus drink made with real lemon, sparkling water, and fresh mint.'
    },
    price: 2.30,
    category: 'soft_drinks',
    image: drink02,
    active: true,
    ingredients: {
      es: ['Zumo de limón real', 'Agua gasificada', 'Hojas de menta', 'Hielo'],
      en: ['Real lemon juice', 'Sparkling water', 'Mint leaves', 'Ice']
    },
    isSpecial: false,
    preparationTime: 3
  },
  {
    id: 'iced_te_verde',
    name: { es: 'Iced Té Verde', en: 'Iced Green Tea' },
    description: {
      es: 'Té verde premium infusionado en frío con notas cítricas y servido sobre abundantes hielos.',
      en: 'Premium green tea cold-brewed with citrus notes and served over plenty of ice.'
    },
    price: 3.60,
    category: 'soft_drinks',
    image: drink04,
    active: true,
    ingredients: {
      es: ['Té verde de hojas sueltas', 'Limón', 'Hojas de menta', 'Hielo'],
      en: ['Loose leaf green tea', 'Lemon', 'Mint leaves', 'Ice']
    },
    isSpecial: false,
    preparationTime: 3
  },
  {
    id: 'iced_te_frutos_rojos',
    name: { es: 'Iced Té frutos rojos', en: 'Iced Red Berries Tea' },
    description: {
      es: 'Infusión helada de frutos rojos silvestres con un toque dulce y refrescante.',
      en: 'Iced infusion of wild red berries with a sweet and refreshing touch.'
    },
    price: 3.60,
    category: 'soft_drinks',
    image: drink04,
    active: true,
    ingredients: {
      es: ['Frutos rojos de Otavalo', 'Infusión de la casa', 'Hielo'],
      en: ['Red berries from Otavalo', 'House infusion', 'Ice']
    },
    isSpecial: false,
    preparationTime: 3
  },
  {
    id: 'jugo',
    name: { es: 'Jugo', en: 'Juice' },
    description: {
      es: 'Jugo recién exprimido de frutas de la temporada seleccionadas.',
      en: 'Freshly squeezed juice from selected seasonal fruits.'
    },
    price: 2.50,
    category: 'soft_drinks',
    image: drink02,
    active: true,
    ingredients: {
      es: ['Frutas de temporada', 'Agua filtrada', 'Hielo'],
      en: ['Seasonal fruits', 'Filtered water', 'Ice']
    },
    isSpecial: false,
    preparationTime: 3
  },
  {
    id: 'batido',
    name: { es: 'Batido', en: 'Smoothie' },
    description: {
      es: 'Batido cremoso de fruta natural preparado a base de agua o leche.',
      en: 'Creamy natural fruit smoothie prepared with water or milk base.'
    },
    price: 2.80,
    category: 'soft_drinks',
    image: drink02,
    active: true,
    ingredients: {
      es: ['Fruta a elegir', 'Leche o agua', 'Hielo picado'],
      en: ['Fruit of choice', 'Milk or water', 'Crushed ice']
    },
    isSpecial: false,
    preparationTime: 3
  },
  {
    id: 'iced_latte_caramelo',
    name: { es: 'Iced Latte Caramelo', en: 'Iced Caramel Latte' },
    description: {
      es: 'Doble shot de espresso frío, leche fresca, hielo y sirope de caramelo artesanal.',
      en: 'Double shot of cold espresso, fresh milk, ice, and artisanal caramel syrup.'
    },
    price: 3.80,
    category: 'soft_drinks',
    image: drink04,
    active: true,
    ingredients: {
      es: ['Doble espresso', 'Leche fresca de campo', 'Sirope de caramelo', 'Hielo'],
      en: ['Double espresso', 'Fresh farm milk', 'Caramel syrup', 'Ice']
    },
    isSpecial: true,
    preparationTime: 3
  },
  {
    id: 'iced_latte_vainilla',
    name: { es: 'Iced Latte Vainilla', en: 'Iced Vanilla Latte' },
    description: {
      es: 'Expreso frío con leche cremosa vaporizada en frío y extracto de vainilla natural.',
      en: 'Cold espresso with cold frothed creamy milk and natural vanilla extract.'
    },
    price: 3.10,
    category: 'soft_drinks',
    image: drink04,
    active: true,
    ingredients: {
      es: ['Espresso de especialidad', 'Leche entera', 'Extracto de vainilla', 'Hielo'],
      en: ['Specialty espresso', 'Whole milk', 'Vanilla extract', 'Ice']
    },
    isSpecial: true,
    preparationTime: 3
  },
  {
    id: 'iced_americano',
    name: { es: 'Iced Americano', en: 'Iced Americano' },
    description: {
      es: 'Nuestra clásica extracción americana servida bien fría sobre cubos de hielo.',
      en: 'Our classic American extraction served cold over ice cubes.'
    },
    price: 2.00,
    category: 'soft_drinks',
    image: drink04,
    active: true,
    ingredients: {
      es: ['Espresso', 'Agua fría', 'Hielo'],
      en: ['Espresso', 'Cold water', 'Ice']
    },
    isSpecial: true,
    preparationTime: 3
  }
];

export const INITIAL_TABLES: ReservationTable[] = [
  {
    id: 't_deck_1',
    name: {
      es: 'Mesa Cascada Mirador 1 (Premium)',
      en: 'Waterfall Lookout Table 1 (Premium)'
    },
    capacity: 2,
    area: 'waterfall_deck',
    minimumConsumption: 12.00
  },
  {
    id: 't_deck_2',
    name: {
      es: 'Mesa Cascada Mirador 2 (Premium)',
      en: 'Waterfall Lookout Table 2 (Premium)'
    },
    capacity: 4,
    area: 'waterfall_deck',
    minimumConsumption: 20.00
  },
  {
    id: 't_fire_1',
    name: {
      es: 'Sofá Chimenea Acogedor 1',
      en: 'Cozy Fireplace Sofa 1'
    },
    capacity: 2,
    area: 'fireplace_cozy',
    minimumConsumption: 8.00
  },
  {
    id: 't_fire_2',
    name: {
      es: 'Mesa Chimenea Familiar 2',
      en: 'Family Fireplace Table 2'
    },
    capacity: 6,
    area: 'fireplace_cozy',
    minimumConsumption: 18.00
  },
  {
    id: 't_ind_1',
    name: {
      es: 'Mesa Nido de Piedra 1',
      en: 'Stone Nest Table 1'
    },
    capacity: 4,
    area: 'indoor_premium',
    minimumConsumption: 10.00
  },
  {
    id: 't_ind_2',
    name: {
      es: 'Mesa Madera Ancestral 2',
      en: 'Ancestral Wood Table 2'
    },
    capacity: 4,
    area: 'indoor_premium',
    minimumConsumption: 10.00
  },
  {
    id: 't_terr_1',
    name: {
      es: 'Mirador Terraza Cóndor 1',
      en: 'Condor Terrace Lookout 1'
    },
    capacity: 2,
    area: 'terrace_panoramic',
    minimumConsumption: 15.00
  },
  {
    id: 't_terr_2',
    name: {
      es: 'Mesa Imbabura Vista 2',
      en: 'Imbabura View Table 2'
    },
    capacity: 4,
    area: 'terrace_panoramic',
    minimumConsumption: 15.00
  }
];

export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  name: 'Chayka Coffee',
  location: 'Sendero a la Cascada de Peguche, Otavalo, Imbabura, Ecuador',
  locationLink: 'https://maps.app.goo.gl/9BypY1hXFid8S2XF7',
  whatsappNumber: '+593987163354',
  minPeopleReservation: 1,
  maxPeopleReservation: 10,
  schedules: [
    { day: 'Lunes a Viernes', hours: '08:00 AM - 07:00 PM' },
    { day: 'Sábado y Domingo', hours: '07:30 AM - 09:30 PM' }
  ],
  timeSlots: [
    '08:00',
    '09:30',
    '11:00',
    '12:30',
    '14:00',
    '15:30',
    '17:00',
    '18:30',
    '20:00'
  ],
  transferQrUrl: null
};
