import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

export function Switch({ className, ...props }: SwitchPrimitive.SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'relative inline-flex h-[18px] w-8 shrink-0 cursor-pointer items-center rounded-full border-2 border-ink bg-white transition-colors data-[state=checked]:bg-ink',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block h-3 w-3 translate-x-0.5 rounded-full bg-ink transition-transform data-[state=checked]:translate-x-[15px] data-[state=checked]:bg-white" />
    </SwitchPrimitive.Root>
  )
}
