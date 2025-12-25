import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

// Extended feature list based on user request
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
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tổng quan</h2>
        <p className="text-muted-foreground">
          Chào mừng trở lại, chọn một module để bắt đầu làm việc.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.title}
              to={feature.href}
              className="group relative"
            >
              <Card className="h-full border border-border/60 bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="flex flex-col items-center text-center pb-2 pt-6">
                  <div
                    className={`p-4 rounded-full ${feature.bgColor} bg-opacity-50 group-hover:bg-opacity-100 transition-all duration-300 mb-4 ring-1 ring-border/50`}
                  >
                    <Icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center flex flex-col items-center">
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

