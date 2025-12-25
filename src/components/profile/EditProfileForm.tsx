import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Loader2, User } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/shared/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { AvatarUpload } from './AvatarUpload'

// Schema validation
const editProfileSchema = z.object({
  displayName: z.string().min(1, 'Vui lòng nhập tên hiển thị'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{10,11}$/.test(val),
      'Số điện thoại không hợp lệ'
    ),
})

type EditProfileFormValues = z.infer<typeof editProfileSchema>

interface EditProfileFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function EditProfileForm({ onSuccess, onCancel }: EditProfileFormProps) {
  const { user, refreshUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.user_metadata?.avatar_url || null
  )

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      displayName: user?.user_metadata?.display_name || user?.email?.split('@')[0] || '',
      phone: user?.phone || '',
    },
  })

  const onSubmit = async (data: EditProfileFormValues) => {
    if (!user) {
      toast.error('Không tìm thấy thông tin người dùng')
      return
    }

    setIsLoading(true)

    try {
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          display_name: data.displayName,
          avatar_url: avatarUrl,
        },
        phone: data.phone || undefined,
      })

      if (updateError) {
        throw updateError
      }

      // Refresh user data
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

            {/* Display Name */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên hiển thị</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên hiển thị"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Tên này sẽ được hiển thị trong hồ sơ của bạn
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email (read-only) */}
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input value={user?.email || ''} disabled />
              </FormControl>
              <FormDescription>
                Email không thể thay đổi. Liên hệ quản trị viên nếu cần thay đổi.
              </FormDescription>
            </FormItem>

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
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

