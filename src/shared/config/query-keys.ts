import type { OrderQueryParams } from '@/entities/order/model/types'

export const QUERY_KEYS = {
  orders: {
    all: ['orders'] as const,
    list: (params: OrderQueryParams) => ['orders', 'list', params] as const,
    detail: (id: string) => ['orders', id] as const,
  },
  carriers: {
    all: ['carriers'] as const,
    list: (search?: string) => ['carriers', 'list', search ?? ''] as const,
  },
} as const
