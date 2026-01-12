"use client"

import { useParams } from "react-router-dom"
import { XetDuyetKhachBuonFormView } from "../components/xet-duyet-khach-buon-form-view"

export default function XetDuyetKhachBuonFormRoute() {
  const params = useParams()
  const id = params.id && params.id !== "moi" ? Number(params.id) : undefined
  
  return <XetDuyetKhachBuonFormView id={id} />
}

