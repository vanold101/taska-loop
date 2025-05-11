
import { useState } from "react";
import { LogOut, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SignOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SignOutDialog = ({ open, onOpenChange }: SignOutDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      
      // Simulate sign out process
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Clear any stored user data, tokens, etc.
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Show success toast
      toast({
        title: "Successfully signed out",
        description: "You have been signed out of your account.",
      });
      
      // Close the dialog
      onOpenChange(false);
      
      // Navigate to landing page
      navigate('/');
      
    } catch (error) {
      console.error("Sign out failed:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-red-500" />
            Sign Out
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to sign out of your account?
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md flex gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            You will need to sign in again to access your account after signing out.
          </p>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing Out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Sign Out
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignOutDialog;
