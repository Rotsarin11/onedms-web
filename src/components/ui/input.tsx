import * as React from 'react'
import { cn } from '@/lib/utils'

const fieldBase =
  'w-full rounded-[4px] border border-line bg-white px-3 text-[15px] text-ink placeholder:text-[#a3a6ab] focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink disabled:bg-[#f4f5f7] read-only:bg-[#f4f5f7]'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, 'h-9', className)} {...props} />
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, 'min-h-[60px] py-2 leading-relaxed', className)} {...props} />
}
