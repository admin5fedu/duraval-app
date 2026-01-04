"use client"

import { useParams } from "react-router-dom"
import { NguoiLienHeDetailView } from "../components/nguoi-lien-he-detail-view"

export default function NguoiLienHeDetailRoute() {
  const params = useParams<{ id: string }>()
  const id = parseInt(params.id!, 10)

  if (isNaN(id)) {
    return <div>ID không hợp lệ</div>
  }

  return <NguoiLienHeDetailView id={id} />
}

