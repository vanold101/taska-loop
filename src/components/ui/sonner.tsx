import { useState, useEffect } from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  // Detect theme based on document class or media query
  useEffect(() => {
    // Check if dark mode is enabled via HTML class
    const isDarkMode = document.documentElement.classList.contains("dark");
    // Or via system preference if no class is set
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (isDarkMode || prefersDark) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
