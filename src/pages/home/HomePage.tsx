import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Briefcase,
  Users,
  Settings,
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
    icon: Briefcase,
    href: '/cong-viec',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Hành chính nhân sự',
    icon: Users,
    href: '/hanh-chinh-nhan-su',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Kinh doanh',
    icon: PieChart,
    href: '/kinh-doanh',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    title: 'Marketing',
    icon: Megaphone,
    href: '/marketing',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  {
    title: 'Mua hàng',
    icon: ShoppingCart,
    href: '/mua-hang',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
  },
  {
    title: 'Kế toán',
    icon: Calculator,
    href: '/ke-toan',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    title: 'Kho vận',
    icon: Truck,
    href: '/kho-van',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  {
    title: 'Hệ thống',
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
                  'group-active:scale-[0.98]'
                )}
              >
                {/* Top border accent on hover */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="flex flex-col items-center justify-center h-full p-4 sm:p-6">
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
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

