"use client"

import { useParams } from "react-router-dom"
import { ChamSocKhachBuonDetailView } from "../components/cham-soc-khach-buon-detail-view"

export default function ChamSocKhachBuonDetailRoute() {
  const { id } = useParams<{ id: string }>()
  
  if (!id) {
    return <div>ID không hợp lệ</div>
  }

  const numericId = parseInt(id, 10)
  if (isNaN(numericId)) {
    return <div>ID không hợp lệ</div>
  }

  return <ChamSocKhachBuonDetailView id={numericId} />
}

