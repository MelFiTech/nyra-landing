"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DockProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "left" | "right" | "middle";
  className?: string;
}

interface DockIconProps extends React.HTMLAttributes<HTMLDivElement> {}

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ className, direction = "middle", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed bottom-4 flex h-16 items-end gap-4 rounded-2xl bg-black/10 p-4 backdrop-blur-lg dark:bg-white/10",
          {
            "left-4": direction === "left",
            "right-4": direction === "right",
            "left-1/2 -translate-x-1/2": direction === "middle",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Dock.displayName = "Dock";

const DockIcon = React.forwardRef<HTMLDivElement, DockIconProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex items-end justify-center transition-all duration-300 ease-in-out hover:!-translate-y-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DockIcon.displayName = "DockIcon";

export { Dock, DockIcon };