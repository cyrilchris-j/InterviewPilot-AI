import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Check, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";
import type { UserProfile } from "../lib/profile";

type Props = {
  profile: UserProfile;
  onReady: () => void;
};

const CHECKLIST = [
  "Loading candidate experience",
  "Matching curriculum topics",
  "Generating personalized questions",
  "Creating evaluation rubric",
  "Building interview roadmap",
  "Interview ready",
];

const ITEM_DELAY_MS = 420;

export function AiAnalysis({ profile, onReady }: Props) {
  const [visible, setVisible] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    let i = 0;
    let cancelled = false;

    function reveal() {
      if (cancelled) return;
      setVisible((prev) => [...prev, i]);
      i++;
      if (i < CHECKLIST.length) {
        setTimeout(reveal, i === CHECKLIST.length - 1 ? 700 : ITEM_DELAY_MS);
      } else {
        setTimeout(() => {
          if (!cancelled) {
            setDone(true);
            setTimeout(() => onReadyRef.current(), 900);
          }
        }, 600);
      }
    }

    setTimeout(reveal, 350);
    return () => {
      cancelled = true;
    };
  }, []);

  const difficultyLabel =
    profile.difficulty === "Staff" ? "Staff / Principal" : profile.difficulty;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl"
        animate={{ scale: done ? 1.3 : 1 }}
        transition={{ duration: 1.2 }}
      />

      <div className="relative w-full max-w-sm">
        {/* Icon */}
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <motion.div
            className="grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground"
            animate={{
              boxShadow: done
                ? "0 0 48px hsl(var(--primary)/0.55), 0 0 100px hsl(var(--primary)/0.15)"
                : "0 0 20px hsl(var(--primary)/0.3)",
            }}
            transition={{ duration: 0.8 }}
          >
            {done ? <Sparkles size={28} /> : <BrainCircuit size={28} />}
          </motion.div>

          <div>
            <motion.div
              className="text-xl font-bold"
              animate={{ opacity: 1 }}
            >
              {done ? "Interview Ready" : "Analyzing your profile"}
            </motion.div>
            <div className="mt-1 text-sm text-muted-foreground">
              {profile.targetRole} · {profile.company} · {difficultyLabel}
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2.5">
          {CHECKLIST.map((item, i) => {
            const isVisible = visible.includes(i);
            const isLast = i === CHECKLIST.length - 1;

            return (
              <AnimatePresence key={item}>
                {isVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all",
                      isLast
                        ? "border-primary/50 bg-primary/10"
                        : "border-border bg-card"
                    )}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full",
                        isLast
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      <Check size={11} strokeWidth={3} />
                    </motion.div>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isLast ? "text-primary" : "text-foreground"
                      )}
                    >
                      {item}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </div>

        {/* Pulsing loading bar at bottom */}
        {!done && (
          <motion.div
            className="mt-8 h-0.5 w-full overflow-hidden rounded-full bg-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-full bg-primary"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
