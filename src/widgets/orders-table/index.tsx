import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MapPin,
  FileText,
} from 'lucide-react'
import type { Order, OrderSortField, SortDirection } from '@/entities/order/model/types'
import { OrderStatusBadge } from '@/entities/order/ui/order-status-badge'
import {
  formatMoney,
  formatDate,
  formatRoute,
  getPickupDate,
} from '@/entities/order/lib/formatters'
import {
  EQUIPMENT_TYPE_LABELS,
  isFinalStatus,
  ORDER_STATUS_LABELS,
} from '@/entities/order/model/status-machine'
import { TableRowSkeleton } from '@/shared/ui/skeleton'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { ChangeOrderStatusDialog } from '@/features/change-order-status'
import { OrderRowActions } from './row-actions'
import { cn } from '@/shared/lib/utils'

interface SortIndicatorProps {
  field: OrderSortField
  activeField?: OrderSortField
  direction?: SortDirection
  onClick: () => void
}

function SortIndicator({ field, activeField, direction, onClick }: SortIndicatorProps) {
  const isActive = field === activeField
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            'inline-flex cursor-pointer items-center gap-0.5 rounded px-0.5 transition-colors',
            'hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            isActive ? 'text-gray-700' : 'text-gray-400 hover:text-gray-600',
          )}
        >
          {isActive ? (
            direction === 'asc' ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )
          ) : (
            <ChevronsUpDown className="w-3.5 h-3.5" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {isActive
          ? `Sorted ${direction === 'asc' ? 'ascending' : 'descending'} — click to reverse`
          : 'Sort by this column'}
      </TooltipContent>
    </Tooltip>
  )
}

function InlineStatusButton({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Change status — currently ${ORDER_STATUS_LABELS[order.status]}`}
        className={cn(
          'cursor-pointer rounded-full transition-all',
          'hover:ring-2 hover:ring-offset-1 hover:ring-gray-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        )}
      >
        <OrderStatusBadge status={order.status} />
      </button>
      <ChangeOrderStatusDialog order={order} open={open} onOpenChange={setOpen} />
    </>
  )
}

interface OrdersTableProps {
  orders: Order[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  onRetry: () => void
  sortField?: OrderSortField
  sortDirection?: SortDirection
  onSortChange: (field: OrderSortField) => void
}

const LOADING_SKELETON_ROWS = 8

export function OrdersTable({
  orders,
  isLoading,
  isError,
  error,
  onRetry,
  sortField,
  sortDirection,
  onSortChange,
}: OrdersTableProps) {
  const navigate = useNavigate()

  if (isError) {
    return (
      <ErrorState
        message={error?.message ?? 'Failed to load orders.'}
        onRetry={onRetry}
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/60">
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Reference
            </th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Route
            </th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Carrier
            </th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Equipment
            </th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
              <span className="flex items-center gap-1">
                Pickup Date
                <SortIndicator
                  field="pickupDate"
                  activeField={sortField}
                  direction={sortDirection}
                  onClick={() => onSortChange('pickupDate')}
                />
              </span>
            </th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                Rate
                <SortIndicator
                  field="rate"
                  activeField={sortField}
                  direction={sortDirection}
                  onClick={() => onSortChange('rate')}
                />
              </span>
            </th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Stops
            </th>
            <th className="px-4 py-2.5 w-10" aria-label="Actions" />
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {isLoading ? (
            Array.from({ length: LOADING_SKELETON_ROWS }, (_, i) => (
              <TableRowSkeleton key={i} cols={9} />
            ))
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={9}>
                <EmptyState
                  icon={<FileText className="w-6 h-6" />}
                  title="No orders found"
                  description="Try adjusting your filters or create a new order."
                />
              </td>
            </tr>
          ) : (
            orders.map((order) => {
              const pickupDate = getPickupDate(order)
              return (
                <tr
                  key={order.id}
                  onClick={() => void navigate(`/orders/${order.id}`)}
                  className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                >
                  {/* Reference */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                      {order.referenceNumber}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {isFinalStatus(order.status) ? (
                      <OrderStatusBadge status={order.status} />
                    ) : (
                      <InlineStatusButton order={order} />
                    )}
                  </td>

                  {/* Route */}
                  <td className="px-4 py-3 max-w-52">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-gray-700 text-xs leading-relaxed line-clamp-2">
                        {formatRoute(order.stops)}
                      </span>
                    </div>
                  </td>

                  {/* Carrier */}
                  <td className="px-4 py-3 max-w-36">
                    {order.carrierName ? (
                      <span className="text-gray-700 text-xs truncate block">{order.carrierName}</span>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Unassigned</span>
                    )}
                  </td>

                  {/* Equipment */}
                  <td className="px-4 py-3">
                    <span className="text-gray-600 text-xs">
                      {EQUIPMENT_TYPE_LABELS[order.equipmentType] ?? order.equipmentType}
                    </span>
                  </td>

                  {/* Pickup date */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gray-700 text-xs">
                      {pickupDate ? formatDate(pickupDate) : '—'}
                    </span>
                  </td>

                  {/* Rate */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-gray-900 text-sm font-semibold tabular-nums">
                      {formatMoney(order.rate)}
                    </span>
                  </td>

                  {/* Stops count */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-semibold text-gray-600 bg-gray-100 rounded-full">
                      {order.stops.length}
                    </span>
                  </td>

                  {/* Row actions */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <OrderRowActions order={order} />
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
