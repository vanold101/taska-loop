
import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

type FloatingActionButtonProps = {
  onClick: () => void;
  className?: string;
};

const FloatingActionButton = ({ 
  onClick,
  className 
}: FloatingActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed z-20 bottom-20 right-6 w-14 h-14 bg-gloop-accent text-gloop-text-main",
        "rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-400",
        "transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gloop-accent",
        className
      )}
    >
      <Megaphone className="h-6 w-6" />
    </button>
  );
};

export default FloatingActionButton;
