/**
 * Kinh Doanh - Quỹ hỗ trợ bán hàng - Loại phiếu & Hạng mục Module
 * Module có 2 tab: Loại phiếu và Hạng mục
 * 
 * Note: Routes được handle riêng trong routes.tsx
 * File này chỉ dùng cho direct navigation đến module, redirect đến list route
 */

"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function LoaiPhieuHangMucPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to list route
    navigate("/kinh-doanh/loai-phieu", { replace: true })
  }, [navigate])

  return null
}
