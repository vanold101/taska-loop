import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Shield, Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, createGuestUser, isLoading, error, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  // Get the redirect location or default to home
  const from = (location.state as LocationState)?.from?.pathname || '/home';

  const handleGoogleLogin = async () => {
    setLoginError(null);
    try {
      await loginWithGoogle();
      // The redirection will be handled by the useEffect below
    } catch (err) {
      setLoginError("Login failed. Please try again.");
      console.error("Login failed on page:", err);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Basic validation
    if (!formData.email || !formData.password) {
      setLoginError('Please fill in all required fields.');
      return;
    }

    if (isSignUp) {
      if (!formData.name) {
        setLoginError('Please enter your name.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setLoginError('Passwords do not match.');
        return;
      }
      if (formData.password.length < 6) {
        setLoginError('Password must be at least 6 characters long.');
        return;
      }
    }

    try {
      if (isSignUp) {
        await registerWithEmail(formData.email, formData.password, formData.name);
      } else {
        await loginWithEmail(formData.email, formData.password);
      }
      // The redirection will be handled by the useEffect below
    } catch (err) {
      // Error is already handled in the auth context
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setLoginError(null);
    setFormData({ email: '', password: '', name: '', confirmPassword: '' });
  };

  const toggleEmailForm = () => {
    setShowEmailForm(!showEmailForm);
    setLoginError(null);
    setFormData({ email: '', password: '', name: '', confirmPassword: '' });
  };

  React.useEffect(() => {
    if (user) {
      // Navigate to the previous route or home
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-teal-100 flex items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Home</span>
        </Link>
      </div>

      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            {showEmailForm ? (isSignUp ? 'Create Account' : 'Welcome Back!') : 'Welcome Back!'}
          </CardTitle>
          <CardDescription className="text-slate-600">
            {showEmailForm ? (isSignUp ? 'Sign up to get started with TaskaLoop.' : 'Sign in to continue to TaskaLoop.') : 'Sign in to continue to TaskaLoop.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(error || loginError) && (
            <p className="text-center text-red-500 dark:text-red-400 bg-red-500/10 p-3 rounded-md">
              {error || loginError}
            </p>
          )}

          {!showEmailForm ? (
            <>
              <Button
                className="w-full py-6 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 0.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                )}
                Sign in with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full py-6 border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={toggleEmailForm}
                disabled={isLoading}
              >
                <Mail className="mr-2 h-4 w-4" />
                Sign in with Email
              </Button>
            </>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required={isSignUp}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required={isSignUp}
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full py-6 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : null}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>

              <div className="flex items-center justify-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={toggleAuthMode}
                  className="text-sm text-slate-600 hover:text-slate-800"
                >
                  {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                </Button>
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={toggleEmailForm}
                className="w-full text-sm text-slate-500 hover:text-slate-700"
              >
                ← Back to other options
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-center text-sm text-slate-500">
            By signing in, you agree to our{" "}
            <Link to="#" className="text-teal-600 hover:text-teal-700 underline underline-offset-4">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="#" className="text-teal-600 hover:text-teal-700 underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>
          {!showEmailForm && (
            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an account? It will be created automatically.
            </p>
          )}
          
          {/* Skip Sign In Button */}
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              try {
                await createGuestUser();
                // Navigation will happen automatically via the auth context when user is set
              } catch (error) {
                console.error('Error creating guest user:', error);
                alert('Failed to create guest user. Please try again.');
              }
            }}
            className="w-full py-3 bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
          >
            🚀 Skip Sign In for Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage; 