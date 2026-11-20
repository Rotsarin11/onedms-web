/**
 * ชนิดข้อมูลตาม ER Diagram (Phase 1)
 * ชื่อฟิลด์เป็น camelCase ตามรูปแบบ JSON ปกติของ ASP.NET Core
 * TODO: ปรับให้ตรงกับ API จริงเมื่อได้ Swagger/OpenAPI
 */

/** M_COMPANY */
export interface Company {
  companyId: number
  companyCode: string
  taxId: string
  address: string
  isActive: boolean
  createdDate: string | null
}

/** M_VENDOR */
export interface Vendor {
  vendorId: number
  vendorCode: string
  vendorName: string
  taxId: string
  address: string
  contactName: string
  phone: string
  email: string
  isActive: boolean
}

/** M_TYPE */
export interface DocType {
  typeId: number
  typeCode: string
  typeName: string
  description: string
  sortOrder: number
  isActive: boolean
}

/** M_SUBTYPE */
export interface SubType {
  subTypeId: number
  subTypeCode: string
  subTypeName: string
  description: string
  sortOrder: number
  isActive: boolean
}

/**
 * T_PURCHASE_ORDER.DocumentStatus เป็น nvarchar(20) ใน ER
 * ค่าด้านล่างอิงจากป้ายสถานะใน mockup — TODO: ยืนยันค่าจริงกับ backend
 */
export type DocumentStatus = 'SAVED' | 'DRAFT' | 'CANCELLED'

/** T_PURCHASE_ORDER (เก็บทั้ง PO และ Invoice แยกด้วย TypeId) */
export interface PurchaseOrder {
  purchaseOrderId: number
  typeId: number
  subTypeId: number
  documentNumber: string
  reference: string | null
  companyId: number
  vendorId: number
  documentDate: string
  receivedDate: string | null
  description: string | null
  subTotal: number | null
  discountAmount: number | null
  vatAmount: number | null
  grandTotal: number
  currencyCode: string
  documentStatus: DocumentStatus
  remark: string | null
  createdByName: string | null
  createdDate: string | null
  modifiedByName: string | null
  modifiedDate: string | null
}

/** T_DOCUMENT_FILE */
export interface DocumentFile {
  fileId: number
  purchaseOrderId: number
  fileName: string
  /** URL สำหรับเปิดไฟล์ — ตอนนี้ชี้ไปที่ public/mock-files */
  filePath: string
}

/**
 * ตัวเลขที่ mockup แสดงแต่คำนวณไม่ได้จากข้อมูลจำลองชุดเล็ก
 * (เช่น "ใช้ในเอกสาร 148 ใบ") — เมื่อมี API ให้ backend ส่งค่ามา
 */
export interface UsageInfo {
  usageCount?: number
  poCount?: number
  invoiceCount?: number
  userCount?: number
}
