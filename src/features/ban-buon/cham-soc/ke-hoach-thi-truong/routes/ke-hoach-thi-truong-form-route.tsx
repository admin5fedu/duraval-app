"use client"

import { useParams } from "react-router-dom"
import { KeHoachThiTruongFormView } from "../components/ke-hoach-thi-truong-form-view"

export default function KeHoachThiTruongFormRoute() {
  const params = useParams<{ id?: string }>()
  const id = params.id === "moi" ? undefined : (params.id ? Number(params.id) : undefined)
  
  return <KeHoachThiTruongFormView id={id} />
}

