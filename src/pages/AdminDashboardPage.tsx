import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Shield, Users, ShoppingCart, ClipboardList, LogOut } from 'lucide-react';
import { getAllUsers } from '@/services/AdminService';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { User } from '@/context/AuthContext';
import { Task } from '@/context/TaskContext';

const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load admin data and check authorization
  useEffect(() => {
    const adminData = localStorage.getItem('adminUser');
    
    if (!adminData || !auth.currentUser) {
      toast.error('Please login as admin to access this page');
      navigate('/admin/login');
      return;
    }
    
    // Fetch users
    fetchUsers();
  }, [navigate]);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle admin logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('adminUser');
      toast.success('Successfully logged out');
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  // Load tasks for a specific user
  const loadUserTasks = (userId: string) => {
    try {
      // Retrieve tasks from user-specific localStorage
      const tasksJson = localStorage.getItem(`tasks_${userId}`);
      if (!tasksJson) return [];
      
      const tasks = JSON.parse(tasksJson) as Task[];
      
      // Return all tasks for this user
      return tasks;
    } catch (error) {
      console.error('Error loading user tasks:', error);
      return [];
    }
  };

  // Calculate total tasks across all users
  const calculateTotalTasks = () => {
    try {
      let totalTasks = 0;
      users.forEach(user => {
        const userTasks = loadUserTasks(user.id);
        totalTasks += userTasks.length;
      });
      return totalTasks;
    } catch (e) {
      return 0;
    }
  };

  // Calculate total trips across all users
  const calculateTotalTrips = () => {
    try {
      let totalTrips = 0;
      users.forEach(user => {
        try {
          const tripsJson = localStorage.getItem(`trips_${user.id}`);
          if (tripsJson) {
            const trips = JSON.parse(tripsJson);
            totalTrips += trips.length;
          }
        } catch (e) {
          // Skip this user if there's an error
        }
      });
      return totalTrips;
    } catch (e) {
      return 0;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Users
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Total Tasks
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{calculateTotalTasks()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Shopping Trips
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{calculateTotalTrips()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading users...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">{error}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => {
                      const userTasks = loadUserTasks(user.id);
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email || 'N/A'}</TableCell>
                          <TableCell>{userTasks.length}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 