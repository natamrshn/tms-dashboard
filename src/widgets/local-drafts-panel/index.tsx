import { useNavigate } from 'react-router-dom'
import { FilePen, ArrowRight, Plus, X, Clock } from 'lucide-react'
import { useDraftStore } from '@/features/create-order-draft/draft-store'
import { formatRelativeTime } from '@/entities/order/lib/formatters'
import { MAX_DRAFTS } from '@/shared/config/constants'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'

export function LocalDraftsPanel() {
  const navigate = useNavigate()
  const { tabs, drafts, createDraft, switchDraft, closeDraft } = useDraftStore()

  const visibleDrafts = tabs.filter((t) => {
    const d = drafts[t.id]
    if (!d) return false
    const data = d.formData
    return (
      (data.referenceNumber && data.referenceNumber !== t.label) ||
      data.clientName ||
      data.carrierId ||
      data.stops?.some((s) => s.address?.city)
    )
  })

  if (visibleDrafts.length === 0) return null

  return (
    <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3">
      {/* Panel header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FilePen className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-sm font-semibold text-amber-900">
            Unsaved Drafts
          </span>
          <span className="text-xs text-amber-600 font-medium bg-amber-100 border border-amber-200 rounded-full px-1.5 py-0.5 leading-none">
            {visibleDrafts.length}/{MAX_DRAFTS}
          </span>
        </div>

        <Button
          variant="ghost"
          size="xs"
          onClick={() => void navigate('/orders/new')}
          className="text-amber-700 hover:bg-amber-100 hover:text-amber-900 gap-1"
        >
          Open workspace
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      {/* Draft cards */}
      <div className="flex gap-2 flex-wrap">
        {visibleDrafts.map((tab) => {
          const draft = drafts[tab.id]
          return (
            <div key={tab.id} className="relative group/card">
              <button
                onClick={() => {
                  switchDraft(tab.id)
                  void navigate('/orders/new')
                }}
                className={cn(
                  'flex cursor-pointer items-start gap-2 rounded-lg border border-amber-200 bg-white',
                  'px-3 py-2 pr-8 text-left max-w-52',
                  'hover:border-amber-300 hover:bg-amber-50 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{tab.label}</p>
                  {draft?.formData.clientName && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {draft.formData.clientName}
                    </p>
                  )}
                  {draft?.updatedAt && (
                    <p className="flex items-center gap-1 text-[10px] text-amber-600 mt-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatRelativeTime(draft.updatedAt)}
                    </p>
                  )}
                </div>
              </button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      closeDraft(tab.id)
                    }}
                    aria-label="Discard draft"
                    className={cn(
                      'absolute top-1.5 right-1.5 cursor-pointer p-0.5 rounded',
                      'text-gray-400 hover:text-red-500 hover:bg-red-50',
                      'opacity-0 group-hover/card:opacity-100',
                      'transition-all focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-ring',
                    )}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Discard draft</TooltipContent>
              </Tooltip>
            </div>
          )
        })}

        {tabs.length < MAX_DRAFTS && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  createDraft()
                  void navigate('/orders/new')
                }}
                className={cn(
                  'flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-amber-300 bg-white',
                  'px-3 py-2 text-xs text-amber-600 font-medium',
                  'hover:border-amber-400 hover:bg-amber-50 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                <Plus className="w-3 h-3" />
                New draft
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Create a new draft ({tabs.length}/{MAX_DRAFTS} used)
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
