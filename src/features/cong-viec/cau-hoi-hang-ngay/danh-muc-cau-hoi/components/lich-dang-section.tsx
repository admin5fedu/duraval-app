/**
 * Lịch Đăng Section Component
 * 
 * Component hiển thị danh sách lịch đăng trong detail view danh mục câu hỏi.
 * Sử dụng EmbeddedListSection với pattern chuẩn ERP (popup dialogs).
 * 
 * Flow:
 * - Click dòng -> Mở popup detail (GenericDetailDialog)
 * - Click icon mắt -> Confirm dialog -> Redirect đến page detail module lịch đăng
 * - Click icon sửa -> Mở popup form (GenericFormDialog)
 * - Click icon xóa -> Mở popup xác nhận xóa (GenericDeleteDialog)
 * - Click "Thêm Lịch Đăng" -> Mở popup form (GenericFormDialog)
 */

"use client"

import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { EmbeddedListSection, type EmbeddedListColumn } from "@/shared/components/data-display/embedded-list-section"
import { EmbeddedListFullViewDialog } from "@/shared/components/data-display/embedded-list-full-view-dialog"
import { GenericDetailDialog } from "@/shared/components/dialogs/generic-detail-dialog"
import { GenericFormDialog } from "@/shared/components/dialogs/generic-form-dialog"
import { GenericDeleteDialog } from "@/shared/components/dialogs/generic-delete-dialog"
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog"
import { LichDang, lichDangSchema } from "../../lich-dang/schema"
import type { DetailSection } from "@/shared/components"
import type { FormSection } from "@/shared/components/forms/generic-form-view"
import { useCreateLichDang, useUpdateLichDang, useDeleteLichDang } from "../../lich-dang/hooks"
import { useLichDangByNhomCauHoiId } from "../../lich-dang/hooks/use-lich-dang"
import { useLichDangById } from "../../lich-dang/hooks"
import { useDanhMucCauHoi } from "../hooks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Maximize2 } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { lichDangConfig } from "../../lich-dang/config"
import { sectionTitleClass } from "@/shared/utils/section-styles"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { z } from "zod"
import { LichDangAPI } from "../../lich-dang/services/lich-dang.api"
import { useReferenceQuery } from "@/lib/react-query/hooks"
import { lichDangQueryKeys } from "@/lib/react-query/query-keys"
import { DapAnDungSelector } from "../../lich-dang/components/dap-an-dung-selector"
import { CloudinaryImageUpload } from "../../lich-dang/components/cloudinary-image-upload"
import { ChucVuMultiSelect } from "@/components/ui/chuc-vu-multi-select"
import { useFormContext } from "react-hook-form"
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

const VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY = "lich-dang-view-detail-skip-confirm"

interface LichDangSectionProps {
    danhMucCauHoiId: number
}

export function LichDangSection({ danhMucCauHoiId }: LichDangSectionProps) {
    const { data: lichDangList, isLoading } = useLichDangByNhomCauHoiId(danhMucCauHoiId)
    const { data: danhMucCauHoiList } = useDanhMucCauHoi()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [formDialogOpen, setFormDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
    const [selectedLichDang, setSelectedLichDang] = useState<LichDang | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [lichDangToView, setLichDangToView] = useState<LichDang | null>(null)
    const [expandDialogOpen, setExpandDialogOpen] = useState(false)

    const createMutation = useCreateLichDang()
    const updateMutation = useUpdateLichDang()
    const deleteMutation = useDeleteLichDang()

    // Function để refetch query useLichDangByNhomCauHoiId
    const refetchLichDangList = () => {
        queryClient.refetchQueries({
            queryKey: [...lichDangQueryKeys.list(), "by-nhom-cau-hoi", danhMucCauHoiId],
        })
    }

    // Query for selected lich dang detail
    const lichDangQuery = useLichDangById(selectedLichDang?.id || 0, selectedLichDang || undefined)
    const viewState = useDetailViewStateFromQuery(lichDangQuery, selectedLichDang || undefined)

    // Fetch danh sách chức vụ để map ID -> tên
    const { data: danhSachChucVu = [] } = useReferenceQuery({
        queryKey: ['chuc-vu-list'],
        queryFn: LichDangAPI.getDanhSachChucVu,
    })

    // Tạo map từ ID -> tên chức vụ
    const chucVuMap = useMemo(() => {
        const map = new Map<number, string>()
        danhSachChucVu.forEach((cv: any) => {
            if (cv.id && cv.ten_chuc_vu) {
                map.set(cv.id, cv.ten_chuc_vu)
            }
        })
        return map
    }, [danhSachChucVu])


    // Click dòng -> Mở popup detail
    const handleRowClick = (lichDang: LichDang) => {
        setSelectedLichDang(lichDang)
        setDetailDialogOpen(true)
    }

    // Click icon mắt -> Confirm dialog -> Redirect đến page detail
    const handleEyeClick = (lichDang: LichDang) => {
        if (!lichDang.id) return

        const skipConfirm =
            typeof window !== "undefined" &&
            window.localStorage.getItem(VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY) === "true"

        if (skipConfirm) {
            navigate(`${lichDangConfig.routePath}/${lichDang.id}`)
            return
        }

        setLichDangToView(lichDang)
        setViewConfirmOpen(true)
    }

    const handleAdd = () => {
        setSelectedLichDang(null)
        setIsEditMode(false)
        setFormDialogOpen(true)
    }

    const handleEdit = (lichDang: LichDang) => {
        setSelectedLichDang(lichDang)
        setIsEditMode(true)
        setFormDialogOpen(true)
    }

    const handleDelete = (lichDang: LichDang) => {
        setSelectedLichDang(lichDang)
        setDeleteDialogOpen(true)
    }

    const handleFormSubmit = async (data: any) => {
        const sanitizedData = {
            ...data,
            cau_hoi: data.cau_hoi?.trim() || "",
            dap_an_1: data.dap_an_1?.trim() || "",
            dap_an_2: data.dap_an_2?.trim() || "",
            dap_an_3: data.dap_an_3?.trim() || "",
            dap_an_4: data.dap_an_4?.trim() || "",
            hinh_anh: data.hinh_anh && data.hinh_anh.trim() !== "" ? data.hinh_anh.trim() : null,
        }

        if (isEditMode && selectedLichDang) {
            const { id: _id, tg_tao: _tg_tao, tg_cap_nhat: _tg_cap_nhat, nguoi_tao_id: _nguoi_tao_id, nhom_cau_hoi_ten: _nhom_cau_hoi_ten, nguoi_tao_ten: _nguoi_tao_ten, ...submitData } = sanitizedData
            void _id
            void _tg_tao
            void _tg_cap_nhat
            void _nguoi_tao_id
            void _nhom_cau_hoi_ten
            void _nguoi_tao_ten
            
            // Convert nhom_cau_hoi to number if it's a string
            const nhomCauHoiNum = typeof submitData.nhom_cau_hoi === 'string' 
                ? parseInt(submitData.nhom_cau_hoi, 10) 
                : submitData.nhom_cau_hoi
            
            // Convert dap_an_dung to number if it's a string
            const dapAnDung = typeof submitData.dap_an_dung === 'string' 
                ? parseInt(submitData.dap_an_dung, 10) 
                : submitData.dap_an_dung
            
            await updateMutation.mutateAsync({
                id: selectedLichDang.id!,
                input: {
                    ...submitData,
                    nhom_cau_hoi: nhomCauHoiNum,
                    dap_an_dung: dapAnDung,
                }
            })
            // Refetch query để hiển thị ngay dòng mới
            refetchLichDangList()
        } else {
            const { id: _id, tg_tao: _tg_tao, tg_cap_nhat: _tg_cap_nhat, nguoi_tao_id: _nguoi_tao_id, nhom_cau_hoi_ten: _nhom_cau_hoi_ten, nguoi_tao_ten: _nguoi_tao_ten, ...submitData } = sanitizedData
            void _id
            void _tg_tao
            void _tg_cap_nhat
            void _nhom_cau_hoi_ten
            void _nguoi_tao_ten
            
            // Convert nhom_cau_hoi to number if it's a string
            const nhomCauHoiNum = typeof submitData.nhom_cau_hoi === 'string' 
                ? parseInt(submitData.nhom_cau_hoi, 10) 
                : submitData.nhom_cau_hoi || danhMucCauHoiId
            
            // Convert dap_an_dung to number if it's a string
            const dapAnDung = typeof submitData.dap_an_dung === 'string' 
                ? parseInt(submitData.dap_an_dung, 10) 
                : submitData.dap_an_dung || 1
            
            // Get nguoi_tao_id from auth store
            const { useAuthStore } = await import("@/shared/stores/auth-store")
            const authStore = useAuthStore.getState()
            const nguoiTaoId = authStore.employee?.ma_nhan_vien || null
            
            await createMutation.mutateAsync({
                ...submitData,
                nhom_cau_hoi: nhomCauHoiNum,
                dap_an_dung: dapAnDung,
                nguoi_tao_id: nguoiTaoId,
            })
            // Refetch query để hiển thị ngay dòng mới
            refetchLichDangList()
        }
    }

    const handleDeleteConfirm = async () => {
        if (!selectedLichDang?.id) return
        await deleteMutation.mutateAsync(selectedLichDang.id)
        // Refetch query để hiển thị ngay sau khi xóa
        refetchLichDangList()
    }

    const getDetailSections = (lichDang: LichDang): DetailSection[] => {
        const formatDateTime = (dateStr: string | null | undefined) => {
            if (!dateStr) return "-"
            try {
                return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
                return dateStr
            }
        }

        const formatDate = (dateStr: string | null | undefined) => {
            if (!dateStr) return "-"
            try {
                return format(new Date(dateStr), "dd/MM/yyyy", { locale: vi })
            } catch {
                return dateStr
            }
        }

        const chucVuApDung = lichDang.chuc_vu_ap_dung
        const chucVuNames = chucVuApDung && Array.isArray(chucVuApDung) && chucVuApDung.length > 0
            ? chucVuApDung.map(id => chucVuMap.get(id) || `ID: ${id}`)
            : ["Tất cả"]

        return [
            {
                title: "Thông Tin Cơ Bản",
                fields: [
                    { label: "ID", key: "id", value: lichDang.id, type: "number" },
                    { label: "Nhóm Câu Hỏi", key: "nhom_cau_hoi_ten", value: lichDang.nhom_cau_hoi_ten || "-" },
                    { label: "Ngày Đăng", key: "ngay_dang", value: formatDate(lichDang.ngay_dang), type: "date" },
                    { label: "Giờ Đăng", key: "gio_dang", value: lichDang.gio_dang || "-" },
                    { label: "Câu Hỏi", key: "cau_hoi", value: lichDang.cau_hoi, colSpan: 2 },
                ]
            },
            ...(lichDang.hinh_anh ? [{
                title: "Hình Ảnh",
                fields: [
                    { 
                        label: "Hình Ảnh", 
                        key: "hinh_anh", 
                        value: lichDang.hinh_anh,
                        type: "image" as const,
                        colSpan: 2 as const,
                    },
                ]
            }] : []),
            {
                title: "Đáp Án",
                fields: [
                    { 
                        label: "Đáp Án 1", 
                        key: "dap_an_1", 
                        value: lichDang.dap_an_1 || "",
                        format: (val: any) => (
                            <div className="flex items-center gap-2">
                                <span>{val}</span>
                                {lichDang.dap_an_dung === 1 && (
                                    <Badge variant="default" className="bg-green-600">Đúng</Badge>
                                )}
                            </div>
                        ),
                    },
                    { 
                        label: "Đáp Án 2", 
                        key: "dap_an_2", 
                        value: lichDang.dap_an_2 || "",
                        format: (val: any) => (
                            <div className="flex items-center gap-2">
                                <span>{val}</span>
                                {lichDang.dap_an_dung === 2 && (
                                    <Badge variant="default" className="bg-green-600">Đúng</Badge>
                                )}
                            </div>
                        ),
                    },
                    { 
                        label: "Đáp Án 3", 
                        key: "dap_an_3", 
                        value: lichDang.dap_an_3 || "",
                        format: (val: any) => (
                            <div className="flex items-center gap-2">
                                <span>{val}</span>
                                {lichDang.dap_an_dung === 3 && (
                                    <Badge variant="default" className="bg-green-600">Đúng</Badge>
                                )}
                            </div>
                        ),
                    },
                    { 
                        label: "Đáp Án 4", 
                        key: "dap_an_4", 
                        value: lichDang.dap_an_4 || "",
                        format: (val: any) => (
                            <div className="flex items-center gap-2">
                                <span>{val}</span>
                                {lichDang.dap_an_dung === 4 && (
                                    <Badge variant="default" className="bg-green-600">Đúng</Badge>
                                )}
                            </div>
                        ),
                    },
                ]
            },
            {
                title: "Chức Vụ Áp Dụng",
                fields: [
                    { 
                        label: "Chức Vụ", 
                        key: "chuc_vu_ap_dung", 
                        value: chucVuNames.join(", ") || "-",
                        format: () => (
                            <div className="flex flex-wrap gap-1">
                                {chucVuNames.map((name, index) => (
                                    <Badge key={index} variant="secondary">
                                        {name}
                                    </Badge>
                                ))}
                            </div>
                        ),
                        colSpan: 2 as const,
                    },
                ]
            },
            {
                title: "Thông Tin Hệ Thống",
                fields: [
                    { label: "Người Tạo ID", key: "nguoi_tao_id", value: lichDang.nguoi_tao_id?.toString() || "-" },
                    { label: "Người Tạo", key: "nguoi_tao_ten", value: lichDang.nguoi_tao_ten || "-" },
                    { label: "Thời Gian Tạo", key: "tg_tao", value: formatDateTime(lichDang.tg_tao), type: "date" },
                    { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDateTime(lichDang.tg_cap_nhat), type: "date" },
                ]
            }
        ]
    }

    // Wrapper component to access form context for DapAnDungSelector
    function DapAnDungSelectorWrapper({ value, onChange }: { value: any; onChange: (value: number) => void }) {
        const form = useFormContext()
        const error = form.formState.errors.dap_an_dung?.message as string | undefined

        return (
            <DapAnDungSelector
                value={value ? Number(value) : null}
                onChange={onChange}
                error={error}
            />
        )
    }

    // Custom component để đặt câu hỏi và hình ảnh cùng một dòng
    function CauHoiVaHinhAnh({ 
        cauHoiValue, 
        cauHoiOnChange, 
        hinhAnhValue, 
        hinhAnhOnChange 
    }: {
        cauHoiValue: any
        cauHoiOnChange: (value: any) => void
        hinhAnhValue: any
        hinhAnhOnChange: (value: any) => void
    }) {
        const form = useFormContext()
        const cauHoiError = form.formState.errors.cau_hoi?.message as string | undefined

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-3">
                <div className="md:col-span-2">
                    <FormItem>
                        <FormLabel>
                            Câu Hỏi <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                            <Textarea
                                value={cauHoiValue || ''}
                                onChange={(e) => cauHoiOnChange(e.target.value)}
                                placeholder="Nhập câu hỏi"
                                rows={4}
                                className="resize-none"
                            />
                        </FormControl>
                        {cauHoiError && <FormMessage>{cauHoiError}</FormMessage>}
                    </FormItem>
                </div>
                <div className="md:col-span-1">
                    <FormItem>
                        <FormLabel>
                            Hình Ảnh
                        </FormLabel>
                        <FormControl>
                            <CloudinaryImageUpload
                                value={hinhAnhValue}
                                onChange={hinhAnhOnChange}
                            />
                        </FormControl>
                    </FormItem>
                </div>
            </div>
        )
    }

    // Prepare form sections
    const formSections: FormSection[] = useMemo(() => {
        const danhMucOptions = danhMucCauHoiList
            ?.filter(dm => dm.id !== undefined)
            .map(dm => ({
                label: dm.ten_nhom || `ID: ${dm.id}`,
                value: String(dm.id)
            })) || []

        return [
            {
                title: "Thông Tin Cơ Bản",
                fields: [
                    { 
                        name: "nhom_cau_hoi", 
                        label: "Nhóm Câu Hỏi", 
                        type: "select",
                        options: danhMucOptions,
                        required: true,
                        defaultValue: String(danhMucCauHoiId),
                        disabled: true, // Luôn disable vì đã chọn từ danh mục câu hỏi cha
                    },
                    { 
                        name: "ngay_dang", 
                        label: "Ngày Đăng", 
                        type: "date",
                        description: "Ngày đăng câu hỏi",
                        required: true
                    },
                    { 
                        name: "gio_dang", 
                        label: "Giờ Đăng", 
                        type: "custom",
                        required: true,
                        customComponent: ({ value, onChange, disabled, placeholder }: any) => {
                            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                let inputValue = e.target.value.replace(/\D/g, '') // Remove non-digits
                                
                                // Limit to 4 digits (HHmm)
                                if (inputValue.length > 4) {
                                    inputValue = inputValue.slice(0, 4)
                                }
                                
                                // Format as HH:mm
                                let formatted = inputValue
                                if (inputValue.length > 2) {
                                    formatted = inputValue.slice(0, 2) + ':' + inputValue.slice(2, 4)
                                } else if (inputValue.length > 0) {
                                    formatted = inputValue
                                }
                                
                                onChange(formatted)
                            }
                            
                            return (
                                <Input
                                    type="text"
                                    value={value || ''}
                                    onChange={handleChange}
                                    placeholder={placeholder || "10:00"}
                                    disabled={disabled}
                                    maxLength={5}
                                    pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                                />
                            )
                        }
                    },
                    {
                        name: "cau_hoi_hinh_anh",
                        label: "",
                        type: "custom",
                        customComponent: () => {
                            const form = useFormContext()
                            const cauHoiValue = form.watch("cau_hoi")
                            const hinhAnhValue = form.watch("hinh_anh")
                            
                            return (
                                <CauHoiVaHinhAnh
                                    cauHoiValue={cauHoiValue}
                                    cauHoiOnChange={(val) => form.setValue("cau_hoi", val)}
                                    hinhAnhValue={hinhAnhValue}
                                    hinhAnhOnChange={(val) => form.setValue("hinh_anh", val)}
                                />
                            )
                        },
                        colSpan: 3
                    },
                ]
            },
            {
                title: "Đáp Án",
                fields: [
                    { 
                        name: "dap_an_1", 
                        label: "Đáp Án 1", 
                        placeholder: "Nhập đáp án 1", 
                        required: true 
                    },
                    { 
                        name: "dap_an_2", 
                        label: "Đáp Án 2", 
                        placeholder: "Nhập đáp án 2", 
                        required: true 
                    },
                    { 
                        name: "dap_an_3", 
                        label: "Đáp Án 3", 
                        placeholder: "Nhập đáp án 3", 
                        required: true 
                    },
                    { 
                        name: "dap_an_4", 
                        label: "Đáp Án 4", 
                        placeholder: "Nhập đáp án 4", 
                        required: true 
                    },
                    { 
                        name: "dap_an_dung", 
                        label: "Đáp Án Đúng", 
                        type: "custom",
                        required: true,
                        customComponent: ({ value, onChange }: any) => {
                            return <DapAnDungSelectorWrapper value={value} onChange={onChange} />
                        },
                        colSpan: 3
                    },
                ]
            },
            {
                title: "Áp Dụng",
                fields: [
                    {
                        name: "chuc_vu_ap_dung",
                        label: "Chức Vụ Áp Dụng",
                        type: "custom",
                        customComponent: ({ value, onChange }: any) => (
                            <ChucVuMultiSelect
                                options={danhSachChucVu}
                                value={value}
                                onChange={onChange}
                                placeholder="Chọn chức vụ áp dụng (để trống = tất cả)"
                            />
                        ),
                        description: "Chọn chức vụ áp dụng. Để trống sẽ áp dụng cho tất cả chức vụ.",
                        colSpan: 3
                    },
                ]
            }
        ]
    }, [danhMucCauHoiList, danhMucCauHoiId, danhSachChucVu])

    // Define columns for the table
    const columns: EmbeddedListColumn<LichDang>[] = [
        {
            key: "ngay_dang",
            header: "Ngày Đăng",
            sortable: true,
            stickyLeft: true,
            stickyMinWidth: 120,
            render: (item) => (
                item.ngay_dang 
                    ? format(new Date(item.ngay_dang), "dd/MM/yyyy", { locale: vi })
                    : <span className="text-muted-foreground">-</span>
            )
        },
        {
            key: "gio_dang",
            header: "Giờ Đăng",
            sortable: true,
            render: (item) => {
                const gioDang = item.gio_dang
                if (!gioDang) return <span className="text-muted-foreground">-</span>
                // Chỉ lấy hh:mm, bỏ phần :ss nếu có
                const formattedTime = gioDang.length > 5 ? gioDang.substring(0, 5) : gioDang
                return <span>{formattedTime}</span>
            }
        },
        {
            key: "cau_hoi",
            header: "Câu Hỏi",
            sortable: true,
            stickyLeft: true,
            stickyMinWidth: 200,
            render: (item) => (
                <span className="font-medium line-clamp-2">
                    {item.cau_hoi.length > 100 
                        ? `${item.cau_hoi.substring(0, 100)}...` 
                        : item.cau_hoi}
                </span>
            )
        },
        {
            key: "dap_an_dung",
            header: "Đáp Án Đúng",
            sortable: true,
            render: (item) => (
                <Badge variant="default" className="bg-primary">
                    Đáp án {item.dap_an_dung}
                </Badge>
            )
        },
        {
            key: "chuc_vu_ap_dung",
            header: "Chức Vụ Áp Dụng",
            sortable: false,
            hideInCompact: true,
            render: (item) => {
                const chucVuApDung = item.chuc_vu_ap_dung
                if (!chucVuApDung || !Array.isArray(chucVuApDung) || chucVuApDung.length === 0) {
                    return <Badge variant="outline">Tất cả</Badge>
                }
                const chucVuNames = chucVuApDung.map(id => chucVuMap.get(id) || `ID: ${id}`)
                return (
                    <div className="flex flex-wrap gap-1">
                        {chucVuNames.length > 3 ? (
                            <Badge variant="secondary">{chucVuNames.length} chức vụ</Badge>
                        ) : (
                            chucVuNames.map((name, index) => (
                                <Badge key={index} variant="secondary">
                                    {name}
                                </Badge>
                            ))
                        )}
                    </div>
                )
            }
        },
    ]

    return (
        <>
            {/* Custom Header for "Danh Sách Lịch Đăng" */}
            <div className="space-y-3 sm:space-y-4 print:space-y-2 print:break-inside-avoid scroll-mt-28">
                <div className="flex items-center justify-between gap-2 sm:gap-2.5 px-1">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="p-1.5 rounded-md bg-primary/10 print:bg-transparent print:border print:border-primary">
                            <Calendar className="h-4 w-4 text-primary shrink-0" />
                        </div>
                        <h3 className={sectionTitleClass("font-semibold tracking-tight text-primary")}>
                            Danh Sách Lịch Đăng
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                        {(lichDangList || []).length > 0 && (
                            <Button
                                onClick={() => setExpandDialogOpen(true)}
                                size="sm"
                                variant="outline"
                            >
                                <Maximize2 className="mr-2 h-4 w-4" />
                                Xem tất cả
                            </Button>
                        )}
                        <Button onClick={handleAdd} size="sm">
                            Thêm Lịch Đăng
                        </Button>
                    </div>
                </div>
                {/* Embedded List Section (without its own header) */}
                <div className="mt-4">
                    <EmbeddedListSection
                        title=""
                        data={lichDangList || []}
                        columns={columns}
                        isLoading={isLoading}
                        emptyMessage="Chưa có lịch đăng nào trong danh mục này"
                        onRowClick={handleRowClick}
                        onView={handleEyeClick}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        showActions={true}
                        getItemId={(item) => item.id!}
                        getItemName={(item) => item.cau_hoi.substring(0, 50)}
                        compactMode={true}
                        compactRowCount={5}
                        showMoreIndicator={false}
                        enableExpandView={false}
                        defaultSortField="ngay_dang"
                        defaultSortDirection="desc"
                    />
                </div>
            </div>

            {/* Custom Expand Dialog */}
            {expandDialogOpen && (
                <EmbeddedListFullViewDialog
                    open={expandDialogOpen}
                    onOpenChange={setExpandDialogOpen}
                    title="Danh Sách Đầy Đủ Lịch Đăng"
                    data={lichDangList || []}
                    columns={columns}
                    onRowClick={handleRowClick}
                    onView={handleEyeClick}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    showActions={true}
                    getItemId={(item) => item.id!}
                    defaultSortField="ngay_dang"
                    defaultSortDirection="desc"
                    enableSearch={true}
                    searchPlaceholder="Tìm kiếm lịch đăng..."
                    searchFields={["cau_hoi", "dap_an_1", "dap_an_2", "dap_an_3", "dap_an_4"]}
                />
            )}

            {/* Detail Dialog */}
            {selectedLichDang && viewState.data && (
                <GenericDetailDialog
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                    title={`Lịch Đăng: ${format(new Date(selectedLichDang.ngay_dang || ""), "dd/MM/yyyy", { locale: vi })} ${selectedLichDang.gio_dang || ""}`}
                    subtitle={selectedLichDang.cau_hoi.substring(0, 50)}
                    sections={getDetailSections(viewState.data)}
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDetailDialogOpen(false)
                                    handleEdit(selectedLichDang)
                                }}
                            >
                                Sửa
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setDetailDialogOpen(false)
                                    handleDelete(selectedLichDang)
                                }}
                            >
                                Xóa
                            </Button>
                        </>
                    }
                />
            )}

            {/* Form Dialog */}
            <GenericFormDialog
                open={formDialogOpen}
                onOpenChange={(open) => {
                    setFormDialogOpen(open)
                    if (!open) {
                        setSelectedLichDang(null)
                        setIsEditMode(false)
                    }
                }}
                title={isEditMode ? `Sửa Lịch Đăng: ${selectedLichDang?.cau_hoi.substring(0, 50)}...` : "Thêm Mới Lịch Đăng"}
                subtitle={isEditMode ? "Cập nhật thông tin lịch đăng" : "Thêm lịch đăng vào danh mục này"}
                schema={lichDangSchema.omit({ 
                    id: true, 
                    tg_tao: true, 
                    tg_cap_nhat: true,
                    nhom_cau_hoi_ten: true,
                    nguoi_tao_ten: true,
                    nguoi_tao_id: true
                }).extend({
                    nhom_cau_hoi: z.union([
                        z.number().int().positive("Nhóm câu hỏi là bắt buộc"),
                        z.string().min(1, "Nhóm câu hỏi là bắt buộc").transform((val) => {
                            const num = parseInt(val, 10)
                            if (isNaN(num) || num <= 0) {
                                throw new Error("Nhóm câu hỏi không hợp lệ")
                            }
                            return num
                        }),
                    ]),
                    dap_an_dung: z.union([
                        z.number().int().min(1).max(4),
                        z.string().min(1).transform((val) => {
                            const num = parseInt(val, 10)
                            if (isNaN(num) || num < 1 || num > 4) {
                                throw new Error("Đáp án đúng phải từ 1 đến 4")
                            }
                            return num
                        }),
                    ]),
                    chuc_vu_ap_dung: z.array(z.number()).optional().nullable(),
                })}
                defaultValues={isEditMode && selectedLichDang 
                    ? {
                        nhom_cau_hoi: String(selectedLichDang.nhom_cau_hoi),
                        ngay_dang: selectedLichDang.ngay_dang || "",
                        gio_dang: selectedLichDang.gio_dang || "",
                        cau_hoi: selectedLichDang.cau_hoi,
                        hinh_anh: selectedLichDang.hinh_anh || "",
                        dap_an_1: selectedLichDang.dap_an_1,
                        dap_an_2: selectedLichDang.dap_an_2,
                        dap_an_3: selectedLichDang.dap_an_3,
                        dap_an_4: selectedLichDang.dap_an_4,
                        dap_an_dung: String(selectedLichDang.dap_an_dung),
                        chuc_vu_ap_dung: selectedLichDang.chuc_vu_ap_dung || [],
                    }
                    : {
                        nhom_cau_hoi: String(danhMucCauHoiId),
                        ngay_dang: format(new Date(), "yyyy-MM-dd"),
                        gio_dang: "10:00",
                        cau_hoi: "",
                        hinh_anh: "",
                        dap_an_1: "",
                        dap_an_2: "",
                        dap_an_3: "",
                        dap_an_4: "",
                        dap_an_dung: "1",
                        chuc_vu_ap_dung: [],
                    }
                }
                sections={formSections}
                onSubmit={handleFormSubmit}
                submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
                successMessage={isEditMode ? "Cập nhật lịch đăng thành công" : "Thêm mới lịch đăng thành công"}
                errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật lịch đăng" : "Có lỗi xảy ra khi thêm mới lịch đăng"}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Delete Dialog */}
            {selectedLichDang && (
                <GenericDeleteDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title="Xác nhận xóa lịch đăng"
                    description="Bạn có chắc chắn muốn xóa lịch đăng này không?"
                    entityName={selectedLichDang.cau_hoi.substring(0, 50)}
                    onConfirm={handleDeleteConfirm}
                    isLoading={deleteMutation.isPending}
                />
            )}

            {/* View Detail Confirm Dialog */}
            <ConfirmDialog
                open={viewConfirmOpen}
                onOpenChange={setViewConfirmOpen}
                title="Mở trang chi tiết lịch đăng"
                description="Bạn có muốn mở trang chi tiết lịch đăng trong module Lịch đăng không?"
                confirmLabel="Mở trang chi tiết"
                cancelLabel="Hủy"
                skipConfirmStorageKey={VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY}
                skipConfirmLabel="Đừng hỏi lại lần sau"
                onConfirm={() => {
                    if (!lichDangToView?.id) return
                    navigate(`${lichDangConfig.routePath}/${lichDangToView.id}`)
                }}
            />
        </>
    )
}

