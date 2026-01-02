"use client"

import { useParams, useNavigate } from "react-router-dom"
import { QuanHuyenTSNDetailView } from "../components/quan-huyen-tsn-detail-view"
import { quanHuyenTSNConfig } from "../config"

export default function QuanHuyenTSNDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    navigate(quanHuyenTSNConfig.routePath)
    return null
  }

  const idNumber = parseInt(id, 10)
  if (isNaN(idNumber)) {
    navigate(quanHuyenTSNConfig.routePath)
    return null
  }

  return <QuanHuyenTSNDetailView id={idNumber} />
}

