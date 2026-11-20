import { companies, docTypes, documentFiles, documents, fileCountFromMockup, subTypes, vendors } from '@/mocks/data'
import type { DocumentFile, PurchaseOrder } from '@/types/models'
import { mockDelay } from './http'

/** ข้อมูลเอกสารพร้อมชื่อที่ join มาแล้ว (ปกติ backend ควรส่งแบบนี้มาให้) */
export interface DocumentView extends PurchaseOrder {
  typeCode: string
  subTypeName: string
  vendorCode: string
  vendorName: string
  companyCode: string
  companyTaxId: string
  fileCount: number
}

function toView(d: PurchaseOrder): DocumentView {
  const files = documentFiles.filter((f) => f.purchaseOrderId === d.purchaseOrderId)
  const vendor = vendors.find((v) => v.vendorId === d.vendorId)
  const company = companies.find((c) => c.companyId === d.companyId)
  return {
    ...d,
    typeCode: docTypes.find((t) => t.typeId === d.typeId)?.typeCode ?? '',
    subTypeName: subTypes.find((s) => s.subTypeId === d.subTypeId)?.subTypeName ?? '',
    vendorCode: vendor?.vendorCode ?? '',
    vendorName: vendor?.vendorName ?? '',
    companyCode: company?.companyCode ?? '',
    companyTaxId: company?.taxId ?? '',
    fileCount: files.length || fileCountFromMockup[d.purchaseOrderId] || 0,
  }
}

/** GET /api/documents — เรียงตามลำดับในหน้ารายการของ mockup */
export async function listDocuments(): Promise<DocumentView[]> {
  await mockDelay()
  return [...documents].sort((a, b) => b.purchaseOrderId - a.purchaseOrderId).map(toView)
}

export interface DocumentDetail {
  document: DocumentView
  files: DocumentFile[]
  /** สำหรับ PO: Invoice ที่ Reference = เลขที่ PO นี้ */
  invoices: DocumentView[]
  /** สำหรับ Invoice: PO ที่เลขที่ตรงกับ Reference (null = ไม่พบในระบบ) */
  referencedPo: DocumentView | null
}

export async function getDocument(id: number): Promise<DocumentDetail | null> {
  await mockDelay()
  const d = documents.find((x) => x.purchaseOrderId === id)
  if (!d) return null
  const view = toView(d)
  const all = documents.map(toView)
  return {
    document: view,
    files: documentFiles.filter((f) => f.purchaseOrderId === id),
    invoices: view.typeCode === 'PO' ? all.filter((x) => x.typeCode === 'INV' && x.reference === view.documentNumber) : [],
    referencedPo: view.typeCode === 'INV' ? (all.find((x) => x.typeCode === 'PO' && x.documentNumber === view.reference) ?? null) : null,
  }
}
