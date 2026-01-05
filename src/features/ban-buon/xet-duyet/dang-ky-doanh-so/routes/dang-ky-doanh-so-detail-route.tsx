"use client"

import { useParams } from "react-router-dom"
import { DangKyDoanhSoDetailView } from "../components/dang-ky-doanh-so-detail-view"

export default function DangKyDoanhSoDetailRoute() {
  const { id } = useParams<{ id: string }>()
  
  if (!id) {
    return <div>ID không hợp lệ</div>
  }

  const numericId = parseInt(id, 10)
  if (isNaN(numericId)) {
    return <div>ID không hợp lệ</div>
  }

  return <DangKyDoanhSoDetailView id={numericId} />
}

