import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Briefcase,
  Users,
  Settings,
  ArrowRight,
  PieChart,
  Megaphone,
  ShoppingCart,
  Calculator,
  Truck,
} from 'lucide-react'

// Feature modules configuration
const features = [
  {
    title: 'Công việc',
    description: 'Quản lý công việc, dự án và tiến độ.',
    icon: Briefcase,
    href: '/cong-viec',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Hành chính nhân sự',
    description: 'Quản lý nhân sự, chấm công, tính lương.',
    icon: Users,
    href: '/hanh-chinh-nhan-su',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Kinh doanh',
    description: 'Quản lý khách hàng, đơn hàng, doanh thu.',
    icon: PieChart,
    href: '/kinh-doanh',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    title: 'Marketing',
    description: 'Chiến dịch, leads, chăm sóc khách hàng.',
    icon: Megaphone,
    href: '/marketing',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  {
    title: 'Mua hàng',
    description: 'Nhà cung cấp, đơn mua hàng, nhập kho.',
    icon: ShoppingCart,
    href: '/mua-hang',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
  },
  {
    title: 'Kế toán',
    description: 'Thu chi, công nợ, báo cáo tài chính.',
    icon: Calculator,
    href: '/ke-toan',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    title: 'Kho vận',
    description: 'Quản lý kho, tồn kho, vận chuyển.',
    icon: Truck,
    href: '/kho-van',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  {
    title: 'Hệ thống',
    description: 'Cấu hình, phân quyền, sơ đồ tổ chức.',
    icon: Settings,
    href: '/he-thong',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.title}
              to={feature.href}
              className="group relative"
            >
              <Card
                className={cn(
                  // Mobile: Square cards (aspect-square)
                  'aspect-square',
                  // Desktop: Allow natural height with min-height
                  'md:aspect-auto md:min-h-[180px]',
                  // Base styling
                  'h-full border border-border/60 bg-card',
                  'transition-all duration-300',
                  'hover:shadow-lg hover:border-primary/50 hover:-translate-y-1',
                  'overflow-hidden relative',
                  // Active state indicator
                  'group-active:scale-[0.98]',
                  // Desktop: flex column layout
                  'md:flex md:flex-col'
                )}
              >
                {/* Top border accent on hover */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className={cn(
                  'flex flex-col items-center',
                  // Mobile: center and fill height
                  'justify-center h-full p-4 sm:p-6',
                  // Desktop: normal header
                  'md:justify-start md:h-auto md:pb-2 md:pt-6'
                )}>
                  {/* Icon */}
                  <div
                    className={cn(
                      'p-3 sm:p-4 rounded-2xl',
                      feature.bgColor,
                      'bg-opacity-50 group-hover:bg-opacity-100',
                      'transition-all duration-300',
                      'ring-1 ring-border/50',
                      'mb-3 sm:mb-4',
                      // Responsive icon size
                      'flex items-center justify-center'
                    )}
                  >
                    <Icon className={cn('h-6 w-6 sm:h-8 sm:w-8', feature.color)} />
                  </div>
                  
                  {/* Title */}
                  <CardTitle
                    className={cn(
                      'text-center font-semibold',
                      'group-hover:text-primary',
                      'transition-colors duration-300',
                      // Same font size as submenu cards: text-lg
                      'text-lg',
                      'leading-tight',
                      'line-clamp-2',
                      'px-2'
                    )}
                  >
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                
                {/* Description and "Truy cập" button - Desktop only */}
                <CardContent className={cn(
                  'text-center flex flex-col items-center',
                  'hidden md:flex',
                  'pt-0'
                )}>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6 max-w-[90%]">
                    {feature.description}
                  </p>
                  <div className="mt-auto flex items-center text-sm font-medium text-primary opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-primary/10 px-4 py-1.5 rounded-full">
                    Truy cập <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

