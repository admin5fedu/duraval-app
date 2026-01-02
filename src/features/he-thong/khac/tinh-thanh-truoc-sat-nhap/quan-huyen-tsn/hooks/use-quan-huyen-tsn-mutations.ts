"use client"

import { createMutationHooks } from "@/lib/react-query"
import { quanHuyenTSN as quanHuyenTSNQueryKeys } from "@/lib/react-query/query-keys/quan-huyen-tsn"
import { QuanHuyenTSNAPI } from "../services/quan-huyen-tsn.api"
import type { QuanHuyenTSN } from "../schema"
import type { CreateQuanHuyenTSNInput, UpdateQuanHuyenTSNInput } from "../schema"

/**
 * Mutation hooks for quận huyện TSN module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<QuanHuyenTSN, CreateQuanHuyenTSNInput, UpdateQuanHuyenTSNInput>({
    queryKeys: quanHuyenTSNQueryKeys,
    api: QuanHuyenTSNAPI,
    messages: {
        createSuccess: "Thêm mới quận huyện TSN thành công",
        updateSuccess: "Cập nhật quận huyện TSN thành công",
        deleteSuccess: "Xóa quận huyện TSN thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} quận huyện TSN thành công`,
    },
})

export const useCreateQuanHuyenTSN = mutations.useCreate
export const useUpdateQuanHuyenTSN = mutations.useUpdate
export const useDeleteQuanHuyenTSN = mutations.useDelete
export const useBatchDeleteQuanHuyenTSN = mutations.useBatchDelete

