import type { ReactNode } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MasterColumn<T> {
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

interface MasterTableProps<T> {
  rows: T[]
  columns: MasterColumn<T>[]
  getId: (row: T) => number
  selectedId: number | null
  onSelect: (id: number) => void
  /** เปิดการลากเรียงลำดับ (SortOrder) */
  sortable?: boolean
  onReorder?: (orderedIds: number[]) => void
  emptyText?: string
}

/** ตารางข้อมูลหลัก + ลากเรียงลำดับด้วย dnd-kit */
export function MasterTable<T>({ rows, columns, getId, selectedId, onSelect, sortable, onReorder, emptyText = 'ไม่พบข้อมูล' }: MasterTableProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const ids = rows.map(getId)

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const next = arrayMove(ids, ids.indexOf(Number(active.id)), ids.indexOf(Number(over.id)))
    onReorder?.(next)
  }

  const body = (
    <tbody>
      {rows.length === 0 && (
        <tr>
          <td colSpan={columns.length + (sortable ? 1 : 0)} className="py-8 text-center text-muted">{emptyText}</td>
        </tr>
      )}
      {rows.map((row) => (
        <Row key={getId(row)} id={getId(row)} sortable={sortable} selected={getId(row) === selectedId} onSelect={onSelect}>
          {columns.map((c, i) => (
            <td key={i} className={cn('h-10 whitespace-nowrap border-r border-line-soft px-2.5 last:border-r-0', c.className)}>{c.cell(row)}</td>
          ))}
        </Row>
      ))}
    </tbody>
  )

  return (
    <table className="w-full border-collapse text-[14px]">
      <thead className="bg-panel-head">
        <tr>
          {sortable && <th className="w-9 border-b border-r border-line" aria-label="ลากเรียงลำดับ" />}
          {columns.map((c, i) => (
            <th key={i} className={cn('whitespace-nowrap border-b border-r border-line px-2.5 py-2.5 text-left font-semibold last:border-r-0', c.className)}>{c.header}</th>
          ))}
        </tr>
      </thead>
      {sortable ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>{body}</SortableContext>
        </DndContext>
      ) : (
        body
      )}
    </table>
  )
}

function Row({ id, sortable, selected, onSelect, children }: { id: number; sortable?: boolean; selected: boolean; onSelect: (id: number) => void; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: !sortable })
  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={() => onSelect(id)}
      className={cn(
        'cursor-pointer border-b border-line-soft bg-white last:border-b-0 hover:bg-[#f7f8fa]',
        selected && 'bg-row-selected hover:bg-row-selected',
        isDragging && 'relative z-10 shadow-md',
      )}
    >
      {sortable && (
        <td className="w-9 border-r border-line-soft text-center">
          <button type="button" aria-label="ลากเพื่อเรียงลำดับ" className="cursor-grab touch-none p-1 text-[#b0b3b9] active:cursor-grabbing" {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}>
            <GripVertical className="size-3.5" />
          </button>
        </td>
      )}
      {children}
    </tr>
  )
}

/** ข้อความสถานะแบบตัวอักษร (บริษัท / ประเภท / หมวดหมู่) */
export function ActiveText({ active }: { active: boolean }) {
  return <span className={active ? 'text-ok' : 'text-muted'}>{active ? 'ใช้งาน' : 'ปิดใช้งาน'}</span>
}
