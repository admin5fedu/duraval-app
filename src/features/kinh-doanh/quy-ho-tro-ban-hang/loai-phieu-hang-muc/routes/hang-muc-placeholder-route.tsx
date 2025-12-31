/**
 * Hạng Mục Placeholder Route
 * 
 * Placeholder route cho tab Hạng mục
 */

"use client"

import { LoaiPhieuHangMucTabs } from "../components/loai-phieu-hang-muc-tabs"

export default function HangMucPlaceholderRoute() {
  return (
    <div className="flex flex-col h-full">
      <LoaiPhieuHangMucTabs />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Hạng mục</h2>
          <p className="text-muted-foreground">Tab Hạng mục đang được phát triển...</p>
        </div>
      </div>
    </div>
  )
}

