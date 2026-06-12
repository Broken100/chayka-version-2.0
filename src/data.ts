/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MenuItem, Category, ReservationTable, BusinessConfig } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'specialty_coffee',
    name: 'Cafetería de Especialidad',
    icon: 'Coffee',
    description: 'Granos de altura del Valle de Intag y Loja, tostados con precisión.'
  },
  {
    id: 'traditional',
    name: 'Herencia y Tradición',
    icon: 'Flame',
    description: 'Sabores autóctonos ecuatorianos y recetas andinas con amor local.'
  },
  {
    id: 'bakery',
    name: 'Postres & Repostería',
    icon: 'Cookie',
    description: 'Acompañantes dulces recién horneados para elevar tu experiencia.'
  },
  {
    id: 'cold_drinks',
    name: 'Bebidas Heladas y Cocteles',
    icon: 'Sparkles',
    description: 'Refrescantes fusiones frutales y variaciones frías creativas.'
  }
];

export const INITIAL_PRODUCTS: MenuItem[] = [
  {
    id: 'espresso_chayka',
    name: 'Espresso Intenso Chayka',
    description: 'Extracción densa y perfecta de nuestra mezcla exclusiva de especialidad. Servido en taza de diseño Chayka para saborear la esencia pura del grano.',
    price: 2.00,
    category: 'specialty_coffee',
    image: '/input_file_13.png',
    fallbackImage: 'https://images.unsplash.com/photo-151097252790b-af4f42d914a9?auto=format&fit=crop&q=80&w=600',
    active: true,
    ingredients: ['Grano Arábica de altura', 'Extracción intensa', 'Crema chocolateada'],
    isSpecial: false,
    preparationTime: 3
  },
  {
    id: 'latte_clover',
    name: 'Latte Clover de Finca',
    description: 'Vaporizado sedoso de leche fresca de finca con un expreso cargado, coronado con un arte latte perfecto en forma de trébol de cuatro hojas.',
    price: 3.00,
    category: 'specialty_coffee',
    image: '/input_file_5.png',
    fallbackImage: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600',
    active: true,
    ingredients: ['Espresso de especialidad', 'Leche vaporizada artesanal', 'Arte en superficie'],
    isSpecial: true,
    preparationTime: 4
  },
  {
    id: 'iced_latte_chayka',
    name: 'Iced Latte Chayka',
    description: 'Nuestra bebida fría estrella. Capas de leche cremosa fría y doble shot de espresso de especialidad sobre hielo, servido en nuestro vaso icónico Chayka.',
    price: 3.50,
    category: 'specialty_coffee',
    image: '/input_file_3.png',
    fallbackImage: 'https://images.unsplash.com/photo-1461023058883-69c9b3081ce3?auto=format&fit=crop&q=80&w=600',
    active: true,
    ingredients: ['Doble espresso', 'Leche de vaca fría', 'Hielo artesanal', 'Sirope de caña (opcional)'],
    isSpecial: true,
    preparationTime: 3
  },
  {
    id: 'sunset_pitahaya',
    name: 'Sunset Pitahaya (Dragon Fruit)',
    description: 'Bebida refrescante imperial preparada con pulpa fresca de pitahaya (dragon fruit) de la región, agua de vertiente filtrada, notas cítricas y semillas naturales.',
    price: 3.25,
    category: 'cold_drinks',
    image: '/input_file_6.png',
    fallbackImage: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600',
    active: true,
    ingredients: ['Pulpa de pitahaya roja', 'Zumo de limón real', 'Menta fresca', 'Hielo picado'],
    isSpecial: true,
    preparationTime: 3
  },
  {
    id: 'affogato_especial',
    name: 'Affogato de Especialidad',
    description: 'El postre del caficultor hecho arte. Una generosa bola de helado artesanal de vainilla ahogada en un expreso de especialidad caliente y decorada con granos de café.',
    price: 3.75,
    category: 'specialty_coffee',
    image: '/input_file_2.png',
    fallbackImage: 'https://images.unsplash.com/photo-1594911774802-8822a707caff?auto=format&fit=crop&q=80&w=600',
    active: true,
    ingredients: ['Helado artesanal de vainilla', 'Espresso caliente recién extraído', 'Granos de café crujientes'],
    isSpecial: true,
    preparationTime: 4
  },
  {
    id: 'mini_carrot_cake',
    name: 'Mini Carrot Cake Chayka',
    description: 'Deliciosos mini pasteles individuales de zanahoria, especias andinas y nueces, cubiertos con una capa tersa de frosting de queso crema y mini zanahorias hechas a mano.',
    price: 2.50,
    category: 'bakery',
    image: '/input_file_0.png',
    fallbackImage: 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?auto=format&fit=crop&q=80&w=600',
    active: true,
    ingredients: ['Harina de nuez y zanahoria', 'Especias tradicionales', 'Frosting de queso crema suave', 'Mucho amor'],
    isSpecial: true,
    preparationTime: 2
  },
  {
    id: 'cheesecake_frutos_rojos',
    name: 'Cheesecake de Frutos Rojos',
    description: 'Suave y aterciopelado pastel de queso crema sobre base crocante de galleta artesanal, cubierto de compota espesa de frambuesa, fresa y moras de Otavalo.',
    price: 3.50,
    category: 'bakery',
    image: '/input_file_1.png',
    fallbackImage: 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?auto=format&fit=crop&q=80&w=600',
    active: true,
    ingredients: ['Queso crema premium', 'Base de galleta a la leña', 'Compota artesanal de frutos rojos', 'Frutilla entera'],
    isSpecial: false,
    preparationTime: 3
  },
  {
    id: 'matcha_organico_coco',
    name: 'Matcha Orgánico de Coco',
    description: 'Té matcha ceremonial importado de la más alta calidad, batido al estilo tradicional, servido frío con leche de coco hidratante y un toque de endulzante natural.',
    price: 3.50,
    category: 'cold_drinks',
    image: '/input_file_15.png',
    fallbackImage: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600',
    active: true,
    ingredients: ['Té matcha ceremonial', 'Leche de coco orgánica', 'Hierbabuena decorativa', 'Hielo'],
    isSpecial: false,
    preparationTime: 4
  },
  {
    id: 'croissant_hot_matcha',
    name: 'Croissant Caliente con Chocolate',
    description: 'Croissant de mantequilla súper hojaldrado, recién horneado y decorado con hilos de chocolate amargo ecuatoriano, ideal para acompañar tus tardes de lectura junto al sendero.',
    price: 2.75,
    category: 'bakery',
    image: '/input_file_11.png',
    fallbackImage: 'https://images.unsplash.com/photo-1530610476181-d834309647fc?auto=format&fit=crop&q=80&w=600',
    active: true,
    ingredients: ['Masa de hojaldre de mantequilla', 'Hilos de cacao amargo 70%', 'Toque de azúcar glass'],
    isSpecial: false,
    preparationTime: 2
  }
];

export const INITIAL_TABLES: ReservationTable[] = [
  {
    id: 't_deck_1',
    name: 'Mesa Cascada Mirador 1 (Premium)',
    capacity: 2,
    area: 'waterfall_deck',
    minimumConsumption: 12.00
  },
  {
    id: 't_deck_2',
    name: 'Mesa Cascada Mirador 2 (Premium)',
    capacity: 4,
    area: 'waterfall_deck',
    minimumConsumption: 20.00
  },
  {
    id: 't_fire_1',
    name: 'Sofá Chimenea Acogedor 1',
    capacity: 2,
    area: 'fireplace_cozy',
    minimumConsumption: 8.00
  },
  {
    id: 't_fire_2',
    name: 'Mesa Chimenea Familiar 2',
    capacity: 6,
    area: 'fireplace_cozy',
    minimumConsumption: 18.00
  },
  {
    id: 't_ind_1',
    name: 'Mesa Nido de Piedra 1',
    capacity: 4,
    area: 'indoor_premium',
    minimumConsumption: 10.00
  },
  {
    id: 't_ind_2',
    name: 'Mesa Madera Ancestral 2',
    capacity: 4,
    area: 'indoor_premium',
    minimumConsumption: 10.00
  },
  {
    id: 't_terr_1',
    name: 'Mirador Terraza Cóndor 1',
    capacity: 2,
    area: 'terrace_panoramic',
    minimumConsumption: 15.00
  },
  {
    id: 't_terr_2',
    name: 'Mesa Imbabura Vista 2',
    capacity: 4,
    area: 'terrace_panoramic',
    minimumConsumption: 15.00
  }
];

export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  name: 'Chayka Coffee',
  location: 'Sendero a la Cascada de Peguche, Otavalo, Imbabura, Ecuador',
  locationLink: 'https://maps.app.goo.gl/9BypY1hXFid8S2XF7', // Realistic/placeholder google map pin
  whatsappNumber: '+593987163354', // Real-looking Ecuador number for Chayka Coffee
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
  ]
};
