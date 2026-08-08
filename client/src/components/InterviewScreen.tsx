import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Copy,
  RotateCcw,
  Send,
  SkipForward,
  Sparkles,
} from "lucide-react";
import type { CandidateDetail, InterviewResponse, TranscriptTurn } from "../types";
import { cn } from "../lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Textarea } from "./ui/textarea";
import { Typewriter } from "./Typewriter";
import { TypingIndicator } from "./TypingIndicator";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  response: InterviewResponse;
  transcript: TranscriptTurn[];
  onSubmit: (answer: string) => void;
  onRestart: () => void;
  loading: boolean;
  error?: string;
  candidate?: CandidateDetail;
};

/** Mini journey tracker for the sidebar */
function JourneyTracker({
  missions,
  coveredDays,
  currentDay,
}: {
  missions: CandidateDetail["missions"];
  coveredDays: number[];
  currentDay?: number;
}) {
  const relevant = missions
    .filter((m) => m.passed || m.skipped)
    .sort((a, b) => a.day - b.day);

  return (
    <div className="space-y-1.5">
      {relevant.map((m) => {
        const isCovered = coveredDays.includes(m.day);
        const isCurrent = m.day === currentDay;
        const isSkipped = !!m.skipped;

        return (
          <motion.div
            key={m.day}
            animate={{
              opacity: isCovered || isCurrent ? 1 : 0.45,
              scale: isCurrent ? 1.01 : 1,
            }}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-all",
              isCurrent && "bg-primary/10 ring-1 ring-primary/25",
              isCovered && !isCurrent && "bg-emerald-400/5",
              !isCovered && !isCurrent && "bg-muted/30"
            )}
          >
            {isCovered ? (
              <CheckCircle2 size={12} className="shrink-0 text-emerald-400" />
            ) : isSkipped ? (
              <SkipForward size={12} className="shrink-0 text-yellow-400" />
            ) : isCurrent ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <Sparkles size={12} className="shrink-0 text-primary" />
              </motion.div>
            ) : (
              <Circle size={12} className="shrink-0 text-muted-foreground" />
            )}
            <span className={cn("truncate", isCurrent ? "font-semibold text-foreground" : "text-muted-foreground")}>
              D{m.day} · {m.title.split(" ").slice(0, 3).join(" ")}
            </span>
            {isSkipped && !isCovered && (
              <span className="ml-auto shrink-0 text-[10px] text-yellow-400">skipped</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export function InterviewScreen({ response, transcript, onSubmit, onRestart, loading, error, candidate }: Props) {
  const [answer, setAnswer] = useState("");
  const question = response.question;
  const progress = response.progress ?? { answered: 0, total: 8, percent: 0, coveredDays: [] };
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript]);

  const pending = loading && transcript.length > 0 && transcript[transcript.length - 1].speaker === "candidate";
  const initialLoading = loading && transcript.length === 0;

  const handleSubmit = () => {
    const trimmed = answer.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
    setAnswer("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      {/* ── TOP BAR ── */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary">
            <Sparkles size={15} />
          </div>
          <div>
            {candidate ? (
              <>
                <div className="text-sm font-bold">{candidate.name}</div>
                <div className="text-[11px] text-muted-foreground">{candidate.role}</div>
              </>
            ) : (
              <div className="text-sm font-semibold">Interview Console</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {question && (
            <Badge tone={question.difficulty === "hard" ? "destructive" : question.difficulty === "easy" ? "success" : "warning"}>
              {question.difficulty}
            </Badge>
          )}
          <div className="hidden rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold sm:block">
            Q{progress.answered + 1} / {progress.total}
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={onRestart} icon={<RotateCcw size={14} />}>
            <span className="hidden sm:inline">Restart</span>
          </Button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR — Journey Tracker (desktop only) */}
        {candidate && (
          <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card/50 lg:flex">
            <div className="p-4">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                Interview Journey
              </div>
              <div className="mb-3 text-[10px] text-muted-foreground">
                {progress.answered} of {progress.total} answered
              </div>
              <Progress value={progress.percent} className="mb-4 h-1" />
              <JourneyTracker
                missions={candidate.missions}
                coveredDays={progress.coveredDays}
                currentDay={question?.day}
              />
            </div>
          </aside>
        )}

        {/* MAIN AREA — Chat */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Current topic header */}
          {question && !initialLoading && (
            <div className="shrink-0 border-b border-border bg-background px-5 py-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-muted-foreground">Current Topic</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="font-semibold text-foreground">{question.dayTitle}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground">Day {question.day}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground">{question.stage}</span>
              </div>
            </div>
          )}

          {/* Transcript */}
          <div ref={chatRef} className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
            {error && (
              <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {initialLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-sm text-muted-foreground">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Sparkles size={28} className="mb-3 text-primary" />
                </motion.div>
                Building your interview…
              </div>
            )}

            <AnimatePresence initial={false}>
              {transcript.map((turn, i) => {
                const isPilot = turn.speaker === "pilot";
                const isLatestPilot = isPilot && i === transcript.length - 1 && !pending;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={cn("flex", isPilot ? "justify-start" : "justify-end")}
                  >
                    <div
                      className={cn(
                        "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        isPilot
                          ? "rounded-tl-sm bg-card border border-border"
                          : "rounded-tr-sm bg-primary text-primary-foreground"
                      )}
                    >
                      {isPilot ? (
                        isLatestPilot ? (
                          <Typewriter text={turn.text} />
                        ) : (
                          turn.text
                        )
                      ) : (
                        turn.text
                      )}
                      {isPilot && (
                        <button
                          onClick={() => navigator.clipboard.writeText(turn.text)}
                          className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                        >
                          <Copy size={10} /> Copy
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {pending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>

          {/* Answer input */}
          <div className="shrink-0 border-t border-border bg-card p-4">
            <div className="flex gap-3">
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer… (⌘+Enter to send)"
                disabled={loading}
                rows={3}
                className="flex-1 resize-none text-sm"
                aria-label="Your answer"
              />
              <Button
                onClick={handleSubmit}
                disabled={!answer.trim() || loading}
                icon={<Send size={15} />}
                className="self-end"
              >
                Send
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR — question context (desktop) */}
        {question && !initialLoading && (
          <aside className="hidden w-52 shrink-0 flex-col border-l border-border bg-card/50 lg:flex">
            <div className="p-4">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-primary">
                Question Context
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Type</div>
                  <div className="font-semibold">{question.type}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Difficulty</div>
                  <div className={cn(
                    "font-semibold capitalize",
                    question.difficulty === "hard" ? "text-red-400" : question.difficulty === "easy" ? "text-emerald-400" : "text-yellow-400"
                  )}>
                    {question.difficulty}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Stage</div>
                  <div className="font-semibold">{question.stage}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Curriculum Day</div>
                  <div className="font-semibold">Day {question.day}</div>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-muted/50 p-3 text-[11px] text-muted-foreground">
                <div className="mb-1 font-semibold text-foreground">Objective</div>
                <div className="leading-relaxed">{question.objective}</div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}