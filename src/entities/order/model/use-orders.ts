import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { OrderQueryParams, OrderStatus, UpdateOrderInput } from './types'
import { QUERY_KEYS } from '@/shared/config/query-keys'
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
} from '@/shared/api/orders'
import type { CreateOrderInput } from './types'

export function useOrders(params: OrderQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.orders.list(params),
    queryFn: () => getOrders(params),
    staleTime: 30_000,
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.orders.detail(id),
    queryFn: () => getOrder(id),
    enabled: Boolean(id),
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.orders.all })
    },
  })
}

export function useUpdateOrder(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateOrderInput) => updateOrder(id, input),
    onSuccess: (updated) => {
      qc.setQueryData(QUERY_KEYS.orders.detail(id), updated)
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.orders.all })
    },
  })
}

export function useDeleteOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.orders.all })
    },
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: string
      status: OrderStatus
      note?: string
    }) => updateOrderStatus(id, status, note),
    onSuccess: (updated) => {
      qc.setQueryData(QUERY_KEYS.orders.detail(updated.id), updated)
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.orders.all })
    },
  })
}
