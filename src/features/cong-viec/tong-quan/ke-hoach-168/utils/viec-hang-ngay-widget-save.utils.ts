import { supabase } from "@/lib/supabase"
import type { CongViec } from "../types/viec-hang-ngay-widget.types"
import type { ViecHangNgay } from "../../viec-hang-ngay/schema"

const TABLE_NAME = "cong_viec_viec_hang_ngay"

/**
 * Query record ID cho ngày và nhân viên
 */
export async function queryRecordId(maNhanVien: number, ngayBaoCao: string): Promise<number | null> {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) return null

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || ''
        const queryUrl = `${supabaseUrl}/rest/v1/${TABLE_NAME}?ma_nhan_vien=eq.${maNhanVien}&ngay_bao_cao=eq.${ngayBaoCao}&select=id&limit=1`
        
        const queryResponse = await fetch(queryUrl, {
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${session.access_token}`,
            }
        })

        if (queryResponse.ok) {
            const queryData = await queryResponse.json()
            if (queryData && queryData.length > 0) {
                return queryData[0].id
            }
        }
        return null
    } catch (error) {
        console.error("Error querying record ID:", error)
        return null
    }
}

/**
 * Save với keepalive cho beforeunload/unmount
 */
export async function saveWithKeepalive(
    dataToSave: CongViec[],
    maNhanVien: number,
    selectedDate: string,
    currentRecord: ViecHangNgay | null
): Promise<void> {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
            console.warn("No session token available for keepalive save")
            return
        }

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || ''

        // Kiểm tra currentRecord có khớp với selectedDate không
        let recordId: number | null = null
        if (currentRecord?.id && currentRecord.ngay_bao_cao === selectedDate) {
            recordId = currentRecord.id
        } else {
            recordId = await queryRecordId(maNhanVien, selectedDate)
        }

        if (recordId) {
            // Update existing record
            const url = `${supabaseUrl}/rest/v1/${TABLE_NAME}?id=eq.${recordId}&select=*`
            await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${session.access_token}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({ chi_tiet_cong_viec: dataToSave }),
                keepalive: true
            })
        } else {
            // Create new record
            const url = `${supabaseUrl}/rest/v1/${TABLE_NAME}?select=*`
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${session.access_token}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    ma_nhan_vien: maNhanVien,
                    ngay_bao_cao: selectedDate,
                    chi_tiet_cong_viec: dataToSave
                }),
                keepalive: true
            })

            // Xử lý 409 Conflict - record đã tồn tại, thử update thay vì create
            if (response.status === 409) {
                const existingId = await queryRecordId(maNhanVien, selectedDate)
                if (existingId) {
                    const patchUrl = `${supabaseUrl}/rest/v1/${TABLE_NAME}?id=eq.${existingId}&select=*`
                    await fetch(patchUrl, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': supabaseAnonKey,
                            'Authorization': `Bearer ${session.access_token}`,
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify({ chi_tiet_cong_viec: dataToSave }),
                        keepalive: true
                    })
                }
            } else if (!response.ok) {
                throw new Error(`Failed to save: ${response.status} ${response.statusText}`)
            }
        }
    } catch (error) {
        console.error("Error saving with keepalive:", error)
    }
}

