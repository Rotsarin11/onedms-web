import { z } from 'zod'

/** เลขประจำตัวผู้เสียภาษี 13 หลัก (TaxId varchar(13) ใน ER) */
const taxId = z.string().trim().regex(/^\d{13}$/, 'เลขผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก')
const required = (label: string, max: number) => z.string().trim().min(1, `กรุณากรอก${label}`).max(max, `${label}ยาวเกิน ${max} ตัวอักษร`)

// ความยาวสูงสุดตามชนิดคอลัมน์ใน ER Diagram
export const companySchema = z.object({
  companyCode: required('รหัสบริษัท', 50),
  taxId,
  address: z.string().max(500),
  isActive: z.boolean(),
})

export const vendorSchema = z.object({
  vendorCode: required('รหัสผู้ขาย', 30),
  vendorName: required('ชื่อผู้ขาย', 255),
  taxId,
  address: z.string().max(500),
  contactName: z.string().max(150),
  phone: z.string().max(30),
  email: z.union([z.literal(''), z.email('รูปแบบอีเมลไม่ถูกต้อง').max(255)]),
  isActive: z.boolean(),
})

export const docTypeSchema = z.object({
  typeCode: required('รหัส', 30),
  typeName: required('ชื่อประเภท', 100),
  description: z.string().max(500),
  sortOrder: z.number({ error: 'กรุณากรอกลำดับเป็นตัวเลข' }).int('ลำดับต้องเป็นจำนวนเต็ม').min(1, 'ลำดับต้องมากกว่า 0'),
  isActive: z.boolean(),
})

export const subTypeSchema = z.object({
  subTypeCode: required('รหัส', 30),
  subTypeName: required('ชื่อหมวดหมู่', 150),
  description: z.string().max(500),
  sortOrder: z.number({ error: 'กรุณากรอกลำดับเป็นตัวเลข' }).int('ลำดับต้องเป็นจำนวนเต็ม').min(1, 'ลำดับต้องมากกว่า 0'),
  isActive: z.boolean(),
})
