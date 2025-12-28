"use client"

import { createMutationHooks } from "@/lib/react-query"
import { danhMucCauHoiQueryKeys } from "@/lib/react-query/query-keys"
import { DanhMucCauHoiAPI } from "../services/danh-muc-cau-hoi.api"
import type { DanhMucCauHoi } from "../schema"
import type { CreateDanhMucCauHoiInput, UpdateDanhMucCauHoiInput } from "../types"

/**
 * Mutation hooks for danh mục câu hỏi module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<DanhMucCauHoi, CreateDanhMucCauHoiInput, UpdateDanhMucCauHoiInput>({
    queryKeys: danhMucCauHoiQueryKeys,
    api: DanhMucCauHoiAPI,
    messages: {
        createSuccess: "Thêm mới danh mục câu hỏi thành công",
        updateSuccess: "Cập nhật thông tin danh mục câu hỏi thành công",
        deleteSuccess: "Xóa danh mục câu hỏi thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} danh mục câu hỏi thành công`,
    },
})

export const useCreateDanhMucCauHoi = mutations.useCreate
export const useUpdateDanhMucCauHoi = mutations.useUpdate
export const useDeleteDanhMucCauHoi = mutations.useDelete
export const useBatchDeleteDanhMucCauHoi = mutations.useBatchDelete

