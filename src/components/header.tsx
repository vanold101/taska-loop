"use client";

interface DashboardHeaderProps {
  heading: string;
  text?: string;
}

export function DashboardHeader({ heading, text }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between space-y-2">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{heading}</h2>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
} 