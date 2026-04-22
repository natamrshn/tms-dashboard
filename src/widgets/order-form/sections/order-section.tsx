import { useState } from 'react'
import { Controller } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import type { CreateOrderFormValues } from '@/entities/order/lib/order.schema'
import { useCarriers } from '@/entities/carrier/model/use-carriers'
import { EQUIPMENT_TYPE_LABELS, LOAD_TYPE_LABELS } from '@/entities/order/model/status-machine'
import type { EquipmentType, LoadType } from '@/entities/order/model/types'
import type { Carrier } from '@/entities/carrier/model/types'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { cn } from '@/shared/lib/utils'

interface OrderSectionProps {
  form: UseFormReturn<CreateOrderFormValues>
}

const EQUIPMENT_OPTIONS: { value: EquipmentType; label: string }[] = Object.entries(
  EQUIPMENT_TYPE_LABELS,
).map(([value, label]) => ({ value: value as EquipmentType, label }))

const LOAD_OPTIONS: { value: LoadType; label: string }[] = Object.entries(
  LOAD_TYPE_LABELS,
).map(([value, label]) => ({ value: value as LoadType, label }))

// Searchable combobox for carrier selection — filters by name or MC#.
interface CarrierComboboxProps {
  value: string | undefined
  onChange: (id: string) => void
  carriers: Carrier[]
  isLoading: boolean
  hasError: boolean
}

function CarrierCombobox({ value, onChange, carriers, isLoading, hasError }: CarrierComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? carriers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.mcNumber.toLowerCase().includes(search.toLowerCase()),
      )
    : carriers

  const selected = carriers.find((c) => c.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={hasError}
          className={cn(
            'flex h-9 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background transition-[color,box-shadow]',
            'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError && 'border-destructive focus-visible:ring-destructive/20',
            !selected && 'text-muted-foreground',
          )}
        >
          <span className="truncate">
            {isLoading
              ? 'Loading carriers…'
              : selected
                ? (
                    <>
                      {selected.name}
                      <span className="ml-1.5 text-muted-foreground font-mono text-xs">
                        MC-{selected.mcNumber}
                      </span>
                    </>
                  )
                : 'Select a carrier…'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width]">
        {/* Search */}
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or MC#…"
            className="flex h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* List */}
        <div className="max-h-60 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No carriers found.</p>
          ) : (
            filtered.map((carrier) => (
              <button
                key={carrier.id}
                type="button"
                onClick={() => {
                  onChange(carrier.id)
                  setSearch('')
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                  'hover:bg-accent hover:text-accent-foreground',
                  value === carrier.id && 'bg-accent/40',
                )}
              >
                <Check
                  className={cn(
                    'w-3.5 h-3.5 shrink-0 text-primary',
                    value === carrier.id ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <span className="flex-1 truncate">{carrier.name}</span>
                <span className="text-xs text-muted-foreground font-mono shrink-0">
                  MC-{carrier.mcNumber}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function OrderSection({ form }: OrderSectionProps) {
  const { control, register, formState: { errors } } = form
  const { data: carriersData, isLoading: carriersLoading } = useCarriers()
  const carriers = carriersData?.data ?? []

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Order Details</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Carrier — full width, searchable combobox */}
        <div className="sm:col-span-2 space-y-1.5">
          <Label>
            Carrier <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="carrierId"
            control={control}
            render={({ field }) => (
              <CarrierCombobox
                value={field.value ?? undefined}
                onChange={(id) => field.onChange(id)}
                carriers={carriers}
                isLoading={carriersLoading}
                hasError={!!errors.carrierId}
              />
            )}
          />
          {errors.carrierId && (
            <p className="text-xs text-destructive">{errors.carrierId.message}</p>
          )}
        </div>

        {/* Equipment type */}
        <div className="space-y-1.5">
          <Label>
            Equipment Type <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="equipmentType"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ''}
                onValueChange={(v) => field.onChange(v || undefined)}
              >
                <SelectTrigger aria-invalid={!!errors.equipmentType}>
                  <SelectValue placeholder="Select equipment…" />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.equipmentType && (
            <p className="text-xs text-destructive">{errors.equipmentType.message}</p>
          )}
        </div>

        {/* Load type */}
        <div className="space-y-1.5">
          <Label>
            Load Type <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="loadType"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ''}
                onValueChange={(v) => field.onChange(v || undefined)}
              >
                <SelectTrigger aria-invalid={!!errors.loadType}>
                  <SelectValue placeholder="Select load type…" />
                </SelectTrigger>
                <SelectContent>
                  {LOAD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.loadType && (
            <p className="text-xs text-destructive">{errors.loadType.message}</p>
          )}
        </div>

        {/* Rate */}
        <div className="space-y-1.5">
          <Label htmlFor="rate">
            Rate (USD) <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none select-none">
              $
            </span>
            <Input
              id="rate"
              {...register('rate', { valueAsNumber: true })}
              type="number"
              min="0"
              step="0.01"
              placeholder="1500.00"
              className="pl-7"
              aria-invalid={!!errors.rate}
            />
          </div>
          {errors.rate && (
            <p className="text-xs text-destructive">{errors.rate.message}</p>
          )}
        </div>

        {/* Weight */}
        <div className="space-y-1.5">
          <Label htmlFor="weight">
            Weight (lbs) <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="weight"
              {...register('weight', { valueAsNumber: true })}
              type="number"
              min="0"
              placeholder="e.g. 20000"
              className="pr-10"
              aria-invalid={!!errors.weight}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none select-none">
              lbs
            </span>
          </div>
          {errors.weight && (
            <p className="text-xs text-destructive">{errors.weight.message}</p>
          )}
        </div>

        {/* Notes — full width */}
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="notes">
            Notes
            <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Special instructions, hazmat notes, temperature requirements…"
            rows={3}
            className="resize-none"
          />
          {errors.notes && (
            <p className="text-xs text-destructive">{errors.notes.message}</p>
          )}
        </div>
      </div>
    </section>
  )
}
