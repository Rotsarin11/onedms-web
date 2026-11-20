import { NavLink, Outlet } from 'react-router'
import { ChevronDown } from 'lucide-react'
import logo from '@/assets/logo-one-placeholder.png'
import { Button } from '@/components/ui/button'
import { companies, currentUser } from '@/mocks/data'
import { notAvailable } from '@/lib/format'
import { cn } from '@/lib/utils'

const navItem = 'relative flex h-full items-center px-3 text-[15px] text-ink-soft'
const activeBar = 'after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:bg-ink'

export function AppLayout() {
  // TODO: บริษัทที่เลือกจะมาจาก T_USER_COMPANY ของผู้ใช้ที่ login
  const company = companies[0]

  return (
    <div className="min-h-screen">
      <header className="bg-white">
        <div className="flex h-[60px] items-center gap-6 px-7">
          <div className="flex items-center gap-2.5">
            {/* TODO: เปลี่ยนเป็นไฟล์โลโก้จริง (ตอนนี้ตัดจากภาพ mockup) */}
            <img src={logo} alt="one" className="h-[31px] w-auto" />
            <div className="leading-tight">
              <div className="text-[15px] font-semibold">OneDMS</div>
              <div className="text-xs text-muted">จัดเก็บเอกสาร PO / Invoice</div>
            </div>
          </div>

          <nav className="flex h-full items-stretch border-l border-line-soft pl-4">
            <NavLink to="/documents" className={({ isActive }) => cn(navItem, isActive && ['font-semibold text-ink', activeBar])}>
              เอกสาร
            </NavLink>
            {/* หน้ารายงานยังไม่อยู่ในขอบเขตงาน */}
            <button type="button" className={cn(navItem, 'cursor-pointer')} onClick={() => notAvailable('mockup')}>
              รายงาน
            </button>
            <NavLink to="/settings/master" className={({ isActive }) => cn(navItem, 'gap-1', isActive && ['font-semibold text-ink', activeBar])}>
              ตั้งค่า <ChevronDown className="size-3" aria-hidden />
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex h-[34px] items-center gap-2 rounded-[4px] border border-line bg-page px-2.5 text-sm">
              <span className="text-muted">บริษัท</span>
              <span className="font-semibold">
                {company.companyCode} · {company.taxId}
              </span>
              <ChevronDown className="size-3 text-muted" aria-hidden />
            </div>
            <div className="text-right leading-tight">
              <div className="text-[15px] font-medium">{currentUser.displayName}</div>
              <div className="text-xs text-muted">{currentUser.roleLabel}</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => notAvailable('api')}>
              ออกจากระบบ
            </Button>
          </div>
        </div>
        <div className="brand-line" />
      </header>

      <main className="px-7 py-5">
        <Outlet />
      </main>
    </div>
  )
}
