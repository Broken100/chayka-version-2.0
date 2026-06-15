import { Language } from '../types';

export const translations = {
  es: {
    nav: {
      brand: 'Chayka Coffee',
      home: 'Inicio',
      menu: 'Menú',
      booking: 'Reservas',
      admin: 'Administración'
    },
    home: {
      heroTitle: 'Cafetería de Especialidad & Experiencia Natural',
      heroSubtitle: 'Disfruta de granos seleccionados junto a la Cascada de Peguche, Otavalo. Un santuario de sabor, fuego y bosque.',
      ctaMenu: 'Ver Menú',
      ctaBooking: 'Reservar Mesa',
      experienceTitle: 'Nuestra Experiencia',
      experienceSubtitle: 'Un santuario diseñado para los sentidos.',
      features: {
        waterfall: {
          title: 'Muelle Cascada',
          desc: 'Escucha el fluir del agua mientras disfrutas de tu café de especialidad.'
        },
        fire: {
          title: 'Calidez de Hogar',
          desc: 'Espacios junto a la chimenea para resguardarte del frío andino.'
        },
        local: {
          title: 'Orgullo Local',
          desc: 'Granos de Intag y Loja con repostería recién horneada con amor.'
        }
      }
    },
    menu: {
      title: 'Nuestra Carta',
      subtitle: 'Granos de especialidad y delicias preparadas con ingredientes de origen.',
      special: 'Especial de la Casa',
      prepTime: 'Tiempo de prep.',
      mins: 'min',
      ingredients: 'Ingredientes',
      price: 'Precio',
      rating: 'Valoración',
      addToOrder: 'Agregar a mi pedido',
      removeFromOrder: 'Quitar',
      orderSummary: 'Tu Pedido',
      emptyOrder: 'No has agregado elementos a tu reserva aún.',
      minConsumptionAlert: 'Consumo mínimo para esta mesa:',
      totalOrder: 'Total Pedido',
      categories: {
        hot_drinks: 'Bebidas Calientes',
        frappes: 'Frappés',
        soft_drinks: 'Bebidas Soft'
      },
      products: {
        espresso: {
          name: 'Espresso',
          description: 'Un shot concentrado de nuestro espresso premium con notas a caramelo y chocolate.',
          ingredients: ['Espresso de especialidad', 'Crema chocolateada']
        },
        doble_espresso: {
          name: 'Doble Espresso',
          description: 'Doble shot de espresso premium para una experiencia de sabor intensa.',
          ingredients: ['Doble espresso de especialidad', 'Crema densa']
        },
        americano: {
          name: 'Americano',
          description: 'Espresso de especialidad alargado con agua caliente, suave pero con carácter.',
          ingredients: ['Espresso de especialidad', 'Agua caliente filtrada']
        },
        capuccino: {
          name: 'Capuccino',
          description: 'Espresso de especialidad balanceado con partes iguales de leche vaporizada y espuma de leche, coronado con un arte latte en forma de trébol.',
          ingredients: ['Espresso', 'Leche vaporizada', 'Espuma de leche', 'Arte de trébol']
        },
        mocaccino: {
          name: 'Mocaccino',
          description: 'Combinación perfecta de espresso de especialidad, chocolate artesanal y leche vaporizada.',
          ingredients: ['Espresso', 'Chocolate de la casa', 'Leche vaporizada']
        },
        latte_regular: {
          name: 'Latte Regular',
          description: 'Espresso de especialidad combinado con abundante leche vaporizada sedosa.',
          ingredients: ['Espresso', 'Leche vaporizada sedosa']
        },
        latte_sabor: {
          name: 'Latte de Sabor',
          description: 'Nuestro latte clásico con una infusión de sirope a tu elección (vainilla, caramelo, avellana).',
          ingredients: ['Espresso', 'Leche vaporizada', 'Sirope de sabor']
        },
        chocolate: {
          name: 'Chocolate Caliente',
          description: 'Chocolate caliente artesanal elaborado con cacao ecuatoriano fino de aroma y leche cremosa.',
          ingredients: ['Cacao ecuatoriano fino de aroma', 'Leche cremosa vaporizada']
        },
        matcha: {
          name: 'Matcha Caliente',
          description: 'Té verde matcha de grado ceremonial vaporizado con leche de tu elección.',
          ingredients: ['Matcha ceremonial', 'Leche vaporizada']
        },
        chayka_frap: {
          name: 'Chayka Frap',
          description: 'Nuestra bebida frapé insignia con espresso, chocolate y un toque especial de la casa.',
          ingredients: ['Espresso', 'Chocolate', 'Hielo licuado', 'Crema batida']
        },
        frap_chocolate: {
          name: 'Frap Chocolate',
          description: 'Delicioso frapeado de chocolate premium decorado con salsa de chocolate y crema batida.',
          ingredients: ['Chocolate premium', 'Leche entera', 'Crema batida', 'Salsa de chocolate']
        },
        frap_caramelo: {
          name: 'Frap Caramelo',
          description: 'Refrescante frapé con sirope de caramelo artesanal y un toque de crema batida.',
          ingredients: ['Sirope de caramelo', 'Leche entera', 'Hielo licuado', 'Crema batida']
        },
        frap_fresa: {
          name: 'Frap Fresa',
          description: 'Frapé a base de fresas frescas maduras de la zona y un toque dulce ideal para refrescarse.',
          ingredients: ['Fresas seleccionadas', 'Leche de campo', 'Crema batida', 'Sirope de fresa']
        },
        frap_oreo: {
          name: 'Frap Oreo',
          description: 'Frapé cremoso licuado con galletas Oreo originales, coronado con crema batida y trozos de galleta.',
          ingredients: ['Galletas Oreo', 'Crema de leche', 'Hielo licuado', 'Crema batida']
        },
        frap_matcha: {
          name: 'Frap Matcha',
          description: 'Matcha ceremonial licuado con leche y hielo, ideal para una dosis de energía refrescante.',
          ingredients: ['Matcha ceremonial', 'Leche de coco o almendras', 'Hielo licuado', 'Crema batida']
        },
        limonada_imperial: {
          name: 'Limonada Imperial',
          description: 'Bebida cítrica refrescante elaborada con limón real, agua gasificada y menta fresca.',
          ingredients: ['Zumo de limón real', 'Agua gasificada', 'Hojas de menta', 'Hielo']
        },
        iced_te_verde: {
          name: 'Iced Té Verde',
          description: 'Té verde premium infusionado en frío con notas cítricas y servido sobre abundantes hielos.',
          ingredients: ['Té verde de hojas sueltas', 'Limón', 'Hojas de menta', 'Hielo']
        },
        iced_te_frutos_rojos: {
          name: 'Iced Té frutos rojos',
          description: 'Infusión helada de frutos rojos silvestres con un toque dulce y refrescante.',
          ingredients: ['Frutos rojos de Otavalo', 'Infusión de la casa', 'Hielo']
        },
        jugo: {
          name: 'Jugo',
          description: 'Jugo recién exprimido de frutas de la temporada seleccionadas.',
          ingredients: ['Frutas de temporada', 'Agua filtrada', 'Hielo']
        },
        batido: {
          name: 'Batido',
          description: 'Batido cremoso de fruta natural preparado a base de agua o leche.',
          ingredients: ['Fruta a elegir', 'Leche o agua', 'Hielo picado']
        },
        iced_latte_caramelo: {
          name: 'Iced Latte Caramelo',
          description: 'Doble shot de espresso frío, leche fresca, hielo y sirope de caramelo artesanal.',
          ingredients: ['Doble espresso', 'Leche fresca de campo', 'Sirope de caramelo', 'Hielo']
        },
        iced_latte_vainilla: {
          name: 'Iced Latte Vainilla',
          description: 'Expreso frío con leche cremosa vaporizada en frío y extracto de vainilla natural.',
          ingredients: ['Espresso de especialidad', 'Leche entera', 'Extracto de vainilla', 'Hielo']
        },
        iced_americano: {
          name: 'Iced Americano',
          description: 'Nuestra clásica extracción americana servida bien fría sobre cubos de hielo.',
          ingredients: ['Espresso', 'Agua fría', 'Hielo']
        }
      }
    },
    booking: {
      title: 'Reserva tu Mesa',
      subtitle: 'Asegura tu lugar en uno de nuestros exclusivos espacios.',
      step1: 'Elige tu Mesa',
      step2: 'Tus Datos',
      step3: 'Confirmar & Pagar',
      tableSelector: {
        title: 'Selecciona una Mesa y Zona',
        minConsumption: 'Consumo mín. requerido:',
        capacity: 'Capacidad:',
        seats: 'personas',
        areas: {
          waterfall_deck: 'Muelle Cascada (Exterior)',
          fireplace_cozy: 'Chimenea Acogedora (Interior)',
          indoor_premium: 'Salón Premium (Interior)',
          terrace_panoramic: 'Terraza Vista Cóndor (Semi-exterior)'
        },
        selectPrompt: 'Selecciona una mesa en el mapa o lista para continuar.',
        selected: 'Mesa seleccionada'
      },
      form: {
        name: 'Nombre Completo',
        namePlaceholder: 'Ej. Juan Pérez',
        email: 'Correo Electrónico',
        emailPlaceholder: 'Ej. juan@correo.com',
        phone: 'Teléfono Móvil',
        phonePlaceholder: 'Ej. +593 98 765 4321',
        date: 'Fecha de Reserva',
        time: 'Hora de Reserva',
        guests: 'Número de Acompañantes',
        notes: 'Notas Especiales (Alergias, cumpleaños, etc.)',
        notesPlaceholder: 'Ej. Prefiero mesa cerca de la ventana...',
        submit: 'Proceder al Pago',
        validation: {
          nameRequired: 'El nombre es obligatorio',
          emailRequired: 'El correo electrónico es obligatorio',
          emailInvalid: 'Por favor, introduce un correo electrónico válido',
          phoneRequired: 'El teléfono es obligatorio',
          phoneInvalid: 'Introduce un número de teléfono válido (ej. +593987654321)',
          dateRequired: 'La fecha es obligatoria',
          timeRequired: 'La hora es obligatoria',
          guestsMin: 'Debe haber al menos 1 persona',
          guestsMax: 'La capacidad máxima de la mesa seleccionada es de {max} personas',
          tableRequired: 'Debes seleccionar una mesa'
        }
      }
    },
    payment: {
      title: 'Pasarela de Pago Simulada',
      subtitle: 'Para confirmar tu reserva y asegurar la mesa, requerimos la validación de un pago de garantía.',
      reservationSummary: 'Resumen de Reserva',
      customer: 'Cliente:',
      date: 'Fecha & Hora:',
      table: 'Mesa:',
      amountToPay: 'Monto a Validar:',
      cardNumber: 'Número de Tarjeta',
      cardNumberPlaceholder: '0000 0000 0000 0000',
      expiry: 'Vencimiento',
      expiryPlaceholder: 'MM/AA',
      cvv: 'CVV',
      cvvPlaceholder: '123',
      payButton: 'Simular Pago Exitoso',
      failButton: 'Simular Pago Fallido',
      cancel: 'Cancelar Pago',
      processing: 'Procesando transacción segura...',
      successTitle: '¡Pago Validado con Éxito!',
      successDesc: 'Se ha registrado tu pago de garantía. Tu mesa está reservada.',
      failedTitle: 'Pago Rechazado',
      failedDesc: 'No pudimos validar la transacción. Intenta nuevamente.',
      whatsappNotice: 'Tu reserva se ha guardado en estado CONFIRMADA. Para agilizar la atención, puedes enviar el comprobante directamente a nuestro WhatsApp.'
    },
    admin: {
      title: 'Panel de Control de Reservas',
      subtitle: 'Monitorea reservas en tiempo real y gestiona el menú de la cafetería.',
      tabs: {
        kanban: 'Tablero Kanban de Reservas',
        menu: 'Gestor del Menú'
      },
      stats: {
        total: 'Reservas Totales',
        confirmed: 'Confirmadas',
        pending: 'Pendientes',
        cancelled: 'Canceladas',
        occupancy: 'Ocupación de Mesas'
      },
      columns: {
        pending: 'Pendientes de Pago',
        confirmed: 'Confirmadas',
        cancelled: 'Canceladas'
      },
      kanban: {
        dragNotice: 'Arrastra las tarjetas o usa los selectores para actualizar estados.',
        table: 'Mesa:',
        guests: 'Acompañantes:',
        total: 'Total:',
        payment: 'Pago:',
        updateStatus: 'Cambiar Estado',
        clientDetails: 'Detalles del Cliente',
        phone: 'Teléfono:',
        email: 'Email:',
        date: 'Fecha:',
        time: 'Hora:',
        notes: 'Notas:'
      },
      menuManager: {
        title: 'Gestor del Menú',
        subtitle: 'Activa o desactiva productos, modifica precios y ajusta tiempos de preparación.',
        addProduct: 'Agregar Producto (Mock)',
        product: 'Producto',
        category: 'Categoría',
        price: 'Precio',
        prepTime: 'Tiempo Prep.',
        status: 'Estado',
        actions: 'Acciones',
        active: 'Activo',
        inactive: 'Inactivo',
        edit: 'Editar',
        save: 'Guardar',
        cancel: 'Cancelar'
      }
    },
    toasts: {
      reservationCreated: '¡Reserva creada con éxito! Se ha enviado una notificación.',
      statusUpdated: 'Estado de reserva actualizado a {status}.',
      menuUpdated: 'Producto {name} actualizado correctamente.',
      paymentSuccess: 'Pago de reserva {id} simulado con éxito.',
      paymentFailed: 'El pago para la reserva {id} ha fallado.',
      welcome: '¡Hola! Te damos la bienvenida a la experiencia Chayka Coffee. Explora el menú andino y asegura tu mesa junto a la cascada hoy.',
      trafficSim: 'Un cliente acaba de reservar el "{table}" para {time}. ¡Pocos espacios libres hoy!'
    }
  },
  en: {
    nav: {
      brand: 'Chayka Coffee',
      home: 'Home',
      menu: 'Menu',
      booking: 'Bookings',
      admin: 'Admin'
    },
    home: {
      heroTitle: 'Specialty Coffee & Nature Experience',
      heroSubtitle: 'Enjoy handpicked beans next to the Peguche Waterfall, Otavalo. A sanctuary of flavor, fire, and forest.',
      ctaMenu: 'View Menu',
      ctaBooking: 'Book a Table',
      experienceTitle: 'Our Experience',
      experienceSubtitle: 'A sanctuary designed for the senses.',
      features: {
        waterfall: {
          title: 'Waterfall Deck',
          desc: 'Listen to the flowing water while enjoying your specialty coffee.'
        },
        fire: {
          title: 'Home Warmth',
          desc: 'Cozy spaces next to the fireplace to shelter from the Andean cold.'
        },
        local: {
          title: 'Local Pride',
          desc: 'High-altitude beans from Intag and Loja paired with pastries baked fresh with love.'
        }
      }
    },
    menu: {
      title: 'Our Menu',
      subtitle: 'Specialty coffee beans and delicacies prepared with locally sourced ingredients.',
      special: 'House Special',
      prepTime: 'Prep time',
      mins: 'min',
      ingredients: 'Ingredients',
      price: 'Price',
      rating: 'Rating',
      addToOrder: 'Add to my booking',
      removeFromOrder: 'Remove',
      orderSummary: 'Your Order',
      emptyOrder: 'You haven\'t added items to your booking yet.',
      minConsumptionAlert: 'Minimum consumption for this table:',
      totalOrder: 'Order Total',
      categories: {
        hot_drinks: 'Hot Drinks',
        frappes: 'Frappes',
        soft_drinks: 'Soft Drinks'
      },
      products: {
        espresso: {
          name: 'Espresso',
          description: 'A concentrated shot of our premium espresso with notes of caramel and chocolate.',
          ingredients: ['Specialty espresso', 'Chocolaty crema']
        },
        doble_espresso: {
          name: 'Double Espresso',
          description: 'Double shot of premium espresso for an intense flavor experience.',
          ingredients: ['Double specialty espresso', 'Dense crema']
        },
        americano: {
          name: 'Americano',
          description: 'Specialty espresso lengthened with hot water, smooth yet characterful.',
          ingredients: ['Specialty espresso', 'Filtered hot water']
        },
        capuccino: {
          name: 'Cappuccino',
          description: 'Specialty espresso balanced with equal parts steamed milk and milk foam, topped with clover latte art.',
          ingredients: ['Espresso', 'Steamed milk', 'Milk foam', 'Clover art']
        },
        mocaccino: {
          name: 'Mocaccino',
          description: 'Perfect combination of specialty espresso, artisanal chocolate, and steamed milk.',
          ingredients: ['Espresso', 'House chocolate', 'Steamed milk']
        },
        latte_regular: {
          name: 'Regular Latte',
          description: 'Specialty espresso combined with abundant silky steamed milk.',
          ingredients: ['Espresso', 'Silky steamed milk']
        },
        latte_sabor: {
          name: 'Flavored Latte',
          description: 'Our classic latte infused with a syrup of your choice (vanilla, caramel, hazelnut).',
          ingredients: ['Espresso', 'Steamed milk', 'Flavored syrup']
        },
        chocolate: {
          name: 'Hot Chocolate',
          description: 'Artisanal hot chocolate made with fine aroma Ecuadorian cocoa and creamy milk.',
          ingredients: ['Fine aroma Ecuadorian cocoa', 'Creamy steamed milk']
        },
        matcha: {
          name: 'Hot Matcha',
          description: 'Ceremonial grade matcha green tea steamed with your choice of milk.',
          ingredients: ['Ceremonial matcha', 'Steamed milk']
        },
        chayka_frap: {
          name: 'Chayka Frap',
          description: 'Our signature frappe drink with espresso, chocolate, and a special house touch.',
          ingredients: ['Espresso', 'Chocolate', 'Blended ice', 'Whipped cream']
        },
        frap_chocolate: {
          name: 'Chocolate Frappe',
          description: 'Delicious premium chocolate frappe decorated with chocolate sauce and whipped cream.',
          ingredients: ['Premium chocolate', 'Whole milk', 'Whipped cream', 'Chocolate sauce']
        },
        frap_caramelo: {
          name: 'Caramel Frappe',
          description: 'Refreshing frappe with artisanal caramel syrup and a touch of whipped cream.',
          ingredients: ['Caramel syrup', 'Whole milk', 'Blended ice', 'Whipped cream']
        },
        frap_fresa: {
          name: 'Strawberry Frappe',
          description: 'Frappe made with fresh ripe local strawberries and a sweet touch, perfect for refreshing.',
          ingredients: ['Selected strawberries', 'Farm milk', 'Whipped cream', 'Strawberry syrup']
        },
        frap_oreo: {
          name: 'Oreo Frappe',
          description: 'Creamy frappe blended with original Oreo cookies, topped with whipped cream and cookie pieces.',
          ingredients: ['Oreo cookies', 'Milk cream', 'Blended ice', 'Whipped cream']
        },
        frap_matcha: {
          name: 'Matcha Frappe',
          description: 'Ceremonial matcha blended with milk and ice, perfect for a refreshing dose of energy.',
          ingredients: ['Ceremonial matcha', 'Coconut or almond milk', 'Blended ice', 'Whipped cream']
        },
        limonada_imperial: {
          name: 'Imperial Lemonade',
          description: 'Refreshing citrus drink made with real lemon, sparkling water, and fresh mint.',
          ingredients: ['Real lemon juice', 'Sparkling water', 'Mint leaves', 'Ice']
        },
        iced_te_verde: {
          name: 'Iced Green Tea',
          description: 'Premium green tea cold-brewed with citrus notes and served over plenty of ice.',
          ingredients: ['Loose leaf green tea', 'Lemon', 'Mint leaves', 'Ice']
        },
        iced_te_frutos_rojos: {
          name: 'Iced Red Berries Tea',
          description: 'Iced infusion of wild red berries with a sweet and refreshing touch.',
          ingredients: ['Red berries from Otavalo', 'House infusion', 'Ice']
        },
        jugo: {
          name: 'Juice',
          description: 'Freshly squeezed juice from selected seasonal fruits.',
          ingredients: ['Seasonal fruits', 'Filtered water', 'Ice']
        },
        batido: {
          name: 'Smoothie',
          description: 'Creamy natural fruit smoothie prepared with water or milk base.',
          ingredients: ['Fruit of choice', 'Milk or water', 'Crushed ice']
        },
        iced_latte_caramelo: {
          name: 'Iced Caramel Latte',
          description: 'Double shot of cold espresso, fresh milk, ice, and artisanal caramel syrup.',
          ingredients: ['Double espresso', 'Fresh farm milk', 'Caramel syrup', 'Ice']
        },
        iced_latte_vainilla: {
          name: 'Iced Vanilla Latte',
          description: 'Cold espresso with cold frothed creamy milk and natural vanilla extract.',
          ingredients: ['Specialty espresso', 'Whole milk', 'Vanilla extract', 'Ice']
        },
        iced_americano: {
          name: 'Iced Americano',
          description: 'Our classic American extraction served cold over ice cubes.',
          ingredients: ['Espresso', 'Cold water', 'Ice']
        }
      }
    },
    booking: {
      title: 'Book Your Table',
      subtitle: 'Secure your place in one of our exclusive spaces.',
      step1: 'Choose Table',
      step2: 'Your Details',
      step3: 'Confirm & Pay',
      tableSelector: {
        title: 'Select a Table and Area',
        minConsumption: 'Min. required consumption:',
        capacity: 'Capacity:',
        seats: 'people',
        areas: {
          waterfall_deck: 'Waterfall Deck (Outdoor)',
          fireplace_cozy: 'Cozy Fireplace (Indoor)',
          indoor_premium: 'Premium Hall (Indoor)',
          terrace_panoramic: 'Condor View Terrace (Semi-outdoor)'
        },
        selectPrompt: 'Select a table on the map or list to continue.',
        selected: 'Selected table'
      },
      form: {
        name: 'Full Name',
        namePlaceholder: 'e.g. John Doe',
        email: 'Email Address',
        emailPlaceholder: 'e.g. john@email.com',
        phone: 'Mobile Phone',
        phonePlaceholder: 'e.g. +593 98 765 4321',
        date: 'Booking Date',
        time: 'Booking Time',
        guests: 'Number of Guests',
        notes: 'Special Notes (Allergies, birthdays, etc.)',
        notesPlaceholder: 'e.g. I prefer a table close to the window...',
        submit: 'Proceed to Payment',
        validation: {
          nameRequired: 'Name is required',
          emailRequired: 'Email is required',
          emailInvalid: 'Please enter a valid email address',
          phoneRequired: 'Phone is required',
          phoneInvalid: 'Enter a valid phone number (e.g. +593987654321)',
          dateRequired: 'Date is required',
          timeRequired: 'Time is required',
          guestsMin: 'Must be at least 1 person',
          guestsMax: 'Maximum capacity of the selected table is {max} people',
          tableRequired: 'You must select a table'
        }
      }
    },
    payment: {
      title: 'Simulated Payment Gateway',
      subtitle: 'To confirm your booking and secure the table, we require validation of a guarantee payment.',
      reservationSummary: 'Booking Summary',
      customer: 'Customer:',
      date: 'Date & Time:',
      table: 'Table:',
      amountToPay: 'Amount to Validate:',
      cardNumber: 'Card Number',
      cardNumberPlaceholder: '0000 0000 0000 0000',
      expiry: 'Expiration',
      expiryPlaceholder: 'MM/YY',
      cvv: 'CVV',
      cvvPlaceholder: '123',
      payButton: 'Simulate Successful Payment',
      failButton: 'Simulate Failed Payment',
      cancel: 'Cancel Payment',
      processing: 'Processing secure transaction...',
      successTitle: 'Payment Validated Successfully!',
      successDesc: 'Your guarantee payment has been recorded. Your table is reserved.',
      failedTitle: 'Payment Declined',
      failedDesc: 'We could not validate the transaction. Please try again.',
      whatsappNotice: 'Your reservation has been saved in CONFIRMED status. To speed up service, you can send the receipt directly to our WhatsApp.'
    },
    admin: {
      title: 'Booking Dashboard',
      subtitle: 'Monitor bookings in real-time and manage the coffee shop menu.',
      tabs: {
        kanban: 'Bookings Kanban Board',
        menu: 'Menu Manager'
      },
      stats: {
        total: 'Total Bookings',
        confirmed: 'Confirmed',
        pending: 'Pending',
        cancelled: 'Cancelled',
        occupancy: 'Table Occupancy'
      },
      columns: {
        pending: 'Payment Pending',
        confirmed: 'Confirmed',
        cancelled: 'Cancelled'
      },
      kanban: {
        dragNotice: 'Drag cards or use dropdowns to update reservation statuses.',
        table: 'Table:',
        guests: 'Guests:',
        total: 'Total:',
        payment: 'Payment:',
        updateStatus: 'Change Status',
        clientDetails: 'Customer Details',
        phone: 'Phone:',
        email: 'Email:',
        date: 'Date:',
        time: 'Time:',
        notes: 'Notes:'
      },
      menuManager: {
        title: 'Menu Manager',
        subtitle: 'Enable or disable products, modify pricing, and adjust preparation times.',
        addProduct: 'Add Product (Mock)',
        product: 'Product',
        category: 'Category',
        price: 'Price',
        prepTime: 'Prep Time',
        status: 'Status',
        actions: 'Actions',
        active: 'Active',
        inactive: 'Inactive',
        edit: 'Edit',
        save: 'Save',
        cancel: 'Cancel'
      }
    },
    toasts: {
      reservationCreated: 'Reservation created successfully! A notification was sent.',
      statusUpdated: 'Reservation status updated to {status}.',
      menuUpdated: 'Product {name} updated successfully.',
      paymentSuccess: 'Payment for reservation {id} simulated successfully.',
      paymentFailed: 'Payment for reservation {id} has failed.',
      welcome: 'Hello! Welcome to the Chayka Coffee experience. Explore the Andean menu and secure your table by the waterfall today.',
      trafficSim: 'A customer has just booked "{table}" for {time}. Few slots left today!'
    }
  }
};

export function t(key: string, lang: Language): string {
  const dict = translations[lang] || translations.es;
  const parts = key.split('.');
  let current: any = dict;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return key; // fallback to key name
    }
  }
  
  return typeof current === 'string' ? current : key;
}
