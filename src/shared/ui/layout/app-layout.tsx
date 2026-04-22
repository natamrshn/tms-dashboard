import { NavLink, Outlet } from 'react-router-dom'
import { Truck, FileText } from 'lucide-react'
import { Separator } from '@/shared/ui/separator'

export function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
          {/* Logo */}
          <div className="h-14 flex items-center gap-2.5 px-4">
            <div className="flex items-center justify-center w-7 h-7 bg-primary rounded-lg shrink-0">
              <Truck className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex items-baseline gap-1 min-w-0">
              <span className="text-sm font-bold text-gray-900 tracking-tight">TMS</span>
              <span className="text-sm text-gray-400">Dashboard</span>
            </div>
          </div>

          <Separator />

          {/* Navigation */}
          <nav className="flex-1 px-2.5 py-3 space-y-0.5">
            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Operations
            </p>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? 'bg-primary/8 text-primary font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <FileText className="w-4 h-4 shrink-0" />
              Orders
            </NavLink>
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200">
            <p className="text-[11px] text-gray-400 font-medium">TMS Dashboard</p>
            <p className="text-[10px] text-gray-300 mt-0.5">v1.0</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
  )
}
