/**
 * Các chuyên đề - Main Route
 * Redirect to first tab (Nhóm chuyên đề)
 */

"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function CacChuyenDePage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to first tab
    navigate("/cong-viec/nhom-chuyen-de", { replace: true })
  }, [navigate])

  return null
}

