import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ProgressProps = HTMLAttributes<HTMLDivElement> & {
  value: number;
  max?: number;
  indicatorClassName?: string;
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, indicatorClassName, ...props }, ref) => {
    const percent = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
        {...props}
      >
        <div
          className={cn("h-full rounded-full bg-primary transition-[width] duration-500 ease-out", indicatorClassName)}
          style={{ width: `${percent}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";