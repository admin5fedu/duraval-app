import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  Settings,
  BarChart3,
  Warehouse
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Khách hàng', href: '/customers', icon: Users },
  { name: 'Sản phẩm', href: '/products', icon: Package },
  { name: 'Kho hàng', href: '/inventory', icon: Warehouse },
  { name: 'Đơn hàng', href: '/orders', icon: ShoppingCart },
  { name: 'Báo cáo', href: '/reports', icon: BarChart3 },
  { name: 'Tài liệu', href: '/documents', icon: FileText },
  { name: 'Cài đặt', href: '/settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="w-64 bg-card border-r flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-primary">Duraval</h1>
        <p className="text-xs text-muted-foreground mt-1">ERP System</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

