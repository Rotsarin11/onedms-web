import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { listDocuments, type DocumentView } from '@/lib/api/documents'
import { listSubTypes, listVendors } from '@/lib/api/master'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FilterSelect } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { fmtDate, fmtMoney, notAvailable, statusInfo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { DocumentSummaryPanel } from './DocumentSummaryPanel'

const PAGE_SIZE = 12
const THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

type TypeFilter = 'ALL' | 'PO' | 'INV'

const col = createColumnHelper<DocumentView>()

export function DocumentListPage() {
  const docsQ = useQuery({ queryKey: ['documents'], queryFn: listDocuments })
  const subTypesQ = useQuery({ queryKey: ['subTypes'], queryFn: listSubTypes })
  const vendorsQ = useQuery({ queryKey: ['vendors'], queryFn: listVendors })
  const docs = useMemo(() => docsQ.data ?? [], [docsQ.data])

  const years = useMemo(() => [...new Set(docs.map((d) => dayjs(d.documentDate).year()))].sort((a, b) => b - a), [docs])

  const [search, setSearch] = useState('')
  const [type, setType] = useState<TypeFilter>('ALL')
  const [year, setYear] = useState('2026')
  const [month, setMonth] = useState('all')
  const [subType, setSubType] = useState('all')
  const [vendor, setVendor] = useState('all')
  const [status, setStatus] = useState('all')
  const [onlyNoFile, setOnlyNoFile] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // เอกสารในปีที่เลือก — ใช้กับตัวเลขสรุปใต้หัวข้อ
  const inYear = useMemo(() => docs.filter((d) => year === 'all' || dayjs(d.documentDate).year() === Number(year)), [docs, year])

  // กรองทุกเงื่อนไขยกเว้นประเภท — ใช้นับตัวเลขบนปุ่ม ทั้งหมด / PO / Invoice
  const beforeType = useMemo(() => {
    const q = search.trim().toLowerCase()
    return inYear.filter(
      (d) =>
        (month === 'all' || dayjs(d.documentDate).month() === Number(month)) &&
        (subType === 'all' || d.subTypeId === Number(subType)) &&
        (vendor === 'all' || d.vendorId === Number(vendor)) &&
        (status === 'all' || d.documentStatus === status) &&
        (!onlyNoFile || d.fileCount === 0) &&
        (!q || [d.documentNumber, d.reference ?? '', d.vendorName].some((s) => s.toLowerCase().includes(q))),
    )
  }, [inYear, search, month, subType, vendor, status, onlyNoFile])

  const filtered = useMemo(() => beforeType.filter((d) => type === 'ALL' || d.typeCode === type), [beforeType, type])

  const columns = useMemo(
    () => [
      col.display({ id: 'no', header: 'ลำดับ', cell: (c) => c.row.index + 1, meta: { className: 'w-[56px] text-center' } }),
      col.accessor('typeCode', { header: 'ประเภท', cell: (c) => <span className="font-semibold">{c.getValue()}</span>, meta: { className: 'w-[72px]' } }),
      col.accessor('documentNumber', { header: 'เลขที่เอกสาร', cell: (c) => <span className="font-semibold">{c.getValue()}</span> }),
      col.accessor('documentDate', { header: 'วันที่เอกสาร', cell: (c) => <span className="text-ink-soft">{fmtDate(c.getValue())}</span> }),
      col.accessor('subTypeName', { header: 'หมวดหมู่', cell: (c) => <span className="text-ink-soft">{c.getValue()}</span> }),
      col.accessor('vendorName', {
        header: 'ผู้ขาย',
        cell: (c) => <span className="block max-w-[128px] truncate text-ink-soft" title={c.getValue()}>{c.getValue()}</span>,
      }),
      col.accessor('reference', { header: 'อ้างอิง', cell: (c) => <span className="text-ink-soft">{c.getValue() ?? '—'}</span> }),
      col.accessor('grandTotal', { header: 'ยอดสุทธิ', cell: (c) => fmtMoney(c.getValue()), meta: { className: 'text-right tabular-nums' } }),
      col.accessor('documentStatus', {
        header: 'สถานะ',
        cell: (c) => <Badge tone={statusInfo[c.getValue()].tone}>{statusInfo[c.getValue()].label}</Badge>,
        meta: { className: 'text-center' },
      }),
      col.accessor('fileCount', {
        header: 'ไฟล์',
        cell: (c) => (c.getValue() > 0 ? c.getValue() : <span className="text-warn">—</span>),
        meta: { className: 'w-[52px] text-center' },
      }),
    ],
    [],
  )

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
    autoResetPageIndex: true,
  })

  const selected = filtered.find((d) => d.purchaseOrderId === selectedId) ?? filtered[0]
  const { pageIndex } = table.getState().pagination
  const from = filtered.length ? pageIndex * PAGE_SIZE + 1 : 0
  const to = Math.min(filtered.length, (pageIndex + 1) * PAGE_SIZE)
  const totalAmount = inYear.reduce((s, d) => s + d.grandTotal, 0)
  const noFileCount = inYear.filter((d) => d.fileCount === 0).length

  const typeBtn = (value: TypeFilter, label: string, count: number) => (
    <button
      type="button"
      onClick={() => setType(value)}
      aria-pressed={type === value}
      className={cn(
        'h-[38px] cursor-pointer border-r border-line px-4 text-[15px] font-medium last:border-r-0',
        type === value ? 'bg-primary text-white' : 'bg-white text-ink hover:bg-page',
      )}
    >
      {label} <span className={cn('ml-1 text-sm font-normal', type === value ? 'text-white/80' : 'text-muted')}>{count}</span>
    </button>
  )

  return (
    <div>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold">เอกสาร (PO / Invoice)</h1>
          <p className="text-sm text-ink-soft">
            {year === 'all' ? 'ทุกปี' : `ปี ${year}`} · {inYear.length} ใบ · ยอดสุทธิ {fmtMoney(totalAmount)} THB
            {noFileCount > 0 && (
              <>
                {' · '}
                <button type="button" className="cursor-pointer font-medium text-warn underline" onClick={() => setOnlyNoFile((v) => !v)}>
                  {onlyNoFile ? 'แสดงทั้งหมด' : `ยังไม่มีไฟล์ ${noFileCount} ใบ`}
                </button>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={() => notAvailable('api')}>ส่งออก Excel</Button>
          <Button onClick={() => notAvailable('mockup')}>+ เพิ่มเอกสาร</Button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาเลขที่ / อ้างอิง / ผู้ขาย"
          className="h-[38px] w-[300px]"
          aria-label="ค้นหาเอกสาร"
        />
        <div className="flex overflow-hidden rounded-[4px] border border-line">
          {typeBtn('ALL', 'ทั้งหมด', beforeType.length)}
          {typeBtn('PO', 'PO', beforeType.filter((d) => d.typeCode === 'PO').length)}
          {typeBtn('INV', 'Invoice', beforeType.filter((d) => d.typeCode === 'INV').length)}
        </div>
        <FilterSelect
          aria-label="ปี"
          value={year}
          onChange={setYear}
          options={[...years.map((y) => ({ value: String(y), label: `ปี ${y}` })), { value: 'all', label: 'ทุกปี' }]}
        />
        <FilterSelect
          aria-label="เดือน"
          value={month}
          onChange={setMonth}
          options={[{ value: 'all', label: 'ทุกเดือน' }, ...THAI_MONTHS.map((m, i) => ({ value: String(i), label: m }))]}
        />
        <FilterSelect
          aria-label="หมวดหมู่"
          value={subType}
          onChange={setSubType}
          options={[{ value: 'all', label: 'ทุกหมวดหมู่' }, ...(subTypesQ.data ?? []).map((s) => ({ value: String(s.subTypeId), label: s.subTypeName }))]}
        />
        <FilterSelect
          aria-label="ผู้ขาย"
          value={vendor}
          onChange={setVendor}
          options={[{ value: 'all', label: 'ผู้ขายทั้งหมด' }, ...(vendorsQ.data ?? []).map((v) => ({ value: String(v.vendorId), label: v.vendorName }))]}
        />
        <FilterSelect
          aria-label="สถานะ"
          value={status}
          onChange={setStatus}
          options={[{ value: 'all', label: 'สถานะทั้งหมด' }, ...Object.entries(statusInfo).map(([k, v]) => ({ value: k, label: v.label }))]}
        />
      </div>

      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1 overflow-hidden rounded-[4px] border border-line bg-white">
          <table className="w-full border-collapse text-[14px]">
            <thead className="bg-panel-head">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className={cn(
                        'whitespace-nowrap border-b border-r border-line px-2.5 py-2.5 text-left font-semibold last:border-r-0',
                        (h.column.columnDef.meta as { className?: string } | undefined)?.className,
                      )}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {docsQ.isLoading && (
                <tr>
                  <td colSpan={columns.length} className="py-10 text-center text-muted">กำลังโหลด…</td>
                </tr>
              )}
              {!docsQ.isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="py-10 text-center text-muted">ไม่พบเอกสารตามเงื่อนไข</td>
                </tr>
              )}
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedId(row.original.purchaseOrderId)}
                  className={cn(
                    'cursor-pointer border-b border-line-soft last:border-b-0 hover:bg-[#f7f8fa]',
                    row.original.purchaseOrderId === selected?.purchaseOrderId && 'bg-row-selected hover:bg-row-selected',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        'h-[41px] whitespace-nowrap border-r border-line-soft px-2.5 last:border-r-0',
                        (cell.column.columnDef.meta as { className?: string } | undefined)?.className,
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-line px-3 py-2.5 text-sm text-ink-soft">
            <span>
              แสดง {from}–{to} จาก {filtered.length}
            </span>
            <div className="flex items-center gap-1.5">
              <PageBtn onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} label="หน้าก่อน">
                <ChevronLeft className="size-3.5" />
              </PageBtn>
              {Array.from({ length: table.getPageCount() }, (_, i) => (
                <PageBtn key={i} active={i === pageIndex} onClick={() => table.setPageIndex(i)} label={`หน้า ${i + 1}`}>
                  {i + 1}
                </PageBtn>
              ))}
              <PageBtn onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} label="หน้าถัดไป">
                <ChevronRight className="size-3.5" />
              </PageBtn>
            </div>
          </div>
        </div>

        <DocumentSummaryPanel doc={selected} all={docs} />
      </div>
    </div>
  )
}

function PageBtn({
  children,
  active,
  disabled,
  onClick,
  label,
}: {
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-[26px] min-w-[26px] cursor-pointer items-center justify-center rounded-[3px] border px-1.5 text-sm disabled:cursor-default disabled:opacity-40',
        active ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink',
      )}
    >
      {children}
    </button>
  )
}
