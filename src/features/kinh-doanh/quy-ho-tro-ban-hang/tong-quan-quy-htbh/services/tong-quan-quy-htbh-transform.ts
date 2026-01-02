import { RawQuyData, RawDoanhSoData, TongQuanQuyHTBHData } from "../types"

/**
 * Transform raw data thành pivot format cho bảng tổng quan
 */
export class TongQuanQuyHTBHTransform {
  /**
   * Transform raw data thành pivot format
   */
  static transform(
    quyData: RawQuyData[],
    doanhSoData: RawDoanhSoData[]
  ): TongQuanQuyHTBHData[] {
    // Tạo map để join dữ liệu theo nhan_vien_id, nam, thang
    const dataMap = new Map<string, { quy?: RawQuyData; doanhSo?: RawDoanhSoData }>()

    // Index quỹ data
    quyData.forEach((item) => {
      const key = `${item.nhan_vien_id}_${item.nam}_${item.thang}`
      const existing = dataMap.get(key) || {}
      dataMap.set(key, { ...existing, quy: item })
    })

    // Index doanh số data
    doanhSoData.forEach((item) => {
      const key = `${item.nhan_vien_id}_${item.nam}_${item.thang}`
      const existing = dataMap.get(key) || {}
      dataMap.set(key, { ...existing, doanhSo: item })
    })

    // Group by nhân viên
    const employeeMap = new Map<number, TongQuanQuyHTBHData>()

    // Process tất cả các keys để đảm bảo có đủ dữ liệu
    const allEmployeeIds = new Set<number>()
    quyData.forEach((item) => allEmployeeIds.add(item.nhan_vien_id))
    doanhSoData.forEach((item) => allEmployeeIds.add(item.nhan_vien_id))

    // Initialize cho mỗi nhân viên
    allEmployeeIds.forEach((nhanVienId) => {
      const quyItem = quyData.find((q) => q.nhan_vien_id === nhanVienId)
      const doanhSoItem = doanhSoData.find((d) => d.nhan_vien_id === nhanVienId)
      const tenNhanVien = quyItem?.ten_nhan_vien || doanhSoItem?.ten_nhan_vien || ""

      employeeMap.set(nhanVienId, {
        nhan_vien_id: nhanVienId,
        ten_nhan_vien: tenNhanVien,
        phong_id: quyItem?.phong_id ?? null,
        ma_phong: quyItem?.ma_phong ?? null,
        nhom_id: quyItem?.nhom_id ?? null,
        ma_nhom: quyItem?.ma_nhom ?? null,
        months: {},
        quarters: {
          1: { budget: 0, actual: 0, balance: 0, sales: 0 },
          2: { budget: 0, actual: 0, balance: 0, sales: 0 },
          3: { budget: 0, actual: 0, balance: 0, sales: 0 },
          4: { budget: 0, actual: 0, balance: 0, sales: 0 },
        },
        total: {
          budget: 0,
          actual: 0,
          balance: 0,
          sales: 0,
        },
      })
    })

    // Get năm từ data (nếu có)
    const nam = quyData[0]?.nam || doanhSoData[0]?.nam || new Date().getFullYear()

    // Process từng tháng
    for (let thang = 1; thang <= 12; thang++) {
      allEmployeeIds.forEach((nhanVienId) => {
        const employee = employeeMap.get(nhanVienId)!
        const key = `${nhanVienId}_${nam}_${thang}`
        const combined = dataMap.get(key)

        const budget = combined?.quy?.so_tien_quy ?? 0
        const actual = combined?.quy?.da_dung ?? 0
        const balance = combined?.quy?.con_du ?? (budget - actual)
        const sales = combined?.doanhSo?.doanh_thu ?? 0

        // Set month data
        employee.months[thang] = {
          budget,
          actual,
          balance,
          sales,
        }

        // Update quarter
        const quarter = Math.ceil(thang / 3) as 1 | 2 | 3 | 4
        employee.quarters[quarter].budget += budget
        employee.quarters[quarter].actual += actual
        employee.quarters[quarter].balance += balance
        employee.quarters[quarter].sales += sales

        // Update total
        employee.total.budget += budget
        employee.total.actual += actual
        employee.total.balance += balance
        employee.total.sales += sales
      })
    }

    return Array.from(employeeMap.values()).sort((a, b) => 
      a.ten_nhan_vien.localeCompare(b.ten_nhan_vien)
    )
  }
}

