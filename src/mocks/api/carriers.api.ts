import type { Carrier } from '@/entities/carrier/model/types'
import type { PaginatedResult } from '@/entities/order/model/types'
import {
  CARRIERS_STORAGE_KEY,
  MOCK_DELAY_BASE_MS,
  MOCK_DELAY_JITTER_MS,
} from '@/shared/config/constants'
import { readStorage, writeStorage } from '../storage/storage'
import { SEED_CARRIERS } from '../seed/carriers.seed'

function getCarriersFromStorage(): Carrier[] {
  const stored = readStorage<Carrier[]>(CARRIERS_STORAGE_KEY)
  if (stored && stored.length > 0) return stored
  writeStorage(CARRIERS_STORAGE_KEY, SEED_CARRIERS)
  return SEED_CARRIERS
}

async function mockDelay(): Promise<void> {
  const ms = MOCK_DELAY_BASE_MS + Math.random() * MOCK_DELAY_JITTER_MS
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getCarriers(search?: string): Promise<PaginatedResult<Carrier>> {
  await mockDelay()

  let carriers = getCarriersFromStorage()

  if (search) {
    const q = search.toLowerCase()
    carriers = carriers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.mcNumber.includes(q) ||
        c.dotNumber.includes(q),
    )
  }

  return {
    data: carriers,
    total: carriers.length,
    page: 1,
    pageSize: carriers.length,
  }
}

export async function getCarrier(id: string): Promise<Carrier> {
  await mockDelay()
  const carriers = getCarriersFromStorage()
  const carrier = carriers.find((c) => c.id === id)
  if (!carrier) throw new Error(`Carrier ${id} not found`)
  return carrier
}
