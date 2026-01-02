"use client"

import { createMutationHooks } from "@/lib/react-query"
import { tinhThanhTSN as tinhThanhTSNQueryKeys } from "@/lib/react-query/query-keys/tinh-thanh-tsn"
import { TinhThanhTSNAPI } from "../services/tinh-thanh-tsn.api"
import type { TinhThanhTSN } from "../schema"
import type { CreateTinhThanhTSNInput, UpdateTinhThanhTSNInput } from "../schema"

/**
 * Mutation hooks for tỉnh thành TSN module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<TinhThanhTSN, CreateTinhThanhTSNInput, UpdateTinhThanhTSNInput>({
    queryKeys: tinhThanhTSNQueryKeys,
    api: TinhThanhTSNAPI,
    messages: {
        createSuccess: "Thêm mới tỉnh thành TSN thành công",
        updateSuccess: "Cập nhật tỉnh thành TSN thành công",
        deleteSuccess: "Xóa tỉnh thành TSN thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} tỉnh thành TSN thành công`,
    },
})

export const useCreateTinhThanhTSN = mutations.useCreate
export const useUpdateTinhThanhTSN = mutations.useUpdate
export const useDeleteTinhThanhTSN = mutations.useDelete
export const useBatchDeleteTinhThanhTSN = mutations.useBatchDelete

