"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { rupees } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY || "recoverai-demo-key";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "failed" | "captured">("all");
  const [loading, setLoading] = useState(true);
  const [recoveringId, setRecoveringId] = useState<string | null>(null);
  const [recoveryResults, setRecoveryResults] = useState<Record<string, any>>({});
  const [notification, setNotification] = useState<string | null>(null);

  async function loadPayments() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/payments`, {
        headers: { "X-API-Key": KEY },
      });
      if (!res.ok) throw new Error("Failed to fetch payments");
      const data = await res.json();
      setPayments(data);
    } catch (err: any) {
      setNotification(`Error loading payments: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  async function handleRunRecovery(paymentId: string) {
    try {
      setRecoveringId(paymentId);
      const res = await fetch(`${API}/api/recovery/${paymentId}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": KEY,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to initiate recovery");
      }

      const caseData = await res.json();
      setRecoveryResults((prev) => ({
        ...prev,
        [paymentId]: caseData,
      }));
      setNotification(`Recovery Case #${caseData.id} initiated (${caseData.selected_action}, status: ${caseData.status})`);
    } catch (err: any) {
      setNotification(`Recovery error: ${err.message}`);
    } finally {
      setRecoveringId(null);
    }
  }

  const failedPayments = payments.filter((p) => p.status === "failed");
  const totalFailedAmount = failedPayments.reduce((acc, p) => acc + (p.amount_paise || 0), 0);

  const displayedPayments = payments.filter((p) => {
    if (filter === "failed") return p.status === "failed";
    if (filter === "captured") return p.status === "captured";
    return true;
  });

  async function handleBatchRecovery() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/recovery/batch-run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": KEY,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setNotification(`⚡ Batch Recovery Initiated! Processed ${data.total_processed} payment failures across safety policies.`);
      loadPayments();
    } catch (err: any) {
      setNotification(`Batch recovery error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Payments & Revenue Leakage</h1>
          <p className="muted mt-1 text-sm">
            Monitor real-time merchant transactions and trigger ML-powered bounded recovery.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBatchRecovery}
            disabled={loading || failedPayments.length === 0}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-emerald-950 flex items-center gap-1.5"
          >
            ⚡ Recover All Failures ({failedPayments.length})
          </button>
          <button
            onClick={loadPayments}
            className="border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs px-3 py-2 rounded-lg transition"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {notification && (
        <div className="mb-6 p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-xs flex justify-between items-center">
          <span className="text-zinc-200">{notification}</span>
          <button onClick={() => setNotification(null)} className="text-zinc-500 hover:text-zinc-300 ml-4">✕</button>
        </div>
      )}

      {/* Top summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Total Transactions</div>
          <div className="text-2xl font-bold mt-1 text-white">{payments.length}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Failed Transactions</div>
          <div className="text-2xl font-bold mt-1 text-red-400">{failedPayments.length}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Failure Revenue at Risk</div>
          <div className="text-2xl font-bold mt-1 text-amber-400">{rupees(totalFailedAmount)}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Failure Rate</div>
          <div className="text-2xl font-bold mt-1 text-zinc-200">
            {payments.length ? `${((failedPayments.length / payments.length) * 100).toFixed(1)}%` : "0%"}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(["all", "failed", "captured"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition ${
              filter === f
                ? "bg-zinc-800 text-white border-zinc-600"
                : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            {f} ({f === "all" ? payments.length : f === "failed" ? failedPayments.length : payments.length - failedPayments.length})
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="py-8 text-center text-zinc-400 text-sm">Loading transactions...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Failure Reason</th>
                <th>Recovery Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedPayments.map((r) => {
                const recovery = recoveryResults[r.payment_id];
                return (
                  <tr key={r.id}>
                    <td className="font-mono text-xs text-zinc-300">{r.payment_id}</td>
                    <td className="text-xs">
                      <Link href={`/customers/${r.customer_id}`} className="text-emerald-400 hover:underline">
                        {r.customer_id}
                      </Link>
                    </td>
                    <td className="font-medium text-xs">{rupees(r.amount_paise)}</td>
                    <td>
                      <span className="badge uppercase text-[10px] tracking-wider text-zinc-300 bg-zinc-900 border-zinc-700">
                        {r.payment_method}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge text-[11px] font-medium ${
                          r.status === "captured"
                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                            : "bg-red-950/60 text-red-300 border-red-800/60"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="text-xs text-zinc-400">
                      {r.failure_reason ? (
                        <span className="font-mono text-[11px] text-amber-300/80">
                          {r.failure_reason}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {r.status === "failed" ? (
                        recovery ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-emerald-400 font-medium">
                              Case #{recovery.id} ({recovery.selected_action})
                            </span>
                            {recovery.external_url && (
                              <a
                                href={recovery.external_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] bg-emerald-700 hover:bg-emerald-600 text-white px-2 py-0.5 rounded transition"
                              >
                                Pay Link ↗
                              </a>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRunRecovery(r.payment_id)}
                            disabled={recoveringId === r.payment_id}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium px-3 py-1 rounded transition flex items-center gap-1 shadow-sm"
                          >
                            {recoveringId === r.payment_id ? "Running..." : "⚡ Run Recovery"}
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-zinc-500">✓ Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
