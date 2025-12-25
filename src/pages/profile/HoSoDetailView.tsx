import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Edit, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/shared/stores/auth-store'
import { DetailSection } from '@/shared/components/data-display/generic-detail-view'
import { GenericDetailViewSimple } from '@/shared/components/data-display/generic-detail-view-simple'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from 'sonner'
import { exportProfileToPDF } from './profile-pdf-export'

export default function HoSoDetailView() {
  const { user, loading, employee, employeeLoading } = useAuthStore()
  const navigate = useNavigate()
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    // Redirect nếu chưa đăng nhập
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  // Check edit permission (có thể mở rộng với role-based check)
  useEffect(() => {
    // For now, allow edit if employee exists and matches user email
    if (employee && user?.email && employee.email_cong_ty === user.email) {
      setCanEdit(true)
    }
  }, [employee, user])

  // Use employee data if available, fallback to user metadata
  const displayName = employee?.ho_ten || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Người dùng'
  const displaySubtitle = employee?.ten_cap_bac 
    ? `${employee.ten_cap_bac}${employee.chuc_vu ? ` • ${employee.chuc_vu}` : ''}`
    : employee?.chuc_vu || 'Nhân viên'
  const avatarUrl = employee?.avatar_url || user?.user_metadata?.avatar_url

  // Build sections based on available data
  const sections: DetailSection[] = [
    {
      title: 'Thông Tin Cơ Bản',
      fields: [
        {
          label: 'Mã Nhân Viên',
          key: 'ma_nhan_vien',
          value: employee?.ma_nhan_vien?.toString() || null,
          type: 'text',
        },
        {
          label: 'Họ và Tên',
          key: 'ho_ten',
          value: employee?.ho_ten || displayName,
          type: 'text',
        },
        {
          label: 'Email Công Ty',
          key: 'email_cong_ty',
          value: employee?.email_cong_ty || user?.email,
          type: 'email',
        },
        {
          label: 'Email Cá Nhân',
          key: 'email_ca_nhan',
          value: employee?.email_ca_nhan || null,
          type: 'email',
        },
        {
          label: 'Số Điện Thoại',
          key: 'so_dien_thoai',
          value: employee?.so_dien_thoai || user?.phone || null,
          type: 'phone',
        },
        {
          label: 'Giới Tính',
          key: 'gioi_tinh',
          value: employee?.gioi_tinh || null,
          type: 'badge',
        },
        {
          label: 'Ngày Sinh',
          key: 'ngay_sinh',
          value: employee?.ngay_sinh
            ? format(new Date(employee.ngay_sinh), 'dd/MM/yyyy', { locale: vi })
            : null,
          type: 'text',
        },
        {
          label: 'Tình Trạng Hôn Nhân',
          key: 'hon_nhan',
          value: employee?.hon_nhan || null,
          type: 'badge',
        },
      ],
    },
    {
      title: 'Công Việc & Chức Vụ',
      fields: [
        {
          label: 'Phòng Ban',
          key: 'phong_ban',
          value: employee?.phong_ban || '-',
          type: 'text',
        },
        {
          label: 'Bộ Phận',
          key: 'bo_phan',
          value: employee?.bo_phan || '-',
          type: 'text',
        },
        {
          label: 'Nhóm',
          key: 'nhom',
          value: employee?.nhom || '-',
          type: 'text',
        },
        {
          label: 'Chức Vụ',
          key: 'chuc_vu',
          value: employee?.chuc_vu || '-',
          type: 'text',
        },
        {
          label: 'Cấp Bậc',
          key: 'ten_cap_bac',
          value: employee?.ten_cap_bac || '-',
          type: 'text',
        },
        {
          label: 'Tình Trạng',
          key: 'tinh_trang',
          value: employee?.tinh_trang || null,
          type: 'status',
        },
      ],
    },
    {
      title: 'Thời Gian Làm Việc',
      fields: [
        {
          label: 'Ngày Thử Việc',
          key: 'ngay_thu_viec',
          value: employee?.ngay_thu_viec
            ? format(new Date(employee.ngay_thu_viec), 'dd/MM/yyyy', { locale: vi })
            : null,
          type: 'text',
        },
        {
          label: 'Ngày Chính Thức',
          key: 'ngay_chinh_thuc',
          value: employee?.ngay_chinh_thuc
            ? format(new Date(employee.ngay_chinh_thuc), 'dd/MM/yyyy', { locale: vi })
            : null,
          type: 'text',
        },
        {
          label: 'Ngày Nghỉ Việc',
          key: 'ngay_nghi_viec',
          value: employee?.ngay_nghi_viec
            ? format(new Date(employee.ngay_nghi_viec), 'dd/MM/yyyy', { locale: vi })
            : null,
          type: 'text',
        },
      ],
    },
  ]

  // Add ghi chu section if exists
  if (employee?.ghi_chu) {
    sections.push({
      title: 'Ghi Chú & Khác',
      fields: [
        {
          label: 'Ghi Chú',
          key: 'ghi_chu',
          value: employee.ghi_chu,
          colSpan: 3,
        },
      ],
    })
  }

  // Add authentication info section
  sections.push({
    title: 'Thông Tin Xác Thực',
    fields: [
      {
        label: 'Email Đã Xác Nhận',
        key: 'email_confirmed',
        value: user?.email_confirmed_at ? 'Đã xác nhận' : 'Chưa xác nhận',
        type: 'badge',
      },
      {
        label: 'Số Điện Thoại Đã Xác Nhận',
        key: 'phone_confirmed',
        value: user?.phone_confirmed_at ? 'Đã xác nhận' : 'Chưa xác nhận',
        type: 'badge',
      },
      {
        label: 'Ngày Tạo Tài Khoản',
        key: 'created_at',
        value: user?.created_at
          ? format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })
          : null,
        type: 'text',
      },
      {
        label: 'Lần Đăng Nhập Cuối',
        key: 'last_sign_in_at',
        value: user?.last_sign_in_at
          ? format(new Date(user.last_sign_in_at), 'dd/MM/yyyy HH:mm', { locale: vi })
          : null,
        type: 'text',
      },
    ],
  })

  // Actions for header - thứ tự từ phải qua: Sửa (primary), Xuất PDF, Đổi mật khẩu
  const handleExportPDF = async () => {
    if (!employee) {
      toast.error('Không có thông tin để xuất PDF')
      return
    }

    try {
      toast.loading('Đang tạo file PDF...', { id: 'export-pdf' })
      await exportProfileToPDF(employee, user!)
      toast.success('Xuất PDF thành công!', { id: 'export-pdf' })
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error('Có lỗi xảy ra khi xuất PDF', { id: 'export-pdf' })
    }
  }

  const actions = (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="outline" size="sm" asChild>
        <Link to="/doi-mat-khau" className="transition-all hover:scale-105">
          Đổi mật khẩu
        </Link>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        className="transition-all hover:scale-105"
      >
        <Download className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Xuất PDF</span>
      </Button>
      {canEdit && (
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate('/ho-so/sua')}
          className="transition-all hover:scale-105"
        >
          <Edit className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Sửa</span>
        </Button>
      )}
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={displayName}
      subtitle={displaySubtitle}
      avatarUrl={avatarUrl}
      sections={sections}
      actions={actions}
      isLoading={loading || employeeLoading}
    />
  )
}

