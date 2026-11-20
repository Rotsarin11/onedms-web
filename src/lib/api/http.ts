/**
 * ตัวช่วยเรียก API จริง (ยังไม่ได้ใช้ — ตอนนี้ทุกหน้าใช้ข้อมูลจำลอง)
 * เมื่อ backend .NET พร้อม: เปลี่ยนฟังก์ชันใน documents.ts / master.ts ให้เรียก http() แทน mock
 * endpoint ที่เห็นใน mockup หน้าข้อผิดพลาดระบบ: POST /api/documents, DELETE /api/vendors/{code}
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return (await res.json()) as T
}

/** หน่วงเวลาให้ข้อมูลจำลองทำตัวเหมือนเรียก API */
export const mockDelay = (ms = 150) => new Promise((r) => setTimeout(r, ms))
