import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, CheckCircle2, GitBranch, Layers, Loader2, Radar, Sparkles, Target, UserRound } from "lucide-react";
import type { CandidateSummary } from "../types";
import { cn } from "../lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  candidates: CandidateSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
  onStart: () => void;
  loading: boolean;
  error?: string;
  onRetry?: () => void;
};

const features = [
  { icon: Target, title: "Adaptive questions", body: "Difficulty rises and falls with every answer, tuned to the candidate's 31-day cohort history." },
  { icon: BrainCircuit, title: "Session memory", body: "Topics, scores, and mistakes persist so follow-ups build on what was already said." },
  { icon: Radar, title: "Production-grounded", body: "Every score is tied to correctness, reasoning, communication, depth, and practical understanding." },
  { icon: Layers, title: "Clear roadmap", body: "Close with topic scores, recommended curriculum days, and a learning path to act on." }
];

export function Landing({ candidates, selectedId, onSelect, onStart, loading, error, onRetry }: Props) {
  const selected = candidates.find((candidate) => candidate.id === selectedId) ?? candidates[0];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
              <BrainCircuit size={22} />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight">InterviewPilot AI</div>
              <div className="text-xs text-muted-foreground">Senior-engineer technical interviews</div>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <section className="grid items-start gap-10 pt-6 lg:grid-cols-[1.25fr_1fr] lg:pt-14">
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge tone="success" className="gap-2 px-3 py-1 text-sm">
                <Sparkles size={14} />
                AI Interview Engine
              </Badge>
              <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">
                Interviews that feel like <span className="text-gradient whitespace-nowrap">real engineering</span> conversations.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
                An adaptive interviewer that reads your cohort history, plans eight grounded questions, tracks every answer in
                memory, and turns the session into a scored learning roadmap — like a premium mock interview platform.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-10 grid gap-4 sm:grid-cols-2"
            >
              {features.map((feature) => (
                <Card key={feature.title} className="p-5 transition-colors hover:border-primary/50">
                  <feature.icon className="size-5 text-primary" />
                  <div className="mt-3 font-semibold">{feature.title}</div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{feature.body}</p>
                </Card>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <Card className="overflow-hidden border-border/70 shadow-xl">
              <div className="border-b border-border bg-muted/40 p-5">
                <div className="flex items-center gap-2">
                  <UserRound size={16} className="text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Choose a candidate</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">The engine tailors the session to this profile's real cohort history.</p>
              </div>

              <div className="space-y-3 p-5">
                {error ? (
                  <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
                    <div className="text-sm font-semibold text-destructive">Could not load interviews</div>
                    <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                    {onRetry && (
                      <Button variant="outline" size="sm" className="mt-3" onClick={onRetry} disabled={loading}>
                        {loading ? "Retrying…" : "Retry"}
                      </Button>
                    )}
                  </div>
                ) : candidates.length === 0 ? (
                  <>
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                  </>
                ) : (
                  <div role="radiogroup" aria-label="Choose a candidate">
                    {candidates.map((candidate) => {
                      const active = candidate.id === selectedId;
                      return (
                        <button
                          key={candidate.id}
                          role="radio"
                          aria-checked={active}
                          onClick={() => onSelect(candidate.id)}
                          className={cn(
                            "group mb-3 w-full rounded-lg border p-4 text-left transition-all last:mb-0",
                            active ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-background hover:border-primary/60 hover:bg-muted/40"
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-semibold">{candidate.name}</div>
                              <div className="mt-0.5 text-sm text-muted-foreground">
                                {candidate.role} · {candidate.yearsExperience} yrs
                              </div>
                            </div>
                            <CheckCircle2 className={cn("size-5 shrink-0", active ? "text-primary" : "text-muted/40")} />
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <GitBranch size={12} /> {candidate.completed}/31 missions
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Sparkles size={12} /> {candidate.firstTry} first-try
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-border p-5">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={onStart}
                  disabled={!selected || loading}
                  icon={loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                >
                  {loading ? "Preparing your interview..." : "Start Interview"}
                </Button>
                {selected && (
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Plan adapts to <span className="font-semibold text-foreground">{selected.name}</span>'s profile.
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        </section>
      </div>
    </main>
  );
}