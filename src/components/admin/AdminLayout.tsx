import { Link, useLocation } from 'react-router-dom'
import { Users, BookOpen, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Quản lý tài khoản', to: '/admin/users', icon: Users },
  { label: 'Quản lý khóa học', to: '/admin/courses', icon: BookOpen },
  { label: 'Chấm bài', to: '/admin/submissions', icon: ClipboardList },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div className="flex min-h-[calc(100vh-48px)]">
      {/* Sidebar — min-h offset accounts for StudentLayout 48px sticky header */}
      <aside className="w-60 shrink-0 border-r bg-card">
        <nav className="p-3 space-y-1">
          {navItems.map(({ label, to, icon: Icon }) => {
            const active = location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Page content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
