import type { Order, Stop } from '../model/types'

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function formatWeight(lbs: number): string {
  return new Intl.NumberFormat('en-US').format(lbs) + ' lbs'
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function getPickupStop(stops: Stop[]): Stop | undefined {
  return stops.find((s) => s.type === 'pick_up') ?? stops[0]
}

export function getDropoffStop(stops: Stop[]): Stop | undefined {
  return [...stops].reverse().find((s) => s.type === 'drop_off') ?? stops[stops.length - 1]
}

export function formatRoute(stops: Stop[]): string {
  const pickup = getPickupStop(stops)
  const dropoff = getDropoffStop(stops)
  if (!pickup || !dropoff) return '—'
  const from = `${pickup.address.city}, ${pickup.address.state}`
  const to = `${dropoff.address.city}, ${dropoff.address.state}`
  const stopCount = stops.filter((s) => s.type === 'stop').length
  if (stopCount > 0) return `${from} → +${stopCount} → ${to}`
  return `${from} → ${to}`
}

export function getPickupDate(order: Order): string | null {
  const pickup = getPickupStop(order.stops)
  return pickup?.scheduledDate ?? null
}
