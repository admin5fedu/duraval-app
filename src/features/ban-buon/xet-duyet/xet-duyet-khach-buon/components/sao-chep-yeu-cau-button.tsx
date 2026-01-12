"use client"

import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { XetDuyetKhachBuon } from "../schema"
import { xetDuyetKhachBuonConfig } from "../config"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"

interface SaoChepYeuCauButtonProps {
  xetDuyetKhachBuon: XetDuyetKhachBuon
}

export function SaoChepYeuCauButton({ xetDuyetKhachBuon }: SaoChepYeuCauButtonProps) {
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSaoChep = () => {
    try {
      // Tạo URL với state để pre-fill form
      const state = {
        khach_buon_id: xetDuyetKhachBuon.khach_buon_id,
        ngay: xetDuyetKhachBuon.ngay,
        muc_dang_ky_id: xetDuyetKhachBuon.muc_dang_ky_id,
        tsn_tinh_thanh_id: xetDuyetKhachBuon.tsn_tinh_thanh_id,
        ssn_tinh_thanh_id: xetDuyetKhachBuon.ssn_tinh_thanh_id,
        doanh_so_min_quy: xetDuyetKhachBuon.doanh_so_min_quy,
        doanh_so_max_quy: xetDuyetKhachBuon.doanh_so_max_quy,
        doanh_so_min_nam: xetDuyetKhachBuon.doanh_so_min_nam,
        doanh_so_max_nam: xetDuyetKhachBuon.doanh_so_max_nam,
        ngay_ap_dung: xetDuyetKhachBuon.ngay_ap_dung,
        link_hop_dong: xetDuyetKhachBuon.link_hop_dong,
        file_hop_dong: xetDuyetKhachBuon.file_hop_dong,
        ghi_chu: xetDuyetKhachBuon.ghi_chu,
        // Không copy: quan_ly_duyet, bgd_duyet, trang_thai, audit_log, trao_doi
      }

      // Navigate đến form tạo mới với state
      navigate(`${xetDuyetKhachBuonConfig.routePath}/moi`, {
        state: { copiedData: state }
      })

      toast({
        title: "Thành công",
        description: "Đã sao chép dữ liệu, vui lòng kiểm tra và điều chỉnh trước khi lưu",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể sao chép yêu cầu",
        variant: "error",
      })
    }
  }

  // Chỉ hiển thị khi đã hủy
  const canSaoChep = xetDuyetKhachBuon.trang_thai === "Đã hủy"

  if (!canSaoChep) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={actionButtonClass()}
      onClick={handleSaoChep}
    >
      <Copy className="mr-2 h-4 w-4" />
      Sao Chép Yêu Cầu
    </Button>
  )
}

