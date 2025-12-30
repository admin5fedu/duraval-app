"use client"

import { createMutationHooks } from "@/lib/react-query"
import { danhMucTaiLieuQueryKeys } from "@/lib/react-query/query-keys"
import { DanhMucTaiLieuAPI } from "../services/danh-muc-tai-lieu.api"
import type { DanhMucTaiLieu } from "../schema"
import type { CreateDanhMucTaiLieuInput, UpdateDanhMucTaiLieuInput } from "../types"

/**
 * Mutation hooks for danh mục tài liệu module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<DanhMucTaiLieu, CreateDanhMucTaiLieuInput, UpdateDanhMucTaiLieuInput>({
    queryKeys: danhMucTaiLieuQueryKeys,
    api: DanhMucTaiLieuAPI,
    messages: {
        createSuccess: "Thêm mới danh mục tài liệu thành công",
        updateSuccess: "Cập nhật thông tin danh mục tài liệu thành công",
        deleteSuccess: "Xóa danh mục tài liệu thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} danh mục tài liệu thành công`,
    },
})

export const useCreateDanhMucTaiLieu = mutations.useCreate
export const useUpdateDanhMucTaiLieu = mutations.useUpdate
export const useDeleteDanhMucTaiLieu = mutations.useDelete
export const useBatchDeleteDanhMucTaiLieu = mutations.useBatchDelete

