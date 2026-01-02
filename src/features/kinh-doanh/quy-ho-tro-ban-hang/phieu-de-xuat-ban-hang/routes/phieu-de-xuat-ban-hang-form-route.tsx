/**
 * Phiếu đề xuất bán hàng Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { PhieuDeXuatBanHangFormView } from "../components/phieu-de-xuat-ban-hang-form-view"
import { phieuDeXuatBanHangConfig } from "../config"

export default function PhieuDeXuatBanHangFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')

  const handleComplete = () => {
    if (returnTo === 'detail' && id) {
      navigate(`${phieuDeXuatBanHangConfig.routePath}/${id}`)
    } else {
      navigate(phieuDeXuatBanHangConfig.routePath)
    }
  }

  const handleCancel = () => {
    if (returnTo === 'detail' && id) {
      navigate(`${phieuDeXuatBanHangConfig.routePath}/${id}`)
    } else {
      navigate(phieuDeXuatBanHangConfig.routePath)
    }
  }

  return (
    <PhieuDeXuatBanHangFormView
      id={id ? Number(id) : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

