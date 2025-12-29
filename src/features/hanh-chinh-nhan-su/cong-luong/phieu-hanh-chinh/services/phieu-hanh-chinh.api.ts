import { supabase } from "@/lib/supabase"
import { PhieuHanhChinh } from "../schema"
import type { CreatePhieuHanhChinhInput, UpdatePhieuHanhChinhInput } from "../types"

const TABLE_NAME = "hanh_chinh_phieu_hanh_chinh"

// Các giá trị ca hợp lệ theo constraint database
const ALLOWED_CA_VALUES = ["Sáng", "Chiều", "Tối", "Cả ngày"] as const

/**
 * Normalize và validate giá trị ca
 * @param ca - Giá trị ca cần normalize
 * @returns Giá trị ca đã được normalize (trim, validate) hoặc null
 * @throws Error nếu giá trị không hợp lệ
 */
function normalizeAndValidateCa(ca: string | null | undefined): string | null {
    // Nếu ca là null hoặc undefined, trả về null
    if (!ca) {
        return null
    }

    // Trim và kiểm tra empty string
    const trimmedCa = ca.trim()
    if (trimmedCa === "") {
        return null
    }

    // Kiểm tra giá trị có nằm trong danh sách cho phép không
    if (!ALLOWED_CA_VALUES.includes(trimmedCa as any)) {
        throw new Error(
            `Giá trị ca "${trimmedCa}" không hợp lệ. Chỉ chấp nhận các giá trị: ${ALLOWED_CA_VALUES.join(", ")}.`
        )
    }

    return trimmedCa
}

/**
 * API service for Phiếu Hành Chính
 * Handles all Supabase operations
 */
export class PhieuHanhChinhAPI {
    /**
     * Get all phiếu hành chính
     */
    static async getAll(): Promise<PhieuHanhChinh[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("ngay", { ascending: false })
            .order("tg_tao", { ascending: false })

        if (error) {
            console.error("Lỗi khi tải danh sách phiếu hành chính:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        // Get unique nguoi_tao_id values
        const nguoiTaoIds = Array.from(
            new Set(
                data
                    .map((item: any) => item.nguoi_tao_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        // Fetch nhan su data for these IDs (nguoi_tao_id = ma_nhan_vien)
        let nguoiTaoMap = new Map<number, { ma_nhan_vien: number; ho_ten: string }>()
        if (nguoiTaoIds.length > 0) {
            const { data: nhanSuData, error: nhanSuError } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .in("ma_nhan_vien", nguoiTaoIds)

            if (nhanSuError) {
                console.warn("Lỗi khi tải thông tin nhân sự:", nhanSuError)
            } else {
                nguoiTaoMap = new Map(
                    (nhanSuData || []).map((ns: any) => [ns.ma_nhan_vien, ns])
                )
            }
        }

        // Get unique combinations of loai_phieu and ma_phieu to fetch ten_nhom_phieu
        const phieuKeys = Array.from(
            new Set(
                data
                    .map((item: any) => ({
                        loai_phieu: item.loai_phieu,
                        ma_phieu: item.ma_phieu,
                    }))
                    .filter((key) => key.loai_phieu && key.ma_phieu)
                    .map((key) => `${key.loai_phieu}|||${key.ma_phieu}`)
            )
        )

        // Fetch nhom phieu data to get ten_nhom_phieu
        let nhomPhieuMap = new Map<string, string>() // key: "loai_phieu|||ma_phieu" -> ten_nhom_phieu
        if (phieuKeys.length > 0) {
            // Get all unique loai_phieu values
            const uniqueLoaiPhieu = Array.from(
                new Set(phieuKeys.map((key) => key.split("|||")[0]))
            )
            
            // Get all unique ma_phieu values
            const uniqueMaPhieu = Array.from(
                new Set(phieuKeys.map((key) => key.split("|||")[1]))
            )

            // Fetch nhom phieu where loai_phieu matches and ma_nhom_phieu matches
            const { data: nhomPhieuData, error: nhomPhieuError } = await supabase
                .from("hanh_chinh_nhom_phieu")
                .select("loai_phieu, ma_nhom_phieu, ten_nhom_phieu")
                .in("loai_phieu", uniqueLoaiPhieu)
                .in("ma_nhom_phieu", uniqueMaPhieu)

            if (nhomPhieuError) {
                console.warn("Lỗi khi tải thông tin nhóm phiếu:", nhomPhieuError)
            } else {
                nhomPhieuMap = new Map(
                    (nhomPhieuData || []).map((np: any) => [
                        `${np.loai_phieu}|||${np.ma_nhom_phieu}`,
                        np.ten_nhom_phieu || null,
                    ])
                )
            }
        }

        // Map data to include nguoi_tao_ten and ten_nhom_phieu
        return data.map((item: any) => {
            const nguoiTao = nguoiTaoMap.get(item.nguoi_tao_id)
            const nhomPhieuKey = item.loai_phieu && item.ma_phieu 
                ? `${item.loai_phieu}|||${item.ma_phieu}`
                : null
            const tenNhomPhieu = nhomPhieuKey ? nhomPhieuMap.get(nhomPhieuKey) || null : null
            
            return {
                ...item,
                nguoi_tao_ten: nguoiTao?.ho_ten || null,
                ten_nhom_phieu: tenNhomPhieu,
            }
        }) as PhieuHanhChinh[]
    }

    /**
     * Get phiếu hành chính by ID
     */
    static async getById(id: number): Promise<PhieuHanhChinh | null> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .eq("id", id)
            .single()

        if (error) {
            if (error.code === "PGRST116") {
                // Not found
                return null
            }
            console.error("Lỗi khi tải chi tiết phiếu hành chính:", error)
            throw new Error(error.message)
        }

        if (!data) {
            return null
        }

        // Fetch nguoi_tao info if exists
        let nguoiTaoTen = null
        if (data.nguoi_tao_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .eq("ma_nhan_vien", data.nguoi_tao_id)
                .single()

            if (nhanSuData) {
                nguoiTaoTen = nhanSuData.ho_ten || null
            }
        }

        // Fetch ten_nhom_phieu if loai_phieu and ma_phieu exist
        let tenNhomPhieu = null
        if (data.loai_phieu && data.ma_phieu) {
            const { data: nhomPhieuData } = await supabase
                .from("hanh_chinh_nhom_phieu")
                .select("ten_nhom_phieu")
                .eq("loai_phieu", data.loai_phieu)
                .eq("ma_nhom_phieu", data.ma_phieu)
                .single()

            if (nhomPhieuData) {
                tenNhomPhieu = nhomPhieuData.ten_nhom_phieu || null
            }
        }

        return {
            ...data,
            nguoi_tao_ten: nguoiTaoTen,
            ten_nhom_phieu: tenNhomPhieu,
        } as PhieuHanhChinh
    }

    /**
     * Check if duplicate phiếu hành chính exists
     * 
     * QUY TẮC CHECK TRÙNG:
     * - 1 phiếu được coi là trùng khi giống đồng thời: ngày, người tạo, mã phiếu, ca
     * - Khác 1 trong 4 điều kiện thì KHÔNG bị coi là trùng
     * 
     * Ví dụ:
     * - Cùng ngày, cùng người, cùng mã phiếu, cùng ca → TRÙNG ❌
     * - Cùng ngày, cùng người, cùng mã phiếu, khác ca → KHÔNG TRÙNG ✅
     * - Cùng ngày, cùng người, khác mã phiếu, cùng ca → KHÔNG TRÙNG ✅
     */
    static async checkDuplicatePhieu(
        nguoiTaoId: number | null | undefined,
        ngay: string | Date,
        maPhieu: string,
        ca: string | null | undefined
    ): Promise<boolean> {
        if (!maPhieu || maPhieu.trim() === "") {
            return false
        }

        if (!nguoiTaoId) {
            return false
        }

        // Convert ngay to string format
        const ngayStr = ngay instanceof Date 
            ? ngay.toISOString().split('T')[0] 
            : ngay

        // Normalize ca: trim và chuyển empty string thành null
        const normalizedCa = ca && ca.trim() !== "" ? ca.trim() : null

        // Build query - check TẤT CẢ 4 điều kiện: nguoi_tao_id, ngay, ma_phieu, ca
        // Chỉ coi là trùng khi TẤT CẢ 4 điều kiện đều giống nhau
        let query = supabase
            .from(TABLE_NAME)
            .select("id")
            .eq("nguoi_tao_id", nguoiTaoId)
            .eq("ngay", ngayStr)
            .eq("ma_phieu", maPhieu.trim())

        // Check ca - chỉ coi là trùng khi ca cũng giống nhau
        if (normalizedCa !== null) {
            // Nếu ca có giá trị, check exact match
            query = query.eq("ca", normalizedCa)
        } else {
            // Nếu ca là null, chỉ check các record có ca là null
            query = query.is("ca", null)
        }

        const { data, error } = await query.limit(1)

        if (error) {
            console.error("Lỗi khi kiểm tra phiếu trùng:", error)
            return false
        }

        return (data && data.length > 0) || false
    }

    /**
     * Create new phiếu hành chính
     */
    static async create(input: CreatePhieuHanhChinhInput): Promise<PhieuHanhChinh> {
        // ✅ Check duplicate: cùng người tạo, ngày, mã phiếu, ca
        // Chỉ coi là trùng khi TẤT CẢ 4 điều kiện đều giống nhau
        if (input.ma_phieu && input.nguoi_tao_id) {
            const exists = await this.checkDuplicatePhieu(
                input.nguoi_tao_id,
                input.ngay,
                input.ma_phieu,
                input.ca
            )
            if (exists) {
                const caText = input.ca ? ` ca ${input.ca}` : " (ca không xác định)"
                throw new Error(`Bạn đã tạo phiếu hành chính với mã phiếu "${input.ma_phieu}"${caText} cho ngày này rồi. Vui lòng chọn mã phiếu khác hoặc ca khác.`)
            }
        }

        // ✅ Normalize và validate ca trước khi insert
        let normalizedCa: string | null
        try {
            normalizedCa = normalizeAndValidateCa(input.ca)
            // Log để debug
            console.log("Input ca:", input.ca, "→ Normalized ca:", normalizedCa)
        } catch (error) {
            // Nếu validation fail, throw error ngay lập tức
            console.error("Lỗi validate ca:", input.ca, error)
            throw error
        }

        // Convert date string to proper format if needed
        const payload: any = {
            ...input,
            ngay: input.ngay instanceof Date 
                ? input.ngay.toISOString().split('T')[0] 
                : input.ngay,
            // ✅ Sử dụng giá trị ca đã được normalize và validate
            ca: normalizedCa,
        }
        
        // Log payload để debug
        console.log("Payload ca:", payload.ca)

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(payload)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi tạo phiếu hành chính:", error)
            console.error("Payload ca value:", payload.ca, "Type:", typeof payload.ca)
            
            // ✅ Xử lý lỗi unique constraint (23505)
            if (error.code === "23505") {
                console.error("Unique constraint violation. Error details:", error.message)
                console.error("Checking if actually duplicate with all 4 conditions...")
                
                // Kiểm tra lại xem có thực sự trùng cả 4 điều kiện không
                // (nguoi_tao_id, ngay, ma_phieu, ca)
                const isActuallyDuplicate = await this.checkDuplicatePhieu(
                    input.nguoi_tao_id,
                    input.ngay,
                    input.ma_phieu,
                    normalizedCa
                )
                
                console.log("Is actually duplicate (all 4 conditions):", isActuallyDuplicate)
                
                if (isActuallyDuplicate) {
                    // Thực sự trùng cả 4 điều kiện
                    const caText = normalizedCa ? ` ca ${normalizedCa}` : " (ca không xác định)"
                    throw new Error(
                        `Bạn đã tạo phiếu hành chính với mã phiếu "${input.ma_phieu}"${caText} cho ngày này rồi. ` +
                        `Vui lòng chọn mã phiếu khác hoặc ca khác.`
                    )
                } else {
                    // Không trùng cả 4 điều kiện nhưng vẫn bị lỗi unique constraint
                    // Có thể do database có constraint khác (ví dụ: chỉ unique trên ma_phieu)
                    // Theo quy tắc: khác 1 trong 4 điều kiện thì không bị coi là trùng
                    // Nhưng database constraint đang chặn, cần báo lỗi rõ ràng
                    const caText = normalizedCa ? ` với ca "${normalizedCa}"` : " (ca không xác định)"
                    throw new Error(
                        `Không thể tạo phiếu: Mã phiếu "${input.ma_phieu}"${caText} có thể đã tồn tại trong hệ thống. ` +
                        `Theo quy tắc, nếu khác ca thì vẫn được phép tạo, nhưng database đang chặn. ` +
                        `Vui lòng kiểm tra lại hoặc liên hệ quản trị viên để cập nhật database constraint.`
                    )
                }
            }
            
            // ✅ Xử lý lỗi check constraint cho ca
            if (error.code === "23514" && error.message.includes("ca_check")) {
                const allowedValues = ["Sáng", "Chiều", "Tối", "Cả ngày"]
                const receivedValue = payload.ca !== null && payload.ca !== undefined 
                    ? `"${payload.ca}"` 
                    : "null hoặc undefined"
                throw new Error(
                    `Giá trị ca không hợp lệ. Nhận được: ${receivedValue}. ` +
                    `Chỉ chấp nhận các giá trị: ${allowedValues.join(", ")} hoặc null.`
                )
            }
            
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không thể tạo phiếu hành chính")
        }

        // Fetch nguoi_tao info if exists
        let nguoiTaoTen = null
        if (data.nguoi_tao_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .eq("ma_nhan_vien", data.nguoi_tao_id)
                .single()

            if (nhanSuData) {
                nguoiTaoTen = nhanSuData.ho_ten || null
            }
        }

        // Fetch ten_nhom_phieu if loai_phieu and ma_phieu exist
        let tenNhomPhieu = null
        if (data.loai_phieu && data.ma_phieu) {
            const { data: nhomPhieuData } = await supabase
                .from("hanh_chinh_nhom_phieu")
                .select("ten_nhom_phieu")
                .eq("loai_phieu", data.loai_phieu)
                .eq("ma_nhom_phieu", data.ma_phieu)
                .single()

            if (nhomPhieuData) {
                tenNhomPhieu = nhomPhieuData.ten_nhom_phieu || null
            }
        }

        return {
            ...data,
            nguoi_tao_ten: nguoiTaoTen,
            ten_nhom_phieu: tenNhomPhieu,
        } as PhieuHanhChinh
    }

    /**
     * Update phiếu hành chính
     */
    static async update(id: number, input: UpdatePhieuHanhChinhInput): Promise<PhieuHanhChinh> {
        // Convert date string to proper format if needed
        const payload: any = { ...input }
        if (input.ngay) {
            payload.ngay = input.ngay instanceof Date 
                ? input.ngay.toISOString().split('T')[0] 
                : input.ngay
        }
        // ✅ Normalize và validate ca nếu có trong input
        if (input.ca !== undefined) {
            try {
                payload.ca = normalizeAndValidateCa(input.ca)
            } catch (error) {
                // Nếu validation fail, throw error ngay lập tức
                throw error
            }
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(payload)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Lỗi khi cập nhật phiếu hành chính:", error)
            // ✅ Xử lý lỗi check constraint cho ca
            if (error.code === "23514" && error.message.includes("ca_check")) {
                const allowedValues = ["Sáng", "Chiều", "Tối", "Cả ngày"]
                throw new Error(`Giá trị ca không hợp lệ. Chỉ chấp nhận các giá trị: ${allowedValues.join(", ")}.`)
            }
            throw new Error(error.message)
        }

        if (!data) {
            throw new Error("Không thể cập nhật phiếu hành chính")
        }

        // Fetch nguoi_tao info if exists
        let nguoiTaoTen = null
        if (data.nguoi_tao_id) {
            const { data: nhanSuData } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .eq("ma_nhan_vien", data.nguoi_tao_id)
                .single()

            if (nhanSuData) {
                nguoiTaoTen = nhanSuData.ho_ten || null
            }
        }

        // Fetch ten_nhom_phieu if loai_phieu and ma_phieu exist
        let tenNhomPhieu = null
        if (data.loai_phieu && data.ma_phieu) {
            const { data: nhomPhieuData } = await supabase
                .from("hanh_chinh_nhom_phieu")
                .select("ten_nhom_phieu")
                .eq("loai_phieu", data.loai_phieu)
                .eq("ma_nhom_phieu", data.ma_phieu)
                .single()

            if (nhomPhieuData) {
                tenNhomPhieu = nhomPhieuData.ten_nhom_phieu || null
            }
        }

        return {
            ...data,
            nguoi_tao_ten: nguoiTaoTen,
            ten_nhom_phieu: tenNhomPhieu,
        } as PhieuHanhChinh
    }

    /**
     * Delete phiếu hành chính
     */
    static async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Lỗi khi xóa phiếu hành chính:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Batch delete phiếu hành chính
     */
    static async batchDelete(ids: number[]): Promise<void> {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Lỗi khi xóa hàng loạt phiếu hành chính:", error)
            throw new Error(error.message)
        }
    }

    /**
     * Get unique loại phiếu values for autocomplete
     */
    static async getUniqueLoaiPhieu(): Promise<string[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("loai_phieu")
            .not("loai_phieu", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách loại phiếu:", error)
            throw new Error(error.message)
        }

        // Extract unique values and filter out null/empty
        const uniqueValues = Array.from(
            new Set(
                (data || [])
                    .map((item) => item.loai_phieu)
                    .filter((value): value is string => Boolean(value && value.trim()))
            )
        ).sort()

        return uniqueValues
    }

    /**
     * Get unique mã phiếu values for autocomplete
     */
    static async getUniqueMaPhieu(): Promise<string[]> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("ma_phieu")
            .not("ma_phieu", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách mã phiếu:", error)
            throw new Error(error.message)
        }

        // Extract unique values and filter out null/empty
        const uniqueValues = Array.from(
            new Set(
                (data || [])
                    .map((item) => item.ma_phieu)
                    .filter((value): value is string => Boolean(value && value.trim()))
            )
        ).sort()

        return uniqueValues
    }

    /**
     * Get unique người tạo values for filter
     * Returns array of { id: number, ten: string } objects
     */
    static async getUniqueNguoiTao(): Promise<Array<{ id: number; ten: string }>> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("nguoi_tao_id")
            .not("nguoi_tao_id", "is", null)

        if (error) {
            console.error("Lỗi khi tải danh sách người tạo:", error)
            throw new Error(error.message)
        }

        // Get unique nguoi_tao_id values
        const uniqueIds = Array.from(
            new Set(
                (data || [])
                    .map((item: any) => item.nguoi_tao_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        if (uniqueIds.length === 0) {
            return []
        }

        // Fetch nhan su data for these IDs
        const { data: nhanSuData, error: nhanSuError } = await supabase
            .from("var_nhan_su")
            .select("ma_nhan_vien, ho_ten")
            .in("ma_nhan_vien", uniqueIds)

        if (nhanSuError) {
            console.error("Lỗi khi tải thông tin nhân sự:", nhanSuError)
            // Return IDs only if error
            return uniqueIds.map((id) => ({ id, ten: String(id) }))
        }

        // Map to { id, ten } format
        const nguoiTaoMap = new Map(
            (nhanSuData || []).map((ns: any) => [ns.ma_nhan_vien, ns.ho_ten || String(ns.ma_nhan_vien)])
        )

        return uniqueIds
            .map((id) => ({
                id,
                ten: nguoiTaoMap.get(id) || String(id),
            }))
            .sort((a, b) => {
                // Sort by name first, then by id
                if (a.ten !== b.ten) {
                    return a.ten.localeCompare(b.ten, "vi")
                }
                return a.id - b.id
            })
    }

    /**
     * Get phiếu hành chính by ma_phieu list (for Excel import optimization)
     */
    static async getByMaPhieuList(maPhieuList: string[]): Promise<PhieuHanhChinh[]> {
        if (maPhieuList.length === 0) {
            return []
        }

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .in("ma_phieu", maPhieuList)

        if (error) {
            console.error("Lỗi khi tải phiếu hành chính theo mã:", error)
            throw new Error(error.message)
        }

        if (!data || data.length === 0) {
            return []
        }

        // Get unique nguoi_tao_id values
        const nguoiTaoIds = Array.from(
            new Set(
                data
                    .map((item: any) => item.nguoi_tao_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )

        // Fetch nhan su data for these IDs (nguoi_tao_id = ma_nhan_vien)
        let nguoiTaoMap = new Map<number, { ma_nhan_vien: number; ho_ten: string }>()
        if (nguoiTaoIds.length > 0) {
            const { data: nhanSuData, error: nhanSuError } = await supabase
                .from("var_nhan_su")
                .select("ma_nhan_vien, ho_ten")
                .in("ma_nhan_vien", nguoiTaoIds)

            if (nhanSuError) {
                console.warn("Lỗi khi tải thông tin nhân sự:", nhanSuError)
            } else {
                nguoiTaoMap = new Map(
                    (nhanSuData || []).map((ns: any) => [ns.ma_nhan_vien, ns])
                )
            }
        }

        // Get unique combinations of loai_phieu and ma_phieu to fetch ten_nhom_phieu
        const phieuKeys = Array.from(
            new Set(
                data
                    .map((item: any) => ({
                        loai_phieu: item.loai_phieu,
                        ma_phieu: item.ma_phieu,
                    }))
                    .filter((key) => key.loai_phieu && key.ma_phieu)
                    .map((key) => `${key.loai_phieu}|||${key.ma_phieu}`)
            )
        )

        // Fetch nhom phieu data to get ten_nhom_phieu
        let nhomPhieuMap = new Map<string, string>() // key: "loai_phieu|||ma_phieu" -> ten_nhom_phieu
        if (phieuKeys.length > 0) {
            // Get all unique loai_phieu values
            const uniqueLoaiPhieu = Array.from(
                new Set(phieuKeys.map((key) => key.split("|||")[0]))
            )
            
            // Get all unique ma_phieu values
            const uniqueMaPhieu = Array.from(
                new Set(phieuKeys.map((key) => key.split("|||")[1]))
            )

            // Fetch nhom phieu where loai_phieu matches and ma_nhom_phieu matches
            const { data: nhomPhieuData, error: nhomPhieuError } = await supabase
                .from("hanh_chinh_nhom_phieu")
                .select("loai_phieu, ma_nhom_phieu, ten_nhom_phieu")
                .in("loai_phieu", uniqueLoaiPhieu)
                .in("ma_nhom_phieu", uniqueMaPhieu)

            if (nhomPhieuError) {
                console.warn("Lỗi khi tải thông tin nhóm phiếu:", nhomPhieuError)
            } else {
                nhomPhieuMap = new Map(
                    (nhomPhieuData || []).map((np: any) => [
                        `${np.loai_phieu}|||${np.ma_nhom_phieu}`,
                        np.ten_nhom_phieu || null,
                    ])
                )
            }
        }

        // Map data to include nguoi_tao_ten and ten_nhom_phieu
        return data.map((item: any) => {
            const nguoiTao = nguoiTaoMap.get(item.nguoi_tao_id)
            const nhomPhieuKey = item.loai_phieu && item.ma_phieu 
                ? `${item.loai_phieu}|||${item.ma_phieu}`
                : null
            const tenNhomPhieu = nhomPhieuKey ? nhomPhieuMap.get(nhomPhieuKey) || null : null
            
            return {
                ...item,
                nguoi_tao_ten: nguoiTao?.ho_ten || null,
                ten_nhom_phieu: tenNhomPhieu,
            }
        }) as PhieuHanhChinh[]
    }
}

