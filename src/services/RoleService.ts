import { 
  db,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  arrayUnion,
  arrayRemove
} from '@/lib/firebase';

// Role definitions
export type Role = 'owner' | 'admin' | 'member' | 'guest';

export interface Permission {
  action: string;
  resource: string;
}

export interface UserRole {
  userId: string;
  householdId: string;
  role: Role;
}

// Define permissions for each role
const rolePermissions: Record<Role, Permission[]> = {
  owner: [
    { action: 'manage', resource: 'household' },
    { action: 'manage', resource: 'users' },
    { action: 'manage', resource: 'roles' },
    { action: 'manage', resource: 'trips' },
    { action: 'manage', resource: 'expenses' },
    { action: 'manage', resource: 'tasks' },
    { action: 'view', resource: 'analytics' },
    { action: 'export', resource: 'data' }
  ],
  admin: [
    { action: 'manage', resource: 'trips' },
    { action: 'manage', resource: 'expenses' },
    { action: 'manage', resource: 'tasks' },
    { action: 'invite', resource: 'users' },
    { action: 'view', resource: 'analytics' },
    { action: 'export', resource: 'data' }
  ],
  member: [
    { action: 'create', resource: 'trips' },
    { action: 'edit', resource: 'trips' },
    { action: 'create', resource: 'expenses' },
    { action: 'edit', resource: 'expenses' },
    { action: 'create', resource: 'tasks' },
    { action: 'edit', resource: 'tasks' },
    { action: 'view', resource: 'analytics' }
  ],
  guest: [
    { action: 'view', resource: 'trips' },
    { action: 'view', resource: 'expenses' },
    { action: 'view', resource: 'tasks' }
  ]
};

// Get user's role in a household
export const getUserRole = async (userId: string, householdId: string): Promise<Role | null> => {
  try {
    const userRoleDoc = await getDoc(doc(db, 'households', householdId, 'roles', userId));
    if (userRoleDoc.exists()) {
      return userRoleDoc.data().role as Role;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Check if user has permission
export const hasPermission = async (
  userId: string, 
  householdId: string, 
  action: string, 
  resource: string
): Promise<boolean> => {
  try {
    const role = await getUserRole(userId, householdId);
    if (!role) return false;

    const permissions = rolePermissions[role];
    return permissions.some(
      p => (p.action === action || p.action === 'manage') && p.resource === resource
    );
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

// Update user's role
export const updateUserRole = async (
  userId: string, 
  householdId: string, 
  newRole: Role
): Promise<boolean> => {
  try {
    // Only owners can update roles
    const currentUserId = 'GET_CURRENT_USER_ID'; // Replace with actual auth user ID
    const currentUserRole = await getUserRole(currentUserId, householdId);
    
    if (currentUserRole !== 'owner') {
      throw new Error('Only household owners can update roles');
    }

    // Cannot change owner's role
    const targetUserRole = await getUserRole(userId, householdId);
    if (targetUserRole === 'owner') {
      throw new Error('Cannot change owner\'s role');
    }

    await updateDoc(doc(db, 'households', householdId, 'roles', userId), {
      role: newRole
    });

    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};

// Get all users with their roles in a household
export const getHouseholdRoles = async (householdId: string): Promise<UserRole[]> => {
  try {
    const rolesSnapshot = await getDocs(collection(db, 'households', householdId, 'roles'));
    return rolesSnapshot.docs.map(doc => ({
      userId: doc.id,
      householdId,
      role: doc.data().role as Role
    }));
  } catch (error) {
    console.error('Error getting household roles:', error);
    return [];
  }
};

// Create a new role assignment
export const assignRole = async (
  userId: string, 
  householdId: string, 
  role: Role
): Promise<boolean> => {
  try {
    // Check if user already has a role
    const existingRole = await getUserRole(userId, householdId);
    if (existingRole) {
      throw new Error('User already has a role in this household');
    }

    await updateDoc(doc(db, 'households', householdId, 'roles', userId), {
      role,
      assignedAt: new Date().toISOString(),
      assignedBy: 'GET_CURRENT_USER_ID' // Replace with actual auth user ID
    });

    return true;
  } catch (error) {
    console.error('Error assigning role:', error);
    return false;
  }
};

// Remove a role assignment
export const removeRole = async (
  userId: string, 
  householdId: string
): Promise<boolean> => {
  try {
    const role = await getUserRole(userId, householdId);
    if (role === 'owner') {
      throw new Error('Cannot remove owner role');
    }

    await updateDoc(doc(db, 'households', householdId), {
      members: arrayRemove(userId)
    });

    return true;
  } catch (error) {
    console.error('Error removing role:', error);
    return false;
  }
}; 