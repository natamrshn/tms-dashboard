import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PAGE_SIZE_OPTIONS } from '@/shared/config/constants'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

function buildPageWindow(page: number, totalPages: number): (number | null)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | null)[] = []
  const WING = 1

  const showLeftEllipsis = page - WING > 2
  const showRightEllipsis = page + WING < totalPages - 1

  pages.push(1)

  if (showLeftEllipsis) {
    pages.push(null)
  } else {
    for (let i = 2; i < page - WING; i++) pages.push(i)
  }

  for (let i = Math.max(2, page - WING); i <= Math.min(totalPages - 1, page + WING); i++) {
    pages.push(i)
  }

  if (showRightEllipsis) {
    pages.push(null)
  } else {
    for (let i = page + WING + 1; i < totalPages; i++) pages.push(i)
  }

  pages.push(totalPages)
  return pages
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const pageWindow = buildPageWindow(page, totalPages)

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5 border-t border-gray-200 bg-white rounded-b-xl">
      {/* Count + page size selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">
          {total === 0 ? 'No results' : `${from}–${to} of ${total}`}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value))
              onPageChange(1)
            }}
            className="cursor-pointer text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {pageWindow.map((p, i) =>
          p === null ? (
            <span
              key={`ellipsis-${i}`}
              className="w-8 text-center text-xs text-gray-400"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'w-8 h-8 cursor-pointer text-xs rounded-md transition-colors font-medium',
                p === page
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              {p}
            </button>
          ),
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
