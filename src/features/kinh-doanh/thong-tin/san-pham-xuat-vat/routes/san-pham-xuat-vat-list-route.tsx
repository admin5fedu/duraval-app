/**
 * Sản phẩm xuất VAT List Route
 * 
 * Route component for list view (readonly)
 */

"use client"

import { useNavigate } from "react-router-dom"
import { SanPhamXuatVatListView } from "../components/san-pham-xuat-vat-list-view"
import { sanPhamXuatVatConfig } from "../config"

export default function SanPhamXuatVatListRoute() {
  const navigate = useNavigate()

  const handleView = (index: number) => {
    navigate(`${sanPhamXuatVatConfig.routePath}/${index}`)
  }

  return <SanPhamXuatVatListView onView={handleView} />
}

