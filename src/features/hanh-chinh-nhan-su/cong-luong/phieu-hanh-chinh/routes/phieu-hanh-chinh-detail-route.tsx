/**
 * Phiếu Hành Chính Detail Route
 */

"use client"

import { useParams } from "react-router-dom"

export default function PhieuHanhChinhDetailRoute() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chi tiết Phiếu Hành Chính #{id}</h1>
      <p className="text-muted-foreground">Module đang được phát triển...</p>
    </div>
  )
}

