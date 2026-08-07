import { Download, RotateCcw, Share2 } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import type { Feedback, TranscriptTurn } from "../types";
import { Button } from "./ui/Button";
import { Panel } from "./ui/Panel";

type Props = {
  feedback: Feedback;
  transcript: TranscriptTurn[];
  onRestart: () => void;
};

export function FeedbackDashboard({ feedback, transcript, onRestart }: Props) {
  const radar = feedback.topicScores.slice(0, 8).map((item) => ({
    topic: `Day ${item.day}`,
    score: item.score
  }));

  const share = async () => {
    const text = `InterviewPilot AI result: ${feedback.overallRating}\n${feedback.summary}`;
    if (navigator.share) {
      await navigator.share({ title: "InterviewPilot AI Results", text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <main className="min-h-screen bg-ink px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-wide text-cyan">Final Feedback</div>
            <h1 className="mt-1 text-4xl font-bold">{feedback.overallRating}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" onClick={() => window.print()} icon={<Download size={18} />}>
              Export PDF
            </Button>
            <Button variant="ghost" onClick={share} icon={<Share2 size={18} />}>
              Share
            </Button>
            <Button onClick={onRestart} icon={<RotateCcw size={18} />}>
              Restart
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
          <Panel className="p-5">
            <h2 className="text-xl font-semibold">Summary</h2>
            <p className="mt-3 leading-7 text-slate-300">{feedback.summary}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <List title="Strengths" items={feedback.strengths} tone="cyan" />
              <List title="Gaps" items={feedback.gaps} tone="rose" />
            </div>
            <List title="Next" items={feedback.next} tone="amber" className="mt-4" />
          </Panel>

          <Panel className="p-5">
            <h2 className="text-xl font-semibold">Topic Radar</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar}>
                  <PolarGrid stroke="#23404a" />
                  <PolarAngleAxis dataKey="topic" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                  <Radar dataKey="score" stroke="#20d3c2" fill="#20d3c2" fillOpacity={0.32} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Panel className="p-5">
            <h2 className="text-xl font-semibold">Learning Path</h2>
            <div className="mt-4 space-y-3">
              {feedback.learningPath.map((item) => (
                <div key={item} className="rounded-md border border-line bg-white/[0.03] p-4 text-slate-300">{item}</div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <h2 className="text-xl font-semibold">Interview Transcript</h2>
            <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
              {transcript.map((turn, index) => (
                <div key={index} className="rounded-md border border-line bg-white/[0.03] p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">{turn.speaker}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{turn.text}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}

function List({ title, items, tone, className = "" }: { title: string; items: string[]; tone: "cyan" | "amber" | "rose"; className?: string }) {
  const colors = tone === "cyan" ? "border-cyan/30 bg-cyan/10" : tone === "amber" ? "border-amber/30 bg-amber/10" : "border-rose/30 bg-rose/10";
  return (
    <div className={`rounded-lg border border-line bg-white/[0.02] p-4 ${className}`}>
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className={`rounded-md border p-3 text-sm leading-6 text-slate-200 ${colors}`}>{item}</div>
        ))}
      </div>
    </div>
  );
}
