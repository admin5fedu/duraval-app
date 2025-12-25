import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Tính toán parent route từ pathname dựa trên breadcrumb logic
 * Đây là utility function chung để xử lý navigation back thông minh
 * 
 * Ví dụ:
 * - /he-thong/danh-sach-nhan-su/123/sua → /he-thong/danh-sach-nhan-su/123 (detail)
 * - /he-thong/danh-sach-nhan-su/123 → /he-thong/danh-sach-nhan-su (list)
 * - /he-thong/danh-sach-nhan-su/them-moi → /he-thong/danh-sach-nhan-su (list)
 * - /he-thong/phong-ban → /he-thong (parent module)
 * - /he-thong → / (root)
 * 
 * @param pathname - Đường dẫn hiện tại (ví dụ: "/he-thong/danh-sach-nhan-su/123")
 * @returns Parent route hoặc null nếu không tính được
 */
export function getParentRouteFromBreadcrumb(pathname: string): string | null {
    const segments = pathname.split('/').filter(Boolean)
    
    if (segments.length === 0) {
        return null
    }
    
    // Nếu chỉ có 1 segment (ví dụ: /he-thong), quay về trang chủ
    if (segments.length === 1) {
        return '/'
    }
    
    // Nếu segment cuối là "sua" (form edit), quay về detail (loại bỏ "sua")
    if (segments[segments.length - 1] === 'sua') {
        return '/' + segments.slice(0, -1).join('/')
    }
    
    // Nếu segment cuối là "them-moi" (form create), quay về list (loại bỏ "them-moi")
    if (segments[segments.length - 1] === 'them-moi') {
        return '/' + segments.slice(0, -1).join('/')
    }
    
    // Nếu segment cuối là số (ID), quay về list (loại bỏ ID)
    const lastSegment = segments[segments.length - 1]
    if (/^\d+$/.test(lastSegment)) {
        return '/' + segments.slice(0, -1).join('/')
    }
    
    // Mặc định: loại bỏ segment cuối cùng
    return '/' + segments.slice(0, -1).join('/')
}

