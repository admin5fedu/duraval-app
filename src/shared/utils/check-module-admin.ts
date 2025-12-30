/**
 * Utility function to check if user has admin permission for a module
 * 
 * This is a placeholder implementation. Each module should implement
 * their own permission checking logic based on their requirements.
 * 
 * @param moduleName - Name of the module (e.g., "truc-hat", "phan-hoi-khach-hang")
 * @param employee - Current employee object from auth store
 * @returns boolean - true if user has admin permission, false otherwise
 */
export function checkModuleAdmin(
  _moduleName: string,
  employee: any
): boolean {
  // Placeholder implementation
  // TODO: Implement actual permission checking logic based on your permission system
  // This could check:
  // - Employee role/permissions
  // - Module-specific admin list
  // - Database permission table
  // - etc.
  
  if (!employee) {
    return false
  }

  // Example: Check if employee has admin role
  // You can customize this based on your permission system
  const adminRoles = ['admin', 'quan_tri', 'manager']
  const employeeRole = employee.chuc_vu?.ten_chuc_vu?.toLowerCase() || ''
  
  // Check if role is admin
  if (adminRoles.some(role => employeeRole.includes(role))) {
    return true
  }

  // Example: Check module-specific permissions
  // You might have a permissions table or field in employee object
  // const modulePermissions = employee.module_permissions || []
  // return modulePermissions.includes(`${_moduleName}_admin`)

  // Default: no permission
  return false
}

