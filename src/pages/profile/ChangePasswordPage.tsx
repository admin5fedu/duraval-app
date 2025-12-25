import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ChangePasswordForm } from '@/components/change-password/ChangePasswordForm'
import { useAuthStore } from '@/shared/stores/auth-store'

export default function ChangePasswordPage() {
  const { user, loading } = useAuthStore()
  const navigate = useNavigate()

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
          <p className="text-sm font-medium text-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  // Không render nếu chưa đăng nhập (sẽ redirect)
  if (!user) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ChangePasswordForm />
    </div>
  )
}

