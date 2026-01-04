import { createMutationHooks } from "@/lib/react-query"
import { trangThaiKhachBuonQueryKeys } from "@/lib/react-query/query-keys"
import { TrangThaiKhachBuonAPI } from "../services/trang-thai-khach-buon.api"
import type { TrangThaiKhachBuon, CreateTrangThaiKhachBuonInput, UpdateTrangThaiKhachBuonInput } from "../schema"

const mutations = createMutationHooks<TrangThaiKhachBuon, CreateTrangThaiKhachBuonInput, UpdateTrangThaiKhachBuonInput>({
    queryKeys: trangThaiKhachBuonQueryKeys,
    api: TrangThaiKhachBuonAPI,
    messages: {
        createSuccess: "Thêm mới trạng thái khách buôn thành công",
        updateSuccess: "Cập nhật trạng thái khách buôn thành công",
        deleteSuccess: "Xóa trạng thái khách buôn thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} trạng thái khách buôn thành công`,
    },
})

export const useCreateTrangThaiKhachBuon = mutations.useCreate
export const useUpdateTrangThaiKhachBuon = mutations.useUpdate
export const useDeleteTrangThaiKhachBuon = mutations.useDelete
export const useBatchDeleteTrangThaiKhachBuon = mutations.useBatchDelete

