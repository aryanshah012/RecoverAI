interface StatusBadgeProps {
  status: string;
}

const styles: Record<string, string> = {
  recovered: "bg-emerald-950/60 text-emerald-300 border-emerald-800",
  captured: "bg-emerald-950/60 text-emerald-300 border-emerald-800",
  approved: "bg-blue-950/60 text-blue-300 border-blue-800",
  failed: "bg-red-950/60 text-red-300 border-red-800",
  pending: "bg-amber-950/60 text-amber-300 border-amber-800",
  waiting_human_review: "bg-amber-950/60 text-amber-300 border-amber-800",
  in_progress: "bg-indigo-950/60 text-indigo-300 border-indigo-800",
  stopped: "bg-zinc-900 text-zinc-400 border-zinc-700",
  escalated: "bg-purple-950/60 text-purple-300 border-purple-800",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = (status || "").toLowerCase().replace(/ /g, "_");
  const style = styles[normalized] || "bg-zinc-900 text-zinc-300 border-zinc-700";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border capitalize ${style}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
