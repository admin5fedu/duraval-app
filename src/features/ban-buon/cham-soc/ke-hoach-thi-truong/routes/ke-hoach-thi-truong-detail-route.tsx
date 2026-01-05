"use client"

import { useParams } from "react-router-dom"
import { KeHoachThiTruongDetailView } from "../components/ke-hoach-thi-truong-detail-view"

export default function KeHoachThiTruongDetailRoute() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  
  if (isNaN(id)) {
    return <div>ID không hợp lệ</div>
  }
  
  return <KeHoachThiTruongDetailView id={id} />
}

