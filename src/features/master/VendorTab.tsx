import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Input, Textarea } from '@/components/ui/input'
import { FilterSelect } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { listVendors, saveVendor } from '@/lib/api/master'
import type { UsageInfo, Vendor } from '@/types/models'
import { MasterTable } from './MasterTable'
import { EditPanel, EmptyPanel, FormRow, StatusSwitch } from './EditPanel'
import { vendorSchema } from './schemas'
import { useMasterSave } from './useMasterSave'
import type { TabProps } from './MasterPage'

type Row = Vendor & UsageInfo

const STATUS_OPTIONS = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'active', label: 'ใช้งาน' },
  { value: 'inactive', label: 'ปิดใช้งาน' },
]

export function VendorTab({ selection, setSelection }: TabProps) {
  const q = useQuery({ queryKey: ['vendors'], queryFn: listVendors })
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase()
    return (q.data ?? []).filter(
      (v) =>
        (status === 'all' || v.isActive === (status === 'active')) &&
        (!s || [v.vendorCode, v.vendorName, v.taxId].some((x) => x.toLowerCase().includes(s))),
    )
  }, [q.data, search, status])

  const selectedId = selection === null ? (q.data?.[0]?.vendorId ?? null) : selection
  const current = selectedId === 'new' ? null : q.data?.find((v) => v.vendorId === selectedId)

  return (
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-1 overflow-hidden rounded-[4px] rounded-tl-none border border-line bg-white">
        <div className="flex gap-2 border-b border-line p-2.5">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหา รหัส / ชื่อ / เลขผู้เสียภาษี" className="w-[300px]" aria-label="ค้นหาผู้ขาย" />
          <FilterSelect aria-label="สถานะ" prefix="สถานะ:" value={status} onChange={setStatus} options={STATUS_OPTIONS} className="h-9" />
        </div>
        <MasterTable<Row>
          rows={rows}
          getId={(r) => r.vendorId}
          selectedId={typeof selectedId === 'number' ? selectedId : null}
          onSelect={setSelection}
          columns={[
            { header: 'รหัส', cell: (r) => <span className="text-ink-soft">{r.vendorCode}</span>, className: 'w-[96px]' },
            { header: 'ชื่อผู้ขาย', cell: (r) => <span className="font-semibold">{r.vendorName}</span> },
            { header: 'เลขผู้เสียภาษี', cell: (r) => <span className="text-ink-soft">{r.taxId}</span>, className: 'w-[130px]' },
            { header: 'ผู้ติดต่อ', cell: (r) => <span className="text-ink-soft">{r.contactName || '—'}</span>, className: 'w-[130px]' },
            { header: 'โทรศัพท์', cell: (r) => <span className="text-ink-soft">{r.phone || '—'}</span>, className: 'w-[112px]' },
            {
              header: 'สถานะ',
              cell: (r) => <Badge tone={r.isActive ? 'ok' : 'bad'}>{r.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}</Badge>,
              className: 'w-[84px] text-center',
            },
          ]}
        />
      </div>

      {selectedId === null ? <EmptyPanel /> : <VendorForm key={String(selectedId)} vendor={current ?? null} onDone={setSelection} />}
    </div>
  )
}

function VendorForm({ vendor, onDone }: { vendor: Row | null; onDone: TabProps['setSelection'] }) {
  const form = useForm<z.infer<typeof vendorSchema>>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      vendorCode: vendor?.vendorCode ?? '',
      vendorName: vendor?.vendorName ?? '',
      taxId: vendor?.taxId ?? '',
      address: vendor?.address ?? '',
      contactName: vendor?.contactName ?? '',
      phone: vendor?.phone ?? '',
      email: vendor?.email ?? '',
      isActive: vendor?.isActive ?? true,
    },
  })
  const save = useMasterSave('vendors', saveVendor, () => vendor && onDone(vendor.vendorId))
  const { errors } = form.formState
  const usage = vendor && vendor.poCount != null ? `ใช้ใน PO ${vendor.poCount} · Invoice ${vendor.invoiceCount ?? 0}` : undefined

  return (
    <EditPanel
      title={vendor ? 'แก้ไขผู้ขาย' : 'เพิ่มผู้ขาย'}
      meta={usage}
      saving={save.isPending}
      onCancel={() => form.reset()}
      onSubmit={form.handleSubmit((v) => save.mutate({ ...v, vendorId: vendor?.vendorId }))}
    >
      <FormRow label="รหัสผู้ขาย:" required error={errors.vendorCode?.message} htmlFor="vendorCode">
        <Input id="vendorCode" {...form.register('vendorCode')} />
      </FormRow>
      <FormRow label="ชื่อผู้ขาย:" required error={errors.vendorName?.message} htmlFor="vendorName">
        <Input id="vendorName" {...form.register('vendorName')} />
      </FormRow>
      <FormRow label="เลขผู้เสียภาษี:" required error={errors.taxId?.message} htmlFor="taxId">
        <Input id="taxId" inputMode="numeric" maxLength={13} {...form.register('taxId')} />
      </FormRow>
      <FormRow label="ที่อยู่:" error={errors.address?.message} htmlFor="address">
        <Textarea id="address" rows={2} {...form.register('address')} />
      </FormRow>
      <FormRow label="ผู้ติดต่อ:" error={errors.contactName?.message} htmlFor="contactName">
        <Input id="contactName" {...form.register('contactName')} />
      </FormRow>
      <FormRow label="โทรศัพท์:" error={errors.phone?.message} htmlFor="phone">
        <Input id="phone" inputMode="tel" {...form.register('phone')} />
      </FormRow>
      <FormRow label="อีเมล:" error={errors.email?.message} htmlFor="email">
        <Input id="email" type="email" {...form.register('email')} />
      </FormRow>
      <FormRow label="สถานะ:">
        <Controller control={form.control} name="isActive" render={({ field }) => <StatusSwitch checked={field.value} onChange={field.onChange} />} />
      </FormRow>
    </EditPanel>
  )
}
