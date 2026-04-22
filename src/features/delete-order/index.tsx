import { useState } from 'react'
import type { Order } from '@/entities/order/model/types'
import { useDeleteOrder } from '@/entities/order/model/use-orders'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { useToast } from '@/shared/ui/toast'

interface DeleteOrderButtonProps {
  order: Order
  onDeleted?: () => void
  children: (props: { onClick: () => void }) => React.ReactNode
}

export function DeleteOrderButton({ order, onDeleted, children }: DeleteOrderButtonProps) {
  const [open, setOpen] = useState(false)
  const { mutate, isPending } = useDeleteOrder()
  const { toast } = useToast()

  function handleConfirm() {
    mutate(order.id, {
      onSuccess: () => {
        toast({
          variant: 'success',
          title: 'Order deleted',
          description: `${order.referenceNumber} has been removed.`,
        })
        setOpen(false)
        onDeleted?.()
      },
      onError: (err) => {
        toast({
          variant: 'error',
          title: 'Delete failed',
          description: err instanceof Error ? err.message : 'Please try again.',
        })
      },
    })
  }

  return (
    <>
      {children({ onClick: () => setOpen(true) })}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Order"
        description={
          <>
            Are you sure you want to delete order{' '}
            <strong>{order.referenceNumber}</strong>? This action cannot be undone.
          </>
        }
        confirmLabel="Delete Order"
        variant="danger"
        onConfirm={handleConfirm}
        isLoading={isPending}
      />
    </>
  )
}
