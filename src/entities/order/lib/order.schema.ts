import { z } from 'zod'

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z
    .string()
    .length(2, 'Use 2-letter state code')
    .regex(/^[A-Z]{2}$/, 'Use uppercase state code (e.g. CA)'),
  zip: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code'),
})

const stopSchema = z.object({
  type: z.enum(['pick_up', 'drop_off', 'stop']),
  sequence: z.number().int().min(0),
  address: addressSchema,
  locationName: z.string().max(100).optional(),
  refNumber: z.string().max(50).optional(),
  appointmentType: z.enum(['fixed', 'window', 'fcfs']),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  scheduledTime: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s\-().]{7,20}$/.test(val),
      'Enter a valid phone number',
    ),
  notes: z.string().max(500).optional(),
})

export const createOrderSchema = z.object({
  referenceNumber: z
    .string()
    .min(1, 'Reference number is required')
    .max(50, 'Reference number too long')
    .regex(/^[A-Za-z0-9\-_]+$/, 'Only letters, numbers, hyphens and underscores'),

  clientName: z.string().min(1, 'Client name is required').max(100),

  carrierId: z.string().min(1, 'Carrier is required'),

  equipmentType: z.enum([
    'dry_van',
    'flatbed',
    'reefer',
    'step_deck',
    'lowboy',
    'tanker',
    'box_truck',
  ]),

  loadType: z.enum(['ftl', 'ltl', 'partial']),

  // Form stores dollars; converted to cents only at API boundary
  rate: z
    .number({ error: 'Rate must be a number' })
    .positive('Rate must be greater than 0')
    .max(100_000, 'Rate cannot exceed $100,000'),

  weight: z
    .number({ error: 'Weight must be a number' })
    .positive('Weight must be greater than 0')
    .max(80_000, 'Max legal weight is 80,000 lbs'),

  notes: z.string().max(1000, 'Notes too long').optional(),

  stops: z
    .array(stopSchema)
    .min(2, 'At least 2 stops required')
    .max(5, 'Maximum 5 stops allowed')
    .refine(
      (stops) => stops.some((s) => s.type === 'pick_up'),
      'At least one pick-up stop is required',
    )
    .refine(
      (stops) => stops.some((s) => s.type === 'drop_off'),
      'At least one drop-off stop is required',
    ),
})

export type CreateOrderFormValues = z.infer<typeof createOrderSchema>
