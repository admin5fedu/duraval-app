/**
 * Generic mutation hooks factory
 * 
 * Provides reusable mutation hooks for CRUD operations across all modules.
 * Ensures consistent cache invalidation and refetching patterns.
 */

export {
  createUseCreateMutation,
  createUseUpdateMutation,
  createUseDeleteMutation,
  createUseBatchDeleteMutation,
  createMutationHooks,
  type MutationConfig,
} from "./create-mutation-hooks"

