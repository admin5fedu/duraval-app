"use client"

import { useParams } from "react-router-dom"
import { XetDuyetCongNoDetailView } from "../components/xet-duyet-cong-no-detail-view"

export default function XetDuyetCongNoDetailRoute() {
  const { id } = useParams<{ id: string }>()
  
  if (!id) {
    return <div>ID không hợp lệ</div>
  }

  const numericId = parseInt(id, 10)
  if (isNaN(numericId)) {
    return <div>ID không hợp lệ</div>
  }

  return <XetDuyetCongNoDetailView id={numericId} />
}

