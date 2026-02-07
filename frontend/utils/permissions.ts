import { staffAPI } from '@/services/api';

export interface UserPermissions {
  modules: string[];
  isOwner: boolean;
  roleName: string;
}

let cachedPermissions: UserPermissions | null = null;

export const getUserPermissions = async (): Promise<UserPermissions> => {
  // Return cached permissions if available
  if (cachedPermissions) {
    return cachedPermissions;
  }

  try {
    const response = await staffAPI.getMe();
    const staff = response.data.staff;
    
    // Get permissions from custom permissions or role permissions
    let modules: string[] = [];
    
    if (staff.permissions && Array.isArray(staff.permissions)) {
      modules = staff.permissions;
    } else if (staff.role?.permissions && Array.isArray(staff.role.permissions)) {
      modules = staff.role.permissions;
    }

    const permissions: UserPermissions = {
      modules,
      isOwner: false,
      roleName: staff.roleName || 'STAFF',
    };

    cachedPermissions = permissions;
    return permissions;
  } catch (err: any) {
    // If 404, user is owner (no staff record) - has all permissions
    if (err.response?.status === 404) {
      const permissions: UserPermissions = {
        modules: ['dashboard', 'books', 'loans', 'people', 'transactions', 'reports', 'deposits', 'calculator', 'staff'],
        isOwner: true,
        roleName: 'ADMIN',
      };
      cachedPermissions = permissions;
      return permissions;
    }
    
    // Default to no permissions on error
    return {
      modules: [],
      isOwner: false,
      roleName: 'VIEWER',
    };
  }
};

export const hasModuleAccess = async (moduleId: string): Promise<boolean> => {
  const permissions = await getUserPermissions();
  
  // Owner has all permissions
  if (permissions.isOwner) {
    return true;
  }
  
  return permissions.modules.includes(moduleId);
};

export const clearPermissionsCache = () => {
  cachedPermissions = null;
};

