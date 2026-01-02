"use client"

/**
 * Kinh Doanh - Quỹ HTBH theo tháng Module
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function QuyHTBHTheoThangPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Quỹ HTBH theo tháng</h1>
        <p className="text-muted-foreground">
          Xem chi tiết quỹ hỗ trợ bán hàng theo từng tháng
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quỹ HTBH theo tháng</CardTitle>
          <CardDescription>
            Xem chi tiết quỹ hỗ trợ bán hàng theo từng tháng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
            <p className="text-lg">Nội dung quỹ HTBH theo tháng sẽ được xây dựng tại đây</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

