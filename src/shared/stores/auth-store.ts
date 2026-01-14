import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { NhanSu } from '@/features/he-thong/nhan-su/danh-sach-nhan-su/types/nhan-su-types'
import { NhanSuAPI } from '@/features/he-thong/nhan-su/danh-sach-nhan-su/services/nhan-su.api'
import { PhanQuyen } from '@/features/he-thong/thiet-lap/phan-quyen/schema'
import { PhanQuyenAPI } from '@/features/he-thong/thiet-lap/phan-quyen/services/phan-quyen.api'

// Cache employee profile để tránh fetch nhiều lần
const employeeCache = new Map<string, { data: NhanSu; timestamp: number }>()
const EMPLOYEE_CACHE_TTL = 5 * 60 * 1000 // 5 phút

interface AuthState {
  user: User | null
  loading: boolean
  employee: NhanSu | null
  employeeLoading: boolean
  permissions: PhanQuyen[]
  permissionsLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setEmployee: (employee: NhanSu | null) => void
  setEmployeeLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  fetchEmployee: (email: string) => Promise<void>
  refreshEmployee: () => Promise<void>
  fetchPermissions: (chucVuId: number) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  employee: null,
  employeeLoading: false,
  permissions: [],
  permissionsLoading: false,
  setUser: (user) => {
    set({ user })
    // Auto-fetch employee when user changes
    if (user?.email) {
      get().fetchEmployee(user.email)
    } else {
      set({ employee: null, permissions: [] })
    }
  },
  setLoading: (loading) => set({ loading }),
  setEmployee: (employee) => set({ employee }),
  setEmployeeLoading: (loading) => set({ employeeLoading: loading }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, employee: null, permissions: [] })
    // Clear cache
    employeeCache.clear()
  },
  refreshUser: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      set({ user })
      // Auto-fetch employee if user exists
      if (user?.email) {
        await get().fetchEmployee(user.email)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  },
  fetchEmployee: async (email: string) => {
    // Check cache trước
    const cached = employeeCache.get(email)
    if (cached && Date.now() - cached.timestamp < EMPLOYEE_CACHE_TTL) {
      set({ employee: cached.data, employeeLoading: false })

      // Load permissions from cache or fetch new if needed
      // Note: Permissions depend on employee.chuc_vu_id, so we fetch them after getting employee data
      if (cached.data.chuc_vu_id) {
        get().fetchPermissions(cached.data.chuc_vu_id)
      }
      return
    }

    set({ employeeLoading: true })
    try {
      const employeeData = await NhanSuAPI.getByEmail(email)

      if (employeeData) {
        set({ employee: employeeData, employeeLoading: false })
        // Cache employee data
        employeeCache.set(email, {
          data: employeeData,
          timestamp: Date.now(),
        })
        // Cleanup cache cũ (giữ tối đa 50 entries)
        if (employeeCache.size > 50) {
          const firstKey = employeeCache.keys().next().value
          if (firstKey) {
            employeeCache.delete(firstKey)
          }
        }

        // Fetch permissions if has chuc_vu_id
        if (employeeData.chuc_vu_id) {
          await get().fetchPermissions(employeeData.chuc_vu_id)
        } else {
          set({ permissions: [] })
        }
      } else {
        set({ employee: null, employeeLoading: false, permissions: [] })
      }
    } catch (error: any) {
      // Xử lý rate limit - sử dụng cached data nếu có
      if (error?.status === 429 || error?.code === 'over_request_rate_limit') {
        console.warn('Rate limit reached when fetching employee profile')
        if (cached) {
          set({ employee: cached.data, employeeLoading: false })
          if (cached.data.chuc_vu_id) {
            get().fetchPermissions(cached.data.chuc_vu_id)
          }
        } else {
          set({ employee: null, employeeLoading: false, permissions: [] })
        }
        return
      }
      console.error('Error fetching employee profile:', error)
      // Fallback to cached data if available
      if (cached) {
        set({ employee: cached.data, employeeLoading: false })
        if (cached.data.chuc_vu_id) {
          get().fetchPermissions(cached.data.chuc_vu_id)
        }
      } else {
        set({ employee: null, employeeLoading: false, permissions: [] })
      }
    }
  },
  refreshEmployee: async () => {
    const { user } = get()
    if (user?.email) {
      // Clear cache for this email to force refresh
      employeeCache.delete(user.email)
      await get().fetchEmployee(user.email)
    }
  },
  fetchPermissions: async (chucVuId: number) => {
    set({ permissionsLoading: true })
    try {
      const permissions = await PhanQuyenAPI.getByChucVuId(chucVuId)
      set({ permissions, permissionsLoading: false })
    } catch (error) {
      console.error('Error fetching permissions:', error)
      set({ permissions: [], permissionsLoading: false })
    }
  },
}))
