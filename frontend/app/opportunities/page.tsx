"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { rupees, API, KEY } from "@/lib/api";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgetRupees, setBudgetRupees] = useState<number>(2500);
  const [optimizing, setOptimizing] = useState(false);
  const [budgetResult, setBudgetResult] = useState<any>(null);

  async function fetchOpportunities() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/opportunities`, {
        headers: { "X-API-Key": KEY },
      });
      if (!res.ok) throw new Error("Failed to load opportunities");
      const data = await res.json();
      setOpportunities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOpportunities();
  }, []);

  async function handleOptimizeBudget() {
    try {
      setOptimizing(true);
      const res = await fetch(`${API}/api/opportunities/optimize-budget`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": KEY,
        },
        body: JSON.stringify({ budget_paise: budgetRupees * 100 }),
      });
      if (!res.ok) throw new Error("Budget optimization failed");
      const result = await res.json();
      setBudgetResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setOptimizing(false);
    }
  }

  const totalAtRisk = opportunities.reduce((acc, o) => acc + (o.amount_paise || 0), 0);
  const totalExpectedNet = opportunities.reduce(
    (acc, o) => acc + (o.expected_net_recovery_paise || 0),
    0
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Unified Recovery Opportunities</h1>
          <p className="muted mt-1 text-sm">
            Cross-channel prioritization (Failed Payments + Abandoned Checkouts + Subscriptions) ranked by expected net recovery.
          </p>
        </div>
        <button
          onClick={fetchOpportunities}
          className="border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs px-3 py-2 rounded-lg transition"
        >
          ↻ Refresh Opportunities
        </button>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Total Opportunities</div>
          <div className="text-2xl font-bold mt-1 text-white">{opportunities.length}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Combined Revenue at Risk</div>
          <div className="text-2xl font-bold mt-1 text-amber-400">{rupees(totalAtRisk)}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Expected Net Recovery</div>
          <div className="text-2xl font-bold mt-1 text-emerald-400">{rupees(totalExpectedNet)}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Avg Recovery Probability</div>
          <div className="text-2xl font-bold mt-1 text-indigo-300">
            {opportunities.length
              ? `${(
                  (opportunities.reduce((acc, o) => acc + (o.recovery_probability || 0), 0) /
                    opportunities.length) *
                  100
                ).toFixed(0)}%`
              : "0%"}
          </div>
        </div>
      </div>

      {/* Recovery Budget Optimizer Widget */}
      <div className="card border border-indigo-900/50 bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950/30 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <h2 className="text-lg font-semibold text-white">Recovery Budget Optimizer</h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Apply knapsack bounded optimization to select the highest ROI recovery interventions without exceeding your intervention cost budget.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5">
              <span className="text-xs text-zinc-400">Budget: ₹</span>
              <input
                type="number"
                min="100"
                step="500"
                value={budgetRupees}
                onChange={(e) => setBudgetRupees(Number(e.target.value))}
                className="w-20 bg-transparent text-xs font-semibold text-white focus:outline-none"
              />
            </div>
            <div className="flex gap-1.5">
              {[1000, 2500, 5000, 10000].map((b) => (
                <button
                  key={b}
                  onClick={() => setBudgetRupees(b)}
                  className={`text-[11px] px-2.5 py-1 rounded border transition ${
                    budgetRupees === b
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  ₹{b / 1000}k
                </button>
              ))}
            </div>
            <button
              onClick={handleOptimizeBudget}
              disabled={optimizing}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-indigo-950"
            >
              {optimizing ? "Optimizing..." : "Optimize Allocation"}
            </button>
          </div>
        </div>

        {budgetResult && (
          <div className="mt-5 pt-5 border-t border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800">
              <div className="text-[11px] text-zinc-400">Selected Interventions</div>
              <div className="text-lg font-bold text-white mt-0.5">
                {budgetResult.selected?.length || 0} / {opportunities.length}
              </div>
            </div>
            <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800">
              <div className="text-[11px] text-zinc-400">Total Intervention Cost</div>
              <div className="text-lg font-bold text-indigo-300 mt-0.5">
                {rupees(budgetResult.total_cost_paise || 0)}
              </div>
            </div>
            <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800">
              <div className="text-[11px] text-zinc-400">Optimized Net Recovery</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                {rupees(budgetResult.total_expected_net_recovery_paise || 0)}
              </div>
            </div>
            <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800">
              <div className="text-[11px] text-zinc-400">Expected ROI</div>
              <div className="text-lg font-bold text-amber-300 mt-0.5">
                {budgetResult.total_cost_paise
                  ? `${((budgetResult.total_expected_net_recovery_paise / budgetResult.total_cost_paise) * 100).toFixed(0)}%`
                  : "—"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Opportunities table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="py-8 text-center text-zinc-400 text-sm">Loading opportunities...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Source Type</th>
                <th>Source ID</th>
                <th>Customer</th>
                <th>Revenue at Risk</th>
                <th>Recovery Prob.</th>
                <th>Intervention Cost</th>
                <th>Expected Net Recovery</th>
                <th>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((r, i) => {
                const isSelectedInBudget = budgetResult?.selected?.some(
                  (s: any) => s.source_id === r.source_id
                );

                return (
                  <tr
                    key={`${r.source_type}-${r.source_id}-${i}`}
                    className={isSelectedInBudget ? "bg-indigo-950/20" : ""}
                  >
                    <td>
                      <span
                        className={`badge uppercase text-[10px] font-semibold ${
                          r.source_type === "payment"
                            ? "bg-blue-950/60 text-blue-300 border-blue-800"
                            : r.source_type === "checkout"
                            ? "bg-amber-950/60 text-amber-300 border-amber-800"
                            : "bg-purple-950/60 text-purple-300 border-purple-800"
                        }`}
                      >
                        {r.source_type}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-zinc-300">{r.source_id}</td>
                    <td className="text-xs">
                      <Link href={`/customers/${r.customer_id}`} className="text-emerald-400 hover:underline">
                        {r.customer_id}
                      </Link>
                    </td>
                    <td className="font-medium text-xs">{rupees(r.amount_paise)}</td>
                    <td>
                      <span className="font-mono text-xs text-indigo-300 font-semibold">
                        {((r.recovery_probability || 0) * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="text-xs text-zinc-400">{rupees(r.intervention_cost_paise || 0)}</td>
                    <td className="font-semibold text-xs text-emerald-400">
                      {rupees(r.expected_net_recovery_paise)}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-amber-300/90">
                          {r.recommended_action}
                        </span>
                        {isSelectedInBudget && (
                          <span className="badge text-[9px] bg-indigo-900/80 text-indigo-200 border-indigo-700">
                            ★ In Budget
                          </span>
                        )}
                      </div>
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
