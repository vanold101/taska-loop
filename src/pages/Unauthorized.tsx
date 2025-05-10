import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFDF6] to-[#F0FDEA] dark:bg-[#1B1E18]">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center">
          <Shield className="h-24 w-24 text-gloop-primary" />
        </div>
        <h1 className="text-3xl font-bold text-[#112211] dark:text-[#F7F9F5]">
          Access Denied
        </h1>
        <p className="text-[#5B674F] dark:text-[#A9B9A2] max-w-md">
          You don't have permission to access this page. Please contact your household administrator if you believe this is a mistake.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/home')}
            className="bg-gloop-primary hover:bg-gloop-primary-dark"
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 