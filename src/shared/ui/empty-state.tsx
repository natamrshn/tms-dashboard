import type { ReactNode } from 'react'
import { Button } from '@/shared/ui/button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 text-gray-400">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      {description && (
        <p className="mt-1.5 text-sm text-gray-500 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Quick helper for empty table cells */
export function TableEmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        action ? (
          <Button size="sm" variant="outline" onClick={action.onClick}>
            {action.label}
          </Button>
        ) : undefined
      }
    />
  )
}
