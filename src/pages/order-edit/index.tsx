import { useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertTriangle, Pencil } from 'lucide-react'
import { useOrder, useUpdateOrder } from '@/entities/order/model/use-orders'
import { OrderForm } from '@/widgets/order-form'
import { orderToFormValues } from '@/features/edit-order'
import type { CreateOrderFormValues } from '@/entities/order/lib/order.schema'
import { canEdit } from '@/entities/order/model/status-machine'
import { Skeleton } from '@/shared/ui/skeleton'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { OrderStatusBadge } from '@/entities/order/ui/order-status-badge'
import { ErrorState } from '@/shared/ui/error-state'
import { useToast } from '@/shared/ui/toast'

export default function OrderEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: order, isLoading, isError, error, refetch } = useOrder(id ?? '')
  const { mutate: updateOrder, isPending: isSubmitting } = useUpdateOrder(id ?? '')

  const handleSubmit = useCallback(
    (values: CreateOrderFormValues) => {
      updateOrder(
        {
          ...values,
          rate: Math.round(values.rate * 100),
          stops: values.stops.map((s, i) => ({ ...s, sequence: i })),
        },
        {
          onSuccess: (updated) => {
            toast({
              variant: 'success',
              title: 'Order updated',
              description: `${updated.referenceNumber} has been saved.`,
            })
            void navigate(`/orders/${updated.id}`)
          },
          onError: (err) => {
            toast({
              variant: 'error',
              title: 'Update failed',
              description: err instanceof Error ? err.message : 'Please try again.',
            })
          },
        },
      )
    },
    [updateOrder, navigate, toast],
  )

  if (isLoading) {
    return (
      <div className="px-6 py-6 max-w-3xl mx-auto space-y-5">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
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

  if (!canEdit(order.status)) {
    return (
      <div className="px-6 py-6 max-w-3xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void navigate(`/orders/${order.id}`)}
          className="text-gray-500 hover:text-gray-900 -ml-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Order
        </Button>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex gap-3">
          <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-amber-100">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-amber-900">Edit Not Allowed</h2>
            <p className="mt-1 text-sm text-amber-800 leading-relaxed">
              Only <strong>pending</strong> orders can be edited.{' '}
              <strong className="font-mono">{order.referenceNumber}</strong> is currently{' '}
              <OrderStatusBadge status={order.status} size="sm" className="inline-flex" />.
            </p>
            <Link
              to={`/orders/${order.id}`}
              className="mt-3 inline-block text-sm font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900"
            >
              View order details
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void navigate(`/orders/${order.id}`)}
          className="text-gray-500 hover:text-gray-900 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Order
        </Button>

        <Button
          type="submit"
          form="order-form"
          disabled={isSubmitting}
          size="sm"
        >
          {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>

      {/* Page identity */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5">
          <Pencil className="w-4 h-4 text-gray-400" />
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            Edit Order
          </h1>
          <span className="font-mono text-base font-semibold text-primary">
            {order.referenceNumber}
          </span>
          <OrderStatusBadge status={order.status} size="sm" />
        </div>
        <p className="text-sm text-gray-500 mt-1.5">
          You are editing a pending order. Changes take effect immediately on save.
        </p>
      </div>

      <Separator className="mb-6" />

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <OrderForm
          key={order.id}
          draftId={order.id}
          initialValues={orderToFormValues(order)}
          onValuesChange={() => { /* edit page doesn't autosave */ }}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Footer submit — visible without scrolling back up on long forms */}
      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          form="order-form"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
