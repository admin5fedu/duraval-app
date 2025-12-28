"use client"

import { ViecHangNgayWidget } from "./viec-hang-ngay-widget"
import { PlaceholderWidget } from "./placeholder-widget"
import { TrendingUp, BarChart3 } from "lucide-react"

export function KeHoach168Dashboard() {
    return (
        <div className="h-[calc(100vh-4rem)] overflow-hidden">
            <div className="container mx-auto h-full py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    {/* Widget Việc hàng ngày */}
                    <ViecHangNgayWidget />

                    {/* Widget Việc phát sinh - Placeholder */}
                    <PlaceholderWidget
                        title="Việc phát sinh"
                        icon={TrendingUp}
                        description="Đang phát triển"
                    />

                    {/* Widget Báo cáo KPI - Placeholder */}
                    <PlaceholderWidget
                        title="Báo cáo KPI"
                        icon={BarChart3}
                        description="Đang phát triển"
                    />
                </div>
            </div>
        </div>
    )
}

