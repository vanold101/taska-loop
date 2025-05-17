import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  imageUrl?: string;
}

/**
 * EmptyState component to display a consistent empty state UI across the app
 * 
 * Used for lists, history pages, and other content areas when no data is available
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  imageUrl
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center text-center px-4 py-12",
        "min-h-[200px] rounded-lg border border-dashed border-slate-200 dark:border-slate-700",
        "bg-slate-50/50 dark:bg-slate-800/50",
        className
      )}
    >
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt="Empty state illustration" 
          className="w-32 h-32 mb-6 object-contain" 
        />
      ) : icon ? (
        <div className="w-16 h-16 mb-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <div className="text-slate-400 dark:text-slate-300">
            {icon}
          </div>
        </div>
      ) : null}
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md">
        {description}
      </p>
      
      {action && (
        <motion.div 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Skeleton loader for the EmptyState component
 */
export function EmptyStateSkeleton({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center p-8",
        "min-h-[200px] rounded-lg border border-slate-200 dark:border-slate-700",
        "bg-slate-50/50 dark:bg-slate-800/50 animate-pulse",
        className
      )}
    >
      <div className="w-16 h-16 mb-6 rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
      <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
      <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
      <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
  );
} 