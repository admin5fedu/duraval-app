"use client"

import { useParams } from "react-router-dom"
import { DanhSachKBDetailView } from "../components/danh-sach-KB-detail-view"

export default function DanhSachKBDetailRoute() {
  const params = useParams<{ id: string }>()
  const id = parseInt(params.id!, 10)

  if (isNaN(id)) {
    return <div>ID không hợp lệ</div>
  }

  return <DanhSachKBDetailView id={id} />
}

