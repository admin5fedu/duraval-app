"use client"

/**
 * Kinh Doanh - Tổng quan quỹ HTBH Module
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TongQuanQuyHTBHPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tổng quan quỹ HTBH</h1>
        <p className="text-muted-foreground">
          Xem tổng quan về quỹ hỗ trợ bán hàng
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tổng quan quỹ HTBH</CardTitle>
          <CardDescription>
            Xem tổng quan về quỹ hỗ trợ bán hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
            <p className="text-lg">Nội dung tổng quan quỹ HTBH sẽ được xây dựng tại đây</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

