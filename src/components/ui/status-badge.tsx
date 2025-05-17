import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        default:
          "bg-primary-50 text-primary-700 ring-primary-600/20 dark:bg-primary-900/30 dark:text-primary-300 dark:ring-primary-400/20",
        secondary:
          "bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-300 dark:ring-gray-400/20",
        success:
          "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-400/30",
        warning:
          "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-400/30",
        danger:
          "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-400/20",
        info:
          "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-400/30",
        open:
          "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-400/30",
        shopping:
          "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-400/30",
        outline: 
          "bg-transparent ring-1 ring-inset ring-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  icon?: React.ReactNode;
}

export function StatusBadge({
  className,
  variant,
  icon,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <div className={cn(statusBadgeVariants({ variant }), className)} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
} 