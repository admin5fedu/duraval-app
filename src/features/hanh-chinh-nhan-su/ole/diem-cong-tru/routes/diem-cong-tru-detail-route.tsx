/**
 * Điểm Cộng Trừ Detail Route
 */

"use client"

import { useParams } from "react-router-dom"

export default function DiemCongTruDetailRoute() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chi tiết Điểm Cộng Trừ #{id}</h1>
      <p className="text-muted-foreground">Module đang được phát triển...</p>
    </div>
  )
}

