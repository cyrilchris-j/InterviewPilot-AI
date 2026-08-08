import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type BadgeTone = "default" | "secondary" | "outline" | "success" | "warning" | "destructive";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  outline: "border-border text-foreground",
  success: "border-cyan/40 bg-cyan/10 text-cyan",
  warning: "border-warning/40 bg-warning/10 text-warning",
  destructive: "border-destructive/40 bg-destructive/10 text-destructive"
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, tone = "default", ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
      toneClasses[tone],
      className
    )}
    {...props}
  />
));
Badge.displayName = "Badge";