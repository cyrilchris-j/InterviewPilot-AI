import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Sparkles, Target, Zap, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  onBegin: () => void;
};

const chips = [
  { icon: Zap, label: "Adaptive difficulty" },
  { icon: Shield, label: "Session memory" },
  { icon: Target, label: "Scored feedback" },
  { icon: Sparkles, label: "AI-personalized" },
];

const companies = ["Google", "OpenAI", "Meta", "Amazon", "Anthropic", "Microsoft"];

export function Landing({ onBegin }: Props) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_-5%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-64 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
      <div className="pointer-events-none absolute top-[55%] right-0 h-[400px] w-[400px] rounded-full bg-emerald-400/4 blur-3xl" />

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
            <BrainCircuit size={18} />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">InterviewPilot AI</div>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 pb-24 pt-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl"
        >
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
            <Sparkles size={13} />
            Personalized AI Interview Engine
          </div>

          {/* Headline */}
          <h1 className="mt-8 text-5xl font-bold leading-[1.04] tracking-tight md:text-7xl lg:text-[88px]">
            Your interview,
            <br />
            <span className="text-gradient">built for you.</span>
          </h1>

          {/* Subtext */}
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
            Tell us who you are. Our AI builds a fully personalized interview —
            adaptive questions, real-time difficulty tuning, and a detailed scorecard at the end.
          </p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-12"
          >
            <Button
              size="lg"
              onClick={onBegin}
              className="h-14 rounded-2xl px-10 text-[15px] font-semibold shadow-glow transition-all hover:scale-105"
              icon={<ArrowRight size={18} />}
            >
              Build My Interview
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">Takes 30 seconds · No account needed</p>
          </motion.div>

          {/* Feature chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
          >
            {chips.map((chip) => (
              <div key={chip.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <chip.icon size={14} className="text-primary" />
                {chip.label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Company logos bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-4 px-4"
        >
          <p className="text-xs text-muted-foreground">Prep for interviews at</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {companies.map((c) => (
              <span key={c} className="text-sm font-semibold text-muted-foreground/60 transition-colors hover:text-muted-foreground">
                {c}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}