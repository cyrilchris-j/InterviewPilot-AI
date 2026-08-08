import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpenCheck,
  FileJson,
  Medal,
  MessageSquareText,
  Printer,
  RotateCcw,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

const STRONG_THRESHOLD = 4;
const WEAK_THRESHOLD = 3;

export function AnalyticsDashboard({ feedback, transcript, onRestart }: Props) {
  const overall = useMemo(() => average(feedback.topicScores.map((item) => item.score)), [feedback]);
  const strongTopics = feedback.topicScores.filter((item) => item.score >= STRONG_THRESHOLD);
  const weakTopics = feedback.topicScores.filter((item) => item.score < WEAK_THRESHOLD);
  const timeline = feedback.topicScores.map((item, index) => ({ q: index + 1, score: item.score, topic: item.topic }));
  const radar = feedback.topicScores.slice(0, 8).map((item) => ({ topic: `D${item.day}`, score: item.score }));

  const exportJson = () => {
    const report = {
      exportedAt: new Date().toISOString(),
      overallScore: overall,
      overallRating: feedback.overallRating,
      summary: feedback.summary,
      topicScores: feedback.topicScores,
      strongTopics: strongTopics.map((item) => ({ day: item.day, topic: item.topic, score: item.score })),
      weakTopics: weakTopics.map((item) => ({ day: item.day, topic: item.topic, score: item.score })),
      recommendedDays: feedback.recommendedDays,
      learningPath: feedback.learningPath,
      strengths: feedback.strengths,
      gaps: feedback.gaps,
      next: feedback.next,
      transcript: transcript.map((turn, index) => ({ speaker: turn.speaker, turn: index + 1, text: turn.text }))
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `interview-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-primary">
              <BarChart3 size={15} />
              Analytics dashboard
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Interview analytics</h1>
            <p className="mt-1 text-sm text-muted-foreground">Performance breakdown across {feedback.topicScores.length} answered curriculum topics.</p>
          </motion.div>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" onClick={() => window.print()} icon={<Printer size={16} />} aria-label="Print report">
              Print
            </Button>
            <Button variant="outline" onClick={exportJson} icon={<FileJson size={16} />} aria-label="Export JSON report">
              Export report
            </Button>
            <Button onClick={onRestart} icon={<RotateCcw size={16} />} aria-label="Start new interview">
              New interview
            </Button>
          </div>
        </header>

        <div className="mt-6 grid gap-5 md:grid-cols-[240px_1fr]">
          <Card className="flex h-fit flex-col items-center p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Overall score</div>
            <div className="mt-4">
              <ScoreRing value={overall} size={150} strokeWidth={12} label={<span className="text-center text-3xl font-bold text-foreground">{overall}<span className="block text-xs font-normal text-muted-foreground">/ 5</span></span>} />
            </div>
            <Badge tone={ratingTone(feedback.overallRating)} className="mt-4">
              {feedback.overallRating}
            </Badge>
            <div className="mt-5 flex w-full gap-2">
              <StatTile label="Answers" value={`${feedback.topicScores.length}`} />
              <StatTile label="Recommend" value={`${feedback.recommendedDays.length}`} />
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle icon={<TrendingUp size={16} />}>Session timeline</SectionTitle>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="q" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} labelFormatter={(_, payload) => String(payload?.[0]?.payload?.topic ?? "")} formatter={(value: number | string) => [`${value}/5`, "Score"]} />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#scoreFill)" dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card className="p-6">
            <SectionTitle>Radar · topic coverage</SectionTitle>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar} outerRadius="75%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="topic" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.28} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle>Topic-wise performance</SectionTitle>
            <div className="mt-5 space-y-4">
              {feedback.topicScores.length === 0 && <p className="text-sm text-muted-foreground">No answered topics to show.</p>}
              {feedback.topicScores.map((item) => (
                <div key={item.day}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Day {item.day} · {item.topic}</span>
                    <span className={cn("font-bold tabular-nums", item.score >= STRONG_THRESHOLD ? "text-cyan" : item.score < WEAK_THRESHOLD ? "text-destructive" : "text-warning")}>{item.score}/5</span>
                  </div>
                  <Progress value={item.score} max={5} className="mt-1.5 h-1.5" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card className="p-6">
            <SectionTitle tone="success">Strong topics</SectionTitle>
            {strongTopics.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No topic reached {STRONG_THRESHOLD}/5 yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {strongTopics.map((item) => (
                  <li key={item.day} className="flex items-center justify-between rounded-lg border border-cyan/30 bg-cyan/10 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-medium"><Medal size={15} className="text-cyan" /> Day {item.day} · {item.topic}</span>
                    <span className="text-sm font-bold tabular-nums text-cyan">{item.score}/5</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <SectionTitle tone="destructive">Weak topics</SectionTitle>
            {weakTopics.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Nothing below {WEAK_THRESHOLD}/5 — solid session.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {weakTopics.map((item) => (
                  <li key={item.day} className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Day {item.day} · {item.topic}</span>
                      <span className="text-sm font-bold tabular-nums text-destructive">{item.score}/5</span>
                    </div>
                    <Badge tone="destructive" className="mt-2">Focus area</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card className="p-6">
            <SectionTitle tone="success">Recommendations</SectionTitle>
            <div className="mt-4 space-y-4">
              <SubBlock title="What to review next" items={feedback.learningPath} />
              <SubBlock title="Actionable next steps" items={feedback.next} variant="dot" />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <TranscriptSection transcript={transcript} />
          </Card>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({ children, icon, tone = "default" }: { children: ReactNode; icon?: ReactNode; tone?: "default" | "destructive" | "success" }) {
  return (
    <div className="flex items-center gap-2 text-lg font-semibold">
      {icon ?? <Sparkles size={17} className={tone === "destructive" ? "text-destructive" : tone === "success" ? "text-cyan" : "text-primary"} />}
      {children}
    </div>
  );
}

function SubBlock({ title, items, variant = "box" }: { title: string; items: string[]; variant?: "box" | "dot" }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className={cn("flex items-center gap-2 text-sm font-semibold", variant === "dot" && "text-warning")}>
        {variant === "dot" ? <Sparkles size={15} className="text-warning" /> : <BookOpenCheck size={15} className="text-primary" />}
        {title}
      </div>
      <ul className="mt-3 space-y-2">
        {items.length === 0 && <li className="text-sm text-muted-foreground">Nothing to recommend — keep going.</li>}
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm leading-6 text-foreground">
            <span className={cn("mt-2 inline-block size-1.5 shrink-0 rounded-full", variant === "dot" ? "bg-warning" : "bg-primary")} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-lg border border-border bg-muted/40 p-3 text-center">
      <div className="text-lg font-bold tabular-nums text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function TranscriptSection({ transcript }: { transcript: TranscriptTurn[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between p-6 text-left">
        <div className="flex items-center gap-2">
          <MessageSquareText size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">Interview transcript</h2>
        </div>
        <Badge tone="secondary">{transcript.length} messages</Badge>
      </button>
      {open && (
        <div className="border-t border-border">
          <div className="max-h-[440px] space-y-3 overflow-y-auto p-6">
            {transcript.map((turn, index) => (
              <div key={index} className="rounded-md border border-border bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{turn.speaker}</span>
                  <span className="text-xs text-muted-foreground">#{index + 1}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-foreground">{turn.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function average(values: number[]): number {
  return values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : 0;
}

function ratingTone(rating: string): "success" | "warning" | "destructive" | "secondary" {
  return rating === "Excellent" || rating === "Strong" ? "success" : rating === "Developing" ? "warning" : "destructive";
}