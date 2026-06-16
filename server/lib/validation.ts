import { z } from 'zod';

export const tableAreaSchema = z.enum([
  'waterfall_deck',
  'fireplace_cozy',
  'indoor_premium',
  'terrace_panoramic'
]);

export const kanbanStageSchema = z.enum(['pending', 'confirmed', 'cancelled']);

export const paymentStatusSchema = z.enum([
  'pending',
  'success',
  'failed',
  'simulated_paid',
  'unpaid'
]);

export const createReservationSchema = z.object({
  customerName: z.string().min(1, 'customerName is required'),
  customerEmail: z.string().email('customerEmail must be a valid email'),
  customerPhone: z.string().min(1, 'customerPhone is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  timeSlot: z.string().min(1, 'timeSlot is required'),
  tableId: z.string().min(1, 'tableId is required'),
  area: tableAreaSchema,
  guestsCount: z.number().int().positive('guestsCount must be positive'),
  notes: z.string().optional(),
  selectedOrderItems: z
    .array(
      z.object({
        menuItemId: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().positive()
      })
    )
    .optional()
});

export const updateReservationStatusSchema = z.object({
  status: kanbanStageSchema
});

export const createTableSchema = z.object({
  id: z.string().min(1, 'id is required'),
  name: z.object({ es: z.string().min(1), en: z.string().min(1) }),
  capacity: z.number().int().positive(),
  area: tableAreaSchema,
  minimumConsumption: z.number().nonnegative()
});

export const updateTableSchema = createTableSchema.partial();

export const updateBusinessConfigSchema = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
  locationLink: z.string().optional(),
  whatsappNumber: z.string().optional(),
  minPeopleReservation: z.number().int().positive().optional(),
  maxPeopleReservation: z.number().int().positive().optional(),
  schedules: z
    .array(
      z.object({
        day: z.string(),
        hours: z.string()
      })
    )
    .optional(),
  timeSlots: z.array(z.string()).optional()
});

export const simulatePaymentSchema = z.object({
  method: z.enum(['card', 'transfer', 'cash']),
  amount: z.number().positive(),
  reference: z.string().optional()
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, 'password is required')
});

export const createMenuItemSchema = z.object({
  id: z.string().min(1, 'id is required'),
  name: z.object({
    es: z.string().min(1, 'name.es is required'),
    en: z.string().min(1, 'name.en is required')
  }),
  price: z.number().positive('price must be positive'),
  category: z.string().min(1, 'category is required'),
  description: z
    .object({
      es: z.string().optional(),
      en: z.string().optional()
    })
    .optional(),
  image: z.string().optional(),
  fallbackImage: z.string().optional(),
  active: z.boolean().optional(),
  ingredients: z
    .object({
      es: z.array(z.string()).optional(),
      en: z.array(z.string()).optional()
    })
    .optional(),
  isSpecial: z.boolean().optional(),
  preparationTime: z.number().int().nonnegative().optional()
});

export const createMenuCategorySchema = z.object({
  id: z.string().min(1, 'id is required'),
  name: z.object({
    es: z.string().min(1, 'name.es is required'),
    en: z.string().min(1, 'name.en is required')
  }),
  displayOrder: z.number().int().nonnegative('displayOrder must be non-negative')
});

export const updateMenuCategorySchema = z.object({
  name: z
    .object({
      es: z.string().min(1).optional(),
      en: z.string().min(1).optional()
    })
    .optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  active: z.boolean().optional()
});

export const createTableAreaSchema = z.object({
  id: z.string().min(1, 'id is required'),
  name: z.object({
    es: z.string().min(1, 'name.es is required'),
    en: z.string().min(1, 'name.en is required')
  }),
  description: z
    .object({
      es: z.string().optional(),
      en: z.string().optional()
    })
    .optional(),
  displayOrder: z.number().int().nonnegative('displayOrder must be non-negative')
});

export const updateTableAreaSchema = z.object({
  name: z
    .object({
      es: z.string().min(1).optional(),
      en: z.string().min(1).optional()
    })
    .optional(),
  description: z
    .object({
      es: z.string().optional(),
      en: z.string().optional()
    })
    .optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  active: z.boolean().optional()
});
