import { createBrowserRouter, createHashRouter, Navigate, type RouteObject } from 'react-router'
import { AppLayout } from './AppLayout'
import { DocumentListPage } from '@/features/documents/DocumentListPage'
import { DocumentDetailPage } from '@/features/documents/DocumentDetailPage'
import { MasterPage } from '@/features/master/MasterPage'

/**
 * เส้นทางยึดตาม M_MENU.RoutePath — เฉพาะหน้าที่อยู่ในขอบเขตงานตอนนี้
 *   /documents          รายการเอกสาร
 *   /documents/:id      รายละเอียด PO / Invoice
 *   /settings/master    ข้อมูลหลัก (แท็บ company | vendor | type | subtype)
 */
const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/documents" replace /> },
      { path: 'documents', element: <DocumentListPage /> },
      { path: 'documents/:id', element: <DocumentDetailPage /> },
      { path: 'settings/master', element: <Navigate to="/settings/master/company" replace /> },
      { path: 'settings/master/:tab', element: <MasterPage /> },
      { path: '*', element: <Navigate to="/documents" replace /> },
    ],
  },
]

/**
 * VITE_ROUTER=hash ใช้ตอนวางไฟล์บนเซิร์ฟเวอร์ที่ยังไม่ได้ตั้ง URL rewrite
 * บน IIS จริงแนะนำ browser router + ตั้ง rewrite ไป index.html
 */
export const router = import.meta.env.VITE_ROUTER === 'hash' ? createHashRouter(routes) : createBrowserRouter(routes)
