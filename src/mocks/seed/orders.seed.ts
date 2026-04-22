import type { Order, OrderStatus, EquipmentType, LoadType, Stop, StatusChange } from '@/entities/order/model/types'
import { generateId } from '@/shared/lib/utils'
import { SEED_CARRIERS } from './carriers.seed'

const US_CITIES: Array<{ city: string; state: string; zip: string }> = [
  { city: 'Los Angeles', state: 'CA', zip: '90001' },
  { city: 'Chicago', state: 'IL', zip: '60601' },
  { city: 'Houston', state: 'TX', zip: '77001' },
  { city: 'Phoenix', state: 'AZ', zip: '85001' },
  { city: 'Philadelphia', state: 'PA', zip: '19101' },
  { city: 'San Antonio', state: 'TX', zip: '78201' },
  { city: 'Dallas', state: 'TX', zip: '75201' },
  { city: 'San Jose', state: 'CA', zip: '95101' },
  { city: 'Jacksonville', state: 'FL', zip: '32099' },
  { city: 'Indianapolis', state: 'IN', zip: '46201' },
  { city: 'Memphis', state: 'TN', zip: '38101' },
  { city: 'Denver', state: 'CO', zip: '80201' },
  { city: 'Columbus', state: 'OH', zip: '43085' },
  { city: 'Seattle', state: 'WA', zip: '98101' },
  { city: 'Nashville', state: 'TN', zip: '37201' },
  { city: 'Louisville', state: 'KY', zip: '40201' },
  { city: 'Baltimore', state: 'MD', zip: '21201' },
  { city: 'Milwaukee', state: 'WI', zip: '53201' },
  { city: 'Albuquerque', state: 'NM', zip: '87101' },
  { city: 'Atlanta', state: 'GA', zip: '30301' },
  { city: 'Charlotte', state: 'NC', zip: '28201' },
  { city: 'Kansas City', state: 'MO', zip: '64101' },
  { city: 'Omaha', state: 'NE', zip: '68101' },
  { city: 'Minneapolis', state: 'MN', zip: '55401' },
  { city: 'Detroit', state: 'MI', zip: '48201' },
]

const EQUIPMENT_TYPES: EquipmentType[] = [
  'dry_van', 'flatbed', 'reefer', 'step_deck', 'lowboy', 'tanker', 'box_truck',
]
const LOAD_TYPES: LoadType[] = ['ftl', 'ltl', 'partial']
const STATUSES: OrderStatus[] = ['pending', 'in_transit', 'delivered', 'cancelled']

const CLIENT_NAMES = [
  'Acme Manufacturing Co.',
  'Global Logistics LLC',
  'Pacific Distribution Inc.',
  'Midwest Freight Partners',
  'Atlantic Supply Chain',
  'Horizon Wholesale',
  'Central Valley Farms',
  'Summit Industrial',
  'Coastal Imports Ltd.',
  'Heartland Foods',
]

const STREETS = [
  '100 Industrial Pkwy',
  '2500 Commerce Blvd',
  '888 Warehouse Dr',
  '1 Distribution Way',
  '44 Freight Terminal Rd',
  '300 Logistics Center',
  '77 Harbor Blvd',
  '1200 Manufacturing Ave',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

/** Returns YYYY-MM-DD. n may be negative (past) or positive (future). */
function dateOffset(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function buildStop(type: Stop['type'], sequence: number, dayOffset: number): Stop {
  const location = pick(US_CITIES)
  return {
    id: generateId(),
    type,
    sequence,
    address: {
      street: pick(STREETS),
      city: location.city,
      state: location.state,
      zip: location.zip,
    },
    appointmentType: pick(['fixed', 'window', 'fcfs'] as const),
    scheduledDate: dateOffset(dayOffset),
    scheduledTime: `${String(Math.floor(6 + Math.random() * 12)).padStart(2, '0')}:${Math.random() > 0.5 ? '00' : '30'}`,
    contactName: `Contact ${sequence + 1}`,
    contactPhone: `(${Math.floor(200 + Math.random() * 800)}) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
  }
}

function buildStatusHistory(
  status: OrderStatus,
  createdAt: string,
): StatusChange[] {
  const history: StatusChange[] = [
    {
      id: generateId(),
      from: null,
      status: 'pending',
      changedAt: createdAt,
      changedBy: 'System',
    },
  ]

  if (status === 'in_transit' || status === 'delivered' || status === 'cancelled') {
    const nextStatus = status === 'cancelled' ? 'cancelled' : 'in_transit'
    history.push({
      id: generateId(),
      from: 'pending',
      status: nextStatus,
      changedAt: new Date(new Date(createdAt).getTime() + 1000 * 3600 * 24).toISOString(),
      changedBy: 'Dispatcher',
      note: status === 'cancelled' ? 'Carrier requested cancellation' : 'Carrier picked up load',
    })
  }

  if (status === 'delivered') {
    history.push({
      id: generateId(),
      from: 'in_transit',
      status: 'delivered',
      changedAt: new Date(new Date(createdAt).getTime() + 1000 * 3600 * 48).toISOString(),
      changedBy: 'Driver',
      note: 'Proof of delivery confirmed',
    })
  }

  return history
}

function buildOrder(index: number): Order {
  const status = pick(STATUSES)

  // Pickup day offset relative to today — realistic per status:
  //   pending    → future shipment  (+1 … +28 days)
  //   in_transit → already picked up (-7 … -1 days)
  //   delivered / cancelled → completed in the past (-45 … -5 days)
  let pickupOffset: number
  if (status === 'pending') {
    pickupOffset = Math.floor(1 + Math.random() * 28)
  } else if (status === 'in_transit') {
    pickupOffset = -Math.floor(1 + Math.random() * 7)
  } else {
    pickupOffset = -Math.floor(5 + Math.random() * 40)
  }

  // Transit takes 1–7 days; dropoff is always after pickup
  const transitDays = Math.floor(1 + Math.random() * 7)
  const dropoffOffset = pickupOffset + transitDays

  const stopCount = Math.floor(2 + Math.random() * 4) // 2–5 stops
  const extraStops: Stop[] = []
  for (let i = 1; i < stopCount - 1; i++) {
    // Intermediate stops evenly spaced between pickup and dropoff
    const frac = i / (stopCount - 1)
    const intermediateOffset = Math.round(pickupOffset + frac * transitDays)
    extraStops.push(buildStop('stop', i, intermediateOffset))
  }

  const stops: Stop[] = [
    buildStop('pick_up', 0, pickupOffset),
    ...extraStops,
    buildStop('drop_off', stopCount - 1, dropoffOffset),
  ]

  const daysAgoCreated = Math.floor(Math.random() * 30)
  const createdAt = daysAgo(daysAgoCreated)
  const updatedAt = daysAgo(Math.floor(daysAgoCreated * Math.random()))

  const carrier = pick(SEED_CARRIERS)
  const isAssigned = status !== 'pending' || Math.random() > 0.3

  return {
    id: `order-${String(index + 1).padStart(3, '0')}`,
    referenceNumber: `TMS-${10000 + index + 1}`,
    status,
    clientName: pick(CLIENT_NAMES),
    carrierId: isAssigned ? carrier.id : null,
    carrierName: isAssigned ? carrier.name : null,
    carrierMcNumber: isAssigned ? carrier.mcNumber : null,
    equipmentType: pick(EQUIPMENT_TYPES),
    loadType: pick(LOAD_TYPES),
    rate: Math.floor(50000 + Math.random() * 800000),
    weight: Math.floor(5000 + Math.random() * 40000),
    stops,
    statusHistory: buildStatusHistory(status, createdAt),
    createdAt,
    updatedAt,
  }
}

export function generateSeedOrders(): Order[] {
  return Array.from({ length: 50 }, (_, i) => buildOrder(i))
}
