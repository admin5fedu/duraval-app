"use client"

import { createMutationHooks } from "@/lib/react-query"
import { giaiDoanKhachBuonQueryKeys } from "@/lib/react-query/query-keys"
import { GiaiDoanKhachBuonAPI } from "../services/giai-doan-khach-buon.api"
import type { GiaiDoanKhachBuon } from "../schema"
import type { CreateGiaiDoanKhachBuonInput, UpdateGiaiDoanKhachBuonInput } from "../schema"

/**
 * Mutation hooks for giai đoạn khách buôn module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<GiaiDoanKhachBuon, CreateGiaiDoanKhachBuonInput, UpdateGiaiDoanKhachBuonInput>({
    queryKeys: giaiDoanKhachBuonQueryKeys,
    api: GiaiDoanKhachBuonAPI,
    messages: {
        createSuccess: "Thêm mới giai đoạn khách buôn thành công",
        updateSuccess: "Cập nhật giai đoạn khách buôn thành công",
        deleteSuccess: "Xóa giai đoạn khách buôn thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} giai đoạn khách buôn thành công`,
    },
})

export const useCreateGiaiDoanKhachBuon = mutations.useCreate
export const useUpdateGiaiDoanKhachBuon = mutations.useUpdate
export const useDeleteGiaiDoanKhachBuon = mutations.useDelete
export const useBatchDeleteGiaiDoanKhachBuon = mutations.useBatchDelete

