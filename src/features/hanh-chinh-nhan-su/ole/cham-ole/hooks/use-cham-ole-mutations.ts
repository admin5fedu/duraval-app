"use client"

import { createMutationHooks } from "@/lib/react-query"
import { chamOleQueryKeys } from "@/lib/react-query/query-keys"
import { ChamOleAPI } from "../services/cham-ole.api"
import type { ChamOle } from "../schema"
import type { CreateChamOleInput, UpdateChamOleInput } from "../types"

/**
 * Mutation hooks for chấm OLE module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<ChamOle, CreateChamOleInput, UpdateChamOleInput>({
    queryKeys: chamOleQueryKeys,
    api: ChamOleAPI,
    messages: {
        createSuccess: "Thêm mới chấm OLE thành công",
        updateSuccess: "Cập nhật chấm OLE thành công",
        deleteSuccess: "Xóa chấm OLE thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} chấm OLE thành công`,
    },
})

export const useCreateChamOle = mutations.useCreate
export const useUpdateChamOle = mutations.useUpdate
export const useDeleteChamOle = mutations.useDelete
export const useBatchDeleteChamOle = mutations.useBatchDelete

