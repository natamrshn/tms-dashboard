import { cva } from 'class-variance-authority'
import type { OrderStatus } from '../model/types'
import { ORDER_STATUS_LABELS } from '../model/status-machine'
import { cn } from '@/shared/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap border select-none',
  {
    variants: {
      status: {
        pending:    'bg-amber-50   text-amber-700  border-amber-200',
        in_transit: 'bg-blue-50    text-blue-700   border-blue-200',
        delivered:  'bg-green-50   text-green-700  border-green-200',
        cancelled:  'bg-red-50     text-red-600    border-red-200',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

const dotVariants: Record<OrderStatus, string> = {
  pending:    'bg-amber-400',
  in_transit: 'bg-blue-500',
  delivered:  'bg-green-500',
  cancelled:  'bg-red-500',
}

interface OrderStatusBadgeProps {
  status: OrderStatus
  size?: 'sm' | 'md'
  className?: string
}

export function OrderStatusBadge({ status, size = 'md', className }: OrderStatusBadgeProps) {
  return (
    <span className={cn(badgeVariants({ status, size }), className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotVariants[status])} />
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}
