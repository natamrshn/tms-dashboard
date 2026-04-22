export type OrderStatus = 'pending' | 'in_transit' | 'delivered' | 'cancelled'

export type EquipmentType =
  | 'dry_van'
  | 'flatbed'
  | 'reefer'
  | 'step_deck'
  | 'lowboy'
  | 'tanker'
  | 'box_truck'

export type LoadType = 'ftl' | 'ltl' | 'partial'

export type StopType = 'pick_up' | 'drop_off' | 'stop'

export type AppointmentType = 'fixed' | 'window' | 'fcfs'

export interface Address {
  street: string
  city: string
  state: string
  zip: string
}

export interface Stop {
  id: string
  type: StopType
  sequence: number
  address: Address
  locationName?: string
  refNumber?: string
  appointmentType: AppointmentType
  scheduledDate: string // ISO date string
  scheduledTime?: string // HH:mm
  contactName?: string
  contactPhone?: string
  notes?: string
  completedAt?: string // ISO datetime
}

export interface StatusChange {
  id: string
  from: OrderStatus | null
  status: OrderStatus
  changedAt: string // ISO datetime
  note?: string
  changedBy: string
}

export interface Order {
  id: string
  referenceNumber: string
  status: OrderStatus
  clientName: string
  carrierId: string | null
  carrierName: string | null
  carrierMcNumber: string | null
  equipmentType: EquipmentType
  loadType: LoadType
  rate: number // USD cents
  weight: number // lbs
  notes?: string
  stops: Stop[]
  statusHistory: StatusChange[]
  createdAt: string // ISO datetime
  updatedAt: string // ISO datetime
}

// For creating an order (from form submission)
export interface CreateOrderInput {
  referenceNumber: string
  clientName: string
  carrierId: string
  equipmentType: EquipmentType
  loadType: LoadType
  rate: number
  weight: number
  notes?: string
  stops: Omit<Stop, 'id' | 'completedAt'>[]
}

// For updating an order
export type UpdateOrderInput = Partial<CreateOrderInput>

// Query/filter params for order list
export interface OrderFilters {
  search?: string
  statuses?: OrderStatus[]
  equipmentTypes?: EquipmentType[]
  dateFrom?: string
  dateTo?: string
}

export type OrderSortField = 'pickupDate' | 'rate' | 'status' | 'createdAt'
export type SortDirection = 'asc' | 'desc'

export interface OrderSortParams {
  field: OrderSortField
  direction: SortDirection
}

export interface OrderQueryParams {
  filters?: OrderFilters
  sort?: OrderSortParams
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
