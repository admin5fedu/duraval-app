/**
 * Column Name Mapper
 * 
 * Maps database field names to Vietnamese display names with proper diacritics
 */

/**
 * Mapping from database field names to Vietnamese display names
 */
const COLUMN_NAME_MAP: Record<string, string> = {
  // Nhân sự
  ma_nhan_vien: 'Mã nhân viên',
  ho_ten: 'Họ và tên',
  email_cong_ty: 'Email công ty',
  email_ca_nhan: 'Email cá nhân',
  so_dien_thoai: 'Số điện thoại',
  phong_ban: 'Phòng ban',
  bo_phan: 'Bộ phận',
  nhom: 'Nhóm',
  chuc_vu: 'Chức vụ',
  gioi_tinh: 'Giới tính',
  hon_nhan: 'Hôn nhân',
  tinh_trang: 'Tình trạng',
  ngay_sinh: 'Ngày sinh',
  ngay_thu_viec: 'Ngày thử việc',
  ngay_chinh_thuc: 'Ngày chính thức',
  ngay_nghi_viec: 'Ngày nghỉ việc',
  ten_cap_bac: 'Tên cấp bậc',
  cap_bac: 'Cấp bậc',
  cap_bac_id: 'ID cấp bậc',
  chuc_vu_id: 'ID chức vụ',
  phong_ban_id: 'ID phòng ban',
  avatar_url: 'Ảnh đại diện',
  ghi_chu: 'Ghi chú',
  tg_tao: 'Thời gian tạo',
  tg_cap_nhat: 'Thời gian cập nhật',
  
  // Common fields
  id: 'ID',
  ten: 'Tên',
  mo_ta: 'Mô tả',
  trang_thai: 'Trạng thái',
  ngay_tao: 'Ngày tạo',
  ngay_cap_nhat: 'Ngày cập nhật',
  nguoi_tao: 'Người tạo',
  nguoi_cap_nhat: 'Người cập nhật',
  
  // Company/Organization
  ten_cong_ty: 'Tên công ty',
  ma_cong_ty: 'Mã công ty',
  dia_chi: 'Địa chỉ',
  dien_thoai: 'Điện thoại',
  fax: 'Fax',
  website: 'Website',
  ma_so_thue: 'Mã số thuế',
  
  // Dates
  ngay_bat_dau: 'Ngày bắt đầu',
  ngay_ket_thuc: 'Ngày kết thúc',
  thoi_gian: 'Thời gian',
  
  // Financial
  gia_tri: 'Giá trị',
  so_tien: 'Số tiền',
  tong_tien: 'Tổng tiền',
  thanh_tien: 'Thành tiền',
  
  // Other common fields
  loai: 'Loại',
  danh_muc: 'Danh mục',
  don_vi: 'Đơn vị',
  so_luong: 'Số lượng',
  don_gia: 'Đơn giá',
  
  // Additional common patterns
  ten_phong_ban: 'Tên phòng ban',
  ten_chuc_vu: 'Tên chức vụ',
  ten_cap_bac: 'Tên cấp bậc',
  ten_bo_phan: 'Tên bộ phận',
  ten_nhom: 'Tên nhóm',
}

/**
 * Common word mappings for Vietnamese
 */
const WORD_MAP: Record<string, string> = {
  ten: 'Tên',
  ma: 'Mã',
  so: 'Số',
  ngay: 'Ngày',
  thang: 'Tháng',
  nam: 'Năm',
  gio: 'Giờ',
  phut: 'Phút',
  gia: 'Giá',
  tien: 'Tiền',
  tong: 'Tổng',
  thanh: 'Thành',
  dien: 'Điện',
  thoai: 'Thoại',
  ban: 'Bàn',
  phong: 'Phòng',
  chuc: 'Chức',
  vu: 'Vụ',
  cap: 'Cấp',
  bac: 'Bậc',
  tinh: 'Tình',
  trang: 'Trạng',
  thai: 'Thái',
  gioi: 'Giới',
  tinh: 'Tính',
  hon: 'Hôn',
  nhan: 'Nhân',
  sinh: 'Sinh',
  ghi: 'Ghi',
  chu: 'Chú',
  thu: 'Thử',
  viec: 'Việc',
  chinh: 'Chính',
  thuc: 'Thức',
  nghi: 'Nghỉ',
  ca: 'Cá',
  cong: 'Công',
  ty: 'Ty',
  avatar: 'Ảnh',
  url: 'URL',
  tg: 'TG',
  tao: 'Tạo',
  cap: 'Cập',
  nhat: 'Nhật',
  dia: 'Địa',
  chi: 'Chỉ',
  mo: 'Mô',
  ta: 'Tả',
  don: 'Đơn',
  vi: 'Vị',
  luong: 'Lượng',
  danh: 'Danh',
  muc: 'Mục',
  loai: 'Loại',
}

/**
 * Convert field name to Vietnamese display name with diacritics
 * 
 * @param fieldName - Database field name (e.g., "so_dien_thoai")
 * @returns Vietnamese display name (e.g., "Số điện thoại")
 */
export function getColumnDisplayName(fieldName: string): string {
  // Check if we have a direct mapping
  if (COLUMN_NAME_MAP[fieldName]) {
    return COLUMN_NAME_MAP[fieldName]
  }
  
  // Try to find partial match (for fields like "ten_phong_ban" -> "Tên phòng ban")
  const parts = fieldName.split('_')
  const mappedParts = parts.map(part => {
    // Check if this part has a mapping in WORD_MAP
    if (WORD_MAP[part]) {
      return WORD_MAP[part]
    }
    
    // Special handling for common patterns
    if (part === 'id') return 'ID'
    if (part === 'url') return 'URL'
    if (part === 'tg') return 'TG'
    
    // Default: capitalize first letter (for unknown words)
    return part.charAt(0).toUpperCase() + part.slice(1)
  })
  
  // Join parts with spaces
  return mappedParts.join(' ')
}

/**
 * Add custom column name mappings
 */
export function addColumnNameMapping(mappings: Record<string, string>): void {
  Object.assign(COLUMN_NAME_MAP, mappings)
}

/**
 * Get all column name mappings
 */
export function getColumnNameMappings(): Record<string, string> {
  return { ...COLUMN_NAME_MAP }
}

