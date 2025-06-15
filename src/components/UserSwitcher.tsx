import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { LogOut, User, Shield, Users, AlertTriangle, ExternalLink, Minimize2, Maximize2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const UserSwitcher: React.FC = () => {
  const { user, logout, loginWithEmail, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const { toast } = useToast();

  // Test accounts for easy switching
  const testAccounts = [
    {
      email: 'admin@taskaloop.com',
      password: 'TaskaAdmin123!',
      name: 'TaskaLoop Admin',
      type: 'admin' as const
    },
    {
      email: 'demo@taskaloop.com', 
      password: 'TaskaDemo123!',
      name: 'Demo Admin',
      type: 'admin' as const
    },
    {
      email: 'test.admin@gmail.com',
      password: 'TestAdmin123!',
      name: 'Test Admin', 
      type: 'admin' as const
    }
  ];

  const handleAccountSwitch = async (account: typeof testAccounts[0]) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      // Logout current user first
      if (user) {
        await logout();
      }
      
      // Login with test account
      await loginWithEmail(account.email, account.password);
      
      toast({
        title: "Account switched successfully",
        description: `Logged in as ${account.name}`,
      });
      
    } catch (error: any) {
      console.error('Account switch failed:', error);
      
      if (error.code === 'auth/operation-not-allowed') {
        setAuthError('Firebase Authentication not enabled');
        toast({
          title: "Authentication not enabled",
          description: "Please enable Firebase Authentication first",
          variant: "destructive",
        });
      } else if (error.code === 'auth/user-not-found') {
        setAuthError('Test accounts not created');
        toast({
          title: "Test accounts not found",
          description: "Please run the admin setup script first",
          variant: "destructive",
        });
      } else {
        setAuthError(error.message);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      // Logout current user first
      if (user) {
        await logout();
      }
      
      await loginWithGoogle();
      
      toast({
        title: "Google login successful",
        description: "Logged in with your Google account",
      });
      
    } catch (error: any) {
      console.error('Google login failed:', error);
      setAuthError(error.message);
      toast({
        title: "Google login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      setAuthError(null);
      toast({
        title: "Logged out successfully",
        description: "You have been signed out",
      });
    } catch (error: any) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // Minimized view - just a small icon
  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMinimized(false)}
          className="h-10 w-10 p-0 bg-blue-50/90 backdrop-blur border-2 border-blue-200 hover:bg-blue-100/90 shadow-lg"
          title="Expand User Switcher"
        >
          <Users className="h-4 w-4 text-blue-600" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed top-4 right-4 w-80 z-50 shadow-lg border-2 border-blue-200 bg-blue-50/90 backdrop-blur">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Switcher (Dev Only)
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-6 w-6 p-0 hover:bg-blue-100"
            title="Minimize"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Error Display */}
        {authError && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-medium">Authentication Error</span>
            </div>
            <p className="text-red-600 mt-1">{authError}</p>
            {authError.includes('not enabled') && (
              <div className="mt-2">
                <a 
                  href="https://console.firebase.google.com/project/taska-9ee86/authentication"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 underline"
                >
                  Enable Firebase Auth <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Current User */}
        {user && (
          <div className="p-2 bg-white rounded border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.isAdmin && (
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="text-xs"
                >
                  <LogOut className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Google Login */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <div className="flex items-center gap-2 w-full">
            <svg className="h-3 w-3" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-medium">Sign in with Google</span>
          </div>
        </Button>

        {/* Test Accounts */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">Test Admin Accounts:</p>
          {testAccounts.map((account) => (
            <Button
              key={account.email}
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => handleAccountSwitch(account)}
              disabled={isLoading || user?.email === account.email}
            >
              <div className="flex items-center gap-2 w-full">
                <Shield className="h-3 w-3" />
                <div className="text-left flex-1">
                  <p className="font-medium">{account.name}</p>
                  <p className="text-gray-500">{account.email}</p>
                </div>
                <Badge variant="secondary" className="text-xs">Admin</Badge>
              </div>
            </Button>
          ))}
        </div>

        {/* Setup Instructions */}
        <div className="text-xs text-gray-600 bg-white p-2 rounded border">
          <p className="font-medium mb-1">Setup Required:</p>
          <ol className="space-y-1 text-xs list-decimal list-inside">
            <li>Enable Firebase Authentication</li>
            <li>Run <code className="bg-gray-100 px-1 rounded">npm run setup-admins</code></li>
            <li>Test admin accounts will work</li>
          </ol>
        </div>

        {/* Testing Instructions */}
        <div className="text-xs text-gray-600 bg-white p-2 rounded border">
          <p className="font-medium mb-1">Testing Guide:</p>
          <ul className="space-y-1 text-xs">
            <li>• <strong>Google login:</strong> Works immediately</li>
            <li>• <strong>Admin accounts:</strong> Get sample data</li>
            <li>• <strong>Regular users:</strong> Start with blank data</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSwitcher; 