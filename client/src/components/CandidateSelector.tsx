import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, Search, SkipForward, Star, Trophy, Users } from "lucide-react";
import { cn } from "../lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { CandidateDetail } from "../types";

type Props = {
  candidates: CandidateDetail[];
  onSelect: (candidate: CandidateDetail) => void;
  onBack: () => void;
};

function getTopTopics(missions: CandidateDetail["missions"]) {
  return missions
    .filter((m) => m.passed && (m.attempts ?? 1) <= 2)
    .slice(0, 3)
    .map((m) => m.title.split(" ")[0]); // short label
}

function getSkippedTopics(missions: CandidateDetail["missions"]) {
  return missions.filter((m) => m.skipped).map((m) => m.title);
}

function getStrengthScore(c: CandidateDetail): number {
  return Math.round((c.signals.missionsFirstTry / Math.max(c.signals.missionsCompleted, 1)) * 100);
}

function getCommitColor(days: number): string {
  if (days >= 28) return "text-emerald-400";
  if (days >= 20) return "text-yellow-400";
  return "text-muted-foreground";
}

const ROLES_ORDER = [
  "AI Engineer",
  "Senior",
  "Data",
  "Backend",
  "Frontend",
  "DevOps",
  "Business",
  "Marketing",
  "Intern",
];

function sortScore(c: CandidateDetail) {
  const idx = ROLES_ORDER.findIndex((r) => c.role.includes(r));
  return idx === -1 ? 99 : idx;
}

export function CandidateSelector({ candidates, onSelect, onBack }: Props) {
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = candidates
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sortScore(a) - sortScore(b));

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-15" />

      {/* Header */}
      <header className="relative flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur-sm md:px-12">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft size={15} />} className="mr-2">
            Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <BrainCircuit size={16} />
          </div>
          <div>
            <div className="text-sm font-bold">Select a Candidate</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Cohort · 31 Days</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
            <Users size={13} />
            <span>{candidates.length} learners</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Search + Title */}
      <div className="relative border-b border-border bg-background/60 px-6 py-5 backdrop-blur-sm md:px-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold tracking-tight">Choose a learner to interview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Each candidate has a unique 31-day AI Cohort history. The AI builds a personalised interview from their specific journey.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
            <Search size={15} className="shrink-0 text-muted-foreground" />
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search by name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="relative flex-1 overflow-y-auto px-6 py-6 md:px-12">
        <div className="mx-auto max-w-5xl">
          <AnimatePresence mode="popLayout">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((candidate, i) => {
                const skipped = getSkippedTopics(candidate.missions);
                const mastered = getTopTopics(candidate.missions);
                const score = getStrengthScore(candidate);
                const commitColor = getCommitColor(candidate.signals.commitDays);
                const isHovered = hoveredId === candidate.id;
                const completionPct = Math.round((candidate.signals.missionsCompleted / 31) * 100);

                return (
                  <motion.div
                    key={candidate.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    onMouseEnter={() => setHoveredId(candidate.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => onSelect(candidate)}
                    className={cn(
                      "group relative flex cursor-pointer flex-col rounded-2xl border bg-card p-5 transition-all duration-200",
                      isHovered
                        ? "border-primary/50 shadow-lg shadow-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-base font-bold">{candidate.name}</div>
                        <div className="mt-0.5 truncate text-xs text-muted-foreground">{candidate.role}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {candidate.yearsExperience === 0
                            ? "Intern / Student"
                            : `${candidate.yearsExperience} yrs exp`}{" "}
                          · {candidate.education.split(" ").slice(0, 2).join(" ")}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs font-bold">
                          <Star size={10} className="text-yellow-400" />
                          {score}%
                        </div>
                        {skipped.length === 0 && (
                          <Badge tone="success" className="text-[10px] px-1.5 py-0.5">
                            <Trophy size={9} className="mr-1" />
                            Perfect
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{candidate.signals.missionsCompleted} missions completed</span>
                        <span>{completionPct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${completionPct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.03 + 0.1 }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-2.5">
                      <div className="text-center">
                        <div className={cn("text-sm font-bold tabular-nums", commitColor)}>
                          {candidate.signals.commitDays}
                        </div>
                        <div className="text-[10px] text-muted-foreground">active days</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold tabular-nums text-primary">
                          {candidate.signals.missionsFirstTry}
                        </div>
                        <div className="text-[10px] text-muted-foreground">first try</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold tabular-nums text-red-400">{skipped.length}</div>
                        <div className="text-[10px] text-muted-foreground">skipped</div>
                      </div>
                    </div>

                    {/* Mastered topics */}
                    {mastered.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {mastered.map((t) => (
                          <span
                            key={t}
                            className="flex items-center gap-1 rounded-md bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400"
                          >
                            <CheckCircle2 size={9} />
                            {t}
                          </span>
                        ))}
                        {skipped.length > 0 && (
                          <span className="flex items-center gap-1 rounded-md bg-yellow-400/10 px-2 py-0.5 text-[10px] font-medium text-yellow-400">
                            <SkipForward size={9} />
                            {skipped.length} skipped
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA overlay */}
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
                      transition={{ duration: 0.15 }}
                      className="mt-4 flex items-center justify-between"
                    >
                      <span className="text-xs text-muted-foreground">
                        {candidate.missions.length} missions in history
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                        View profile <ArrowRight size={12} />
                      </span>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-20 text-center text-sm text-muted-foreground">
              No candidates match "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
