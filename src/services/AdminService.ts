import { 
  auth, 
  db, 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from '@/lib/firebase';
import { setDoc } from 'firebase/firestore';
import { User } from '@/context/AuthContext';
import type { Firestore, Auth } from 'firebase/firestore';

/**
 * Admin user interface extends the regular User interface with admin flag
 */
export interface AdminUser extends User {
  isAdmin: boolean;
}

/**
 * Create an admin user in the database
 */
export const createAdminUser = async (email: string, password: string, name: string): Promise<AdminUser | null> => {
  try {
    if (!auth || !db) {
      console.error('Firebase services not available for admin user creation');
      return null;
    }

    const authInstance = auth as any;
    const dbInstance = db as any;

    // Check if admin collection exists, create it if not
    const adminCollectionRef = collection(dbInstance, 'admins');
    
    // Check if an admin already exists with this email
    const adminQuery = query(adminCollectionRef, where('email', '==', email));
    const existingAdmins = await getDocs(adminQuery);
    
    if (!existingAdmins.empty) {
      console.error('An admin with this email already exists');
      return null;
    }
    
    // Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    const uid = userCredential.user.uid;
    
    // Create admin profile in Firestore
    const adminData: AdminUser = {
      id: uid,
      name: name,
      email: email,
      isAdmin: true,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };
    
    // Save to admins collection
    await setDoc(doc(dbInstance, 'admins', uid), adminData);
    
    // Also create a regular user entry
    await setDoc(doc(dbInstance, 'users', uid), {
      id: uid,
      name: name,
      email: email,
      avatar: adminData.avatar,
      role: 'admin'
    });
    
    return adminData;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return null;
  }
};

/**
 * Admin login function
 */
export const adminLogin = async (email: string, password: string): Promise<AdminUser | null> => {
  try {
    if (!auth || !db) {
      console.error('Firebase services not available for admin login');
      return null;
    }

    const authInstance = auth as any;
    const dbInstance = db as any;

    // Sign in with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
    const uid = userCredential.user.uid;
    
    // Check if this user is in the admins collection
    const adminDoc = await getDoc(doc(dbInstance, 'admins', uid));
    
    if (adminDoc.exists()) {
      const adminData = adminDoc.data() as AdminUser;
      return {
        ...adminData,
        id: uid
      };
    } else {
      // Not an admin user
      console.error('User is not an admin');
      await authInstance.signOut(); // Sign out the non-admin user
      return null;
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return null;
  }
};

/**
 * Check if the current authenticated user is an admin
 */
export const isUserAdmin = async (): Promise<boolean> => {
  try {
    if (!auth || !db) {
      console.warn('Firebase services not available for admin check');
      return false;
    }

    const authInstance = auth as any;
    const dbInstance = db as any;

    const currentUser = authInstance.currentUser;
    if (!currentUser) return false;
    
    const adminDoc = await getDoc(doc(dbInstance, 'admins', currentUser.uid));
    return adminDoc.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Get all regular users (for admin dashboard)
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as User[];
    
    // Filter out admin users by checking admins collection
    const adminsSnapshot = await getDocs(collection(db, 'admins'));
    const adminIds = adminsSnapshot.docs.map(doc => doc.id);
    
    return users.filter(user => !adminIds.includes(user.id));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}; 