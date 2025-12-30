import { z } from "zod"

/**
 * Schema matching 'cskh_phan_hoi_kh' table in Supabase
 */
export const phanHoiKhachHangSchema = z.object({
    id: z.number().optional(), // Auto-generated, optional for create
    ngay: z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.string().min(1, "Ngày là bắt buộc")
    ),
    nhan_vien_id: z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.number().min(1, "Nhân viên là bắt buộc")
    ),
    ten_nhan_vien: z.string().optional().nullable(),
    phong_id: z.number().optional().nullable(),
    nhom_id: z.number().optional().nullable(),
    ma_san_pham: z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.string().min(1, "Mã sản phẩm là bắt buộc")
    ),
    ten_san_pham: z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.string().min(1, "Tên sản phẩm là bắt buộc")
    ),
    id_don_hang: z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.string().min(1, "ID đơn hàng là bắt buộc")
    ),
    sdt_khach: z.string().optional().nullable(),
    ngay_ban: z.string().optional().nullable(), // date
    loai_loi: z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.string().min(1, "Loại là bắt buộc")
    ),
    ten_loi: z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.string().min(1, "Tên lỗi là bắt buộc")
    ),
    mo_ta_loi: z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.string().min(1, "Mô tả lỗi là bắt buộc")
    ),
    muc_do: z.preprocess(
        (val) => (val === "" || val === null ? "Bình thường" : val),
        z.string().min(1, "Mức độ là bắt buộc")
    ).default("Bình thường"),
    yeu_cau_khach_hang: z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.string().min(1, "Yêu cầu khách hàng là bắt buộc")
    ),
    hinh_anh: z.array(z.string()).optional().nullable(), // ARRAY
    bien_phap_hien_tai: z.string().optional().nullable(),
    han_xu_ly: z.string().optional().nullable(), // date
    trang_thai: z.string().optional().nullable().default("Mới"),
    kt_mo_ta_loi: z.string().optional().nullable(),
    kt_phu_trach: z.string().optional().nullable(),
    chi_phi: z.preprocess(
        (val) => {
            if (val === "" || val === null) return 0
            if (val === 0 || val === "0") return 0
            return val
        },
        z.number().default(0)
    ),
    id_don_hoan: z.string().optional().nullable(),
    trang_thai_don_hoan: z.string().optional().nullable(),
    bien_phap_don_hoan: z.string().optional().nullable(),
    ghi_chu_don_hoan: z.string().optional().nullable(),
    ket_qua_cuoi_cung: z.string().optional().nullable(),
    ngay_hoan_thanh: z.string().optional().nullable(), // date
    trao_doi: z.any().optional().nullable(), // JSONB field
    tg_tao: z.string().optional().nullable(),
    tg_cap_nhat: z.string().optional().nullable(),
    nguoi_tao_id: z.number().optional().nullable(),
        // Joined fields from related tables (if needed)
        nhan_vien: z.object({
            ma_nhan_vien: z.number(),
            ho_ten: z.string(),
        }).optional().nullable(),
        nguoi_tao: z.object({
            ma_nhan_vien: z.number(),
            ho_ten: z.string(),
        }).optional().nullable(),
        phong_ban: z.object({
            id: z.number(),
            ma_phong_ban: z.string(),
            ten_phong_ban: z.string(),
        }).optional().nullable(),
        nhom: z.object({
            id: z.number(),
            ten_nhom: z.string(),
        }).optional().nullable(),
})

export type PhanHoiKhachHang = z.infer<typeof phanHoiKhachHangSchema>

