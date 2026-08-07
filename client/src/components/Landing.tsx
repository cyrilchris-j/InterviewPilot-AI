import { BrainCircuit, Play, Radar, Route } from "lucide-react";
import type { CandidateSummary } from "../types";
import { Button } from "./ui/Button";
import { Panel } from "./ui/Panel";
import { Metric } from "./Metric";

type Props = {
  candidates: CandidateSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
  onStart: () => void;
  loading: boolean;
};

export function Landing({ candidates, selectedId, onSelect, onStart, loading }: Props) {
  const selected = candidates.find((candidate) => candidate.id === selectedId) ?? candidates[0];

  return (
    <main className="min-h-screen bg-ink text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 md:grid-cols-[0.85fr_1.15fr] md:px-8">
        <aside className="flex flex-col justify-between rounded-lg border border-line bg-panel p-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-md bg-cyan text-ink">
                <BrainCircuit size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">InterviewPilot AI</h1>
                <p className="text-sm text-slate-400">AI Technical Interview Agent</p>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              {candidates.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => onSelect(candidate.id)}
                  className={`w-full rounded-md border p-4 text-left transition ${
                    selectedId === candidate.id ? "border-cyan bg-cyan/10" : "border-line bg-white/[0.03] hover:border-cyan/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{candidate.name}</span>
                    <span className="text-xs text-slate-400">{candidate.id}</span>
                  </div>
                  <div className="mt-1 text-sm text-slate-300">{candidate.role}</div>
                </button>
              ))}
            </div>
          </div>
          <Button onClick={onStart} disabled={!selected || loading} icon={<Play size={18} />} className="mt-6 w-full">
            Start Interview
          </Button>
        </aside>

        <section className="flex flex-col gap-6">
          <div className="rounded-lg border border-line bg-[radial-gradient(circle_at_20%_10%,rgba(32,211,194,.18),transparent_34%),linear-gradient(135deg,#0e1a1f,#071014_68%)] p-6 md:p-8">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-cyan/30 bg-cyan/10 px-3 py-1 text-sm text-cyan">
                <Radar size={16} />
                Session-based interview engine
              </div>
              <h2 className="text-4xl font-bold leading-tight md:text-6xl">
                Senior-engineer interviews from real cohort history.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                The engine plans eight adaptive questions, tracks memory, raises or lowers difficulty, and turns every answer into feedback grounded in the 31-day curriculum.
              </p>
            </div>
          </div>

          {selected && (
            <Panel className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{selected.name}</h3>
                  <p className="text-slate-400">{selected.role} · {selected.yearsExperience} years experience</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-md border border-amber/30 bg-amber/10 px-3 py-2 text-sm text-amber">
                  <Route size={16} />
                  Personalized roadmap
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Metric label="Completed Missions" value={`${selected.completed}/31`} />
                <Metric label="First Try" value={`${selected.firstTry}`} tone="amber" />
                <Metric label="Interview Length" value="8 Qs" tone="rose" />
              </div>
            </Panel>
          )}
        </section>
      </div>
    </main>
  );
}
