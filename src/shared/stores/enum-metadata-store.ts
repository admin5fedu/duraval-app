/**
 * Enum Metadata Store
 * 
 * Centralized store for enum metadata synchronization
 * between form configurations and enum registry
 */

import { FormFieldConfig } from "@/shared/components/forms/generic-form-view/types"
import { ColumnDef } from "@tanstack/react-table"
import { EnumColorConfig } from "@/shared/utils/enum-color-registry"
import { autoDetectAndRegisterEnum, autoRegisterEnumFromFormField } from "@/shared/utils/enum-detection"

/**
 * Metadata for an enum field
 */
export interface EnumMetadata {
  fieldKey: string
  options?: Array<{ label: string; value: string }>
  colorConfig?: EnumColorConfig
  source: "form" | "column" | "pattern" | "manual"
  registered: boolean
}

/**
 * Store for enum metadata
 */
class EnumMetadataStore {
  private metadata: Map<string, EnumMetadata> = new Map()

  /**
   * Register enum metadata from form field config
   */
  registerFromFormField(fieldKey: string, formFieldConfig: FormFieldConfig): void {
    const existing = this.metadata.get(fieldKey)
    
    const metadata: EnumMetadata = {
      fieldKey,
      options: formFieldConfig.options,
      source: "form",
      registered: autoRegisterEnumFromFormField(fieldKey, formFieldConfig),
    }

    // Merge with existing if present
    if (existing) {
      metadata.colorConfig = existing.colorConfig
      if (existing.source === "manual") {
        metadata.source = "manual" // Manual takes precedence
      }
    }

    this.metadata.set(fieldKey, metadata)
  }

  /**
   * Register enum metadata from column definition
   */
  registerFromColumn(fieldKey: string, columnDef: ColumnDef<any>): void {
    const existing = this.metadata.get(fieldKey)
    
    const meta = columnDef.meta as { enumConfig?: EnumColorConfig } | undefined
    const metadata: EnumMetadata = {
      fieldKey,
      colorConfig: meta?.enumConfig,
      source: "column",
      registered: meta?.enumConfig ? true : false,
    }

    // Merge with existing if present
    if (existing) {
      metadata.options = existing.options
      if (existing.source === "manual" || existing.source === "form") {
        metadata.source = existing.source // Preserve higher priority source
      }
    }

    this.metadata.set(fieldKey, metadata)
  }

  /**
   * Register enum metadata manually
   */
  registerManually(fieldKey: string, colorConfig: EnumColorConfig, options?: Array<{ label: string; value: string }>): void {
    this.metadata.set(fieldKey, {
      fieldKey,
      options,
      colorConfig,
      source: "manual",
      registered: true,
    })
  }

  /**
   * Get metadata for a field key
   */
  getMetadata(fieldKey: string): EnumMetadata | undefined {
    return this.metadata.get(fieldKey)
  }

  /**
   * Check if field has metadata
   */
  hasMetadata(fieldKey: string): boolean {
    return this.metadata.has(fieldKey)
  }

  /**
   * Get all registered field keys
   */
  getAllFieldKeys(): string[] {
    return Array.from(this.metadata.keys())
  }

  /**
   * Clear all metadata (useful for testing)
   */
  clear(): void {
    this.metadata.clear()
  }

  /**
   * Sync form fields to registry
   * Call this when form is initialized
   */
  syncFormFields(formFields: FormFieldConfig[]): void {
    formFields.forEach(field => {
      if (field.type === "select" || field.type === "combobox") {
        if (field.options && field.options.length > 0) {
          this.registerFromFormField(field.name, field)
        }
      }
    })
  }
}

// Singleton instance
export const enumMetadataStore = new EnumMetadataStore()

