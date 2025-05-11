import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Mail, ShieldCheck } from 'lucide-react'; // Using Mail as a generic icon for Google sign-in

const LoginPage: React.FC = () => {
  const { loginWithGoogle, isLoading, error, user } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // The redirection will be handled by a ProtectedRoute or effect watching the user state
    } catch (err) {
      // Error is already handled in AuthContext, but you can add specific UI feedback here if needed
      console.error("Login failed on page:", err);
    }
  };

  React.useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500/40 via-green-500/40 to-blue-500/40 dark:from-blue-700/50 dark:via-green-700/50 dark:to-blue-700/50 p-4">
      <Card className="w-full max-w-md shadow-2xl bg-background/90 dark:bg-slate-900/90 backdrop-blur-lg">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto h-16 w-16 text-blue-500 mb-4" />
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500">
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 pt-2">
            Sign in to continue to TaskaLoop.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6 md:p-8">
          {error && (
            <p className="text-center text-red-500 dark:text-red-400 bg-red-500/10 p-3 rounded-md">{error}</p>
          )}
          <Button 
            onClick={handleGoogleLogin} 
            disabled={isLoading} 
            className="w-full text-lg py-6 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-6 w-6" /> Sign in with Google
              </>
            )}
          </Button>
          <p className="text-xs text-center text-slate-500 dark:text-slate-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-white/80 mt-8">
        Don't have an account? It will be created automatically.
      </p>
    </div>
  );
};

export default LoginPage; 