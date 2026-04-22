import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { OrderFilters, OrderSortField, SortDirection, OrderStatus } from '@/entities/order/model/types'
import { useOrders } from '@/entities/order/model/use-orders'
import { OrdersTable } from '@/widgets/orders-table'
import { OrderFiltersBar } from '@/widgets/order-filters'
import { LocalDraftsPanel } from '@/widgets/local-drafts-panel'
import { Pagination } from '@/shared/ui/pagination'
import { Button } from '@/shared/ui/button'
import { useDebounce } from '@/shared/hooks/use-debounce'
import { DEFAULT_PAGE_SIZE } from '@/shared/config/constants'

export default function OrdersListPage() {
  const navigate = useNavigate()

  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)
  const [statusFilter, setStatusFilter] = useState<OrderStatus[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [sortField, setSortField] = useState<OrderSortField | undefined>(undefined)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const filters: OrderFilters = {
    search: debouncedSearch || undefined,
    statuses: statusFilter.length > 0 ? statusFilter : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }

  const { data, isLoading, isError, error, refetch } = useOrders({
    filters,
    sort: sortField ? { field: sortField, direction: sortDirection } : undefined,
    page,
    pageSize,
  })

  function handleSortChange(field: OrderSortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setPage(1)
  }

  function handleStatusToggle(status: OrderStatus) {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    )
    setPage(1)
  }

  function handleClearFilters() {
    setSearchInput('')
    setStatusFilter([])
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  function handleDateChange(field: 'dateFrom' | 'dateTo', value: string) {
    if (field === 'dateFrom') setDateFrom(value)
    else setDateTo(value)
    setPage(1)
  }

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isLoading
              ? 'Loading…'
              : data
                ? `${data.total} order${data.total !== 1 ? 's' : ''} total`
                : ''}
          </p>
        </div>
        <Button onClick={() => void navigate('/orders/new')}>
          <Plus className="w-4 h-4" />
          New Order
        </Button>
      </div>

      {/* Unsaved drafts callout */}
      <LocalDraftsPanel />

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Filter toolbar */}
        <div className="px-4 py-3 border-b border-gray-200">
          <OrderFiltersBar
            filters={filters}
            searchInput={searchInput}
            onSearchChange={(val) => {
              setSearchInput(val)
              setPage(1)
            }}
            onStatusToggle={handleStatusToggle}
            onDateChange={handleDateChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Table */}
        <OrdersTable
          orders={data?.data ?? []}
          isLoading={isLoading}
          isError={isError}
          error={error instanceof Error ? error : null}
          onRetry={() => void refetch()}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />

        {/* Pagination */}
        {data && data.total > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={data.total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        )}
      </div>
    </div>
  )
}
