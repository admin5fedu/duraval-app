"use client"

import { useParams, useNavigate } from "react-router-dom"
import { PhuongXaTSNFormView } from "../components/phuong-xa-tsn-form-view"
import { phuongXaTSNConfig } from "../config"

export default function PhuongXaTSNFormRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const idNumber = id ? parseInt(id, 10) : undefined
  if (id && isNaN(idNumber!)) {
    navigate(phuongXaTSNConfig.routePath)
    return null
  }

  return <PhuongXaTSNFormView id={idNumber} />
}

