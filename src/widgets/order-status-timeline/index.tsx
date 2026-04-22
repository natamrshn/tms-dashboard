import type { StatusChange } from '@/entities/order/model/types'
import { OrderStatusBadge } from '@/entities/order/ui/order-status-badge'
import { formatDateTime } from '@/entities/order/lib/formatters'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface OrderStatusTimelineProps {
  history: StatusChange[]
}

export function OrderStatusTimeline({ history }: OrderStatusTimelineProps) {
  const sorted = [...history].sort(
    (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <p className="text-xs text-gray-400 py-2">No status history yet.</p>
    )
  }

  return (
    <ol className="space-y-0">
      {sorted.map((entry, index) => {
        const isLatest = index === sorted.length - 1
        const isFirst = index === 0

        return (
          <li key={entry.id} className="flex gap-3">
            {/* Timeline gutter */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className={cn(
                  'w-2.5 h-2.5 rounded-full border-2 mt-1 shrink-0 transition-colors',
                  isLatest
                    ? 'bg-primary border-primary shadow-sm'
                    : 'bg-white border-gray-300',
                )}
              />
              {index < sorted.length - 1 && (
                <div className="w-px flex-1 bg-gray-200 my-1.5 min-h-4" />
              )}
            </div>

            {/* Entry content */}
            <div className={cn('pb-5 flex-1 min-w-0', isFirst && 'pt-0')}>
              {/* Status transition */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {entry.from !== null ? (
                  <>
                    <OrderStatusBadge status={entry.from} size="sm" />
                    <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                  </>
                ) : null}
                <OrderStatusBadge status={entry.status} size="sm" />
                {isLatest && (
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>

              {/* Metadata */}
              <div className="mt-1 text-[11px] text-gray-500 space-y-0">
                <p>{formatDateTime(entry.changedAt)}</p>
                <p className="text-gray-400">{entry.changedBy}</p>
              </div>

              {/* Optional note */}
              {entry.note && (
                <blockquote className="mt-1.5 text-xs text-gray-600 bg-gray-50 rounded-md px-2.5 py-1.5 border border-gray-100 italic">
                  {entry.note}
                </blockquote>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
