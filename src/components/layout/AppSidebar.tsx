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
import { AppLogo } from '@/components/shared/AppLogo'
import { APP_NAME, APP_VERSION } from '@/lib/app-config'

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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <AppLogo size="md" />
          <div className="flex flex-col gap-0.5 leading-none overflow-hidden">
            <span className="font-semibold truncate">{APP_NAME}</span>
            <span className="text-xs text-muted-foreground truncate">v{APP_VERSION}</span>
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
        <div className="px-2 py-2 border-t">
          <div className="flex items-center justify-center">
            <span className="text-xs text-muted-foreground">
              Version {APP_VERSION}
            </span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

