import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ChipProps {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  className?: string
}

const Chip: React.FC<ChipProps> = ({ 
  children, 
  active = false, 
  onClick, 
  className 
}) => {
  return (
    <motion.button
      type="button"
      className={cn(
        "inline-flex items-center justify-center px-3 py-1.5 min-h-[40px]",
        "rounded-full text-sm font-medium transition-colors whitespace-nowrap",
        active 
          ? "bg-primary text-primary-foreground"
          : "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
        className
      )}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
    >
      {children}
      {active && (
        <motion.span
          layoutId="chipIndicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.button>
  )
}

interface HorizontalScrollChipsProps {
  children: React.ReactNode
  className?: string
  showArrows?: boolean
}

export const HorizontalScrollChips: React.FC<HorizontalScrollChipsProps> = ({
  children,
  className,
  showArrows = false
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = React.useState(false)
  const [showRightArrow, setShowRightArrow] = React.useState(false)

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  React.useEffect(() => {
    handleScroll()
    window.addEventListener('resize', handleScroll)
    return () => window.removeEventListener('resize', handleScroll)
  }, [])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  return (
    <div className={cn("relative", className)}>
      {showArrows && showLeftArrow && (
        <button 
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-md flex items-center justify-center"
          onClick={scrollLeft}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
      )}
      
      <div 
        ref={scrollContainerRef}
        className={cn(
          "flex gap-2 overflow-auto pb-1.5 -mb-1.5 scrollbar-hide",
          showArrows && "px-4"
        )}
        onScroll={handleScroll}
      >
        {children}
      </div>
      
      {showArrows && showRightArrow && (
        <button 
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-md flex items-center justify-center"
          onClick={scrollRight}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      )}
    </div>
  )
}

export { Chip } 