import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** กล่องข้อมูลด้านขวา: หัวข้อสีเทา + แถว label | value */
export function InfoPanel({ title, children, className }: { title?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('overflow-hidden rounded-[4px] border border-line bg-white', className)}>
      {title && <h2 className="border-b border-line bg-panel-head px-4 py-2.5 text-[15px] font-semibold">{title}</h2>}
      {children}
    </section>
  )
}

export interface InfoRow {
  label: string
  value: ReactNode
  align?: 'left' | 'right'
  strong?: boolean
}

export function InfoRows({ rows, labelWidth = 'w-[130px]' }: { rows: InfoRow[]; labelWidth?: string }) {
  return (
    <dl>
      {rows.map((r) => (
        <div key={r.label} className="flex border-b border-line-soft last:border-b-0">
          <dt className={cn('shrink-0 whitespace-nowrap border-r border-line-soft px-3.5 py-2.5 text-[15px] text-ink-soft', labelWidth)}>{r.label}</dt>
          <dd className={cn('min-w-0 flex-1 px-3 py-2.5 text-[15px]', r.align === 'right' && 'text-right tabular-nums', r.strong && 'font-semibold')}>
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
