import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, User } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/shared/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { AvatarUpload } from './AvatarUpload'
import { NhanSu } from '@/features/he-thong/nhan-su/danh-sach-nhan-su/schema'
import { NhanSuAPI } from '@/features/he-thong/nhan-su/danh-sach-nhan-su/services/nhan-su.api'

// Schema validation
const editProfileSchema = z.object({
  ho_ten: z.string().min(1, 'Vui lòng nhập họ và tên'),
  so_dien_thoai: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{10,11}$/.test(val),
      'Số điện thoại không hợp lệ'
    ),
  email_ca_nhan: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  ghi_chu: z.string().optional(),
})

type EditProfileFormValues = z.infer<typeof editProfileSchema>

interface EditProfileFormProps {
  employee?: NhanSu | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function EditProfileForm({ employee, onSuccess, onCancel }: EditProfileFormProps) {
  const { user, refreshUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    employee?.avatar_url || user?.user_metadata?.avatar_url || null
  )

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      ho_ten: employee?.ho_ten || user?.user_metadata?.display_name || user?.email?.split('@')[0] || '',
      so_dien_thoai: employee?.so_dien_thoai || user?.phone || '',
      email_ca_nhan: employee?.email_ca_nhan || '',
      ghi_chu: employee?.ghi_chu || '',
    },
  })

  // Update form when employee changes
  useEffect(() => {
    if (employee) {
      form.reset({
        ho_ten: employee.ho_ten || '',
        so_dien_thoai: employee.so_dien_thoai || '',
        email_ca_nhan: employee.email_ca_nhan || '',
        ghi_chu: employee.ghi_chu || '',
      })
      setAvatarUrl(employee.avatar_url || null)
    }
  }, [employee, form])

  const onSubmit = async (data: EditProfileFormValues) => {
    if (!user) {
      toast.error('Không tìm thấy thông tin người dùng')
      return
    }

    setIsLoading(true)

    try {
      // If employee exists, update var_nhan_su
      if (employee?.ma_nhan_vien) {
        const updateData = {
          ho_ten: data.ho_ten,
          so_dien_thoai: data.so_dien_thoai || null,
          email_ca_nhan: data.email_ca_nhan || null,
          ghi_chu: data.ghi_chu || null,
          avatar_url: avatarUrl,
        }

        await NhanSuAPI.update(employee.ma_nhan_vien, updateData)
      }

      // Also update user metadata for consistency
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          display_name: data.ho_ten,
          avatar_url: avatarUrl,
        },
        phone: data.so_dien_thoai || undefined,
      })

      if (updateError) {
        console.warn('Warning updating user metadata:', updateError)
        // Don't throw, as var_nhan_su update succeeded
      }

      // Refresh both user and employee data
      await refreshUser()

      toast.success('Cập nhật thông tin thành công!')
      onSuccess?.()
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật thông tin')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Chỉnh sửa thông tin</CardTitle>
            <CardDescription>
              Cập nhật thông tin cá nhân và ảnh đại diện của bạn
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex justify-center">
              <AvatarUpload
                value={avatarUrl}
                onChange={setAvatarUrl}
                disabled={isLoading}
                size="lg"
              />
            </div>

            {/* Họ và Tên */}
            <FormField
              control={form.control}
              name="ho_ten"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và Tên *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập họ và tên"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Họ và tên đầy đủ của bạn
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Công Ty (read-only) */}
            <FormItem>
              <FormLabel>Email Công Ty</FormLabel>
              <FormControl>
                <Input value={employee?.email_cong_ty || user?.email || ''} disabled />
              </FormControl>
              <FormDescription>
                Email công ty không thể thay đổi. Liên hệ quản trị viên nếu cần thay đổi.
              </FormDescription>
            </FormItem>

            {/* Email Cá Nhân */}
            <FormField
              control={form.control}
              name="email_ca_nhan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Cá Nhân</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Nhập email cá nhân"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Email cá nhân để liên hệ (tùy chọn)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Số Điện Thoại */}
            <FormField
              control={form.control}
              name="so_dien_thoai"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số Điện Thoại</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Số điện thoại để liên hệ (tùy chọn)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ghi Chú */}
            <FormField
              control={form.control}
              name="ghi_chu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi Chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập ghi chú (nếu có)"
                      disabled={isLoading}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ghi chú cá nhân (tùy chọn)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

