import { AlertCircle } from 'lucide-react'
import { Button } from '@/shared/ui/button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
        <AlertCircle className="w-5 h-5 text-red-500" />
      </div>
      <p className="text-sm font-semibold text-gray-900">Request failed</p>
      <p className="mt-1.5 text-sm text-gray-500 max-w-xs leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="mt-5"
        >
          Try again
        </Button>
      )}
    </div>
  )
}
