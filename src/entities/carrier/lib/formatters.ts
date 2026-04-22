import type { Carrier } from '../model/types'

export function formatCarrierLabel(carrier: Carrier): string {
  return `${carrier.name} (MC-${carrier.mcNumber})`
}
