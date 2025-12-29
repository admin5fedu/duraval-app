import type { CongViec } from "../types/viec-hang-ngay-widget.types"
import { DEFAULT_ITEMS_COUNT } from "../constants/viec-hang-ngay-widget.constants"

/**
 * Kiểm tra URL có hợp lệ không (phải bắt đầu bằng http:// hoặc https://)
 */
export function isValidUrl(url: string): boolean {
    try {
        const urlObj = new URL(url)
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
        return false
    }
}

/**
 * Tạo danh sách công việc mặc định
 */
export function createDefaultCongViecList(): CongViec[] {
    return Array.from({ length: DEFAULT_ITEMS_COUNT }, (_, index) => ({
        id: index + 1,
        ke_hoach: '',
        ket_qua: '',
        links: [] as string[]
    }))
}

/**
 * Lọc danh sách công việc để chỉ lấy những item có dữ liệu
 */
export function filterCongViecList(congViecList: CongViec[]): CongViec[] {
    return congViecList.filter(item => 
        item.ke_hoach?.trim() || 
        item.ket_qua?.trim() || 
        (item.links && item.links.length > 0 && item.links.some(link => link.trim()))
    )
}

/**
 * Kiểm tra xem một công việc có dữ liệu không
 */
export function hasCongViecData(item: CongViec): boolean {
    return !!(
        item.ke_hoach?.trim() || 
        item.ket_qua?.trim() || 
        (item.links && item.links.length > 0 && item.links.some(link => link.trim()))
    )
}

