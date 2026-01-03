/**
 * Excel Column Type Definitions
 * 
 * Single Source of Truth cho tất cả types liên quan đến Excel import/export
 * 
 * @description
 * Định nghĩa các kiểu dữ liệu cột trong Excel:
 * - 'text': Văn bản/chuỗi ký tự (phổ biến nhất)
 * - 'number': Số (integer hoặc decimal)
 * - 'date': Ngày tháng
 * - 'datetime': Ngày giờ (date + time)
 * - 'email': Địa chỉ email (có validation)
 * - 'phone': Số điện thoại (có validation)
 */
export type ExcelColumnType = 'text' | 'number' | 'date' | 'datetime' | 'email' | 'phone'

