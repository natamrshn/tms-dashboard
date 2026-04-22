import { useFieldArray, Controller } from 'react-hook-form'
import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Plus, Trash2, MapPin, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'
import type { CreateOrderFormValues } from '@/entities/order/lib/order.schema'
import { STOP_TYPE_LABELS, APPOINTMENT_TYPE_LABELS } from '@/entities/order/model/status-machine'
import type { StopType, AppointmentType } from '@/entities/order/model/types'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { cn } from '@/shared/lib/utils'

interface StopsSectionProps {
  form: UseFormReturn<CreateOrderFormValues>
}

const STOP_TYPES: StopType[] = ['pick_up', 'drop_off', 'stop']
const APPOINTMENT_TYPES: AppointmentType[] = ['fixed', 'window', 'fcfs']

const STOP_TYPE_BADGE: Record<StopType, string> = {
  pick_up:  'bg-green-100 text-green-700 border-green-200',
  drop_off: 'bg-red-100   text-red-700   border-red-200',
  stop:     'bg-blue-100  text-blue-700  border-blue-200',
}

export function StopsSection({ form }: StopsSectionProps) {
  const { register, control, watch, formState: { errors } } = form
  const { fields, append, remove, move } = useFieldArray({ control, name: 'stops' })

  const stopsErrors = errors.stops
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    setDragOverIndex(index)
  }

  function handleDrop(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex !== null && dragIndex !== index) {
      move(dragIndex, index)
    }
    setDragIndex(null)
    setDragOverIndex(null)
  }

  function handleDragEnd() {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  function addStop() {
    append({
      type: 'stop',
      sequence: fields.length,
      address: { street: '', city: '', state: '', zip: '' },
      appointmentType: 'fixed',
      scheduledDate: '',
    })
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Stops</h3>
          <span className="text-xs text-muted-foreground">
            ({fields.length}/5)
          </span>
        </div>
        {fields.length < 5 && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={addStop}
            className="text-primary hover:text-primary hover:bg-primary/8"
          >
            <Plus className="w-3.5 h-3.5" />
            Add stop
          </Button>
        )}
      </div>

      {/* Array-level validation error */}
      {typeof stopsErrors === 'object' && !Array.isArray(stopsErrors) && stopsErrors?.message && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
          <span className="text-xs text-red-700">{stopsErrors.message}</span>
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const stopType = watch(`stops.${index}.type`) as StopType | undefined
          const type = stopType ?? 'stop'
          const isLast = index === fields.length - 1

          return (
            <div
              key={field.id}
              className="relative"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Connector line between stops */}
              {!isLast && (
                <div className="absolute left-5.5 top-[calc(100%-4px)] w-0.5 h-4 bg-gray-200 z-0" />
              )}

              <div className={cn(
                'border rounded-xl bg-white overflow-hidden transition-colors',
                dragOverIndex === index && dragIndex !== index
                  ? 'border-primary/60 shadow-md ring-2 ring-primary/20'
                  : 'border-gray-200',
              )}>
                {/* Stop header */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/80 border-b border-gray-200">
                  {/* Drag handle */}
                  <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0 cursor-grab active:cursor-grabbing" />

                  {/* Connector dot */}
                  <div className={cn('w-2.5 h-2.5 rounded-full shrink-0 border-2 border-white ring-2', {
                    'ring-green-400 bg-green-500': type === 'pick_up',
                    'ring-red-400 bg-red-500': type === 'drop_off',
                    'ring-blue-400 bg-blue-500': type === 'stop',
                  })} />

                  <span className={cn(
                    'text-xs font-medium rounded-full border px-2 py-0.5',
                    STOP_TYPE_BADGE[type],
                  )}>
                    Stop {index + 1}
                  </span>

                  {/* Type selector */}
                  <Controller
                    name={`stops.${index}.type`}
                    control={control}
                    render={({ field: f }) => (
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger className="h-7 text-xs w-auto min-w-28 border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STOP_TYPES.map((t) => (
                            <SelectItem key={t} value={t} className="text-xs">
                              {STOP_TYPE_LABELS[t]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  <div className="ml-auto flex items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => move(index, index - 1)}
                      disabled={index === 0}
                      title="Move stop up"
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => move(index, index + 1)}
                      disabled={index === fields.length - 1}
                      title="Move stop down"
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                    {fields.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => remove(index)}
                        title="Remove stop"
                        className="text-gray-400 hover:text-destructive hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Stop body */}
                <div className="p-4 space-y-3">
                  {/* Location + Ref */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Location Name</Label>
                      <Input
                        {...register(`stops.${index}.locationName`)}
                        placeholder="e.g. Main Warehouse"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Stop Ref #</Label>
                      <Input
                        {...register(`stops.${index}.refNumber`)}
                        placeholder="e.g. PO-1234"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Address */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-gray-600">Address</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2 space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Street <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          {...register(`stops.${index}.address.street`)}
                          placeholder="100 Industrial Pkwy"
                          className="h-8 text-xs"
                          aria-invalid={!!errors.stops?.[index]?.address?.street}
                        />
                        {errors.stops?.[index]?.address?.street && (
                          <p className="text-xs text-destructive">
                            {errors.stops[index]?.address?.street?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          City <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          {...register(`stops.${index}.address.city`)}
                          placeholder="Chicago"
                          className="h-8 text-xs"
                          aria-invalid={!!errors.stops?.[index]?.address?.city}
                        />
                        {errors.stops?.[index]?.address?.city && (
                          <p className="text-xs text-destructive">
                            {errors.stops[index]?.address?.city?.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">
                            State <span className="text-destructive">*</span>
                          </Label>
                          <Controller
                            name={`stops.${index}.address.state`}
                            control={control}
                            render={({ field: f }) => (
                              <Input
                                value={f.value ?? ''}
                                onChange={(e) => f.onChange(e.target.value.toUpperCase())}
                                onBlur={f.onBlur}
                                placeholder="IL"
                                maxLength={2}
                                className="h-8 text-xs uppercase"
                                aria-invalid={!!errors.stops?.[index]?.address?.state}
                              />
                            )}
                          />
                          {errors.stops?.[index]?.address?.state && (
                            <p className="text-xs text-destructive">
                              {errors.stops[index]?.address?.state?.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">
                            ZIP <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            {...register(`stops.${index}.address.zip`)}
                            placeholder="60601"
                            maxLength={10}
                            className="h-8 text-xs"
                            aria-invalid={!!errors.stops?.[index]?.address?.zip}
                          />
                          {errors.stops?.[index]?.address?.zip && (
                            <p className="text-xs text-destructive">
                              {errors.stops[index]?.address?.zip?.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Appointment */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Appointment Type</Label>
                      <Controller
                        name={`stops.${index}.appointmentType`}
                        control={control}
                        render={({ field: f }) => (
                          <Select value={f.value} onValueChange={f.onChange}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {APPOINTMENT_TYPES.map((t) => (
                                <SelectItem key={t} value={t} className="text-xs">
                                  {APPOINTMENT_TYPE_LABELS[t]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Scheduled Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        {...register(`stops.${index}.scheduledDate`)}
                        type="date"
                        className="h-8 text-xs"
                        aria-invalid={!!errors.stops?.[index]?.scheduledDate}
                      />
                      {errors.stops?.[index]?.scheduledDate && (
                        <p className="text-xs text-destructive">
                          {errors.stops[index]?.scheduledDate?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Time
                        <span className="ml-1 text-[10px] font-normal text-gray-400">(optional)</span>
                      </Label>
                      <Input
                        {...register(`stops.${index}.scheduledTime`)}
                        type="time"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Contact Name</Label>
                      <Input
                        {...register(`stops.${index}.contactName`)}
                        placeholder="John Doe"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Contact Phone</Label>
                      <Input
                        {...register(`stops.${index}.contactPhone`)}
                        placeholder="(555) 000-0000"
                        className="h-8 text-xs"
                        aria-invalid={!!errors.stops?.[index]?.contactPhone}
                      />
                      {errors.stops?.[index]?.contactPhone && (
                        <p className="text-xs text-destructive">
                          {errors.stops[index]?.contactPhone?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stop notes */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Notes</Label>
                    <Textarea
                      {...register(`stops.${index}.notes`)}
                      placeholder="Special instructions for this stop…"
                      rows={2}
                      className="text-xs resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add stop CTA at the bottom */}
      {fields.length < 5 && (
        <button
          type="button"
          onClick={addStop}
          className={cn(
            'w-full cursor-pointer rounded-xl border-2 border-dashed border-gray-200 py-3',
            'text-sm text-muted-foreground font-medium',
            'hover:border-primary/40 hover:text-primary hover:bg-primary/3 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <Plus className="inline w-3.5 h-3.5 mr-1.5" />
          Add another stop
        </button>
      )}
    </section>
  )
}
