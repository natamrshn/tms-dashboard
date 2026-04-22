import type { Order } from '@/entities/order/model/types'
import type { CreateOrderFormValues } from '@/entities/order/lib/order.schema'

// Maps a server Order into the form's initial values
export function orderToFormValues(order: Order): Partial<CreateOrderFormValues> {
  return {
    referenceNumber: order.referenceNumber,
    clientName: order.clientName,
    carrierId: order.carrierId ?? undefined,
    equipmentType: order.equipmentType,
    loadType: order.loadType,
    rate: order.rate / 100, // convert cents → dollars for form display
    weight: order.weight,
    notes: order.notes,
    stops: order.stops.map((s) => ({
      type: s.type,
      sequence: s.sequence,
      address: { ...s.address },
      locationName: s.locationName,
      refNumber: s.refNumber,
      appointmentType: s.appointmentType,
      scheduledDate: s.scheduledDate,
      scheduledTime: s.scheduledTime,
      contactName: s.contactName,
      contactPhone: s.contactPhone,
      notes: s.notes,
    })),
  }
}
