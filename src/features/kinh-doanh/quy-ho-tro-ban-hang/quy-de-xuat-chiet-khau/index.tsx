"use client"

/**
 * Kinh Doanh - Quỹ hỗ trợ bán hàng Module
 */

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function QuyDeXuatChietKhauPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Quỹ hỗ trợ bán hàng</h1>
        <p className="text-muted-foreground">
          Quản lý và theo dõi quỹ hỗ trợ bán hàng
        </p>
      </div>

      <Tabs defaultValue="tong-quan" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tong-quan">Tổng quan quỹ</TabsTrigger>
          <TabsTrigger value="theo-thang">Quỹ theo tháng</TabsTrigger>
        </TabsList>

        <TabsContent value="tong-quan" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan quỹ</CardTitle>
              <CardDescription>
                Xem tổng quan về quỹ hỗ trợ bán hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
                <p className="text-lg">Nội dung tổng quan quỹ sẽ được xây dựng tại đây</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theo-thang" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quỹ theo tháng</CardTitle>
              <CardDescription>
                Xem chi tiết quỹ hỗ trợ bán hàng theo từng tháng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
                <p className="text-lg">Nội dung quỹ theo tháng sẽ được xây dựng tại đây</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

