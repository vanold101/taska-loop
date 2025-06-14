import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { LoadingSpinner } from "./loading-spinner";

interface MobileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    fullWidth, 
    loading = false,
    loadingText,
    children,
    disabled,
    ...props 
  }, ref) => {
    const isMobile = useMediaQuery("(max-width: 768px)");

    const baseStyles = cn(
      "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors active:scale-95",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      {
        "w-full": fullWidth || isMobile,
        "h-10 px-4 py-2": size === "default",
        "h-9 px-3": size === "sm",
        "h-11 px-8": size === "lg",
        "h-10 w-10": size === "icon",
        "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
        "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
        "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
        "text-primary underline-offset-4 hover:underline": variant === "link",
        "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
      },
      className
    );

    return (
      <button
        ref={ref}
        className={baseStyles}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"} />
            {loadingText && <span>{loadingText}</span>}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

MobileButton.displayName = "MobileButton";

export default MobileButton; 