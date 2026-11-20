import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/** ลากเรียงลำดับแล้วอัปเดตหน้าจอทันที จากนั้นบันทึก SortOrder */
export function useReorder<T extends { sortOrder: number }>(queryKey: string, getId: (row: T) => number, save: (ids: number[]) => Promise<void>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: save,
    onMutate: (ids: number[]) => {
      const prev = qc.getQueryData<T[]>([queryKey])
      if (prev) {
        const next = ids
          .map((id, i) => {
            const row = prev.find((r) => getId(r) === id)
            return row ? { ...row, sortOrder: i + 1 } : undefined
          })
          .filter((r): r is T => !!r)
        qc.setQueryData([queryKey], next)
      }
      return { prev }
    },
    onError: (_e, _ids, ctx) => {
      if (ctx?.prev) qc.setQueryData([queryKey], ctx.prev)
      toast.error('บันทึกลำดับไม่สำเร็จ')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}
