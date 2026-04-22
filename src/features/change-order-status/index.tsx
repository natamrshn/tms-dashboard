import { useState } from 'react'
import { AlertTriangle, Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import type { Order, OrderStatus } from '@/entities/order/model/types'
import {
  getAllowedTransitions,
  ORDER_STATUS_LABELS,
  requiresCancellationReason,
} from '@/entities/order/model/status-machine'
import { useUpdateOrderStatus } from '@/entities/order/model/use-orders'
import { OrderStatusBadge } from '@/entities/order/ui/order-status-badge'
import { useToast } from '@/shared/ui/toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { cn } from '@/shared/lib/utils'

const STATUS_CARD_SELECTED: Record<string, string> = {
  delivered:  'border-green-400 bg-green-50/70 ring-1 ring-green-200',
  cancelled:  'border-red-400   bg-red-50/70   ring-1 ring-red-200',
  in_transit: 'border-blue-400  bg-blue-50/70  ring-1 ring-blue-200',
  pending:    'border-amber-400 bg-amber-50/70 ring-1 ring-amber-200',
}

const STATUS_CHECK_COLOR: Record<string, string> = {
  delivered:  'text-green-500',
  cancelled:  'text-red-500',
  in_transit: 'text-blue-500',
  pending:    'text-amber-500',
}

interface ChangeOrderStatusDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangeOrderStatusDialog({
  order,
  open,
  onOpenChange,
}: ChangeOrderStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const { mutate, isPending } = useUpdateOrderStatus()
  const { toast } = useToast()

  const allowedTransitions = getAllowedTransitions(order.status)

  function handleClose() {
    setSelectedStatus(null)
    setReason('')
    setReasonError('')
    onOpenChange(false)
  }

  function handleSubmit() {
    if (!selectedStatus) return

    if (requiresCancellationReason(selectedStatus) && !reason.trim()) {
      setReasonError('A reason is required when cancelling an order.')
      return
    }

    mutate(
      { id: order.id, status: selectedStatus, note: reason.trim() || undefined },
      {
        onSuccess: () => {
          toast({
            variant: 'success',
            title: 'Status updated',
            description: `Order ${order.referenceNumber} is now ${ORDER_STATUS_LABELS[selectedStatus]}.`,
          })
          handleClose()
        },
        onError: (err) => {
          toast({
            variant: 'error',
            title: 'Failed to update status',
            description: err instanceof Error ? err.message : 'Please try again.',
          })
        },
      },
    )
  }

  const isCancelling = selectedStatus !== null && requiresCancellationReason(selectedStatus)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm gap-0 p-0 overflow-hidden">

        {/* ── Header ── */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-gray-100">
          <DialogTitle className="text-base font-semibold">Change Order Status</DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                {order.referenceNumber}
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400">currently</span>
              <OrderStatusBadge status={order.status} size="sm" />
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Move to
          </p>

          {/* Status option cards */}
          <div className="space-y-2">
            {allowedTransitions.map((status) => {
              const isSelected = selectedStatus === status
              const isCancelOption = requiresCancellationReason(status)

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setSelectedStatus(status)
                    setReasonError('')
                  }}
                  className={cn(
                    'w-full flex cursor-pointer items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left',
                    'transition-all outline-none',
                    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                    isSelected
                      ? (STATUS_CARD_SELECTED[status] ?? 'border-primary bg-primary/5 ring-1 ring-primary/20')
                      : 'border-gray-100 bg-gray-50/60 hover:bg-white hover:border-gray-200',
                  )}
                >
                  <OrderStatusBadge status={status} />

                  {isCancelOption && !isSelected && (
                    <span className="ml-auto text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                      reason required
                    </span>
                  )}

                  {isSelected && (
                    <CheckCircle2
                      className={cn(
                        'w-4 h-4 ml-auto shrink-0',
                        STATUS_CHECK_COLOR[status] ?? 'text-primary',
                      )}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Cancellation reason block */}
          {isCancelling && (
            <div className="rounded-xl border border-red-200 bg-red-50/40 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <Label className="text-xs font-semibold text-red-800">
                  Cancellation reason <span className="text-red-500">*</span>
                </Label>
              </div>
              <Textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value)
                  if (e.target.value.trim()) setReasonError('')
                }}
                placeholder="Why is this order being cancelled?"
                rows={3}
                className={cn(
                  'resize-none bg-white text-sm',
                  reasonError && 'border-red-400 focus-visible:ring-red-400/20',
                )}
                autoFocus
              />
              {reasonError && (
                <p className="text-xs text-red-600 font-medium">{reasonError}</p>
              )}
            </div>
          )}

          {/* Optional note for non-cancel transitions */}
          {selectedStatus && !isCancelling && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500">
                Note{' '}
                <span className="font-normal text-gray-400">(optional)</span>
              </Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Add a note about this status change…"
                className="text-sm"
              />
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50/60">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!selectedStatus || isPending}
            variant={isCancelling ? 'destructive' : 'default'}
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isCancelling ? 'Confirm Cancellation' : 'Update Status'}
            {!isPending && selectedStatus && !isCancelling && (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}
