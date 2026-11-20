import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

/** แผงแก้ไขด้านขวาของหน้าข้อมูลหลัก */
export function EditPanel({
  title,
  children,
  meta,
  onSubmit,
  onCancel,
  saving,
}: {
  title: string
  children: ReactNode
  meta?: ReactNode
  onSubmit: () => void
  onCancel: () => void
  saving?: boolean
}) {
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="w-[420px] shrink-0 overflow-hidden rounded-[4px] border border-line bg-white"
    >
      <h2 className="border-b border-line bg-panel-head px-4 py-2.5 text-[15px] font-semibold">{title}</h2>
      <div>{children}</div>
      <div className="flex items-center gap-2 border-t border-line bg-[#f7f8fa] px-3 py-3">
        <span className="mr-auto text-[13px] text-muted">{meta}</span>
        <Button type="button" variant="outline" onClick={onCancel}>ยกเลิก</Button>
        <Button type="submit" disabled={saving}>{saving ? 'กำลังบันทึก…' : 'บันทึก'}</Button>
      </div>
    </form>
  )
}

export function FormRow({ label, required, error, children, htmlFor }: { label: string; required?: boolean; error?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex border-b border-line-soft">
      <label htmlFor={htmlFor} className="w-[118px] shrink-0 whitespace-nowrap border-r border-line-soft px-3 py-3 text-[14px] text-ink-soft">
        {label}
        {required && <span className="text-bad"> *</span>}
      </label>
      <div className="min-w-0 flex-1 px-2.5 py-1.5">
        {children}
        {error && <p className="mt-1 text-[13px] text-bad">{error}</p>}
      </div>
    </div>
  )
}

export function StatusSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex h-9 items-center gap-2.5 text-[15px]">
      <Switch checked={checked} onCheckedChange={onChange} aria-label="สถานะ" />
      <span className={cn(!checked && 'text-muted')}>{checked ? 'ใช้งาน' : 'ปิดใช้งาน'}</span>
    </label>
  )
}

export function EmptyPanel({ text = 'เลือกรายการจากตารางเพื่อแก้ไข' }: { text?: string }) {
  return (
    <div className="w-[420px] shrink-0 rounded-[4px] border border-line bg-white px-4 py-10 text-center text-sm text-muted">{text}</div>
  )
}
