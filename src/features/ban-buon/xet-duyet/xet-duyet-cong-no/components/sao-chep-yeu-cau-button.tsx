"use client"

import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { XetDuyetCongNo } from "../schema"
import { xetDuyetCongNoConfig } from "../config"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"

interface SaoChepYeuCauButtonProps {
  xetDuyetCongNo: XetDuyetCongNo
}

export function SaoChepYeuCauButton({ xetDuyetCongNo }: SaoChepYeuCauButtonProps) {
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSaoChep = () => {
    try {
      // Tạo URL với state để pre-fill form
      const state = {
        khach_buon_id: xetDuyetCongNo.khach_buon_id,
        loai_hinh: xetDuyetCongNo.loai_hinh,
        muc_cong_no: xetDuyetCongNo.muc_cong_no,
        de_xuat_ngay_ap_dung: xetDuyetCongNo.de_xuat_ngay_ap_dung,
        ghi_chu: xetDuyetCongNo.ghi_chu,
        // Không copy: quan_ly_duyet, bgd_duyet, trang_thai, audit_log, trao_doi
      }

      // Navigate đến form tạo mới với state
      navigate(`${xetDuyetCongNoConfig.routePath}/moi`, {
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
  const canSaoChep = xetDuyetCongNo.trang_thai === "Đã hủy"

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

