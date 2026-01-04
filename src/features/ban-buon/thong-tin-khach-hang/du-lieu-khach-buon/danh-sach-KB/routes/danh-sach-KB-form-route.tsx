"use client"

import { useParams } from "react-router-dom"
import { DanhSachKBFormView } from "../components/danh-sach-KB-form-view"

export default function DanhSachKBFormRoute() {
  const params = useParams<{ id?: string }>()
  
  // Determine if this is edit mode
  const id = params.id && params.id !== "moi" ? parseInt(params.id, 10) : undefined
  
  // If id is invalid, treat as new
  const validId = id && !isNaN(id) ? id : undefined

  return <DanhSachKBFormView id={validId} />
}

