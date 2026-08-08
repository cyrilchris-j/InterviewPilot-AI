import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, ListChecks, MessageSquareText, RotateCcw, Send, Sparkles } from "lucide-react";
import type { InterviewResponse, TranscriptTurn } from "../types";
import { cn } from "../lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
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
};

export function InterviewScreen({ response, transcript, onSubmit, onRestart, loading, error }: Props) {
  const [answer, setAnswer] = useState("");
  const question = response.question;
  const progress = response.progress ?? { answered: 0, total: 8, percent: 0, coveredDays: [] };
  const confidence = response.metrics?.confidence ?? 5;
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript]);

  const pending = loading && transcript.length > 0 && transcript[transcript.length - 1].speaker === "candidate";
  const initialLoading = loading && transcript.length === 0;

  return (
    <main className="min-h-screen">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 md:grid-cols-[300px_1fr_300px] md:px-8">
        <Card className="flex flex-col border-border/70 p-5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Progress</div>
            <ThemeToggle />
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-4xl font-bold tabular-nums">
                {progress.answered}
                <span className="text-xl text-muted-foreground">/{progress.total}</span>
              </div>
              <div className="text-xs text-muted-foreground">questions answered</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold tabular-nums">{progress.percent}%</div>
              <div className="text-xs text-muted-foreground">complete</div>
            </div>
          </div>

          <Progress value={progress.percent} className="mt-4" />

          <div className="mt-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Difficulty</div>
            <Badge
              tone={question?.difficulty === "hard" ? "destructive" : question?.difficulty === "easy" ? "success" : "warning"}
              className="mt-2"
            >
              {question?.difficulty ?? "medium"}
            </Badge>
          </div>

          <div className="mt-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Confidence signal</div>
            <div className="mt-2 flex items-center gap-1.5">
              <Progress value={confidence} max={5} className="h-1.5 flex-1" indicatorClassName="bg-warning" />
              <span className="text-sm font-semibold tabular-nums">{confidence}/5</span>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Covered days</div>
          {progress.coveredDays.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {progress.coveredDays.map((day) => (
                <Badge key={day} tone="secondary" className="px-2.5">
                  Day {day}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No curriculum days covered yet.</p>
          )}

          <div className="mt-auto pt-6">
            <Button variant="outline" size="sm" className="w-full" onClick={onRestart} icon={<RotateCcw size={15} />}>
              Restart interview
            </Button>
          </div>
        </Card>

        <Card className="flex h-[calc(100vh-40px)] flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Question <span className="font-semibold text-foreground">{question?.index ?? 1}</span> · {question?.stage || "Loading..."}
                </div>
                {initialLoading ? (
                  <div className="mt-1 h-6 w-48 animate-pulse rounded bg-muted"></div>
                ) : (
                  <h2 className="text-lg font-semibold leading-tight">{question?.dayTitle}</h2>
                )}
              </div>
            </div>
            {initialLoading ? (
              <div className="h-5 w-16 animate-pulse rounded-full bg-muted"></div>
            ) : (
              <Badge tone="secondary" className="shrink-0">
                {question?.type ?? "Concept"}
              </Badge>
            )}
          </div>

          <div ref={chatRef} className="flex-1 space-y-5 overflow-y-auto p-5" aria-live="polite">
            {error && (
              <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {transcript.map((turn, index) => {
              const isLast = index === transcript.length - 1;
              const animate = turn.speaker === "pilot" && isLast && !loading;
              return (
                <motion.div
                  key={`${turn.speaker}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={cn("max-w-[88%]", turn.speaker === "candidate" ? "ml-auto" : "mr-auto")}
                >
                  <div className={cn("flex items-center gap-2", turn.speaker === "candidate" && "flex-row-reverse")}>
                    <div
                      className={cn(
                        "grid size-7 place-items-center rounded-full text-xs font-bold",
                        turn.speaker === "pilot" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {turn.speaker === "pilot" ? "IP" : "CA"}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {turn.speaker === "pilot" ? "InterviewPilot" : "Candidate"}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "mt-1.5 rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm",
                      turn.speaker === "pilot"
                        ? "rounded-tl-sm bg-secondary/70 text-foreground"
                        : "rounded-tr-sm bg-primary/90 text-primary-foreground"
                    )}
                  >
                    {animate ? (
                      <Typewriter text={turn.text} speed={14} />
                    ) : (
                      <p className="whitespace-pre-wrap">{turn.text}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}

            <AnimatePresence>
              {pending && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground" aria-hidden="true">IP</div>
                  <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3" aria-label="Interviewer is typing">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-border p-4">
            <div className="relative">
              <Textarea
                id="answer-input"
                aria-label="Your answer"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    onSubmit(answer);
                    setAnswer("");
                  }
                }}
                placeholder="Type your answer, then press Enter to send…"
                disabled={loading}
              />
              <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">Enter</kbd> to send
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(transcript.map((turn) => `${turn.speaker}: ${turn.text}`).join("\n\n"))}
                icon={<Copy size={15} />}
              >
                Copy transcript
              </Button>
              <Button
                onClick={() => {
                  onSubmit(answer);
                  setAnswer("");
                }}
                disabled={loading || answer.trim().length < 2}
                icon={loading ? undefined : <Send size={16} />}
                size="lg"
              >
                {loading ? "Analyzing answer…" : "Send answer"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col p-5">
          <div className="flex items-center gap-2">
            <ListChecks size={16} className="text-primary" />
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Topic timeline</div>
          </div>
          <div className="mt-4 flex-1 space-y-3">
            {Array.from({ length: progress.total }).map((_, index) => {
              const active = (question?.index ?? 1) === index + 1;
              const complete = progress.answered >= index + 1;
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                    active ? "border-primary/60 bg-primary/10" : complete ? "border-border bg-muted/30" : "border-border bg-background/40"
                  )}
                >
                  <div
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums",
                      active ? "bg-primary text-primary-foreground" : complete ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {complete && !active ? "✓" : index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {active ? question?.dayTitle : complete ? "Evaluated" : "Queued"}
                    </div>
                    <div className="text-xs text-muted-foreground">{complete && !active ? "Scored" : active ? question?.type : "Upcoming"}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <MessageSquareText size={14} className="shrink-0 text-primary" />
            Responses adapt: strong answers raise difficulty, weak answers trigger a scaffolded follow-up.
          </div>
        </Card>
      </div>
    </main>
  );
}