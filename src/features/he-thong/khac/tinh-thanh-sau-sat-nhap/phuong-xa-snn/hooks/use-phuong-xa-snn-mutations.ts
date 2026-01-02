"use client"

import { createMutationHooks } from "@/lib/react-query"
import { phuongXaSNN as phuongXaSNNQueryKeys } from "@/lib/react-query/query-keys/phuong-xa-snn"
import { PhuongXaSNNAPI } from "../services/phuong-xa-snn.api"
import type { PhuongXaSNN } from "../schema"
import type { CreatePhuongXaSNNInput, UpdatePhuongXaSNNInput } from "../schema"

/**
 * Mutation hooks for phường xã SNN module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<PhuongXaSNN, CreatePhuongXaSNNInput, UpdatePhuongXaSNNInput>({
    queryKeys: phuongXaSNNQueryKeys,
    api: PhuongXaSNNAPI,
    messages: {
        createSuccess: "Thêm mới phường xã SNN thành công",
        updateSuccess: "Cập nhật phường xã SNN thành công",
        deleteSuccess: "Xóa phường xã SNN thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} phường xã SNN thành công`,
    },
})

export const useCreatePhuongXaSNN = mutations.useCreate
export const useUpdatePhuongXaSNN = mutations.useUpdate
export const useDeletePhuongXaSNN = mutations.useDelete
export const useBatchDeletePhuongXaSNN = mutations.useBatchDelete

