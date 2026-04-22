import type { OrderStatus } from './types'

// Explicit adjacency map — every valid status transition
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

export function getAllowedTransitions(current: OrderStatus): OrderStatus[] {
  return VALID_TRANSITIONS[current]
}

export function isTransitionAllowed(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to)
}

export function isFinalStatus(status: OrderStatus): boolean {
  return VALID_TRANSITIONS[status].length === 0
}

export function canEdit(status: OrderStatus): boolean {
  return status === 'pending'
}

export function canDelete(status: OrderStatus): boolean {
  return status === 'pending'
}

export function requiresCancellationReason(to: OrderStatus): boolean {
  return to === 'cancelled'
}

// Human-readable labels
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const EQUIPMENT_TYPE_LABELS: Record<string, string> = {
  dry_van: 'Dry Van',
  flatbed: 'Flatbed',
  reefer: 'Reefer',
  step_deck: 'Step Deck',
  lowboy: 'Lowboy',
  tanker: 'Tanker',
  box_truck: 'Box Truck',
}

export const LOAD_TYPE_LABELS: Record<string, string> = {
  ftl: 'FTL',
  ltl: 'LTL',
  partial: 'Partial',
}

export const STOP_TYPE_LABELS: Record<string, string> = {
  pick_up: 'Pick Up',
  drop_off: 'Drop Off',
  stop: 'Stop',
}

export const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  fixed: 'Fixed',
  window: 'Window',
  fcfs: 'FCFS',
}
