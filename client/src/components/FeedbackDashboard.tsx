import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpenCheck, Download, MessageSquareText, RotateCcw, Share2, TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import type { Feedback, TranscriptTurn } from "../types";
import { cn } from "../lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { ScoreRing } from "./ScoreRing";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  feedback: Feedback;
  transcript: TranscriptTurn[];
  onRestart: () => void;
};

const avgTopicScore = (feedback: Feedback) => {
  if (!feedback.topicScores.length) return 0;
  return feedback.topicScores.reduce((sum, item) => sum + item.score, 0) / feedback.topicScores.length;
};

const ratingTone = (rating: string): "success" | "warning" | "destructive" | "secondary" =>
  rating === "Excellent" ? "success" : rating === "Strong" ? "success" : rating === "Developing" ? "warning" : "destructive";

export function FeedbackDashboard({ feedback, transcript, onRestart }: Props) {
  const radar = feedback.topicScores.slice(0, 8).map((item) => ({ topic: `D${item.day}`, score: item.score }));
  const overall = Number(
    (feedback.topicScores.length
      ? feedback.topicScores.reduce((sum, item) => sum + item.score, 0) / feedback.topicScores.length
      : 0
    ).toFixed(1)
  );

  const share = async () => {
    const text = `InterviewPilot AI — ${feedback.overallRating} (${overall}/5)\n${feedback.summary}`;
    if (navigator.share) {
      await navigator.share({ title: "InterviewPilot AI Results", text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
              <TrendingUp size={15} />
              Interview complete
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Final feedback · <span className="text-gradient capitalize">{feedback.overallRating.toLowerCase()}</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Scored across {feedback.topicScores.length} answered curriculum topics.</p>
          </motion.div>
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" onClick={() => window.print()} icon={<Download size={16} />}>
              Export PDF
            </Button>
            <Button variant="outline" onClick={share} icon={<Share2 size={16} />}>
              Share
            </Button>
            <Button onClick={onRestart} icon={<RotateCcw size={16} />}>
              Restart
            </Button>
          </div>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
          <Card className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Summary</h2>
                <Badge tone={ratingTone(feedback.overallRating)}>{feedback.overallRating}</Badge>
              </div>
              <p className="mt-3 leading-7 text-muted-foreground">{feedback.summary}</p>
            </motion.div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <List title="Strengths" items={feedback.strengths} tone="success" />
              <List title="Gaps" items={feedback.gaps} tone="destructive" />
            </div>
            <List title="Next steps" items={feedback.next} tone="warning" className="mt-4" variant="dot" />
          </Card>

          <div className="flex flex-col gap-5">
            <Card className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Overall score</h2>
              <div className="mt-4 flex flex-col items-center">
                <ScoreRing value={overall} label={<span className="text-center font-bold text-foreground">{overall}<span className="block text-xs font-normal text-muted-foreground">/ 5</span></span>} />
                <div className="mt-3 flex w-full gap-2">
                  <MetricPill label="Topics" value={`${feedback.topicScores.length}`} />
                  <MetricPill label="To review" value={`${feedback.recommendedDays.length}`} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Topic scores</h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radar} outerRadius="72%">
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="topic" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <BookOpenCheck size={18} className="text-primary" />
              <h2 className="text-xl font-semibold">Learning roadmap</h2>
            </div>
            <div className="mt-5 space-y-4">
              {feedback.learningPath.length === 0 && (
                <p className="text-sm text-muted-foreground">No curriculum days recommended for review. Strong session.</p>
              )}
              {feedback.learningPath.map((item, index) => {
                const day = feedback.recommendedDays[index];
                return (
                  <div key={item} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="grid size-8 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">{index + 1}</div>
                      {index < feedback.learningPath.length - 1 && <div className="w-px flex-1 bg-border" />}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">Revisit Day {day ?? ""}</span>
                        <Badge tone="warning" className="text-[10px]">
                          recommended
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{item}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold">Topic breakdown</h2>
            <div className="mt-5 space-y-4">
              {feedback.topicScores.map((item) => (
                <div key={item.day}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Day {item.day} · {item.topic}</span>
                    <span className="font-bold tabular-nums">{item.score}/5</span>
                  </div>
                  <Progress value={item.score} max={5} className="mt-1.5 h-1.5" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="mt-5 overflow-hidden">
          <CollapsibleTranscript transcript={transcript} />
        </Card>
      </div>
    </main>
  );
}

function List({
  title,
  items,
  tone,
  variant = "box",
  className = ""
}: {
  title: string;
  items: string[];
  tone: "success" | "destructive" | "warning";
  variant?: "box" | "dot";
  className?: string;
}) {
  const toneClasses = {
    success: "border-cyan/40 bg-cyan/10 text-cyan",
    destructive: "border-destructive/40 bg-destructive/10 text-destructive",
    warning: "border-warning/40 bg-warning/10 text-warning"
  };
  return (
    <div className={cn("rounded-lg border border-border p-4", className)}>
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.06 }}
            className={cn("rounded-md border p-3 text-sm leading-6", variant === "box" && toneClasses[tone], variant === "dot" && "border-border bg-muted/40 text-foreground")}
          >
            {variant === "dot" && <span className={cn("mr-2 inline-block size-1.5 rounded-full align-middle", tone === "warning" && "bg-warning")} />}
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-lg border border-border bg-muted/40 p-3 text-center">
      <div className="text-lg font-bold tabular-nums text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function CollapsibleTranscript({ transcript }: { transcript: TranscriptTurn[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-2">
          <MessageSquareText size={18} className="text-primary" />
          <h2 className="text-xl font-semibold">Interview transcript</h2>
        </div>
        <Badge tone="secondary">{transcript.length} messages</Badge>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="max-h-[480px] space-y-3 overflow-y-auto p-6">
              {transcript.map((turn, index) => (
                <div key={index} className="rounded-md border border-border bg-background/50 p-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{turn.speaker}</div>
                  <p className="mt-1 text-sm leading-6 text-foreground">{turn.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}