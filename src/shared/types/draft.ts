import type { CreateOrderFormValues } from '@/entities/order/lib/order.schema'

export interface LocalDraft {
  id: string
  formData: Partial<CreateOrderFormValues>
  createdAt: string // ISO datetime
  updatedAt: string // ISO datetime
}

export interface DraftTab {
  id: string
  label: string // referenceNumber or "New Draft"
  isDirty: boolean
  lastSaved: string | null
}
