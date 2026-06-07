import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ROLE_PERMISSIONS, type Permission } from '../types';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, ...rest } = context;

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  };

  return {
    user,
    hasPermission,
    ...rest
  };
};
