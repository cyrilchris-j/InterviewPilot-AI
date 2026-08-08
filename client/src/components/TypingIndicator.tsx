import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label="Interviewer is typing">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="size-2 rounded-full bg-muted-foreground"
          animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}