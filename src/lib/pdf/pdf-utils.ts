/**
 * PDF Export Utilities
 * 
 * Professional PDF export using jsPDF and jsPDF AutoTable
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface PDFExportOptions {
    title?: string
    subtitle?: string
    filename?: string
    orientation?: 'portrait' | 'landscape'
    format?: 'a4' | 'letter'
    showHeader?: boolean
    showFooter?: boolean
    headerText?: string
    footerText?: string
}

/**
 * Generate filename with timestamp
 */
export function generatePDFFilename(prefix: string = 'export'): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    
    return `${prefix}_${year}${month}${day}_${hours}${minutes}${seconds}.pdf`
}

/**
 * Create PDF document with table
 */
export function createPDFTable<TData extends Record<string, any>>(
    headers: string[],
    rows: any[][],
    options: PDFExportOptions = {}
): jsPDF {
    const {
        title = 'Báo Cáo',
        subtitle,
        orientation = 'portrait',
        format = 'a4',
        showHeader = true,
        showFooter = true,
        headerText,
        footerText,
    } = options

    const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format,
    })

    // Add title
    if (title) {
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text(title, 14, 20)
    }

    // Add subtitle
    if (subtitle) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        doc.text(subtitle, 14, title ? 28 : 20)
        doc.setTextColor(0, 0, 0)
    }

    // Calculate start Y position
    const startY = subtitle ? 35 : title ? 30 : 20

    // Add table
    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: startY,
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [224, 224, 224],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
        },
        margin: { top: startY, right: 14, bottom: 20, left: 14 },
        didDrawPage: (data) => {
            // Header
            if (showHeader && headerText) {
                doc.setFontSize(10)
                doc.setFont('helvetica', 'normal')
                doc.text(headerText, data.settings.margin.left, 10)
            }

            // Footer
            if (showFooter) {
                const pageCount = doc.getNumberOfPages()
                const footer = footerText || `Trang ${data.pageNumber} / ${pageCount}`
                doc.setFontSize(8)
                doc.setFont('helvetica', 'normal')
                doc.setTextColor(100, 100, 100)
                doc.text(
                    footer,
                    data.settings.margin.left,
                    doc.internal.pageSize.height - 10
                )
                doc.setTextColor(0, 0, 0)
            }
        },
    })

    return doc
}

/**
 * Download PDF document
 */
export function downloadPDF(doc: jsPDF, filename: string): void {
    // Sanitize filename
    const sanitizedFilename = filename
        .replace(/[\\\/\?\*\[\]:]/g, '_')
        .substring(0, 255)

    doc.save(sanitizedFilename)
}

/**
 * Export data to PDF
 */
export function exportToPDF<TData extends Record<string, any>>(
    headers: string[],
    rows: any[][],
    options: PDFExportOptions = {}
): void {
    const doc = createPDFTable(headers, rows, options)
    const filename = options.filename || generatePDFFilename('export')
    downloadPDF(doc, filename)
}

