/**
 * Bài thi Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams } from "react-router-dom"
import { BaiThiDetailView } from "../components/bai-thi-detail-view"

export default function BaiThiDetailRoute() {
  const { id } = useParams<{ id: string }>()
  
  if (!id) {
    return <div>ID không hợp lệ</div>
  }

  const baiThiId = parseInt(id, 10)
  
  if (isNaN(baiThiId)) {
    return <div>ID không hợp lệ</div>
  }

  return <BaiThiDetailView id={baiThiId} />
}

