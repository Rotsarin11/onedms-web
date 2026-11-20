/**
 * API ข้อมูลหลัก (M_COMPANY, M_VENDOR, M_TYPE, M_SUBTYPE)
 * ตอนนี้บันทึกลงหน่วยความจำของเบราว์เซอร์ (รีเฟรชแล้วกลับเป็นค่าเริ่มต้น)
 */
import { companies, docTypes, subTypes, vendors } from '@/mocks/data'
import type { Company, DocType, SubType, UsageInfo, Vendor } from '@/types/models'
import { mockDelay } from './http'

const store = {
  companies: structuredClone(companies),
  vendors: structuredClone(vendors),
  docTypes: structuredClone(docTypes),
  subTypes: structuredClone(subTypes),
}

type WithUsage<T> = T & UsageInfo

function upsert<T, K extends keyof T>(list: T[], key: K, item: T): T[] {
  const idx = list.findIndex((x) => x[key] === item[key])
  if (idx >= 0) list[idx] = { ...list[idx], ...item }
  else list.push(item)
  return list
}

const nextId = (ids: number[]) => (ids.length ? Math.max(...ids) + 1 : 1)

// ---------- Company ----------
export async function listCompanies(): Promise<WithUsage<Company>[]> {
  await mockDelay()
  return structuredClone(store.companies)
}
export async function saveCompany(input: Omit<Company, 'companyId' | 'createdDate'> & { companyId?: number }) {
  await mockDelay()
  const companyId = input.companyId ?? nextId(store.companies.map((c) => c.companyId))
  const existing = store.companies.find((c) => c.companyId === companyId)
  upsert(store.companies, 'companyId', { ...existing, ...input, companyId, createdDate: existing?.createdDate ?? new Date().toISOString() })
}

// ---------- Vendor ----------
export async function listVendors(): Promise<WithUsage<Vendor>[]> {
  await mockDelay()
  return structuredClone(store.vendors)
}
export async function saveVendor(input: Omit<Vendor, 'vendorId'> & { vendorId?: number }) {
  await mockDelay()
  const vendorId = input.vendorId ?? nextId(store.vendors.map((v) => v.vendorId))
  upsert(store.vendors, 'vendorId', { ...store.vendors.find((v) => v.vendorId === vendorId), ...input, vendorId })
}

// ---------- DocType ----------
export async function listDocTypes(): Promise<WithUsage<DocType>[]> {
  await mockDelay()
  return structuredClone(store.docTypes).sort((a, b) => a.sortOrder - b.sortOrder)
}
export async function saveDocType(input: Omit<DocType, 'typeId'> & { typeId?: number }) {
  await mockDelay()
  const typeId = input.typeId ?? nextId(store.docTypes.map((t) => t.typeId))
  upsert(store.docTypes, 'typeId', { ...store.docTypes.find((t) => t.typeId === typeId), ...input, typeId })
}
export async function reorderDocTypes(orderedIds: number[]) {
  await mockDelay()
  orderedIds.forEach((id, i) => {
    const t = store.docTypes.find((x) => x.typeId === id)
    if (t) t.sortOrder = i + 1
  })
}

// ---------- SubType ----------
export async function listSubTypes(): Promise<WithUsage<SubType>[]> {
  await mockDelay()
  return structuredClone(store.subTypes).sort((a, b) => a.sortOrder - b.sortOrder)
}
export async function saveSubType(input: Omit<SubType, 'subTypeId'> & { subTypeId?: number }) {
  await mockDelay()
  const subTypeId = input.subTypeId ?? nextId(store.subTypes.map((s) => s.subTypeId))
  upsert(store.subTypes, 'subTypeId', { ...store.subTypes.find((s) => s.subTypeId === subTypeId), ...input, subTypeId })
}
export async function reorderSubTypes(orderedIds: number[]) {
  await mockDelay()
  orderedIds.forEach((id, i) => {
    const s = store.subTypes.find((x) => x.subTypeId === id)
    if (s) s.sortOrder = i + 1
  })
}
