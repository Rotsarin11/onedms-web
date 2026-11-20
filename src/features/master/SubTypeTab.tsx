import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Input, Textarea } from '@/components/ui/input'
import { FilterSelect } from '@/components/ui/select'
import { listSubTypes, reorderSubTypes, saveSubType } from '@/lib/api/master'
import type { SubType, UsageInfo } from '@/types/models'
import { ActiveText, MasterTable } from './MasterTable'
import { EditPanel, EmptyPanel, FormRow, StatusSwitch } from './EditPanel'
import { subTypeSchema } from './schemas'
import { useMasterSave } from './useMasterSave'
import { useReorder } from './useReorder'
import type { TabProps } from './MasterPage'

type Row = SubType & UsageInfo

const STATUS_OPTIONS = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'active', label: 'ใช้งาน' },
  { value: 'inactive', label: 'ปิดใช้งาน' },
]

export function SubTypeTab({ selection, setSelection }: TabProps) {
  const q = useQuery({ queryKey: ['subTypes'], queryFn: listSubTypes })
  const reorder = useReorder<Row>('subTypes', (r) => r.subTypeId, reorderSubTypes)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const all = useMemo(() => q.data ?? [], [q.data])
  const filtering = search.trim() !== '' || status !== 'all'

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase()
    return all.filter(
      (r) => (status === 'all' || r.isActive === (status === 'active')) && (!s || r.subTypeCode.toLowerCase().includes(s) || r.subTypeName.toLowerCase().includes(s)),
    )
  }, [all, search, status])

  const selectedId = selection === null ? (all[0]?.subTypeId ?? null) : selection
  const current = selectedId === 'new' ? null : all.find((r) => r.subTypeId === selectedId)

  return (
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-1 overflow-hidden rounded-[4px] rounded-tl-none border border-line bg-white">
        <div className="flex gap-2 border-b border-line p-2.5">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหารหัสหรือชื่อหมวดหมู่" className="w-[300px]" aria-label="ค้นหาหมวดหมู่" />
          <FilterSelect aria-label="สถานะ" prefix="สถานะ:" value={status} onChange={setStatus} options={STATUS_OPTIONS} className="h-9" />
        </div>
        <MasterTable<Row>
          rows={rows}
          getId={(r) => r.subTypeId}
          selectedId={typeof selectedId === 'number' ? selectedId : null}
          onSelect={setSelection}
          // ลากเรียงได้เฉพาะตอนแสดงครบทุกแถว เพื่อไม่ให้ลำดับเพี้ยน
          sortable={!filtering}
          onReorder={(ids) => reorder.mutate(ids)}
          columns={[
            { header: 'ลำดับ', cell: (r) => r.sortOrder, className: 'w-[60px] text-center' },
            { header: 'รหัส', cell: (r) => r.subTypeCode, className: 'w-[90px]' },
            { header: 'ชื่อหมวดหมู่', cell: (r) => <span className="font-semibold">{r.subTypeName}</span>, className: 'w-[170px]' },
            { header: 'รายละเอียด', cell: (r) => <span className="text-ink-soft">{r.description}</span> },
            { header: 'เอกสาร', cell: (r) => r.usageCount ?? '—', className: 'w-[90px] text-right tabular-nums' },
            { header: 'สถานะ', cell: (r) => <ActiveText active={r.isActive} />, className: 'w-[90px] text-center' },
          ]}
        />
      </div>

      {selectedId === null ? (
        <EmptyPanel />
      ) : (
        <SubTypeForm key={String(selectedId)} item={current ?? null} nextOrder={all.length + 1} onDone={setSelection} />
      )}
    </div>
  )
}

function SubTypeForm({ item, nextOrder, onDone }: { item: Row | null; nextOrder: number; onDone: TabProps['setSelection'] }) {
  const form = useForm<z.infer<typeof subTypeSchema>>({
    resolver: zodResolver(subTypeSchema),
    defaultValues: {
      subTypeCode: item?.subTypeCode ?? '',
      subTypeName: item?.subTypeName ?? '',
      description: item?.description ?? '',
      sortOrder: item?.sortOrder ?? nextOrder,
      isActive: item?.isActive ?? true,
    },
  })
  const save = useMasterSave('subTypes', saveSubType, () => item && onDone(item.subTypeId))
  const { errors } = form.formState

  return (
    <EditPanel
      title={item ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'}
      meta={item?.usageCount != null ? `ใช้ในเอกสาร ${item.usageCount} ใบ` : undefined}
      saving={save.isPending}
      onCancel={() => form.reset()}
      onSubmit={form.handleSubmit((v) => save.mutate({ ...v, subTypeId: item?.subTypeId }))}
    >
      <FormRow label="รหัส:" required error={errors.subTypeCode?.message} htmlFor="subTypeCode">
        <Input id="subTypeCode" {...form.register('subTypeCode')} />
      </FormRow>
      <FormRow label="ชื่อหมวดหมู่:" required error={errors.subTypeName?.message} htmlFor="subTypeName">
        <Input id="subTypeName" {...form.register('subTypeName')} />
      </FormRow>
      <FormRow label="รายละเอียด:" error={errors.description?.message} htmlFor="description">
        <Textarea id="description" rows={2} {...form.register('description')} />
      </FormRow>
      <FormRow label="ลำดับ:" error={errors.sortOrder?.message} htmlFor="sortOrder">
        <Input id="sortOrder" type="number" min={1} {...form.register('sortOrder', { valueAsNumber: true })} />
      </FormRow>
      <FormRow label="สถานะ:">
        <Controller control={form.control} name="isActive" render={({ field }) => <StatusSwitch checked={field.value} onChange={field.onChange} />} />
      </FormRow>
    </EditPanel>
  )
}
