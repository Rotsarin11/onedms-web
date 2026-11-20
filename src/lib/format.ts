import dayjs from 'dayjs'
import { toast } from 'sonner'
import type { DocumentStatus } from '@/types/models'
import type { BadgeTone } from '@/components/ui/badge'

/** วันที่รูปแบบ dd-mm-yyyy (ค.ศ.) ตาม mockup */
export const fmtDate = (v: string | null | undefined) => (v ? dayjs(v).format('DD-MM-YYYY') : '—')
export const fmtDateTime = (v: string | null | undefined) => (v ? dayjs(v).format('DD-MM-YYYY HH:mm') : '—')

const money = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const fmtMoney = (v: number | null | undefined) => (v == null ? '—' : money.format(v))

export const dash = (v: string | null | undefined) => (v && v.trim() ? v : '—')

export const statusInfo: Record<DocumentStatus, { label: string; tone: BadgeTone }> = {
  SAVED: { label: 'บันทึกแล้ว', tone: 'ok' },
  DRAFT: { label: 'ร่าง', tone: 'draft' },
  CANCELLED: { label: 'ยกเลิก', tone: 'bad' },
}

/** ปุ่มที่ยังไม่มี mockup หรือยังต้องรอ API — แจ้งผู้ใช้แทนการทำงาน */
export function notAvailable(reason: 'mockup' | 'api' = 'api') {
  toast.info(reason === 'mockup' ? 'ยังไม่มี mockup สำหรับส่วนนี้' : 'ส่วนนี้ต้องเชื่อม API จริงก่อน')
}
