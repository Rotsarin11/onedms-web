import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/** บันทึกข้อมูลหลัก แล้วโหลดรายการใหม่ (รวมหน้ารายการเอกสารที่ใช้ชื่อเหล่านี้) */
export function useMasterSave<TInput>(queryKey: string, save: (input: TInput) => Promise<void>, onSaved?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: save,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [queryKey] })
      await qc.invalidateQueries({ queryKey: ['documents'] })
      await qc.invalidateQueries({ queryKey: ['document'] })
      toast.success('บันทึกแล้ว')
      onSaved?.()
    },
    onError: () => toast.error('บันทึกไม่สำเร็จ'),
  })
}
