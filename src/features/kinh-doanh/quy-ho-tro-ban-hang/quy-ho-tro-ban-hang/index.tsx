"use client"

/**
 * Kinh Doanh - Quỹ hỗ trợ bán hàng Module
 * Layout tham khảo từ module Loại phiếu & Hạng mục
 */

import { QuyHoTroBanHangTabs } from "./components/quy-ho-tro-ban-hang-tabs"
import { TongQuanQuyHTBHTable } from "../tong-quan-quy-htbh/components/tong-quan-quy-htbh-table"

export default function QuyHoTroBanHangPage() {
  return (
    <div className="flex flex-col h-full">
      <QuyHoTroBanHangTabs />
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto py-6">
          <TongQuanQuyHTBHTable />
        </div>
      </div>
    </div>
  )
}

