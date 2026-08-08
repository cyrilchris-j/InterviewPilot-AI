import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, BrainCircuit, Check } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import type { UserProfile } from "../lib/profile";

type Props = {
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
};

type StepOption = {
  value: string;
  label: string;
  emoji?: string;
  description?: string;
};

type Step = {
  id: keyof UserProfile;
  question: string;
  subtext: string;
  options: StepOption[];
  columns: number;
};

const STEPS: Step[] = [
  {
    id: "role",
    question: "Who are you?",
    subtext: "Your background shapes the interview style, depth, and follow-up strategy.",
    columns: 3,
    options: [
      { value: "Student", label: "Student", emoji: "🎓" },
      { value: "Fresh Graduate", label: "Fresh Graduate", emoji: "🌱" },
      { value: "Frontend Developer", label: "Frontend", emoji: "🎨" },
      { value: "Backend Developer", label: "Backend", emoji: "⚙️" },
      { value: "Full Stack", label: "Full Stack", emoji: "🔧" },
      { value: "AI Engineer", label: "AI Engineer", emoji: "🤖" },
      { value: "Data Scientist", label: "Data Scientist", emoji: "📊" },
      { value: "DevOps Engineer", label: "DevOps", emoji: "☁️" },
      { value: "Product Manager", label: "Product Manager", emoji: "📋" },
    ],
  },
  {
    id: "experience",
    question: "Years of experience?",
    subtext: "We calibrate difficulty and question depth precisely to your level.",
    columns: 5,
    options: [
      { value: "0", label: "0", description: "Just starting" },
      { value: "1-2", label: "1–2", description: "Junior" },
      { value: "3-5", label: "3–5", description: "Mid-level" },
      { value: "5-10", label: "5–10", description: "Senior" },
      { value: "10+", label: "10+", description: "Principal +" },
    ],
  },
  {
    id: "company",
    question: "Which company?",
    subtext: "Interview bar, culture fit, and focus areas vary significantly by company.",
    columns: 4,
    options: [
      { value: "Google", label: "Google", emoji: "🔵" },
      { value: "Microsoft", label: "Microsoft", emoji: "🟦" },
      { value: "Amazon", label: "Amazon", emoji: "🟠" },
      { value: "Meta", label: "Meta", emoji: "🔷" },
      { value: "OpenAI", label: "OpenAI", emoji: "⚫" },
      { value: "Anthropic", label: "Anthropic", emoji: "🟤" },
      { value: "Startup", label: "Startup", emoji: "🚀" },
      { value: "Other", label: "Other", emoji: "🏢" },
    ],
  },
  {
    id: "targetRole",
    question: "Desired role?",
    subtext: "Topic selection and evaluation rubrics are tailored to this exact role.",
    columns: 2,
    options: [
      { value: "AI Engineer", label: "AI Engineer" },
      { value: "Machine Learning Engineer", label: "ML Engineer" },
      { value: "Software Engineer", label: "Software Engineer" },
      { value: "Backend Engineer", label: "Backend Engineer" },
      { value: "Frontend Engineer", label: "Frontend Engineer" },
      { value: "Full Stack Engineer", label: "Full Stack Engineer" },
      { value: "DevOps Engineer", label: "DevOps / Platform" },
      { value: "Data Scientist", label: "Data Scientist" },
    ],
  },
  {
    id: "interviewType",
    question: "Interview style?",
    subtext: "Each style tests a fundamentally different dimension of engineering skill.",
    columns: 2,
    options: [
      { value: "Technical", label: "Technical", description: "Concepts, tools, architecture" },
      { value: "Behavioral", label: "Behavioral", description: "Leadership, decisions, teamwork" },
      { value: "System Design", label: "System Design", description: "Scale, tradeoffs, components" },
      { value: "Coding", label: "Coding", description: "Algorithms, debugging, patterns" },
      { value: "Mixed", label: "Mixed", description: "Balanced across all types" },
    ],
  },
  {
    id: "difficulty",
    question: "Set the bar.",
    subtext: "Higher difficulty unlocks deeper probing, harder scenarios, and stricter evaluation.",
    columns: 3,
    options: [
      { value: "Easy", label: "Easy", description: "Junior fundamentals" },
      { value: "Medium", label: "Medium", description: "Mid-level expectations" },
      { value: "Hard", label: "Hard", description: "Senior depth" },
      { value: "Senior", label: "Senior", description: "System design + depth" },
      { value: "Staff", label: "Staff / Principal", description: "Extreme depth, edge cases" },
    ],
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -56 : 56, opacity: 0 }),
};

export function Onboarding({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});

  const current = STEPS[step];
  const selected = profile[current.id];
  const isLast = step === STEPS.length - 1;
  const progress = ((step) / STEPS.length) * 100;

  const next = () => {
    if (!selected) return;
    if (isLast) {
      onComplete(profile as UserProfile);
    } else {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const back = () => {
    if (step === 0) {
      onBack();
    } else {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const select = (value: string) => {
    setProfile((p) => ({ ...p, [current.id]: value }));
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-25 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_-10%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />

      {/* Progress bar */}
      <div className="absolute left-0 right-0 top-0 h-[2px] bg-border">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <BrainCircuit size={18} />
          </div>
          <span className="hidden text-sm font-bold tracking-tight sm:block">InterviewPilot AI</span>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === step ? 24 : i < step ? 16 : 8,
                backgroundColor: i <= step ? "hsl(var(--primary))" : "hsl(var(--muted))",
              }}
              transition={{ duration: 0.25 }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>

        <ThemeToggle />
      </header>

      {/* Content */}
      <div className="relative flex flex-1 flex-col justify-center overflow-hidden px-4 pb-4 pt-2">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
            >
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                {current.question}
              </h2>
              <p className="mt-3 max-w-lg text-base text-muted-foreground">
                {current.subtext}
              </p>

              <div
                className={cn(
                  "mt-8 grid gap-3",
                  current.columns === 5 && "grid-cols-2 sm:grid-cols-5",
                  current.columns === 4 && "grid-cols-2 sm:grid-cols-4",
                  current.columns === 3 && "grid-cols-2 sm:grid-cols-3",
                  current.columns === 2 && "grid-cols-1 sm:grid-cols-2"
                )}
              >
                {current.options.map((option) => {
                  const isSelected = selected === option.value;
                  return (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => select(option.value)}
                      className={cn(
                        "group relative flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all duration-200",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30"
                          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                      )}
                    >
                      {option.emoji && (
                        <span className="text-xl leading-none">{option.emoji}</span>
                      )}
                      <span
                        className={cn(
                          "mt-1 text-sm font-semibold leading-tight",
                          isSelected ? "text-primary" : "text-foreground"
                        )}
                      >
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="text-xs leading-tight text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground"
                        >
                          <Check size={11} strokeWidth={3} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="relative border-t border-border px-6 py-5 md:px-12">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Button variant="ghost" onClick={back} icon={<ArrowLeft size={15} />}>
            Back
          </Button>
          <div className="flex items-center gap-3">
            {selected && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-muted-foreground"
              >
                <span className="font-semibold text-foreground">{selected}</span> selected
              </motion.span>
            )}
            <Button
              onClick={next}
              disabled={!selected}
              icon={<ArrowRight size={15} />}
              className={cn(isLast && "shadow-glow")}
            >
              {isLast ? "Generate My Interview" : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
