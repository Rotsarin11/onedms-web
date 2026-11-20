import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { listCompanies, listDocTypes, listSubTypes, listVendors } from '@/lib/api/master'
import { notAvailable } from '@/lib/format'
import { cn } from '@/lib/utils'
import { CompanyTab } from './CompanyTab'
import { VendorTab } from './VendorTab'
import { DocTypeTab } from './DocTypeTab'
import { SubTypeTab } from './SubTypeTab'

export type Selection = number | 'new' | null
export interface TabProps {
  selection: Selection
  setSelection: (s: Selection) => void
}

const TABS = {
  company: { label: 'บริษัท', subtitle: 'บริษัทในกลุ่มที่ใช้ระบบ (M_COMPANY)', addLabel: '+ เพิ่มบริษัท' },
  vendor: { label: 'ผู้ขาย', subtitle: 'ใช้เลือกในหน้าบันทึกเอกสาร PO / Invoice', addLabel: '+ เพิ่มผู้ขาย' },
  type: { label: 'ประเภทเอกสาร', subtitle: 'ประเภทเอกสาร (M_TYPE) ใช้แยก PO กับ Invoice ในตารางเดียวกัน', addLabel: '+ เพิ่มประเภท' },
  subtype: { label: 'หมวดหมู่', subtitle: 'หมวดหมู่ค่าใช้จ่าย/บริการ (M_SUBTYPE) ใช้ได้ทั้ง PO และ Invoice', addLabel: '+ เพิ่มหมวดหมู่' },
} as const
type TabKey = keyof typeof TABS

export function MasterPage() {
  const { tab = 'company' } = useParams()
  const [selection, setSelection] = useState<Selection>(null)
  const [lastTab, setLastTab] = useState(tab)
  // ล้างรายการที่เลือกเมื่อเปลี่ยนแท็บ
  if (tab !== lastTab) {
    setLastTab(tab)
    setSelection(null)
  }

  const counts: Record<TabKey, number | undefined> = {
    company: useQuery({ queryKey: ['companies'], queryFn: listCompanies }).data?.length,
    vendor: useQuery({ queryKey: ['vendors'], queryFn: listVendors }).data?.length,
    type: useQuery({ queryKey: ['docTypes'], queryFn: listDocTypes }).data?.length,
    subtype: useQuery({ queryKey: ['subTypes'], queryFn: listSubTypes }).data?.length,
  }

  if (!(tab in TABS)) return <Navigate to="/settings/master/company" replace />
  const key = tab as TabKey
  const info = TABS[key]
  const tabProps: TabProps = { selection, setSelection }

  return (
    <div>
      {/* เมนูย่อยของ "ตั้งค่า" — ผู้ใช้และสิทธิ์ / ข้อผิดพลาดระบบ ยังไม่อยู่ในขอบเขตงานนี้ */}
      <nav className="-mt-1 mb-4 flex items-center gap-2 text-sm">
        <span className="text-muted">ตั้งค่า /</span>
        <span className="rounded-[3px] bg-ink px-2.5 py-1 font-semibold text-white">ข้อมูลหลัก</span>
        {['ผู้ใช้และสิทธิ์', 'ข้อผิดพลาดระบบ'].map((label) => (
          <button key={label} type="button" onClick={() => notAvailable('mockup')} className="cursor-pointer rounded-[3px] border border-line bg-white px-2.5 py-1 text-ink-soft">
            {label}
          </button>
        ))}
      </nav>

      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight">ข้อมูลหลัก (Master)</h1>
          <p className="text-sm text-ink-soft">{info.subtitle}</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={() => notAvailable('api')}>นำเข้าจาก Excel</Button>
          <Button onClick={() => setSelection('new')}>{info.addLabel}</Button>
        </div>
      </div>

      <div role="tablist" className="flex">
        {(Object.keys(TABS) as TabKey[]).map((k) => (
          <Link
            key={k}
            role="tab"
            aria-selected={k === key}
            to={`/settings/master/${k}`}
            className={cn(
              '-mb-px border border-line px-4 py-2.5 text-[15px] [&:not(:first-child)]:-ml-px',
              k === key ? 'relative z-10 border-b-white bg-white font-semibold' : 'bg-panel-head text-ink-soft hover:text-ink',
            )}
          >
            {TABS[k].label} <span className="ml-1 text-sm font-normal text-muted">{counts[k] ?? ''}</span>
          </Link>
        ))}
      </div>

      {key === 'company' && <CompanyTab {...tabProps} />}
      {key === 'vendor' && <VendorTab {...tabProps} />}
      {key === 'type' && <DocTypeTab {...tabProps} />}
      {key === 'subtype' && <SubTypeTab {...tabProps} />}
    </div>
  )
}
