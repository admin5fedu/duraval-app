"use client"

import { useParams } from "react-router-dom"
import { DangKyDoanhSoFormView } from "../components/dang-ky-doanh-so-form-view"

export default function DangKyDoanhSoFormRoute() {
  const params = useParams<{ id?: string }>()
  const id = params.id === "moi" ? undefined : (params.id ? Number(params.id) : undefined)
  
  return <DangKyDoanhSoFormView id={id} />
}

