import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Check, Loader2, Sparkles, Calendar, Shield, Zap, Target } from "lucide-react";
import { cn } from "../lib/utils";
import type { CandidateAnalysisSummary, CandidateDetail, InterviewPlan } from "../types";

type Props = {
  candidate: CandidateDetail;
  onReady: () => void;
  isLoadingSession?: boolean;
  interviewPlan?: InterviewPlan;
  candidateAnalysis?: CandidateAnalysisSummary;
};

function buildChecklist(candidate: CandidateDetail): string[] {
  const completed = candidate.missions.filter((m) => m.passed).length;
  const skipped = candidate.missions.filter((m) => m.skipped).length;
  const struggled = candidate.missions.filter((m) => m.passed && (m.attempts ?? 1) >= 4).length;

  return [
    `Reading ${candidate.name.split(" ")[0]}'s learning journey`,
    `Analyzing ${completed} completed missions`,
    skipped > 0
      ? `Mapping ${skipped} skipped topic${skipped > 1 ? "s" : ""} for diagnostic probing`
      : "Verifying full curriculum coverage",
    struggled > 0
      ? `Flagging ${struggled} struggled area${struggled > 1 ? "s" : ""} for adaptive follow-ups`
      : "Calibrating difficulty to experience level",
    "Cross-referencing curriculum objectives",
    "Selecting interview topics from learning history",
    "Generating adaptive interview plan",
    "Interview plan ready",
  ];
}

/** Shorten a rationale string to a product-facing evidence label */
function evidenceLabel(rationale: string): string {
  if (rationale.includes("first attempt")) return "Mastered — test depth";
  if (rationale.includes("skipped")) return "Skipped — diagnostic probe";
  if (rationale.includes("attempts")) return "Struggled — validate understanding";
  if (rationale.includes("failed") || rationale.includes("not completed")) return "Failed — foundational check";
  if (rationale.includes("rounds out")) return "Curriculum coverage";
  return "Completed — reinforce knowledge";
}

/** Color class for difficulty */
function difficultyColor(difficulty: string): string {
  if (difficulty === "hard") return "text-red-400";
  if (difficulty === "easy") return "text-emerald-400";
  return "text-yellow-400";
}

const ITEM_DELAY_MS = 180;

export function AiAnalysis({ candidate, onReady, isLoadingSession, interviewPlan, candidateAnalysis }: Props) {
  const checklist = buildChecklist(candidate);
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

  // Use real plan data if available, otherwise derive from candidate
  const planQuestions = interviewPlan?.totalQuestions ?? 8;
  const planDays = interviewPlan?.uniqueDays?.length ?? Math.min(candidate.missions.filter((m) => m.passed).length, 5);
  const planRoadmap = interviewPlan?.roadmap ?? [];
  const difficulty = candidateAnalysis?.difficulty ?? "medium";
  const skippedCount = candidateAnalysis?.skippedDays?.length ?? candidate.missions.filter((m) => m.skipped).length;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-15" />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/6 blur-3xl"
        animate={{ scale: done ? 1.4 : 1 }}
        transition={{ duration: 1 }}
      />

      <div className="relative w-full max-w-lg">
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
              {done ? "Interview Strategy Ready" : `Analyzing ${candidate.name.split(" ")[0]}`}
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

        {/* Interview plan preview — shows REAL data from backend */}
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Interview Strategy
              </span>
              {isLoadingSession && (
                <span className="flex items-center gap-1.5 text-xs text-primary">
                  <Loader2 size={12} className="animate-spin" /> Starting…
                </span>
              )}
            </div>

            {/* Stat pills */}
            <div className="mb-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-primary mb-1">
                  <Target size={13} />
                </div>
                <div className="text-lg font-bold">{planQuestions}</div>
                <div className="text-[10px] text-muted-foreground">Questions</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-primary mb-1">
                  <Calendar size={13} />
                </div>
                <div className="text-lg font-bold">{planDays}</div>
                <div className="text-[10px] text-muted-foreground">Curriculum days</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-primary mb-1">
                  <Zap size={13} />
                </div>
                <div className={cn("text-lg font-bold capitalize", difficultyColor(difficulty))}>
                  {difficulty}
                </div>
                <div className="text-[10px] text-muted-foreground">Difficulty</div>
              </div>
            </div>

            {/* Selected curriculum days with evidence */}
            {planRoadmap.length > 0 ? (
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Selected Topics
                </div>
                {planRoadmap.map((item) => (
                  <motion.div
                    key={item.position}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: item.position * 0.06 }}
                    className="flex items-start gap-2.5 rounded-xl border border-border bg-card/70 px-3 py-2"
                  >
                    <div className="mt-0.5 flex h-5 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-[10px] font-bold text-primary">
                      D{item.day}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-foreground">{item.dayTitle}</div>
                      <div className="text-[10px] text-muted-foreground">{evidenceLabel(item.rationale)}</div>
                    </div>
                    <div className={cn("shrink-0 text-[10px] font-medium capitalize", difficultyColor(item.difficulty))}>
                      {item.difficulty}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              // Fallback when plan hasn't arrived yet (still loading)
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Topics from completed missions</span>
                  <span className="font-semibold text-foreground">{candidate.missions.filter((m) => m.passed).length}</span>
                </div>
                {skippedCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Skipped topic probes</span>
                    <span className="font-semibold text-yellow-400">{skippedCount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Adaptive follow-ups</span>
                  <span className="font-semibold text-foreground">Yes</span>
                </div>
              </div>
            )}

            {skippedCount > 0 && (
              <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-yellow-400/20 bg-yellow-400/5 px-3 py-2 text-[11px] text-yellow-400">
                <Shield size={11} />
                {skippedCount} skipped topic{skippedCount > 1 ? "s" : ""} included as diagnostic questions
              </div>
            )}
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
