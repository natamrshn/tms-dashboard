import type {
  Order,
  OrderStatus,
  OrderQueryParams,
  PaginatedResult,
  CreateOrderInput,
  UpdateOrderInput,
} from '@/entities/order/model/types'
import type { Carrier } from '@/entities/carrier/model/types'
import { isTransitionAllowed } from '@/entities/order/model/status-machine'
import { generateId, generateReferenceNumber } from '@/shared/lib/utils'
import {
  ORDERS_STORAGE_KEY,
  CARRIERS_STORAGE_KEY,
  MOCK_DELAY_BASE_MS,
  MOCK_DELAY_JITTER_MS,
  MOCK_ERROR_RATE,
  SEED_VERSION,
  SEED_VERSION_KEY,
} from '@/shared/config/constants'
import { readStorage, writeStorage } from '../storage/storage'
import { generateSeedOrders } from '../seed/orders.seed'
import { SEED_CARRIERS } from '../seed/carriers.seed'
import { getPickupStop } from '@/entities/order/lib/formatters'

function resolveCarrier(carrierId: string): Pick<Carrier, 'name' | 'mcNumber'> | null {
  const carriers = readStorage<Carrier[]>(CARRIERS_STORAGE_KEY) ?? SEED_CARRIERS
  const carrier = carriers.find((c) => c.id === carrierId)
  return carrier ? { name: carrier.name, mcNumber: carrier.mcNumber } : null
}

// Initialize storage from seed on first load; reseed when SEED_VERSION changes
function getOrdersFromStorage(): Order[] {
  const storedVersion = readStorage<string>(SEED_VERSION_KEY)
  const stored = readStorage<Order[]>(ORDERS_STORAGE_KEY)
  if (stored && stored.length > 0 && storedVersion === SEED_VERSION) return stored
  const seeded = generateSeedOrders()
  writeStorage(ORDERS_STORAGE_KEY, seeded)
  writeStorage(SEED_VERSION_KEY, SEED_VERSION)
  return seeded
}

function saveOrders(orders: Order[]): void {
  writeStorage(ORDERS_STORAGE_KEY, orders)
}

async function mockDelay(): Promise<void> {
  const ms = MOCK_DELAY_BASE_MS + Math.random() * MOCK_DELAY_JITTER_MS
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function maybeThrow(): void {
  if (Math.random() < MOCK_ERROR_RATE) {
    throw new Error('Server error: request failed. Please try again.')
  }
}

export async function getOrders(params: OrderQueryParams): Promise<PaginatedResult<Order>> {
  await mockDelay()
  maybeThrow()

  let orders = getOrdersFromStorage()

  // Filtering
  const { filters, sort, page, pageSize } = params

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    orders = orders.filter(
      (o) =>
        o.referenceNumber.toLowerCase().includes(q) ||
        o.clientName.toLowerCase().includes(q) ||
        (o.carrierName?.toLowerCase().includes(q) ?? false),
    )
  }

  if (filters?.statuses && filters.statuses.length > 0) {
    orders = orders.filter((o) => filters.statuses!.includes(o.status))
  }

  if (filters?.dateFrom) {
    orders = orders.filter((o) => {
      const pickup = getPickupStop(o.stops)
      return pickup ? pickup.scheduledDate >= filters.dateFrom! : true
    })
  }

  if (filters?.dateTo) {
    orders = orders.filter((o) => {
      const pickup = getPickupStop(o.stops)
      return pickup ? pickup.scheduledDate <= filters.dateTo! : true
    })
  }

  // Sorting
  if (sort) {
    orders = [...orders].sort((a, b) => {
      let aVal: string | number
      let bVal: string | number

      switch (sort.field) {
        case 'pickupDate': {
          const aPickup = getPickupStop(a.stops)
          const bPickup = getPickupStop(b.stops)
          aVal = aPickup?.scheduledDate ?? ''
          bVal = bPickup?.scheduledDate ?? ''
          break
        }
        case 'rate':
          aVal = a.rate
          bVal = b.rate
          break
        case 'status':
          aVal = a.status
          bVal = b.status
          break
        case 'createdAt':
          aVal = a.createdAt
          bVal = b.createdAt
          break
        default:
          return 0
      }

      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1
      return 0
    })
  } else {
    // Default: newest first
    orders = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }

  const total = orders.length
  const start = (page - 1) * pageSize
  const data = orders.slice(start, start + pageSize)

  return { data, total, page, pageSize }
}

export async function getOrder(id: string): Promise<Order> {
  await mockDelay()
  maybeThrow()

  const orders = getOrdersFromStorage()
  const order = orders.find((o) => o.id === id)
  if (!order) throw new Error(`Order ${id} not found`)
  return order
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  await mockDelay()
  maybeThrow()

  const orders = getOrdersFromStorage()
  const now = new Date().toISOString()

  const carrier = resolveCarrier(input.carrierId)
  const newOrder: Order = {
    id: `order-${generateId()}`,
    referenceNumber: input.referenceNumber || generateReferenceNumber(),
    status: 'pending',
    clientName: input.clientName,
    carrierId: input.carrierId,
    carrierName: carrier?.name ?? null,
    carrierMcNumber: carrier?.mcNumber ?? null,
    equipmentType: input.equipmentType,
    loadType: input.loadType,
    rate: input.rate,
    weight: input.weight,
    notes: input.notes,
    stops: input.stops.map((s, i) => ({ ...s, id: generateId(), sequence: i })),
    statusHistory: [
      {
        id: generateId(),
        from: null,
        status: 'pending',
        changedAt: now,
        changedBy: 'Dispatcher',
      },
    ],
    createdAt: now,
    updatedAt: now,
  }

  saveOrders([newOrder, ...orders])
  return newOrder
}

export async function updateOrder(id: string, input: UpdateOrderInput): Promise<Order> {
  await mockDelay()
  maybeThrow()

  const orders = getOrdersFromStorage()
  const idx = orders.findIndex((o) => o.id === id)
  if (idx === -1) throw new Error(`Order ${id} not found`)

  const existing = orders[idx]
  if (existing.status !== 'pending') {
    throw new Error('Only pending orders can be edited')
  }

  const carrierUpdate = input.carrierId ? resolveCarrier(input.carrierId) : null
  const updated: Order = {
    ...existing,
    ...input,
    carrierName: carrierUpdate ? carrierUpdate.name : existing.carrierName,
    carrierMcNumber: carrierUpdate ? carrierUpdate.mcNumber : existing.carrierMcNumber,
    stops: input.stops
      ? input.stops.map((s, i) => ({ ...s, id: generateId(), sequence: i }))
      : existing.stops,
    updatedAt: new Date().toISOString(),
  }

  orders[idx] = updated
  saveOrders(orders)
  return updated
}

export async function deleteOrder(id: string): Promise<void> {
  await mockDelay()
  maybeThrow()

  const orders = getOrdersFromStorage()
  const order = orders.find((o) => o.id === id)
  if (!order) throw new Error(`Order ${id} not found`)
  if (order.status !== 'pending') throw new Error('Only pending orders can be deleted')

  saveOrders(orders.filter((o) => o.id !== id))
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  note?: string,
): Promise<Order> {
  await mockDelay()
  maybeThrow()

  const orders = getOrdersFromStorage()
  const idx = orders.findIndex((o) => o.id === id)
  if (idx === -1) throw new Error(`Order ${id} not found`)

  const existing = orders[idx]

  if (!isTransitionAllowed(existing.status, status)) {
    throw new Error(
      `Cannot transition from "${existing.status}" to "${status}"`,
    )
  }

  const now = new Date().toISOString()
  const updated: Order = {
    ...existing,
    status,
    statusHistory: [
      ...existing.statusHistory,
      {
        id: generateId(),
        from: existing.status,
        status,
        changedAt: now,
        note,
        changedBy: 'Dispatcher',
      },
    ],
    updatedAt: now,
  }

  orders[idx] = updated
  saveOrders(orders)
  return updated
}
