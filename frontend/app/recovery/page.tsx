"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { rupees, API, KEY } from "@/lib/api";
import ExplainabilityModal from "@/components/ExplainabilityModal";
import NotificationPreviewModal from "@/components/NotificationPreviewModal";
import CaseTraceModal from "@/components/CaseTraceModal";
import { StatusBadge } from "@/components/StatusBadge";

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Active Recovery Cases</h1>
          <p className="muted mt-1 text-sm">
            AI-diagnosed cases with bounded recovery actions, explainable attribution, and deterministic policies.
          </p>
        </div>
        <button
          onClick={fetchCases}
          className="border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs px-3 py-2 rounded-lg transition"
        >
          ↻ Refresh Cases
        </button>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Total Cases</div>
          <div className="text-2xl font-bold mt-1 text-white">{cases.length}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Recovered Revenue</div>
          <div className="text-2xl font-bold mt-1 text-emerald-400">{rupees(totalRecovered)}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Remaining at Risk</div>
          <div className="text-2xl font-bold mt-1 text-amber-400">{rupees(totalAtRisk)}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Case Recovery Rate</div>
          <div className="text-2xl font-bold mt-1 text-zinc-200">
            {cases.length ? `${((recoveredCount / cases.length) * 100).toFixed(1)}%` : "0%"}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {[
          { id: "all", label: "All Cases" },
          { id: "approved", label: "Approved / Active" },
          { id: "recovered", label: "Recovered" },
          { id: "review", label: "Needs Human Review" },
          { id: "stopped", label: "Stopped by Policy" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              filter === item.id
                ? "bg-zinc-800 text-white border-zinc-600"
                : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="py-8 text-center text-zinc-400 text-sm">Loading recovery cases...</div>
        ) : cases.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            <p className="text-base font-medium">No recovery cases yet.</p>
            <p className="text-xs mt-1">Go to Payments to run recovery on any failed payment!</p>
            <Link
              href="/payments"
              className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-lg"
            >
              Go to Payments →
            </Link>
          </div>
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
                  <td className="font-mono text-xs font-semibold text-white">#{r.id}</td>
                  <td className="text-xs">
                    <Link href={`/customers/${r.customer_id}`} className="text-emerald-400 hover:underline">
                      {r.customer_id}
                    </Link>
                  </td>
                  <td className="font-medium text-xs">{rupees(r.amount_paise)}</td>
                  <td>
                    <button
                      onClick={() => setExplainCase(r)}
                      className="inline-flex items-center gap-1 font-mono text-xs text-indigo-300 hover:text-indigo-200 bg-indigo-950/40 hover:bg-indigo-950 border border-indigo-800/60 px-2 py-0.5 rounded transition"
                      title="Click to view explainable AI feature attribution"
                    >
                      <span>{((r.recovery_probability || 0) * 100).toFixed(0)}%</span>
                      <span className="text-[10px]">ℹ️</span>
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
                        className="text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition flex items-center gap-1"
                        title="View 7-Point Safety Policy and Agent Execution Trace"
                      >
                        📜 Trace
                      </button>

                      <button
                        onClick={() => setPreviewCase(r)}
                        className="text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition flex items-center gap-1"
                        title="Preview WhatsApp and Email outreach message"
                      >
                        💬 Preview
                      </button>

                      {r.status === "recovered" ? (
                        <span className="text-xs text-emerald-400 font-medium">✓ Paid</span>
                      ) : r.status === "waiting_human_review" ? (
                        <Link
                          href="/human-review"
                          className="text-xs bg-amber-600 hover:bg-amber-500 text-black font-semibold px-2.5 py-1 rounded transition"
                        >
                          Review ↗
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
