import { AnimatePresence, motion } from "framer-motion";
import { Copy, RotateCcw, Send } from "lucide-react";
import type { InterviewResponse, TranscriptTurn } from "../types";
import { Button } from "./ui/Button";
import { Panel } from "./ui/Panel";

type Props = {
  response: InterviewResponse;
  transcript: TranscriptTurn[];
  answer: string;
  setAnswer: (value: string) => void;
  onSubmit: () => void;
  onRestart: () => void;
  loading: boolean;
};

export function InterviewScreen({ response, transcript, answer, setAnswer, onSubmit, onRestart, loading }: Props) {
  const question = response.question;
  const progress = response.progress ?? { answered: 0, total: 8, percent: 0, coveredDays: [] };
  const confidence = response.metrics?.confidence ?? 5;

  return (
    <main className="min-h-screen bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 md:grid-cols-[280px_1fr_320px] md:px-8">
        <aside className="rounded-lg border border-line bg-panel p-4">
          <div className="text-sm uppercase tracking-wide text-slate-400">Progress</div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-cyan transition-all" style={{ width: `${progress.percent}%` }} />
          </div>
          <div className="mt-3 text-3xl font-bold">{progress.answered}/{progress.total}</div>
          <div className="mt-6 space-y-3">
            {progress.coveredDays.map((day) => (
              <div key={day} className="rounded-md border border-line bg-white/[0.03] px-3 py-2 text-sm">
                Day {day}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-md border border-amber/30 bg-amber/10 p-3">
            <div className="text-sm text-amber">Confidence Meter</div>
            <div className="mt-2 text-2xl font-semibold">{confidence}/5</div>
          </div>
        </aside>

        <section className="flex min-h-[calc(100vh-40px)] flex-col rounded-lg border border-line bg-panel">
          <div className="border-b border-line p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm text-cyan">Question {question?.index ?? 1} · {question?.stage}</div>
                <h2 className="mt-1 text-2xl font-semibold">{question?.dayTitle}</h2>
              </div>
              <div className="rounded-md border border-line px-3 py-2 text-sm text-slate-300">{question?.difficulty}</div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <AnimatePresence mode="popLayout">
              {transcript.map((turn, index) => (
                <motion.div
                  key={`${turn.speaker}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`max-w-[86%] rounded-lg border p-4 ${
                    turn.speaker === "pilot"
                      ? "border-cyan/30 bg-cyan/10 text-slate-100"
                      : "ml-auto border-line bg-white/[0.05] text-slate-200"
                  }`}
                >
                  <div className="mb-1 text-xs uppercase tracking-wide text-slate-400">
                    {turn.speaker === "pilot" ? "InterviewPilot" : "Candidate"}
                  </div>
                  <p className="whitespace-pre-wrap leading-7">{turn.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="border-t border-line p-4">
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              className="min-h-32 w-full resize-none rounded-md border border-line bg-ink p-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan"
              placeholder="Answer as the candidate..."
            />
            <div className="mt-3 flex flex-wrap justify-between gap-3">
              <Button variant="ghost" onClick={() => navigator.clipboard.writeText(transcript.map((turn) => `${turn.speaker}: ${turn.text}`).join("\n\n"))} icon={<Copy size={18} />}>
                Copy Transcript
              </Button>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={onRestart} icon={<RotateCcw size={18} />}>
                  Restart
                </Button>
                <Button onClick={onSubmit} disabled={loading || answer.trim().length < 2} icon={<Send size={18} />}>
                  Send
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Panel className="p-4">
          <div className="text-sm uppercase tracking-wide text-slate-400">Topic Timeline</div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: response.progress?.total ?? 8 }).map((_, index) => {
              const active = (question?.index ?? 1) === index + 1;
              const complete = progress.answered >= index + 1;
              return (
                <div key={index} className={`rounded-md border p-3 ${active ? "border-cyan bg-cyan/10" : complete ? "border-amber/40 bg-amber/10" : "border-line bg-white/[0.03]"}`}>
                  <div className="text-sm font-semibold">Question {index + 1}</div>
                  <div className="mt-1 text-xs text-slate-400">{active ? question?.type : complete ? "Evaluated" : "Queued"}</div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </main>
  );
}
