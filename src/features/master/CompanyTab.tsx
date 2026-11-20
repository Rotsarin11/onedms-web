import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Input, Textarea } from '@/components/ui/input'
import { listCompanies, saveCompany } from '@/lib/api/master'
import { fmtDateTime } from '@/lib/format'
import type { Company, UsageInfo } from '@/types/models'
import { ActiveText, MasterTable } from './MasterTable'
import { EditPanel, EmptyPanel, FormRow, StatusSwitch } from './EditPanel'
import { companySchema } from './schemas'
import { useMasterSave } from './useMasterSave'
import type { TabProps } from './MasterPage'

type Row = Company & UsageInfo

export function CompanyTab({ selection, setSelection }: TabProps) {
  const q = useQuery({ queryKey: ['companies'], queryFn: listCompanies })
  const [search, setSearch] = useState('')
  const rows = useMemo(() => {
    const s = search.trim().toLowerCase()
    return (q.data ?? []).filter((c) => !s || c.companyCode.toLowerCase().includes(s) || c.taxId.includes(s))
  }, [q.data, search])

  const selectedId = selection === null ? (q.data?.[0]?.companyId ?? null) : selection
  const current = selectedId === 'new' ? null : q.data?.find((c) => c.companyId === selectedId)

  return (
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-1 overflow-hidden rounded-[4px] rounded-tl-none border border-line bg-white">
        <div className="border-b border-line p-2.5">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหารหัสหรือเลขผู้เสียภาษี" className="w-[300px]" aria-label="ค้นหาบริษัท" />
        </div>
        <MasterTable<Row>
          rows={rows}
          getId={(r) => r.companyId}
          selectedId={typeof selectedId === 'number' ? selectedId : null}
          onSelect={setSelection}
          columns={[
            { header: 'รหัสบริษัท', cell: (r) => r.companyCode, className: 'w-[140px]' },
            { header: 'เลขผู้เสียภาษี', cell: (r) => r.taxId, className: 'w-[140px]' },
            { header: 'ที่อยู่', cell: (r) => <span className="block max-w-[440px] truncate text-ink-soft" title={r.address}>{r.address}</span> },
            { header: 'ใช้ใน PO/INV', cell: (r) => r.usageCount ?? '—', className: 'w-[110px] text-right tabular-nums' },
            { header: 'สถานะ', cell: (r) => <ActiveText active={r.isActive} />, className: 'w-[90px] text-center' },
          ]}
        />
        <p className="border-t border-line bg-[#fdf6e9] px-3 py-2 text-[13px] text-warn">M_COMPANY ไม่มีฟิลด์ชื่อบริษัท ระบบจึงแสดงด้วยรหัสบริษัท</p>
      </div>

      {selectedId === null ? <EmptyPanel /> : <CompanyForm key={String(selectedId)} company={current ?? null} onDone={setSelection} />}
    </div>
  )
}

function CompanyForm({ company, onDone }: { company: Row | null; onDone: TabProps['setSelection'] }) {
  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyCode: company?.companyCode ?? '',
      taxId: company?.taxId ?? '',
      address: company?.address ?? '',
      isActive: company?.isActive ?? true,
    },
  })
  const save = useMasterSave('companies', saveCompany, () => company && onDone(company.companyId))
  const { errors } = form.formState

  return (
    <EditPanel
      title={company ? 'แก้ไขบริษัท' : 'เพิ่มบริษัท'}
      meta={company?.userCount != null ? `ผู้ใช้ที่เข้าถึง ${company.userCount} คน` : undefined}
      saving={save.isPending}
      onCancel={() => form.reset()}
      onSubmit={form.handleSubmit((v) => save.mutate({ ...v, companyId: company?.companyId }))}
    >
      <FormRow label="รหัสบริษัท:" required error={errors.companyCode?.message} htmlFor="companyCode">
        <Input id="companyCode" {...form.register('companyCode')} />
      </FormRow>
      <FormRow label="เลขผู้เสียภาษี:" required error={errors.taxId?.message} htmlFor="taxId">
        <Input id="taxId" inputMode="numeric" maxLength={13} {...form.register('taxId')} />
      </FormRow>
      <FormRow label="ที่อยู่:" error={errors.address?.message} htmlFor="address">
        <Textarea id="address" rows={3} {...form.register('address')} />
      </FormRow>
      <FormRow label="สถานะ:">
        <Controller control={form.control} name="isActive" render={({ field }) => <StatusSwitch checked={field.value} onChange={field.onChange} />} />
      </FormRow>
      <FormRow label="สร้างเมื่อ:">
        <div className="flex h-9 items-center text-[15px] text-ink-soft">{fmtDateTime(company?.createdDate)}</div>
      </FormRow>
    </EditPanel>
  )
}
