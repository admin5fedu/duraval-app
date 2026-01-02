"use client"

import { createMutationHooks } from "@/lib/react-query"
import { tinhThanhSSN as tinhThanhSSNQueryKeys } from "@/lib/react-query/query-keys/tinh-thanh-ssn"
import { TinhThanhSSNAPI } from "../services/tinh-thanh-ssn.api"
import type { TinhThanhSSN } from "../schema"
import type { CreateTinhThanhSSNInput, UpdateTinhThanhSSNInput } from "../schema"

/**
 * Mutation hooks for tỉnh thành SSN module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<TinhThanhSSN, CreateTinhThanhSSNInput, UpdateTinhThanhSSNInput>({
    queryKeys: tinhThanhSSNQueryKeys,
    api: TinhThanhSSNAPI,
    messages: {
        createSuccess: "Thêm mới tỉnh thành SSN thành công",
        updateSuccess: "Cập nhật tỉnh thành SSN thành công",
        deleteSuccess: "Xóa tỉnh thành SSN thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} tỉnh thành SSN thành công`,
    },
})

export const useCreateTinhThanhSSN = mutations.useCreate
export const useUpdateTinhThanhSSN = mutations.useUpdate
export const useDeleteTinhThanhSSN = mutations.useDelete
export const useBatchDeleteTinhThanhSSN = mutations.useBatchDelete

