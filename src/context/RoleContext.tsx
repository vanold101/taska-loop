import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, Permission, getUserRole, hasPermission } from '@/services/RoleService';
import { useAuth } from '@/hooks/use-auth';

interface RoleContextType {
  currentRole: Role | null;
  loading: boolean;
  checkPermission: (action: string, resource: string) => Promise<boolean>;
  refreshRole: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, currentHousehold } = useAuth();

  const refreshRole = async () => {
    if (!user?.uid || !currentHousehold?.id) {
      setCurrentRole(null);
      setLoading(false);
      return;
    }

    try {
      const role = await getUserRole(user.uid, currentHousehold.id);
      setCurrentRole(role);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setCurrentRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshRole();
  }, [user?.uid, currentHousehold?.id]);

  const checkPermission = async (action: string, resource: string): Promise<boolean> => {
    if (!user?.uid || !currentHousehold?.id) return false;
    return hasPermission(user.uid, currentHousehold.id, action, resource);
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        loading,
        checkPermission,
        refreshRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}; 