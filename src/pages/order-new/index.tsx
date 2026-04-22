import { useEffect, useRef, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Plus,
  Save,
  Trash2,
  Loader2,
  CheckCircle2,
  RotateCcw,
  FilePen,
} from 'lucide-react'
import { useDraftStore } from '@/features/create-order-draft/draft-store'
import { useCreateOrder } from '@/entities/order/model/use-orders'
import { OrderForm } from '@/widgets/order-form'
import type { CreateOrderFormValues } from '@/entities/order/lib/order.schema'
import { useToast } from '@/shared/ui/toast'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { formatRelativeTime } from '@/entities/order/lib/formatters'
import { DRAFT_AUTOSAVE_INTERVAL_MS, MAX_DRAFTS } from '@/shared/config/constants'
import { cn } from '@/shared/lib/utils'

export default function OrderNewPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false)
  const [deleteDraftDialogOpen, setDeleteDraftDialogOpen] = useState(false)

  const {
    tabs,
    activeDraftId,
    drafts,
    isAutosaving,
    initDrafts,
    createDraft,
    switchDraft,
    closeDraft,
    updateDraftData,
    persistDraft,
    clearDraft,
    clearAllDrafts,
    setAutosaving,
  } = useDraftStore()

  const { mutate: createOrder, isPending: isSubmitting } = useCreateOrder()

  useEffect(() => {
    initDrafts()
  }, [initDrafts])

  const autosaveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    autosaveRef.current = setInterval(() => {
      if (!activeDraftId) return
      setAutosaving(true)
      persistDraft(activeDraftId)
      setTimeout(() => setAutosaving(false), 800)
    }, DRAFT_AUTOSAVE_INTERVAL_MS)
    return () => {
      if (autosaveRef.current) clearInterval(autosaveRef.current)
    }
  }, [activeDraftId, persistDraft, setAutosaving])

  const handleValuesChange = useCallback(
    (values: Partial<CreateOrderFormValues>) => {
      if (activeDraftId) {
        updateDraftData(activeDraftId, values)
      }
    },
    [activeDraftId, updateDraftData],
  )

  function handleSubmit(values: CreateOrderFormValues) {
    if (!activeDraftId) return

    createOrder(
      {
        ...values,
        rate: Math.round(values.rate * 100),
        stops: values.stops.map((s, i) => ({ ...s, sequence: i })),
      },
      {
        onSuccess: (order) => {
          toast({
            variant: 'success',
            title: 'Order created',
            description: `${order.referenceNumber} has been created successfully.`,
          })
          closeDraft(activeDraftId)
          if (tabs.length <= 1) {
            void navigate('/orders')
          }
        },
        onError: (err) => {
          toast({
            variant: 'error',
            title: 'Failed to create order',
            description: err instanceof Error ? err.message : 'Please try again.',
          })
        },
      },
    )
  }

  function handleDeleteDraft() {
    if (!activeDraftId) return
    closeDraft(activeDraftId)
    setDeleteDraftDialogOpen(false)
    if (tabs.length <= 1) {
      void navigate('/orders')
    }
  }

  function handleClearAll() {
    clearAllDrafts()
    setClearAllDialogOpen(false)
    void navigate('/orders')
  }

  const activeDraft = activeDraftId ? drafts[activeDraftId] : null
  const activeTab = tabs.find((t) => t.id === activeDraftId)

  if (!activeDraft || !activeDraftId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ── Workspace header ── */}
      <header className="shrink-0 bg-white border-b border-gray-200">
        {/* Tab bar row */}
        <div className="flex items-stretch h-10 gap-0 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => switchDraft(tab.id)}
              className={cn(
                'group relative flex cursor-pointer items-center gap-2 px-4 text-sm transition-colors whitespace-nowrap shrink-0',
                'border-b-2 outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring',
                tab.id === activeDraftId
                  ? 'border-primary text-primary bg-primary/5 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50',
              )}
            >
              {/* Dirty indicator */}
              {tab.isDirty && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
                  aria-label="Unsaved changes"
                />
              )}
              <FilePen className="w-3.5 h-3.5 shrink-0 opacity-60" />
              <span className="max-w-32 truncate">{tab.label}</span>

              {/* Close tab */}
              <span
                role="button"
                tabIndex={0}
                aria-label={`Close ${tab.label}`}
                onClick={(e) => {
                  e.stopPropagation()
                  closeDraft(tab.id)
                  if (tabs.length <= 1) void navigate('/orders')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation()
                    closeDraft(tab.id)
                    if (tabs.length <= 1) void navigate('/orders')
                  }
                }}
                className={cn(
                  'ml-1 cursor-pointer p-0.5 rounded transition-all',
                  'text-gray-400 hover:text-gray-700 hover:bg-gray-200',
                  tab.id === activeDraftId
                    ? 'opacity-60 hover:opacity-100'
                    : 'opacity-0 group-hover:opacity-60 group-hover:hover:opacity-100',
                )}
              >
                <X className="w-3 h-3" />
              </span>
            </button>
          ))}

          {/* New tab */}
          {tabs.length < MAX_DRAFTS && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => createDraft()}
                  className={cn(
                    'flex cursor-pointer items-center justify-center w-8 my-1 ml-0.5 mx-1 text-gray-400',
                    'hover:text-gray-700 hover:bg-gray-100 rounded transition-colors shrink-0',
                  )}
                  aria-label={`New draft (${tabs.length}/${MAX_DRAFTS})`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                New draft ({tabs.length}/{MAX_DRAFTS})
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Action toolbar row */}
        <div className="flex items-center gap-1 px-4 py-2 border-t border-gray-100">
          {/* Autosave status */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-36 mr-2">
            {isAutosaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Saving…</span>
              </>
            ) : activeTab?.lastSaved ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span>Saved {formatRelativeTime(activeTab.lastSaved)}</span>
              </>
            ) : (
              <span className="text-gray-300">Not saved yet</span>
            )}
          </div>

          <Separator orientation="vertical" className="h-4 mx-1" />

          {/* Draft management actions — secondary weight */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => persistDraft(activeDraftId)}
                className="text-gray-600"
              >
                <Save className="w-3.5 h-3.5" />
                Save
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save draft to local storage</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => clearDraft(activeDraftId)}
                className="text-gray-600"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset all fields in this draft</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setDeleteDraftDialogOpen(true)}
                className="text-gray-600 hover:text-destructive hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Draft
              </Button>
            </TooltipTrigger>
            <TooltipContent>Permanently delete this draft</TooltipContent>
          </Tooltip>

          {tabs.length > 1 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setClearAllDialogOpen(true)}
                  className="text-gray-500 hover:text-destructive hover:bg-red-50"
                >
                  Clear All
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close and delete all {tabs.length} drafts</TooltipContent>
            </Tooltip>
          )}

          {/* Right side — primary action + close */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="submit"
              form="order-form"
              disabled={isSubmitting}
              size="sm"
            >
              {isSubmitting
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : null}
              {isSubmitting ? 'Creating…' : 'Create Order'}
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void navigate('/orders')}
                  className="text-gray-400 hover:text-gray-700"
                  aria-label="Close workspace"
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close workspace</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* ── Form body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Draft heading */}
          <div className="mb-7">
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              {activeTab?.label === 'New Draft' ? 'New Order Draft' : activeTab?.label}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the order details below. Changes autosave every 5 seconds.
            </p>
          </div>

          <div className="space-y-6">
            <OrderForm
              key={activeDraftId}
              draftId={activeDraftId}
              initialValues={activeDraft.formData}
              onValuesChange={handleValuesChange}
              onSubmit={handleSubmit}
              onBlurSave={() => persistDraft(activeDraftId)}
            />
          </div>

          {/* Bottom padding so last section doesn't sit against the edge */}
          <div className="h-20" />
        </div>
      </div>

      {/* Delete draft confirmation */}
      <ConfirmDialog
        open={deleteDraftDialogOpen}
        onOpenChange={setDeleteDraftDialogOpen}
        title="Delete Draft"
        description={
          <>
            Delete <strong>{activeTab?.label ?? 'this draft'}</strong>? All entered data will
            be lost and this cannot be undone.
          </>
        }
        confirmLabel="Delete Draft"
        variant="danger"
        onConfirm={handleDeleteDraft}
      />

      {/* Clear all drafts confirmation */}
      <ConfirmDialog
        open={clearAllDialogOpen}
        onOpenChange={setClearAllDialogOpen}
        title="Clear All Drafts"
        description={`All ${tabs.length} drafts will be permanently deleted. This cannot be undone.`}
        confirmLabel="Clear All Drafts"
        variant="danger"
        onConfirm={handleClearAll}
      />
    </div>
  )
}
