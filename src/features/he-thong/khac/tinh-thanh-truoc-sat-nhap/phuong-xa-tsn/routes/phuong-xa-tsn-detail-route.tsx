"use client"

import { useParams, useNavigate } from "react-router-dom"
import { PhuongXaTSNDetailView } from "../components/phuong-xa-tsn-detail-view"
import { phuongXaTSNConfig } from "../config"

export default function PhuongXaTSNDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    navigate(phuongXaTSNConfig.routePath)
    return null
  }

  const idNumber = parseInt(id, 10)
  if (isNaN(idNumber)) {
    navigate(phuongXaTSNConfig.routePath)
    return null
  }

  return <PhuongXaTSNDetailView id={idNumber} />
}

