/**
 * Profile PDF Export
 * Exports employee profile to PDF format
 */

import jsPDF from 'jspdf'
import { NhanSu } from '@/features/he-thong/nhan-su/danh-sach-nhan-su/schema'
import type { User } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export async function exportProfileToPDF(employee: NhanSu, _user: User): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin
  let yPos = margin

  // Helper function to add new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage()
      yPos = margin
    }
  }

  // Title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('HỒ SƠ NHÂN VIÊN', pageWidth / 2, yPos, { align: 'center' })
  yPos += 10

  // Subtitle
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(
    `Xuất ngày: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  )
  doc.setTextColor(0, 0, 0)
  yPos += 15

  // Helper function to add field
  const addField = (label: string, value: string | number | null | undefined, x: number = margin) => {
    if (value === null || value === undefined || value === '') return

    checkNewPage(8)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`${label}:`, x, yPos)
    
    doc.setFont('helvetica', 'normal')
    const valueStr = String(value)
    const maxWidth = contentWidth - 40
    
    // Split long text into multiple lines
    const lines = doc.splitTextToSize(valueStr, maxWidth)
    doc.text(lines, x + 40, yPos)
    
    yPos += lines.length * 5 + 3
  }

  // Section: Thông Tin Cơ Bản
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  checkNewPage(10)
  doc.text('THÔNG TIN CƠ BẢN', margin, yPos)
  yPos += 8
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 5

  addField('Mã Nhân Viên', employee.ma_nhan_vien)
  addField('Họ và Tên', employee.ho_ten)
  addField('Email Công Ty', employee.email_cong_ty)
  addField('Email Cá Nhân', employee.email_ca_nhan)
  addField('Số Điện Thoại', employee.so_dien_thoai)
  addField('Giới Tính', employee.gioi_tinh)
  addField('Ngày Sinh', employee.ngay_sinh ? format(new Date(employee.ngay_sinh), 'dd/MM/yyyy', { locale: vi }) : null)
  addField('Tình Trạng Hôn Nhân', employee.hon_nhan)

  yPos += 5

  // Section: Công Việc & Chức Vụ
  checkNewPage(15)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('CÔNG VIỆC & CHỨC VỤ', margin, yPos)
  yPos += 8
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 5

  addField('Phòng Ban', employee.phong_ban)
  addField('Bộ Phận', employee.bo_phan)
  addField('Nhóm', employee.nhom)
  addField('Chức Vụ', employee.chuc_vu)
  addField('Cấp Bậc', employee.ten_cap_bac)
  addField('Tình Trạng', employee.tinh_trang)

  yPos += 5

  // Section: Thời Gian Làm Việc
  checkNewPage(15)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('THỜI GIAN LÀM VIỆC', margin, yPos)
  yPos += 8
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 5

  addField('Ngày Thử Việc', employee.ngay_thu_viec ? format(new Date(employee.ngay_thu_viec), 'dd/MM/yyyy', { locale: vi }) : null)
  addField('Ngày Chính Thức', employee.ngay_chinh_thuc ? format(new Date(employee.ngay_chinh_thuc), 'dd/MM/yyyy', { locale: vi }) : null)
  addField('Ngày Nghỉ Việc', employee.ngay_nghi_viec ? format(new Date(employee.ngay_nghi_viec), 'dd/MM/yyyy', { locale: vi }) : null)

  // Ghi Chú
  if (employee.ghi_chu) {
    yPos += 5
    checkNewPage(15)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('GHI CHÚ', margin, yPos)
    yPos += 8
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 5

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const ghiChuLines = doc.splitTextToSize(employee.ghi_chu, contentWidth)
    ghiChuLines.forEach((line: string) => {
      checkNewPage(6)
      doc.text(line, margin, yPos)
      yPos += 5
    })
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(
      `Trang ${i} / ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
    doc.text(
      `Hệ thống Quản lý Nhân sự - ${format(new Date(), 'dd/MM/yyyy', { locale: vi })}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    )
  }

  // Generate filename
  const filename = `Ho_so_${employee.ho_ten?.replace(/\s+/g, '_') || 'nhan_vien'}_${format(new Date(), 'yyyyMMdd', { locale: vi })}.pdf`

  // Save PDF
  doc.save(filename)
}

