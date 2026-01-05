"use client"

import { GenericFormView, type FormSection } from "@/shared/components"
import { lichDangSchema } from "../schema"
import type { CreateLichDangInput, UpdateLichDangInput } from "../types"
import { useCreateLichDang, useUpdateLichDang } from "../hooks"
import { useLichDangById } from "../hooks"
import { useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { CloudinaryImageUpload } from "./cloudinary-image-upload"
import { DapAnDungSelector } from "./dap-an-dung-selector"
import { ChucVuMultiSelect } from "@/components/ui/chuc-vu-multi-select"
import { TimePicker } from "@/components/ui/time-picker"
import { LichDangAPI } from "../services/lich-dang.api"
import { useReferenceQuery } from "@/lib/react-query/hooks"
import { useAuthStore } from "@/shared/stores/auth-store"

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

interface LichDangFormViewProps {
    id?: number // If provided, this is edit mode
    onComplete?: () => void
    onCancel?: () => void
}

export function LichDangFormView({ id, onComplete, onCancel }: LichDangFormViewProps) {
    const createMutation = useCreateLichDang()
    const updateMutation = useUpdateLichDang()
    const { employee: currentEmployee } = useAuthStore()
    
    // If id is provided, fetch existing data for edit mode
    const { data: existingData, isLoading } = useLichDangById(id || 0, undefined)
    
    const isEditMode = !!id

    // Load nhom cau hoi options
    const { data: nhomCauHoiOptions = [] } = useReferenceQuery({
        queryKey: ['nhom-cau-hoi-list'],
        queryFn: LichDangAPI.getDanhSachNhomCauHoi,
    })

    // Load chuc vu options
    const { data: chucVuOptions = [] } = useReferenceQuery({
        queryKey: ['chuc-vu-list'],
        queryFn: LichDangAPI.getDanhSachChucVu,
    })

    // Convert nhom cau hoi to select options
    const nhomCauHoiSelectOptions = useMemo(() => {
        return nhomCauHoiOptions.map(item => ({
            label: item.ten_nhom || '',
            value: item.id?.toString() || ''
        })).filter(opt => opt.value)
    }, [nhomCauHoiOptions])

    // Create sections
    const sections = useMemo(() => {
        const baseSections: FormSection[] = [
            {
                title: "Thông Tin Cơ Bản",
                fields: [
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
                        customComponent: ({ value, onChange, disabled }: any) => {
                            const form = useFormContext()
                            const error = form.formState.errors.gio_dang?.message as string | undefined
                            
                            return (
                                <TimePicker
                                    value={value || ''}
                                    onChange={onChange}
                                    placeholder="Chọn giờ đăng"
                                    disabled={disabled}
                                    error={!!error}
                                />
                            )
                        }
                    },
                    { 
                        name: "nhom_cau_hoi", 
                        label: "Nhóm Câu Hỏi", 
                        type: "select",
                        options: nhomCauHoiSelectOptions,
                        placeholder: "Chọn nhóm câu hỏi",
                        required: true
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
                    { name: "dap_an_1", label: "Đáp Án 1", placeholder: "Nhập đáp án 1", required: true },
                    { name: "dap_an_2", label: "Đáp Án 2", placeholder: "Nhập đáp án 2", required: true },
                    { name: "dap_an_3", label: "Đáp Án 3", placeholder: "Nhập đáp án 3", required: true },
                    { name: "dap_an_4", label: "Đáp Án 4", placeholder: "Nhập đáp án 4", required: true },
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
                                options={chucVuOptions}
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

        return baseSections
    }, [nhomCauHoiSelectOptions, chucVuOptions])

    const handleSubmit = async (data: any) => {
        // Lấy ma_nhan_vien từ employee context
        const nguoiTaoId = currentEmployee?.ma_nhan_vien
        if (!nguoiTaoId) {
            throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
        }

        // Convert dap_an_dung from string to number (if needed)
        const dapAnDung = data.dap_an_dung ? Number(data.dap_an_dung) : null

        if (isEditMode && id) {
            const updateData: UpdateLichDangInput = {
                ...data,
                dap_an_dung: dapAnDung,
                chuc_vu_ap_dung: data.chuc_vu_ap_dung || null,
            }
            await updateMutation.mutateAsync({ id, input: updateData })
        } else {
            const submitData: CreateLichDangInput = {
                ...data,
                dap_an_dung: dapAnDung,
                nguoi_tao_id: nguoiTaoId,
                chuc_vu_ap_dung: data.chuc_vu_ap_dung || null,
            }
            await createMutation.mutateAsync(submitData)
        }
    }

    // Set default values
    const formDefaultValues = useMemo(() => {
        if (isEditMode && existingData) {
            return {
                ngay_dang: existingData.ngay_dang || '',
                gio_dang: existingData.gio_dang || '10:00',
                nhom_cau_hoi: existingData.nhom_cau_hoi?.toString() || '',
                cau_hoi: existingData.cau_hoi || '',
                hinh_anh: existingData.hinh_anh || null,
                dap_an_1: existingData.dap_an_1 || '',
                dap_an_2: existingData.dap_an_2 || '',
                dap_an_3: existingData.dap_an_3 || '',
                dap_an_4: existingData.dap_an_4 || '',
                dap_an_dung: existingData.dap_an_dung?.toString() || '',
                chuc_vu_ap_dung: existingData.chuc_vu_ap_dung || null,
            }
        }
        
        // Default values for new record
        const today = new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
        return {
            ngay_dang: today,
            gio_dang: '10:00'
        }
    }, [isEditMode, existingData])

    if (isEditMode && isLoading) {
        return <div>Đang tải...</div>
    }

    return (
        <GenericFormView
            title={isEditMode ? `Sửa Lịch Đăng #${id}` : "Thêm Mới Lịch Đăng"}
            subtitle={isEditMode ? "Cập nhật thông tin lịch đăng." : "Tạo lịch đăng câu hỏi mới."}
            schema={lichDangSchema.omit({ 
                id: true, 
                tg_tao: true, 
                tg_cap_nhat: true, 
                nhom_cau_hoi_ten: true, 
                nguoi_tao_ten: true 
            })}
            sections={sections}
            onSubmit={handleSubmit}
            onSuccess={onComplete}
            onCancel={onCancel}
            successMessage={isEditMode ? "Cập nhật lịch đăng thành công" : "Thêm mới lịch đăng thành công"}
            errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật lịch đăng" : "Có lỗi xảy ra khi thêm mới lịch đăng"}
            defaultValues={formDefaultValues}
        />
    )
}

