"use client"

import { useParams } from "react-router-dom"
import { ChamSocKhachBuonFormView } from "../components/cham-soc-khach-buon-form-view"

export default function ChamSocKhachBuonFormRoute() {
  const params = useParams<{ id?: string }>()
  const id = params.id === "moi" ? undefined : (params.id ? Number(params.id) : undefined)
  
  return <ChamSocKhachBuonFormView id={id} />
}

