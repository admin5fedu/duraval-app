import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Users,
  Briefcase,
  Settings,
  LayoutDashboard,
  PieChart,
  ShoppingCart,
  Calculator,
  Truck,
  Megaphone,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar'

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  title: string
  url?: string
  icon?: React.ComponentType<{ className?: string }>
  items?: NavItem[]
}

const data: { navMain: NavGroup[] } = {
  navMain: [
    {
      title: 'Menu',
      url: '#',
      icon: LayoutDashboard,
      items: [
        {
          title: 'Trang chủ',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Công việc',
          url: '/cong-viec',
          icon: Briefcase,
        },
        {
          title: 'Hành chính nhân sự',
          url: '/hanh-chinh-nhan-su',
          icon: Users,
        },
        {
          title: 'Kinh doanh',
          url: '/kinh-doanh',
          icon: PieChart,
        },
        {
          title: 'Marketing',
          url: '/marketing',
          icon: Megaphone,
        },
        {
          title: 'Mua hàng',
          url: '/mua-hang',
          icon: ShoppingCart,
        },
        {
          title: 'Kế toán',
          url: '/ke-toan',
          icon: Calculator,
        },
        {
          title: 'Kho vận',
          url: '/kho-van',
          icon: Truck,
        },
        {
          title: 'Hệ thống',
          url: '/he-thong',
          icon: Settings,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const pathname = location.pathname

  // Prefetch routes on mount for faster navigation
  React.useEffect(() => {
    data.navMain.forEach((group) => {
      group.items?.forEach((item) => {
        // Prefetch route on mount
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = item.url
        document.head.appendChild(link)
      })
    })
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <img
              src="https://duraval.vn/wp-content/uploads/2024/08/logoduraval-png-khong-chu-e1724896799526-1024x370.png"
              alt="Duraval Logo"
              className="size-6 object-contain brightness-0 invert"
            />
          </div>
          <div className="flex flex-col gap-0.5 leading-none overflow-hidden">
            <span className="font-semibold truncate">Duraval ERP</span>
            <span className="text-xs text-muted-foreground truncate">v1.0.0</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items ? (
                  group.items.map((item) => {
                    const Icon = item.icon
                    // Check if current path matches the item URL
                    const isActive =
                      pathname === item.url ||
                      (item.url !== '/' && pathname.startsWith(item.url))

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className="gap-3 transition-all duration-200 ease-in-out hover:pl-4"
                        >
                          <Link 
                            to={item.url} 
                            className="flex items-center"
                            onMouseEnter={() => {
                              // Prefetch on hover for faster navigation
                              const link = document.createElement('link')
                              link.rel = 'prefetch'
                              link.href = item.url
                              document.head.appendChild(link)
                            }}
                          >
                            {Icon && <Icon className="size-4" />}
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === group.url}
                    >
                      <Link to={group.url || '#'}>
                        {group.icon && <group.icon className="size-4" />}
                        <span>{group.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {/* Footer content */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

