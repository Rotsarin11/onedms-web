/**
 * ข้อมูลจำลอง — ใช้เฉพาะค่าที่ปรากฏใน mockup (.png) เท่านั้น
 * ช่องที่ mockup ไม่ได้แสดงจะเป็น null / ค่าว่าง และหน้าจอจะแสดง "—"
 *
 * หมายเหตุ: Invoice IV2610-00458 ใน mockup แสดงข้อมูลไม่ตรงกัน
 *   - หน้ารายการ: 24-10-2026 · Office Supply · ออฟฟิศเมท · 8,560.00 · 1 ไฟล์
 *   - หน้ารายละเอียด Invoice และหน้า PO: 05-10-2026 · Software · แทนเจอรีน · 296,390.00 · 2 ไฟล์
 *   ไฟล์นี้ใช้ชุดหลัง (ตรงกัน 2 จาก 3 หน้าจอ) — TODO: ยืนยันกับผู้ออกแบบ
 */
import type { Company, DocType, DocumentFile, PurchaseOrder, SubType, UsageInfo, Vendor } from '@/types/models'

export const currentUser = {
  displayName: 'วรางคณา อุดธรรมา',
  roleLabel: 'จัดซื้อ · Purchasing',
}

const GMM_ADDRESS_SHORT = '50 อาคารจีเอ็มเอ็ม แกรมมี่ เพลส ถ.สุขุมวิท 21 เขตวัฒนา กรุงเทพฯ'

export const companies: (Company & UsageInfo)[] = [
  {
    companyId: 1,
    companyCode: 'ONEE',
    taxId: '0107564000146',
    address: '50 อาคารจีเอ็มเอ็ม แกรมมี่ เพลส ถนนสุขุมวิท 21 (อโศก) แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพมหานคร 10110',
    isActive: true,
    createdDate: '2026-06-01T09:00:00',
    usageCount: 279,
    userCount: 9,
  },
  { companyId: 2, companyCode: 'GMMTV', taxId: '0105555000000', address: GMM_ADDRESS_SHORT, isActive: true, createdDate: null, usageCount: 86 },
  { companyId: 3, companyCode: 'ONE31', taxId: '0105556000000', address: GMM_ADDRESS_SHORT, isActive: true, createdDate: null, usageCount: 42 },
]

export const vendors: (Vendor & UsageInfo)[] = [
  {
    vendorId: 1,
    vendorCode: '2A009856',
    vendorName: 'บริษัท แทนเจอรีน จำกัด',
    taxId: '0105546131879',
    address: '25 ถนนสาทรใต้ แขวงทุ่งมหาเมฆ เขตสาทร กรุงเทพฯ 10120',
    contactName: 'คุณกิตติ',
    phone: '02-123-4567',
    email: 'sales@tangerine.co.th',
    isActive: true,
    poCount: 24,
    invoiceCount: 21,
  },
  { vendorId: 2, vendorCode: '2A010112', vendorName: 'บริษัท ดาต้าวัน ซิสเต็มส์ จำกัด', taxId: '0105551234567', address: '', contactName: 'คุณนภา', phone: '02-234-5678', email: '', isActive: true },
  { vendorId: 3, vendorCode: '2A010245', vendorName: 'บริษัท ไลท์ติ้ง แอนด์ ซาวด์ เอเชีย จำกัด', taxId: '0125557654321', address: '', contactName: 'คุณวีระ', phone: '02-345-6789', email: '', isActive: true },
  { vendorId: 4, vendorCode: '2A010301', vendorName: 'บริษัท ออฟฟิศเมท พลัส จำกัด', taxId: '0105549876543', address: '', contactName: 'คุณสุดา', phone: '02-456-7890', email: '', isActive: true },
  { vendorId: 5, vendorCode: '2A010388', vendorName: 'บริษัท สตูดิโอ ซัพพลาย (ประเทศไทย) จำกัด', taxId: '0135553456789', address: '', contactName: 'คุณธนา', phone: '02-567-8901', email: '', isActive: true },
  { vendorId: 6, vendorCode: '2A010402', vendorName: 'บริษัท คลาวด์เน็ต เซอร์วิส จำกัด', taxId: '0105562345678', address: '', contactName: 'คุณพิมพ์', phone: '02-678-9012', email: '', isActive: true },
  { vendorId: 7, vendorCode: '2A009012', vendorName: 'บริษัท บางกอก ซีเคียวริตี้ การ์ด จำกัด', taxId: '0105538765432', address: '', contactName: '', phone: '02-789-0123', email: '', isActive: false },
]

export const docTypes: (DocType & UsageInfo)[] = [
  { typeId: 1, typeCode: 'PO', typeName: 'ใบสั่งซื้อ', description: 'Purchase Order — เอกสารสั่งซื้อ/สั่งจ้าง', sortOrder: 1, isActive: true, usageCount: 148 },
  { typeId: 2, typeCode: 'INV', typeName: 'ใบแจ้งหนี้', description: 'Invoice — เอกสารเรียกเก็บเงินจากผู้ขาย', sortOrder: 2, isActive: true, usageCount: 131 },
]

export const subTypes: (SubType & UsageInfo)[] = [
  { subTypeId: 1, subTypeCode: 'SW', subTypeName: 'Software', description: 'ซอฟต์แวร์ ลิขสิทธิ์ และบริการคลาวด์', sortOrder: 1, isActive: true, usageCount: 64 },
  { subTypeId: 2, subTypeCode: 'HW', subTypeName: 'Hardware', description: 'คอมพิวเตอร์และอุปกรณ์ไอที', sortOrder: 2, isActive: true, usageCount: 41 },
  { subTypeId: 3, subTypeCode: 'EQ', subTypeName: 'Equipment', description: 'อุปกรณ์ถ่ายทำ แสง เสียง', sortOrder: 3, isActive: true, usageCount: 37 },
  { subTypeId: 4, subTypeCode: 'PROD', subTypeName: 'Production', description: 'งานผลิตรายการและฉาก', sortOrder: 4, isActive: true, usageCount: 52 },
  { subTypeId: 5, subTypeCode: 'PRT', subTypeName: 'Printing', description: 'งานพิมพ์และสื่อสิ่งพิมพ์', sortOrder: 5, isActive: true, usageCount: 18 },
  { subTypeId: 6, subTypeCode: 'OFS', subTypeName: 'Office Supply', description: 'วัสดุสำนักงาน', sortOrder: 6, isActive: true, usageCount: 29 },
  { subTypeId: 7, subTypeCode: 'SVC', subTypeName: 'Service', description: 'งานบริการทั่วไป', sortOrder: 7, isActive: true, usageCount: 21 },
  { subTypeId: 8, subTypeCode: 'MNT', subTypeName: 'Maintenance', description: 'ค่าบำรุงรักษา', sortOrder: 8, isActive: true, usageCount: 15 },
  { subTypeId: 9, subTypeCode: 'OTH', subTypeName: 'Others', description: 'อื่น ๆ', sortOrder: 9, isActive: false, usageCount: 2 },
]

/** สร้างแถวเอกสารจากข้อมูลในตารางหน้ารายการ (ช่องที่ไม่มีใน mockup = null) */
function listRow(
  id: number,
  typeId: number,
  subTypeId: number,
  documentNumber: string,
  documentDate: string,
  vendorId: number,
  reference: string,
  grandTotal: number,
  documentStatus: PurchaseOrder['documentStatus'],
): PurchaseOrder {
  return {
    purchaseOrderId: id,
    typeId,
    subTypeId,
    documentNumber,
    reference,
    companyId: 1,
    vendorId,
    documentDate,
    receivedDate: null,
    description: null,
    subTotal: null,
    discountAmount: null,
    vatAmount: null,
    grandTotal,
    currencyCode: 'THB',
    documentStatus,
    remark: null,
    createdByName: null,
    createdDate: null,
    modifiedByName: null,
    modifiedDate: null,
  }
}

const PO = 1
const INV = 2

export const documents: PurchaseOrder[] = [
  listRow(112, PO, 2, '1012600481', '2026-11-14', 2, 'OR0752/69', 128400, 'SAVED'),
  listRow(111, INV, 3, 'IV2611-00512', '2026-11-12', 3, '1012600466', 85600, 'SAVED'),
  listRow(110, PO, 6, '1012600479', '2026-11-10', 4, 'OR0745/69', 42372, 'DRAFT'),
  listRow(109, PO, 4, '1012600478', '2026-11-07', 5, 'OR0740/69', 342400, 'SAVED'),
  listRow(108, INV, 1, 'IV2611-00498', '2026-11-05', 6, '1012600459', 64200, 'SAVED'),
  listRow(107, PO, 2, '1012600476', '2026-11-03', 2, 'OR0731/69', 19260, 'CANCELLED'),
  listRow(106, PO, 4, '1012600475', '2026-11-01', 5, 'OR0728/69', 156940, 'SAVED'),
  listRow(105, INV, 5, 'IV2610-00477', '2026-10-30', 1, '1012600452', 74900, 'SAVED'),
  listRow(104, PO, 3, '1012600473', '2026-10-28', 3, 'OR0717/69', 213000, 'DRAFT'),
  {
    ...listRow(103, PO, 1, '1012600472', '2026-09-22', 1, 'OR0697/69', 296390, 'SAVED'),
    receivedDate: '2026-09-23',
    description: 'Gemini Enterprise Standard editions (1ปี)',
    remark: 'ใบเสนอราคา QT2601659-01 วันที่ 13/8/2026',
    subTotal: 277000,
    discountAmount: 0,
    vatAmount: 19390,
    createdByName: currentUser.displayName,
    createdDate: '2026-09-22T15:02:00',
    modifiedByName: currentUser.displayName,
    modifiedDate: '2026-11-19T15:02:00',
  },
  {
    ...listRow(102, INV, 1, 'IV2610-00458', '2026-10-05', 1, '1012600472', 296390, 'SAVED'),
    receivedDate: '2026-10-07',
    description: 'ค่าบริการ Gemini Enterprise + Basic Security',
    remark: 'ใบกำกับภาษีเลขที่ TX2610-0458',
    subTotal: 277000,
    discountAmount: 0,
    vatAmount: 19390,
    createdByName: currentUser.displayName,
    createdDate: '2026-10-07T10:21:00',
    modifiedByName: currentUser.displayName,
    modifiedDate: '2026-11-19T15:02:00',
  },
  listRow(101, PO, 1, '1012600470', '2026-10-20', 6, 'OR0708/69', 96300, 'SAVED'),
]

/**
 * ไฟล์ที่ mockup แสดงชื่อไว้ — วางไฟล์ PDF ชื่อเดียวกันใน public/mock-files/ เพื่อทดสอบการแสดงผล
 */
export const documentFiles: DocumentFile[] = [
  { fileId: 1, purchaseOrderId: 103, fileName: 'PO_1012600472.pdf', filePath: 'mock-files/PO_1012600472.pdf' },
  { fileId: 2, purchaseOrderId: 103, fileName: 'QT2601659-01.pdf', filePath: 'mock-files/QT2601659-01.pdf' },
  { fileId: 3, purchaseOrderId: 102, fileName: 'IV2610-00458.pdf', filePath: 'mock-files/IV2610-00458.pdf' },
  { fileId: 4, purchaseOrderId: 102, fileName: 'ใบกำกับภาษี.pdf', filePath: 'mock-files/ใบกำกับภาษี.pdf' },
]

/** จำนวนไฟล์ตามคอลัมน์ "ไฟล์" ในหน้ารายการ สำหรับเอกสารที่ mockup ไม่ได้แสดงชื่อไฟล์ */
export const fileCountFromMockup: Record<number, number> = {
  112: 1, 111: 2, 110: 0, 109: 1, 108: 1, 107: 1, 106: 1, 105: 1, 104: 0, 101: 1,
}
