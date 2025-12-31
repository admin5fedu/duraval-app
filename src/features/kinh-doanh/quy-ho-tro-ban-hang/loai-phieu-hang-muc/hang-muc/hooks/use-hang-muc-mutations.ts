"use client"

import { createMutationHooks } from "@/lib/react-query"
import { hangMucQueryKeys } from "@/lib/react-query/query-keys"
import { HangMucAPI } from "../services/hang-muc.api"
import type { HangMuc } from "../schema"
import type { CreateHangMucInput, UpdateHangMucInput } from "../schema"

const mutations = createMutationHooks<HangMuc, CreateHangMucInput, UpdateHangMucInput>({
    queryKeys: hangMucQueryKeys,
    api: HangMucAPI,
    messages: {
        createSuccess: "Thêm mới hạng mục thành công",
        updateSuccess: "Cập nhật hạng mục thành công",
        deleteSuccess: "Xóa hạng mục thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} hạng mục thành công`,
    },
})

export const useCreateHangMuc = mutations.useCreate
export const useUpdateHangMuc = mutations.useUpdate
export const useDeleteHangMuc = mutations.useDelete
export const useBatchDeleteHangMuc = mutations.useBatchDelete

