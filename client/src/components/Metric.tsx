export function Metric({ label, value, tone = "cyan" }: { label: string; value: string; tone?: "cyan" | "amber" | "rose" }) {
  const color = tone === "cyan" ? "text-cyan" : tone === "amber" ? "text-amber" : "text-rose";
  return (
    <div className="rounded-md border border-line bg-white/[0.03] p-3">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}
