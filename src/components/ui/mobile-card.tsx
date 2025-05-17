import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

const MobileCard = ({ children, className, onClick, interactive = false }: MobileCardProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const baseStyles = cn(
    "rounded-lg border bg-card text-card-foreground shadow-sm",
    {
      "cursor-pointer": interactive,
      "p-4": isMobile,
      "p-6": !isMobile,
    },
    className
  );

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    hover: interactive ? { scale: 1.02 } : {},
    tap: interactive ? { scale: 0.98 } : {},
  };

  return (
    <motion.div
      className={baseStyles}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      whileTap="tap"
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

interface MobileCardHeaderProps {
  children: ReactNode;
  className?: string;
}

const MobileCardHeader = ({ children, className }: MobileCardHeaderProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5",
        {
          "pb-3": isMobile,
          "pb-4": !isMobile,
        },
        className
      )}
    >
      {children}
    </div>
  );
};

interface MobileCardTitleProps {
  children: ReactNode;
  className?: string;
}

const MobileCardTitle = ({ children, className }: MobileCardTitleProps) => {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
    >
      {children}
    </h3>
  );
};

interface MobileCardDescriptionProps {
  children: ReactNode;
  className?: string;
}

const MobileCardDescription = ({ children, className }: MobileCardDescriptionProps) => {
  return (
    <p
      className={cn(
        "text-sm text-muted-foreground",
        className
      )}
    >
      {children}
    </p>
  );
};

interface MobileCardContentProps {
  children: ReactNode;
  className?: string;
}

const MobileCardContent = ({ children, className }: MobileCardContentProps) => {
  return (
    <div className={cn("pt-0", className)}>
      {children}
    </div>
  );
};

interface MobileCardFooterProps {
  children: ReactNode;
  className?: string;
}

const MobileCardFooter = ({ children, className }: MobileCardFooterProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        {
          "pt-3": isMobile,
          "pt-4": !isMobile,
        },
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * A smaller button component specifically for card actions with minimum touch target of 40px
 */
interface MobileCardActionProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  label: string;
}

const MobileCardAction = ({ children, className, onClick, label }: MobileCardActionProps) => {
  return (
    <motion.button
      className={cn(
        "min-w-[40px] min-h-[40px] p-2 rounded-md flex items-center justify-center",
        "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
        className
      )}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </motion.button>
  );
};

export {
  MobileCard,
  MobileCardHeader,
  MobileCardTitle,
  MobileCardDescription,
  MobileCardContent,
  MobileCardFooter,
  MobileCardAction
}; 