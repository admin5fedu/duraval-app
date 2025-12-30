import type { ChamOle } from "../schema"

export type CreateChamOleInput = Omit<
  ChamOle,
  "id" | "tg_tao" | "tg_cap_nhat" | "nhan_vien" | "phong_ban" | "chuc_vu" | "nguoi_tao"
> & {
  nguoi_tao_id?: number | null // Cho phép set nguoi_tao_id khi tạo mới
}

export type UpdateChamOleInput = Partial<
  Omit<ChamOle, "id" | "tg_tao" | "nhan_vien" | "phong_ban" | "chuc_vu" | "nguoi_tao">
>

