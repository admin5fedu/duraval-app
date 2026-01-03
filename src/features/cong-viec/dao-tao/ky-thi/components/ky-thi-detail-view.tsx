"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit, Play, PlayCircle } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { toast } from "sonner"
import { useKyThiById } from "../hooks/use-ky-thi"
import { DeleteKyThiButton } from "./delete-ky-thi-button"
import { kyThiConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { useNhomChuyenDe } from "../../nhom-chuyen-de/hooks"
import { useChuyenDe } from "../../chuyen-de/hooks"
import { useChucVu } from "@/features/he-thong/so-do/chuc-vu/hooks"
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks"
import { useBaiThi } from "../../bai-thi/hooks/use-bai-thi"
import { useCauHoi } from "../../cau-hoi/hooks/use-cau-hoi"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useBaiThiTest } from "../../bai-thi/hooks/use-bai-thi-test"
import { BaiThiStartView } from "../../bai-thi/components/bai-thi-start-view"
import { BaiThiTestView } from "../../bai-thi/components/bai-thi-test-view"
import { BaiThiResultView } from "../../bai-thi/components/bai-thi-result-view"
import { BaiThiSection } from "./bai-thi-section"
import { useMemo } from "react"
import { DetailSectionCard } from "@/shared/components/data-display/detail/detail-section-card"

interface KyThiDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function KyThiDetailView({ id, initialData, onEdit, onBack }: KyThiDetailViewProps) {
  const navigate = useNavigate()
  const query = useKyThiById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  const { data: nhomChuyenDeList } = useNhomChuyenDe()
  const { data: chuyenDeList } = useChuyenDe()
  const { data: chucVuList } = useChucVu()
  const { data: nhanSuList } = useNhanSu()
  const { data: baiThiList } = useBaiThi()
  const { data: cauHoiList } = useCauHoi()
  const { employee } = useAuthStore()
  const testState = useBaiThiTest()
  
  const kyThi = viewState.data

  // Filter bài thi by ky_thi_id
  const baiThiListForKyThi = useMemo(() => {
    if (!baiThiList || !kyThi) return []
    return baiThiList.filter((bt) => bt.ky_thi_id === kyThi.id)
  }, [baiThiList, kyThi])

  // Find all tests for current user
  const myAllTests = useMemo(() => {
    if (!employee?.ma_nhan_vien || !baiThiListForKyThi) return []
    return baiThiListForKyThi.filter(
      (bt) => bt.nhan_vien_id === employee.ma_nhan_vien
    )
  }, [employee, baiThiListForKyThi])

  // Find unfinished test for current user
  const myUnfinishedTest = useMemo(() => {
    if (myAllTests.length === 0) return null
    return myAllTests.find(
      (bt) => bt.trang_thai === "Chưa thi" || bt.trang_thai === "Đang thi"
    )
  }, [myAllTests])

  // Find best test (highest score)
  const myBestTest = useMemo(() => {
    if (myAllTests.length === 0) return null
    return myAllTests.reduce((best, current) => {
      const bestScore = best.diem_so || 0
      const currentScore = current.diem_so || 0
      return currentScore > bestScore ? current : best
    })
  }, [myAllTests])

  // Check if user can retake test
  const canRetake = useMemo(() => {
    // If no tests yet, can take
    if (myAllTests.length === 0) return true
    
    // If has passed test, don't allow retake (can be changed based on requirements)
    const hasPassed = myAllTests.some((bt) => bt.trang_thai === "Đạt")
    // For now: if already passed, don't allow retake
    // This can be changed to allow retake if needed
    return !hasPassed
  }, [myAllTests])

  // Check if user can take test
  const canTakeTest = useMemo(() => {
    if (!kyThi || !employee) return false
    // If chuc_vu_ids is empty/null, everyone can take
    if (!kyThi.chuc_vu_ids || kyThi.chuc_vu_ids.length === 0) {
      return true
    }
    // Check if user's chuc_vu_id is in the list
    return employee.chuc_vu_id
      ? kyThi.chuc_vu_ids.includes(employee.chuc_vu_id)
      : false
  }, [kyThi, employee])

  // Handle start test
  const handleStartTest = async () => {
    if (!kyThi || !cauHoiList) return
    try {
      await testState.startTest(kyThi, cauHoiList)
    } catch (error: any) {
      console.error("Lỗi khi bắt đầu bài thi:", error)
      toast.error(error.message || "Có lỗi xảy ra khi bắt đầu bài thi")
    }
  }

  // Handle continue test
  const handleContinueTest = () => {
    if (!kyThi || !cauHoiList || !myUnfinishedTest) return
    testState.continueTest(myUnfinishedTest, kyThi, cauHoiList)
  }

  // Handle start timer
  const handleStartTimer = async () => {
    try {
      await testState.startTimer()
    } catch (error: any) {
      console.error("Lỗi khi bắt đầu timer:", error)
      toast.error(error.message || "Có lỗi xảy ra khi bắt đầu timer")
    }
  }


  // Create maps for lookup
  const nhomChuyenDeMap = useMemo(() => {
    const map = new Map<number, string>()
    if (nhomChuyenDeList) {
      nhomChuyenDeList.forEach(nhom => {
        if (nhom.id) {
          map.set(nhom.id, nhom.ten_nhom || `ID: ${nhom.id}`)
        }
      })
    }
    return map
  }, [nhomChuyenDeList])

  const chuyenDeMap = useMemo(() => {
    const map = new Map<number, string>()
    if (chuyenDeList) {
      chuyenDeList.forEach(chuyenDe => {
        if (chuyenDe.id) {
          map.set(chuyenDe.id, chuyenDe.ten_chuyen_de || `ID: ${chuyenDe.id}`)
        }
      })
    }
    return map
  }, [chuyenDeList])

  const chucVuMap = useMemo(() => {
    const map = new Map<number, string>()
    if (chucVuList) {
      chucVuList.forEach(chucVu => {
        if (chucVu.id) {
          map.set(chucVu.id, chucVu.ten_chuc_vu || `ID: ${chucVu.id}`)
        }
      })
    }
    return map
  }, [chucVuList])

  // ✅ Hiển thị loading state
  if (viewState.isLoading) {
    return (
      <GenericDetailViewSimple
        title=""
        subtitle=""
        sections={[]}
        isLoading={true}
      />
    )
  }

  // ✅ Hiển thị error state
  if (viewState.isError) {
    return (
      <DetailErrorState
        title="Không tìm thấy kỳ thi"
        message="Kỳ thi với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : kyThiConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!kyThi) {
    return null
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
    } catch {
      return "-"
    }
  }

  const formatDateOnly = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi })
    } catch {
      return "-"
    }
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { label: "Ngày", key: "ngay", value: formatDateOnly(kyThi.ngay) },
        { label: "Tên Kỳ Thi", key: "ten_ky_thi", value: kyThi.ten_ky_thi, colSpan: 2 as const },
        { 
          label: "Trạng Thái", 
          key: "trang_thai", 
          value: (
            <Badge variant={kyThi.trang_thai === "Mở" ? "default" : "secondary"}>
              {kyThi.trang_thai}
            </Badge>
          )
        },
        { label: "Số Câu Hỏi", key: "so_cau_hoi", value: kyThi.so_cau_hoi?.toString() || "-" },
        { label: "Số Phút Làm Bài", key: "so_phut_lam_bai", value: `${kyThi.so_phut_lam_bai || "-"} phút` },
      ]
    },
    {
      title: "Phạm Vi Áp Dụng",
      fields: [
        { 
          label: "Nhóm Chuyên Đề", 
          key: "nhom_chuyen_de_ids", 
          value: kyThi.nhom_chuyen_de_ids && kyThi.nhom_chuyen_de_ids.length > 0 
            ? kyThi.nhom_chuyen_de_ids.map((id: number) => nhomChuyenDeMap.get(id) || `ID: ${id}`).join(", ")
            : "-",
          colSpan: 2 as const
        },
        { 
          label: "Chuyên Đề", 
          key: "chuyen_de_ids", 
          value: kyThi.chuyen_de_ids && kyThi.chuyen_de_ids.length > 0 
            ? kyThi.chuyen_de_ids.map((id: number) => chuyenDeMap.get(id) || `ID: ${id}`).join(", ")
            : "-",
          colSpan: 2 as const
        },
        { 
          label: "Chức Vụ", 
          key: "chuc_vu_ids", 
          value: kyThi.chuc_vu_ids && kyThi.chuc_vu_ids.length > 0 
            ? kyThi.chuc_vu_ids.map((id: number) => chucVuMap.get(id) || `ID: ${id}`).join(", ")
            : "-",
          colSpan: 2 as const
        },
      ]
    },
    ...(kyThi.ghi_chu ? [{
      title: "Ghi Chú",
      fields: [
        { label: "Ghi Chú", key: "ghi_chu", value: kyThi.ghi_chu, colSpan: 2 as const },
      ]
    }] : []),
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { 
          label: "Người Tạo", 
          key: "nguoi_tao_id", 
          value: (() => {
            if (!kyThi.nguoi_tao_id) return "-"
            const nguoiTao = nhanSuList?.find((ns) => ns.ma_nhan_vien === kyThi.nguoi_tao_id)
            return nguoiTao 
              ? `${nguoiTao.ma_nhan_vien} - ${nguoiTao.ho_ten}`
              : kyThi.nguoi_tao_id.toString()
          })()
        },
        { label: "Thời Gian Tạo", key: "tg_tao", value: formatDate(kyThi.tg_tao) },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDate(kyThi.tg_cap_nhat) },
      ]
    },
  ]

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      navigate(`${kyThiConfig.routePath}/${id}/sua?returnTo=detail`)
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(kyThiConfig.routePath)
    }
  }

  const title = kyThi.ten_ky_thi || `Kỳ thi #${id}`
  const subtitle = formatDateOnly(kyThi.ngay) || `ID: ${id}`

  // Render test views
  if (testState.view === "start" && testState.currentTest && testState.selectedKyThi) {
    return (
      <BaiThiStartView
        testState={testState}
        onStart={handleStartTimer}
        onBack={testState.resetState}
      />
    )
  }

  if (testState.view === "test" && testState.currentTest) {
    return <BaiThiTestView testState={testState} />
  }

  if (testState.view === "result" && testState.finalResult) {
    return <BaiThiResultView testState={testState} />
  }

  // Render detail view
  return (
    <>
      <GenericDetailViewSimple
        title={title}
        subtitle={subtitle}
        sections={sections}
        backUrl={onBack ? undefined : kyThiConfig.routePath}
        onBack={handleBack}
        actions={
          <>
            {canTakeTest && kyThi.trang_thai === "Mở" && (
              <>
                {myUnfinishedTest ? (
                  <Button
                    variant="default"
                    size="sm"
                    className={actionButtonClass()}
                    onClick={handleContinueTest}
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Tiếp tục làm bài
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className={actionButtonClass()}
                    onClick={handleStartTest}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Tham gia thi
                  </Button>
                )}
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              className={actionButtonClass()}
              onClick={handleEdit}
            >
              <Edit className="mr-2 h-4 w-4" />
              Sửa
            </Button>
            <DeleteKyThiButton 
              id={id} 
              name={kyThi.ten_ky_thi?.substring(0, 50) || ""} 
            />
          </>
        }
        isLoading={query.isLoading && !initialData}
      />
      
      {/* Trạng thái thi của tôi - Thêm vào sections */}
      {employee && (
        <DetailSectionCard
          section={{
            title: "Trạng thái thi của tôi",
            icon: PlayCircle,
            fields: myAllTests.length === 0
              ? [
                  {
                    label: "Trạng thái",
                    key: "trang_thai",
                    value: "Chưa tham gia thi",
                    colSpan: 2 as const,
                  },
                ]
              : [
                  myBestTest
                    ? {
                        label: "Kết quả tốt nhất",
                        key: "ket_qua_tot_nhat",
                        value: `${myBestTest.diem_so}/${myBestTest.tong_so_cau}`,
                        format: () => (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">
                              {myBestTest.diem_so}/{myBestTest.tong_so_cau}
                            </span>
                            <Badge
                              variant={
                                myBestTest.trang_thai === "Đạt"
                                  ? "default"
                                  : myBestTest.trang_thai === "Không đạt"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {myBestTest.trang_thai}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              ({formatDateOnly(myBestTest.ngay_lam_bai)})
                            </span>
                          </div>
                        ),
                        colSpan: 2 as const,
                      }
                    : null,
                  {
                    label: "Tổng lượt thi",
                    key: "tong_luot_thi",
                    value: myAllTests.length,
                  },
                  {
                    label: "Đã đạt",
                    key: "da_dat",
                    value: myAllTests.filter((bt) => bt.trang_thai === "Đạt").length,
                    format: (val: any) => (
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {val}
                      </span>
                    ),
                  },
                  {
                    label: "Chưa đạt",
                    key: "chua_dat",
                    value: myAllTests.filter((bt) => bt.trang_thai === "Không đạt").length,
                    format: (val: any) => (
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {val}
                      </span>
                    ),
                  },
                ].filter((f): f is NonNullable<typeof f> => f !== null),
            actions: (
              <div className="flex items-center gap-2">
                {myUnfinishedTest ? (
                  <Button onClick={handleContinueTest} size="sm">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Tiếp tục làm bài
                  </Button>
                ) : canRetake && canTakeTest && kyThi.trang_thai === "Mở" ? (
                  <Button onClick={handleStartTest} size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    {myAllTests.length > 0 ? "Thi lại" : "Bắt đầu thi"}
                  </Button>
                ) : null}
              </div>
            ),
          }}
        />
      )}

      {/* Danh sách bài thi - Sử dụng DetailSectionCard wrapper */}
      <BaiThiSection
        kyThiId={id}
        baiThiList={baiThiListForKyThi}
        nhanSuList={nhanSuList}
        currentEmployeeId={employee?.ma_nhan_vien}
      />
    </>
  )
}

