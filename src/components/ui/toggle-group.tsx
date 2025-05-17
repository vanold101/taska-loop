import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & {
    scrollable?: boolean;
  }
>(({ className, scrollable = false, ...props }, ref) => (
  <div className={scrollable ? "overflow-auto pb-2 -mb-2 w-full" : undefined}>
    <ToggleGroupPrimitive.Root
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-1",
        scrollable && "flex-nowrap min-w-min",
        className
      )}
      {...props}
    />
  </div>
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & {
    variant?: "default" | "outline" | "pill";
  }
>(({ className, children, variant = "default", ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      // Base styles
      "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      
      // Variant styles
      variant === "default" && 
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
      
      variant === "outline" && 
        "border border-input hover:bg-accent hover:text-accent-foreground data-[state=on]:border-primary data-[state=on]:text-primary",
      
      variant === "pill" && 
        "rounded-full px-3 py-1 shadow-sm hover:bg-accent/80 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:shadow",
      
      // Height and padding based on variant
      variant === "pill" ? "h-8" : "h-10 px-3",
      
      // Rounded corners based on variant
      variant === "pill" ? "rounded-full" : "rounded-md",
      
      className
    )}
    {...props}
  >
    {children}
  </ToggleGroupPrimitive.Item>
))

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
