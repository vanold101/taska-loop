import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '@/context/RoleContext';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: {
    action: string;
    resource: string;
  }[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = []
}) => {
  const { user, loading: authLoading } = useAuth();
  const { checkPermission, loading: roleLoading } = useRole();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setChecking(false);
        return;
      }

      if (requiredPermissions.length === 0) {
        setHasAccess(true);
        setChecking(false);
        return;
      }

      try {
        const permissionChecks = await Promise.all(
          requiredPermissions.map(({ action, resource }) =>
            checkPermission(action, resource)
          )
        );

        setHasAccess(permissionChecks.every(Boolean));
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasAccess(false);
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [user, checkPermission, requiredPermissions]);

  if (authLoading || roleLoading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gloop-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 