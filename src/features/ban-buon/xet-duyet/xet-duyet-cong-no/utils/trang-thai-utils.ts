/**
 * Utility functions for managing trang_thai (status) logic
 */

export interface AuditLogItem {
  action: string
  user: string
  user_id: number | null
  time: string
  note?: string
  level?: "quan_ly" | "bgd"
}

export interface AuditLog {
  history: AuditLogItem[]
}

/**
 * Calculate trang_thai based on quan_ly_duyet and bgd_duyet
 * Note: "Đã hủy" không được tính từ quan_ly_duyet/bgd_duyet, mà được set trực tiếp khi hủy
 */
export function calculateTrangThai(
  quanLyDuyet: string | null | undefined,
  bgdDuyet: string | null | undefined,
  trangThaiHienTai?: string | null | undefined
): string {
  // Nếu đã hủy thì giữ nguyên (không tính lại)
  if (trangThaiHienTai === "Đã hủy") {
    return "Đã hủy"
  }
  
  // Nếu BGD đã từ chối → Từ chối (ưu tiên cao nhất)
  if (bgdDuyet === "Từ chối") {
    return "Từ chối"
  }
  
  // Nếu BGD đã đồng ý → Đã duyệt
  if (bgdDuyet === "Đồng ý") {
    return "Đã duyệt"
  }
  
  // Nếu BGD yêu cầu bổ sung → Chờ kiểm tra (trả về)
  if (bgdDuyet === "Yêu cầu bổ sung") {
    return "Chờ kiểm tra"
  }
  
  // Nếu Quản lý đã từ chối → Từ chối
  if (quanLyDuyet === "Từ chối") {
    return "Từ chối"
  }
  
  // Nếu Quản lý yêu cầu bổ sung → Chờ kiểm tra (trả về)
  if (quanLyDuyet === "Yêu cầu bổ sung") {
    return "Chờ kiểm tra"
  }
  
  // Nếu Quản lý đã đồng ý → Chờ duyệt (chờ BGD)
  if (quanLyDuyet === "Đồng ý") {
    return "Chờ duyệt"
  }
  
  // Mặc định: Chưa ai duyệt
  return "Chờ kiểm tra"
}

/**
 * Create audit log entry
 */
export function createAuditLogEntry(
  action: string,
  userId: number | null,
  userName: string,
  note?: string,
  level?: "quan_ly" | "bgd"
): AuditLogItem {
  return {
    action,
    user: userName,
    user_id: userId,
    time: new Date().toISOString(),
    note: note || undefined,
    level: level || undefined,
  }
}

/**
 * Add audit log entry to existing audit log
 */
export function addAuditLog(
  existingLog: AuditLog | null | undefined,
  newEntry: AuditLogItem
): AuditLog {
  const history = existingLog?.history || []
  return {
    history: [...history, newEntry],
  }
}

/**
 * Parse audit log from JSONB field
 */
export function parseAuditLog(auditLog: any): AuditLog | null {
  if (!auditLog) return null
  
  try {
    if (typeof auditLog === 'string') {
      return JSON.parse(auditLog)
    }
    if (typeof auditLog === 'object' && auditLog.history) {
      return auditLog as AuditLog
    }
    return null
  } catch {
    return null
  }
}

