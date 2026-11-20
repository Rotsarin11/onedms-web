import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Option {
  value: string
  label: string
}

interface FilterSelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  /** ข้อความนำหน้า เช่น "สถานะ:" */
  prefix?: string
  className?: string
  'aria-label'?: string
}

/** ปุ่ม dropdown สำหรับตัวกรอง (เช่น "ปี 2026 ▾") */
export function FilterSelect({ value, onChange, options, prefix, className, ...rest }: FilterSelectProps) {
  const current = options.find((o) => o.value === value)
  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger
        aria-label={rest['aria-label']}
        className={cn(
          'inline-flex h-[38px] cursor-pointer items-center gap-2 rounded-[4px] border border-line bg-white px-3 text-[15px] font-medium text-ink hover:border-[#b6b9be] focus:outline-none focus:ring-1 focus:ring-ink',
          className,
        )}
      >
        <span>
          {prefix ? `${prefix} ` : ''}
          {current?.label}
        </span>
        <ChevronDown className="size-3 text-muted" aria-hidden />
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-80 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[4px] border border-line bg-white shadow-md"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value}
                className="relative flex cursor-pointer select-none items-center rounded-[3px] py-1.5 pl-7 pr-3 text-[15px] outline-none data-[highlighted]:bg-row-selected"
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2">
                  <Check className="size-3.5" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
