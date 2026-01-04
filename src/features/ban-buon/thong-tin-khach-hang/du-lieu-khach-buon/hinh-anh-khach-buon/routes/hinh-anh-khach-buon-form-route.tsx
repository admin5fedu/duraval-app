"use client"

import { useParams, useSearchParams } from "react-router-dom"
import { HinhAnhKhachBuonFormView } from "../components/hinh-anh-khach-buon-form-view"

export default function HinhAnhKhachBuonFormRoute() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const isNew = searchParams.get("moi") !== null || !id

  if (isNew) {
    return <HinhAnhKhachBuonFormView />
  }

  if (!id) {
    return <div>ID không hợp lệ</div>
  }

  const numericId = parseInt(id, 10)
  if (isNaN(numericId)) {
    return <div>ID không hợp lệ</div>
  }

  return <HinhAnhKhachBuonFormView id={numericId} />
}

