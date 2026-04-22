import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ArrowRightLeft,
  MapPin,
  User,
  Truck,
  DollarSign,
  Weight,
  Package,
  ChevronRight,
} from 'lucide-react'
import { useOrder } from '@/entities/order/model/use-orders'
import { OrderStatusBadge } from '@/entities/order/ui/order-status-badge'
import { OrderStatusTimeline } from '@/widgets/order-status-timeline'
import { ChangeOrderStatusDialog } from '@/features/change-order-status'
import { DeleteOrderButton } from '@/features/delete-order'
import {
  formatMoney,
  formatWeight,
  formatDate,
  formatRoute,
} from '@/entities/order/lib/formatters'
import {
  canEdit,
  canDelete,
  isFinalStatus,
  EQUIPMENT_TYPE_LABELS,
  LOAD_TYPE_LABELS,
  STOP_TYPE_LABELS,
  APPOINTMENT_TYPE_LABELS,
} from '@/entities/order/model/status-machine'
import { Skeleton } from '@/shared/ui/skeleton'
import { Separator } from '@/shared/ui/separator'
import { Button } from '@/shared/ui/button'
import { ErrorState } from '@/shared/ui/error-state'
import { cn } from '@/shared/lib/utils'

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs font-medium text-gray-500 w-28 shrink-0 pt-0.5">{label}</span>
      <div className="flex-1 min-w-0 text-sm text-gray-900">{children}</div>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)

  const { data: order, isLoading, isError, error, refetch } = useOrder(id ?? '')

  if (isLoading) {
    return (
      <div className="px-6 py-6 max-w-5xl mx-auto space-y-5">
        <Skeleton className="h-6 w-36" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="px-6 py-6">
        <ErrorState
          message={error instanceof Error ? error.message : 'Order not found.'}
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto">
      {/* Top nav row */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void navigate('/orders')}
          className="text-gray-500 hover:text-gray-900 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>

        <div className="flex items-center gap-2">
          {!isFinalStatus(order.status) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusDialogOpen(true)}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Change Status
            </Button>
          )}

          {canEdit(order.status) && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/orders/${order.id}/edit`}>
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Link>
            </Button>
          )}

          {canDelete(order.status) && (
            <DeleteOrderButton
              order={order}
              onDeleted={() => void navigate('/orders')}
            >
              {({ onClick }) => (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClick}
                  className="text-destructive border-destructive/30 hover:bg-red-50 hover:border-destructive/60"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              )}
            </DeleteOrderButton>
          )}
        </div>
      </div>

      {/* Order identity block */}
      <div className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold text-gray-900 font-mono tracking-tight">
            {order.referenceNumber}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1.5">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {formatRoute(order.stops)}
          {order.stops.length > 2 && (
            <span className="text-gray-400">· {order.stops.length} stops</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Core details */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-800">Order Details</h2>
            </div>
            <div className="px-5">
              <MetaRow label="Client">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {order.clientName}
                </span>
              </MetaRow>

              <MetaRow label="Carrier">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {order.carrierName ? (
                    <>
                      {order.carrierName}
                      {order.carrierMcNumber && (
                        <span className="text-xs text-gray-400 font-mono">
                          MC-{order.carrierMcNumber}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400 italic">Unassigned</span>
                  )}
                </span>
              </MetaRow>

              <MetaRow label="Equipment">
                {EQUIPMENT_TYPE_LABELS[order.equipmentType] ?? order.equipmentType}
              </MetaRow>

              <MetaRow label="Load Type">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  {LOAD_TYPE_LABELS[order.loadType] ?? order.loadType}
                </span>
              </MetaRow>

              <MetaRow label="Rate">
                <span className="flex items-center gap-1 font-semibold text-green-700">
                  <DollarSign className="w-3.5 h-3.5 shrink-0" />
                  {formatMoney(order.rate)}
                </span>
              </MetaRow>

              <MetaRow label="Weight">
                <span className="flex items-center gap-1.5">
                  <Weight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {formatWeight(order.weight)}
                </span>
              </MetaRow>

              {order.notes && (
                <MetaRow label="Notes">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {order.notes}
                  </p>
                </MetaRow>
              )}
            </div>
          </div>

          {/* Stops timeline */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-800">Route</h2>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {order.stops.length} stop{order.stops.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="px-5 py-4">
              <ol className="space-y-0">
                {order.stops.map((stop, index) => {
                  const isLast = index === order.stops.length - 1
                  return (
                    <li key={stop.id} className="flex gap-4">
                      {/* Visual connector */}
                      <div className="flex flex-col items-center shrink-0">
                        <div
                          className={cn(
                            'w-3 h-3 rounded-full border-2 mt-1 shrink-0',
                            stop.type === 'pick_up'
                              ? 'bg-green-500 border-green-500'
                              : stop.type === 'drop_off'
                                ? 'bg-red-500 border-red-500'
                                : 'bg-blue-500 border-blue-500',
                          )}
                        />
                        {!isLast && (
                          <div className="w-px flex-1 bg-gray-200 my-1.5 min-h-5" />
                        )}
                      </div>

                      {/* Stop content */}
                      <div className={cn('pb-5 flex-1 min-w-0', isLast && 'pb-1')}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                            {STOP_TYPE_LABELS[stop.type]}
                          </span>
                          <ChevronRight className="w-3 h-3 text-gray-300" />
                          <span className="text-xs text-gray-500">
                            {APPOINTMENT_TYPE_LABELS[stop.appointmentType]}
                          </span>
                        </div>

                        {stop.locationName && (
                          <p className="text-xs font-medium text-gray-500 mb-0.5">
                            {stop.locationName}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-gray-900">
                          {stop.address.city}, {stop.address.state}
                        </p>
                        <p className="text-xs text-gray-500">
                          {stop.address.street}, {stop.address.zip}
                          {stop.refNumber && (
                            <span className="ml-2 font-mono text-gray-400">#{stop.refNumber}</span>
                          )}
                        </p>

                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
                          <span>
                            {formatDate(stop.scheduledDate)}
                            {stop.scheduledTime && (
                              <span className="text-gray-400"> at {stop.scheduledTime}</span>
                            )}
                          </span>
                          {stop.contactName && <span>{stop.contactName}</span>}
                          {stop.contactPhone && (
                            <span className="font-mono">{stop.contactPhone}</span>
                          )}
                        </div>

                        {stop.notes && (
                          <p className="mt-1 text-xs text-gray-400 italic">{stop.notes}</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>

        {/* Right column — status history */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-800">Status History</h2>
            </div>
            <div className="px-5 py-4">
              <OrderStatusTimeline history={order.statusHistory} />
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <ChangeOrderStatusDialog
        order={order}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
      />
    </div>
  )
}
