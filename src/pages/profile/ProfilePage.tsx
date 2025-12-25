import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/shared/stores/auth-store'
import { DetailSectionCard } from '@/shared/components/data-display/detail/detail-section-card'
import { DetailSection } from '@/shared/components/data-display/generic-detail-view'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { EditProfileForm } from '@/components/profile/EditProfileForm'
import { AvatarUpload } from '@/components/profile/AvatarUpload'

export default function ProfilePage() {
  const { user, loading } = useAuthStore()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Redirect nếu chưa đăng nhập
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-foreground">Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  // Show error state if no user
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h3 className="text-lg font-semibold mb-2">Không tìm thấy thông tin</h3>
        <p className="text-sm text-muted-foreground">Vui lòng đăng nhập để xem hồ sơ.</p>
      </div>
    )
  }

  const displayName =
    user.user_metadata?.display_name || user.email?.split('@')[0] || 'Người dùng'
  const displaySubtitle = 'Nhân viên'
  const avatarUrl = user.user_metadata?.avatar_url

  // Build sections based on available data
  const sections: DetailSection[] = [
    {
      title: 'Thông Tin Cơ Bản',
      fields: [
        {
          label: 'Email',
          key: 'email',
          value: user.email,
          type: 'email',
        },
        {
          label: 'ID Người Dùng',
          key: 'id',
          value: user.id,
          type: 'text',
        },
        {
          label: 'Ngày Tạo',
          key: 'created_at',
          value: user.created_at
            ? format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })
            : null,
          type: 'text',
        },
        {
          label: 'Lần Đăng Nhập Cuối',
          key: 'last_sign_in_at',
          value: user.last_sign_in_at
            ? format(new Date(user.last_sign_in_at), 'dd/MM/yyyy HH:mm', { locale: vi })
            : null,
          type: 'text',
        },
      ],
    },
    {
      title: 'Thông Tin Xác Thực',
      fields: [
        {
          label: 'Email Đã Xác Nhận',
          key: 'email_confirmed',
          value: user.email_confirmed_at ? 'Đã xác nhận' : 'Chưa xác nhận',
          type: 'badge',
        },
        {
          label: 'Số Điện Thoại',
          key: 'phone',
          value: user.phone || null,
          type: 'phone',
        },
        {
          label: 'Số Điện Thoại Đã Xác Nhận',
          key: 'phone_confirmed',
          value: user.phone_confirmed_at ? 'Đã xác nhận' : 'Chưa xác nhận',
          type: 'badge',
        },
      ],
    },
  ]

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <EditProfileForm
          onSuccess={() => {
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
          <p className="text-muted-foreground mt-1">{displaySubtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/doi-mat-khau">
              Đổi mật khẩu
            </Link>
          </Button>
        </div>
      </div>

      {/* Avatar Card */}
      <Card>
        <CardHeader>
          <CardTitle>Ảnh Đại Diện</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                {displayName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Sections */}
      {sections.map((section, index) => (
        <DetailSectionCard key={index} section={section} />
      ))}
    </div>
  )
}

