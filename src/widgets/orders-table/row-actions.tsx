import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  ArrowRightLeft,
  Trash2,
} from 'lucide-react'
import type { Order } from '@/entities/order/model/types'
import { canEdit, canDelete, isFinalStatus } from '@/entities/order/model/status-machine'
import { ChangeOrderStatusDialog } from '@/features/change-order-status'
import { DeleteOrderButton } from '@/features/delete-order'
import { useDraftStore } from '@/features/create-order-draft/draft-store'
import { orderToDraftValues } from '@/features/duplicate-order-as-draft'
import { useToast } from '@/shared/ui/toast'
import { MAX_DRAFTS } from '@/shared/config/constants'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Button } from '@/shared/ui/button'

interface RowActionsProps {
  order: Order
}

export function OrderRowActions({ order }: RowActionsProps) {
  const navigate = useNavigate()
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const { createDraft, tabs } = useDraftStore()
  const { toast } = useToast()

  function handleDuplicate() {
    if (tabs.length >= MAX_DRAFTS) {
      toast({
        variant: 'warning',
        title: 'Draft limit reached',
        description: `You can have at most ${MAX_DRAFTS} open drafts. Close one to continue.`,
      })
      return
    }
    createDraft(orderToDraftValues(order))
    toast({
      variant: 'success',
      title: 'Draft created',
      description: 'Order duplicated as a new draft. Open the workspace to edit.',
    })
    void navigate('/orders/new')
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Order actions"
            className="text-gray-400 hover:text-gray-700 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-700"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onClick={() => void navigate(`/orders/${order.id}`)}>
            <Eye className="w-3.5 h-3.5" />
            View details
          </DropdownMenuItem>

          {canEdit(order.status) && (
            <DropdownMenuItem onClick={() => void navigate(`/orders/${order.id}/edit`)}>
              <Pencil className="w-3.5 h-3.5" />
              Edit order
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="w-3.5 h-3.5" />
            Duplicate as draft
          </DropdownMenuItem>

          {!isFinalStatus(order.status) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusDialogOpen(true)}>
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Change status
              </DropdownMenuItem>
            </>
          )}

          {canDelete(order.status) && (
            <>
              <DropdownMenuSeparator />
              <DeleteOrderButton order={order}>
                {({ onClick }) => (
                  <DropdownMenuItem
                    onClick={onClick}
                    className="text-destructive focus:text-destructive focus:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete order
                  </DropdownMenuItem>
                )}
              </DeleteOrderButton>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangeOrderStatusDialog
        order={order}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
      />
    </>
  )
}
