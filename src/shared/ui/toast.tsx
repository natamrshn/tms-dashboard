import { Toast as ToastPrimitive } from 'radix-ui'
import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type ToastVariant = 'default' | 'success' | 'error' | 'warning'

interface ToastMessage {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (opts: Omit<ToastMessage, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const VARIANT_STYLES: Record<ToastVariant, string> = {
  default:  'bg-white border-gray-200',
  success:  'bg-white border-green-200',
  error:    'bg-white border-red-200',
  warning:  'bg-white border-amber-200',
}

const VARIANT_ICON: Record<ToastVariant, ReactNode> = {
  default:  <Info className="w-4 h-4 text-gray-500" />,
  success:  <CheckCircle2 className="w-4 h-4 text-green-600" />,
  error:    <AlertCircle className="w-4 h-4 text-red-500" />,
  warning:  <AlertTriangle className="w-4 h-4 text-amber-500" />,
}

const VARIANT_TITLE_COLOR: Record<ToastVariant, string> = {
  default:  'text-gray-900',
  success:  'text-green-900',
  error:    'text-red-900',
  warning:  'text-amber-900',
}

const VARIANT_DESC_COLOR: Record<ToastVariant, string> = {
  default:  'text-gray-500',
  success:  'text-green-700',
  error:    'text-red-700',
  warning:  'text-amber-700',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const toast = useCallback((opts: Omit<ToastMessage, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setMessages((prev) => [...prev, { ...opts, id }])
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id))
    }, 5000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
        {children}

        {messages.map((msg) => (
          <ToastPrimitive.Root
            key={msg.id}
            open
            onOpenChange={(open) => {
              if (!open) setMessages((prev) => prev.filter((m) => m.id !== msg.id))
            }}
            className={cn(
              'group flex items-start gap-3 w-full rounded-xl border shadow-lg p-4',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full',
              'data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)',
              'data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x)',
              'transition-all duration-200',
              VARIANT_STYLES[msg.variant],
            )}
          >
            <div className="shrink-0 mt-0.5">
              {VARIANT_ICON[msg.variant]}
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <ToastPrimitive.Title
                className={cn('text-sm font-semibold', VARIANT_TITLE_COLOR[msg.variant])}
              >
                {msg.title}
              </ToastPrimitive.Title>
              {msg.description && (
                <ToastPrimitive.Description
                  className={cn('text-xs leading-relaxed', VARIANT_DESC_COLOR[msg.variant])}
                >
                  {msg.description}
                </ToastPrimitive.Description>
              )}
            </div>

            <ToastPrimitive.Close
              className="shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}

        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-95 max-w-[calc(100vw-2rem)] outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
