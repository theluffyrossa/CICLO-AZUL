import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';

export interface Permissions {
  canViewDashboard: boolean;
  canManageUsers: boolean;
  canManageClients: boolean;
  canManageUnits: boolean;
  canManageWasteTypes: boolean;
  canCreateCollection: boolean;
  canEditCollection: boolean;
  canDeleteCollection: boolean;
  canViewAllCollections: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canManageSettings: boolean;
}

export interface UsePermissionsReturn {
  permissions: Permissions;
  isAdmin: boolean;
  isOperator: boolean;
  hasPermission: (permission: keyof Permissions) => boolean;
  canAccessScreen: (screenName: string) => boolean;
}

const ADMIN_PERMISSIONS: Permissions = {
  canViewDashboard: true,
  canManageUsers: true,
  canManageClients: true,
  canManageUnits: true,
  canManageWasteTypes: true,
  canCreateCollection: true,
  canEditCollection: true,
  canDeleteCollection: true,
  canViewAllCollections: true,
  canViewReports: true,
  canExportData: true,
  canManageSettings: true,
};

const OPERATOR_PERMISSIONS: Permissions = {
  canViewDashboard: true,
  canManageUsers: false,
  canManageClients: false,
  canManageUnits: false,
  canManageWasteTypes: false,
  canCreateCollection: true,
  canEditCollection: false,
  canDeleteCollection: false,
  canViewAllCollections: false,
  canViewReports: false,
  canExportData: false,
  canManageSettings: false,
};

const ADMIN_SCREENS = [
  'UserManagement',
  'ClientManagement',
  'UnitManagement',
  'WasteTypeManagement',
  'Reports',
  'Settings',
  'Dashboard',
  'Collections',
  'Profile',
];

const OPERATOR_SCREENS = [
  'Dashboard',
  'Collections',
  'Profile',
  'NewCollection',
  'CollectionDetail',
  'GravimetricData',
  'Camera',
];

export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAuthStore();

  const isAdmin = user?.role === UserRole.ADMIN;
  const isOperator = user?.role === UserRole.OPERATOR;

  const permissions: Permissions = isAdmin
    ? ADMIN_PERMISSIONS
    : isOperator
    ? OPERATOR_PERMISSIONS
    : {
        // Default: no permissions
        canViewDashboard: false,
        canManageUsers: false,
        canManageClients: false,
        canManageUnits: false,
        canManageWasteTypes: false,
        canCreateCollection: false,
        canEditCollection: false,
        canDeleteCollection: false,
        canViewAllCollections: false,
        canViewReports: false,
        canExportData: false,
        canManageSettings: false,
      };

  const hasPermission = (permission: keyof Permissions): boolean => {
    return permissions[permission];
  };

  const canAccessScreen = (screenName: string): boolean => {
    if (isAdmin) {
      return ADMIN_SCREENS.includes(screenName);
    }
    if (isOperator) {
      return OPERATOR_SCREENS.includes(screenName);
    }
    return false;
  };

  return {
    permissions,
    isAdmin,
    isOperator,
    hasPermission,
    canAccessScreen,
  };
};
