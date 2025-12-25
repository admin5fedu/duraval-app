"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { nhanSuSchema } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/schema"
import type { UpdateNhanSuInput } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/schema"
import { NhanSuAPI } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/services/nhan-su.api"
import { useAuthStore } from "@/shared/stores/auth-store"
import { toast } from "sonner"
import { AvatarUpload } from "@/components/profile/AvatarUpload"

// Custom Avatar Field Component
function AvatarField({ value, onChange }: { value: string | null; onChange: (value: string | null) => void }) {
  return (
    <div className="flex justify-center py-4">
      <AvatarUpload
        value={value}
        onChange={onChange}
        size="lg"
      />
    </div>
  )
}

const sections: FormSection[] = [
  {
    title: "Ảnh Đại Diện",
    fields: [
      { 
        name: "avatar_url", 
        label: "Ảnh Đại Diện", 
        type: "custom",
        customComponent: AvatarField,
        colSpan: 3,
        description: "Tải lên ảnh đại diện của bạn (tối đa 10MB, định dạng: JPG, PNG, GIF, WebP)"
      },
    ]
  },
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { 
        name: "ho_ten", 
        label: "Họ và Tên", 
        required: true,
        placeholder: "Nhập họ và tên đầy đủ",
        description: "Họ và tên sẽ được hiển thị trong hồ sơ của bạn"
      },
      { 
        name: "so_dien_thoai", 
        label: "Số Điện Thoại",
        placeholder: "Nhập số điện thoại (10-11 số)",
        description: "Số điện thoại để liên hệ (tùy chọn)"
      },
      { 
        name: "email_ca_nhan", 
        label: "Email Cá Nhân", 
        type: "email",
        placeholder: "example@email.com",
        description: "Email cá nhân để liên hệ (tùy chọn)"
      },
      { 
        name: "gioi_tinh", 
        label: "Giới Tính", 
        type: "select", 
        options: [
          { label: "Chọn giới tính", value: "" },
          { label: "Nam", value: "Nam" },
          { label: "Nữ", value: "Nữ" },
          { label: "Khác", value: "Khác" }
        ],
        description: "Giới tính của bạn"
      },
      { 
        name: "ngay_sinh", 
        label: "Ngày Sinh", 
        type: "date",
        description: "Ngày sinh của bạn"
      },
      { 
        name: "hon_nhan", 
        label: "Tình Trạng Hôn Nhân", 
        type: "select", 
        options: [
          { label: "Chọn tình trạng", value: "" },
          { label: "Độc thân", value: "Độc thân" },
          { label: "Đã kết hôn", value: "Đã kết hôn" },
          { label: "Ly dị", value: "Ly dị" }
        ],
        description: "Tình trạng hôn nhân hiện tại"
      },
    ]
  },
  {
    title: "Ghi Chú",
    fields: [
      { 
        name: "ghi_chu", 
        label: "Ghi Chú", 
        type: "textarea", 
        colSpan: 3,
        placeholder: "Nhập ghi chú cá nhân (nếu có)",
        description: "Ghi chú hoặc thông tin bổ sung về bản thân"
      },
    ]
  }
]

export default function HoSoFormView() {
  const navigate = useNavigate()
  const { employee, refreshEmployee, setEmployee } = useAuthStore()
  const [originalEmployee, setOriginalEmployee] = useState(employee)

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Không tìm thấy thông tin nhân viên</p>
          <p className="text-sm text-muted-foreground">Vui lòng đăng nhập lại hoặc liên hệ quản trị viên</p>
        </div>
      </div>
    )
  }

  // Store original employee data for rollback
  if (!originalEmployee) {
    setOriginalEmployee(employee)
  }

  const handleSubmit = async (data: any) => {
    // Validate data before sending
    if (!data.ho_ten || data.ho_ten.trim().length === 0) {
      throw new Error("Họ và tên không được để trống")
    }

    if (data.ho_ten.trim().length < 2) {
      throw new Error("Họ và tên phải có ít nhất 2 ký tự")
    }

    if (data.so_dien_thoai && data.so_dien_thoai.trim() !== '') {
      const phoneRegex = /^[0-9]{10,11}$/
      if (!phoneRegex.test(data.so_dien_thoai.replace(/\s/g, ''))) {
        throw new Error("Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số")
      }
    }

    if (data.email_ca_nhan && data.email_ca_nhan.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email_ca_nhan)) {
        throw new Error("Email cá nhân không hợp lệ. Vui lòng nhập đúng định dạng email (ví dụ: example@email.com)")
      }
    }

    // Optimistic update - cập nhật UI ngay lập tức
    const updateData: UpdateNhanSuInput = {
      ho_ten: data.ho_ten.trim(),
      so_dien_thoai: data.so_dien_thoai?.trim() || null,
      email_ca_nhan: data.email_ca_nhan?.trim() || null,
      gioi_tinh: data.gioi_tinh || null,
      ngay_sinh: data.ngay_sinh || null,
      hon_nhan: data.hon_nhan || null,
      ghi_chu: data.ghi_chu?.trim() || null,
      avatar_url: data.avatar_url || null,
    }

    // Optimistically update employee in store
    const optimisticEmployee = {
      ...employee,
      ...updateData,
    } as typeof employee
    setEmployee(optimisticEmployee)

    try {
      await NhanSuAPI.update(employee.ma_nhan_vien, updateData)
    } catch (error: any) {
      // Rollback optimistic update on error
      if (originalEmployee) {
        setEmployee(originalEmployee)
      }
      
      // Show detailed error message
      let errorMessage = "Có lỗi xảy ra khi cập nhật hồ sơ"
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.error) {
        errorMessage = error.error
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      // Network error
      if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('network')) {
        errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại."
      }
      
      // Rate limit error
      if (error?.status === 429 || error?.code === 'over_request_rate_limit') {
        errorMessage = "Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại."
      }
      
      throw new Error(errorMessage)
    }
  }

  const handleSuccess = async () => {
    // Refresh employee data from server to ensure consistency
    await refreshEmployee()
    
    // Update original employee for next edit
    setOriginalEmployee(null) // Reset to get fresh data
    
    // Navigate to detail view
    navigate("/ho-so")
  }

  const handleCancel = () => {
    // Rollback optimistic update if exists
    if (originalEmployee) {
      setEmployee(originalEmployee)
    }
    navigate("/ho-so")
  }

  return (
    <GenericFormView
      title={`Sửa Hồ Sơ: ${employee.ho_ten || ''}`}
      subtitle="Cập nhật thông tin cá nhân và ảnh đại diện của bạn."
      schema={nhanSuSchema.partial()}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl="/ho-so"
      successMessage="Cập nhật hồ sơ thành công!"
      errorMessage="Có lỗi xảy ra khi cập nhật hồ sơ"
      defaultValues={{
        ho_ten: employee.ho_ten || '',
        so_dien_thoai: employee.so_dien_thoai || '',
        email_ca_nhan: employee.email_ca_nhan || '',
        gioi_tinh: employee.gioi_tinh || '',
        ngay_sinh: employee.ngay_sinh || '',
        hon_nhan: employee.hon_nhan || '',
        ghi_chu: employee.ghi_chu || '',
        avatar_url: employee.avatar_url || null,
      }}
    />
  )
}

