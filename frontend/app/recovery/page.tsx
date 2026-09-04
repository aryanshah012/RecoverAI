"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { rupees, API, KEY } from "@/lib/api";
import ExplainabilityModal from "@/components/ExplainabilityModal";
import NotificationPreviewModal from "@/components/NotificationPreviewModal";
import CaseTraceModal from "@/components/CaseTraceModal";
import { OperationsHeader, StatTile, SegmentedFilter, LoadingState, EmptyState } from "@/components/OperationsUI";
import { ExternalLink, FileText, MessageSquare, RefreshCw } from "lucide-react";

export default function RecoveryCasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [explainCase, setExplainCase] = useState<any>(null);
  const [previewCase, setPreviewCase] = useState<any>(null);
  const [traceCase, setTraceCase] = useState<any>(null);

  async function fetchCases() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/recovery/cases`, {
        headers: { "X-API-Key": KEY },
      });
      if (!res.ok) throw new Error("Failed to load recovery cases");
      const data = await res.json();
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCases();
  }, []);

  const totalAtRisk = cases.reduce((acc, c) => acc + (c.status !== "recovered" ? c.amount_paise : 0), 0);
  const totalRecovered = cases.reduce((acc, c) => acc + (c.recovered_amount_paise || 0), 0);
  const recoveredCount = cases.filter((c) => c.status === "recovered").length;

  const displayedCases = cases.filter((c) => {
    if (filter === "all") return true;
    if (filter === "recovered") return c.status === "recovered";
    if (filter === "review") return c.status === "waiting_human_review";
    if (filter === "approved") return c.status === "approved";
    if (filter === "stopped") return c.status === "stopped";
    return true;
  });

  return (
    <>
      <OperationsHeader eyebrow="Case orchestration" title="Recovery cases" description="Track every diagnosis, policy decision, outreach action, and verified recovery from one operational queue." actions={<button onClick={fetchCases} className="flex h-9 items-center gap-2 rounded-lg border border-white/[.08] bg-white/[.025] px-3 text-[10px] font-medium text-zinc-400"><RefreshCw size={13}/> Refresh cases</button>} />

      {/* Top metrics */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatTile label="Total cases" value={cases.length} detail="All recovery workflows"/><StatTile label="Recovered revenue" value={rupees(totalRecovered)} detail={`${recoveredCount} verified recoveries`} tone="positive"/><StatTile label="Remaining at risk" value={rupees(totalAtRisk)} detail="Open case value" tone="warning"/><StatTile label="Case recovery rate" value={cases.length ? `${((recoveredCount / cases.length) * 100).toFixed(1)}%` : "0%"} detail="Across all resolved cases"/></div>

      {/* Filters */}
      <div className="mb-4 flex items-center justify-between"><SegmentedFilter value={filter} onChange={setFilter} items={[
          { id: "all", label: "All Cases" },
          { id: "approved", label: "Approved / Active" },
          { id: "recovered", label: "Recovered" },
          { id: "review", label: "Needs Human Review" },
          { id: "stopped", label: "Stopped by Policy" },
        ]}/><span className="hidden text-[9px] text-zinc-600 sm:block">{displayedCases.length} visible cases</span></div>

      <div className="card overflow-x-auto p-0">
        {loading ? (
          <LoadingState label="Loading recovery cases"/>
        ) : cases.length === 0 ? (
          <EmptyState title="No recovery cases yet" detail="Move an eligible failed payment into recovery to create the first case." action={<Link href="/payments" className="rounded-lg bg-emerald-400 px-3 py-2 text-[10px] font-semibold text-emerald-950">Open payments</Link>}/>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Case</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>AI Probability</th>
                <th>Diagnosis</th>
                <th>Selected Action</th>
                <th>Policy Decision</th>
                <th>Status</th>
                <th>Outreach & Links</th>
              </tr>
            </thead>
            <tbody>
              {displayedCases.map((r) => (
                <tr key={r.id}>
                  <td><Link href={`/recovery/${r.id}`} className="font-mono text-xs font-semibold text-emerald-400 hover:text-emerald-300">#{r.id}</Link></td>
                  <td className="text-xs">
                    <Link href={`/customers/${r.customer_id}`} className="text-emerald-400 hover:underline">
                      {r.customer_id}
                    </Link>
                  </td>
                  <td className="font-medium text-xs">{rupees(r.amount_paise)}</td>
                  <td>
                    <button
                      onClick={() => setExplainCase(r)}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/10 bg-emerald-400/[.05] px-2 py-1 font-mono text-[9px] font-semibold text-emerald-300"
                      title="Click to view explainable AI feature attribution"
                    >
                      <span>{((r.recovery_probability || 0) * 100).toFixed(0)}%</span>
                    </button>
                  </td>
                  <td className="text-xs text-zinc-300">
                    <span className="capitalize">{r.diagnosis ? r.diagnosis.replace(/_/g, " ") : "—"}</span>
                  </td>
                  <td className="text-xs font-mono text-amber-300/90">
                    {r.selected_action}
                  </td>
                  <td>
                    <span
                      className={`badge text-[10px] font-mono ${
                        r.policy_status === "APPROVED"
                          ? "bg-emerald-950/40 text-emerald-300 border-emerald-800"
                          : r.policy_status === "HUMAN_REVIEW_REQUIRED"
                          ? "bg-amber-950/40 text-amber-300 border-amber-800"
                          : "bg-red-950/40 text-red-300 border-red-800"
                      }`}
                    >
                      {r.policy_status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge text-[11px] capitalize font-medium ${
                        r.status === "recovered"
                          ? "bg-emerald-900/60 text-emerald-200 border-emerald-600"
                          : r.status === "waiting_human_review"
                          ? "bg-amber-900/60 text-amber-200 border-amber-600"
                          : r.status === "approved"
                          ? "bg-blue-900/60 text-blue-200 border-blue-600"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}
                    >
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setTraceCase(r)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/[.07] px-2 py-1 text-[9px] text-zinc-400 hover:text-zinc-200"
                        title="View 7-Point Safety Policy and Agent Execution Trace"
                      >
                        <FileText size={10}/> Trace
                      </button>

                      <button
                        onClick={() => setPreviewCase(r)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/[.07] px-2 py-1 text-[9px] text-zinc-400 hover:text-zinc-200"
                        title="Preview WhatsApp and Email outreach message"
                      >
                        <MessageSquare size={10}/> Preview
                      </button>

                      {r.status === "recovered" ? (
                        <span className="text-xs text-emerald-400 font-medium">✓ Paid</span>
                      ) : r.status === "waiting_human_review" ? (
                        <Link
                          href="/human-review"
                          className="text-xs bg-amber-600 hover:bg-amber-500 text-black font-semibold px-2.5 py-1 rounded transition"
                        >
                          Review <ExternalLink size={10} className="inline"/>
                        </Link>
                      ) : r.external_url ? (
                        <a
                          href={r.external_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-2 py-1 rounded transition shadow-sm"
                        >
                          Pay Link ↗
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-500">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {traceCase && (
        <CaseTraceModal
          recoveryCase={traceCase}
          onClose={() => setTraceCase(null)}
        />
      )}

      {explainCase && (
        <ExplainabilityModal
          recoveryCase={explainCase}
          onClose={() => setExplainCase(null)}
        />
      )}

      {previewCase && (
        <NotificationPreviewModal
          recoveryCase={previewCase}
          onClose={() => setPreviewCase(null)}
        />
      )}
    </>
  );
}
