/**
 * Câu Hỏi Section Component
 * 
 * Component hiển thị danh sách câu hỏi trong detail view chuyên đề.
 * Tham khảo RelativesSection để đảm bảo flow và quy tắc đúng.
 */

"use client"

import { useState, useMemo, useImperativeHandle, forwardRef } from "react"
import { useNavigate } from "react-router-dom"
import { useCauHoiByChuyenDeId } from "../../cau-hoi/hooks"
import { EmbeddedListSection, type EmbeddedListColumn } from "@/shared/components/data-display/embedded-list-section"
import { EmbeddedListFullViewDialog } from "@/shared/components/data-display/embedded-list-full-view-dialog"
import { GenericDetailDialog } from "@/shared/components/dialogs/generic-detail-dialog"
import { GenericFormDialog } from "@/shared/components/dialogs/generic-form-dialog"
import { GenericDeleteDialog } from "@/shared/components/dialogs/generic-delete-dialog"
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog"
import { CauHoi, cauHoiSchema } from "../../cau-hoi/schema"
import type { DetailSection } from "@/shared/components"
import type { FormSection } from "@/shared/components/forms/generic-form-view"
import { useCreateCauHoi, useUpdateCauHoi, useDeleteCauHoi } from "../../cau-hoi/hooks"
import { useChuyenDe } from "../hooks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, Maximize2 } from "lucide-react"
import { sectionTitleClass } from "@/shared/utils/section-styles"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cauHoiConfig } from "../../cau-hoi/config"
import { z } from "zod"

const VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY = "cau-hoi-view-detail-skip-confirm"

interface CauHoiSectionProps {
    chuyenDeId: number
}

export interface CauHoiSectionRef {
    handleAdd: () => void
}

export const CauHoiSection = forwardRef<CauHoiSectionRef, CauHoiSectionProps>(
function CauHoiSection({ chuyenDeId }, ref) {
    const { data: cauHoiList, isLoading } = useCauHoiByChuyenDeId(chuyenDeId)
    const { data: chuyenDeList } = useChuyenDe()
    const navigate = useNavigate()
    
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [formDialogOpen, setFormDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
    const [selectedCauHoi, setSelectedCauHoi] = useState<CauHoi | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [cauHoiToView, setCauHoiToView] = useState<CauHoi | null>(null)
    const [expandDialogOpen, setExpandDialogOpen] = useState(false)

    const createMutation = useCreateCauHoi()
    const updateMutation = useUpdateCauHoi()
    const deleteMutation = useDeleteCauHoi()

    // Click dòng -> Mở popup detail
    const handleRowClick = (cauHoi: CauHoi) => {
        setSelectedCauHoi(cauHoi)
        setDetailDialogOpen(true)
    }

    // Click icon mắt -> Confirm dialog -> Redirect đến page detail
    const handleEyeClick = (cauHoi: CauHoi) => {
        if (!cauHoi.id) return

        const skipConfirm =
            typeof window !== "undefined" &&
            window.localStorage.getItem(VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY) === "true"

        if (skipConfirm) {
            navigate(`${cauHoiConfig.routePath}/${cauHoi.id}`)
            return
        }

        setCauHoiToView(cauHoi)
        setViewConfirmOpen(true)
    }

    const handleAdd = () => {
        setSelectedCauHoi(null)
        setIsEditMode(false)
        setFormDialogOpen(true)
    }

    // Expose handleAdd to parent via ref
    useImperativeHandle(ref, () => ({
        handleAdd
    }), [])

    const handleEdit = (cauHoi: CauHoi) => {
        setSelectedCauHoi(cauHoi)
        setIsEditMode(true)
        setFormDialogOpen(true)
    }

    const handleDelete = (cauHoi: CauHoi) => {
        setSelectedCauHoi(cauHoi)
        setDeleteDialogOpen(true)
    }

    // Handle form submit - Đồng nhất với cau-hoi-form-view.tsx
    const handleFormSubmit = async (data: any) => {
        try {
            // Schema đã transform string thành number, nhưng để an toàn xử lý cả 2 trường hợp
            const getChuyenDeId = (value: any): number | undefined => {
                if (value === null || value === undefined || value === "") {
                    return undefined
                }
                if (typeof value === "number") {
                    return value > 0 ? value : undefined
                }
                if (typeof value === "string") {
                    const num = parseInt(value, 10)
                    return !isNaN(num) && num > 0 ? num : undefined
                }
                return undefined
            }

            const getDapAnDung = (value: any): number => {
                if (typeof value === "number") {
                    return value >= 1 && value <= 4 ? value : 1
                }
                if (typeof value === "string") {
                    const num = parseInt(value, 10)
                    return !isNaN(num) && num >= 1 && num <= 4 ? num : 1
                }
                return 1
            }

            if (isEditMode && selectedCauHoi) {
                const updateInput: any = {
                    cau_hoi: data.cau_hoi ? String(data.cau_hoi).trim() : undefined,
                    dap_an_1: data.dap_an_1 ? String(data.dap_an_1).trim() : undefined,
                    dap_an_2: data.dap_an_2 ? String(data.dap_an_2).trim() : undefined,
                    dap_an_3: data.dap_an_3 ? String(data.dap_an_3).trim() : undefined,
                    dap_an_4: data.dap_an_4 ? String(data.dap_an_4).trim() : undefined,
                    dap_an_dung: getDapAnDung(data.dap_an_dung),
                    hinh_anh: Array.isArray(data.hinh_anh) ? data.hinh_anh.filter((url: string) => url && url.trim()) : undefined,
                }
                // Only update chuyen_de_id if it's provided and valid
                const chuyenDeId = getChuyenDeId(data.chuyen_de_id)
                if (chuyenDeId !== undefined) {
                    updateInput.chuyen_de_id = chuyenDeId
                }
                await updateMutation.mutateAsync({ 
                    id: selectedCauHoi.id!, 
                    input: updateInput
                })
            } else {
                // Tự động set nguoi_tao_id từ user hiện tại
                const { useAuthStore } = await import("@/shared/stores/auth-store")
                const authStore = useAuthStore.getState()
                const user = authStore.user
                
                if (!user?.id) {
                    throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
                }
                const chuyenDeId = getChuyenDeId(data.chuyen_de_id)
                if (chuyenDeId === undefined) {
                    throw new Error("Vui lòng chọn chuyên đề")
                }
                const createInput = {
                    chuyen_de_id: chuyenDeId,
                    cau_hoi: String(data.cau_hoi || "").trim(),
                    dap_an_1: String(data.dap_an_1 || "").trim(),
                    dap_an_2: String(data.dap_an_2 || "").trim(),
                    dap_an_3: String(data.dap_an_3 || "").trim(),
                    dap_an_4: String(data.dap_an_4 || "").trim(),
                    dap_an_dung: getDapAnDung(data.dap_an_dung),
                    hinh_anh: Array.isArray(data.hinh_anh) ? data.hinh_anh.filter((url: string) => url && url.trim()) : null,
                    nguoi_tao_id: parseInt(user.id),
                }
                await createMutation.mutateAsync(createInput)
            }
        } catch (error: any) {
            // Error is handled by mutation, but we can add additional handling here if needed
            throw error
        }
    }

    const handleDeleteConfirm = async () => {
        if (!selectedCauHoi?.id) return
        await deleteMutation.mutateAsync(selectedCauHoi.id)
    }

    const getDetailSections = (cauHoi: CauHoi): DetailSection[] => {
        return [
            {
                title: "Thông Tin Cơ Bản",
                fields: [
                    { label: "ID", key: "id", value: cauHoi.id, type: "number" },
                    { label: "Chuyên Đề", key: "ten_chuyen_de", value: cauHoi.ten_chuyen_de || "-" },
                    { label: "Câu Hỏi", key: "cau_hoi", value: cauHoi.cau_hoi, colSpan: 2 as const },
                ]
            },
            ...(cauHoi.hinh_anh && Array.isArray(cauHoi.hinh_anh) && cauHoi.hinh_anh.length > 0 ? [{
                title: "Hình Ảnh",
                fields: [
                    { 
                        label: "Hình Ảnh", 
                        key: "hinh_anh", 
                        value: (cauHoi.hinh_anh && Array.isArray(cauHoi.hinh_anh) && cauHoi.hinh_anh.length > 0) ? cauHoi.hinh_anh[0] : "",
                        type: "image" as const,
                        format: () => (
                            <div className="space-y-2">
                                {(cauHoi.hinh_anh && Array.isArray(cauHoi.hinh_anh) ? cauHoi.hinh_anh : []).map((url: string, index: number) => (
                                    <div key={index} className="mb-2">
                                        <img 
                                            src={url} 
                                            alt={`Hình ${index + 1}`}
                                            className="max-w-full h-auto rounded-md border"
                                            style={{ maxHeight: "300px" }}
                                        />
                                    </div>
                                ))}
                            </div>
                        ),
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
                        value: cauHoi.dap_an_1 || "",
                        format: () => (
                            <div className="flex items-center gap-2">
                                <span>{cauHoi.dap_an_1}</span>
                                {cauHoi.dap_an_dung === 1 && (
                                    <Badge variant="default" className="bg-green-600">Đúng</Badge>
                                )}
                            </div>
                        ),
                    },
                    { 
                        label: "Đáp Án 2", 
                        key: "dap_an_2", 
                        value: cauHoi.dap_an_2 || "",
                        format: () => (
                            <div className="flex items-center gap-2">
                                <span>{cauHoi.dap_an_2}</span>
                                {cauHoi.dap_an_dung === 2 && (
                                    <Badge variant="default" className="bg-green-600">Đúng</Badge>
                                )}
                            </div>
                        ),
                    },
                    { 
                        label: "Đáp Án 3", 
                        key: "dap_an_3", 
                        value: cauHoi.dap_an_3 || "",
                        format: () => (
                            <div className="flex items-center gap-2">
                                <span>{cauHoi.dap_an_3}</span>
                                {cauHoi.dap_an_dung === 3 && (
                                    <Badge variant="default" className="bg-green-600">Đúng</Badge>
                                )}
                            </div>
                        ),
                    },
                    { 
                        label: "Đáp Án 4", 
                        key: "dap_an_4", 
                        value: cauHoi.dap_an_4 || "",
                        format: () => (
                            <div className="flex items-center gap-2">
                                <span>{cauHoi.dap_an_4}</span>
                                {cauHoi.dap_an_dung === 4 && (
                                    <Badge variant="default" className="bg-green-600">Đúng</Badge>
                                )}
                            </div>
                        ),
                    },
                ]
            },
            {
                title: "Thông Tin Hệ Thống",
                fields: [
                    { label: "Người Tạo ID", key: "nguoi_tao_id", value: cauHoi.nguoi_tao_id?.toString() || "-" },
                    { label: "Thời Gian Tạo", key: "tg_tao", value: cauHoi.tg_tao ? format(new Date(cauHoi.tg_tao), "dd/MM/yyyy HH:mm", { locale: vi }) : "-", type: "date" },
                    { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: cauHoi.tg_cap_nhat ? format(new Date(cauHoi.tg_cap_nhat), "dd/MM/yyyy HH:mm", { locale: vi }) : "-", type: "date" },
                ]
            }
        ]
    }

    // Prepare form sections - Đồng nhất với cau-hoi-form-view.tsx
    const formSections: FormSection[] = useMemo(() => {
        const chuyenDeOptions = chuyenDeList
            ?.filter(chuyenDe => chuyenDe.id !== undefined)
            .map(chuyenDe => ({
                label: chuyenDe.ten_chuyen_de || `ID: ${chuyenDe.id}`,
                value: String(chuyenDe.id)
            })) || []

        return [
            {
                title: "Thông Tin Cơ Bản",
                fields: [
                    { 
                        name: "chuyen_de_id", 
                        label: "Chuyên Đề", 
                        type: "select",
                        options: chuyenDeOptions,
                        required: true,
                        defaultValue: String(chuyenDeId),
                        disabled: true // Luôn disable vì đã chọn từ chuyên đề cha
                    },
                    { name: "cau_hoi", label: "Câu Hỏi", type: "textarea", required: true, colSpan: 2 },
                    { 
                        name: "hinh_anh", 
                        label: "Hình Ảnh", 
                        type: "image",
                        imageMaxSize: 10,
                        multiple: true,
                        colSpan: 2 as const,
                        description: "Có thể tải lên nhiều hình ảnh. Hỗ trợ JPG, PNG, GIF, WebP, tối đa 10MB mỗi ảnh."
                    },
                ]
            },
            {
                title: "Đáp Án",
                fields: [
                    { name: "dap_an_1", label: "Đáp Án 1", required: true },
                    { name: "dap_an_2", label: "Đáp Án 2", required: true },
                    { name: "dap_an_3", label: "Đáp Án 3", required: true },
                    { name: "dap_an_4", label: "Đáp Án 4", required: true },
                    { 
                        name: "dap_an_dung", 
                        label: "Đáp Án Đúng", 
                        type: "toggle",
                        options: [
                            { label: "Đáp án 1", value: "1" },
                            { label: "Đáp án 2", value: "2" },
                            { label: "Đáp án 3", value: "3" },
                            { label: "Đáp án 4", value: "4" },
                        ],
                        required: true 
                    },
                ]
            },
        ]
    }, [chuyenDeList, chuyenDeId])

    // Define columns for the table
    const columns: EmbeddedListColumn<CauHoi>[] = [
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
            key: "tg_tao",
            header: "Thời Gian Tạo",
            sortable: true,
            hideInCompact: true,
            render: (item) => (
                item.tg_tao 
                    ? format(new Date(item.tg_tao), "dd/MM/yyyy HH:mm", { locale: vi })
                    : <span className="text-muted-foreground">-</span>
            )
        }
    ]

    return (
        <>
            {/* Custom Header for "Danh Sách Câu Hỏi" */}
            <div className="space-y-3 sm:space-y-4 print:space-y-2 print:break-inside-avoid scroll-mt-28">
                <div className="flex items-center justify-between gap-2 sm:gap-2.5 px-1">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="p-1.5 rounded-md bg-primary/10 print:bg-transparent print:border print:border-primary">
                            <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                        </div>
                        <h3 className={sectionTitleClass("font-semibold tracking-tight text-primary")}>
                            Danh Sách Câu Hỏi
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                        {(cauHoiList || []).length > 0 && (
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
                            Thêm Câu Hỏi
                        </Button>
                    </div>
                </div>
                {/* Embedded List Section (without its own header) */}
                <div className="mt-4">
                    <EmbeddedListSection
                        title=""
                        data={cauHoiList || []}
                        columns={columns}
                        isLoading={isLoading}
                        emptyMessage="Chưa có câu hỏi nào trong chuyên đề này"
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
                        defaultSortField="tg_tao"
                        defaultSortDirection="desc"
                    />
                </div>
            </div>

            {/* Custom Expand Dialog */}
            {expandDialogOpen && (
                <EmbeddedListFullViewDialog
                    open={expandDialogOpen}
                    onOpenChange={setExpandDialogOpen}
                    title="Danh Sách Đầy Đủ Câu Hỏi"
                    data={cauHoiList || []}
                    columns={columns}
                    onRowClick={handleRowClick}
                    onView={handleEyeClick}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    showActions={true}
                    getItemId={(item) => item.id!}
                    defaultSortField="tg_tao"
                    defaultSortDirection="desc"
                    enableSearch={true}
                    searchPlaceholder="Tìm kiếm câu hỏi..."
                    searchFields={["cau_hoi"]}
                />
            )}

            {/* Detail Dialog */}
            {selectedCauHoi && (
                <GenericDetailDialog
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                    dialogTitle={`Chi Tiết: ${selectedCauHoi.cau_hoi.substring(0, 50)}...`}
                    dialogSubtitle="Chi tiết thông tin câu hỏi"
                    title={selectedCauHoi.cau_hoi.substring(0, 50)}
                    subtitle={selectedCauHoi.ten_chuyen_de || undefined}
                    sections={getDetailSections(selectedCauHoi)}
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDetailDialogOpen(false)
                                    handleEdit(selectedCauHoi)
                                }}
                            >
                                Sửa
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setDetailDialogOpen(false)
                                    handleDelete(selectedCauHoi)
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
                        setSelectedCauHoi(null)
                        setIsEditMode(false)
                    }
                }}
                title={isEditMode ? `Sửa Câu Hỏi: ${selectedCauHoi?.cau_hoi.substring(0, 50)}...` : "Thêm Mới Câu Hỏi"}
                subtitle={isEditMode ? "Cập nhật thông tin câu hỏi" : "Thêm câu hỏi vào chuyên đề này"}
                schema={cauHoiSchema.omit({ 
                    id: true, 
                    tg_tao: true, 
                    tg_cap_nhat: true,
                    ten_chuyen_de: true,
                    nguoi_tao_id: true
                }).extend({
                    chuyen_de_id: z.union([
                        z.number().int().positive("Chuyên đề là bắt buộc"),
                        z.string().min(1, "Chuyên đề là bắt buộc").transform((val) => {
                            const num = parseInt(val, 10)
                            if (isNaN(num) || num <= 0) {
                                throw new Error("Chuyên đề không hợp lệ")
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
                })}
                defaultValues={isEditMode && selectedCauHoi 
                    ? {
                        chuyen_de_id: String(selectedCauHoi.chuyen_de_id),
                        cau_hoi: selectedCauHoi.cau_hoi,
                        hinh_anh: selectedCauHoi.hinh_anh && Array.isArray(selectedCauHoi.hinh_anh) ? selectedCauHoi.hinh_anh : [],
                        dap_an_1: selectedCauHoi.dap_an_1,
                        dap_an_2: selectedCauHoi.dap_an_2,
                        dap_an_3: selectedCauHoi.dap_an_3,
                        dap_an_4: selectedCauHoi.dap_an_4,
                        dap_an_dung: String(selectedCauHoi.dap_an_dung),
                    }
                    : {
                        chuyen_de_id: String(chuyenDeId),
                        cau_hoi: "",
                        hinh_anh: [],
                        dap_an_1: "",
                        dap_an_2: "",
                        dap_an_3: "",
                        dap_an_4: "",
                        dap_an_dung: "1",
                    }
                }
                sections={formSections}
                onSubmit={handleFormSubmit}
                submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
                successMessage={isEditMode ? "Cập nhật câu hỏi thành công" : "Thêm mới câu hỏi thành công"}
                errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật câu hỏi" : "Có lỗi xảy ra khi thêm mới câu hỏi"}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Delete Dialog */}
            {selectedCauHoi && (
                <GenericDeleteDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title="Xác nhận xóa câu hỏi"
                    description="Bạn có chắc chắn muốn xóa câu hỏi này không?"
                    entityName={selectedCauHoi.cau_hoi.substring(0, 50)}
                    onConfirm={handleDeleteConfirm}
                    isLoading={deleteMutation.isPending}
                />
            )}

            {/* View Detail Confirm Dialog */}
            <ConfirmDialog
                open={viewConfirmOpen}
                onOpenChange={setViewConfirmOpen}
                title="Mở trang chi tiết câu hỏi"
                description="Bạn có muốn mở trang chi tiết câu hỏi trong module Câu hỏi không?"
                confirmLabel="Mở trang chi tiết"
                cancelLabel="Hủy"
                skipConfirmStorageKey={VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY}
                skipConfirmLabel="Đừng hỏi lại lần sau"
                onConfirm={() => {
                    if (!cauHoiToView?.id) return
                    navigate(`${cauHoiConfig.routePath}/${cauHoiToView.id}`)
                }}
            />
        </>
    )
})

