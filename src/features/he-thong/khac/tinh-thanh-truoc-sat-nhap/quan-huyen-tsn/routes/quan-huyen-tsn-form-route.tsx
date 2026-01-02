"use client"

import { useParams, useNavigate } from "react-router-dom"
import { QuanHuyenTSNFormView } from "../components/quan-huyen-tsn-form-view"
import { quanHuyenTSNConfig } from "../config"

export default function QuanHuyenTSNFormRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const idNumber = id ? parseInt(id, 10) : undefined
  if (id && isNaN(idNumber!)) {
    navigate(quanHuyenTSNConfig.routePath)
    return null
  }

  return <QuanHuyenTSNFormView id={idNumber} />
}

