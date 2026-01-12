"use client"

import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query"
import { toast } from "sonner"
import type { QueryKeyFactory } from "../query-keys/types"

/**
 * Configuration for creating mutation hooks
 */
export interface MutationConfig<TEntity, TCreateInput, TUpdateInput> {
  /**
   * Query key factory for the module
   */
  queryKeys: QueryKeyFactory

  /**
   * API methods
   */
  api: {
    create: (input: TCreateInput) => Promise<TEntity>
    update: (id: number, input: TUpdateInput) => Promise<TEntity>
    delete: (id: number) => Promise<void>
    batchDelete: (ids: number[]) => Promise<void>
  }

  /**
   * Success and error messages
   */
  messages: {
    createSuccess: string
    updateSuccess: string
    deleteSuccess: string
    batchDeleteSuccess: (count: number) => string
    createError?: string
    updateError?: string
    deleteError?: string
    batchDeleteError?: string
  }
}

/**
 * Creates a useCreateMutation hook for a module
 * 
 * @example
 * ```ts
 * export const useCreateDanhMucCauHoi = createUseCreateMutation({
 *   queryKeys: danhMucCauHoiQueryKeys,
 *   api: { create: DanhMucCauHoiAPI.create },
 *   messages: { createSuccess: "Thêm mới thành công", ... }
 * })
 * ```
 */
export function createUseCreateMutation<TEntity extends { id?: number }, TCreateInput>(
  config: Pick<MutationConfig<TEntity, TCreateInput, any>, "queryKeys" | "api" | "messages">
) {
  return function useCreateMutation(): UseMutationResult<TEntity, Error, TCreateInput> {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async (input: TCreateInput) => {
        return await config.api.create(input)
      },
      onSuccess: (data) => {
        // ✅ QUAN TRỌNG: Invalidate và refetch tất cả queries (theo pattern app-tham-khao)
        queryClient.invalidateQueries({
          queryKey: config.queryKeys.all(),
          exact: false, // Invalidate tất cả queries con
        })
        // Force refetch list query ngay lập tức (bỏ exact: true để refetch tất cả queries liên quan)
        queryClient.refetchQueries({
          queryKey: config.queryKeys.list(),
          exact: false, // Refetch tất cả queries bắt đầu với list key
        })
        // Set detail query data for instant navigation
        if (data.id) {
          queryClient.setQueryData(config.queryKeys.detail(data.id), data)
        }
        toast.success(config.messages.createSuccess)
      },
      onSettled: () => {
        // ✅ QUAN TRỌNG: Đảm bảo queries được sync sau khi mutation hoàn tất
        queryClient.invalidateQueries({
          queryKey: config.queryKeys.all(),
          exact: false,
        })
      },
      onError: (error: Error) => {
        toast.error(
          config.messages.createError || error.message || "Có lỗi xảy ra khi thêm mới"
        )
      },
    })
  }
}

/**
 * Creates a useUpdateMutation hook for a module
 * 
 * @example
 * ```ts
 * export const useUpdateDanhMucCauHoi = createUseUpdateMutation({
 *   queryKeys: danhMucCauHoiQueryKeys,
 *   api: { update: DanhMucCauHoiAPI.update },
 *   messages: { updateSuccess: "Cập nhật thành công", ... }
 * })
 * ```
 */
export function createUseUpdateMutation<TEntity, TUpdateInput>(
  config: Pick<MutationConfig<TEntity, any, TUpdateInput>, "queryKeys" | "api" | "messages">
) {
  return function useUpdateMutation(): UseMutationResult<
    TEntity,
    Error,
    { id: number; input: TUpdateInput }
  > {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async ({ id, input }: { id: number; input: TUpdateInput }) => {
        return await config.api.update(id, input)
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({
          queryKey: config.queryKeys.all(),
          exact: false,
        })
        queryClient.refetchQueries({
          queryKey: config.queryKeys.list(),
          exact: false, // Refetch tất cả queries bắt đầu với list key
        })
        queryClient.setQueryData(config.queryKeys.detail(variables.id), data)
        toast.success(config.messages.updateSuccess)
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: config.queryKeys.all(),
          exact: false,
        })
      },
      onError: (error: Error) => {
        toast.error(
          config.messages.updateError || error.message || "Có lỗi xảy ra khi cập nhật"
        )
      },
    })
  }
}

/**
 * Creates a useDeleteMutation hook for a module
 * 
 * @example
 * ```ts
 * export const useDeleteDanhMucCauHoi = createUseDeleteMutation({
 *   queryKeys: danhMucCauHoiQueryKeys,
 *   api: { delete: DanhMucCauHoiAPI.delete },
 *   messages: { deleteSuccess: "Xóa thành công", ... }
 * })
 * ```
 */
export function createUseDeleteMutation(
  config: Pick<MutationConfig<any, any, any>, "queryKeys" | "api" | "messages">
) {
  return function useDeleteMutation(): UseMutationResult<void, Error, number> {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async (id: number) => {
        return await config.api.delete(id)
      },
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({
          queryKey: config.queryKeys.all(),
          exact: false,
        })
        queryClient.refetchQueries({
          queryKey: config.queryKeys.list(),
          exact: false, // Refetch tất cả queries bắt đầu với list key
        })
        queryClient.removeQueries({ queryKey: config.queryKeys.detail(id) })
        toast.success(config.messages.deleteSuccess)
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: config.queryKeys.all(),
          exact: false,
        })
      },
      onError: (error: Error) => {
        toast.error(
          config.messages.deleteError || error.message || "Có lỗi xảy ra khi xóa"
        )
      },
    })
  }
}

/**
 * Creates a useBatchDeleteMutation hook for a module
 * 
 * @example
 * ```ts
 * export const useBatchDeleteDanhMucCauHoi = createUseBatchDeleteMutation({
 *   queryKeys: danhMucCauHoiQueryKeys,
 *   api: { batchDelete: DanhMucCauHoiAPI.batchDelete },
 *   messages: { batchDeleteSuccess: (count) => `Đã xóa ${count} thành công`, ... }
 * })
 * ```
 */
export function createUseBatchDeleteMutation(
  config: Pick<MutationConfig<any, any, any>, "queryKeys" | "api" | "messages">
) {
  return function useBatchDeleteMutation(): UseMutationResult<void, Error, number[]> {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async (ids: number[]) => {
        return await config.api.batchDelete(ids)
      },
      onSuccess: (_, ids) => {
        queryClient.invalidateQueries({
          queryKey: config.queryKeys.all(),
          exact: false,
        })
        queryClient.refetchQueries({
          queryKey: config.queryKeys.list(),
          exact: false, // Refetch tất cả queries bắt đầu với list key
        })
        ids.forEach((id) => {
          queryClient.removeQueries({ queryKey: config.queryKeys.detail(id) })
        })
        toast.success(config.messages.batchDeleteSuccess(ids.length))
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: config.queryKeys.all(),
          exact: false,
        })
      },
      onError: (error: Error) => {
        toast.error(
          config.messages.batchDeleteError || error.message || "Có lỗi xảy ra khi xóa hàng loạt"
        )
      },
    })
  }
}

/**
 * Creates all mutation hooks for a module at once
 * 
 * @example
 * ```ts
 * const mutations = createMutationHooks({
 *   queryKeys: danhMucCauHoiQueryKeys,
 *   api: DanhMucCauHoiAPI,
 *   messages: {
 *     createSuccess: "Thêm mới danh mục câu hỏi thành công",
 *     updateSuccess: "Cập nhật danh mục câu hỏi thành công",
 *     deleteSuccess: "Xóa danh mục câu hỏi thành công",
 *     batchDeleteSuccess: (count) => `Đã xóa ${count} danh mục câu hỏi thành công`,
 *   }
 * })
 * 
 * export const useCreateDanhMucCauHoi = mutations.useCreate
 * export const useUpdateDanhMucCauHoi = mutations.useUpdate
 * export const useDeleteDanhMucCauHoi = mutations.useDelete
 * export const useBatchDeleteDanhMucCauHoi = mutations.useBatchDelete
 * ```
 */
export function createMutationHooks<TEntity extends { id?: number }, TCreateInput, TUpdateInput>(
  config: MutationConfig<TEntity, TCreateInput, TUpdateInput>
) {
  return {
    useCreate: createUseCreateMutation<TEntity, TCreateInput>(config),
    useUpdate: createUseUpdateMutation<TEntity, TUpdateInput>(config),
    useDelete: createUseDeleteMutation(config),
    useBatchDelete: createUseBatchDeleteMutation(config),
  }
}

