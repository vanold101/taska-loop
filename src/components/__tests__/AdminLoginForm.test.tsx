import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdminLoginForm from '../ui/AdminLoginForm';
import { adminLogin } from '@/services/AdminService';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/services/AdminService', () => ({
  adminLogin: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

describe('AdminLoginForm', () => {
  const mockOnSuccess = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders the admin login form correctly', () => {
    render(<AdminLoginForm onSuccess={mockOnSuccess} />);
    
    // Check for title and description
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByText('Enter your admin credentials to access the dashboard')).toBeInTheDocument();
    
    // Check for input fields
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    
    // Check for button
    expect(screen.getByRole('button', { name: 'Login as Admin' })).toBeInTheDocument();
    
    // Check for link to user login
    expect(screen.getByText('User Login')).toBeInTheDocument();
  });
  
  it('handles form submission with correct credentials', async () => {
    // Mock successful admin login
    const mockAdminUser = {
      id: 'admin-123',
      name: 'Admin User',
      email: 'admin@taskaloop.com',
      isAdmin: true
    };
    
    (adminLogin as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockAdminUser);
    
    render(<AdminLoginForm onSuccess={mockOnSuccess} />);
    
    // Fill in credentials
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@taskaloop.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'admin123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Login as Admin' }));
    
    // Check for loading state
    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeInTheDocument();
    
    // Wait for the adminLogin call to resolve
    await waitFor(() => {
      expect(adminLogin).toHaveBeenCalledWith('admin@taskaloop.com', 'admin123');
      expect(mockOnSuccess).toHaveBeenCalledWith(mockAdminUser);
      expect(localStorage.getItem('adminUser')).toBe(JSON.stringify(mockAdminUser));
    });
  });
  
  it('shows error message on invalid credentials', async () => {
    // Mock failed admin login
    (adminLogin as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    
    render(<AdminLoginForm onSuccess={mockOnSuccess} />);
    
    // Fill in credentials
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'wrong@email.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Login as Admin' }));
    
    // Wait for the adminLogin call to resolve
    await waitFor(() => {
      expect(adminLogin).toHaveBeenCalledWith('wrong@email.com', 'wrongpassword');
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(screen.getByText('Invalid admin credentials. Please try again.')).toBeInTheDocument();
    });
  });
  
  it('handles login error correctly', async () => {
    // Mock login error
    (adminLogin as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );
    
    render(<AdminLoginForm onSuccess={mockOnSuccess} />);
    
    // Fill in credentials
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@taskaloop.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'admin123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Login as Admin' }));
    
    // Wait for the adminLogin call to resolve
    await waitFor(() => {
      expect(adminLogin).toHaveBeenCalledWith('admin@taskaloop.com', 'admin123');
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(screen.getByText('Login failed. Please check your credentials and try again.')).toBeInTheDocument();
    });
  });
}); 