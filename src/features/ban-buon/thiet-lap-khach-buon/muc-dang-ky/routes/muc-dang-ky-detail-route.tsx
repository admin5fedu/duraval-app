"use client"

import { useParams } from "react-router-dom"
import { MucDangKyDetailView } from "../components"

export default function MucDangKyDetailRoute() {
  const params = useParams<{ id: string }>()
  const id = parseInt(params.id!, 10)

  if (isNaN(id)) {
    return <div>ID không hợp lệ</div>
  }

  return <MucDangKyDetailView id={id} />
}

