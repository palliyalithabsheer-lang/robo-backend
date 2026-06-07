import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Permission } from '../types';

interface RoleGuardProps {
  children: ReactNode;
  requirePermission: Permission;
  fallback?: ReactNode;
}

const RoleGuard = ({ children, requirePermission, fallback = null }: RoleGuardProps) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(requirePermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;
