"use client"

import { useParams } from "react-router-dom"
import { XetDuyetKhachBuonDetailView } from "../components/xet-duyet-khach-buon-detail-view"

export default function XetDuyetKhachBuonDetailRoute() {
  const params = useParams()
  const id = Number(params.id!)
  
  return <XetDuyetKhachBuonDetailView id={id} />
}

