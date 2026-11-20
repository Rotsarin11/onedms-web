import { useQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Input, Textarea } from '@/components/ui/input'
import { listDocTypes, reorderDocTypes, saveDocType } from '@/lib/api/master'
import type { DocType, UsageInfo } from '@/types/models'
import { ActiveText, MasterTable } from './MasterTable'
import { EditPanel, EmptyPanel, FormRow, StatusSwitch } from './EditPanel'
import { docTypeSchema } from './schemas'
import { useMasterSave } from './useMasterSave'
import { useReorder } from './useReorder'
import type { TabProps } from './MasterPage'

type Row = DocType & UsageInfo

export function DocTypeTab({ selection, setSelection }: TabProps) {
  const q = useQuery({ queryKey: ['docTypes'], queryFn: listDocTypes })
  const reorder = useReorder<Row>('docTypes', (r) => r.typeId, reorderDocTypes)
  const rows = q.data ?? []

  const selectedId = selection === null ? (rows[0]?.typeId ?? null) : selection
  const current = selectedId === 'new' ? null : rows.find((t) => t.typeId === selectedId)

  return (
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-1 overflow-hidden rounded-[4px] rounded-tl-none border border-line bg-white">
        <MasterTable<Row>
          rows={rows}
          getId={(r) => r.typeId}
          selectedId={typeof selectedId === 'number' ? selectedId : null}
          onSelect={setSelection}
          sortable
          onReorder={(ids) => reorder.mutate(ids)}
          columns={[
            { header: 'ลำดับ', cell: (r) => r.sortOrder, className: 'w-[60px] text-center' },
            { header: 'รหัส', cell: (r) => <span className="font-semibold">{r.typeCode}</span>, className: 'w-[100px]' },
            { header: 'ชื่อประเภท', cell: (r) => r.typeName, className: 'w-[200px]' },
            { header: 'รายละเอียด', cell: (r) => <span className="text-ink-soft">{r.description}</span> },
            { header: 'เอกสาร', cell: (r) => r.usageCount ?? '—', className: 'w-[96px] text-right tabular-nums' },
            { header: 'สถานะ', cell: (r) => <ActiveText active={r.isActive} />, className: 'w-[90px] text-center' },
          ]}
        />
        <p className="border-t border-line px-3 py-2 text-[13px] text-muted">
          ลากที่ ⠿ เพื่อเปลี่ยนลำดับการแสดง (SortOrder) · รหัสประเภทใช้ในเงื่อนไขของระบบ แก้ไขไม่ได้หลังมีเอกสาร
        </p>
      </div>

      {selectedId === null ? (
        <EmptyPanel />
      ) : (
        <DocTypeForm key={String(selectedId)} item={current ?? null} nextOrder={rows.length + 1} onDone={setSelection} />
      )}
    </div>
  )
}

function DocTypeForm({ item, nextOrder, onDone }: { item: Row | null; nextOrder: number; onDone: TabProps['setSelection'] }) {
  const form = useForm<z.infer<typeof docTypeSchema>>({
    resolver: zodResolver(docTypeSchema),
    defaultValues: {
      typeCode: item?.typeCode ?? '',
      typeName: item?.typeName ?? '',
      description: item?.description ?? '',
      sortOrder: item?.sortOrder ?? nextOrder,
      isActive: item?.isActive ?? true,
    },
  })
  const save = useMasterSave('docTypes', saveDocType, () => item && onDone(item.typeId))
  const { errors } = form.formState
  const codeLocked = (item?.usageCount ?? 0) > 0

  return (
    <EditPanel
      title={item ? 'แก้ไขประเภทเอกสาร' : 'เพิ่มประเภทเอกสาร'}
      meta={item?.usageCount != null ? `ใช้ในเอกสาร ${item.usageCount} ใบ` : undefined}
      saving={save.isPending}
      onCancel={() => form.reset()}
      onSubmit={form.handleSubmit((v) => save.mutate({ ...v, typeId: item?.typeId }))}
    >
      <FormRow label="รหัส:" required error={errors.typeCode?.message} htmlFor="typeCode">
        <div className="relative">
          <Input id="typeCode" readOnly={codeLocked} {...form.register('typeCode')} />
          {codeLocked && <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted">มีเอกสารแล้ว</span>}
        </div>
      </FormRow>
      <FormRow label="ชื่อประเภท:" required error={errors.typeName?.message} htmlFor="typeName">
        <Input id="typeName" {...form.register('typeName')} />
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
