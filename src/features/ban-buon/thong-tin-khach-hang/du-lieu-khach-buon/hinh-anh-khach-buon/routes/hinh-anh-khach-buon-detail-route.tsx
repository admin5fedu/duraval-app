"use client"

import { useParams } from "react-router-dom"
import { HinhAnhKhachBuonDetailView } from "../components/hinh-anh-khach-buon-detail-view"

export default function HinhAnhKhachBuonDetailRoute() {
  const { id } = useParams<{ id: string }>()
  
  if (!id) {
    return <div>ID không hợp lệ</div>
  }

  const numericId = parseInt(id, 10)
  if (isNaN(numericId)) {
    return <div>ID không hợp lệ</div>
  }

  return <HinhAnhKhachBuonDetailView id={numericId} />
}

