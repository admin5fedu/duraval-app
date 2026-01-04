/**
 * Giai Đoạn Khách Buôn Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { GiaiDoanKhachBuonDetailView } from "../components/giai-doan-khach-buon-detail-view"
import { giaiDoanKhachBuonConfig } from "../config"

export default function GiaiDoanKhachBuonDetailRoute() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const id = params.id ? parseInt(params.id, 10) : undefined

  if (!id || isNaN(id)) {
    navigate(giaiDoanKhachBuonConfig.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate(giaiDoanKhachBuonConfig.routePath)
  }

  return (
    <GiaiDoanKhachBuonDetailView
      id={id}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

