import { useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CreateOrderFormValues } from '@/entities/order/lib/order.schema'
import { createOrderSchema } from '@/entities/order/lib/order.schema'
import { ClientSection } from './sections/client-section'
import { OrderSection } from './sections/order-section'
import { StopsSection } from './sections/stops-section'

function buildDefaultValues(): Partial<CreateOrderFormValues> {
  return {
    stops: [
      {
        type: 'pick_up',
        sequence: 0,
        address: { street: '', city: '', state: '', zip: '' },
        appointmentType: 'fixed',
        scheduledDate: '',
      },
      {
        type: 'drop_off',
        sequence: 1,
        address: { street: '', city: '', state: '', zip: '' },
        appointmentType: 'fixed',
        scheduledDate: '',
      },
    ],
  }
}

interface OrderFormProps {
  draftId: string
  initialValues: Partial<CreateOrderFormValues>
  onValuesChange: (values: Partial<CreateOrderFormValues>) => void
  onSubmit: (values: CreateOrderFormValues) => void
  onBlurSave?: () => void
}

export function OrderForm({
  draftId,
  initialValues,
  onValuesChange,
  onSubmit,
  onBlurSave,
}: OrderFormProps) {
  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: { ...buildDefaultValues(), ...initialValues },
    mode: 'onBlur',
  })

  const { handleSubmit, watch, reset } = form

  // When the active draft switches, reset the form with new values
  useEffect(() => {
    reset({ ...buildDefaultValues(), ...initialValues })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally excluding initialValues to avoid re-render loops
  }, [draftId, reset])

  // Sync form changes up to parent (for autosave)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const sub = watch((values) => {
      onValuesChange(values as Partial<CreateOrderFormValues>)
    })
    return () => sub.unsubscribe()
  }, [watch, onValuesChange])

  const handleFormSubmit = useCallback(
    (values: CreateOrderFormValues) => {
      onSubmit(values)
    },
    [onSubmit],
  )

  const handleInvalid = useCallback(() => {
    requestAnimationFrame(() => {
      const formEl = document.getElementById('order-form')
      const firstError = formEl?.querySelector<HTMLElement>('[aria-invalid="true"]')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [])

  return (
    <form
      id="order-form"
      onSubmit={(e) => void handleSubmit(handleFormSubmit, handleInvalid)(e)}
      onBlur={onBlurSave}
      className="space-y-8"
      noValidate
    >
      <ClientSection form={form} />
      <OrderSection form={form} />
      <StopsSection form={form} />
    </form>
  )
}
