import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";
import type { CandidateDetail } from "../types";

type Props = {
  candidate: CandidateDetail;
  onReady: () => void;
  isLoadingSession?: boolean;
};

function buildChecklist(candidate: CandidateDetail): string[] {
  const completed = candidate.missions.filter((m) => m.passed).length;
  const skipped = candidate.missions.filter((m) => m.skipped).length;
  const struggled = candidate.missions.filter((m) => m.passed && (m.attempts ?? 1) >= 4).length;

  return [
    `Reading ${candidate.name.split(" ")[0]}'s learning journey`,
    `Analyzing ${completed} completed missions`,
    skipped > 0
      ? `Mapping ${skipped} skipped topic${skipped > 1 ? "s" : ""} for probing`
      : "Verifying full curriculum coverage",
    struggled > 0
      ? `Flagging ${struggled} struggled area${struggled > 1 ? "s" : ""} for follow-up`
      : "Calibrating difficulty to experience",
    "Mapping curriculum objectives",
    "Generating adaptive question plan",
    "Interview plan ready",
  ];
}

const ITEM_DELAY_MS = 180;

export function AiAnalysis({ candidate, onReady, isLoadingSession }: Props) {
  const checklist = buildChecklist(candidate);
  const [visible, setVisible] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const completed = candidate.missions.filter((m) => m.passed);
  const skipped = candidate.missions.filter((m) => m.skipped);

  useEffect(() => {
    let i = 0;
    let cancelled = false;

    function reveal() {
      if (cancelled) return;
      setVisible((prev) => [...prev, i]);
      i++;
      if (i < checklist.length) {
        setTimeout(reveal, i === checklist.length - 1 ? 250 : ITEM_DELAY_MS);
      } else {
        setTimeout(() => {
          if (!cancelled) {
            setDone(true);
            setTimeout(() => onReadyRef.current(), 300);
          }
        }, 200);
      }
    }

    setTimeout(reveal, 200);
    return () => { cancelled = true; };
  }, [checklist.length]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-15" />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/6 blur-3xl"
        animate={{ scale: done ? 1.4 : 1 }}
        transition={{ duration: 1 }}
      />

      <div className="relative w-full max-w-sm">
        {/* Candidate context */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <motion.div
            className="grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground"
            animate={{
              boxShadow: done
                ? "0 0 60px hsl(var(--primary)/0.6), 0 0 120px hsl(var(--primary)/0.15)"
                : "0 0 24px hsl(var(--primary)/0.35)",
            }}
            transition={{ duration: 0.6 }}
          >
            {done ? <Sparkles size={28} /> : <BrainCircuit size={28} />}
          </motion.div>

          <div>
            <motion.div className="text-xl font-bold">
              {done ? "Interview Plan Ready" : `Analyzing ${candidate.name.split(" ")[0]}`}
            </motion.div>
            <div className="mt-1 text-sm text-muted-foreground">
              {candidate.role} · {candidate.yearsExperience === 0 ? "Intern" : `${candidate.yearsExperience} yrs`}
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          {checklist.map((item, i) => {
            const isVisible = visible.includes(i);
            const isLast = i === checklist.length - 1;

            return (
              <AnimatePresence key={item}>
                {isVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3",
                      isLast
                        ? "border-primary/50 bg-primary/10"
                        : "border-border bg-card"
                    )}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full",
                        isLast ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      )}
                    >
                      <Check size={11} strokeWidth={3} />
                    </motion.div>
                    <span className={cn("text-sm font-medium", isLast ? "text-primary" : "text-foreground")}>
                      {item}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </div>

        {/* Interview plan preview */}
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Interview Plan
              </span>
              {isLoadingSession && (
                <span className="flex items-center gap-1.5 text-xs text-primary">
                  <Loader2 size={12} className="animate-spin" /> Starting session…
                </span>
              )}
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Questions</span>
                <span className="font-semibold text-foreground">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Topics from missions</span>
                <span className="font-semibold text-foreground">{Math.min(completed.length, 5)}</span>
              </div>
              {skipped.length > 0 && (
                <div className="flex items-center justify-between">
                  <span>Skipped topic probes</span>
                  <span className="font-semibold text-yellow-400">{skipped.length}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Adaptive follow-ups</span>
                <span className="font-semibold text-foreground">Yes</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress bar */}
        {!done && (
          <motion.div
            className="mt-6 h-0.5 w-full overflow-hidden rounded-full bg-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full bg-primary"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
