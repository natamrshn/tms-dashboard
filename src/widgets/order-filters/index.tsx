import { CalendarDays, Search, X } from 'lucide-react'
import type { OrderFilters, OrderStatus } from '@/entities/order/model/types'
import { ORDER_STATUS_LABELS } from '@/entities/order/model/status-machine'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/lib/utils'

const ALL_STATUSES: OrderStatus[] = ['pending', 'in_transit', 'delivered', 'cancelled']

const STATUS_INACTIVE: Record<OrderStatus, string> = {
  pending:    'bg-amber-50  text-amber-600  border-amber-200  hover:bg-amber-100',
  in_transit: 'bg-blue-50   text-blue-600   border-blue-200   hover:bg-blue-100',
  delivered:  'bg-green-50  text-green-600  border-green-200  hover:bg-green-100',
  cancelled:  'bg-red-50    text-red-600    border-red-200    hover:bg-red-100',
}

const STATUS_ACTIVE: Record<OrderStatus, string> = {
  pending:    'bg-amber-400  text-white  border-amber-500  hover:bg-amber-500  shadow-sm  ring-2  ring-offset-1  ring-amber-400',
  in_transit: 'bg-blue-500   text-white  border-blue-600   hover:bg-blue-600   shadow-sm  ring-2  ring-offset-1  ring-blue-500',
  delivered:  'bg-green-500  text-white  border-green-600  hover:bg-green-600  shadow-sm  ring-2  ring-offset-1  ring-green-500',
  cancelled:  'bg-red-500    text-white  border-red-600    hover:bg-red-600    shadow-sm  ring-2  ring-offset-1  ring-red-500',
}

const STATUS_DOT_INACTIVE: Record<OrderStatus, string> = {
  pending:    'bg-amber-400',
  in_transit: 'bg-blue-500',
  delivered:  'bg-green-500',
  cancelled:  'bg-red-500',
}

const STATUS_DOT_ACTIVE: Record<OrderStatus, string> = {
  pending:    'bg-white/80',
  in_transit: 'bg-white/80',
  delivered:  'bg-white/80',
  cancelled:  'bg-white/80',
}

interface OrderFiltersProps {
  filters: OrderFilters
  searchInput: string
  onSearchChange: (value: string) => void
  onStatusToggle: (status: OrderStatus) => void
  onDateChange: (field: 'dateFrom' | 'dateTo', value: string) => void
  onClearFilters: () => void
}

export function OrderFiltersBar({
  filters,
  searchInput,
  onSearchChange,
  onStatusToggle,
  onDateChange,
  onClearFilters,
}: OrderFiltersProps) {
  const activeStatuses = filters.statuses ?? []
  const hasActiveFilters = searchInput || activeStatuses.length > 0 || filters.dateFrom || filters.dateTo

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: search + status pills */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by reference, client, carrier…"
            className="h-8 pl-9 pr-8"
          />
          {searchInput && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-gray-400 mr-0.5">Status:</span>
          {ALL_STATUSES.map((status) => {
            const isActive = activeStatuses.includes(status)
            return (
              <button
                key={status}
                onClick={() => onStatusToggle(status)}
                title={
                  isActive
                    ? `Remove ${ORDER_STATUS_LABELS[status]} filter`
                    : `Filter by ${ORDER_STATUS_LABELS[status]}`
                }
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border',
                  'transition-all cursor-pointer outline-none',
                  'focus-visible:ring-2 focus-visible:ring-ring',
                  isActive ? 'font-semibold' : 'font-medium',
                  isActive ? STATUS_ACTIVE[status] : STATUS_INACTIVE[status],
                )}
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0',
                    isActive ? STATUS_DOT_ACTIVE[status] : STATUS_DOT_INACTIVE[status],
                  )}
                />
                {ORDER_STATUS_LABELS[status]}
              </button>
            )
          })}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onClearFilters}
              className="ml-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Row 2: pickup date range */}
      <div className="flex items-center gap-2 flex-wrap">
        <CalendarDays className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-xs font-medium text-gray-400">Pickup date:</span>

        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) => onDateChange('dateFrom', e.target.value)}
            aria-label="Pickup date from"
            className={cn(
              'h-8 w-36 cursor-pointer text-xs',
              filters.dateFrom && 'border-primary/60 bg-primary/5',
            )}
          />
          <span className="text-xs text-gray-400">–</span>
          <Input
            type="date"
            value={filters.dateTo ?? ''}
            min={filters.dateFrom ?? undefined}
            onChange={(e) => onDateChange('dateTo', e.target.value)}
            aria-label="Pickup date to"
            className={cn(
              'h-8 w-36 cursor-pointer text-xs',
              filters.dateTo && 'border-primary/60 bg-primary/5',
            )}
          />
        </div>

        {(filters.dateFrom || filters.dateTo) && (
          <button
            onClick={() => { onDateChange('dateFrom', ''); onDateChange('dateTo', '') }}
            className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear date range"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}
