import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Calendar, CheckCircle2, Target } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";

type Props = {
  onBegin: () => void;
  candidateCount?: number;
};

const FEATURES = [
  { icon: Calendar, label: "31-Day AI Cohort", desc: "Based on the complete learning curriculum" },
  { icon: CheckCircle2, label: "Mission Analysis", desc: "Reads completions, skips, and attempts" },
  { icon: Target, label: "Adaptive Interview", desc: "Questions built from your actual journey" },
];

export function Landing({ onBegin, candidateCount = 20 }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/6 blur-[120px]" />

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <BrainCircuit size={18} />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight">InterviewPilot AI</span>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Cohort · 31 Days</div>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            ABTalks AI Cohort · 31 Days · 8 Modules
          </motion.div>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            Your learning journey<br />
            <span className="text-gradient">becomes your interview.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            InterviewPilot reads what you completed, where you struggled, and what you skipped across the 31-day AI Cohort — then conducts a technical interview that adapts to <em>your</em> specific journey.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm"
              >
                <f.icon size={14} className="text-primary" />
                <span className="font-medium">{f.label}</span>
                <span className="hidden text-muted-foreground sm:inline">· {f.desc}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="mt-10 flex flex-col items-center gap-3"
          >
            <Button
              onClick={onBegin}
              className="shadow-glow px-8 py-3 text-base"
              icon={<ArrowRight size={16} />}
            >
              Select a Candidate
            </Button>
            <p className="text-xs text-muted-foreground">
              {candidateCount} real AI Cohort learners · No sign-up required
            </p>
          </motion.div>
        </motion.div>

        {/* Bottom diagram */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          {["31-Day Cohort", "→", "Candidate Missions", "→", "AI Interview Plan", "→", "Adaptive Questions", "→", "Curriculum Feedback"].map(
            (item, i) => (
              <span
                key={i}
                className={
                  item === "→"
                    ? "text-muted-foreground/40"
                    : "rounded-lg border border-border bg-card px-3 py-1.5 font-medium"
                }
              >
                {item}
              </span>
            )
          )}
        </motion.div>
      </main>

      <footer className="relative py-8 text-center text-xs text-muted-foreground">
        Built for ABTalks AI Cohort Hackathon
      </footer>
    </div>
  );
}