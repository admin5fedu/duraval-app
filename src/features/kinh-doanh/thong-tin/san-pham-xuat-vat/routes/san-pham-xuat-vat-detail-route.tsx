/**
 * Sản phẩm xuất VAT Detail Route
 * 
 * Route component for detail view (readonly)
 */

"use client"

import { useParams, useNavigate } from "react-router-dom"
import { SanPhamXuatVatDetailView } from "../components/san-pham-xuat-vat-detail-view"
import { sanPhamXuatVatConfig } from "../config"

export default function SanPhamXuatVatDetailRoute() {
  const params = useParams<{ index: string }>()
  const navigate = useNavigate()

  const index = params.index ? parseInt(params.index, 10) : 0

  if (!index || isNaN(index)) {
    navigate(sanPhamXuatVatConfig.routePath)
    return null
  }

  const handleBack = () => {
    navigate(sanPhamXuatVatConfig.routePath)
  }

  return <SanPhamXuatVatDetailView index={index} onBack={handleBack} />
}

