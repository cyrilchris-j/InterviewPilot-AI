import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  GraduationCap,
  SkipForward,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "../lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import type { CandidateDetail, Mission } from "../types";

type Props = {
  candidate: CandidateDetail;
  onBegin: () => void;
  onBack: () => void;
};

function MissionRow({ mission, index }: { mission: Mission; index: number }) {
  const isSkipped = !!mission.skipped;
  const attempts = mission.attempts ?? 1;
  const isHard = attempts >= 4;
  const isMedium = attempts === 2 || attempts === 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all",
        isSkipped
          ? "border-yellow-400/20 bg-yellow-400/5"
          : isHard
          ? "border-orange-400/20 bg-orange-400/5"
          : "border-border bg-card"
      )}
    >
      {/* Day badge */}
      <div
        className={cn(
          "flex h-7 w-12 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums",
          isSkipped
            ? "bg-yellow-400/15 text-yellow-400"
            : isHard
            ? "bg-orange-400/15 text-orange-400"
            : "bg-primary/10 text-primary"
        )}
      >
        D{mission.day}
      </div>

      {/* Title */}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{mission.title}</div>
      </div>

      {/* Status */}
      {isSkipped ? (
        <div className="flex items-center gap-1 text-xs font-medium text-yellow-400">
          <SkipForward size={12} />
          Skipped
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {isHard && (
            <div className="flex items-center gap-1 text-xs font-medium text-orange-400">
              <AlertTriangle size={11} />
              {attempts} attempts
            </div>
          )}
          {isMedium && (
            <div className="text-xs text-muted-foreground">{attempts} attempts</div>
          )}
          <CheckCircle2 size={15} className="text-emerald-400" />
        </div>
      )}
    </motion.div>
  );
}

export function CandidateProfile({ candidate, onBegin, onBack }: Props) {
  const completed = candidate.missions.filter((m) => m.passed);
  const skipped = candidate.missions.filter((m) => m.skipped);
  const struggled = candidate.missions.filter((m) => m.passed && (m.attempts ?? 1) >= 4);
  const firstTryPct = Math.round(
    (candidate.signals.missionsFirstTry / Math.max(candidate.signals.missionsCompleted, 1)) * 100
  );
  const completionPct = Math.round((candidate.signals.missionsCompleted / 31) * 100);

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-10" />

      {/* Header */}
      <header className="relative flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur-sm md:px-12">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft size={15} />}>
            Candidates
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <BrainCircuit size={16} />
          </div>
          <span className="text-sm font-bold">Candidate Profile</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="relative mx-auto max-w-5xl px-4 py-8 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* LEFT: Mission history */}
          <div className="space-y-4">
            {/* Identity card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{candidate.name}</h1>
                    <div className="mt-1 text-base text-muted-foreground">{candidate.role}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap size={13} className="text-primary" />
                        {candidate.yearsExperience === 0 ? "Intern" : `${candidate.yearsExperience} yrs exp`}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap size={13} className="text-primary" />
                        {candidate.education}
                      </span>
                    </div>
                  </div>
                  <Badge
                    tone={candidate.status === "COMPLETED" ? "success" : "warning"}
                    className="h-fit px-3 py-1 text-xs"
                  >
                    {candidate.status}
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">Learning Journey</span>
                    <span className="font-bold text-primary">
                      {candidate.signals.missionsCompleted} / 31 days · {completionPct}%
                    </span>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  {/* Day markers */}
                  <div className="mt-2 flex gap-0.5">
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = i + 1;
                      const mission = candidate.missions.find((m) => m.day === day);
                      return (
                        <div
                          key={day}
                          title={mission?.title ?? `Day ${day}`}
                          className={cn(
                            "h-1.5 flex-1 rounded-sm",
                            mission?.passed
                              ? (mission.attempts ?? 1) >= 4
                                ? "bg-orange-400"
                                : "bg-primary"
                              : mission?.skipped
                              ? "bg-yellow-400/70"
                              : "bg-muted"
                          )}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-primary" /> Completed</span>
                    <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-orange-400" /> Struggled (4+ attempts)</span>
                    <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-yellow-400/70" /> Skipped</span>
                    <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-muted border border-border" /> Not attempted</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Mission list */}
            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Calendar size={15} className="text-primary" />
                <h2 className="font-semibold">Mission History</h2>
                <span className="ml-auto text-xs text-muted-foreground">{candidate.missions.length} missions in record</span>
              </div>
              <div className="space-y-2">
                {candidate.missions
                  .sort((a, b) => a.day - b.day)
                  .map((m, i) => (
                    <MissionRow key={m.day} mission={m} index={i} />
                  ))}
              </div>
            </Card>
          </div>

          {/* RIGHT: Sidebar — insights */}
          <div className="space-y-4">
            {/* Learning Signals */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp size={15} className="text-primary" />
                  <h2 className="font-semibold">Learning Signals</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
                    <span className="text-sm text-muted-foreground">Active days</span>
                    <span className={cn("text-sm font-bold", candidate.signals.commitDays >= 28 ? "text-emerald-400" : candidate.signals.commitDays >= 20 ? "text-yellow-400" : "text-foreground")}>
                      {candidate.signals.commitDays} / 31
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
                    <span className="text-sm text-muted-foreground">First-try success</span>
                    <span className={cn("text-sm font-bold", firstTryPct >= 70 ? "text-emerald-400" : firstTryPct >= 40 ? "text-yellow-400" : "text-red-400")}>
                      {candidate.signals.missionsFirstTry} ({firstTryPct}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
                    <span className="text-sm text-muted-foreground">Missions completed</span>
                    <span className="text-sm font-bold text-primary">{candidate.signals.missionsCompleted}</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Mastered */}
            {completed.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <Card className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Star size={14} className="text-emerald-400" />
                    <h2 className="font-semibold text-sm">Mastered Topics</h2>
                    <span className="ml-auto text-xs text-muted-foreground">{completed.filter(m => (m.attempts ?? 1) <= 2).length} topics</span>
                  </div>
                  <div className="space-y-1.5">
                    {completed
                      .filter((m) => (m.attempts ?? 1) <= 2)
                      .map((m) => (
                        <div key={m.day} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 size={12} className="shrink-0 text-emerald-400" />
                          <span className="text-foreground">{m.title}</span>
                        </div>
                      ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Attention areas */}
            {(skipped.length > 0 || struggled.length > 0) && (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-yellow-400" />
                    <h2 className="font-semibold text-sm">Attention Areas</h2>
                  </div>
                  <div className="space-y-1.5">
                    {skipped.map((m) => (
                      <div key={m.day} className="flex items-start gap-2 text-xs">
                        <SkipForward size={11} className="mt-0.5 shrink-0 text-yellow-400" />
                        <div>
                          <div className="font-medium text-foreground">{m.title}</div>
                          <div className="text-muted-foreground">Skipped</div>
                        </div>
                      </div>
                    ))}
                    {struggled.map((m) => (
                      <div key={m.day} className="flex items-start gap-2 text-xs">
                        <AlertTriangle size={11} className="mt-0.5 shrink-0 text-orange-400" />
                        <div>
                          <div className="font-medium text-foreground">{m.title}</div>
                          <div className="text-muted-foreground">{m.attempts} attempts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            <Separator />

            {/* AI Insights preview */}
            <Card className="border-primary/30 bg-primary/5 p-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">AI Interview Plan</div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div>· Questions drawn from <strong>{completed.length}</strong> completed missions</div>
                {skipped.length > 0 && (
                  <div>· <strong>{skipped.length}</strong> skipped topic{skipped.length > 1 ? "s" : ""} will be probed</div>
                )}
                {struggled.length > 0 && (
                  <div>· <strong>{struggled.length}</strong> struggled area{struggled.length > 1 ? "s" : ""} get deeper follow-ups</div>
                )}
                <div>· Difficulty calibrated to experience level</div>
              </div>
            </Card>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={onBegin}
                className="shadow-glow w-full py-3 text-base"
                icon={<ArrowRight size={16} />}
              >
                Build Interview for {candidate.name.split(" ")[0]}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
