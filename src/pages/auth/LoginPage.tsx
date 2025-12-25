"use client"

import { useEffect, useState, Suspense } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { LoginForm } from "@/components/auth/LoginForm"
import { useAuthStore } from "@/shared/stores/auth-store"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

// Tách component sử dụng useSearchParams ra riêng
function LoginContent() {
  const navigate = useNavigate()
  const searchParams = useSearchParams()
  const { user, setUser, loading, setLoading } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setLoading(false)
        setIsChecking(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
      setIsChecking(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setLoading])

  useEffect(() => {
    // Nếu đã đăng nhập, redirect về trang được yêu cầu hoặc trang chủ
    if (!isChecking && !loading && user) {
      const redirectTo = searchParams.get("redirectedFrom") || "/"
      navigate(redirectTo, { replace: true })
    }
  }, [user, loading, isChecking, navigate, searchParams])

  // Loading state - theo shadcn UI style
  if (isChecking || loading) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-foreground">Đang kiểm tra...</p>
            <p className="text-xs text-muted-foreground">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </div>
    )
  }

  // Không hiển thị form nếu đã đăng nhập (sẽ redirect)
  if (user) {
    return null
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <img
              src="https://duraval.vn/wp-content/uploads/2024/08/logoduraval-png-khong-chu-e1724896799526-1024x370.png"
              alt="Duraval Logo"
              className="h-10 w-auto object-contain"
            />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://htmgroup.vn/upload//galleries/thuong-hieu-thiet-bi-nha-bep-cao-cap-hien-nay-05-A261718597410.webp"
          alt="Office"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
        <div className="absolute bottom-10 left-10 right-10 z-20 text-white">
          <h2 className="text-3xl font-bold mb-4">Quản trị doanh nghiệp toàn diện</h2>
          <p className="text-lg opacity-90">
            Hệ thống ERP mạnh mẽ, linh hoạt giúp tối ưu hóa quy trình vận hành và nâng cao hiệu suất làm việc.
          </p>
        </div>
      </div>
    </div>
  )
}

// Component chính với Suspense boundary
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-svh bg-background">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">Đang tải...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
