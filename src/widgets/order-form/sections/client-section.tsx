import type { UseFormReturn } from 'react-hook-form'
import type { CreateOrderFormValues } from '@/entities/order/lib/order.schema'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

interface ClientSectionProps {
  form: UseFormReturn<CreateOrderFormValues>
}

export function ClientSection({ form }: ClientSectionProps) {
  const { register, formState: { errors } } = form

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Client</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="clientName">
            Client Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="clientName"
            {...register('clientName')}
            placeholder="e.g. Acme Manufacturing Co."
            aria-invalid={!!errors.clientName}
          />
          {errors.clientName && (
            <p className="text-xs text-destructive">{errors.clientName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="referenceNumber">
            Reference Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="referenceNumber"
            {...register('referenceNumber')}
            placeholder="e.g. TMS-12345"
            className="font-mono"
            aria-invalid={!!errors.referenceNumber}
          />
          {errors.referenceNumber && (
            <p className="text-xs text-destructive">{errors.referenceNumber.message}</p>
          )}
        </div>
      </div>
    </section>
  )
}
