import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLoginForm from '@/components/ui/AdminLoginForm';
import { isUserAdmin } from '@/services/AdminService';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  // Check if user is already logged in as admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      // Check if admin user data exists in local storage
      const storedAdmin = localStorage.getItem('adminUser');
      
      if (storedAdmin) {
        try {
          // Verify with Firebase if this is still a valid admin
          const isAdmin = await isUserAdmin();
          
          if (isAdmin) {
            // If already logged in as admin, redirect to dashboard
            console.log('Welcome back, admin!');
            navigate('/admin/dashboard');
          } else {
            // Remove invalid admin data
            localStorage.removeItem('adminUser');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          localStorage.removeItem('adminUser');
        }
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  // Handle successful login
  const handleLoginSuccess = (adminData: any) => {
    console.log('Successfully logged in as admin!');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <AdminLoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default AdminLoginPage; 