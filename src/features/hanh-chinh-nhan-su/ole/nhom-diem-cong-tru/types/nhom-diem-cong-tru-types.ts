import type { NhomDiemCongTru } from "../schema"

export type CreateNhomDiemCongTruInput = Omit<
  NhomDiemCongTru,
  "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao_id" | "nguoi_tao_ten" | "nguoi_tao"
>

export type UpdateNhomDiemCongTruInput = Partial<
  Omit<NhomDiemCongTru, "id" | "tg_tao" | "nguoi_tao_id" | "nguoi_tao_ten" | "nguoi_tao">
>

