"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { rupees } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY || "recoverai-demo-key";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  async function loadSubscriptions() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/subscriptions`, {
        headers: { "X-API-Key": KEY },
      });
      if (!res.ok) throw new Error("Failed to fetch subscriptions");
      const data = await res.json();
      setSubscriptions(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function handleRetrySubscription(sub: any) {
    try {
      setRetryingId(sub.subscription_id);
      const res = await fetch(`${API}/api/subscriptions/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": KEY,
        },
        body: JSON.stringify({
          subscription_id: sub.subscription_id,
          customer_id: sub.customer_id,
          amount_paise: sub.amount_paise,
          status: "active",
          payment_method: sub.payment_method,
          failed_attempts: 0,
          billing_cycle: sub.billing_cycle,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setNotification(`Subscription #${sub.subscription_id} recovered and returned to ACTIVE status!`);
      loadSubscriptions();
    } catch (err: any) {
      setNotification(`Retry error: ${err.message}`);
    } finally {
      setRetryingId(null);
    }
  }

  const failedSubs = subscriptions.filter((s) => s.status !== "active");
  const failedMRR = failedSubs.reduce((acc, s) => acc + (s.amount_paise || 0), 0);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Subscription Dunning & Recovery</h1>
          <p className="muted mt-1 text-sm">
            AI-orchestrated smart retry timing and automated pre-dunning payment updates.
          </p>
        </div>
        <button
          onClick={loadSubscriptions}
          className="border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs px-3 py-2 rounded-lg transition"
        >
          ↻ Refresh Subscriptions
        </button>
      </div>

      {notification && (
        <div className="mb-6 p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-xs flex justify-between items-center">
          <span className="text-zinc-200">{notification}</span>
          <button onClick={() => setNotification(null)} className="text-zinc-500 hover:text-zinc-300 ml-4">✕</button>
        </div>
      )}

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Total Subscriptions</div>
          <div className="text-2xl font-bold mt-1 text-white">{subscriptions.length}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Failed / Past Due</div>
          <div className="text-2xl font-bold mt-1 text-red-400">{failedSubs.length}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">At-Risk MRR</div>
          <div className="text-2xl font-bold mt-1 text-amber-400">{rupees(failedMRR)}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Healthy Active Rate</div>
          <div className="text-2xl font-bold mt-1 text-emerald-400">
            {subscriptions.length
              ? `${(((subscriptions.length - failedSubs.length) / subscriptions.length) * 100).toFixed(0)}%`
              : "0%"}
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="py-8 text-center text-zinc-400 text-sm">Loading subscriptions...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Subscription ID</th>
                <th>Customer</th>
                <th>Recurring Amount</th>
                <th>Cycle</th>
                <th>Method</th>
                <th>Failed Attempts</th>
                <th>Status</th>
                <th>Dunning Action</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono text-xs font-semibold text-zinc-200">{r.subscription_id}</td>
                  <td className="text-xs">
                    <Link href={`/customers/${r.customer_id}`} className="text-emerald-400 hover:underline">
                      {r.customer_id}
                    </Link>
                  </td>
                  <td className="font-medium text-xs">{rupees(r.amount_paise)}</td>
                  <td className="text-xs capitalize text-zinc-400">{r.billing_cycle || "monthly"}</td>
                  <td>
                    <span className="badge uppercase text-[10px] bg-zinc-900 border-zinc-700 text-zinc-300">
                      {r.payment_method || "card"}
                    </span>
                  </td>
                  <td className="text-xs font-mono text-amber-300/80">{r.failed_attempts}</td>
                  <td>
                    <span
                      className={`badge text-[11px] capitalize font-medium ${
                        r.status === "active"
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                          : "bg-red-950/60 text-red-300 border-red-800/60"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status !== "active" ? (
                      <button
                        onClick={() => handleRetrySubscription(r)}
                        disabled={retryingId === r.subscription_id}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium px-3 py-1 rounded transition flex items-center gap-1 shadow-sm"
                      >
                        {retryingId === r.subscription_id ? "Retrying..." : "🔄 Smart Retry Dunning"}
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-medium">✓ Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
