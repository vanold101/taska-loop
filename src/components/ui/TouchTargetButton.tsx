import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const touchTargetVariants = cva(
  "relative min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation",
  {
    variants: {
      padding: {
        default: "px-4",
        compact: "px-2",
        none: "",
      },
      shape: {
        default: "rounded-md",
        circle: "rounded-full",
        square: "rounded-none",
      },
      feedback: {
        default: "active:scale-95 transition-transform",
        none: "",
      },
    },
    defaultVariants: {
      padding: "default",
      shape: "default",
      feedback: "default",
    },
  }
);

export interface TouchTargetButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof touchTargetVariants> {
  asChild?: boolean;
  loading?: boolean;
  buttonClassName?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export const TouchTargetButton = React.forwardRef<HTMLButtonElement, TouchTargetButtonProps>(
  ({ 
    className,
    buttonClassName,
    padding,
    shape,
    feedback,
    children,
    loading,
    disabled,
    variant = "default",
    ...props 
  }, ref) => {
    return (
      <div className={cn(touchTargetVariants({ padding, shape, feedback }), className)}>
        <Button
          ref={ref}
          variant={variant}
          className={cn(
            "relative w-full h-full",
            loading && "opacity-80",
            buttonClassName
          )}
          disabled={disabled || loading}
          {...props}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </div>
          ) : null}
          <div className={cn(loading && "invisible")}>{children}</div>
        </Button>
      </div>
    );
  }
);

TouchTargetButton.displayName = "TouchTargetButton"; 