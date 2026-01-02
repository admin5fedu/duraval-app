/**
 * Phường xã SNN Form Route
 * 
 * Route component for create/edit form view
 */

"use client"

import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { PhuongXaSNNFormView } from "../components/phuong-xa-snn-form-view"
import { phuongXaSNNConfig } from "../config"

export default function PhuongXaSNNFormRoute() {
  const params = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = params.id === "moi" ? undefined : (params.id ? parseInt(params.id, 10) : undefined)

  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')

  const handleComplete = () => {
    if (returnTo === 'list') {
      navigate(phuongXaSNNConfig.routePath)
    } else if (id) {
      navigate(`${phuongXaSNNConfig.routePath}/${id}`)
    } else {
      navigate(phuongXaSNNConfig.routePath)
    }
  }

  const handleCancel = () => {
    if (returnTo === 'list') {
      navigate(phuongXaSNNConfig.routePath)
    } else if (id) {
      navigate(`${phuongXaSNNConfig.routePath}/${id}`)
    } else {
      navigate(phuongXaSNNConfig.routePath)
    }
  }

  return (
    <PhuongXaSNNFormView
      id={id}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

