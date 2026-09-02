import Link from "next/link";
import { api, rupees } from "@/lib/api";
import MetricCard from "@/components/MetricCard";
import RecoveryTrendChart from "@/components/charts/RecoveryTrendChart";
import FailureReasonDonut from "@/components/charts/FailureReasonDonut";

export default async function DashboardPage() {
  let d: any = {};
  let leakage: any = { summary: {}, by_payment_method: [], timeline: [], reasons: [] };
  let opportunities: any[] = [];

  try {
    const results: any = await Promise.all([
      api("/api/dashboard"),
      api("/api/analytics/leakage").catch(() => ({ summary: {}, by_payment_method: [], timeline: [], reasons: [] })),
      api("/api/opportunities").catch(() => []),
    ]);
    d = results[0] || {};
    leakage = results[1] || leakage;
    opportunities = results[2] || [];
  } catch (err) {
    console.error(err);
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Revenue Recovery Intelligence</h1>
          <p className="muted mt-1 text-sm">
            Autonomous, bounded operating system for payment failures, abandoned checkouts, and failed subscriptions.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/payments"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shadow-md shadow-indigo-950 flex items-center gap-1.5"
          >
            ⚡ Review Payments
          </Link>
          <Link
            href="/simulation"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-3.5 py-2.5 rounded-lg transition"
          >
            🧪 Simulation
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="gridcards mb-8">
        <MetricCard
          title="Revenue at Risk"
          value={rupees(d.revenue_at_risk_paise || 0)}
        />
        <MetricCard
          title="Recovered Revenue"
          value={rupees(d.recovered_revenue_paise || 0)}
        />
        <MetricCard
          title="Recovery Rate"
          value={`${((d.recovery_rate || 0) * 100).toFixed(1)}%`}
        />
        <MetricCard
          title="Active Recoveries"
          value={`${d.active_recoveries || 0}`}
        />
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-semibold text-base text-white">Weekly Recovery Velocity</h2>
              <p className="text-xs text-zinc-500">Failed volume vs. AI-recovered revenue trajectory</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Failed
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Recovered
              </span>
            </div>
          </div>
          <RecoveryTrendChart data={leakage.timeline || []} />
        </div>

        <div className="card p-6">
          <div className="mb-2">
            <h2 className="font-semibold text-base text-white">Failure Root Causes</h2>
            <p className="text-xs text-zinc-500">Volume distribution by vector</p>
          </div>
          <FailureReasonDonut data={leakage.reasons || []} />
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/opportunities"
          className="card p-5 hover:border-zinc-600 transition group block bg-gradient-to-br from-zinc-950 to-zinc-900"
        >
          <div className="text-xl mb-2">🎯</div>
          <div className="text-sm font-semibold text-white group-hover:text-indigo-400 transition">
            Recovery Opportunities ({opportunities.length})
          </div>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Knapsack budget-optimized prioritization across payments, checkouts, and recurring subscriptions.
          </p>
        </Link>

        <Link
          href="/copilot"
          className="card p-5 hover:border-zinc-600 transition group block bg-gradient-to-br from-zinc-950 to-zinc-900"
        >
          <div className="text-xl mb-2">🤖</div>
          <div className="text-sm font-semibold text-white group-hover:text-indigo-400 transition">
            Merchant Copilot
          </div>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Query failure diagnostics and channel performance grounded strictly in verified analytics.
          </p>
        </Link>

        <Link
          href="/human-review"
          className="card p-5 hover:border-zinc-600 transition group block bg-gradient-to-br from-zinc-950 to-zinc-900"
        >
          <div className="text-xl mb-2">🛡️</div>
          <div className="text-sm font-semibold text-white group-hover:text-indigo-400 transition">
            Safety & Human Review
          </div>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Deterministic policies governing high-value thresholds and retry limits.
          </p>
        </Link>
      </div>

      {/* Core Loop Architecture Diagram */}
      <div className="card p-6 mb-8 border border-zinc-800 bg-zinc-950">
        <div className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-3">
          Autonomous Revenue Recovery Pipeline
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { step: "Detect", desc: "Telemetry & webhook events" },
            { step: "Predict", desc: "ML probability scoring" },
            { step: "Diagnose", desc: "Root-cause classification" },
            { step: "Decide", desc: "Bounded action selection" },
            { step: "Safely Act", desc: "Deterministic policy checks" },
            { step: "Monitor", desc: "Payment links & dunning" },
            { step: "Recover", desc: "Signed webhook verification" },
            { step: "Learn", desc: "Customer recovery memory" },
          ].map((item, idx) => (
            <div key={item.step} className="flex items-center gap-2">
              <div className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg">
                <div className="font-semibold text-white">{item.step}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</div>
              </div>
              {idx < 7 && <span className="text-zinc-600 font-bold">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Leakage by Payment Method Summary */}
      {leakage.by_payment_method && leakage.by_payment_method.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-base text-white">Revenue Leakage by Payment Method</h2>
            <Link href="/analytics" className="text-xs text-indigo-400 hover:underline">
              Full Analytics →
            </Link>
          </div>
          <div className="space-y-3">
            {leakage.by_payment_method.map((item: any) => (
              <div key={item.payment_method} className="flex items-center justify-between py-2 border-b border-zinc-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="badge uppercase text-[10px] bg-zinc-900 border-zinc-700 text-zinc-300">
                    {item.payment_method}
                  </span>
                  <span className="text-zinc-400">{item.failed_count} failed transactions</span>
                </div>
                <div className="font-semibold font-mono text-zinc-200">
                  {rupees(item.revenue_at_risk_paise)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
