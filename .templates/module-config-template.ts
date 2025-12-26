/**
 * Module Configuration Template
 * 
 * Copy this file to your module folder and customize it
 * Then register it in src/shared/config/module-registry.ts
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const yourModuleConfig: ModuleConfig = {
  // Basic info
  moduleName: "your-module-name", // e.g., "danh-sach-nhan-su"
  moduleTitle: "Your Module Title", // e.g., "Danh Sách Nhân Sự"
  moduleDescription: "Module description", // Optional
  
  // Routing
  routePath: "/parent/your-module", // e.g., "/he-thong/danh-sach-nhan-su"
  parentPath: "/parent", // e.g., "/he-thong"
  routePattern: "/parent/your-module/*", // e.g., "/he-thong/danh-sach-nhan-su/*"
  
  // Breadcrumb
  breadcrumb: {
    label: "Your Module Title", // Display name in breadcrumb
    parentLabel: "Parent Module", // Override parent label if needed
    skipSegments: [], // Additional segments to skip in breadcrumb (optional)
  },
  
  // Database (optional)
  tableName: "your_table_name",
  primaryKey: "id",
  
  // List view (optional)
  filterColumns: [
    // {
    //   columnId: "status",
    //   title: "Status",
    //   options: [
    //     { label: "Active", value: "Active" },
    //     { label: "Inactive", value: "Inactive" },
    //   ],
    // },
  ],
  searchFields: [], // e.g., ["name", "email"]
  defaultSorting: [{ id: "id", desc: true }],
  
  // Permissions (optional)
  // permissions: {
  //   view: "module.view",
  //   create: "module.create",
  //   update: "module.update",
  //   delete: "module.delete",
  // },
}

