import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Tổng quan hệ thống quản lý doanh nghiệp
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Tổng doanh thu</h3>
            <p className="text-2xl font-bold mt-2">0 VNĐ</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Đơn hàng</h3>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Khách hàng</h3>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Sản phẩm</h3>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>
        </div>
      </div>
    </Suspense>
  )
}

