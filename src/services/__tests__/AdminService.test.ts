import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  createAdminUser, 
  adminLogin, 
  isUserAdmin 
} from '../AdminService';
import { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from '@/lib/firebase';
import { setDoc } from 'firebase/firestore';

// Mock Firebase modules
vi.mock('@/lib/firebase', () => {
  const auth = {
    currentUser: { uid: 'test-admin-uid' },
    signOut: vi.fn().mockResolvedValue(undefined)
  };
  
  return {
    auth,
    doc: vi.fn().mockReturnValue('doc-ref'),
    getDoc: vi.fn().mockResolvedValue({
      exists: vi.fn().mockReturnValue(true),
      data: vi.fn().mockReturnValue({
        id: 'test-admin-uid',
        name: 'Test Admin',
        email: 'admin@test.com',
        isAdmin: true
      })
    }),
    collection: vi.fn().mockReturnValue('collection-ref'),
    query: vi.fn().mockReturnValue('query-ref'),
    where: vi.fn().mockReturnValue('where-clause'),
    getDocs: vi.fn().mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'test-admin-uid',
          data: () => ({
            name: 'Test Admin',
            email: 'admin@test.com',
            isAdmin: true
          })
        }
      ]
    }),
    createUserWithEmailAndPassword: vi.fn().mockResolvedValue({ 
      user: { uid: 'test-admin-uid' } 
    }),
    signInWithEmailAndPassword: vi.fn().mockResolvedValue({ 
      user: { uid: 'test-admin-uid' } 
    })
  };
});

// Mock setDoc from firebase/firestore
vi.mock('firebase/firestore', () => ({
  setDoc: vi.fn().mockResolvedValue(undefined)
}));

describe('AdminService', () => {
  let originalAuthCurrentUser: any;
  
  beforeEach(() => {
    // Save original auth.currentUser
    originalAuthCurrentUser = auth.currentUser;
    
    // Clear all mocks before each test
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    // Reset all mocks after each test
    vi.resetAllMocks();
    
    // Restore auth.currentUser
    (auth as any).currentUser = originalAuthCurrentUser;
  });
  
  describe('createAdminUser', () => {
    it('should create an admin user successfully', async () => {
      // Arrange
      (getDocs as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ 
        empty: true, 
        docs: [] 
      });
      
      // Act
      const result = await createAdminUser('new-admin@test.com', 'password123', 'New Admin');
      
      // Assert
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth, 
        'new-admin@test.com', 
        'password123'
      );
      expect(setDoc).toHaveBeenCalledTimes(2); // Once for admin doc, once for user doc
      expect(result).toEqual({
        id: 'test-admin-uid',
        name: 'New Admin',
        email: 'new-admin@test.com',
        isAdmin: true,
        avatar: expect.any(String)
      });
    });
    
    it('should return null if admin with email already exists', async () => {
      // Arrange
      (getDocs as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ 
        empty: false, 
        docs: [{ id: 'existing-admin' }] 
      });
      
      // Act
      const result = await createAdminUser('admin@test.com', 'password123', 'Test Admin');
      
      // Assert
      expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
      expect(setDoc).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
    
    it('should return null on error', async () => {
      // Arrange
      (getDocs as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ 
        empty: true, 
        docs: [] 
      });
      (createUserWithEmailAndPassword as unknown as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error('Auth error'));
      
      // Act
      const result = await createAdminUser('admin@test.com', 'password123', 'Test Admin');
      
      // Assert
      expect(result).toBeNull();
    });
  });
  
  describe('adminLogin', () => {
    it('should login an admin user successfully', async () => {
      // Act
      const result = await adminLogin('admin@test.com', 'password123');
      
      // Assert
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        auth, 
        'admin@test.com', 
        'password123'
      );
      expect(getDoc).toHaveBeenCalled();
      expect(result).toEqual({
        id: 'test-admin-uid',
        name: 'Test Admin',
        email: 'admin@test.com',
        isAdmin: true
      });
    });
    
    it('should return null and sign out if not an admin', async () => {
      // Arrange
      (getDoc as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        exists: () => false
      });
      
      // Act
      const result = await adminLogin('user@test.com', 'password123');
      
      // Assert
      expect(signInWithEmailAndPassword).toHaveBeenCalled();
      expect(auth.signOut).toHaveBeenCalled();
      expect(result).toBeNull();
    });
    
    it('should return null on login error', async () => {
      // Arrange
      (signInWithEmailAndPassword as unknown as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error('Auth error'));
      
      // Act
      const result = await adminLogin('admin@test.com', 'wrong-password');
      
      // Assert
      expect(result).toBeNull();
    });
  });
  
  describe('isUserAdmin', () => {
    it('should return true if current user is admin', async () => {
      // Act
      const result = await isUserAdmin();
      
      // Assert
      expect(getDoc).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    
    it('should return false if user is not authenticated', async () => {
      // Arrange
      (auth as any).currentUser = null;
      
      // Act
      const result = await isUserAdmin();
      
      // Assert
      expect(result).toBe(false);
    });
    
    it('should return false if user is not an admin', async () => {
      // Arrange
      (getDoc as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        exists: () => false
      });
      
      // Act
      const result = await isUserAdmin();
      
      // Assert
      expect(result).toBe(false);
    });
    
    it('should return false on error', async () => {
      // Arrange
      (getDoc as unknown as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error('Firestore error'));
      
      // Act
      const result = await isUserAdmin();
      
      // Assert
      expect(result).toBe(false);
    });
  });
}); 